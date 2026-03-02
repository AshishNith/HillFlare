import mongoose from 'mongoose';
import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { Chat } from '../models/Chat';
import { Message } from '../models/Message';
import { User } from '../models/User';
import { Block } from '../models/Block';
import { Notification } from '../models/Notification';
import { getIo, isUserInRoom } from '../sockets';

export const chatRouter = Router();

const getBlockedIds = async (userId: string): Promise<Set<string>> => {
  const blockedByMe = await Block.find({ userId }).distinct('targetUserId');
  const blockedMe = await Block.find({ targetUserId: userId }).distinct('userId');
  return new Set([...blockedByMe, ...blockedMe]);
};

const sendPushNotification = async (token: string, title: string, body: string, data?: Record<string, unknown>) => {
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: token, title, body, data }),
    });
  } catch {
    // Ignore push failures to avoid blocking chat flow
  }
};

chatRouter.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user?.sub || '';
    const blockedIds = await getBlockedIds(userId);

    const chats = await Chat.find({
      $and: [
        { memberIds: userId },
        { memberIds: { $nin: Array.from(blockedIds) } },
      ],
    })
      .sort({ lastMessageAt: -1 })
      .lean();

    const otherIds = chats
      .map((chat) => chat.memberIds.find((id) => id !== userId))
      .filter((id): id is string => Boolean(id));

    const users = await User.find({ email: { $in: otherIds } }).lean();
    const userMap = new Map(users.map((user) => [user.email, user]));

    const items = await Promise.all(
      chats.map(async (chat) => {
        const otherId = chat.memberIds.find((id) => id !== userId) || '';
        const otherUser = userMap.get(otherId) || { email: otherId, name: otherId };
        const unreadCount = await Message.countDocuments({
          chatId: chat._id.toString(),
          senderId: { $ne: userId },
          seenBy: { $ne: userId },
        });

        return {
          _id: chat._id,
          otherUser,
          lastMessage: chat.lastMessage,
          lastMessageType: chat.lastMessageType,
          lastMessageAt: chat.lastMessageAt,
          unreadCount,
        };
      })
    );

    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chats', items: [] });
  }
});

chatRouter.get('/:chatId/messages', requireAuth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user?.sub || '';

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.memberIds.includes(userId)) {
      res.status(404).json({ error: 'Chat not found' });
      return;
    }

    const blockedIds = await getBlockedIds(userId);
    const otherId = chat.memberIds.find((id) => id !== userId) || '';
    if (blockedIds.has(otherId)) {
      res.status(403).json({ error: 'Chat is blocked' });
      return;
    }

    const limit = Math.min(Number(req.query.limit ?? 30), 100);
    const cursor = req.query.cursor ? new Date(String(req.query.cursor)) : null;

    const query: Record<string, unknown> = { chatId };
    if (cursor) {
      query.createdAt = { $lt: cursor };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit)
      .lean();

    const nextCursor = messages.length === limit ? messages[messages.length - 1].createdAt : null;

    res.json({ items: messages.reverse(), nextCursor });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages', items: [] });
  }
});

chatRouter.post('/:chatId/messages', requireAuth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { body, type, mediaUrl } = req.body as { body?: string; type?: string; mediaUrl?: string };
    const userId = req.user?.sub || '';

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.memberIds.includes(userId)) {
      res.status(404).json({ error: 'Chat not found' });
      return;
    }

    const otherId = chat.memberIds.find((id) => id !== userId) || '';
    const blockedIds = await getBlockedIds(userId);
    if (blockedIds.has(otherId)) {
      res.status(403).json({ error: 'Chat is blocked' });
      return;
    }

    const messageBody = (body || '').trim();
    const messageType = type || 'text';

    if (messageType === 'text' && !messageBody) {
      res.status(400).json({ error: 'Message body is required' });
      return;
    }

    if (messageType === 'image' && !mediaUrl) {
      res.status(400).json({ error: 'Image URL is required' });
      return;
    }

    const message = await Message.create({
      chatId,
      senderId: userId,
      body: messageType === 'text' ? messageBody : '',
      type: messageType,
      mediaUrl,
      seenBy: [userId],
    });

    const preview = messageType === 'image' ? '[image]' : messageBody.slice(0, 200);

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: preview,
      lastMessageType: messageType,
      lastMessageAt: message.createdAt,
      lastMessageSenderId: userId,
    });

    const io = getIo();
    io?.to(chatId).emit('chat:message', { chatId, message });

    // Notify the recipient's personal room so their chat list updates in real-time
    io?.to(`user:${otherId}`).emit('chats:update', { chatId });

    const sender = await User.findOne({ email: userId });
    const recipient = await User.findOne({ email: otherId });

    // Only create notification and push if recipient is NOT viewing this chat
    const recipientInChat = await isUserInRoom(otherId, chatId);
    if (!recipientInChat) {
      if (recipient?.pushToken) {
        await sendPushNotification(
          recipient.pushToken,
          sender?.name || 'New message',
          preview,
          { chatId }
        );
      }

      if (recipient) {
        await Notification.create({
          userId: recipient.email,
          type: 'message',
          payload: { chatId, senderId: userId },
          ...(sender?.collegeId && { collegeId: sender.collegeId }),
        });
      }
    }

    res.json({ data: message });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

chatRouter.post('/:chatId/read', requireAuth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user?.sub || '';

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.memberIds.includes(userId)) {
      res.status(404).json({ error: 'Chat not found' });
      return;
    }

    await Message.updateMany(
      { chatId, senderId: { $ne: userId }, seenBy: { $ne: userId } },
      { $addToSet: { seenBy: userId } }
    );

    const io = getIo();
    io?.to(chatId).emit('chat:seen', { chatId, userId });

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark messages read' });
  }
});

chatRouter.post('/find-or-create', requireAuth, async (req, res) => {
  try {
    const { targetUserId } = req.body as { targetUserId?: string };
    const currentUserId = req.user?.sub || '';

    if (!targetUserId) {
      res.status(400).json({ error: 'Target user ID is required' });
      return;
    }

    const blockedIds = await getBlockedIds(currentUserId);
    if (blockedIds.has(targetUserId)) {
      res.status(403).json({ error: 'User is blocked' });
      return;
    }

    const targetUser = mongoose.Types.ObjectId.isValid(targetUserId)
      ? await User.findById(targetUserId)
      : await User.findOne({ email: targetUserId });

    if (!targetUser) {
      res.status(404).json({ error: 'Target user not found' });
      return;
    }

    const resolvedTargetId = targetUser.email;

    let chat = await Chat.findOne({
      memberIds: { $all: [currentUserId, resolvedTargetId] },
    });

    if (!chat) {
      const currentUser = await User.findOne({ email: currentUserId });
      chat = await Chat.create({
        memberIds: [currentUserId, resolvedTargetId],
        ...(currentUser?.collegeId && { collegeId: currentUser.collegeId }),
      });
    }

    res.json({ data: chat });
  } catch (error) {
    res.status(500).json({ error: 'Failed to find or create chat' });
  }
});
