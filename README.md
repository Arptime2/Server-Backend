# Node-Relay: The Zero-Dependency WebSocket Toolkit

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

Node-Relay is a powerful, lightweight, and completely dependency-free toolkit for building real-time applications in Node.js. It enables incredibly fast, bidirectional data exchange between a central server and multiple clients, making it perfect for chat apps, live data dashboards, collaborative tools, and more.

Built from the ground up using only native Node.js modules, it provides a raw, efficient, and highly customizable foundation for your next real-time project.

## Features

-   **Absolutely Zero Dependencies:** Maximum security and minimum footprint. The entire library uses only the built-in `http`, `crypto`, and `events` modules.
-   **High-Level & Low-Level API:** Get started in one minute with our high-level functions, or use the core classes for fine-grained control.
-   **Batteries-Included Server Tools:** Comes with optional, reusable helpers for serving static client files and running an interactive terminal UI to manage your server.
-   **Simple, Event-Driven Interface:** Both the client and server APIs are intuitive and based on familiar event listeners (`on('message')`, `on('connection')`, etc.).
-   **Browser-Ready Client:** The client-side library is designed to be dropped directly into a web page with no bundler required.

---

## The 1-Minute Quick Start

Want to see it in action? You can run a full-featured chat application in under a minute.

### 1. Server Code

Create a file named `server.js`:

```javascript
// server.js
const path = require('path');
const { runChatServer } = require('./node-relay'); // Assuming node-relay is in a subfolder

// This one function runs a complete chat server with the client example.
runChatServer({
    clientPath: path.join(__dirname, 'browser-chatter'), // Path to the client's HTML/JS
    clientLibPath: path.resolve(__dirname, 'node-relay', 'client.js')
});
```

### 2. Client Code

Create an `index.html` and `app.js` file.

```html
<!-- index.html -->
<body>
    <input id="server-url" value="ws://localhost:8080" />
    <button id="connect-btn">Connect</button>
    <div id="status"></div>
    <ul id="messages"></ul>
    <form id="form"><input id="input" /></form>

    <script src="./node-relay/client.js"></script>
    <script src="app.js"></script>
</body>
```

```javascript
// app.js
const { runChatClient } = window.NodeRelay;

// This one function wires up the entire UI.
runChatClient({
    urlInput: 'server-url', connectBtn: 'connect-btn',
    status: 'status', messages: 'messages',
    form: 'form', messageInput: 'input'
});
```

### 3. Run It

From your terminal, run `node server.js` and open `index.html` in your browser. You now have a fully functional, real-time chat application with a server management CLI.

---

## Running the Included Example

To run the full-featured example application included in this repository:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd node-relay
    ```

2.  **Install dependencies (there are none, but this is good practice):**
    ```bash
    npm install
    ```

3.  **Run the example script:**
    ```bash
    npm run start:example
    ```

This will start the WebSocket server, the static file server for the client, and the interactive terminal UI.

You can now open `http://localhost:8081` in your browser to use the chat client.

---

## API Reference

Node-Relay provides two levels of API: high-level functions for convenience and core classes for customization.

### Backend API (`require('node-relay')`)

#### High-Level Functions

*   `runChatServer(config)`: The easiest way to get started. It creates a WebSocket server, serves client files, and can run an interactive terminal. 
    *   `config`: An object with `{ websocketPort, httpPort, clientPath, clientLibPath, enableTerminal }`.

#### Core Components & Customization

For more advanced use cases, you can use the lower-level components to build a custom server:

*   `createServer(options)`: Creates and starts a `RelayServer` instance. This is the core of the toolkit.
    *   `options`: An object with `{ port, host }`.
    *   `options`: An object with `{ port, host }`.

*   `createTerminal(relayServer)`: Attaches a powerful interactive command-line interface to any `RelayServer` instance.

*   `serveStatic(port, clientPath, clientLibPath)`: A simple static file server for hosting your frontend.

#### Core Class: `RelayServer`

For full control, you can use the `RelayServer` class directly.

**Events**

```javascript
const server = createServer({ port: 8080 });

server.on('connection', (client) => console.log(`Client connected: ${client.id}`));
server.on('disconnection', (client) => console.log(`Client left: ${client.id}`));
server.on('message', (client, message) => console.log('Message received:', message));
```

**Methods**

-   `broadcast(data, exceptId = null)`: Send a message to all connected clients.
-   `listClients()`: Returns an array of all connected client IDs.
-   `disconnectClient(clientId)`: Forcefully disconnects a specific client.
-   `getClient(clientId)`: Retrieves the full client object for a given ID.

### Frontend API (`window.NodeRelay`)

#### High-Level Function

*   `runChatClient(elementIds)`: The easiest way to create a chat UI. Pass it an object containing the IDs of your HTML elements, and it will wire up all the necessary event listeners.

#### Core Function & Class

*   `connect(url)`: The primary way to connect to a server. Returns a `RelayClient` instance.

*   `RelayClient`: The core client class.

**Events**

```javascript
const client = connect('ws://localhost:8080');

client.on('open', () => console.log('Connected!'));
client.on('close', () => console.log('Disconnected.'));
client.on('message', (data) => console.log('Data from server:', data));
client.on('error', (err) => console.error(err));
```

**Methods**

-   `send(data)`: Sends a JSON-serializable object to the server.
-   `close()`: Closes the connection.

---

## License

This project is licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE) file for details.