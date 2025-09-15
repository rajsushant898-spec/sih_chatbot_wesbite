document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const langSelect = document.getElementById('language-select');
    
    // The endpoint of your Node.js server
    const SERVER_URL = 'http://localhost:3000/api/chat'; 

    // A simple, local knowledge base for quick, hardcoded responses
    const knowledgeBase = {
        'en': {
            'symptoms of dengue': 'Common symptoms of dengue fever include high fever, severe headache, and joint pain.',
            'vaccination schedule': 'Childhood vaccination schedules can vary. Please consult with a healthcare professional for the exact schedule.',
            'prevent dengue': 'To prevent dengue, remove stagnant water, use mosquito repellent, and wear long-sleeved clothing.',
            'hello': 'Hello there! How can I assist you with health information today?',
            'hi': 'Hi! I am here to help. What is your health query?',
            'thank you': 'You are welcome! Stay healthy!',
            'default': 'I am sorry, I do not have information on that. I can provide general health information, symptoms, and vaccination schedules. Please try asking in a different way.'
        },
        'hi': {
            'डेंगू के लक्षण': 'डेंगू बुखार के सामान्य लक्षणों में तेज बुखार, सिरदर्द, और जोड़ों में दर्द शामिल हैं।',
            'टीकाकरण': 'बच्चों के टीकाकरण की अनुसूची अलग-अलग हो सकती है। कृपया सही अनुसूची के लिए डॉक्टर से सलाह लें।',
            'डेंगू से बचाव': 'डेंगू से बचने के लिए, स्थिर पानी को हटा दें, मच्छर भगाने वाले उत्पाद का उपयोग करें, और पूरी आस्तीन वाले कपड़े पहनें।',
            'नमस्ते': 'नमस्ते! मैं आपकी व्यक्तिगत स्वास्थ्य सहायक हूँ। मैं आज आपकी कैसे मदद कर सकती हूँ?',
            'हाय': 'हाय! मैं यहाँ आपकी मदद के लिए हूँ। आपका स्वास्थ्य संबंधी प्रश्न क्या है?',
            'धन्यवाद': 'आपका स्वागत है! स्वस्थ रहें!',
            'default': 'मुझे इसके बारे में जानकारी नहीं है। मैं सामान्य स्वास्थ्य जानकारी, लक्षण, और टीकाकरण अनुसूची प्रदान कर सकती हूँ। कृपया किसी और तरीके से पूछें।'
        }
    };

    function addMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        messageDiv.textContent = message;
        chatWindow.appendChild(messageDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    async function getBotResponse(userMessage, lang) {
        const cleanedMessage = userMessage.toLowerCase().trim();
        const kb = knowledgeBase[lang] || knowledgeBase['en'];
        
        let botResponse = kb[cleanedMessage];

        // If a direct match is found in the local knowledge base, use it.
        if (botResponse) {
            addMessage(botResponse, 'bot');
            return;
        }

        // Otherwise, send the request to the backend server
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
                throw new Error(`Server error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            botResponse = data.text;
            addMessage(botResponse, 'bot');

        } catch (error) {
            console.error("Error communicating with server:", error);
            // Fallback to the default message from the local knowledge base if API fails.
            addMessage(kb['default'], 'bot');
        }
    }

    sendBtn.addEventListener('click', () => {
        const userMessage = userInput.value.trim();
        const selectedLang = langSelect.value;
        if (userMessage !== '') {
            addMessage(userMessage, 'user');
            userInput.value = '';
            getBotResponse(userMessage, selectedLang);
        }
    });

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendBtn.click();
        }
    });
});

