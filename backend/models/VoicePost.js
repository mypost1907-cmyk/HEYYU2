import mongoose from 'mongoose';

const voicePostSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    audioUrl: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true,
        max: 12000 // 12 seconds in milliseconds
    },
    waveformData: {
        type: [Number],
        default: []
    },
    transcript: {
        text: {
            type: String,
            default: ''
        },
        words: [{
            word: String,
            startTime: Number,
            endTime: Number,
            confidence: Number
        }]
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    effects: {
        voiceFilter: {
            type: String,
            enum: ['none', 'radio', 'deep', 'whisper', 'robotic', 'studio'],
            default: 'none'
        },
        playbackSpeed: {
            type: Number,
            default: 1.0,
            min: 0.8,
            max: 1.2
        }
    },
    stats: {
        listens: {
            type: Number,
            default: 0
        },
        completionRate: {
            type: Number,
            default: 0
        },
        replays: {
            type: Number,
            default: 0
        },
        replyCount: {
            type: Number,
            default: 0
        },
        reactionCounts: {
            type: Map,
            of: Number,
            default: {}
        }
    },
    trending: {
        score: {
            type: Number,
            default: 0
        },
        lastCalculated: {
            type: Date,
            default: Date.now
        }
    }
}, {
    timestamps: true
});

// Indexes for performance
voicePostSchema.index({ userId: 1, createdAt: -1 });
voicePostSchema.index({ 'trending.score': -1 });
voicePostSchema.index({ createdAt: -1 });

export default mongoose.model('VoicePost', voicePostSchema);
