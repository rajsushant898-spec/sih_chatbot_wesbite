document.addEventListener('DOMContentLoaded', () => {
    // Get all necessary HTML elements
    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const langSelect = document.getElementById('language-select');
    const typingIndicator = document.getElementById('typing-indicator');

    // The endpoint of your Node.js server
    const SERVER_URL = 'http://localhost:3000/api/chat';

    /**
     * Creates and appends a message to the chat window.
     * @param {string} message - The message text to display.
     * @param {string} sender - Who sent the message ('user' or 'bot').
     */
    function addMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);

        // **CRITICAL FIX**: Use marked.parse() to convert markdown to HTML.
        // This function is available because we included the marked.js script in the HTML.
        const parsedHtml = marked.parse(message);
        messageDiv.innerHTML = parsedHtml;
        
        // Insert the new message before the typing indicator
        chatWindow.insertBefore(messageDiv, typingIndicator);
        
        // Scroll to the bottom to see the latest message
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    /**
     * Sends the user's message to the backend and displays the response.
     * @param {string} userMessage - The message from the user.
     * @param {string} lang - The selected language ('en' or 'hi').
     */
    async function getBotResponse(userMessage, lang) {
        // Show the typing indicator before making the API call
        typingIndicator.style.display = 'flex';
        chatWindow.scrollTop = chatWindow.scrollHeight;

        try {
            const response = await fetch(SERVER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    language: lang
                }),
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }

            const data = await response.json();
            addMessage(data.text, 'bot');

        } catch (error) {
            console.error("Error communicating with server:", error);
            addMessage("I'm having trouble connecting to my brain right now. Please try again in a moment.", 'bot');
        } finally {
            // **CRITICAL FIX**: Always hide the indicator after the request is complete
            typingIndicator.style.display = 'none';
        }
    }

    /**
     * A handler function to process sending a message.
     */
    function sendMessage() {
        const userMessage = userInput.value.trim();
        if (userMessage === '') return; // Don't send empty messages

        const selectedLang = langSelect.value;
        addMessage(userMessage, 'user');
        userInput.value = ''; // Clear the input field
        getBotResponse(userMessage, selectedLang);
    }

    // --- Event Listeners ---
    sendBtn.addEventListener('click', sendMessage);

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Add the initial welcome message when the page loads
    addMessage("Hello! I'm your personal health assistant. How can I help you today?", 'bot');
});