require('dotenv').config();

const http = require('http');
const logger = require('morgan');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const port = 3000;
const app = express();
const server = http.createServer(app);

const { botListener } = require('./index');

const mongoURI = 'mongodb://mongo:27017/bookmarkerbot';
mongoose.connect(mongoURI, { useNewUrlParser: true });

const onError = error => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = `Port ${port}`;

    switch (error.code) {
        case 'EACCES':
            console.log(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.log(`${bind} is already in use`);
            process.exit(1);
        default:
            throw error;
    }
};

const onListening = () => {
    const addr = server.address();
    const bind = `port ${addr.port}`;

    console.log(`Listening on ${bind}`);
};

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

app.use(logger('dev'));
app.use(express.json());
app.use(cors());

botListener();

