"use client"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import React, { use, useEffect, useState } from 'react'
import { ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { getFeedbackByInterview } from '@/app/actions/interview';

function Feedback({ params }) {
    const router = useRouter();
    const unwrappedParams = use(params);
    const interviewId = unwrappedParams?.interviewId;

    const [feedbackList, setFeedbackList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        GetFeedback();
    }, [interviewId]);

    const GetFeedback = async () => {
        if (!interviewId) {
            setError("No interview ID provided");
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const result = await getFeedbackByInterview(interviewId);
            if (result.error) {
                setError(result.error);
            } else {
                setFeedbackList(result.feedbackList);
            }
        } catch (err) {
            console.error('Error fetching feedback:', err);
            setError('Failed to load feedback. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const calculateOverallRating = () => {
        const answeredQuestions = feedbackList.filter(item => item.isAnswered);
        if (answeredQuestions.length === 0) return 'N/A';
        const totalRating = answeredQuestions.reduce((sum, item) => {
            const rating = parseFloat(item.rating?.split('/')[0] || 0);
            return sum + rating;
        }, 0);
        return `${(totalRating / answeredQuestions.length).toFixed(1)}/10`;
    };

    const getAnsweredCount = () => feedbackList.filter(item => item.isAnswered).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading feedback...</p>
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
                    <Button onClick={GetFeedback} className="mt-4" variant="destructive">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    if (feedbackList.length === 0) {
        return (
            <div className="p-10">
                <div className="text-center py-10">
                    <h2 className="text-2xl font-bold text-gray-600 mb-4">No Questions Available</h2>
                    <p className="text-gray-500 mb-6">This interview doesn't have any questions.</p>
                    <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
                </div>
            </div>
        );
    }

    return (
        <div className='p-10'>
            <h2 className='text-3xl font-bold text-green-500'>Congratulations!</h2>
            <h2 className='font-bold text-2xl mt-2'>Here is your interview feedback</h2>
            <div className='my-3'>
                <h2 className='text-primary text-lg'>
                    Your overall interview rating: <strong>{calculateOverallRating()}</strong>
                </h2>
                <p className='text-gray-600 text-sm mt-1'>
                    Answered: <strong>{getAnsweredCount()}</strong> out of <strong>{feedbackList.length}</strong> questions
                </p>
            </div>
            <h2 className='text-sm text-gray-500 mb-5'>
                Find below interview questions with correct answers, your answers and feedback for improvement
            </h2>
            {feedbackList.map((item, index) => (
                <Collapsible key={item.id} className='mt-5'>
                    <CollapsibleTrigger className='p-2 bg-secondary rounded-lg my-2 text-left gap-7 w-full flex justify-between items-center hover:bg-gray-100 transition-colors'>
                        <span className='font-medium flex items-center gap-2 flex-wrap'>
                            <span className='text-primary mr-2'>Question {index + 1}:</span>
                            <span className='flex-1'>{item.question}</span>
                            {!item.isAnswered && (
                                <span className='px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-semibold'>
                                    Not Answered
                                </span>
                            )}
                        </span>
                        <ChevronsUpDown className='h-5 w-5 flex-shrink-0' />
                    </CollapsibleTrigger>
                    <CollapsibleContent className='mt-2 space-y-3'>
                        {item.isAnswered ? (
                            <>
                                <div className='p-3 border rounded-lg bg-red-50 border-red-200'>
                                    <strong className='text-red-700'>Rating: </strong>
                                    <span className='text-red-600 font-semibold'>{item.rating}</span>
                                </div>
                                <div className='p-3 border rounded-lg bg-blue-50 border-blue-200'>
                                    <strong className='text-blue-900'>Your Answer: </strong>
                                    <p className='text-gray-700 mt-1'>{item.userAns}</p>
                                </div>
                                {item.answer && (
                                    <div className='p-3 border rounded-lg bg-green-50 border-green-200'>
                                        <strong className='text-green-900'>Expected Answer: </strong>
                                        <p className='text-gray-700 mt-1'>{item.answer}</p>
                                    </div>
                                )}
                                <div className='p-3 border rounded-lg bg-purple-50 border-purple-200'>
                                    <strong className='text-purple-900'>Feedback: </strong>
                                    <p className='text-gray-700 mt-1'>{item.feedback}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className='p-3 border rounded-lg bg-yellow-50 border-yellow-200'>
                                    <strong className='text-yellow-800'>Status: </strong>
                                    <span className='text-yellow-700'>You did not answer this question during the interview</span>
                                </div>
                                {item.answer && (
                                    <div className='p-3 border rounded-lg bg-green-50 border-green-200'>
                                        <strong className='text-green-900'>Expected Answer: </strong>
                                        <p className='text-gray-700 mt-1'>{item.answer}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </CollapsibleContent>
                </Collapsible>
            ))}
            <div className='flex justify-end gap-4 mt-8'>
                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                    Back to Dashboard
                </Button>
                <Button
                    onClick={() => router.push(`/dashboard/interview/${interviewId}/start`)}
                    className="bg-black hover:bg-gray-800"
                >
                    {getAnsweredCount() < feedbackList.length ? 'Complete Interview' : 'Retake Interview'}
                </Button>
            </div>
        </div>
    );
}

export default Feedback;