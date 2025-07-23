const path = require('path');
const RelayServer = require('../server/RelayServer');
const { serveStatic } = require('../utils/StaticServer');
const { createTerminal } = require('../utils/TerminalUI');

/**
 * A high-level function that runs a complete, pre-configured chat server application.
 * It starts the WebSocket server, serves the client example files, and runs the terminal UI.
 * @param {object} config - Configuration for the chat server.
 * @param {number} config.websocketPort - The port for the WebSocket server.
 * @param {number} config.httpPort - The port for the static file server.
 * @param {string} config.clientPath - The absolute path to the client application files.
 * @param {string} config.clientLibPath - The absolute path to the client library file.
 */
function runChatServer(config = {}) {
    const { 
        websocketPort = 8080, 
        httpPort = 8081, 
        clientPath, 
        clientLibPath,
        enableTerminal = true // Add a flag to control the terminal
    } = config;

    // 1. Create the Relay Server
    const relayServer = new RelayServer({ port: websocketPort });

    // 2. Serve the client-side example files if a path is provided
    if (clientPath && clientLibPath) {
        serveStatic(httpPort, clientPath, clientLibPath);
    }

    // 3. Conditionally create an interactive terminal
    let log = console.log; // Default to console.log
    if (enableTerminal) {
        const terminal = createTerminal(relayServer);
        log = terminal.log; // Use the terminal's log function if it's running
    }

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
        // Re-construct the message to ensure a consistent format is broadcasted.
        const broadcastPayload = {
            type: 'message',
            from: client.id,
            payload: {
                text: message.text || JSON.stringify(message) // Ensure we get the text content
            }
        };
        relayServer.broadcast(broadcastPayload, client.id);
    });

    console.log('[APP] Chat server application is running.');
    if (clientPath) {
        console.log(`[HTTP] Client available at http://localhost:${httpPort}`);
    }

    return relayServer;
}

module.exports = { runChatServer };