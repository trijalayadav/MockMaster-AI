"use client";
import { UserButton } from '@clerk/nextjs'
import React, { useState } from 'react'
import AddNewInterview from './_components/AddNewInterview'

const Dashboard = () => {
    const [interviews, setInterviews] = useState([]);

    const handleInterviewStart = (interviewData) => {
        console.log("Interview data received in dashboard:", interviewData);
        console.log("Questions generated:", interviewData.questions);
        setInterviews([...interviews, interviewData]);
    };

    return (
        <div className="p-10">
            <h2 className='font-bold text-2xl'>Dashboard</h2>
            <h2 className='text-gray-500'>Create and Start your AI Mockup Interview</h2>

            <div className='grid grid-cols-1 md:grid-cols-3 my-5 gap-5'>
                <AddNewInterview onInterviewStart={handleInterviewStart} />

                {/* Display generated interviews */}
                {interviews.map((interview, index) => (
                    <div key={index} className="p-6 border-2 border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="mb-3">
                            <h3 className="font-bold text-lg text-gray-800">{interview.role}</h3>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{interview.description}</p>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Experience: {interview.experience} years</span>
                            <span className="text-blue-600 font-medium">
                                {interview.questions?.questions?.length || 0} questions
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Dashboard