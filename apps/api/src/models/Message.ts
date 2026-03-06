import mongoose, { Schema } from 'mongoose';

const MessageSchema = new Schema(
  {
    chatId: { type: String, required: true },
    senderId: { type: String, required: true, maxlength: 254 },
    body: { type: String, maxlength: 5000 },
    type: { type: String, enum: ['text', 'image', 'voice'], default: 'text' },
    mediaUrl: { type: String, maxlength: 2048 },
    seenBy: { type: [String], default: [] },
    collegeId: { type: String, maxlength: 100 },
  },
  { timestamps: true },
);

// Compound index for efficient message pagination by chat
MessageSchema.index({ chatId: 1, createdAt: -1, _id: -1 });
// Index for unread count queries
MessageSchema.index({ chatId: 1, senderId: 1, seenBy: 1 });

export const Message = mongoose.model('Message', MessageSchema);
