// frontend/src/components/LoadingSpinner.js
import React from 'react';

function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative w-12 h-12">
                <div className="absolute w-full h-full rounded-full border-4 border-dashed border-blue-500 animate-spin-slow"></div>
                <div className="absolute w-full h-full rounded-full border-4 border-dashed border-purple-500 animate-spin-reverse-slow"></div>
            </div>
            <p className="text-blue-300 text-lg font-medium animate-pulse">Processing...</p>
        </div>
    );
}

export default LoadingSpinner;
