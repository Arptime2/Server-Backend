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
