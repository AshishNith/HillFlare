import mongoose, { Schema, Document } from 'mongoose';

export interface IMessageDocument extends Document {
    chatId: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    content: string;
    type: 'text' | 'image';
    imageUrl?: string;
    status: 'sent' | 'delivered' | 'read';
    timestamp: Date;
}

const messageSchema = new Schema<IMessageDocument>(
    {
        chatId: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
        sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, default: '', maxlength: 2000 },
        type: { type: String, enum: ['text', 'image'], default: 'text' },
        imageUrl: { type: String },
        status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

messageSchema.index({ chatId: 1, timestamp: -1 });

export const Message = mongoose.model<IMessageDocument>('Message', messageSchema);
