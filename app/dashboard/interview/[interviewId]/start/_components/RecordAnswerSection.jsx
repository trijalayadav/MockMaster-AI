"use client"
import dynamic from 'next/dynamic';
import { Webcam as WebcamIcon, Mic, Video, VideoOff } from 'lucide-react'
import React, { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { generateFeedback } from '@/utils/semanticFeedbackModel';
import { db } from '@/utils/db';
import { userAnswers } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import moment from 'moment';
import { eq, and } from 'drizzle-orm';
import Groq from 'groq-sdk';

// Dynamically import to avoid SSR issues
const Webcam = dynamic(() => import('react-webcam'), { ssr: false });

// Groq client for Whisper transcription
const groq = new Groq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
});

function RecordAnswerSection({ mockInterviewQuestions, activeQuestionIndex, interviewData }) {
    const [isWebcamEnabled, setIsWebcamEnabled] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const webcamRef = useRef(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [error, setError] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const isRecordingRef = useRef(false);
    const { user } = useUser();

    // Reset answer when question changes
    useEffect(() => {
        setUserAnswer('');
        setError('');

        if (isRecordingRef.current && mediaRecorderRef.current) {
            try {
                isRecordingRef.current = false;
                mediaRecorderRef.current.stop();
            } catch (err) {
                console.error('Error stopping recording:', err);
            }
            setIsRecording(false);
        }
    }, [activeQuestionIndex]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Auto-save when recording stops and answer is ready
    useEffect(() => {
        if (!isRecording && !isTranscribing && userAnswer.length > 10) {
            UpdateUserAnswer();
        }
    }, [isRecording, isTranscribing, userAnswer]);

    const startSpeechToText = async () => {
        setError('');
        setUserAnswer('');
        audioChunksRef.current = [];

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                // Stop all mic tracks
                stream.getTracks().forEach(track => track.stop());

                setIsTranscribing(true);
                toast.info('Transcribing your answer with Whisper AI...');

                try {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const audioFile = new File([audioBlob], 'answer.webm', { type: 'audio/webm' });

                    const transcription = await groq.audio.transcriptions.create({
                        file: audioFile,
                        model: 'whisper-large-v3',
                        language: 'en',
                    });

                    const transcribedText = transcription.text?.trim();
                    if (transcribedText) {
                        setUserAnswer(transcribedText);
                        toast.success('Transcription complete!');
                    } else {
                        setError('No speech detected. Please try again.');
                    }
                } catch (err) {
                    console.error('Transcription error:', err);
                    setError('Transcription failed: ' + err.message);
                    toast.error('Transcription failed. Please try again.');
                } finally {
                    setIsTranscribing(false);
                }
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            isRecordingRef.current = true;
            toast.info('Recording started. Speak your answer...');

        } catch (err) {
            if (err.name === 'NotAllowedError') {
                setError('Microphone access denied. Please enable microphone permissions.');
            } else {
                setError('Failed to start recording: ' + err.message);
            }
        }
    };

    const stopSpeechToText = () => {
        if (mediaRecorderRef.current && isRecordingRef.current) {
            try {
                isRecordingRef.current = false;
                mediaRecorderRef.current.stop();
                setIsRecording(false);
            } catch (err) {
                console.error('Error stopping recording:', err);
            }
        }
    };

    const UpdateUserAnswer = async () => {
        await new Promise(resolve => setTimeout(resolve, 500));

        const finalAnswer = userAnswer.trim();

        if (finalAnswer.length < 10) {
            toast.error('Please provide a more detailed response. Your answer is too short.');
            return;
        }

        if (!mockInterviewQuestions || !mockInterviewQuestions[activeQuestionIndex]) {
            toast.error('No question found. Please try again.');
            return;
        }

        const currentQuestion = mockInterviewQuestions[activeQuestionIndex]?.question;
        const correctAnswer = mockInterviewQuestions[activeQuestionIndex]?.answer;

        if (!currentQuestion) {
            toast.error('Invalid question data. Please try again.');
            return;
        }

        if (!user?.primaryEmailAddress?.emailAddress) {
            toast.error('User not authenticated. Please log in.');
            return;
        }

        if (!interviewData?.mockId) {
            toast.error('Interview data not found. Please try again.');
            return;
        }

        setLoading(true);

        try {
            toast.info('Analysing your answer with AI...');

            const { rating, feedback, normalizedAnswer, breakdown } = await generateFeedback(
                currentQuestion,
                finalAnswer,
                correctAnswer || ''
            );

            const answerToSave = normalizedAnswer || finalAnswer;

            console.log('==========================================');
            console.log('📊 INTERVIEW FEEDBACK (Semantic AI)');
            console.log('==========================================');
            console.log('Question:', currentQuestion);
            console.log('User Answer:', finalAnswer);
            console.log('Rating:', rating);
            console.log('Feedback:', feedback);
            console.log('Breakdown:', breakdown);
            console.log('==========================================');

            try {
                const existingAnswer = await db
                    .select()
                    .from(userAnswers)
                    .where(
                        and(
                            eq(userAnswers.mockIdRef, interviewData.mockId),
                            eq(userAnswers.question, currentQuestion)
                        )
                    );

                if (existingAnswer.length > 0) {
                    await db
                        .update(userAnswers)
                        .set({
                            userAns: answerToSave,
                            feedback: feedback,
                            rating: rating,
                            correctAns: correctAnswer || '',
                            createdAt: moment().format('DD-MM-YYYY')
                        })
                        .where(
                            and(
                                eq(userAnswers.mockIdRef, interviewData.mockId),
                                eq(userAnswers.question, currentQuestion)
                            )
                        );
                    toast.success('Answer updated successfully!');
                } else {
                    await db.insert(userAnswers).values({
                        mockIdRef: interviewData.mockId,
                        question: currentQuestion,
                        correctAns: correctAnswer || '',
                        userAns: answerToSave,
                        feedback: feedback,
                        rating: rating,
                        userEmail: user.primaryEmailAddress.emailAddress,
                        createdAt: moment().format('DD-MM-YYYY')
                    });
                    toast.success('Answer saved successfully!');
                }
            } catch (dbError) {
                console.error('Database error:', dbError);
                toast.error('Failed to save answer to database. Please try again.');
            }

        } catch (err) {
            console.error('Error generating feedback:', err);
            toast.error('Failed to analyse answer. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRecording = () => {
        if (isRecording) {
            stopSpeechToText();
        } else {
            startSpeechToText();
        }
    };

    if (!isMounted) return null;

    if (!mockInterviewQuestions || mockInterviewQuestions.length === 0) {
        return (
            <div className='flex items-center justify-center flex-col p-8'>
                <div className='text-center'>
                    <p className='text-red-600 font-semibold'>No interview questions available</p>
                    <p className='text-gray-500 text-sm mt-2'>Please ensure questions are loaded properly</p>
                </div>
            </div>
        );
    }

    if (activeQuestionIndex < 0 || activeQuestionIndex >= mockInterviewQuestions.length) {
        return (
            <div className='flex items-center justify-center flex-col p-8'>
                <div className='text-center'>
                    <p className='text-red-600 font-semibold'>Invalid question index</p>
                    <p className='text-gray-500 text-sm mt-2'>
                        Index: {activeQuestionIndex}, Total: {mockInterviewQuestions.length}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className='flex items-center justify-center flex-col'>
            <div className='flex flex-col justify-center items-center p-5 border rounded-lg w-full'>

                {/* Webcam Display */}
                <div className='relative flex justify-center items-center bg-black rounded-lg w-full h-72 overflow-hidden'>
                    {isWebcamEnabled ? (
                        <>
                            <Webcam
                                ref={webcamRef}
                                mirrored={true}
                                audio={false}  // ✅ Fixed: was true, caused echo
                                className='rounded-lg'
                                style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                            />
                            {isRecording && (
                                <div className='absolute top-3 right-3 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold'>
                                    <span className='w-2 h-2 bg-white rounded-full animate-pulse'></span>
                                    Recording
                                </div>
                            )}
                            {isTranscribing && (
                                <div className='absolute top-3 left-3 flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold'>
                                    <span className='w-2 h-2 bg-white rounded-full animate-pulse'></span>
                                    Transcribing...
                                </div>
                            )}
                        </>
                    ) : (
                        <div className='text-center'>
                            <WebcamIcon className='w-20 h-20 text-gray-600 mx-auto mb-3' />
                            <p className='text-gray-500 text-sm'>Camera is disabled</p>
                        </div>
                    )}
                </div>

                {/* Live Transcript */}
                {userAnswer && (
                    <div className='mt-4 w-full p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-40 overflow-y-auto'>
                        <h3 className='text-sm font-semibold text-gray-700 mb-2'>Your Answer:</h3>
                        <p className='text-sm text-gray-800'>{userAnswer}</p>
                    </div>
                )}

                {isTranscribing && (
                    <div className='mt-4 w-full p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                        <p className='text-blue-600 text-sm text-center animate-pulse'>
                            🎙️ Transcribing your answer with Whisper AI...
                        </p>
                    </div>
                )}

                <div className='mt-4 w-full space-y-3'>
                    {/* Webcam Toggle */}
                    <button
                        onClick={() => setIsWebcamEnabled(!isWebcamEnabled)}
                        className={`w-full px-6 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                            isWebcamEnabled
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                        {isWebcamEnabled ? (
                            <><VideoOff className='w-4 h-4' /> Disable Webcam</>
                        ) : (
                            <><Video className='w-4 h-4' /> Enable Webcam</>
                        )}
                    </button>

                    {/* Record Button */}
                    <button
                        onClick={handleRecording}
                        disabled={!isWebcamEnabled || loading || isTranscribing}
                        className={`w-full px-6 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                            !isWebcamEnabled || loading || isTranscribing
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : isRecording
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-primary text-white hover:bg-primary/90'
                        }`}
                    >
                        <Mic className='w-4 h-4' />
                        {loading
                            ? 'Analysing with AI...'
                            : isTranscribing
                                ? 'Transcribing...'
                                : isRecording
                                    ? 'Stop Recording'
                                    : 'Record Answer'}
                    </button>
                </div>

                {/* Error Display */}
                {error && (
                    <div className='mt-3 p-3 bg-red-50 border border-red-200 rounded-lg w-full'>
                        <p className='text-red-600 text-sm'>{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RecordAnswerSection;