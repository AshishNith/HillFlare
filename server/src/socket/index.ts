import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Message } from '../models/Message';
import { Chat } from '../models/Chat';

interface AuthSocket extends Socket {
    userId?: string;
}

const onlineUsers = new Map<string, string>(); // userId -> socketId
let _io: Server;

export const getOnlineUsers = () => onlineUsers;

export const getIO = (): Server => {
    if (!_io) throw new Error('Socket.io not initialized');
    return _io;
};

export const initializeSocket = (httpServer: HttpServer): Server => {
    const io = new Server(httpServer, {
        cors: {
            origin: env.NODE_ENV === 'development' ? true : env.CLIENT_URL,
            methods: ['GET', 'POST'],
            credentials: true,
        },
        maxHttpBufferSize: 10e6, // 10MB for image transfers
    });

    // Auth middleware
    io.use((socket: AuthSocket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
            socket.userId = decoded.userId;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket: AuthSocket) => {
        const userId = socket.userId!;
        onlineUsers.set(userId, socket.id);
        _io = io; // keep module-level reference updated
        console.log(`🟢 User connected: ${userId}`);

        // Join user's personal room
        socket.join(userId);

        // Broadcast online status to all connected users
        io.emit('user_online', { userId });

        // Send the full list of online users to the newly connected socket
        socket.emit('online_users', Array.from(onlineUsers.keys()));

        // Send message (text)
        socket.on('send_message', async (data: { chatId: string; content: string }) => {
            try {
                const { chatId, content } = data;

                const chat = await Chat.findOne({ _id: chatId, participants: userId });
                if (!chat) return;

                const message = await Message.create({
                    chatId,
                    sender: userId,
                    content: content.trim(),
                    type: 'text',
                    status: 'sent',
                });

                chat.lastMessage = content.trim().substring(0, 100);
                chat.lastMessageAt = new Date();
                await chat.save();

                const populated = await Message.findById(message._id).populate('sender', 'name avatar');

                // Emit to all participants
                chat.participants.forEach((participantId) => {
                    const pid = participantId.toString();
                    io.to(pid).emit('new_message', populated);

                    // Auto-mark as delivered if recipient is online (not the sender)
                    if (pid !== userId && onlineUsers.has(pid)) {
                        Message.updateOne({ _id: message._id, status: 'sent' }, { status: 'delivered' }).exec();
                        io.to(userId).emit('message_status_update', {
                            messageId: message._id,
                            status: 'delivered',
                        });
                    }
                });
            } catch (error) {
                console.error('Socket send_message error:', error);
            }
        });

        // Send image message
        socket.on('send_image_message', async (data: { chatId: string; imageUrl: string }) => {
            try {
                const { chatId, imageUrl } = data;

                const chat = await Chat.findOne({ _id: chatId, participants: userId });
                if (!chat) return;

                const message = await Message.create({
                    chatId,
                    sender: userId,
                    content: '',
                    type: 'image',
                    imageUrl,
                    status: 'sent',
                });

                chat.lastMessage = '📷 Image';
                chat.lastMessageAt = new Date();
                await chat.save();

                const populated = await Message.findById(message._id).populate('sender', 'name avatar');

                chat.participants.forEach((participantId) => {
                    const pid = participantId.toString();
                    io.to(pid).emit('new_message', populated);

                    if (pid !== userId && onlineUsers.has(pid)) {
                        Message.updateOne({ _id: message._id, status: 'sent' }, { status: 'delivered' }).exec();
                        io.to(userId).emit('message_status_update', {
                            messageId: message._id,
                            status: 'delivered',
                        });
                    }
                });
            } catch (error) {
                console.error('Socket send_image_message error:', error);
            }
        });

        // Typing indicator
        socket.on('typing', async (data: { chatId: string; isTyping: boolean }) => {
            const { chatId, isTyping } = data;
            // Security: only emit if user is a participant in the chat
            const chat = await Chat.findOne({ _id: chatId, participants: userId });
            if (!chat) return;
            socket.to(chatId).emit('user_typing', { userId, isTyping });
        });

        // Join chat room
        socket.on('join_chat', (chatId: string) => {
            socket.join(chatId);
        });

        // Leave chat room
        socket.on('leave_chat', (chatId: string) => {
            socket.leave(chatId);
        });

        // Mark messages as read (WhatsApp blue ticks)
        socket.on('mark_seen', async (data: { chatId: string }) => {
            try {
                const result = await Message.updateMany(
                    { chatId: data.chatId, sender: { $ne: userId }, status: { $ne: 'read' } },
                    { $set: { status: 'read' } }
                );

                if (result.modifiedCount > 0) {
                    // Notify sender their messages were read
                    const chat = await Chat.findById(data.chatId);
                    if (chat) {
                        chat.participants.forEach((participantId) => {
                            if (participantId.toString() !== userId) {
                                io.to(participantId.toString()).emit('messages_read', {
                                    chatId: data.chatId,
                                    readBy: userId,
                                });
                            }
                        });
                    }
                }
            } catch (error) {
                console.error('Socket mark_seen error:', error);
            }
        });

        socket.on('disconnect', () => {
            onlineUsers.delete(userId);
            io.emit('user_offline', { userId });
            console.log(`🔴 User disconnected: ${userId}`);
        });
    });

    return io;
};
