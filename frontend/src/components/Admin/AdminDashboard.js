// frontend/src/components/Admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import InterviewList from './InterviewList'; // Sub-component for listing interviews
import { LayoutDashboard, Users, CalendarCheck, FileText, XCircle, LogOut, CheckCircle2 } from 'lucide-react'; // Import CheckCircle2 icon
import InterviewDetailsModal from './InterviewDetailsModal'; // NEW: Import modal component

function AdminDashboard({ onLogout, token }) {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedInterview, setSelectedInterview] = useState(null); // NEW: State for selected interview

    useEffect(() => {
        const fetchInterviews = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await fetch('/api/admin/interviews', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch interviews');
                }

                const data = await response.json();
                setInterviews(data.interviews);
            } catch (err) {
                console.error('Error fetching admin interviews:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchInterviews();
        }
    }, [token]);

    // Calculate summary statistics
    const totalInterviews = interviews.length;
    const completedInterviews = interviews.filter(i => i.status === 'completed').length;
    const scheduledInterviews = interviews.filter(i => i.status === 'scheduled').length;
    const inProgressInterviews = interviews.filter(i => i.status === 'in-progress').length;

    // Calculate average correctness score across all evaluated answers
    let totalScore = 0;
    let totalEvaluatedAnswers = 0;
    interviews.forEach(interview => {
        if (interview.evaluatedAnswers && interview.evaluatedAnswers.length > 0) {
            interview.evaluatedAnswers.forEach(ea => {
                if (typeof ea.evaluation.score === 'number') {
                    totalScore += ea.evaluation.score;
                    totalEvaluatedAnswers++;
                }
            });
        }
    });
    const averageCorrectness = totalEvaluatedAnswers > 0 ? (totalScore / totalEvaluatedAnswers).toFixed(1) : 'N/A';

    // NEW: Function to handle viewing interview details
    const handleViewDetails = (interview) => {
        setSelectedInterview(interview);
    };

    return (
        <div className="p-8 w-full min-h-screen bg-gray-900 text-gray-100 rounded-lg shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-10 pb-4 border-b border-gray-700">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-green-400 flex items-center mb-4 sm:mb-0">
                    <LayoutDashboard className="mr-3 text-emerald-400" size={32} /> Admin Dashboard
                </h1>
                <button
                    onClick={onLogout}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white font-semibold rounded-lg shadow-md hover:shadow-xl hover:from-red-700 hover:to-rose-800 transition duration-300 ease-in-out transform hover:scale-105 flex items-center group w-full sm:w-auto justify-center"
                >
                    <LogOut className="mr-2 group-hover:rotate-6 transition-transform duration-200" size={20} /> Logout
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 flex items-center space-x-4">
                    <Users className="text-blue-400" size={36} />
                    <div>
                        <p className="text-gray-400 text-sm">Total Interviews</p>
                        <p className="text-3xl font-bold">{totalInterviews}</p>
                    </div>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 flex items-center space-x-4">
                    <CalendarCheck className="text-green-400" size={36} />
                    <div>
                        <p className="text-gray-400 text-sm">Completed</p>
                        <p className="text-3xl font-bold">{completedInterviews}</p>
                    </div>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 flex items-center space-x-4">
                    <FileText className="text-yellow-400" size={36} />
                    <div>
                        <p className="text-gray-400 text-sm">Scheduled</p>
                        <p className="text-3xl font-bold">{scheduledInterviews}</p>
                    </div>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 flex items-center space-x-4">
                    <CheckCircle2 className="text-cyan-400" size={36} />
                    <div>
                        <p className="text-gray-400 text-sm">Avg. Correctness</p>
                        <p className="text-3xl font-bold">{averageCorrectness}</p>
                    </div>
                </div>
            </div>

            {loading && <p className="text-center text-gray-400">Loading interview data...</p>}
            {error && <p className="text-center text-red-500 flex items-center justify-center"><XCircle className="mr-2" />{error}</p>}

            {!loading && !error && (
                <div className="mt-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-200 mb-6 flex items-center">
                        <FileText className="mr-2 text-blue-400" size={28} /> All Interview Records
                    </h2>
                    {interviews.length > 0 ? (
                        <InterviewList interviews={interviews} onRowClick={handleViewDetails} /> 
                    ) : (
                        <p className="text-gray-500 text-lg text-center p-4 bg-gray-800 rounded-lg shadow-inner border border-gray-700">No interviews found yet. Schedule one to see it here!</p>
                    )}
                </div>
            )}

            {selectedInterview && (
                <InterviewDetailsModal
                    interview={selectedInterview}
                    onClose={() => setSelectedInterview(null)}
                />
            )}
        </div>
    );
}

export default AdminDashboard;
