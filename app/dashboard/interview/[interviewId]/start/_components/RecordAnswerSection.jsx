"use client"
import dynamic from 'next/dynamic';
import { Webcam as WebcamIcon, Mic, Video, VideoOff } from 'lucide-react'
import React, { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { chatSession } from '@/utils/GeminiAIModel';
import { db } from '@/utils/db';
import { userAnswers } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import moment from 'moment';

// Dynamically import to avoid SSR issues
const Webcam = dynamic(() => import('react-webcam'), { ssr: false });

function RecordAnswerSection({ mockInterviewQuestions, activeQuestionIndex, interviewData }) {
    const [isWebcamEnabled, setIsWebcamEnabled] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const webcamRef = useRef(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [error, setError] = useState('');
    const [interimResult, setInterimResult] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [loading, setLoading] = useState(false);
    const recognitionRef = useRef(null);
    const isRecordingRef = useRef(false);
    const { user } = useUser();

    // Reset answer when question changes
    useEffect(() => {
        setUserAnswer('');
        setInterimResult('');
        setError('');

        // Stop recording if switching questions
        if (isRecordingRef.current && recognitionRef.current) {
            try {
                isRecordingRef.current = false;
                recognitionRef.current.stop();
            } catch (err) {
                console.error('Error stopping recognition:', err);
            }
            setIsRecording(false);
        }
    }, [activeQuestionIndex]);

    // Initialize speech recognition once on mount
    useEffect(() => {
        setIsMounted(true);

        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;
                recognitionRef.current.lang = 'en-US';

                recognitionRef.current.onresult = (event) => {
                    let interim = '';
                    let finalTranscripts = [];

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            finalTranscripts.push(transcript);
                        } else {
                            interim = transcript;
                        }
                    }

                    setInterimResult(interim);

                    if (finalTranscripts.length > 0) {
                        const newText = finalTranscripts.join(' ') + ' ';
                        setUserAnswer(prev => prev + newText);
                    }
                };

                recognitionRef.current.onerror = (event) => {
                    console.error('Speech recognition error:', event.error);

                    if (event.error === 'aborted') {
                        return;
                    }

                    let errorMessage = '';
                    switch (event.error) {
                        case 'no-speech':
                            errorMessage = 'No speech detected. Please try again.';
                            break;
                        case 'not-allowed':
                            errorMessage = 'Microphone access denied. Please enable microphone permissions.';
                            break;
                        case 'network':
                            errorMessage = 'Network error. Please check your internet connection.';
                            break;
                        case 'audio-capture':
                            errorMessage = 'No microphone found. Please connect a microphone.';
                            break;
                        default:
                            errorMessage = `Speech recognition error: ${event.error}`;
                    }

                    setError(errorMessage);
                    setIsRecording(false);
                    isRecordingRef.current = false;
                };

                recognitionRef.current.onend = () => {
                    if (isRecordingRef.current) {
                        try {
                            recognitionRef.current.start();
                        } catch (err) {
                            console.error('Failed to restart recognition:', err);
                            setIsRecording(false);
                            isRecordingRef.current = false;
                        }
                    }
                };
            } else {
                setError('Speech recognition not supported in this browser. Please use Chrome or Edge.');
            }
        }

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (err) {
                    console.error('Error stopping recognition:', err);
                }
            }
        };
    }, []);

    // Auto-save when recording stops
    useEffect(() => {
        if (!isRecording && userAnswer.length > 10) {
            UpdateUserAnswer();
        }
    }, [isRecording]);

    const startSpeechToText = () => {
        if (!recognitionRef.current) {
            setError('Speech recognition not initialized');
            return;
        }

        setError('');
        setInterimResult('');
        setUserAnswer(''); // Clear the answer when starting a new recording

        try {
            recognitionRef.current.start();
            setIsRecording(true);
            isRecordingRef.current = true;
            toast.info('Recording started. Speak your answer...');
        } catch (err) {
            if (err.name === 'InvalidStateError') {
                console.log('Recognition already running');
            } else {
                setError('Failed to start recording: ' + err.message);
                setIsRecording(false);
                isRecordingRef.current = false;
            }
        }
    };

    const stopSpeechToText = () => {
        if (recognitionRef.current) {
            try {
                isRecordingRef.current = false;
                recognitionRef.current.stop();
                setIsRecording(false);
                setInterimResult('');
            } catch (err) {
                console.error('Error stopping recognition:', err);
            }
        }
    };

    const UpdateUserAnswer = async () => {
        // Wait for any final transcripts
        await new Promise(resolve => setTimeout(resolve, 500));

        const finalAnswer = userAnswer.trim();

        if (finalAnswer.length < 10) {
            toast.error('Please provide a more detailed response. Your answer is too short.');
            return;
        }

        // Validate question exists
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

        // Validate chatSession
        if (!chatSession || typeof chatSession.sendMessage !== 'function') {
            console.error('Chat session not initialized');
            toast.error('AI service not available. Please check your NEXT_PUBLIC_GEMINI_API_KEY.');
            return;
        }

        // Validate user and interviewData
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
            const feedbackPrompt = `Question: ${currentQuestion}
User Answer: ${finalAnswer}

Please analyze this interview answer and provide a rating and detailed feedback. Return your response ONLY as a valid JSON object in this exact format (no markdown, no code blocks, no extra text):

{
  "rating": "8/10",
  "feedback": "Your answer demonstrates good understanding. You mentioned key points about... However, you could improve by adding more specific examples and discussing...",
  "strengths": ["Clear communication", "Good technical knowledge", "Structured response"],
  "improvements": ["Add more specific examples", "Discuss scalability considerations", "Mention best practices"]
}

Make sure the feedback is constructive, specific, and 3-5 sentences long.`;

            console.log('Sending feedback request to AI...');
            const result = await chatSession.sendMessage(feedbackPrompt);

            if (!result || !result.response) {
                throw new Error('Invalid response from AI service');
            }

            const mockJsonResp = result.response.text();
            console.log('Raw AI Response:', mockJsonResp);

            let parsedFeedback = null;
            let feedbackText = '';
            let rating = '';

            try {
                let cleanedResponse = mockJsonResp
                    .replace(/```json/gi, "")
                    .replace(/```/g, "")
                    .replace(/[\u201C\u201D]/g, '"')
                    .trim();

                const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    cleanedResponse = jsonMatch[0];
                }

                parsedFeedback = JSON.parse(cleanedResponse);
                feedbackText = parsedFeedback.feedback || 'Good effort!';
                rating = parsedFeedback.rating || 'N/A';

                // Log feedback to console only (not displaying on UI)
                console.log('==========================================');
                console.log('📊 INTERVIEW FEEDBACK');
                console.log('==========================================');
                console.log('Question:', currentQuestion);
                console.log('------------------------------------------');
                console.log('User Answer:', finalAnswer);
                console.log('------------------------------------------');
                console.log('Rating:', rating);
                console.log('------------------------------------------');
                console.log('Feedback:', feedbackText);
                console.log('------------------------------------------');
                if (parsedFeedback.strengths) {
                    console.log('Strengths:');
                    parsedFeedback.strengths.forEach((strength, index) => {
                        console.log(`  ${index + 1}. ${strength}`);
                    });
                    console.log('------------------------------------------');
                }
                if (parsedFeedback.improvements) {
                    console.log('Areas for Improvement:');
                    parsedFeedback.improvements.forEach((improvement, index) => {
                        console.log(`  ${index + 1}. ${improvement}`);
                    });
                    console.log('------------------------------------------');
                }
                console.log('==========================================');
            } catch (parseError) {
                console.error('Failed to parse JSON:', parseError);
                console.log('Raw response that failed to parse:', mockJsonResp);
                feedbackText = mockJsonResp || 'Unable to parse feedback';
                rating = 'N/A';
            }

            // Save to database
            try {
                console.log('Saving to database...');
                const dbResponse = await db.insert(userAnswers).values({
                    mockIdRef: interviewData.mockId,
                    question: currentQuestion,
                    correctAns: correctAnswer || '',
                    userAns: finalAnswer,
                    feedback: feedbackText,
                    rating: rating,
                    userEmail: user.primaryEmailAddress.emailAddress,
                    createdAt: moment().format('DD-MM-YYYY')
                });

                console.log('Database save response:', dbResponse);
                toast.success('Answer saved successfully!');
            } catch (dbError) {
                console.error('Database error:', dbError);
                toast.error('Failed to save answer to database. Please try again.');
            }

        } catch (error) {
            console.error('Error getting feedback:', error);

            if (error.message.includes('API key') || error.message.includes('not found')) {
                toast.error('API key error. Please check your NEXT_PUBLIC_GEMINI_API_KEY in .env.local');
            } else if (error.message.includes('quota') || error.message.includes('limit')) {
                toast.error('API quota exceeded. Please try again later.');
            } else if (error.message.includes('404')) {
                toast.error('Model not found. Make sure you updated to gemini-2.5-flash in GeminiAIModel.js');
            } else {
                toast.error('Failed to get feedback. Please try again.');
            }
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

    if (!isMounted) {
        return null;
    }

    // Validate props
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
                    <p className='text-gray-500 text-sm mt-2'>Index: {activeQuestionIndex}, Total: {mockInterviewQuestions.length}</p>
                </div>
            </div>
        );
    }

    return (
        <div className='flex items-center justify-center flex-col'>
            <div className='flex flex-col justify-center items-center p-5 border rounded-lg w-full'>
                {/* AI Service Warning */}
                {(!chatSession || typeof chatSession.sendMessage !== 'function') && (
                    <div className='mb-4 w-full p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
                        <p className='text-yellow-800 text-sm font-semibold'>⚠️ AI Feedback Unavailable</p>
                        <p className='text-yellow-700 text-xs mt-1'>
                            Gemini AI is not configured. Please check your NEXT_PUBLIC_GEMINI_API_KEY in .env.local file.
                        </p>
                    </div>
                )}

                {/* Webcam Display */}
                <div className='relative flex justify-center items-center bg-black rounded-lg w-full h-72 overflow-hidden'>
                    {isWebcamEnabled ? (
                        <>
                            <Webcam
                                ref={webcamRef}
                                mirrored={true}
                                audio={true}
                                className='rounded-lg'
                                style={{
                                    height: '100%',
                                    width: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                            {isRecording && (
                                <div className='absolute top-3 right-3 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold'>
                                    <span className='w-2 h-2 bg-white rounded-full animate-pulse'></span>
                                    Recording
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

                {/* Live Transcript Display */}
                {(userAnswer || interimResult) && (
                    <div className='mt-4 w-full p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-40 overflow-y-auto'>
                        <h3 className='text-sm font-semibold text-gray-700 mb-2'>Your Answer:</h3>
                        <p className='text-sm text-gray-800'>
                            {userAnswer}
                            {interimResult && (
                                <span className='text-gray-500 italic'>{interimResult}</span>
                            )}
                        </p>
                    </div>
                )}

                <div className='mt-4 w-full space-y-3'>
                    {/* Enable Webcam Button */}
                    <button
                        onClick={() => setIsWebcamEnabled(!isWebcamEnabled)}
                        className={`w-full px-6 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 ${isWebcamEnabled
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        {isWebcamEnabled ? (
                            <>
                                <VideoOff className='w-4 h-4' />
                                Disable Webcam
                            </>
                        ) : (
                            <>
                                <Video className='w-4 h-4' />
                                Enable Webcam
                            </>
                        )}
                    </button>

                    {/* Record Button */}
                    <button
                        onClick={handleRecording}
                        disabled={!isWebcamEnabled || loading}
                        className={`w-full px-6 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${!isWebcamEnabled || loading
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : isRecording
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-primary text-white hover:bg-primary/90'
                            }`}
                    >
                        <Mic className='w-4 h-4' />
                        {loading ? 'Processing & Saving...' : isRecording ? 'Stop Recording' : 'Record Answer'}
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
    )
}

export default RecordAnswerSection