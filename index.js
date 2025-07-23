const RelayServer = require('./src/server/RelayServer');
const { serveStatic } = require('./src/utils/StaticServer');
const { createTerminal } = require('./src/utils/TerminalUI');

const { runChatServer } = require('./src/apps/ChatServer');

module.exports = {
    createServer,
    serveStatic,
    createTerminal,
    runChatServer, // The new, clean, high-level function
    RelayServer
};