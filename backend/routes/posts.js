import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import VoicePost from '../models/VoicePost.js';
import User from '../models/User.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for audio uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/audio');
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /webm|ogg|mp3|wav|m4a/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed'));
        }
    }
});

// Create voice post
router.post('/', authenticate, upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Audio file is required' });
        }

        const {
            duration,
            transcript,
            isAnonymous,
            voiceFilter,
            playbackSpeed,
            waveformData
        } = req.body;

        // Validate duration
        if (!duration || duration > 12000) {
            return res.status(400).json({ error: 'Invalid duration (max 12 seconds)' });
        }

        // Parse JSON fields
        const parsedTranscript = transcript ? JSON.parse(transcript) : { text: '', words: [] };
        const parsedWaveform = waveformData ? JSON.parse(waveformData) : [];

        // Create post
        const post = await VoicePost.create({
            userId: req.userId,
            audioUrl: `/uploads/audio/${req.file.filename}`,
            duration: parseInt(duration),
            waveformData: parsedWaveform,
            transcript: parsedTranscript,
            isAnonymous: isAnonymous === 'true',
            effects: {
                voiceFilter: voiceFilter || 'none',
                playbackSpeed: playbackSpeed ? parseFloat(playbackSpeed) : 1.0
            }
        });

        // Update user stats
        await User.findByIdAndUpdate(req.userId, {
            $inc: { 'stats.totalPosts': 1 }
        });

        // Populate user data
        await post.populate('userId', 'username avatar');

        res.status(201).json({ success: true, post });
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ error: 'Server error creating post' });
    }
});

// Get feed (personalized or global)
router.get('/feed', optionalAuth, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Simple feed for now (chronological)
        // TODO: Implement personalized algorithm
        const posts = await VoicePost.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('userId', 'username avatar isAnonymous');

        // Hide user data for anonymous posts
        const processedPosts = posts.map(post => {
            const postObj = post.toObject();
            if (postObj.isAnonymous) {
                postObj.userId = {
                    username: 'Anonymous',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous'
                };
            }
            return postObj;
        });

        res.json({
            success: true,
            posts: processedPosts,
            page: parseInt(page),
            hasMore: posts.length === parseInt(limit)
        });
    } catch (error) {
        console.error('Get feed error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get trending posts
router.get('/trending', async (req, res) => {
    try {
        const { timeframe = 'today', limit = 20 } = req.query;

        // Calculate time filter
        let startDate = new Date();
        if (timeframe === 'today') {
            startDate.setHours(0, 0, 0, 0);
        } else if (timeframe === 'week') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (timeframe === 'month') {
            startDate.setMonth(startDate.getMonth() - 1);
        }

        const posts = await VoicePost.find({
            createdAt: { $gte: startDate }
        })
            .sort({ 'trending.score': -1, 'stats.listens': -1 })
            .limit(parseInt(limit))
            .populate('userId', 'username avatar');

        res.json({ success: true, posts, timeframe });
    } catch (error) {
        console.error('Get trending error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single post
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const post = await VoicePost.findById(req.params.id)
            .populate('userId', 'username avatar bio');

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Hide user data for anonymous posts
        if (post.isAnonymous) {
            post.userId = {
                username: 'Anonymous',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous'
            };
        }

        res.json({ success: true, post });
    } catch (error) {
        console.error('Get post error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Track listen event
router.post('/:id/listen', async (req, res) => {
    try {
        const { completed } = req.body;

        await VoicePost.findByIdAndUpdate(req.params.id, {
            $inc: {
                'stats.listens': 1,
                ...(completed && { 'stats.replays': 0 })
            }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Track listen error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Track replay event
router.post('/:id/replay', async (req, res) => {
    try {
        await VoicePost.findByIdAndUpdate(req.params.id, {
            $inc: { 'stats.replays': 1 }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Track replay error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete post
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const post = await VoicePost.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check ownership
        if (post.userId.toString() !== req.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await post.deleteOne();

        // Update user stats
        await User.findByIdAndUpdate(req.userId, {
            $inc: { 'stats.totalPosts': -1 }
        });

        res.json({ success: true, message: 'Post deleted' });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
