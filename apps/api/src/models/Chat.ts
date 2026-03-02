import mongoose, { Schema } from 'mongoose';

const ChatSchema = new Schema(
  {
    memberIds: { type: [String], required: true, index: true },
    lastMessage: { type: String },
    lastMessageType: { type: String, enum: ['text', 'image', 'voice'], default: 'text' },
    lastMessageAt: { type: Date },
    lastMessageSenderId: { type: String },
    collegeId: { type: String, index: true },
  },
  { timestamps: true },
);

export const Chat = mongoose.model('Chat', ChatSchema);
