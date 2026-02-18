import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationDocument extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'match' | 'crush_reveal' | 'message' | 'report_update' | 'system';
    title: string;
    body: string;
    referenceId: mongoose.Types.ObjectId;
    read: boolean;
    createdAt: Date;
}

const notificationSchema = new Schema<INotificationDocument>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, enum: ['match', 'crush_reveal', 'message', 'report_update', 'system'], required: true },
        title: { type: String, required: true },
        body: { type: String, default: '' },
        referenceId: { type: Schema.Types.ObjectId },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model<INotificationDocument>('Notification', notificationSchema);
