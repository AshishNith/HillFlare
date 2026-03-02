import mongoose, { Schema } from 'mongoose';

const MessageSchema = new Schema(
  {
    chatId: { type: String, required: true, index: true },
    senderId: { type: String, required: true },
    body: { type: String },
    type: { type: String, enum: ['text', 'image', 'voice'], default: 'text' },
    mediaUrl: { type: String },
    seenBy: { type: [String], default: [] },
    collegeId: { type: String, index: true },
  },
  { timestamps: true },
);

export const Message = mongoose.model('Message', MessageSchema);
