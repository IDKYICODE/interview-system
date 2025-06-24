// backend/src/services/openaiService.js
const fetch = require('node-fetch').default;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-3.5-turbo'; // Or 'gpt-4o', 'gpt-4-turbo', etc.

/**
 * Generates an interview question using the OpenAI API.
 * @param {string} interviewTopic - The topic of the interview.
 * @param {string[]} previousQuestions - Array of questions already asked.
 * @param {string[]} previousAnswers - Array of answers given by the candidate.
 * @returns {Promise<string>} The generated interview question.
 */
exports.generateInterviewQuestion = async (interviewTopic, previousQuestions = [], previousAnswers = []) => {
    try {
        let messages = [
            { role: "system", content: "You are an AI interviewer. Your task is to ask a single, clear, and relevant interview question." }
        ];

        let userPrompt = `The interview topic is "${interviewTopic}".`;

        if (previousQuestions.length > 0) {
            userPrompt += ` Here's the conversation so far:\n`;
            for (let i = 0; i < previousQuestions.length; i++) {
                messages.push({ role: "assistant", content: previousQuestions[i] }); // Treat previous questions as assistant
                if (previousAnswers[i]) {
                    messages.push({ role: "user", content: previousAnswers[i] }); // Treat previous answers as user
                }
            }
            userPrompt += `Based on the above, ask the next question, keeping the interview flow natural.`;
        } else {
            userPrompt += ` Start with an introductory question.`;
        }

        messages.push({ role: "user", content: userPrompt });

        const payload = {
            model: OPENAI_MODEL,
            messages: messages,
            temperature: 0.7,
            max_tokens: 150,
            n: 1,
            stop: null,
        };

        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('OpenAI API Error Response:', JSON.stringify(result, null, 2));
            throw new Error(result.error?.message || `OpenAI API error: ${response.status}`);
        }

        if (result.choices && result.choices.length > 0 && result.choices[0].message) {
            return result.choices[0].message.content.trim();
        } else {
            console.error('Unexpected OpenAI API response structure:', JSON.stringify(result, null, 2));
            return "I'm sorry, I couldn't generate a question at this time. Please try again.";
        }

    } catch (error) {
        console.error('Error calling OpenAI API for question generation:', error);
        throw new Error('Failed to generate interview question.');
    }
};

/**
 * Evaluates a candidate's answer using the OpenAI API.
 * Returns a JSON object with score (0-100) and feedback.
 * @param {string} question - The question asked.
 * @param {string} answer - The candidate's answer.
 * @param {string} interviewTopic - The topic of the interview.
 * @returns {Promise<{score: number, feedback: string}>} A structured evaluation.
 */
exports.evaluateAnswer = async (question, answer, interviewTopic) => {
    try {
        const messages = [
            { role: "system", content: `You are an expert interviewer. Your task is to evaluate a candidate's answer to an interview question on the topic of "${interviewTopic}". Provide a correctness score from 0 to 100, and a concise, constructive feedback message. The output MUST be a JSON object with 'score' (number) and 'feedback' (string) fields.` },
            { role: "user", content: `Question: "${question}"\nCandidate's Answer: "${answer}"` }
        ];

        const payload = {
            model: OPENAI_MODEL,
            messages: messages,
            temperature: 0.2, // Lower temperature for more consistent output
            max_tokens: 200,
            n: 1,
            response_format: { type: "json_object" } // NEW: Request JSON output
        };

        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('OpenAI API Evaluation Error Response:', JSON.stringify(result, null, 2));
            throw new Error(result.error?.message || `OpenAI API error: ${response.status}`);
        }

        if (result.choices && result.choices.length > 0 && result.choices[0].message) {
            const content = result.choices[0].message.content.trim();
            try {
                const evaluation = JSON.parse(content);
                // Basic validation for structure
                if (typeof evaluation.score === 'number' && typeof evaluation.feedback === 'string') {
                    return evaluation;
                } else {
                    throw new Error("Invalid JSON structure from OpenAI for evaluation.");
                }
            } catch (jsonError) {
                console.error('Failed to parse OpenAI evaluation JSON:', jsonError, 'Raw content:', content);
                // Fallback to text feedback if JSON parsing fails
                return { score: 0, feedback: `Evaluation response could not be parsed: ${content.substring(0, 100)}...` };
            }
        } else {
            console.error('Unexpected OpenAI API evaluation response structure:', JSON.stringify(result, null, 2));
            return { score: 0, feedback: "Could not evaluate the answer due to unexpected API response." };
        }

    } catch (error) {
        console.error('Error calling OpenAI API for answer evaluation:', error);
        throw new Error('Failed to evaluate answer: ' + error.message);
    }
};