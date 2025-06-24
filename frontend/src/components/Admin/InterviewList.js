// frontend/src/components/Admin/InterviewList.js
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ScrollText, MessageSquareQuote, Eye } from 'lucide-react'; // Import Eye icon

function InterviewList({ interviews, onRowClick }) { // Receive onRowClick prop
    const [expandedRow, setExpandedRow] = useState(null);

    const toggleRow = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    return (
        <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-700 bg-gray-800">
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                    <tr>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider md:px-6">
                            Interview ID
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider md:px-6">
                            Candidate Name
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider md:px-6">
                            Topic
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider md:px-6">
                            Date
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider md:px-6">
                            Time
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider md:px-6">
                            Status
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider md:px-6">
                            Q. Asked
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider md:px-6">
                            Ans. Given
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider md:px-6">
                            Avg. Score
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider md:px-6">
                            Actions
                        </th> {/* Changed from Details to Actions */}
                    </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {interviews.map((interview) => {
                        const totalScores = interview.evaluatedAnswers?.reduce((sum, ea) => sum + (ea.evaluation?.score || 0), 0) || 0;
                        const numEvaluated = interview.evaluatedAnswers?.length || 0;
                        const avgScore = numEvaluated > 0 ? (totalScores / numEvaluated).toFixed(1) : 'N/A';
                        const isExpanded = expandedRow === interview._id;

                        return (
                            <React.Fragment key={interview._id}>
                                <tr className="hover:bg-gray-700 transition-colors duration-150">
                                    <td className="px-3 py-4 whitespace-nowrap text-sm font-mono text-blue-300 md:px-6">
                                        {interview._id.substring(0, 8)}...
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-200 md:px-6">
                                        {interview.candidateName}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-200 md:px-6">
                                        {interview.topic}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-200 md:px-6">
                                        {interview.date}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-200 md:px-6">
                                        {interview.time}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm capitalize md:px-6">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                            ${interview.status === 'completed' ? 'bg-green-700 text-green-100' :
                                              interview.status === 'in-progress' ? 'bg-purple-700 text-purple-100' :
                                              'bg-yellow-700 text-yellow-100'}`}>
                                            {interview.status}
                                        </span>
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-200 md:px-6">
                                        {interview.questionsAsked ? interview.questionsAsked.length : 0}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-200 md:px-6">
                                        {interview.candidateResponses ? interview.candidateResponses.length : 0}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-200 md:px-6">
                                        {/* Display evaluation score if available for the last answer, or N/A */}
                                        {numEvaluated > 0 ? (
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                ${parseFloat(avgScore) >= 70 ? 'bg-blue-600' :
                                                  parseFloat(avgScore) >= 50 ? 'bg-orange-600' :
                                                  'bg-red-600'} text-white`}>
                                                {avgScore}
                                            </span>
                                        ) : 'N/A'}
                                    </td>
                                    <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium md:px-6 flex items-center justify-end space-x-2">
                                        {interview.evaluatedAnswers && interview.evaluatedAnswers.length > 0 && (
                                            <button
                                                onClick={() => toggleRow(interview._id)}
                                                className="text-indigo-400 hover:text-indigo-300 transition-colors duration-150 p-1 rounded-full hover:bg-gray-700"
                                                title={isExpanded ? "Hide Evaluation Details" : "Show Evaluation Details"}
                                            >
                                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </button>
                                        )}
                                        {/* NEW: View Details Button */}
                                        <button
                                            onClick={() => onRowClick(interview)}
                                            className="text-green-400 hover:text-green-300 transition-colors duration-150 p-1 rounded-full hover:bg-gray-700"
                                            title="View Full Interview Details"
                                        >
                                            <Eye size={20} />
                                        </button>
                                    </td>
                                </tr>
                                {isExpanded && interview.evaluatedAnswers && interview.evaluatedAnswers.length > 0 && (
                                    <tr>
                                        <td colSpan="10" className="p-4 bg-gray-700 text-gray-200">
                                            <h4 className="text-lg font-semibold mb-3 text-blue-300 flex items-center">
                                                <ScrollText size={20} className="mr-2" /> Evaluation Details (Inline)
                                            </h4>
                                            {interview.evaluatedAnswers.map((ea, idx) => (
                                                <div key={idx} className="mb-4 p-4 bg-gray-600 rounded-lg shadow-inner border border-gray-500">
                                                    <p className="font-semibold text-lg text-yellow-200 mb-2">Question {idx + 1}:</p>
                                                    <p className="mb-2 text-gray-300">{ea.question}</p>
                                                    <p className="font-semibold text-lg text-purple-200 mb-2">Your Answer:</p>
                                                    <p className="mb-2 italic text-gray-300">{ea.answer}</p>
                                                    <p className="font-semibold text-lg text-green-300 flex items-center mb-2">
                                                        <MessageSquareQuote size={20} className="mr-2" /> AI Evaluation:
                                                        <span className={`ml-2 px-3 py-1 rounded-full text-base font-bold
                                                            ${ea.evaluation.score >= 70 ? 'bg-green-500' :
                                                              ea.evaluation.score >= 50 ? 'bg-orange-500' :
                                                              'bg-red-500'} text-white`}>
                                                            {ea.evaluation.score}/100
                                                        </span>
                                                    </p>
                                                    <p className="text-sm text-gray-300">{ea.evaluation.feedback}</p>
                                                </div>
                                            ))}
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default InterviewList;
