const RelayClient = require('./src/client/RelayClient');

/**
 * A high-level function to connect to a RelayServer.
 * @param {string} url - The WebSocket URL to connect to.
 * @returns {RelayClient} The client instance.
 */
function connect(url) {
    return new RelayClient(url);
}

/**
 * A high-level wrapper to run the entire browser chat example.
 * @param {object} elementIds - The IDs of the HTML elements to bind to.
 */
function runChatClient(elementIds) {
    const { urlInput, connectBtn, status, messages, form, messageInput } = elementIds;

    const urlEl = document.getElementById(urlInput);
    const connectEl = document.getElementById(connectBtn);
    const statusEl = document.getElementById(status);
    const messagesEl = document.getElementById(messages);
    const formEl = document.getElementById(form);
    const messageEl = document.getElementById(messageInput);

    let client;

    const setStatus = (text, color) => {
        statusEl.textContent = `Status: ${text}`;
        statusEl.style.borderColor = color;
    };

    const addMessage = (text) => {
        messagesEl.innerHTML += `<li>${text}</li>`;
        messagesEl.scrollTop = messagesEl.scrollHeight;
    };

    const formatMessage = (data) => {
        switch (data.type) {
            case 'welcome': return `SYSTEM: ${data.message}`;
            case 'presence': return `SYSTEM: Client ${data.id.substring(0, 8)}... went ${data.status}`;
            case 'announcement': return `ANNOUNCEMENT: ${data.message}`;
            case 'message': return `MSG from ${data.from.substring(0, 8)}...: ${JSON.stringify(data.payload)}`;
            default: return `RECEIVED: ${JSON.stringify(data)}`;
        }
    };

    const connectToServer = () => {
        if (client) client.close();
        client = connect(urlEl.value);
        setStatus('Connecting...', '#ffc107');

        client.on('open', () => {
            setStatus('Connected', '#28a745');
            messageEl.disabled = false;
            connectEl.textContent = 'Disconnect';
        });

        client.on('close', () => {
            setStatus('Disconnected', '#dc3545');
            messageEl.disabled = true;
            connectEl.textContent = 'Connect';
        });

        client.on('error', () => setStatus('Error', '#dc3545'));
        client.on('message', (data) => addMessage(formatMessage(data)));
    };

    connectEl.addEventListener('click', connectToServer);
    formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        if (messageEl.value && client) {
            client.send({ text: messageEl.value });
            addMessage(`YOU SENT: ${messageEl.value}`);
            messageEl.value = '';
        }
    });

    setStatus('Ready', '#6c757d');
}

// UMD pattern for browser compatibility
if (typeof module === 'object' && module.exports) {
    module.exports = { connect, RelayClient, runChatClient };
} else {
    window.NodeRelay = { connect, RelayClient, runChatClient };
}