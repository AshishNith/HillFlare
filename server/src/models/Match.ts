import mongoose, { Schema, Document } from 'mongoose';

export interface IMatchDocument extends Document {
    user1: mongoose.Types.ObjectId;
    user2: mongoose.Types.ObjectId;
    createdAt: Date;
}

const matchSchema = new Schema<IMatchDocument>(
    {
        user1: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        user2: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

matchSchema.index({ user1: 1 });
matchSchema.index({ user2: 1 });

export const Match = mongoose.model<IMatchDocument>('Match', matchSchema);
