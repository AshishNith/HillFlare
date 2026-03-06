import mongoose, { Schema } from 'mongoose';

const ChatSchema = new Schema(
  {
    memberIds: { type: [String], required: true },
    lastMessage: { type: String, maxlength: 200 },
    lastMessageType: { type: String, enum: ['text', 'image', 'voice'], default: 'text' },
    lastMessageAt: { type: Date },
    lastMessageSenderId: { type: String, maxlength: 254 },
    collegeId: { type: String, maxlength: 100 },
  },
  { timestamps: true },
);

// Compound index for finding chats by members
ChatSchema.index({ memberIds: 1 });
// Index for sorting by latest message
ChatSchema.index({ lastMessageAt: -1 });

export const Chat = mongoose.model('Chat', ChatSchema);
