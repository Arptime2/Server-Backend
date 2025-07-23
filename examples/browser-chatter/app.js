/**
 * This file demonstrates the simplest way to run the chat client.
 * It uses the high-level `runChatClient` function from the library,
 * passing it the IDs of the HTML elements it needs to manage.
 */

const { runChatClient } = window.NodeRelay;

// Run the entire pre-packaged chat client application.
runChatClient({
    urlInput: 'server-url',
    connectBtn: 'connect-btn',
    status: 'status',
    messages: 'messages',
    form: 'form',
    messageInput: 'input',
    targetIdInput: 'target-id' // Add the new element ID
});
