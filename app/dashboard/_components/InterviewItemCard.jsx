import React from 'react'
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

function InterviewItemCard({ interview }) {
    const router = useRouter();

    const onStart = () => {
        router.push('/dashboard/interview/' + interview?.mockId);
    }

    const onFeedbackPress = () => {
        router.push('/dashboard/interview/' + interview?.mockId + '/feedback');
    }

    // Format the date to match your design
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    return (
        <div className='border shadow-sm rounded-lg p-6 bg-white hover:shadow-md transition-shadow'>
            <h2 className='font-bold text-lg text-gray-900 mb-2'>{interview?.jobPosition}</h2>
            <h2 className='text-sm text-gray-600 mb-1'>
                {interview?.jobExperiene || interview?.jobExperience || '0'} Years of Experience
            </h2>
            <h2 className='text-xs text-gray-400 mb-5'>
                Created At: {formatDate(interview?.createdAt)}
            </h2>

            <div className='flex gap-3'>
                <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={onFeedbackPress}
                >
                    Feedback
                </Button>
                <Button
                    size="sm"
                    className="flex-1 bg-black hover:bg-gray-800 text-white"
                    onClick={onStart}
                >
                    Start
                </Button>
            </div>
        </div>
    )
}

export default InterviewItemCard