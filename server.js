const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let childSocketId = null;
let parentSocketId = null;

io.on('connection', (socket) => {
    socket.on('register', (data) => {
        if (data.role === 'child') childSocketId = socket.id;
        else if (data.role === 'parent') parentSocketId = socket.id;
    });

    socket.on('child_location_update', (data) => {
        if (parentSocketId) io.to(parentSocketId).emit('parent_receive_location', data);
    });

    socket.on('camera_frame_data', (data) => {
        if (parentSocketId) io.to(parentSocketId).emit('parent_receive_camera_frame', data);
    });

    socket.on('audio_stream_data', (data) => {
        if (parentSocketId) io.to(parentSocketId).emit('parent_receive_audio_chunk', data);
    });

    socket.on('parent_command', (cmdData) => {
        if (childSocketId) io.to(childSocketId).emit(cmdData.command, cmdData.payload);
    });
});

server.listen(3000, () => console.log('Server running on port 3000'));
