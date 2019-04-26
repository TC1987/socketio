const mongoose = require('mongoose');
const { Schema } = mongoose;
const keys = require('./../config/keys');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
    },
    username: {
        type: String,
        required: true,
    },
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    },
    verified: {
        type: Boolean,
        default: false
    }
});

/*
https://gist.github.com/dmh2000/1609820c17c5daf95298f54324360950

function genSalt(password) {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                reject(err);
            } else {
                resolve({
                    salt: salt,
                    password: password
                });
            }
        });
    });
}

function genHash(salt, password) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, salt, (err, hash) => {
            if (err) {
                reject(err);
            } else {
                resolve({
                    salt: salt,
                    password: password,
                    hash: hash
                });
            }
        });
    });
}

genSalt(password)
    .then(result => genHash(result.salt, result.password))
    .then(result => console.log(result.hash)
    .catch(err => console.log(err));
*/

// UserSchema.methods.hashPassword = function() {
//     bcrypt.genSalt(10, (err, salt) => {
//         bcrypt.hash(this.password, salt, (err, hash) => {
//             if (err) throw err;

//             console.log(this.password, hash);

//             this.password = hash;
//         });
//     });
// }

// UserSchema.methods.generateRegHash = function() {
//     const salt = bcrypt.genSaltSync(5);
//     const hash = bcrypt.hashSync(this.email + this.date, salt);
//     this.regHash = hash;
// }

UserSchema.methods.hashPassword = function() {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(this.password, salt);
    this.password = hash;
}

UserSchema.methods.validatePassword = async function(password) {
    return (await bcrypt.compare(password, this.password));
}

UserSchema.methods.generateJWT = function() {

    const payload = {
        id: this.id,
    };

    // Expires in 1 year.
    return jwt.sign(payload, keys.secretOrKey, { expiresIn: 31556926 });
    // return jwt.sign(payload, keys.secretOrKey, { expiresIn: 600 });
}

UserSchema.methods.getJson = function() {
    return {
        _id: this._id,
        token: "Bearer " + this.generateJWT()
    }
}

module.exports = mongoose.model('User', UserSchema);