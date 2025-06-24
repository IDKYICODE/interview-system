// frontend/src/components/Auth/AdminLogin.js
import React, { useState } from 'react';
import { Shield, User, Lock } from 'lucide-react'; // Import Lucide icons

function AdminLogin({ onLoginSuccess }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await fetch('/api/auth/login/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Admin login failed');
            }

            const data = await response.json();
            onLoginSuccess(data.token, data.user);

        } catch (err) {
            console.error('Admin login error:', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-6">
            {error && <p className="text-red-400 text-sm font-medium animate-pulse">{error}</p>}
            <div className="relative w-full max-w-sm">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Admin Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="pl-10 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-full text-white placeholder-gray-400 transition-all duration-200 focus:border-green-500 shadow-inner"
                    disabled={loading}
                />
            </div>
            <div className="relative w-full max-w-sm">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="password"
                    placeholder="Admin Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-full text-white placeholder-gray-400 transition-all duration-200 focus:border-green-500 shadow-inner"
                    disabled={loading}
                />
            </div>
            <button
                type="submit"
                className="w-full max-w-sm px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-green-700 hover:to-emerald-800 transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center group"
                disabled={loading}
            >
                {loading ? (
                    <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Logging In...
                    </span>
                ) : (
                    <>
                        <Shield className="mr-2 group-hover:rotate-6 transition-transform duration-200" size={20} /> Login as Admin
                    </>
                )}
            </button>
        </form>
    );
}

export default AdminLogin;
