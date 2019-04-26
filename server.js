const express = require('express');
const app = express();
const chalk = require('chalk');
const mongoose = require('mongoose');
const passport = require('passport');
const { mongoURI } = require('./config/keys');
const server = require('http').Server(app);
const io = require('socket.io')(server);

require('./config/passport')(passport);

const User = require('./models/User');
const Profile = require('./models/Profile');

mongoose.connect(mongoURI, { useNewUrlParser: true })
    .then(() => console.info(chalk.bold.underline.cyanBright('Connected to MongoDB')))
    .catch(err => console.warn(err));
mongoose.set('debug', true);

const port = process.env.PORT || 8001;

server.listen(port, () => console.log(chalk.bold.underline.greenBright(`Listening on ${port}`)));

app.use(express.static(__dirname + 'public'));

io.on('connection', socket => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        console.log(`err: ${err}`);
        console.log(`user: ${user}`);
    });
    socket.emit('connect', 'Welcome!');
})