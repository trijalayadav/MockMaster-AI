import { Lightbulb, Volume2 } from 'lucide-react'
import React from 'react'

function QuestionsSection({ mockInterviewQuestions, activeQuestionIndex, onQuestionClick }) {
    // Handle case when no questions are available
    if (!mockInterviewQuestions || mockInterviewQuestions.length === 0) {
        return (
            <div className='p-5 border rounded-lg'>
                <h2 className='text-lg font-semibold mb-4'>Interview Questions</h2>
                <div className='flex items-center justify-center h-64 bg-gray-50 rounded-lg'>
                    <p className='text-gray-500'>No questions available</p>
                </div>
            </div>
        )
    }

    const textToSpeech = (text) => {
        if ('speechSynthesis' in window) {
            const speech = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(speech);
        }
        else {
            alert("Sorry, your browser doesn't support text to speech!");
        }
    }

    return (
        <div className='p-5 border rounded-lg'>
            <h2 className='text-lg font-semibold mb-4'>Interview Questions</h2>

            {/* Question Pills Grid */}
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
                {mockInterviewQuestions.map((question, index) => (
                    <button
                        key={index}
                        onClick={() => onQuestionClick && onQuestionClick(index)}
                        aria-label={`Go to question ${index + 1}`}
                        className={`p-2 rounded-full text-xs md:text-sm text-center cursor-pointer transition-all ${activeQuestionIndex === index
                            ? 'bg-primary text-white font-semibold scale-105 shadow-md'
                            : 'bg-secondary hover:bg-secondary/80 hover:scale-102'
                            }`}
                    >
                        Question #{index + 1}
                    </button>
                ))}
            </div>

            {/* Current Question Display */}
            {mockInterviewQuestions[activeQuestionIndex]?.question && (
                <div className='my-5 p-4 bg-blue-50 rounded-lg border-l-4 border-primary'>
                    <p className='text-xs text-gray-500 mb-2 uppercase tracking-wide font-semibold'>
                        Question {activeQuestionIndex + 1} of {mockInterviewQuestions.length}
                    </p>
                    <h2 className='text-md md:text-lg font-medium leading-relaxed text-gray-800'>
                        {mockInterviewQuestions[activeQuestionIndex].question}
                    </h2>
                </div>
            )}

            {/* Volume Icon for Text to Speech */}
            <div className='flex justify-center my-4'>
                <Volume2
                    onClick={() => textToSpeech(mockInterviewQuestions[activeQuestionIndex].question)}
                    className='w-8 h-8 text-primary cursor-pointer hover:text-primary/80 transition-colors'
                />
            </div>

            {/* Navigation Buttons */}
            <div className='flex justify-between gap-4 mt-4'>
                <button
                    onClick={() => activeQuestionIndex > 0 && onQuestionClick(activeQuestionIndex - 1)}
                    disabled={activeQuestionIndex === 0}
                    aria-label="Previous question"
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${activeQuestionIndex === 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-primary/90 hover:shadow-md'
                        }`}
                >
                    Previous
                </button>
                <button
                    onClick={() => activeQuestionIndex < mockInterviewQuestions.length - 1 && onQuestionClick(activeQuestionIndex + 1)}
                    disabled={activeQuestionIndex === mockInterviewQuestions.length - 1}
                    aria-label="Next question"
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${activeQuestionIndex === mockInterviewQuestions.length - 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-primary/90 hover:shadow-md'
                        }`}
                >
                    Next
                </button>
            </div>

            {/* Note Section */}
            <div className='border rounded-lg p-5 bg-blue-50 mt-6'>
                <h2 className='flex gap-2 items-center text-primary mb-2'>
                    <Lightbulb className='w-5 h-5' />
                    <strong>Note:</strong>
                </h2>
                <p className='text-sm text-primary leading-relaxed'>
                    {process.env.NEXT_PUBLIC_QUESTION_NOTE ||
                        "Click on any question to navigate, or use Previous/Next buttons. Take your time to prepare your answer before recording."}
                </p>
            </div>
        </div>
    )
}

export default QuestionsSection