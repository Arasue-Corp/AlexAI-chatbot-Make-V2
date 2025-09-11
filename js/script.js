// --- Lógica chatbot ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Referencias a los elementos HTML del chat
    const chatBubble = document.getElementById('chat-bubble');
    const chatWindow = document.getElementById('chat-window');
    const chatBody = document.getElementById('chat-body');
    const chatInput = document.getElementById('chat-input');
    
    // Confirma que todos los elementos existen antes de continuar
    if (!chatBubble || !chatWindow || !chatBody || !chatInput) {
        console.error("Error: One or more required chatbot elements are missing from the HTML.");
        return; 
    }

    let sessionId = null;
    
    const MAKE_WEBHOOK_URL = 'https://hook.us2.make.com/fi2p7b6oeav10euxb5fpk6eakqv7teeu'; 
    
    const MI_TOKEN_SECRETO = 'Bearer Alex-ai-2025';

    // 2. Lógica de Eventos
    // Abrir/cerrar la ventana del chat
    chatBubble.addEventListener('click', () => {
        chatWindow.classList.toggle('open');
        
        // Si se abre por primera vez, inicia la sesión y muestra el saludo
        if (chatWindow.classList.contains('open') && chatBody.children.length === 0) {
            sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
            const greeting = "Hello! I'm Alex, your virtual assistant. How can I help you today?";
            addMessageToUI(greeting, 'bot-message');
        }
    });

    // Enviar mensaje al presionar "Enter"
    chatInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const message = chatInput.value.trim();
            if (message !== '') {
                sendMessage(message);
            }
        }
    });

    // 3. Funciones del Chatbot
    function sendMessage(message) {
        // Verificación de seguridad para asegurar que la URL fue configurada
        if (MAKE_WEBHOOK_URL.includes('PEGA_AQUÍ')) {
            addMessageToUI('Error: The Webhook URL has not been configured in the script.', 'bot-message');
            return;
        }

        // Añade el mensaje del usuario a la UI y muestra el indicador de "escribiendo"
        addMessageToUI(message, 'user-message');
        chatInput.value = '';
        addMessageToUI('...', 'bot-message', true);

        const payload = { pregunta: message, session_id: sessionId };

        // Petición al webhook de Make.com
        fetch(MAKE_WEBHOOK_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                // Se añade la cabecera de autorización para la seguridad
                'Authorization': MI_TOKEN_SECRETO 
            },
            body: JSON.stringify(payload),
        })
        .then(response => {
            if (response.status === 401) {
                 throw new Error('Unauthorized - Incorrect token.');
            }
            if (!response.ok) {
                throw new Error(`Connection error: ${response.status}`);
            }
            // Obtenemos la respuesta como texto para manejar errores de JSON de forma segura
            return response.text();
        })
        .then(text => {
            try {
                // Se intenta convertir el texto a JSON
                const data = JSON.parse(text);
                updateLastBotMessage(data.respuesta || 'Sorry, I received an invalid response format.');
            } catch (e) {
                // Si falla, la respuesta no era JSON. Se muestra el texto directamente (como "Accepted").
                updateLastBotMessage(text);
            }
        })
        .catch(error => {
            console.error('Error in fetch:', error);
            updateLastBotMessage(`Sorry, an error occurred. ${error.message}`);
        });
    }
    
    // Añade un nuevo mensaje a la ventana del chat
    function addMessageToUI(text, className, isTyping = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', className);
        messageDiv.textContent = text;
        if (isTyping) {
            messageDiv.id = 'typing-indicator';
        }
        chatBody.appendChild(messageDiv);
        chatBody.scrollTop = chatBody.scrollHeight; // Auto-scroll
    }

    // Reemplaza el indicador "..." con la respuesta final del bot
    function updateLastBotMessage(text) {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.textContent = text;
            typingIndicator.id = ''; // Se limpia el ID para la siguiente respuesta
        } else {
            addMessageToUI(text, 'bot-message');
        }
    }
});

