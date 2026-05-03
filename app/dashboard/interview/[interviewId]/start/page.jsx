"use client"
import React, { useState, useEffect, useCallback, use } from 'react'
import { getInterviewById } from '@/app/actions/interview'
import QuestionsSection from './_components/QuestionsSection'
import RecordAnswerSection from './_components/RecordAnswerSection'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

function StartInterview({ params }) {
    const router = useRouter();
    const unwrappedParams = use(params);
    const interviewId = unwrappedParams?.interviewId;
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [interviewData, setInterviewData] = useState(null);
    const [mockInterviewQuestions, setMockInterviewQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Lifted state: has the user triggered full analysis?
    const [analysisReady, setAnalysisReady] = useState(false);

    const GetInterviewDetails = useCallback(async () => {
        if (!interviewId) {
            setError("No interview ID provided");
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const result = await getInterviewById(interviewId);
            if (result) {
                setInterviewData(result);
                if (result.jsonMockResp) {
                    try {
                        const jsonMockResponse = typeof result.jsonMockResp === 'string'
                            ? JSON.parse(result.jsonMockResp)
                            : result.jsonMockResp;
                        setMockInterviewQuestions(jsonMockResponse.questions || []);
                    } catch (parseError) {
                        console.error("Error parsing interview questions:", parseError);
                        setError("Invalid interview questions format");
                    }
                } else {
                    setMockInterviewQuestions([]);
                }
            } else {
                setError("Interview not found");
            }
        } catch (error) {
            console.error("Error fetching interview details:", error);
            setError("Failed to load interview details. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [interviewId]);

    useEffect(() => {
        if (interviewId) {
            GetInterviewDetails();
        }
    }, [interviewId, GetInterviewDetails]);

    const handlePreviousQuestion = () => {
        if (activeQuestionIndex > 0) setActiveQuestionIndex(activeQuestionIndex - 1);
    };

    const handleNextQuestion = () => {
        if (activeQuestionIndex < mockInterviewQuestions.length - 1) setActiveQuestionIndex(activeQuestionIndex + 1);
    };

    const handleEndInterview = () => {
        router.push(`/dashboard/interview/${interviewId}/feedback`);
    };

    // Called by RecordAnswerSection once analysis is complete
    const handleAllAnswered = (analysisResult) => {
        setAnalysisReady(true);
        // analysisResult is available here if you want to pass it elsewhere
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading interview details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                    <h2 className="text-red-800 font-semibold text-lg mb-2">Error</h2>
                    <p className="text-red-600">{error}</p>
                    <button onClick={GetInterviewDetails} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {interviewData && (
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">{interviewData.jobPosition || 'Interview Session'}</h1>
                    <p className="text-gray-600">{interviewData.jobDesc || 'Mock Interview Practice'}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <QuestionsSection
                    mockInterviewQuestions={mockInterviewQuestions}
                    activeQuestionIndex={activeQuestionIndex}
                    onQuestionClick={setActiveQuestionIndex}
                />
                <RecordAnswerSection
                    mockInterviewQuestions={mockInterviewQuestions}
                    activeQuestionIndex={activeQuestionIndex}
                    interviewData={interviewData}
                    onAllAnswered={handleAllAnswered}
                />
            </div>

            <div className='flex justify-end gap-4 mt-6'>
                {activeQuestionIndex > 0 && (
                    <Button onClick={handlePreviousQuestion} variant="outline">
                        Previous Question
                    </Button>
                )}
                {activeQuestionIndex < mockInterviewQuestions?.length - 1 && (
                    <Button onClick={handleNextQuestion}>
                        Next Question
                    </Button>
                )}
                {/* Show End Interview only after analysis has been triggered */}
                {analysisReady && (
                    <Button onClick={handleEndInterview} className="bg-green-600 hover:bg-green-700">
                        End Interview
                    </Button>
                )}
            </div>
        </div>
    );
}

export default StartInterview;