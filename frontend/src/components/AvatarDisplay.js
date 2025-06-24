// frontend/src/components/AvatarDisplay.js
import React from 'react';
import { UserCircle2 } from 'lucide-react'; // Import Lucide icon

function AvatarDisplay({ videoUrl }) {
    return (
        <div className="w-64 h-64 md:w-80 md:h-80 bg-gray-700 rounded-full overflow-hidden shadow-2xl flex items-center justify-center border-4 border-blue-500 animate-fade-in">
            {videoUrl ? (
                <video
                    src={videoUrl}
                    controls={false}
                    autoPlay
                    loop={false}
                    muted={false}
                    className="w-full h-full object-cover rounded-full" // object-cover to fill, rounded-full to match container
                    onError={(e) => {
                        console.error("Error loading video:", e);
                        // Fallback to placeholder if video fails
                        e.target.src = ''; // Clear src to stop trying
                        e.target.parentNode.innerHTML = `
                            <div class="text-gray-400 text-center p-4">
                                <svg class="mx-auto h-16 w-16 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2A9 9 0 111 12a9 9 0 0118 0z" />
                                </svg>
                                <p class="mt-2 text-lg">Video Failed to Load</p>
                                <p class="text-sm">Check API keys or voice/avatar IDs.</p>
                            </div>
                        `;
                    }}
                >
                    Your browser does not support the video tag.
                </video>
            ) : (
                <div className="text-gray-400 text-center p-4 flex flex-col items-center justify-center">
                    <UserCircle2 className="mx-auto h-24 w-24 text-gray-500 mb-2" />
                    <p className="mt-2 text-lg font-medium">AI Interviewer Avatar</p>
                    <p className="text-sm text-gray-500">Video will appear here.</p>
                </div>
            )}
        </div>
    );
}

export default AvatarDisplay;
