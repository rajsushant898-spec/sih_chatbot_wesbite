// server.js

// Import necessary modules
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

// Load environment variables from .env file

// Load the local knowledge base JSON file
const knowledgeBase = require('./knowledge_base.json');

// Initialize the Express application
const app = express();
const PORT = 3000; // Use environment variable for port or default to 3000
const API_KEY = 'AIzaSyBtdEmUPAvrWp8CYDCF7beKGRZ0gN4VFVA'; // Get the API key from environment variables

// --- Middleware Setup ---
// Serve static files from the root directory. This makes all HTML, CSS, and JS files accessible.
app.use(express.static(path.join(__dirname, '')));

// Enable parsing of JSON body in POST requests
app.use(express.json());

// Enable Cross-Origin Resource Sharing for API requests from the frontend
app.use(cors());


// --- Frontend Page Routes ---
// These routes serve the main HTML pages of the website.
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


// --- Chatbot API Endpoint ---
// This is the core endpoint that handles chat requests and communicates with the Gemini API.
app.post('/api/chat', async (req, res) => {
    // Destructure message and language from the request body
    const { message, language } = req.body;
    const userMessage = message.toLowerCase().trim();

    // First, check the local knowledge base for a direct answer
    const kb = knowledgeBase[language] || knowledgeBase['en'];
    if (kb[userMessage]) {
        // Return a pre-defined response with a safety disclaimer
        return res.json({ text: kb[userMessage] + " Disclaimer: I am an AI assistant and not a medical professional. For any health concerns, please consult a qualified doctor." });
    }

    // If no match in the knowledge base, use the Gemini API
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

    try {
        // Construct a detailed prompt to guide the AI's behavior
        const prompt = `
            You are a multilingual AI health assistant named HealthBot, specifically designed to help rural and semi-urban populations in India. Your goal is to provide reliable, simple, and empathetic health information.

            **Your Core Functions:**
            1.  **Symptom Checker:** Ask clarifying questions to understand a user's symptoms. Based on the symptoms, provide general, non-diagnostic information about common diseases. **DO NOT** provide a diagnosis or recommend specific treatments. Always advise the user to consult a doctor for a professional diagnosis.
            2.  **Preventive Healthcare:** Offer advice on disease prevention, hygiene, and nutrition.
            3.  **Vaccination Schedules:** Provide general information on vaccination schedules for children and adults, as per the national health guidelines.
            4.  **Real-time Health Alerts:** Share information about public health advisories or disease outbreaks.

            **Your Persona and Tone:**
            * **Language:** Respond in the same language as the user (${language === 'hi' ? 'Hindi' : 'English'}).
            * **Tone:** Be friendly, empathetic, and respectful. Use simple language that is easy for a non-technical audience to understand. Avoid medical jargon.
            * **Safety:** Always include a disclaimer at the end of every health-related response, such as "Disclaimer: I am an AI assistant and not a medical professional. For any health concerns, please consult a qualified doctor."
            
            **Important Rule:** Never diagnose, prescribe medication, or offer specific medical treatment advice. Your purpose is to educate and inform, not to replace a medical professional.

            Here is the user's message: "${message}"
        `;
        
        // Make the POST request to the Gemini API
        const response = await axios.post(apiUrl, {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }]
        });

        // The Fix: Extract the AI's response text and send it back to the client
        const botResponse = response.data.candidates[0].content.parts[0].text;
        res.json({ text: botResponse });

    } catch (error) {
        // Handle API errors gracefully
        console.error("Error calling Gemini API:", error.response?.data || error.message);
        res.status(500).json({ error: 'An error occurred. Could not get a response from the AI. Please try again later.' });
    }
});

// --- Server Startup ---
// Start the server and listen on the specified port.
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});