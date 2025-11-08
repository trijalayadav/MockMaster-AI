"use client"
import dynamic from 'next/dynamic';
import { Webcam as WebcamIcon, Mic, Video, VideoOff } from 'lucide-react'
import React, { useState, useRef, useEffect } from 'react'

// Dynamically import to avoid SSR issues
const Webcam = dynamic(() => import('react-webcam'), { ssr: false });

function RecordAnswerSection() {
    const [isWebcamEnabled, setIsWebcamEnabled] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const webcamRef = useRef(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [error, setError] = useState('');
    const [interimResult, setInterimResult] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [results, setResults] = useState([]);
    const recognitionRef = useRef(null);

    useEffect(() => {
        setIsMounted(true);

        // Initialize speech recognition only on client side
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;

                recognitionRef.current.onresult = (event) => {
                    let interim = '';
                    let final = '';

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            final += transcript;
                        } else {
                            interim += transcript;
                        }
                    }

                    if (final) {
                        setResults(prev => [...prev, { transcript: final, timestamp: Date.now() }]);
                    }
                    setInterimResult(interim);
                };

                recognitionRef.current.onerror = (event) => {
                    setError(`Speech recognition error: ${event.error}`);
                    setIsRecording(false);
                };

                recognitionRef.current.onend = () => {
                    setIsRecording(false);
                };
            } else {
                setError('Speech recognition not supported in this browser');
            }
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const startSpeechToText = () => {
        if (recognitionRef.current) {
            setError('');
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };

    const stopSpeechToText = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleRecording = () => {
        if (isRecording) {
            stopSpeechToText();
        } else {
            startSpeechToText();
        }
    };

    useEffect(() => {
        results.map((result) => {
            setUserAnswer(prevAnswer => prevAnswer + result.transcript);
        })
    }, [results]);

    useEffect(() => {
        if (userAnswer) {
            console.log('User Answer:', userAnswer);
        }
    }, [userAnswer]);

    if (!isMounted) {
        return null; // or a loading skeleton
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
                        disabled={!isWebcamEnabled}
                        className={`w-full px-6 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${!isWebcamEnabled
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : isRecording
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-primary text-white hover:bg-primary/90'
                            }`}
                    >
                        <Mic className='w-4 h-4' />
                        {isRecording ? 'Stop Recording' : 'Record Answer'}
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