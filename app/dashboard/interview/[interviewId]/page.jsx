"use client";
import { MockInterview } from "@/utils/schema";
import { db } from "@/utils/db";
import { eq } from "drizzle-orm";
import React, { useEffect, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Lightbulb, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link"; // ADD THIS IMPORT

function Interview({ params }) {
    const { interviewId } = React.use(params);
    const [interviewData, setInterviewData] = useState(null);
    const [webCamEnabled, setWebCamEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const GetInterviewDetails = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await db
                .select()
                .from(MockInterview)
                .where(eq(MockInterview.mockId, interviewId));

            console.log(result);

            if (result.length > 0) {
                setInterviewData(result[0]);
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
        console.log(interviewId);
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
        <div className="p-10">
            <h2 className="font-bold text-3xl mb-10">Let's Get Started</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Left Column */}
                <div className="flex flex-col gap-5">
                    {/* Interview Details Card */}
                    <div className="p-5 rounded-lg border border-gray-200 bg-white">
                        <div className="space-y-3">
                            <h2 className="text-base">
                                <strong>Job Role/Job Position:</strong>
                                {interviewData.jobPosition}
                            </h2>
                            <h2 className="text-base">
                                <strong>Job Description/Tech Stack:</strong>
                                {interviewData.jobDescription}
                            </h2>
                            <h2 className="text-base">
                                <strong>Years of Experience:</strong>
                                {interviewData.jobExperience}
                            </h2>
                        </div>
                    </div>

                    {/* Information Card */}
                    <div className="p-5 rounded-lg border border-yellow-400 bg-yellow-50">
                        <h2 className="flex gap-2 items-center text-yellow-600 mb-3">
                            <Lightbulb className="w-5 h-5" />
                            <strong>Information</strong>
                        </h2>
                        <p className="text-sm text-yellow-700 leading-relaxed">
                            {process.env.NEXT_PUBLIC_INFORMATION ||
                                "Enable Video Web Cam and Microphone to Start your AI Generated Mock Interview, It Has 5 question which you can answer and at the last you will get the report on the basis of your answer. NOTE: We never record your video, Web cam access you can disable at any time if you want"}
                        </p>
                    </div>
                </div>

                {/* Right Column - Webcam */}
                <div className="flex flex-col items-center justify-center gap-5">
                    {webCamEnabled ? (
                        <Webcam
                            onUserMediaError={() => {
                                setWebCamEnabled(false);
                                alert("Failed to access webcam. Please check permissions.");
                            }}
                            mirrored={true}
                            className="h-72 w-full rounded-lg border"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center w-full h-72 bg-gray-100 rounded-lg border border-gray-200">
                            <Camera className="w-32 h-32 text-gray-400 mb-4" />
                        </div>
                    )}

                    {!webCamEnabled && (
                        <Button
                            onClick={() => setWebCamEnabled(true)}
                            variant="outline"
                            className="w-full"
                        >
                            Enable Web Cam and Microphone
                        </Button>
                    )}
                </div>
            </div>

            {/* Start Interview Button */}
            <div className="flex justify-end mt-10">
                <Link href={`/dashboard/interview/${interviewId}/start`}>
                    <Button
                        disabled={!webCamEnabled}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                    >
                        Start Interview
                    </Button>
                </Link>
            </div>
        </div>
    );
}

export default Interview;