// backend/src/services/heygenService.js
const fetch = require('node-fetch').default; // Access .default export for node-fetch v3+

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const HEYGEN_API_URL = 'https://api.heygen.com/v1/video'; // Example HeyGen API endpoint for video generation

/**
 * Generates a video from text using HeyGen.
 * NOTE: HeyGen API typically creates videos asynchronously and provides a URL.
 * This is a simplified example. Real-time streaming would require more advanced HeyGen features.
 * @param {string} text - The text for the AI avatar to speak.
 * @returns {Promise<string>} URL of the generated video.
 */
exports.generateAvatarVideo = async (text) => {
    try {
        if (!process.env.HEYGEN_API_KEY) {
            throw new Error("HeyGen API Key is not set in .env file.");
        }
        // CRITICAL: Replace "YOUR_HEYGEN_VOICE_ID" with a valid HeyGen voice ID from your account.
        // Also, you might need a specific avatar ID depending on your HeyGen plan/setup.
        const HEYGEN_VOICE_ID = "YOUR_HEYGEN_VOICE_ID_HERE"; // *** CRITICAL: REPLACE THIS WITH YOUR VALID HEYGEN VOICE ID ***
        const HEYGEN_AVATAR_ID = "e0e84faea390465896db75a83be45085"; // *** OPTIONAL: REPLACE WITH A VALID HEYGEN AVATAR ID IF NEEDED ***


        if (HEYGEN_VOICE_ID === "YOUR_HEYGEN_VOICE_ID_HERE") {
             throw new Error("HeyGen VOICE_ID is not set. Please update backend/src/services/heygenService.js");
        }
        console.log(`Sending text to HeyGen for video generation: "${text}" with Voice ID: ${HEYGEN_VOICE_ID}`);

        const payload = {
            "caption_enabled": false,
            "clip_mode": "casual",
            "test": true, // Use test mode if available for initial testing
            "aspect_ratio": "16:9",
            "dimension": {
                "height": 1080,
                "width": 1920
            },
            // For HeyGen, you often specify an avatar ID, not a source_url for a png.
            // Check HeyGen docs for how to select your default or custom avatar.
            // If you have a specific avatar ID (e.g., from their Studio/API), use it:
            "avatar_id": HEYGEN_AVATAR_ID !== "Ye0e84faea390465896db75a83be45085" ? HEYGEN_AVATAR_ID : "default_avatar_id_from_heygen_docs", // Replace or use one from HeyGen docs
            "script": {
                "type": "text",
                "input": text,
                "voice_id": HEYGEN_VOICE_ID
            }
        };

        const response = await fetch(HEYGEN_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': HEYGEN_API_KEY
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('HeyGen API Error Response:', errorText);
            throw new Error(`HeyGen API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('HeyGen API Response (initial):', data);

        // HeyGen typically returns a video ID and requires polling for the final URL
        // For simplicity, we'll assume it directly gives a playable URL or a job ID.
        // In a real scenario, you'd poll their 'get video' status endpoint.
        await new Promise(resolve => setTimeout(resolve, 5000)); // Simulate processing time

        const mockVideoUrl = `https://d3elhdv73w076h.cloudfront.net/heygen-aws/uploads/video/84e4e9411dd7480e817e59f4f469950d-1718712791.mp4`; // Placeholder URL
        console.warn('HEYGEN INTEGRATION: Using a mock video URL. Replace with actual HeyGen video retrieval logic. This URL will only play if HeyGen actually generated the video to this specific URL.');
        return mockVideoUrl; // In production, this would be data.data.video_url after polling

    } catch (error) {
        console.error('Error generating HeyGen avatar video:', error);
        throw new Error('Failed to generate avatar video: ' + error.message);
    }
};
