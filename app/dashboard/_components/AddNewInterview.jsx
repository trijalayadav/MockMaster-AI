"use client";
import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import generateInterviewQuestions from "../../../utils/GeminiAIModel.js";
import { useRouter } from "next/navigation";

const AddNewInterview = ({ onInterviewStart }) => {
    const { user } = useUser();
    const [openDialog, setOpenDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        role: "",
        description: "",
        experience: "",
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.role.trim()) {
            newErrors.role = "Job role is required";
        }

        if (!formData.description.trim()) {
            newErrors.description = "Job description is required";
        }

        if (!formData.experience) {
            newErrors.experience = "Years of experience is required";
        } else if (parseInt(formData.experience) < 0) {
            newErrors.experience = "Experience cannot be negative";
        } else if (parseInt(formData.experience) > 50) {
            newErrors.experience = "Please enter a valid number of years";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            console.log("Interview Started with Details:", formData);

            // Generate interview questions
            const interviewQuestions = await generateInterviewQuestions(formData);

            if (!interviewQuestions) {
                throw new Error("Failed to generate interview questions");
            }

            // Prepare and save data directly to database
            const mockId = uuidv4();

            const resp = await db.insert(MockInterview)
                .values({
                    mockId: mockId,
                    jsonMockResp: JSON.stringify(interviewQuestions),
                    jobPosition: formData.role,
                    jobDesc: formData.description,
                    jobExperience: formData.experience,
                    createdBy: user?.primaryEmailAddress?.emailAddress,
                    createdAt: moment().format('DD-MM-yyyy')
                })
                .returning({ mockId: MockInterview.mockId });

            console.log("Interview saved to database:", resp);

            // Call parent callback with complete data
            if (interviewQuestions && onInterviewStart) {
                onInterviewStart({
                    ...formData,
                    questions: interviewQuestions,
                    mockId: resp[0]?.mockId
                });
            }

            // Close dialog and reset form on success
            setOpenDialog(false);
            setFormData({ role: "", description: "", experience: "" });
            setErrors({});
        } catch (error) {
            console.error("Error during interview creation:", error);
            setErrors({
                submit: "Failed to create interview. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({ role: "", description: "", experience: "" });
        setErrors({});
        setOpenDialog(false);
    };

    return (
        <div>
            {/* Clickable Card */}
            <div
                className="p-10 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:scale-105 hover:shadow-md hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all text-center"
                onClick={() => setOpenDialog(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setOpenDialog(true);
                    }
                }}
            >
                <div className="mx-auto mb-3 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </div>
                <h2 className="font-bold text-lg text-gray-800">Add New Interview</h2>
                <p className="text-sm text-gray-500 mt-1">Create a new mock interview</p>
            </div>

            {/* Dialog Overlay */}
            {openDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50"
                        onClick={handleCancel}
                    />

                    {/* Dialog Content */}
                    <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6 z-10">
                        {/* Close Button */}
                        <button
                            onClick={handleCancel}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none"
                            aria-label="Close dialog"
                            disabled={isLoading}
                        >
                            ×
                        </button>

                        {/* Header */}
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                Tell us more about the job you are interviewing for
                            </h2>
                            <p className="text-gray-500 text-sm">
                                Add details about the job position, your skills, and years of experience.
                            </p>
                        </div>

                        {/* Form */}
                        <div className="space-y-4">
                            {/* Job Role */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="role"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Job Position / Role Name
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    id="role"
                                    name="role"
                                    type="text"
                                    placeholder="e.g. Frontend Developer"
                                    value={formData.role}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.role ? "border-red-500" : "border-gray-300"
                                        } ${isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                />
                                {errors.role && (
                                    <p className="text-red-500 text-sm">{errors.role}</p>
                                )}
                            </div>

                            {/* Job Description */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="description"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Job Description / Tech Stack
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    placeholder="e.g. React, Node.js, MongoDB, REST APIs..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    disabled={isLoading}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.description ? "border-red-500" : "border-gray-300"
                                        } ${isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                />
                                {errors.description && (
                                    <p className="text-red-500 text-sm">{errors.description}</p>
                                )}
                            </div>

                            {/* Years of Experience */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="experience"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Years of Experience
                                    <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    id="experience"
                                    name="experience"
                                    type="number"
                                    min="0"
                                    max="50"
                                    placeholder="e.g. 2"
                                    value={formData.experience}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.experience ? "border-red-500" : "border-gray-300"
                                        } ${isLoading ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                />
                                {errors.experience && (
                                    <p className="text-red-500 text-sm">{errors.experience}</p>
                                )}
                            </div>

                            {/* Error Message */}
                            {errors.submit && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                    <p className="text-red-600 text-sm">{errors.submit}</p>
                                </div>
                            )}

                            {/* Loading Indicator */}
                            {isLoading && (
                                <div className="flex items-center justify-center py-2">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    <span className="ml-2 text-sm text-gray-600">Generating interview questions...</span>
                                </div>
                            )}

                            {/* Footer Buttons */}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={isLoading}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? "Generating..." : "Start Interview"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddNewInterview;