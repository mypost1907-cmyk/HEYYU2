import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema({
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    targetType: {
        type: String,
        enum: ['post', 'reply'],
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reactionType: {
        type: String,
        enum: ['fire', 'laugh', 'applause', 'shock', 'love', 'thinking'],
        required: true
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate reactions
reactionSchema.index({ targetId: 1, userId: 1, reactionType: 1 }, { unique: true });
reactionSchema.index({ targetId: 1, targetType: 1 });

export default mongoose.model('Reaction', reactionSchema);
