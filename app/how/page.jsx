"use client"
import React from 'react'
import {
    FileText,
    MessageSquare,
    Video,
    BarChart,
    CheckCircle,
    Lightbulb,
    Clock,
    Award,
    Zap,
    Target
} from 'lucide-react'
import Header from '../dashboard/_components/Header';

function HowItWorksPage() {
    const steps = [
        {
            number: '01',
            title: 'Create Your Interview',
            description: 'Enter your job role, tech stack, and years of experience. Our AI generates personalized interview questions tailored to your profile.',
            icon: FileText,
            color: 'bg-blue-50 border-blue-200 text-blue-600'
        },
        {
            number: '02',
            title: 'Practice with AI',
            description: 'Answer questions using voice or text. Our AI listens and analyzes your responses in real-time, just like a real interviewer.',
            icon: MessageSquare,
            color: 'bg-green-50 border-green-200 text-green-600'
        },
        {
            number: '03',
            title: 'Record Your Session',
            description: 'Enable your webcam to simulate real interview conditions. Practice maintaining eye contact and professional body language.',
            icon: Video,
            color: 'bg-purple-50 border-purple-200 text-purple-600'
        },
        {
            number: '04',
            title: 'Get Instant Feedback',
            description: 'Receive detailed feedback on your answers with ratings, strengths, and areas for improvement. Learn from each practice session.',
            icon: BarChart,
            color: 'bg-orange-50 border-orange-200 text-orange-600'
        }
    ];

    const features = [
        {
            icon: Zap,
            title: 'AI-Powered Analysis',
            description: 'Advanced AI evaluates your responses for technical accuracy, communication skills, and depth of knowledge.'
        },
        {
            icon: Target,
            title: 'Personalized Questions',
            description: 'Questions tailored to your specific job role, experience level, and technology stack.'
        },
        {
            icon: Clock,
            title: 'Practice Anytime',
            description: '24/7 access to practice interviews. No scheduling needed - practice whenever you\'re ready.'
        },
        {
            icon: Award,
            title: 'Track Progress',
            description: 'Monitor your improvement over time with detailed performance analytics and ratings.'
        },
        {
            icon: Lightbulb,
            title: 'Learn Best Practices',
            description: 'Get insights on how to structure answers, communicate effectively, and highlight your strengths.'
        },
        {
            icon: CheckCircle,
            title: 'Build Confidence',
            description: 'Practice in a safe environment and build the confidence you need to ace real interviews.'
        }
    ];

    const benefits = [
        'Unlimited practice sessions',
        'Instant AI-powered feedback',
        'Realistic interview simulation',
        'Industry-specific questions',
        'Performance tracking & analytics',
        'Improve communication skills',
        'No time limits or restrictions',
        'Practice at your own pace'
    ];

    return (<>
        <Header />
        <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white'>
            {/* Hero Section */}
            <div className='bg-primary text-white py-16 px-6 md:px-10'>
                <div className='max-w-4xl mx-auto text-center'>
                    <h1 className='text-4xl md:text-5xl font-bold mb-4'>How It Works</h1>
                    <p className='text-xl text-blue-100'>
                        Master your interview skills with AI-powered practice sessions
                    </p>
                </div>
            </div>

            {/* Steps Section */}
            <div className='max-w-6xl mx-auto px-6 md:px-10 py-16'>
                <h2 className='text-3xl font-bold text-center mb-12'>Simple 4-Step Process</h2>

                <div className='space-y-8'>
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <div key={index} className='flex flex-col md:flex-row gap-6 items-start'>
                                <div className={`flex-shrink-0 w-16 h-16 rounded-full border-2 ${step.color} flex items-center justify-center`}>
                                    <Icon className='w-8 h-8' />
                                </div>

                                <div className='flex-1'>
                                    <div className='flex items-center gap-3 mb-2'>
                                        <span className='text-4xl font-bold text-gray-200'>{step.number}</span>
                                        <h3 className='text-2xl font-bold text-gray-800'>{step.title}</h3>
                                    </div>
                                    <p className='text-gray-600 text-lg leading-relaxed'>{step.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Features Section */}
            <div className='bg-gray-50 py-16 px-6 md:px-10'>
                <div className='max-w-6xl mx-auto'>
                    <h2 className='text-3xl font-bold text-center mb-4'>Powerful Features</h2>
                    <p className='text-gray-600 text-center mb-12 max-w-2xl mx-auto'>
                        Everything you need to prepare for your next interview
                    </p>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div key={index} className='bg-white p-6 rounded-lg border-2 border-gray-200 hover:border-primary transition'>
                                    <div className='w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4'>
                                        <Icon className='w-6 h-6 text-primary' />
                                    </div>
                                    <h3 className='text-xl font-bold text-gray-800 mb-2'>{feature.title}</h3>
                                    <p className='text-gray-600'>{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Benefits Section */}
            <div className='max-w-6xl mx-auto px-6 md:px-10 py-16'>
                <h2 className='text-3xl font-bold text-center mb-4'>Why Choose Our Platform?</h2>
                <p className='text-gray-600 text-center mb-12 max-w-2xl mx-auto'>
                    Join thousands of users who have improved their interview skills
                </p>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto'>
                    {benefits.map((benefit, index) => (
                        <div key={index} className='flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200'>
                            <CheckCircle className='w-6 h-6 text-green-600 flex-shrink-0' />
                            <span className='text-gray-800 font-medium'>{benefit}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className='bg-primary text-white py-16 px-6 md:px-10'>
                <div className='max-w-4xl mx-auto text-center'>
                    <h2 className='text-3xl md:text-4xl font-bold mb-4'>Ready to Get Started?</h2>
                    <p className='text-xl text-blue-100 mb-8'>
                        Start practicing today and land your dream job
                    </p>
                    <button className='bg-white text-primary px-8 py-4 rounded-lg text-lg font-bold hover:bg-gray-100 transition shadow-lg'>
                        Create Your First Interview
                    </button>
                </div>
            </div>

            {/* FAQ Section */}
            <div className='max-w-4xl mx-auto px-6 md:px-10 py-16'>
                <h2 className='text-3xl font-bold text-center mb-12'>Frequently Asked Questions</h2>

                <div className='space-y-6'>
                    <div className='border-2 border-gray-200 rounded-lg p-6'>
                        <h3 className='text-xl font-bold mb-2'>How does the AI evaluate my answers?</h3>
                        <p className='text-gray-600'>
                            Our AI analyzes your responses for technical accuracy, clarity, structure, and completeness. It compares your answers against best practices and provides constructive feedback.
                        </p>
                    </div>

                    <div className='border-2 border-gray-200 rounded-lg p-6'>
                        <h3 className='text-xl font-bold mb-2'>Can I practice multiple times?</h3>
                        <p className='text-gray-600'>
                            Yes! You can create unlimited interviews and practice as many times as you want. Each session helps you improve.
                        </p>
                    </div>

                    <div className='border-2 border-gray-200 rounded-lg p-6'>
                        <h3 className='text-xl font-bold mb-2'>Is my practice session recorded?</h3>
                        <p className='text-gray-600'>
                            Your webcam is only used during the practice session and is not stored. We only save your answers and feedback for your review.
                        </p>
                    </div>

                    <div className='border-2 border-gray-200 rounded-lg p-6'>
                        <h3 className='text-xl font-bold mb-2'>What technologies are supported?</h3>
                        <p className='text-gray-600'>
                            We support a wide range of technologies including React, Node.js, Python, Java, System Design, and many more. Questions are customized based on your input.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </>
    )
}

export default HowItWorksPage