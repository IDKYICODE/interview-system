// frontend/src/components/InterviewRoom.js
import React, { useState, useEffect, useRef } from 'react';
import QuestionDisplay from './QuestionDisplay';
import AvatarDisplay from './AvatarDisplay';
import ResponseInput from './ResponseInput';
import LoadingSpinner from './LoadingSpinner';
import { connectWebSocket, disconnectWebSocket } from '../services/websocket';
import { LogOut, Mic, Send, MessageSquareText, SquareUserRound } from 'lucide-react'; // Import Lucide icons

function InterviewRoom({ interviewId, onLogout, token }) {
    const [question, setQuestion] = useState('');
    const [response, setResponse] = useState('');
    const [messages, setMessages] = useState([]); // For displaying system messages, errors, etc.
    const [isLoading, setIsLoading] = useState(true);
    const [avatarVideoUrl, setAvatarVideoUrl] = useState('');
    const [avatarAudioUrl, setAvatarAudioUrl] = useState('');
    const wsRef = useRef(null);
    const audioRef = useRef(null); // Ref for playing avatar's speech
    const messagesEndRef = useRef(null); // Ref for auto-scrolling messages

    useEffect(() => {
        // Scroll to the latest message whenever messages update
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    useEffect(() => {
        if (!token) {
            setMessages(prev => [...prev, { type: 'error', text: 'Authentication token missing. Please log in again.' }]);
            return;
        }

        const ws = connectWebSocket(interviewId, token);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket connected');
            setMessages(prev => [...prev, { type: 'info', text: 'Connected to interview session.' }]);
            setIsLoading(false);
            // Frontend no longer sends REQUEST_NEXT_QUESTION on open.
            // Backend will initiate the first question for new sessions.
            // The fallback useEffect below handles re-requesting if question remains empty.
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Received WS message:', data.type, data);

            switch (data.type) {
                case 'INTERVIEW_READY':
                    setMessages(prev => [...prev, { type: 'info', text: `Welcome, ${data.candidateName}! Interview Topic: ${data.interviewTopic}` }]);
                    setIsLoading(false);
                    // If this is a resumed session and question already exists, it will display.
                    // Otherwise, backend will send QUESTION or the fallback useEffect will request it.
                    break;
                case 'QUESTION':
                    setQuestion(data.question);
                    setMessages(prev => [...prev, { type: 'question', text: data.question }]);
                    setAvatarVideoUrl(''); // Clear previous avatar video when a new question arrives
                    setAvatarAudioUrl(''); // Clear previous audio
                    setIsLoading(false);
                    break;
                case 'AVATAR_MEDIA':
                    setAvatarVideoUrl(data.videoUrl);
                    setAvatarAudioUrl(data.audioUrl);
                    if (audioRef.current) {
                        audioRef.current.src = data.audioUrl;
                        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
                    }
                    break;
                case 'LOADING':
                    setMessages(prev => [...prev, { type: 'info', text: data.message }]);
                    setIsLoading(true);
                    break;
                case 'LOADING_COMPLETE':
                    setIsLoading(false);
                    break;
                case 'DISPLAY_MESSAGE':
                    setMessages(prev => [...prev, { type: 'info', text: data.message }]);
                    break;
                case 'ERROR':
                    setMessages(prev => [...prev, { type: 'error', text: `Error: ${data.message}` }]);
                    setIsLoading(false);
                    break;
                default:
                    console.warn('Unhandled message type:', data.type);
            }
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
            setMessages(prev => [...prev, { type: 'info', text: 'Disconnected from interview session.' }]);
            setIsLoading(false);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setMessages(prev => [...prev, { type: 'error', text: 'WebSocket error occurred.' }]);
            setIsLoading(false);
        };

        return () => {
            disconnectWebSocket(wsRef.current);
        };
    }, [interviewId, token]);

    // This useEffect ensures that if the 'question' state remains empty after initial loading,
    // it explicitly requests the first question from the backend. This acts as a robust fallback.
    useEffect(() => {
        if (!question && !isLoading && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            // Give a slight delay to ensure INTERVIEW_READY has been processed
            const timer = setTimeout(() => {
                if (!question) { // Check again after timeout
                    console.log('Question is still empty, sending REQUEST_NEXT_QUESTION as fallback.');
                    wsRef.current.send(JSON.stringify({ type: 'REQUEST_NEXT_QUESTION' }));
                }
            }, 1500); // Increased delay slightly
            return () => clearTimeout(timer);
        }
    }, [question, isLoading, wsRef.current?.readyState]); // Add wsRef.current?.readyState to dependencies

    const handleSubmitAnswer = () => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            if (response.trim()) {
                wsRef.current.send(JSON.stringify({ type: 'SUBMIT_ANSWER', answer: response }));
                setMessages(prev => [...prev, { type: 'user-response', text: `You: ${response}` }]);
                setResponse('');
                setIsLoading(true);
            } else {
                setMessages(prev => [...prev, { type: 'warning', text: 'Please type or speak your answer.' }]);
            }
        } else {
            setMessages(prev => [...prev, { type: 'error', text: 'Not connected to interview session.' }]);
            // Replaced alert with direct message to messages array
            setMessages(prev => [...prev, {type: 'error', text: 'Connection error. Please try refreshing or logging in.'}]);
        }
    };

    const handleEndInterview = () => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'END_INTERVIEW' }));
        }
        onLogout();
    };

    return (
        <div className="flex flex-col md:flex-row w-full min-h-screen bg-gray-900 text-white rounded-lg shadow-xl overflow-hidden">
            {/* Left Panel: AI Avatar and Question Display */}
            <div className="md:w-1/2 p-8 flex flex-col justify-between bg-gray-800 border-r border-gray-700 rounded-l-lg relative">
                <div className="absolute top-4 left-4 text-2xl font-bold text-blue-400">AI Interviewer</div>
                <div className="flex-grow flex flex-col items-center justify-center space-y-6 text-center">
                    <AvatarDisplay videoUrl={avatarVideoUrl} />
                    <QuestionDisplay question={question} />
                    {/* Hidden audio element for Eleven Labs TTS playback */}
                    <audio ref={audioRef} controls className="hidden"></audio>
                </div>
                {isLoading && (
                    <div className="mt-6 flex justify-center">
                        <LoadingSpinner />
                    </div>
                )}
            </div>

            {/* Right Panel: User Response Input and Messages */}
            <div className="md:w-1/2 p-8 flex flex-col justify-between bg-gray-800 rounded-r-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-200 flex items-center">
                        <MessageSquareText className="mr-2 text-purple-400" size={24} /> Your Response
                    </h2>
                    <button
                        onClick={onLogout}
                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-300 ease-in-out flex items-center group"
                    >
                        <LogOut className="mr-2 group-hover:rotate-6 transition-transform duration-200" size={20} /> Logout
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto pr-4 mb-6 max-h-96 custom-scrollbar bg-gray-700 p-4 rounded-lg shadow-inner">
                    {messages.map((msg, index) => (
                        <div key={index} className={`mb-3 p-3 rounded-lg ${msg.type === 'error' ? 'bg-red-900 text-red-200' : msg.type === 'warning' ? 'bg-yellow-900 text-yellow-200' : msg.type === 'question' ? 'bg-blue-700 text-blue-100 font-medium' : msg.type === 'user-response' ? 'bg-purple-700 text-purple-100 italic self-end ml-auto' : 'bg-gray-600 text-gray-200'} shadow-sm max-w-[90%]`}>
                            {msg.text}
                        </div>
                    ))}
                    <div ref={messagesEndRef} /> {/* For auto-scrolling */}
                </div>
                <ResponseInput
                    response={response}
                    setResponse={setResponse}
                    onSubmit={handleSubmitAnswer}
                    isLoading={isLoading}
                />
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={handleEndInterview}
                        className="px-8 py-4 bg-gradient-to-r from-pink-500 to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-pink-600 hover:to-red-700 transition duration-300 ease-in-out transform hover:scale-105 flex items-center"
                    >
                        End Interview
                    </button>
                </div>
            </div>
        </div>
    );
}

export default InterviewRoom;