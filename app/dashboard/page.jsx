import { UserButton } from '@clerk/nextjs'
import React from 'react'

const Dashboard = () => {
    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <UserButton />
            </div>
            <div>
                <p>Welcome to your AI MockMaster Dashboard!</p>
                {/* Add your dashboard content here */}
            </div>
        </div>
    )
}

export default Dashboard