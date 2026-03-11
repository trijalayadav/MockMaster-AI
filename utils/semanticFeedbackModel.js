// ============================================================
// Semantic AI Feedback Model
// Uses TensorFlow.js + Universal Sentence Encoder (USE)
// Understands MEANING not just keywords
// No external API required — runs fully in browser/server
// ============================================================
// Install dependencies:
//   npm install @tensorflow/tfjs @tensorflow-models/universal-sentence-encoder
// ============================================================

import * as tf from "@tensorflow/tfjs";
import * as use from "@tensorflow-models/universal-sentence-encoder";

// ── Singleton model loader (load once, reuse everywhere) ────
let modelInstance = null;

async function getModel() {
  if (!modelInstance) {
    console.log("[SemanticModel] Loading Universal Sentence Encoder...");
    modelInstance = await use.load();
    console.log("[SemanticModel] Model loaded ✓");
  }
  return modelInstance;
}

// ── Speech Transcript Normalizer ────────────────────────────
// Fixes raw speech-to-text output:
//   - Capitalises first letter of each sentence
//   - Capitalises "i" → "I"
//   - Adds periods at natural pause points (conjunctions, long gaps)
//   - Trims extra whitespace

export function normalizeTranscript(text = "") {
  if (!text || text.trim().length === 0) return text;

  let result = text.trim();

  // Step 1: Capitalise the pronoun "i" when standalone
  result = result.replace(/\bi\b/g, "I");

  // Step 2: Add a period before common sentence-starting words
  // if the previous word doesn't already end with punctuation
  const sentenceStarters = [
    "however", "but", "so", "therefore", "additionally",
    "furthermore", "also", "then", "next", "finally",
    "firstly", "secondly", "thirdly", "in addition",
    "for example", "for instance", "as a result",
    "on the other hand", "in conclusion", "in summary",
  ];

  sentenceStarters.forEach((starter) => {
    const regex = new RegExp(
      `([^.!?])\\s+(${starter}\\s)`,
      "gi"
    );
    result = result.replace(regex, (_, before, word) => {
      return `${before}. ${word.charAt(0).toUpperCase() + word.slice(1)}`;
    });
  });

  // Step 3: Capitalise the first letter after sentence-ending punctuation
  result = result.replace(/([.!?]\s+)([a-z])/g, (_, punct, letter) => {
    return punct + letter.toUpperCase();
  });

  // Step 4: Capitalise the very first character
  result = result.charAt(0).toUpperCase() + result.slice(1);

  // Step 5: Add a period at the end if no punctuation exists
  if (!/[.!?]$/.test(result.trim())) {
    result = result.trim() + ".";
  }

  // Step 6: Clean up multiple spaces
  result = result.replace(/\s{2,}/g, " ").trim();

  return result;
}

// ── Cosine Similarity between two embedding vectors ─────────
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (magA * magB);
}

// ── Encode sentences into embeddings ────────────────────────
async function encodeTexts(model, texts) {
  const embeddings = await model.embed(texts);
  const array = await embeddings.array();
  embeddings.dispose(); // free GPU memory
  return array;
}

// ── Semantic Similarity Score (0-10) ────────────────────────
// Core of the AI: understands meaning via sentence embeddings
async function scoreSemanticSimilarity(model, userAnswer, expectedAnswer) {
  if (!userAnswer || userAnswer.trim().length < 3) return 0;

  const [embeddings] = [await encodeTexts(model, [userAnswer, expectedAnswer])];
  const similarity = cosineSimilarity(embeddings[0], embeddings[1]);

  // similarity is between -1 and 1, normalize to 0-10
  const normalized = Math.max(0, similarity); // clip negatives to 0
  return Math.round(normalized * 10);
}

// ── Communication Clarity Score (0-10) ──────────────────────
function scoreCommunicationClarity(userAnswer) {
  if (!userAnswer || userAnswer.trim().length === 0) return 0;

  let score = 10;
  const words = userAnswer.trim().split(/\s+/).filter(Boolean);

  if (words.length < 10) score -= 3;
  else if (words.length < 20) score -= 1;

  if (userAnswer[0] === userAnswer[0].toLowerCase()) score -= 1;
  if (!/[.!?]$/.test(userAnswer.trim())) score -= 1;

  const fillers = ["um", "uh", "like", "basically", "literally", "you know"];
  const fillerCount = words.filter((w) => fillers.includes(w.toLowerCase())).length;
  if (fillerCount > 2) score -= 1;

  const sentences = userAnswer.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const avgSentenceLen = words.length / Math.max(sentences.length, 1);
  if (avgSentenceLen > 40) score -= 1; // run-on sentences
  if (avgSentenceLen < 3)  score -= 1; // too fragmented

  return Math.max(0, Math.min(10, score));
}

// ── Confidence & Tone Score (0-10) ──────────────────────────
function scoreConfidenceTone(userAnswer) {
  if (!userAnswer || userAnswer.trim().length === 0) return 0;

  const text = userAnswer.toLowerCase();
  let score = 7;

  const hedges = [
    "i think", "i guess", "i'm not sure", "maybe", "perhaps",
    "i don't know", "not really", "kind of", "sort of",
    "i might be wrong", "i'm unsure", "i believe maybe",
  ];
  const assertive = [
    "i have", "i built", "i developed", "i implemented", "i designed",
    "i created", "i solved", "i learned", "i understand", "i can",
    "i worked", "i used", "i achieved", "i demonstrated", "i know",
  ];

  hedges.forEach((h)    => { if (text.includes(h)) score -= 1; });
  assertive.forEach((a) => { if (text.includes(a)) score += 0.5; });

  return Math.max(0, Math.min(10, Math.round(score)));
}

