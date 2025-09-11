// --- Lógica del Chatbot ---
document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos HTML del chat
    const chatBubble = document.getElementById('chat-bubble');
    const chatWindow = document.getElementById('chat-window');
    const chatBody = document.getElementById('chat-body');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-btn'); 
    
    
    if (!chatBubble || !chatWindow || !chatBody || !chatInput || !sendButton) {
        console.error("No se encontraron los elementos del chatbot. Verifica los IDs en tu HTML.");
        return;
    }

    let sessionId = null;
    
    
    const MAKE_WEBHOOK_URL = 'https://hook.us2.make.com/yo3lxdan5fg8lcxo7olw6yr89fh27ht4'; 

    // Evento para abrir y cerrar la ventana de chat
    chatBubble.addEventListener('click', () => {
        chatWindow.classList.toggle('open');
        
        if (chatWindow.classList.contains('open') && chatBody.children.length === 0) {
            sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
            const greeting = "Hello! I'm Alex, your virtual assistant. How can I help you today?";
            addMessageToUI(greeting, 'bot-message');
        }
    });

    //Función unificada para manejar el envío de mensajes
    const handleSendMessage = () => {
        const message = chatInput.value.trim();
        if (message !== '') {
            sendMessage(message);
        }
    };

    // Evento para el botón de enviar
    sendButton.addEventListener('click', handleSendMessage);

    // Evento para la tecla "Enter"
    chatInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    });
    
    function sendMessage(message) {
        if (MAKE_WEBHOOK_URL.includes('PEGA_AQUÍ')) {
            updateLastBotMessage('Error: La URL del webhook no ha sido configurada en el archivo script.js.');
            const indicator = document.getElementById('typing-indicator');
            if(indicator) indicator.remove();
            return;
        }

        addMessageToUI(message, 'user-message');
        chatInput.value = '';
        addMessageToUI('...', 'bot-message', true);

        const payload = {
            pregunta: message,
            session_id: sessionId 
        };

        fetch(MAKE_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error de conexión: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            updateLastBotMessage(data.respuesta || 'Lo siento, no pude procesar la respuesta.');
        })
        .catch(error => {
            console.error('Error detallado en fetch:', error);
            updateLastBotMessage('Lo siento, ocurrió un error de conexión. Inténtalo de nuevo.');
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
