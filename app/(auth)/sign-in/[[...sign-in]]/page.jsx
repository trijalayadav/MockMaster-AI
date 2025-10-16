import { SignIn } from "@clerk/nextjs";

export default function Page() {
    return (
        <div className="bg-gray-50 flex items-center justify-center min-h-screen">
            <div className="flex w-full max-w-5xl bg-white rounded-2xl shadow-lg overflow-hidden">

                {/* Left Section */}
                <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-900 via-blue-700 to-orange-500 flex-col justify-center items-center p-10 text-white">
                    <h1 className="text-4xl font-bold mb-3">Welcome to AI MockMaster</h1>
                    <p className="text-gray-200 text-center">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Eligendi nam dolorum aliquam, quibusdam aperiam.
                    </p>
                </div>

                {/* Right Section with Clerk Sign-In */}
                <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-10">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                        Sign In to your account
                    </h2>
                    <SignIn />
                </div>

            </div>
        </div>
    );
}
