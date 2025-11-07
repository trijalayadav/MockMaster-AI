'use client';

import { SignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function Page() {
    const router = useRouter();
    const { isSignedIn, isLoaded } = useUser();

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            router.push('/dashboard');
        }
    }, [isLoaded, isSignedIn, router]);

    return (
        <div className="bg-gray-50 flex items-center justify-center min-h-screen p-4">
            <div className="flex w-full max-w-5xl bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-900 via-blue-700 to-orange-500 flex-col justify-center items-center p-10 text-white">
                    <h1 className="text-4xl font-bold mb-3">Welcome to AI MockMaster</h1>
                    <p className="text-gray-200 text-center">
                        Prepare for your interviews with AI-powered mock interviews.
                        Practice, improve, and land your dream job with confidence.
                    </p>
                </div>
                <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-10">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                        Create your account
                    </h2>
                    <SignUp
                        appearance={{
                            elements: {
                                rootBox: "w-full",
                                card: "shadow-none"
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}