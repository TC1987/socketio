const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProfileSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    age: {
        type: Number,
        // required: true
    },
    gender: {
        type: String,
        required: true
    },
    preference: {
        type: String,
        default: 'bisexual'
    },
    biography: {
        type: String,
        required: true
    },
    tags: {
        type: [String]
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    // history displays who has looked at a user's profile.
    history: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    // viewed shows what profiles the current user has seen.
    viewed: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    blocked: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    gps: {
        type: Boolean,
        default: true
    },
    lastOnline: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Profile', ProfileSchema);