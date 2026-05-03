"use server";
import { db } from "@/utils/db";
import { MockInterview, userAnswers } from "@/utils/schema";
import { eq, desc, and } from "drizzle-orm";

export async function saveInterview(data) {
    const resp = await db.insert(MockInterview)
        .values(data)
        .returning({ mockId: MockInterview.mockId });
    return resp[0]?.mockId;
}

export async function getInterviewList(email) {
    const result = await db
        .select()
        .from(MockInterview)
        .where(eq(MockInterview.createdBy, email))
        .orderBy(desc(MockInterview.id));
    return result;
}

export async function getInterviewById(interviewId) {
    const result = await db
        .select()
        .from(MockInterview)
        .where(eq(MockInterview.mockId, interviewId));
    return result[0] || null;
}

export async function getExistingAnswer(mockId, question) {
    return await db.select()
        .from(userAnswers)
        .where(and(
            eq(userAnswers.mockIdRef, mockId),
            eq(userAnswers.question, question)
        ));
}

export async function saveUserAnswer(data) {
    await db.insert(userAnswers).values(data);
}

export async function updateUserAnswer(mockId, question, data) {
    await db.update(userAnswers)
        .set(data)
        .where(and(
            eq(userAnswers.mockIdRef, mockId),
            eq(userAnswers.question, question)
        ));
}
export async function getFeedbackByInterview(interviewId) {
    try {
        const interviewResult = await db
            .select()
            .from(MockInterview)
            .where(eq(MockInterview.mockId, interviewId));

        if (interviewResult.length === 0) {
            return { error: 'Interview not found' };
        }

        const interviewData = interviewResult[0];
        let allQuestions = [];

        if (interviewData.jsonMockResp) {
            const jsonMockResponse = typeof interviewData.jsonMockResp === 'string'
                ? JSON.parse(interviewData.jsonMockResp)
                : interviewData.jsonMockResp;
            allQuestions = jsonMockResponse.questions || [];
        }

        const answersResult = await db
            .select()
            .from(userAnswers)
            .where(eq(userAnswers.mockIdRef, interviewId));

        const feedbackList = allQuestions.map((question, index) => {
            const userAnswer = answersResult.find(
                answer => answer.question === question.question
            );
            return {
                id: userAnswer?.id || `question-${index}`,
                question: question.question,
                answer: question.answer,
                userAns: userAnswer?.userAns || null,
                feedback: userAnswer?.feedback || null,
                rating: userAnswer?.rating || null,
                isAnswered: !!userAnswer
            };
        });

        return { feedbackList };

    } catch (err) {
        console.error('getFeedbackByInterview error:', err);
        return { error: 'Failed to load feedback' };
    }
}