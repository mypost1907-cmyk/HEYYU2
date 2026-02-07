import express from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-passwordHash -email');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update user profile
router.put('/:id', authenticate, async (req, res) => {
    try {
        // Check if user is updating own profile
        if (req.params.id !== req.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const { username, bio, avatar, settings } = req.body;

        const updateData = {};
        if (username) updateData.username = username;
        if (bio !== undefined) updateData.bio = bio;
        if (avatar) updateData.avatar = avatar;
        if (settings) updateData.settings = settings;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-passwordHash');

        res.json({ success: true, user });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Search users
router.get('/', async (req, res) => {
    try {
        const { q, limit = 20 } = req.query;

        let query = {};
        if (q) {
            query = {
                $or: [
                    { username: new RegExp(q, 'i') },
                    { bio: new RegExp(q, 'i') }
                ]
            };
        }

        const users = await User.find(query)
            .select('-passwordHash -email')
            .limit(parseInt(limit));

        res.json({ success: true, users });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
