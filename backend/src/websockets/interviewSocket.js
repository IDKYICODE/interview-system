// backend/src/websockets/interviewSocket.js
const { generateInterviewQuestion, evaluateAnswer } = require('../services/openaiService'); // Import evaluateAnswer
const { generateAvatarVideo } = require('../services/heygenService');
const { generateSpeech } = require('../services/elevenlabsService');
const mongoService = require('../services/mongoService'); // Import the new Mongo service
const jwt = require('jsonwebtoken');

// Map to store WebSocket connections, keyed by interviewId
const clients = new Map();

module.exports = (ws, req) => {
    let interviewId;
    let currentInterviewTopic;
    let previousQuestions = [];
    let candidateResponses = [];
    let evaluatedAnswers = []; // NEW: Store evaluated answers
    let authenticated = false;

    const token = req.url.split('token=')[1];

    if (!token) {
        ws.send(JSON.stringify({ type: 'ERROR', message: 'Authentication token is missing.' }));
        ws.close(1008, 'Authentication token missing');
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
        if (err) {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid or expired authentication token.' }));
            ws.close(1008, 'Invalid token');
            return;
        }
        if (user.role !== 'candidate') {
             ws.send(JSON.stringify({ type: 'ERROR', message: 'Unauthorized: Only candidates can access interview sessions via WebSocket.' }));
             ws.close(1008, 'Unauthorized role');
             return;
        }
        interviewId = user.interviewId;
        authenticated = true; // Set authenticated to true here
        clients.set(interviewId, ws);
        console.log(`WebSocket client authenticated for interview: ${interviewId}`);

        const session = await mongoService.getInterviewSession(interviewId);
        if (session) {
            currentInterviewTopic = session.topic;
            previousQuestions = session.questionsAsked || [];
            candidateResponses = session.candidateResponses || [];
            evaluatedAnswers = session.evaluatedAnswers || []; // NEW: Load existing evaluations

            ws.send(JSON.stringify({
                type: 'INTERVIEW_READY',
                interviewId,
                candidateName: session.candidateName,
                interviewTopic: session.topic,
                previousQuestions,
                candidateResponses,
                evaluatedAnswers // NEW: Send evaluated answers to frontend (if needed)
            }));

            if (previousQuestions.length === 0) {
                console.log('New session or no previous questions, asking the first one now.');
                await askNextQuestion();
            } else {
                console.log('Resuming session with existing questions. Frontend will display history and await action.');
            }

        } else {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'Interview session not found.' }));
            ws.close(1000, 'Session not found');
        }
    });


    const askNextQuestion = async () => {
        if (!authenticated || !interviewId || !currentInterviewTopic) {
            console.warn('Cannot ask question: Not authenticated or missing session info (during askNextQuestion).');
            ws.send(JSON.stringify({ type: 'ERROR', message: 'Interview not ready to ask questions.' }));
            return;
        }

        ws.send(JSON.stringify({ type: 'LOADING', message: 'Generating next question...' }));
        try {
            const question = await generateInterviewQuestion(currentInterviewTopic, previousQuestions, candidateResponses);
            previousQuestions.push(question); // Add to local history

            // Update MongoDB with the new question
            await mongoService.updateInterviewSession(interviewId, {
                questionsAsked: previousQuestions
            });

            ws.send(JSON.stringify({ type: 'QUESTION', question }));

            const [heygenVideoResult, elevenLabsAudioResult] = await Promise.allSettled([
                generateAvatarVideo(question),
                generateSpeech(question)
            ]);

            let heygenVideoUrl = null;
            let elevenLabsAudioUrl = null;

            if (heygenVideoResult.status === 'fulfilled') {
                heygenVideoUrl = heygenVideoResult.value;
            } else {
                console.error('HeyGen Video Generation Failed:', heygenVideoResult.reason);
                ws.send(JSON.stringify({ type: 'ERROR', message: `Avatar video generation failed: ${heygenVideoResult.reason.message || heygenVideoResult.reason}` }));
            }

            if (elevenLabsAudioResult.status === 'fulfilled') {
                elevenLabsAudioUrl = elevenLabsAudioResult.value;
            } else {
                console.error('Eleven Labs Audio Generation Failed:', elevenLabsAudioResult.reason);
                ws.send(JSON.stringify({ type: 'ERROR', message: `Speech audio generation failed: ${elevenLabsAudioResult.reason.message || elevenLabsAudioResult.reason}` }));
            }

            if (heygenVideoUrl || elevenLabsAudioUrl) {
                ws.send(JSON.stringify({
                    type: 'AVATAR_MEDIA',
                    videoUrl: heygenVideoUrl,
                    audioUrl: elevenLabsAudioUrl
                }));
            }


        } catch (error) {
            console.error('Error asking next question:', error);
            ws.send(JSON.stringify({ type: 'ERROR', message: `Failed to generate question: ${error.message}` }));
        } finally {
            ws.send(JSON.stringify({ type: 'LOADING_COMPLETE' }));
        }
    };

    ws.on('message', async (message) => {
        if (!authenticated) {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'Not authenticated for this WebSocket session.' }));
            return;
        }
        try {
            const parsedMessage = JSON.parse(message);
            console.log('Received message from client:', parsedMessage.type);

            switch (parsedMessage.type) {
                case 'SUBMIT_ANSWER':
                    const { answer } = parsedMessage;
                    if (!answer || answer.trim() === '') {
                        ws.send(JSON.stringify({ type: 'ERROR', message: 'Please provide an answer.' }));
                        return;
                    }

                    // Get the last question asked
                    const lastQuestion = previousQuestions[previousQuestions.length - 1];

                    // Evaluate the answer using OpenAI service
                    let evaluation = null;
                    try {
                        evaluation = await evaluateAnswer(lastQuestion, answer, currentInterviewTopic);
                        console.log('Answer Evaluation:', evaluation);
                    } catch (evalError) {
                        console.error('Failed to evaluate answer:', evalError);
                        ws.send(JSON.stringify({ type: 'ERROR', message: `Failed to evaluate answer: ${evalError.message}` }));
                        evaluation = { score: 0, feedback: "Evaluation failed." }; // Provide a fallback
                    }

                    candidateResponses.push(answer); // Add to local history

                    // NEW: Store the question, answer, and evaluation
                    evaluatedAnswers.push({
                        question: lastQuestion,
                        answer: answer,
                        evaluation: evaluation
                    });

                    // Update MongoDB with the new answer AND evaluation
                    await mongoService.updateInterviewSession(interviewId, {
                        candidateResponses: candidateResponses,
                        evaluatedAnswers: evaluatedAnswers // NEW: Update evaluated answers
                    });

                    ws.send(JSON.stringify({ type: 'DISPLAY_MESSAGE', message: 'Thank you for your answer!' }));

                    // Trigger next question after a short delay
                    setTimeout(askNextQuestion, 2000);
                    break;

                case 'REQUEST_NEXT_QUESTION':
                    console.log("Frontend requested next question.");
                    await askNextQuestion();
                    break;

                case 'END_INTERVIEW':
                    await mongoService.updateInterviewSession(interviewId, {
                        status: 'completed',
                        endedAt: new Date()
                    });
                    ws.send(JSON.stringify({ type: 'DISPLAY_MESSAGE', message: 'Interview ended. Thank you!' }));
                    ws.close(1000, 'Interview completed');
                    break;

                default:
                    console.warn('Unknown message type:', parsedMessage.type);
                    ws.send(JSON.stringify({ type: 'ERROR', message: `Unknown command: ${parsedMessage.type}` }));
            }
        } catch (error) {
            console.error('Error processing WebSocket message:', error);
            ws.send(JSON.stringify({ type: 'ERROR', message: `Error processing message: ${error.message}` }));
        }
    });

    ws.on('close', () => {
        if (interviewId) {
            clients.delete(interviewId);
            console.log(`Client for interview ${interviewId} disconnected.`);
        } else {
            console.log('Unauthenticated client disconnected.');
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
};