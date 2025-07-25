/**
 * This is the browser-ready, dependency-free client library for Node-Relay.
 * It is wrapped in a closure to prevent polluting the global namespace.
 */

(function() {
    // --- Core RelayClient Class (private to this closure) ---
    class RelayClient {
        constructor(url) {
            this.socket = new WebSocket(url);
            this.listeners = {};

            this.socket.onopen = () => this.emit('open');
            this.socket.onclose = () => this.emit('close');
            this.socket.onerror = (error) => this.emit('error', error);
            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.emit('message', data);
                } catch (e) {
                    this.emit('message', event.data);
                }
            };
        }

        on(eventName, callback) {
            if (!this.listeners[eventName]) {
                this.listeners[eventName] = [];
            }
            this.listeners[eventName].push(callback);
        }

        emit(eventName, data) {
            if (this.listeners[eventName]) {
                this.listeners[eventName].forEach(callback => callback(data));
            }
        }

        send(data) {
            if (this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify(data));
            } else {
                console.error('RelayClient: WebSocket is not open.');
            }
        }

        close() {
            this.socket.close();
        }

        /**
         * Sends a direct message to another client via the server.
         * @param {string} targetId - The ID of the client to send the message to.
         * @param {object} data - The data payload to send.
         */
        sendTo(targetId, data) {
            this.send({
                type: 'direct_message',
                targetId: targetId,
                payload: data
            });
        }
    }

    // --- High-Level API Functions (private to this closure) ---
    function connect(url) {
        return new RelayClient(url);
    }

    function runChatClient(elementIds) {
        const { urlInput, connectBtn, status, messages, form, messageInput, targetIdInput } = elementIds;
        const urlEl = document.getElementById(urlInput);
        const connectEl = document.getElementById(connectBtn);
        const statusEl = document.getElementById(status);
        const messagesEl = document.getElementById(messages);
        const formEl = document.getElementById(form);
        const messageEl = document.getElementById(messageInput);
        const targetIdEl = document.getElementById(targetIdInput); // Get the new target ID input
        let client;

        const setStatus = (text, color) => { statusEl.textContent = `Status: ${text}`; statusEl.style.borderColor = color; };
        const addMessage = (text) => { messagesEl.innerHTML += `<li>${text}</li>`; messagesEl.scrollTop = messagesEl.scrollHeight; };
        const formatMessage = (data) => {
            switch (data.type) {
                case 'welcome': return `SYSTEM: ${data.message}`;
                case 'presence': return `SYSTEM: Client ${data.id.substring(0, 8)}... went ${data.status}`;
                case 'announcement': return `ANNOUNCEMENT: ${data.message}`;
                case 'direct_message': return `DM from ${data.from.substring(0, 8)}...: ${data.payload.text}`;
                case 'message': 
                    // Check for a .text property in the payload for cleaner display
                    if (data.payload && typeof data.payload === 'object' && data.payload.text) {
                        return `MSG from ${data.from.substring(0, 8)}...: ${data.payload.text}`;
                    }
                    // Fallback for other structures
                    return `MSG from ${data.from.substring(0, 8)}...: ${JSON.stringify(data.payload)}`;
                default: return `RECEIVED: ${JSON.stringify(data)}`;
            }
        };

        const connectToServer = () => {
            if (client) client.close();
            client = connect(urlEl.value);
            setStatus('Connecting...', '#ffc107');
            client.on('open', () => { setStatus('Connected', '#28a745'); messageEl.disabled = false; formEl.querySelector('button').disabled = false; connectEl.textContent = 'Disconnect'; });
            client.on('close', () => { setStatus('Disconnected', '#dc3545'); messageEl.disabled = true; connectEl.textContent = 'Connect'; });
            client.on('error', () => setStatus('Error', '#dc3545'));
            client.on('message', (data) => addMessage(formatMessage(data)));
        };

        connectEl.addEventListener('click', connectToServer);
        formEl.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!messageEl.value || !client) return;

            const targetId = targetIdEl.value.trim();
            const message = { text: messageEl.value };

            if (targetId) {
                // Use the new sendTo function for direct messages
                client.sendTo(targetId, message);
                addMessage(`YOU (to ${targetId.substring(0, 8)}...): ${message.text}`);
            } else {
                // Fallback to a normal (broadcasted) message
                client.send(message);
                addMessage(`YOU (broadcast): ${message.text}`);
            }
            messageEl.value = '';
        });
        setStatus('Ready', '#6c757d');
    }

    // --- Expose the Public API ---
    // This is the *only* object that will be added to the global `window`.
    window.NodeRelay = {
        connect,
        runChatClient,
        RelayClient
    };

})(); // Immediately invoke the function to create the closure.