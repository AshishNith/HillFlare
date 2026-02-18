import mongoose, { Schema, Document } from 'mongoose';

export interface IChatDocument extends Document {
    matchId: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
    lastMessage: string;
    lastMessageAt: Date;
    createdAt: Date;
}

const chatSchema = new Schema<IChatDocument>(
    {
        matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true, unique: true },
        participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        lastMessage: { type: String, default: '' },
        lastMessageAt: { type: Date },
    },
    { timestamps: true }
);

chatSchema.index({ participants: 1 });

export const Chat = mongoose.model<IChatDocument>('Chat', chatSchema);
