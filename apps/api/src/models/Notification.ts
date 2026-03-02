import mongoose, { Schema } from 'mongoose';

const NotificationSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    type: { type: String, required: true },
    payload: { type: Schema.Types.Mixed },
    read: { type: Boolean, default: false },
    collegeId: { type: String, index: true },
  },
  { timestamps: true },
);

export const Notification = mongoose.model('Notification', NotificationSchema);
