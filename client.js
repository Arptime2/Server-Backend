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
    }

    // --- High-Level API Functions (private to this closure) ---
    function connect(url) {
        return new RelayClient(url);
    }

    function runChatClient(elementIds) {
        const { urlInput, connectBtn, status, messages, form, messageInput } = elementIds;
        const urlEl = document.getElementById(urlInput);
        const connectEl = document.getElementById(connectBtn);
        const statusEl = document.getElementById(status);
        const messagesEl = document.getElementById(messages);
        const formEl = document.getElementById(form);
        const messageEl = document.getElementById(messageInput);
        let client;

        const setStatus = (text, color) => { statusEl.textContent = `Status: ${text}`; statusEl.style.borderColor = color; };
        const addMessage = (text) => { messagesEl.innerHTML += `<li>${text}</li>`; messagesEl.scrollTop = messagesEl.scrollHeight; };
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
            client.on('open', () => { setStatus('Connected', '#28a745'); messageEl.disabled = false; connectEl.textContent = 'Disconnect'; });
            client.on('close', () => { setStatus('Disconnected', '#dc3545'); messageEl.disabled = true; connectEl.textContent = 'Connect'; });
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

    // --- Expose the Public API ---
    // This is the *only* object that will be added to the global `window`.
    window.NodeRelay = {
        connect,
        runChatClient,
        RelayClient
    };

})(); // Immediately invoke the function to create the closure.