import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import Reply from '../models/Reply.js';
import VoicePost from '../models/VoicePost.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for audio uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/audio');
    },
    filename: (req, file, cb) => {
        const uniqueName = `reply-${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 3 * 1024 * 1024 }, // 3MB max for replies
    fileFilter: (req, file, cb) => {
        const allowedTypes = /webm|ogg|mp3|wav|m4a/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) cb(null, true);
        else cb(new Error('Only audio files allowed'));
    }
});

// Create reply (text or voice)
router.post('/', authenticate, upload.single('audio'), async (req, res) => {
    try {
        const { postId, parentReplyId, type, text, duration, transcript, waveformData } = req.body;

        if (!postId || !type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if post exists
        const post = await VoicePost.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const replyData = {
            postId,
            userId: req.userId,
            type,
            parentReplyId: parentReplyId || null
        };

        if (type === 'text') {
            if (!text) {
                return res.status(400).json({ error: 'Text required for text reply' });
            }
            replyData.text = text;
        } else if (type === 'voice') {
            if (!req.file) {
                return res.status(400).json({ error: 'Audio file required for voice reply' });
            }
            if (duration > 6000) {
                return res.status(400).json({ error: 'Voice replies max 6 seconds' });
            }

            replyData.audioUrl = `/uploads/audio/${req.file.filename}`;
            replyData.duration = parseInt(duration);
            replyData.transcript = transcript ? JSON.parse(transcript) : { text: '', words: [] };
            replyData.waveformData = waveformData ? JSON.parse(waveformData) : [];
        }

        const reply = await Reply.create(replyData);

        // Update post reply count
        await VoicePost.findByIdAndUpdate(postId, {
            $inc: { 'stats.replyCount': 1 }
        });

        // Populate user data
        await reply.populate('userId', 'username avatar');

        res.status(201).json({ success: true, reply });
    } catch (error) {
        console.error('Create reply error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get replies for a post
router.get('/post/:postId', async (req, res) => {
    try {
        const { limit = 50, sort = 'newest' } = req.query;

        const sortOrder = sort === 'newest' ? { createdAt: -1 } : { createdAt: 1 };

        const replies = await Reply.find({ postId: req.params.postId })
            .sort(sortOrder)
            .limit(parseInt(limit))
            .populate('userId', 'username avatar')
            .populate('parentReplyId');

        // Build threaded structure
        const replyMap = {};
        const rootReplies = [];

        replies.forEach(reply => {
            replyMap[reply._id] = { ...reply.toObject(), children: [] };
        });

        replies.forEach(reply => {
            if (reply.parentReplyId) {
                if (replyMap[reply.parentReplyId._id]) {
                    replyMap[reply.parentReplyId._id].children.push(replyMap[reply._id]);
                }
            } else {
                rootReplies.push(replyMap[reply._id]);
            }
        });

        res.json({ success: true, replies: rootReplies, total: replies.length });
    } catch (error) {
        console.error('Get replies error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete reply
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const reply = await Reply.findById(req.params.id);

        if (!reply) {
            return res.status(404).json({ error: 'Reply not found' });
        }

        if (reply.userId.toString() !== req.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await reply.deleteOne();

        // Update post reply count
        await VoicePost.findByIdAndUpdate(reply.postId, {
            $inc: { 'stats.replyCount': -1 }
        });

        res.json({ success: true, message: 'Reply deleted' });
    } catch (error) {
        console.error('Delete reply error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
