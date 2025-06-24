// backend/src/services/elevenlabsService.js
const fetch = require('node-fetch').default; // FIXED: Access .default export for node-fetch v3+

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech/';
const VOICE_ID = 'ZT9u07TYPVl83ejeLakq'; // *** CRITICAL: REPLACE THIS WITH YOUR VALID ELEVEN LABS VOICE ID ***

/**
 * Converts text to speech using Eleven Labs and returns the audio URL.
 * @param {string} text - The text to convert to speech.
 * @returns {Promise<string>} URL of the generated audio.
 */
exports.generateSpeech = async (text) => {
    try {
        if (!VOICE_ID || VOICE_ID === 'ZT9u07TYPVl83ejeLakq') {
            throw new Error("Eleven Labs VOICE_ID is not set. Please update backend/src/services/elevenlabsService.js");
        }
        console.log(`Sending text to Eleven Labs for speech generation: "${text}" with Voice ID: ${VOICE_ID}`);
        const response = await fetch(`${ELEVENLABS_API_URL}${VOICE_ID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY
            },
            body: JSON.stringify({
                text: text,
                model_id: "eleven_monolingual_v1", // Or "eleven_multilingual_v2"
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Eleven Labs API Error Response:', errorText);
            throw new Error(`Eleven Labs API error: ${response.status} - ${errorText}`);
        }

        const audioBuffer = await response.arrayBuffer();
        const base64Audio = Buffer.from(audioBuffer).toString('base64');
        return `data:audio/mpeg;base64,${base64Audio}`;

    } catch (error) {
        console.error('Error generating Eleven Labs speech:', error);
        throw new Error('Failed to generate speech audio: ' + error.message);
    }
};
