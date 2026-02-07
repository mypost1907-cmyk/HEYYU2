import express from 'express';
import Reaction from '../models/Reaction.js';
import VoicePost from '../models/VoicePost.js';
import Reply from '../models/Reply.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Add reaction
router.post('/', authenticate, async (req, res) => {
    try {
        const { targetId, targetType, reactionType } = req.body;

        if (!targetId || !targetType || !reactionType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate target exists
        if (targetType === 'post') {
            const post = await VoicePost.findById(targetId);
            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }
        } else if (targetType === 'reply') {
            const reply = await Reply.findById(targetId);
            if (!reply) {
                return res.status(404).json({ error: 'Reply not found' });
            }
        }

        // Check if reaction already exists
        const existing = await Reaction.findOne({
            targetId,
            userId: req.userId,
            reactionType
        });

        if (existing) {
            // Remove reaction (toggle off)
            await existing.deleteOne();

            // Update counts
            if (targetType === 'post') {
                await VoicePost.findByIdAndUpdate(targetId, {
                    $inc: { [`stats.reactionCounts.${reactionType}`]: -1 }
                });
            } else {
                await Reply.findByIdAndUpdate(targetId, {
                    $inc: { [`stats.reactions.${reactionType}`]: -1 }
                });
            }

            return res.json({ success: true, action: 'removed', reactionType });
        }

        // Create new reaction
        const reaction = await Reaction.create({
            targetId,
            targetType,
            userId: req.userId,
            reactionType
        });

        // Update counts
        if (targetType === 'post') {
            await VoicePost.findByIdAndUpdate(targetId, {
                $inc: { [`stats.reactionCounts.${reactionType}`]: 1 }
            });
        } else {
            await Reply.findByIdAndUpdate(targetId, {
                $inc: { [`stats.reactions.${reactionType}`]: 1 }
            });
        }

        res.status(201).json({ success: true, action: 'added', reaction });
    } catch (error) {
        console.error('Add reaction error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get reactions for a target
router.get('/:targetType/:targetId', async (req, res) => {
    try {
        const { targetType, targetId } = req.params;

        const reactions = await Reaction.find({ targetId, targetType })
            .populate('userId', 'username avatar');

        // Group by reaction type
        const grouped = {};
        reactions.forEach(reaction => {
            if (!grouped[reaction.reactionType]) {
                grouped[reaction.reactionType] = [];
            }
            grouped[reaction.reactionType].push(reaction);
        });

        res.json({ success: true, reactions: grouped, total: reactions.length });
    } catch (error) {
        console.error('Get reactions error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
