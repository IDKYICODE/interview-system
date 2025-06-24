// frontend/src/components/ResponseInput.js
import React, { useState, useEffect } from 'react';
import { Mic, Send, Square, Play } from 'lucide-react'; // Import Lucide icons

function ResponseInput({ response, setResponse, onSubmit, isLoading }) {
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.webkitSpeechRecognition;
            const newRecognition = new SpeechRecognition();
            newRecognition.continuous = false;
            newRecognition.interimResults = false;
            newRecognition.lang = 'en-US';

            newRecognition.onstart = () => {
                setIsListening(true);
                console.log('Speech recognition started...');
            };

            newRecognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');
                setResponse(transcript);
                setIsListening(false);
                console.log('Speech recognition result:', transcript);
                // onSubmit(); // Automatically submit after speech - commented out for manual control
            };

            newRecognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
                // Replaced alert with console log and an internal message
                console.log(`Speech recognition error: ${event.error}. Please try again or type your response.`);
            };

            newRecognition.onend = () => {
                setIsListening(false);
                console.log('Speech recognition ended.');
            };

            setRecognition(newRecognition);
        } else {
            console.warn('Web Speech API is not supported in this browser.');
        }

        return () => {
            if (recognition) {
                recognition.stop();
            }
        };
    }, []);

    const toggleListening = () => {
        if (recognition) {
            if (isListening) {
                recognition.stop();
            } else {
                setResponse(''); // Clear previous response before listening
                recognition.start();
            }
        } else {
            // Replaced alert
            console.warn("Speech recognition is not available in your browser.");
        }
    };

    return (
        <div className="flex flex-col space-y-4">
            <textarea
                className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px] text-white placeholder-gray-400 shadow-inner resize-y"
                placeholder="Type your answer here..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                disabled={isLoading || isListening}
            ></textarea>
            <div className="flex space-x-4">
                <button
                    onClick={onSubmit}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-indigo-800 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading || isListening || !response.trim()}
                >
                    <Send className="mr-2 group-hover:translate-x-1 transition-transform duration-200" size={20} /> Submit Answer
                </button>
                <button
                    onClick={toggleListening}
                    className={`p-3 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-110
                                ${isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse-fast' : 'bg-blue-500 hover:bg-blue-600'}
                                text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={isLoading}
                    title={isListening ? "Stop Listening" : "Start Speaking"}
                >
                    {isListening ? (
                        <Square size={24} /> // Stop icon
                    ) : (
                        <Mic size={24} /> // Microphone icon
                    )}
                </button>
            </div>
        </div>
    );
}

export default ResponseInput;
