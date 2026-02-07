import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
    },
    bio: {
        type: String,
        maxlength: 160,
        default: ''
    },
    voiceFingerprint: {
        type: String,
        default: ''
    },
    settings: {
        autoPlayFeed: {
            type: Boolean,
            default: true
        },
        notificationsEnabled: {
            type: Boolean,
            default: true
        },
        allowAnonymous: {
            type: Boolean,
            default: true
        }
    },
    stats: {
        followers: {
            type: Number,
            default: 0
        },
        following: {
            type: Number,
            default: 0
        },
        totalPosts: {
            type: Number,
            default: 0
        },
        totalListens: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Index for search
userSchema.index({ username: 'text' });

export default mongoose.model('User', userSchema);
