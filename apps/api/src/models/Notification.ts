import mongoose, { Schema } from 'mongoose';

const NotificationSchema = new Schema(
  {
    userId: { type: String, required: true, maxlength: 254 },
    type: { type: String, required: true, maxlength: 50 },
    payload: { type: Schema.Types.Mixed },
    read: { type: Boolean, default: false },
    collegeId: { type: String, index: true, maxlength: 100 },
  },
  { timestamps: true },
);

// Compound index for efficient notification queries (unread first, newest first)
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', NotificationSchema);
