import mongoose, { Schema, Document } from 'mongoose';

export interface ISwipeDocument extends Document {
    fromUser: mongoose.Types.ObjectId;
    toUser: mongoose.Types.ObjectId;
    type: 'like' | 'pass';
    createdAt: Date;
}

const swipeSchema = new Schema<ISwipeDocument>(
    {
        fromUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        toUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, enum: ['like', 'pass'], required: true },
    },
    { timestamps: true }
);

swipeSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });
swipeSchema.index({ toUser: 1, type: 1 });

export const Swipe = mongoose.model<ISwipeDocument>('Swipe', swipeSchema);
