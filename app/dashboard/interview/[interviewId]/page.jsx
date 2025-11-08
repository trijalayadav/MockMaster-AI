"use client";
import { MockInterview } from "@/utils/schema";
import { db } from "@/utils/db"; // Add your db import
import { eq } from "drizzle-orm"; // Add eq import
import React, { useEffect, useState } from "react";
import { Webcam, WebcamIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

function Interview({ params }) {
    const { interviewId } = React.use(params);
    const [interviewData, setInterviewData] = useState(null);
    const [WebCamEnabled, setWebCamEnabled] = useState(false);
    useEffect(() => {
        console.log(interviewId);
        GetInterviewDetails();
    }, [interviewId]);

    const GetInterviewDetails = async () => {
        try {
            const result = await db
                .select()
                .from(MockInterview)
                .where(eq(MockInterview.mockId, interviewId));

            console.log(result);

            if (result.length > 0) {
                setInterviewData(result[0]);
            }
        } catch (error) {
            console.error("Error fetching interview details:", error);
        }
    };

    return (
        <div className="my-10 flex justify-center flex-col items-center">
            <h2 className="font-bold text-2xl">Let's Get Started</h2>
            <div>
                {WebCamEnabled ? <Webcam
                    onUserMedia={() => setWebCamEnabled(true)}
                    onUserMediaError={() => setWebCamEnabled(false)}
                    style={{
                        height: 300,
                        width: 300
                    }} />
                    :
                    <>
                        <WebcamIcon className="w-full h-72 p-5 text-gray-400 my-7 bg-secondary rounded-lg border " />
                        <Button>Enable Web Cam and Microphone</Button>
                    </>
                }
            </div>
        </div >
    );
}

export default Interview;