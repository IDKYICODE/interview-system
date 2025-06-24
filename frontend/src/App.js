// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import InterviewRoom from './components/InterviewRoom';
import AdminDashboard from './components/Admin/AdminDashboard'; // New: AdminDashboard
import CandidateLogin from './components/Auth/CandidateLogin'; // New: CandidateLogin
import AdminLogin from './components/Auth/AdminLogin'; // New: AdminLogin
import { useAuth } from './utils/auth';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const { token, userRole, login, logout } = useAuth(); // Access auth context, now including userRole

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const handleLoginSuccess = (newToken, userData) => {
    login(newToken, userData); // Pass user data to AuthProvider
    if (userData.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate(`/interview/${userData.id}`); // For candidate, navigate to their interview
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderContent = () => {
    // Determine which login page to show based on path
    if (currentPath === '/' || currentPath === '/candidate-login') {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
            <h1 className="text-4xl font-extrabold text-center text-blue-400 mb-8">Candidate Login</h1>
            <CandidateLogin onLoginSuccess={handleLoginSuccess} />
            <p className="mt-8 text-center text-gray-400 text-lg">
                Are you an admin? <button onClick={() => navigate('/admin-login')} className="text-green-400 hover:text-green-300 transition-colors duration-200 font-semibold underline ml-1">Login here</button>.
            </p>
          </div>
        </div>
      );
    } else if (currentPath === '/admin-login') {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
            <h1 className="text-4xl font-extrabold text-center text-green-400 mb-8">Admin Login</h1>
            <AdminLogin onLoginSuccess={handleLoginSuccess} />
            <p className="mt-8 text-center text-gray-400 text-lg">
                Are you a candidate? <button onClick={() => navigate('/')} className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-semibold underline ml-1">Login here</button>.
            </p>
          </div>
        </div>
      );
    } else if (currentPath.startsWith('/interview/')) {
      const interviewId = currentPath.split('/interview/')[1];
      // Only allow candidate role to access interview room
      if (!token || userRole !== 'candidate') {
        alert("Access Denied: Please login as a candidate to access interviews.");
        navigate('/'); // Redirect to candidate login
        return null;
      }
      return <InterviewRoom interviewId={interviewId} onLogout={handleLogout} token={token} />;
    } else if (currentPath.startsWith('/admin/dashboard')) {
      // Only allow admin role to access admin dashboard
      if (!token || userRole !== 'admin') {
        alert("Access Denied: Please login as an admin to access the dashboard.");
        navigate('/admin-login'); // Redirect to admin login
        return null;
      }
      return <AdminDashboard onLogout={handleLogout} token={token} />;
    } else {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
          <div className="bg-gray-800 p-8 rounded-xl shadow-2xl text-center w-full max-w-md border border-gray-700">
            <h1 className="text-4xl font-extrabold text-red-500 mb-6">404 - Page Not Found</h1>
            <p className="text-lg text-gray-300 mb-8">The page you're looking for does not exist.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }
  };

  // The root div for the entire application is now handled within renderContent
  return <>{renderContent()}</>;
}

export default App;