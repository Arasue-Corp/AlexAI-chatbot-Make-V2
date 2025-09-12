// --- Lógica chatbot ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Referencias a los elementos HTML del chat
    const chatBubble = document.getElementById('chat-bubble');
    const chatWindow = document.getElementById('chat-window');
    const chatBody = document.getElementById('chat-body');
    const chatInput = document.getElementById('chat-input');
    
    if (!chatBubble || !chatWindow || !chatBody || !chatInput) {
        console.error("Error: One or more required chatbot elements are missing from the HTML.");
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
        if (MAKE_WEBHOOK_URL.includes('PEGA_AQUÍ')) {
            addMessageToUI('Error: The Webhook URL has not been configured in the script.', 'bot-message');
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
            return response.text();
        })
        .then(text => {
            let content = text; // Por defecto, la respuesta es el texto completo.
            try {
                // Se intenta analizar el texto como JSON.
                const data = JSON.parse(text);
                // Si tiene éxito Y contiene la clave "respuesta", se extrae solo el mensaje.
                if (data && data.respuesta) {
                    content = data.respuesta;
                }
            } catch (e) {
                // Si no es un JSON válido (como la respuesta "Accepted"), no se hace nada.
                // Se mostrará el texto tal cual, que es el comportamiento deseado.
            }
            updateLastBotMessage(content);
        })
        .catch(error => {
            console.error('Error in fetch:', error);
            updateLastBotMessage(`Sorry, an error occurred. ${error.message}`);
        });
    }

    /**
     * Convierte texto simple con formato Markdown a HTML para mostrarlo correctamente.
     * @param {string} text - El texto a formatear.
     * @returns {string} - El texto convertido a HTML.
     */
    function formatMarkdownToHTML(text) {
        let safeText = String(text || '');

        // Reemplaza elementos de Markdown a HTML en un orden lógico
        safeText = safeText
            // Encabezados (### -> <h3>)
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            // Regla horizontal (---)
            .replace(/^---$/gim, '<hr>')
            // Enlaces ([texto](url))
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            // Negrita (**texto**)
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Cursiva (*texto*)
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Listas (convierte "- item" a un punto)
            .replace(/^\s*-\s/gm, '&bull; ')
            // Finalmente, convierte saltos de línea a <br>
            .replace(/\n/g, '<br>');
        
        return safeText;
    }
    
    function addMessageToUI(text, className, isTyping = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', className);
        
        // Se usa la nueva función de formato y .innerHTML para renderizar el HTML
        if (className === 'bot-message') {
            messageDiv.innerHTML = formatMarkdownToHTML(text);
        } else {
            messageDiv.textContent = text; // Los mensajes del usuario no necesitan formato
        }

        if (isTyping) {
            messageDiv.id = 'typing-indicator';
        }
        chatBody.appendChild(messageDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function updateLastBotMessage(text) {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            // Se usa la nueva función de formato y .innerHTML
            typingIndicator.innerHTML = formatMarkdownToHTML(text);
            typingIndicator.id = '';
        } else {
            addMessageToUI(text, 'bot-message');
        }
    }
});

