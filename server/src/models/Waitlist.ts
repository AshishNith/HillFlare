import mongoose, { Schema, Document } from 'mongoose';

export interface IWaitlistDocument extends Document {
    name: string;
    email: string;
    createdAt: Date;
}

const waitlistSchema = new Schema<IWaitlistDocument>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    },
    { timestamps: true }
);

export const Waitlist = mongoose.model<IWaitlistDocument>('Waitlist', waitlistSchema);
