// server.js
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch'); // Required to make the API call

const app = express();
const PORT = 3000;
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

// Middleware to allow your extension (running on a different port) to access the server
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allows all origins for simple local testing
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// The secure endpoint that generates a one-time Access Token
app.post('/api/heygen-token', async (req, res) => {
    if (!HEYGEN_API_KEY) {
        return res.status(500).json({ error: 'HEYGEN_API_KEY is not set in .env file.' });
    }

    try {
        // 1. Call HeyGen API with your secret key (server-side)
        const response = await fetch('https://api.heygen.com/v1/streaming.create_token', {
            method: 'POST',
            headers: { 'x-api-key': HEYGEN_API_KEY }
        });
        
        const data = await response.json();

        if (data.status === 'ok' && data.data && data.data.token) {
            // 2. Send ONLY the secure, temporary Access Token back to the client
            res.json({ accessToken: data.data.token });
        } else {
            console.error('HeyGen API Error:', data);
            res.status(500).json({ error: 'Failed to generate token from HeyGen.', details: data });
        }

    } catch (error) {
        console.error('Server error during token creation:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.listen(PORT, () => {
    console.log(`Token Generator Server running on http://localhost:${PORT}`);
});