// ── Answer Depth Score (0-10) ────────────────────────────────
// Rewards detailed answers, penalises overly brief ones
function scoreAnswerDepth(userAnswer, expectedAnswer) {
  const userLen     = userAnswer.trim().split(/\s+/).filter(Boolean).length;
  const expectedLen = expectedAnswer.trim().split(/\s+/).filter(Boolean).length;
  if (expectedLen === 0) return 5;

  const ratio = Math.min(userLen / expectedLen, 1);
  return Math.round(ratio * 10);
}

// ── Feedback Text Generator ──────────────────────────────────
function generateFeedbackText(scores, userAnswer, expectedAnswer) {
  const { semanticScore, clarityScore, confidenceScore, depthScore, overall } = scores;
  const parts = [];

  // Overall assessment
  if (overall >= 8) {
    parts.push(
      "Excellent answer! You demonstrated a strong and accurate understanding of the topic."
    );
  } else if (overall >= 6) {
    parts.push(
      "Good attempt! Your answer captures some key ideas but could be more complete."
    );
  } else if (overall >= 4) {
    parts.push(
      "Your answer is partially correct but misses several important aspects of the topic."
    );
  } else {
    parts.push(
      "Your answer is incomplete and does not adequately address the question. " +
      "Review the expected answer carefully to understand what was missing."
    );
  }

  // Semantic accuracy feedback
  if (semanticScore < 4) {
    parts.push(
      "The meaning of your answer diverges significantly from the expected answer. " +
      "Focus on the core concepts the question is asking about."
    );
  } else if (semanticScore < 7) {
    parts.push(
      "You touched on some relevant ideas, but your answer doesn't fully align " +
      "with the expected concepts. Try to be more precise."
    );
  }

  // Depth feedback
  if (depthScore < 4) {
    parts.push(
      "Your answer is too brief. Expand your response with examples, " +
      "explanations, or relevant details to demonstrate deeper understanding."
    );
  }

  // Clarity feedback
  if (clarityScore < 5) {
    parts.push(
      "Work on communication clarity: use complete sentences, proper punctuation, " +
      "and organise your thoughts before answering."
    );
  }

  // Confidence feedback
  if (confidenceScore < 5) {
    parts.push(
      "Try to express answers more confidently. Replace hedging phrases like " +
      "'I think' or 'I'm not sure' with assertive statements about what you know."
    );
  }

  return parts.join(" ");
}

// ── MAIN EXPORT: generateFeedback() ─────────────────────────
/**
 * Generates AI-powered semantic feedback for a single answer.
 *
 * @param {string} question       - The interview question
 * @param {string} userAnswer     - The candidate's spoken/typed answer
 * @param {string} expectedAnswer - The ideal answer
 *
 * @returns {Promise<{
 *   rating: string,        // e.g. "7/10"
 *   feedback: string,      // detailed feedback paragraph
 *   breakdown: {
 *     semantic: number,    // meaning similarity (AI core)
 *     depth: number,       // answer completeness
 *     clarity: number,     // communication quality
 *     confidence: number,  // tone & assertiveness
 *   }
 * }>}
 */
export async function generateFeedback(question, userAnswer, expectedAnswer) {
  const model = await getModel();

  // Normalize raw speech-to-text transcript (fix caps + punctuation)
  const normalizedAnswer = normalizeTranscript(userAnswer);

  const [semanticScore, clarityScore, confidenceScore, depthScore] =
    await Promise.all([
      scoreSemanticSimilarity(model, normalizedAnswer, expectedAnswer),
      Promise.resolve(scoreCommunicationClarity(normalizedAnswer)),
      Promise.resolve(scoreConfidenceTone(normalizedAnswer)),
      Promise.resolve(scoreAnswerDepth(normalizedAnswer, expectedAnswer)),
    ]);

  // Weighted final score
  // Semantic similarity carries most weight (it's the AI core)
  const overall = Math.round(
    semanticScore   * 0.50 +
    depthScore      * 0.20 +
    clarityScore    * 0.20 +
    confidenceScore * 0.10
  );

  const scores = { semanticScore, clarityScore, confidenceScore, depthScore, overall };
  const finalRating = Math.max(1, Math.min(10, overall));

  return {
    rating: `${finalRating}/10`,
    feedback: generateFeedbackText(scores, normalizedAnswer, expectedAnswer),
    normalizedAnswer, // clean text to save in DB instead of raw transcript
    breakdown: {
      semantic:   semanticScore,
      depth:      depthScore,
      clarity:    clarityScore,
      confidence: confidenceScore,
    },
  };
}

// ── MAIN EXPORT: generateAllFeedback() ──────────────────────
/**
 * Processes all interview answers and returns overall rating.
 *
 * @param {Array<{ question, userAnswer, expectedAnswer }>} answers
 *
 * @returns {Promise<{
 *   overallRating: string,
 *   results: Array<{ question, userAnswer, expectedAnswer, rating, feedback, breakdown }>
 * }>}
 */
export async function generateAllFeedback(answers) {
  // Load model once, then process all answers
  const model = await getModel();

  const results = await Promise.all(
    answers.map(async ({ question, userAnswer, expectedAnswer }) => {
      const feedback = await generateFeedback(question, userAnswer, expectedAnswer);
      return { question, userAnswer, expectedAnswer, ...feedback };
    })
  );

  const totalRating = results.reduce((sum, r) => {
    return sum + parseFloat(r.rating.split("/")[0]);
  }, 0);

  const overallRating = (totalRating / results.length).toFixed(1);

  return {
    overallRating: `${overallRating}/10`,
    results,
  };
}

// ── Preload model on app start (optional but recommended) ────
export { getModel as preloadFeedbackModel };