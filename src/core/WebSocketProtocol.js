const crypto = require('crypto');

function handleUpgrade(req, socket, callback) {
    const key = req.headers['sec-websocket-key'];
    const hash = crypto.createHash('sha1')
        .update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
        .digest('base64');

    const headers = [
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Accept: ${hash}`
    ];

    socket.write(headers.join('\r\n') + '\r\n\r\n');
    callback(socket);
}

function createFrame(payload) {
    const payloadByteLength = Buffer.byteLength(payload);
    let header;
    let payloadOffset = 2;

    if (payloadByteLength <= 125) {
        header = Buffer.alloc(2);
        header[1] = payloadByteLength;
    } else if (payloadByteLength <= 65535) {
        header = Buffer.alloc(4);
        header[1] = 126;
        header.writeUInt16BE(payloadByteLength, 2);
        payloadOffset = 4;
    } else {
        header = Buffer.alloc(10);
        header[1] = 127;
        header.writeBigUInt64BE(BigInt(payloadByteLength), 2);
        payloadOffset = 10;
    }

    header[0] = 129; // Fin bit set, opcode for text

    const frame = Buffer.concat([header, Buffer.from(payload)]);
    return frame;
}

function parseMessage(buffer) {
    // A WebSocket frame must have at least 2 bytes for the header.
    // If we don't have enough data, wait for more.
    if (buffer.length < 2) {
        return null;
    }

    const firstByte = buffer.readUInt8(0);
    const opCode = firstByte & 0x0f;

    if (opCode === 8) { // Close frame
        return null;
    }

    const secondByte = buffer.readUInt8(1);
    const isMasked = (secondByte & 0x80) !== 0;
    let payloadLength = secondByte & 0x7f;
    let maskOffset = 2;

    if (payloadLength === 126) {
        payloadLength = buffer.readUInt16BE(2);
        maskOffset = 4;
    } else if (payloadLength === 127) {
        payloadLength = Number(buffer.readBigUInt64BE(2));
        maskOffset = 10;
    }

    const maskingKey = isMasked ? buffer.slice(maskOffset, maskOffset + 4) : null;
    const payloadOffset = maskOffset + (isMasked ? 4 : 0);
    const frameLength = payloadOffset + payloadLength;

    // Not enough data in the buffer for a complete frame. Wait for more.
    if (buffer.length < frameLength) {
        return null;
    }

    const payload = buffer.slice(payloadOffset, frameLength);
    const remainingBuffer = buffer.slice(frameLength);

    if (isMasked) {
        for (let i = 0; i < payload.length; i++) {
            payload[i] = payload[i] ^ maskingKey[i % 4];
        }
    }

    let message;
    try {
        message = JSON.parse(payload.toString());
    } catch (e) {
        message = payload.toString();
    }

    return { message, remainingBuffer };
}

module.exports = { handleUpgrade, createFrame, parseMessage };