import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Chat } from '../models/Chat';
import { Message } from '../models/Message';
import { Match } from '../models/Match';
import { messageLimiter } from '../middleware/rateLimiter';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';

// Configure Cloudinary
cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
});

const router = Router();

// Get all chats for current user
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!._id;

        const chats = await Chat.find({ participants: userId })
            .populate('participants', 'name avatar photos')
            .sort({ lastMessageAt: -1, createdAt: -1 });

        res.json({ success: true, data: chats });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch chats' });
    }
});

// Create or get existing chat (requires a mutual match)
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const myId = req.user!._id;
        const { participantId } = req.body;

        if (!participantId) {
            res.status(400).json({ success: false, error: 'participantId is required' });
            return;
        }

        // Check mutual match exists
        const match = await Match.findOne({
            $or: [
                { user1: myId, user2: participantId },
                { user1: participantId, user2: myId },
            ],
        });

        if (!match) {
            res.status(403).json({ success: false, error: 'not_connected' });
            return;
        }

        // Find or create chat
        let chat = await Chat.findOne({ participants: { $all: [myId, participantId] } });
        if (!chat) {
            chat = await Chat.create({ participants: [myId, participantId] });
        }

        await chat.populate('participants', 'name avatar photos');
        res.json({ success: true, data: chat });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to create chat' });
    }
});

// Get messages for a chat
router.get('/:chatId/messages', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { chatId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;

        // Verify user is participant
        const chat = await Chat.findOne({ _id: chatId, participants: req.user!._id });
        if (!chat) {
            res.status(403).json({ success: false, error: 'Not a participant' });
            return;
        }

        const messages = await Message.find({ chatId })
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('sender', 'name avatar');

        const total = await Message.countDocuments({ chatId });

        res.json({
            success: true,
            data: messages.reverse(),
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch messages' });
    }
});

// Send message (REST fallback)
router.post('/:chatId/messages', authenticate, messageLimiter, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { chatId } = req.params;
        const { content } = req.body;

        if (!content?.trim()) {
            res.status(400).json({ success: false, error: 'Message content required' });
            return;
        }

        const chat = await Chat.findOne({ _id: chatId, participants: req.user!._id });
        if (!chat) {
            res.status(403).json({ success: false, error: 'Not a participant' });
            return;
        }

        const message = await Message.create({
            chatId,
            sender: req.user!._id,
            content: content.trim(),
            type: 'text',
            status: 'sent',
        });

        // Update chat last message
        chat.lastMessage = content.trim().substring(0, 100);
        chat.lastMessageAt = new Date();
        await chat.save();

        res.json({ success: true, data: message });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to send message' });
    }
});

// Upload image and send as message
router.post('/:chatId/image', authenticate, messageLimiter, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { chatId } = req.params;
        const { image } = req.body; // base64 string

        if (!image) {
            res.status(400).json({ success: false, error: 'Image data required' });
            return;
        }

        const chat = await Chat.findOne({ _id: chatId, participants: req.user!._id });
        if (!chat) {
            res.status(403).json({ success: false, error: 'Not a participant' });
            return;
        }

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(image, {
            folder: 'hillflare/chat',
            resource_type: 'image',
            transformation: [{ quality: 'auto', fetch_format: 'auto', width: 1200, crop: 'limit' }],
        });

        const message = await Message.create({
            chatId,
            sender: req.user!._id,
            content: '',
            type: 'image',
            imageUrl: uploadResult.secure_url,
            status: 'sent',
        });

        chat.lastMessage = '📷 Image';
        chat.lastMessageAt = new Date();
        await chat.save();

        const populated = await Message.findById(message._id).populate('sender', 'name avatar');

        // Bridge to socket so all participants receive it in real-time
        try {
            const { getIO } = await import('../socket');
            const io = getIO();
            chat.participants.forEach((pid) => io.to(pid.toString()).emit('new_message', populated));
        } catch { /* socket may not be ready */ }

        res.json({ success: true, data: populated });
    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({ success: false, error: 'Failed to send image' });
    }
});

// Mark messages as read
router.put('/:chatId/seen', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { chatId } = req.params;
        await Message.updateMany(
            { chatId, sender: { $ne: req.user!._id }, status: { $ne: 'read' } },
            { $set: { status: 'read' } }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to mark seen' });
    }
});

export default router;
