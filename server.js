require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path'); // Import the 'path' module

const app = express();
const PORT = 3000;
const API_KEY = 'AIzaSyBtdEmUPAvrWp8CYDCF7beKGRZ0gN4VFVA';

// Middleware to serve static files from the root and assets directory
app.use(express.static(path.join(__dirname, '')));
app.use(express.json());
app.use(cors());

// Define routes for each HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

app.get('/chatbot', (req, res) => {
    res.sendFile(path.join(__dirname, 'chatbot.html'));
});

// Chatbot API endpoint (unchanged from the previous response)
app.post('/api/chat', async (req, res) => {
    const { message, language } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required.' });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

    try {
        const prompt = `You are a multilingual AI health assistant for rural communities. The user has asked a health-related question in ${language === 'hi' ? 'Hindi' : 'English'}. Respond in the same language. Keep your answers simple, empathetic, and easy to understand for a non-technical audience. Provide information on preventive healthcare, disease symptoms, and vaccination schedules. If the user asks for a diagnosis or treatment, politely state that you are an AI and they must consult a doctor. Here is the user's message: ${message}`;
        
        const response = await axios.post(apiUrl, {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }]
        });

        const botResponse = response.data.candidates[0].content.parts[0].text;
        res.json({ text: botResponse });

    } catch (error) {
        console.error("Error calling Gemini API:", error.response?.data || error.message);
        res.status(500).json({ error: 'An error occurred while fetching the response from the AI model.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});