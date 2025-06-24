// frontend/src/components/QuestionDisplay.js
import React from 'react';
import { Lightbulb } from 'lucide-react'; // Import Lucide icon

function QuestionDisplay({ question }) {
    return (
        <div className="bg-gray-700 p-6 rounded-xl shadow-inner-xl w-full max-w-lg text-center border border-gray-600 transform hover:scale-[1.01] transition-transform duration-200 ease-out">
            <Lightbulb className="mx-auto text-yellow-400 mb-4 animate-pulse-light" size={32} />
            <p className="text-xl md:text-2xl text-blue-200 font-semibold leading-relaxed">
                {question || "Waiting for the first question from the AI Interviewer..."}
            </p>
        </div>
    );
}

export default QuestionDisplay;