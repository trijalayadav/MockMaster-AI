"use client";
import { UserButton } from '@clerk/nextjs'
import React, { useState } from 'react'
import AddNewInterview from './_components/AddNewInterview'
import InterviewList from './_components/InterviewList';

const Dashboard = () => {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleInterviewStart = (interviewData) => {
        console.log("Interview data received in dashboard:", interviewData);
        console.log("Questions generated:", interviewData.questions);

        // Trigger refresh of InterviewList to show newly created interview
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="p-10">
            <h2 className='font-bold text-2xl text-gray-800'>Dashboard</h2>
            <h2 className='text-gray-500'>Create and Start your AI Mockup Interview</h2>

            <div className='grid grid-cols-1 md:grid-cols-3 my-5 gap-5'>
                <AddNewInterview onInterviewStart={handleInterviewStart} />
            </div>

            {/* Display all interviews from database */}
            <InterviewList key={refreshKey} />
        </div>
    )
}

export default Dashboard