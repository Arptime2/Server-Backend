const RelayServer = require('./src/server/RelayServer');
const { serveStatic } = require('./src/utils/StaticServer');
const { createTerminal } = require('./src/utils/TerminalUI');
const { runChatServer } = require('./src/apps/ChatServer');

/**
 * A high-level function to create and start a RelayServer.
 * This is for advanced users who want to build their own application logic.
 * @param {object} options - Server options (e.g., port, host).
 * @returns {RelayServer} The created server instance.
 */
function createServer(options) {
    return new RelayServer(options);
}

module.exports = {
    // High-level "batteries-included" functions
    runChatServer,

    // Lower-level components for custom builds
    createServer,
    serveStatic,
    createTerminal,
    RelayServer
};
