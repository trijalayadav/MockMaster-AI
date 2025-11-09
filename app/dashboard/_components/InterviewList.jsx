"use client"
import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { eq, desc } from 'drizzle-orm';
import InterviewItemCard from './InterviewItemCard';

function InterviewList() {
    const { user } = useUser();
    const [interviewList, setInterviewList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            GetInterviewList();
        }
    }, [user]);

    const GetInterviewList = async () => {
        try {
            setLoading(true);
            // Fetch interview list from db based on user email
            const result = await db
                .select()
                .from(MockInterview)
                .where(eq(MockInterview.createdBy, user?.primaryEmailAddress?.emailAddress))
                .orderBy(desc(MockInterview.id));

            console.log('Interview list fetched:', result);
            setInterviewList(result);
        } catch (error) {
            console.error('Error fetching interviews:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div>
                <h2 className='font-medium text-xl text-gray-800 mb-4'>Previous Mock Interviews</h2>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className='border rounded-lg p-5 animate-pulse bg-white shadow-sm'>
                            <div className='h-6 bg-gray-200 rounded w-3/4 mb-2'></div>
                            <div className='h-4 bg-gray-200 rounded w-1/2 mb-1'></div>
                            <div className='h-3 bg-gray-200 rounded w-1/3 mb-4'></div>
                            <div className='flex gap-3 mt-4'>
                                <div className='h-9 bg-gray-200 rounded w-full'></div>
                                <div className='h-9 bg-gray-200 rounded w-full'></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className='font-medium text-xl text-gray-800 mb-4'>
                Previous Mock Interviews
            </h2>
            {interviewList.length === 0 ? (
                <div className='text-center py-10 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50'>
                    <p className='text-gray-500 text-lg font-medium'>No interviews found</p>
                    <p className='text-gray-400 text-sm mt-1'>Create your first mock interview above!</p>
                </div>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
                    {interviewList.map((interview, index) => (
                        <InterviewItemCard
                            key={interview.mockId || interview.id || index}
                            interview={interview}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default InterviewList