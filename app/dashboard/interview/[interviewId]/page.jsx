"use client";
import { getInterviewById } from "@/app/actions/interview";
import React, { useEffect, useState, useCallback } from "react";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function Interview({ params }) {
    const { interviewId } = React.use(params);
    const [interviewData, setInterviewData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const GetInterviewDetails = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await getInterviewById(interviewId);
            if (result) {
                setInterviewData(result);
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
        GetInterviewDetails();
    }, [interviewId, GetInterviewDetails]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-lg">Loading interview details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center flex-col items-center gap-4 min-h-screen">
                <p className="text-lg text-red-600">{error}</p>
                <Button onClick={GetInterviewDetails}>Retry</Button>
            </div>
        );
    }

    if (!interviewData) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-lg">No interview data found.</p>
            </div>
        );
    }

    return (
        <div className="p-10 max-w-2xl mx-auto">
            <h2 className="font-bold text-3xl mb-10">Let's Get Started</h2>

            <div className="flex flex-col gap-5">
                {/* Interview Details */}
                <div className="p-5 rounded-lg border border-gray-200 bg-white">
                    <div className="space-y-3">
                        <h2 className="text-base">
                            <strong>Job Role/Job Position: </strong>
                            {interviewData.jobPosition}
                        </h2>
                        <h2 className="text-base">
                            <strong>Job Description/Tech Stack: </strong>
                            {interviewData.jobDesc}
                        </h2>
                        <h2 className="text-base">
                            <strong>Years of Experience: </strong>
                            {interviewData.jobExperience}
                        </h2>
                    </div>
                </div>

                {/* Info Card */}
                <div className="p-5 rounded-lg border border-yellow-400 bg-yellow-50">
                    <h2 className="flex gap-2 items-center text-yellow-600 mb-3">
                        <Lightbulb className="w-5 h-5" />
                        <strong>Information</strong>
                    </h2>
                    <p className="text-sm text-yellow-700 leading-relaxed">
                        {process.env.NEXT_PUBLIC_INFORMATION ||
                            "Enable your Microphone to Start your AI Generated Mock Interview. It has 5 questions which you can answer and at the last you will get the report on the basis of your answer. NOTE: We never record your video."}
                    </p>
                </div>

                {/* Start Button */}
                <div className="flex justify-end mt-4">
                    <Link href={`/dashboard/interview/${interviewId}/start`}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                            Start Interview
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Interview;