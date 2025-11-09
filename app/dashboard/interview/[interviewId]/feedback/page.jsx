"use client"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';
import React, { use, useEffect, useState } from 'react'
import { db } from '@/utils/db';
import { userAnswers } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

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

            const result = await db
                .select()
                .from(userAnswers)
                .where(eq(userAnswers.mockIdRef, interviewId))
                .orderBy(userAnswers.id);

            console.log('Feedback result:', result);
            console.log('Total questions:', result.length);

            // Debug: Log each question
            result.forEach((item, idx) => {
                console.log(`Question ${idx + 1}:`, {
                    id: item.id,
                    question: item.question,
                    rating: item.rating
                });
            });

            setFeedbackList(result);
        } catch (err) {
            console.error('Error fetching feedback:', err);
            setError('Failed to load feedback. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const calculateOverallRating = () => {
        if (feedbackList.length === 0) return 'N/A';

        const totalRating = feedbackList.reduce((sum, item) => {
            const rating = parseFloat(item.rating?.split('/')[0] || 0);
            return sum + rating;
        }, 0);

        const averageRating = (totalRating / feedbackList.length).toFixed(1);
        return `${averageRating}/10`;
    };

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
                    <Button
                        onClick={GetFeedback}
                        className="mt-4"
                        variant="destructive"
                    >
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
                    <h2 className="text-2xl font-bold text-gray-600 mb-4">No Feedback Available</h2>
                    <p className="text-gray-500 mb-6">
                        It looks like you haven't completed any questions yet.
                    </p>
                    <Button onClick={() => router.push('/dashboard')}>
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className='p-10'>
            <h2 className='text-3xl font-bold text-green-500'>Congratulations!</h2>
            <h2 className='font-bold text-2xl mt-2'>Here is your interview feedback</h2>

            <h2 className='text-primary text-lg my-3'>
                Your overall interview rating: <strong>{calculateOverallRating()}</strong>
            </h2>

            <h2 className='text-sm text-gray-500 mb-5'>
                Find below interview questions with correct answers, your answers and feedback for improvement
            </h2>

            {feedbackList && feedbackList.map((item, index) => (
                <Collapsible key={item.id || index} className='mt-5'>
                    <CollapsibleTrigger className='p-2 bg-secondary rounded-lg my-2 text-left gap-7 w-full flex justify-between items-center hover:bg-gray-100 transition-colors'>
                        <span className='font-medium'>
                            <span className='text-primary mr-2'>Question {index + 1}:</span>
                            {item.question}
                        </span>
                        <ChevronsUpDown className='h-5 w-5 flex-shrink-0' />
                    </CollapsibleTrigger>
                    <CollapsibleContent className='mt-2 space-y-3'>
                        <div className='p-3 border rounded-lg bg-red-50 border-red-200'>
                            <strong className='text-red-700'>Rating: </strong>
                            <span className='text-red-600 font-semibold'>{item.rating}</span>
                        </div>

                        <div className='p-3 border rounded-lg bg-blue-50 border-blue-200'>
                            <strong className='text-blue-900'>Your Answer: </strong>
                            <p className='text-gray-700 mt-1'>{item.userAns || 'No answer provided'}</p>
                        </div>

                        {item.correctAns && (
                            <div className='p-3 border rounded-lg bg-green-50 border-green-200'>
                                <strong className='text-green-900'>Correct Answer: </strong>
                                <p className='text-gray-700 mt-1'>{item.correctAns}</p>
                            </div>
                        )}

                        <div className='p-3 border rounded-lg bg-purple-50 border-purple-200'>
                            <strong className='text-purple-900'>Feedback: </strong>
                            <p className='text-gray-700 mt-1'>{item.feedback || 'No feedback provided'}</p>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            ))}

            <div className='flex justify-end gap-4 mt-8'>
                <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                >
                    Back to Dashboard
                </Button>
                <Button
                    onClick={() => router.push(`/dashboard/interview/${interviewId}/start`)}
                    className="bg-black hover:bg-gray-800"
                >
                    Retake Interview
                </Button>
            </div>
        </div>
    )
}

export default Feedback