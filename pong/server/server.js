const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const users = {}; // Store users with socket IDs as keys

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('login', (username) => {
        if (Object.values(users).includes(username)) {
            socket.emit('loginError', 'Username already in use');
        } else {
            users[socket.id] = username;
            io.emit('updateUserList', Object.values(users));
        }
    });

    socket.on('sendInvitation', (invite) => {
        const recipientSocketId = Object.keys(users).find(key => users[key] === invite.to);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('receiveInvitation', { from: invite.from, id: socket.id });
        }
    });

    socket.on('acceptInvitation', (data) => {
        io.to(data.from).emit('invitationAccepted', { from: users[socket.id], id: socket.id });
        // Additional logic to start the game can be added here
    });

    socket.on('rejectInvitation', (data) => {
        io.to(data.from).emit('invitationRejected', { from: users[socket.id] });
    });

    socket.on('disconnect', () => {
        delete users[socket.id];
        io.emit('updateUserList', Object.values(users));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
