// --- Lógica del Chatbot ---
// Pega este código en tu archivo script.js o en un nuevo archivo JS.

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos HTML del chat
    const chatBubble = document.getElementById('chat-bubble');
    const chatWindow = document.getElementById('chat-window');
    const chatBody = document.getElementById('chat-body');
    const chatInput = document.getElementById('chat-input');
    
    // Verifica que todos los elementos necesarios existan
    if (!chatBubble || !chatWindow || !chatBody || !chatInput) {
        console.error("No se encontraron los elementos del chatbot. Verifica los IDs en tu HTML.");
        return;
    }

    let sessionId = null;
    
    // --- ¡ACCIÓN REQUERIDA! ---
    // Pega aquí la URL de tu webhook de Make.com que funciona en ReqBin.
    const MAKE_WEBHOOK_URL = 'https://hook.us2.make.com/yo3lxdan5fg8lcxo7olw6yr89fh27ht4'; 

    // Evento para abrir y cerrar la ventana de chat
    chatBubble.addEventListener('click', () => {
        chatWindow.classList.toggle('open');
        
        // Si el chat se abre por primera vez, genera un ID de sesión y muestra el saludo
        if (chatWindow.classList.contains('open') && chatBody.children.length === 0) {
            sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
            const greeting = "Hello! I'm Alex, your virtual assistant. How can I help you today?";
            addMessageToUI(greeting, 'bot-message');
        }
    });

    // Evento para enviar el mensaje cuando el usuario presiona "Enter"
    chatInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && chatInput.value.trim() !== '') {
            sendMessage(chatInput.value.trim());
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

