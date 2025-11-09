"use client";
import { Button } from "@/components/ui/button";
import { Brain, Mic, FileText, BarChart3, ArrowRight } from "lucide-react";
import Header from "./dashboard/_components/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-8">
            <Brain className="h-4 w-4" />
            <span className="text-sm font-medium">AI-Powered Interview Practice</span>
          </div>

          <h2 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Master Your Interview
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              With AI
            </span>
          </h2>

          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Practice with AI-generated questions, receive instant feedback, and build confidence for your next interview.
          </p>

          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-10 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            onClick={() => (window.location.href = "/dashboard")}
          >
            Start Your Mock Interview
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="bg-white border-2 border-gray-200 hover:border-blue-300 transition-all hover:shadow-lg rounded-lg p-6">
            <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI Questions</h3>
            <p className="text-gray-600 text-sm">
              Smart, role-specific interview questions tailored to your field
            </p>
          </div>

          <div className="bg-white border-2 border-gray-200 hover:border-indigo-300 transition-all hover:shadow-lg rounded-lg p-6">
            <div className="bg-indigo-100 p-3 rounded-lg w-fit mb-4">
              <Mic className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Voice Practice</h3>
            <p className="text-gray-600 text-sm">
              Answer questions verbally and get transcribed responses
            </p>
          </div>

          <div className="bg-white border-2 border-gray-200 hover:border-purple-300 transition-all hover:shadow-lg rounded-lg p-6">
            <div className="bg-purple-100 p-3 rounded-lg w-fit mb-4">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Instant Feedback</h3>
            <p className="text-gray-600 text-sm">
              Get detailed analysis and improvement tips for each answer
            </p>
          </div>

          <div className="bg-white border-2 border-gray-200 hover:border-pink-300 transition-all hover:shadow-lg rounded-lg p-6">
            <div className="bg-pink-100 p-3 rounded-lg w-fit mb-4">
              <BarChart3 className="h-6 w-6 text-pink-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
            <p className="text-gray-600 text-sm">
              Monitor your performance and improvement over time
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl font-bold text-center mb-16 text-gray-900">
            Simple 3-Step Process
          </h3>

          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold shadow-lg">
                1
              </div>
              <div>
                <h4 className="text-2xl font-semibold mb-2">Enter Job Details</h4>
                <p className="text-gray-600 text-lg">
                  Provide your job role, description, and years of experience
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold shadow-lg">
                2
              </div>
              <div>
                <h4 className="text-2xl font-semibold mb-2">Practice Interview</h4>
                <p className="text-gray-600 text-lg">
                  Answer AI-generated questions using text or voice
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold shadow-lg">
                3
              </div>
              <div>
                <h4 className="text-2xl font-semibold mb-2">Get Feedback</h4>
                <p className="text-gray-600 text-lg">
                  Review detailed feedback and improve your responses
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-center shadow-2xl">
          <h3 className="text-4xl font-bold text-white mb-4">
            Ready to Ace Your Next Interview?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Start practicing now and boost your confidence
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="text-lg px-10 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            onClick={() => (window.location.href = "/dashboard")}
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/50 backdrop-blur-sm py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© {new Date().getFullYear()} AI Mock Interviewer. Powered by AI.</p>
        </div>
      </footer>
    </div>
  );
}