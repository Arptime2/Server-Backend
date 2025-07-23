const path = require('path');
const { createServer } = require('../server/RelayServer');
const { serveStatic } = require('./StaticServer');
const { createTerminal } = require('./TerminalUI');

/**
 * A high-level function that runs a complete chat server application.
 * It starts the WebSocket server, serves the client, and runs the terminal UI.
 */
function runChatServer() {
    const WEBSOCKET_PORT = 8080;
    const HTTP_PORT = 8081;

    // 1. Create the Relay Server
    const relayServer = new createServer({ port: WEBSOCKET_PORT });

    // 2. Serve the client-side example files
    const clientExamplePath = path.resolve(__dirname, '..', '..', 'examples', 'browser-chatter');
    const clientLibPath = path.resolve(__dirname, '..', '..', 'client.js');
    serveStatic(HTTP_PORT, clientExamplePath, clientLibPath);

    // 3. Create an interactive terminal for managing the server
    const { log } = createTerminal(relayServer);

    // 4. Add the standard chat application logic
    relayServer.on('connection', (client) => {
        log(`[APP] Client connected: ${client.id}`);
        client.send({ type: 'welcome', message: `Welcome, your ID is ${client.id}` });
        relayServer.broadcast({ type: 'presence', status: 'online', id: client.id }, client.id);
    });

    relayServer.on('disconnection', (client) => {
        log(`[APP] Client disconnected: ${client.id}`);
        relayServer.broadcast({ type: 'presence', status: 'offline', id: client.id });
    });

    relayServer.on('message', (client, message) => {
        log(`[APP] Message from ${client.id}:`, message);
        relayServer.broadcast({ type: 'message', from: client.id, payload: message }, client.id);
    });

    console.log('[APP] Chat server application is running.');
    console.log(`[HTTP] Client available at http://localhost:${HTTP_PORT}`);

    return relayServer;
}

module.exports = { runChatServer };
