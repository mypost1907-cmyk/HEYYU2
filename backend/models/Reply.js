import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VoicePost',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    parentReplyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reply',
        default: null
    },
    type: {
        type: String,
        enum: ['text', 'voice'],
        required: true
    },
    // For text replies
    text: {
        type: String,
        maxlength: 280
    },
    // For voice replies
    audioUrl: {
        type: String
    },
    duration: {
        type: Number,
        max: 6000 // 6 seconds max for replies
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
    stats: {
        reactions: {
            type: Map,
            of: Number,
            default: {}
        }
    }
}, {
    timestamps: true
});

// Indexes
replySchema.index({ postId: 1, createdAt: 1 });
replySchema.index({ userId: 1 });
replySchema.index({ parentReplyId: 1 });

export default mongoose.model('Reply', replySchema);
