// frontend/src/components/Admin/InterviewDetailsModal.js
import React from 'react';
import { X, User, BookText, MessageSquareText, Lightbulb, MessageSquareQuote, CheckCircle2,ScrollText } from 'lucide-react';

function InterviewDetailsModal({ interview, onClose }) {
    if (!interview) return null;

    const totalScores = interview.evaluatedAnswers?.reduce((sum, ea) => sum + (ea.evaluation?.score || 0), 0) || 0;
    const numEvaluated = interview.evaluatedAnswers?.length || 0;
    const avgScore = numEvaluated > 0 ? (totalScores / numEvaluated).toFixed(1) : 'N/A';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-700 transform scale-95 animate-fade-in-up">
                <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
                    <h2 className="text-3xl font-bold text-blue-400 flex items-center">
                        <BookText className="mr-3" size={28} /> Interview Details
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors duration-200">
                        <X size={28} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-gray-300">
                    <p className="flex items-center text-lg"><User className="mr-2 text-gray-500" size={20} /> <strong>Candidate:</strong> <span className="ml-2 font-semibold text-gray-100">{interview.candidateName}</span></p>
                    <p className="flex items-center text-lg"><Lightbulb className="mr-2 text-gray-500" size={20} /> <strong>Topic:</strong> <span className="ml-2 font-semibold text-gray-100">{interview.topic}</span></p>
                    <p className="flex items-center text-lg"><MessageSquareText className="mr-2 text-gray-500" size={20} /> <strong>ID:</strong> <span className="ml-2 font-mono text-blue-300">{interview._id}</span></p>
                    <p className="flex items-center text-lg"><CheckCircle2 className="mr-2 text-gray-500" size={20} /> <strong>Avg. Score:</strong> <span className={`ml-2 px-3 py-1 rounded-full text-base font-bold
                        ${avgScore !== 'N/A' && parseFloat(avgScore) >= 70 ? 'bg-green-500' :
                          avgScore !== 'N/A' && parseFloat(avgScore) >= 50 ? 'bg-orange-500' :
                          avgScore !== 'N/A' ? 'bg-red-500' : 'bg-gray-600'} text-white`}>
                        {avgScore}
                    </span></p>
                </div>

                <h3 className="text-2xl font-bold text-purple-400 mb-4 border-b border-gray-700 pb-2 flex items-center">
                    <ScrollText className="mr-2" size={24} /> Conversation History
                </h3>

                {interview.evaluatedAnswers && interview.evaluatedAnswers.length > 0 ? (
                    interview.evaluatedAnswers.map((item, index) => (
                        <div key={index} className="mb-6 p-5 bg-gray-700 rounded-lg shadow-inner border border-gray-600">
                            <p className="text-lg font-semibold text-yellow-200 mb-2 flex items-center"><Lightbulb className="mr-2" size={20} /> Question {index + 1}:</p>
                            <p className="text-gray-300 mb-3">{item.question}</p>

                            <p className="text-lg font-semibold text-blue-200 mb-2 flex items-center"><User className="mr-2" size={20} /> Candidate Answer:</p>
                            <p className="italic text-gray-300 mb-3">{item.answer}</p>

                            {item.evaluation && (
                                <>
                                    <p className="text-lg font-semibold text-green-300 mb-2 flex items-center">
                                        <MessageSquareQuote className="mr-2" size={20} /> AI Evaluation:
                                        <span className={`ml-3 px-3 py-1 rounded-full text-base font-bold
                                            ${item.evaluation.score >= 70 ? 'bg-green-500' :
                                              item.evaluation.score >= 50 ? 'bg-orange-500' :
                                              'bg-red-500'} text-white`}>
                                            {item.evaluation.score}/100
                                        </span>
                                    </p>
                                    <p className="text-sm text-gray-300">{item.evaluation.feedback}</p>
                                </>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-gray-400 text-center text-lg p-4 bg-gray-700 rounded-lg">No evaluated answers for this interview yet.</p>
                )}
            </div>
        </div>
    );
}

export default InterviewDetailsModal;