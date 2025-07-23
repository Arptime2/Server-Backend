const http = require('http');
const fs = require('fs');
const path = require('path');

function serveStatic(port, clientPath, clientJsPath) {
    const server = http.createServer((req, res) => {
        let filePath;
        switch (req.url) {
            case '/':
                filePath = path.join(clientPath, 'index.html');
                break;
            case '/app.js':
                filePath = path.join(clientPath, 'app.js');
                break;
            case '/client.js':
                filePath = clientJsPath;
                break;
            default:
                res.writeHead(404).end('Not Found');
                return;
        }

        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500).end(`Server Error: ${err.code}`);
            } else {
                let contentType = 'text/html';
                if (filePath.endsWith('.js')) contentType = 'text/javascript';
                res.writeHead(200, { 'Content-Type': contentType }).end(content);
            }
        });
    });

    server.listen(port, 'localhost', () => {
        console.log(`[HTTP] Client example server running at http://localhost:${port}`);
    });

    return server;
}

module.exports = { serveStatic };
