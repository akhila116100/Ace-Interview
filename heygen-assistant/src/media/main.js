// media/main.js
const { StreamingAvatar } = require('@heygen/streaming-avatar');

// NOTE: You need to replace this with a Public Avatar ID from HeyGen Labs
// Using a random public ID for demonstration:
const AVATAR_ID = 'fe42398511a547fa9b27cc366e4a2e5d'; // Replace with a valid public Avatar ID
const TOKEN_SERVER_URL = 'http://localhost:3000/api/heygen-token'; 

let streamingAvatar = null;
const videoElement = document.getElementById('avatarVideo');
const startButton = document.getElementById('start-button');
const talkButton = document.getElementById('talk-button');
const scriptInput = document.getElementById('script-input');
const statusDiv = document.getElementById('status');

// --- Helper Functions ---

function updateStatus(message) {
    statusDiv.textContent = `Status: ${message}`;
}

// --- Main Logic ---

async function getToken() {
    updateStatus('Requesting access token...');
    try {
        const response = await fetch(TOKEN_SERVER_URL, { method: 'POST' });
        const data = await response.json();
        
        if (data.accessToken) {
            updateStatus('Token received. Ready to stream.');
            return data.accessToken;
        } else {
            throw new Error(data.error || 'Token server failed.');
        }
    } catch (e) {
        console.error('Error fetching token:', e);
        updateStatus('ERROR: Could not get token. Is server.js running?');
        return null;
    }
}

async function startSession() {
    const accessToken = await getToken();
    if (!accessToken) return;

    try {
        updateStatus('Starting avatar session...');
        
        // 1. Initialize the SDK with the secure, one-time Access Token
        streamingAvatar = new StreamingAvatar({ token: accessToken });
        
        // 2. Create and start the session
        const sessionInfo = await streamingAvatar.createStartAvatar({
            avatarId: AVATAR_ID,
            quality: 'low', // Use 'low' quality to save credits and bandwidth
        });

        // 3. Bind the video element to the stream
        streamingAvatar.bindVideoElement(videoElement);

        updateStatus('Session started. Avatar is ready.');
        startButton.disabled = true;
        talkButton.disabled = false;

        // Automatically send the first script
        await talk();

        // Implement a safeguard to close the session and save credits after 5 minutes (approx 1 credit)
        setTimeout(() => {
            if (streamingAvatar) {
                streamingAvatar.stopSession();
                updateStatus('Session automatically closed to save free API credits.');
                startButton.disabled = false;
                talkButton.disabled = true;
            }
        }, 5 * 60 * 1000); // 5 minutes
        

    } catch (error) {
        console.error('Error starting session:', error);
        updateStatus(`FATAL ERROR: ${error.message}. Check console.`);
        startButton.disabled = false;
        talkButton.disabled = true;
    }
}

async function talk() {
    if (!streamingAvatar || !scriptInput.value) return;

    updateStatus('Avatar is speaking...');
    talkButton.disabled = true;

    try {
        await streamingAvatar.speak({ 
            text: scriptInput.value,
            // A simple voice ID that supports interactive avatar streaming
            voiceId: "244342a3465b4c1aa57c5a085d775191", 
            task_type: 'TALK'
        });
        
        updateStatus('Avatar finished speaking. Ready for the next question.');

    } catch (error) {
        console.error('Error during speak command:', error);
        updateStatus(`Speak Error: ${error.message}`);
    } finally {
        talkButton.disabled = false;
    }
}

// --- Event Listeners ---

startButton.addEventListener('click', startSession);
talkButton.addEventListener('click', talk);
scriptInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        talk();
    }
});