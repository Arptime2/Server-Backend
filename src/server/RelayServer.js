const http = require('http');
const { EventEmitter } = require('events');
const { handleUpgrade, parseMessage, createFrame } = require('../core/WebSocketProtocol');
const crypto = require('crypto');

class RelayServer extends EventEmitter {
    constructor({ port, host }) {
        super();
        this.server = http.createServer((req, res) => {
            res.writeHead(426, { 'Content-Type': 'text/plain' });
            res.end('Upgrade required');
        });

        this.server.on('upgrade', (req, socket, head) => {
            handleUpgrade(req, socket, (ws) => {
                this.addClient(ws);
            });
        });

        this.clients = new Map();
        this.server.listen(port, host);
    }

    addClient(socket) {
        const clientId = crypto.randomBytes(16).toString('hex');
        this.clients.set(clientId, socket);

        const client = {
            id: clientId,
            socket: socket,
            send: (data) => this.send(socket, data)
        };

        this.emit('connection', client);

        socket.on('data', (buffer) => {
            const message = parseMessage(buffer);
            if (message) {
                this.emit('message', client, message);
            }
        });

        socket.on('close', () => {
            this.clients.delete(clientId);
            this.emit('disconnection', client);
        });

        socket.on('error', (err) => {
            console.error(`Error on socket ${clientId}:`, err);
            this.clients.delete(clientId);
            this.emit('disconnection', client);
        });
    }

    send(socket, data) {
        const json = JSON.stringify(data);
        const frame = createFrame(json);
        socket.write(frame);
    }

    broadcast(data, exceptId = null) {
        this.clients.forEach((socket, clientId) => {
            if (clientId !== exceptId) {
                this.send(socket, data);
            }
        });
    }

    getClient(clientId) {
        const socket = this.clients.get(clientId);
        if (!socket) return null;
        return {
            id: clientId,
            socket: socket,
            send: (data) => this.send(socket, data)
        };
    }

    listClients() {
        return Array.from(this.clients.keys());
    }

    disconnectClient(clientId, reason = 'Connection closed by server') {
        const client = this.getClient(clientId);
        if (client) {
            client.send({ type: 'disconnect', reason });
            client.socket.end();
            client.socket.destroy();
            return true;
        }
        return false;
    }
}

module.exports = RelayServer;
