// Use socket.io namespaces different from endpoints so that we don't unnecessarily
// use socket.io for incoming requests.

const express = require('express');
const app = express();
const chalk = require('chalk');
const mongoose = require('mongoose');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const socketioJwt = require('socketio-jwt');
const cookie = require('cookie');
const { mongoURI, secretOrKey } = require('./config/keys');
const server = require('http').Server(app);
const io = require('socket.io')(server, {
    pingTimeout: 60000
});

require('./config/passport')(passport);

const User = require('./models/User');
const Profile = require('./models/Profile');

mongoose.connect(mongoURI, { useNewUrlParser: true })
    .then(() => console.info(chalk.bold.underline.cyanBright('Connected to MongoDB')))
    .catch(err => console.warn(err));
mongoose.set('debug', true);

const port = process.env.PORT || 8001;

server.listen(port, () => console.log(chalk.bold.underline.greenBright(`Listening on ${port}`)));

// --------------------- END CONFIG --------------------- //

function verifyToken(token) {
    return jwt.verify(token, 'mySecret', (err, payload) => (err) ? 0 : payload);
}

app.use(express.static('public'));

app.get('/login', (req, res, next) => {
    const user = { id: 12345, name: 'Terry' };

    jwt.sign(user, 'mySecret', (err, token) => {
        if (err) {
            res.sendStatus(500);
        }
        res.cookie('Bearer', token);
        res.redirect('/');
    });
});

io.use((socket, next) => {
    // console.log(`socket.id = ${socket.id}`);
    const token = socket.handshake.headers.cookie;
    if (!token) {
        console.log('Not Authenticated - Missing Token');
    } else {
        const bearer = cookie.parse(token).Bearer;
        let payload = null;
        if (!(payload = verifyToken(bearer))) {
            console.log(chalk.red.bold.underline('>>> Failure - Invalid Token <<<'));
            socket.emit('auth_fail', 'Authentication Required');
        } else {
            console.log(chalk.green.bold.underline('>>> Success - Authenticated <<<'));
            socket.emit('verified', payload);
            socket.payload = payload;
            next();
        }
    }
});

// Keeping track of currently connected users.
const current_users = {};

io.sockets
    .on('connection', socket => {
        console.log(`New User Connected: ${socket.id}`);

        // Adding new user to connected_users object.
        current_users[socket.id] = socket.payload;

        io.emit('current_users', current_users);

        // Users from MongoDB.
        // User.find()
        //     .then(users => {
        //         console.log(users);
        //         socket.emit('online_users', users);
        //     });
        
        socket.on('disconnect', () => {
            console.log(`${socket.id} has disconnected.`);
            delete current_users[socket.id];
            socket.broadcast.emit('update_users', current_users);
        });

        socket.on('like', data => console.log(data));
    });