// --- Lógica del chatbot ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Referencias a los elementos HTML del chat
    const chatBubble = document.getElementById('chat-bubble');
    const chatWindow = document.getElementById('chat-window');
    const chatBody = document.getElementById('chat-body');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-btn');
    
    if (!chatBubble || !chatWindow || !chatBody || !chatInput || !sendButton) {
        console.error("Faltan uno o más elementos del chatbot en el HTML.");
        return; 
    }

    let sessionId = null;

    const MAKE_WEBHOOK_URL = 'https://hook.us2.make.com/fi2p7b6oeav10euxb5fpk6eakqv7teeu'; 

    const MI_TOKEN_SECRETO = 'Bearer Alex-ai-2025';

    // 2. Lógica de Eventos
    chatBubble.addEventListener('click', () => {
        chatWindow.classList.toggle('open');
        
        if (chatWindow.classList.contains('open') && chatBody.children.length === 0) {
            sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
            const greeting = "Hello! I'm Alex, your virtual assistant. How can I help you today?";
            addMessageToUI(greeting, 'bot-message');
        }
    });

    const handleSendMessage = () => {
        const message = chatInput.value.trim();
        if (message !== '') {
            sendMessage(message);
        }
    };

    sendButton.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    });

    // 3. Funciones del Chatbot
    function sendMessage(message) {
        if (MAKE_WEBHOOK_URL.includes('PEGA_AQUÍ')) {
            addMessageToUI('Error: Webhook URL is not configured in the script.', 'bot-message');
            return;
        }

        addMessageToUI(message, 'user-message');
        chatInput.value = '';
        addMessageToUI('...', 'bot-message', true);

        const payload = { pregunta: message, session_id: sessionId };

        fetch(MAKE_WEBHOOK_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                // Se añade la cabecera de autorización para seguridad
                'Authorization': MI_TOKEN_SECRETO 
            },
            body: JSON.stringify(payload),
        })
        .then(response => {
            if (response.status === 401) {
                 throw new Error('Unauthorized - Token incorrecto.');
            }
            if (!response.ok) {
                throw new Error(`Connection error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            updateLastBotMessage(data.respuesta || 'Sorry, I could not process the response.');
        })
        .catch(error => {
            console.error('Error in fetch:', error);
            updateLastBotMessage(`Sorry, an error occurred. ${error.message}`);
        });
    }
    
    function addMessageToUI(text, className, isTyping = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', className);
        messageDiv.textContent = text;
        if (isTyping) {
            messageDiv.id = 'typing-indicator';
        }
        chatBody.appendChild(messageDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function updateLastBotMessage(text) {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.textContent = text;
            typingIndicator.id = '';
        } else {
            addMessageToUI(text, 'bot-message');
        }
    }
});


