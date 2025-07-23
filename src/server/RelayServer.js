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
                this._handleClientConnection(ws);
            });
        });

        this.clients = new Map();
        this.server.listen(port, host);
    }

    _handleClientConnection(socket) {
        const client = this._createClientObject(socket);
        this.clients.set(client.id, socket);
        this.emit('connection', client);

        let buffer = Buffer.alloc(0);
        socket.on('data', (chunk) => {
            buffer = Buffer.concat([buffer, chunk]);
            let result;
            while ((result = parseMessage(buffer)) !== null) {
                const { message, remainingBuffer } = result;
                if (message) {
                    this.emit('message', client, message);
                }
                buffer = remainingBuffer;
            }
        });

        socket.on('close', () => {
            this.clients.delete(client.id);
            this.emit('disconnection', client);
        });

        socket.on('error', (err) => {
            console.error(`Error on socket ${client.id}:`, err);
            this.clients.delete(client.id);
            this.emit('disconnection', client);
        });
    }

    _createClientObject(socket) {
        const clientId = crypto.randomBytes(16).toString('hex');
        return {
            id: clientId,
            socket: socket,
            send: (data) => this.send(socket, data)
        };
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
