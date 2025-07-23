const RelayServer = require('./src/server/RelayServer');
const { serveStatic } = require('./src/utils/StaticServer');
const { createTerminal } = require('./src/utils/TerminalUI');

const { runChatServer } = require('./src/utils/ExampleRunner');

/**
 * A high-level function to create and start a RelayServer.
 * @param {object} options - Server options (e.g., port, host).
 * @returns {RelayServer} The created server instance.
 */
function createServer(options) {
    return new RelayServer(options);
}

module.exports = {
    createServer,
    serveStatic,
    createTerminal,
    runChatServer, // Export the new all-in-one function
    RelayServer // Also export the class for advanced users
};