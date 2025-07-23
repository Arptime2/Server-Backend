/**
 * This file demonstrates the simplest way to run the entire chat server.
 * It imports the `runChatServer` function from the library and executes it.
 * All the complex logic is encapsulated within the library itself.
 */
const path = require('path');
const { runChatServer } = require('../index');

// Run the entire pre-packaged chat server application.
runChatServer({
    clientPath: path.join(__dirname, 'browser-chatter'),
    clientLibPath: path.resolve(__dirname, '..', 'client.js'),
    enableTerminal: true // Explicitly enable the terminal UI
});