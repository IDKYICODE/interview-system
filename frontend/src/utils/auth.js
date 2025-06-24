// frontend/src/utils/auth.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('interviewToken'));
    const [userRole, setUserRole] = useState(null); // New state for user role

    // Decode token on initial load or whenever token changes
    useEffect(() => {
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUserRole(decodedToken.role || null); // Extract role from token payload
            } catch (error) {
                console.error("Error decoding token:", error);
                setToken(null); // Invalidate token if decoding fails
                localStorage.removeItem('interviewToken');
                setUserRole(null);
            }
        } else {
            setUserRole(null);
        }
    }, [token]);

    const login = (newToken, userData) => {
        setToken(newToken);
        localStorage.setItem('interviewToken', newToken);
        setUserRole(userData.role || null); // Set role directly from login response
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem('interviewToken');
        setUserRole(null);
    };

    return (
        <AuthContext.Provider value={{ token, userRole, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
