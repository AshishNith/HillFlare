import mongoose, { Schema } from 'mongoose';

const SwipeSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    targetUserId: { type: String, required: true, index: true },
    direction: { type: String, enum: ['left', 'right'], required: true },
  },
  { timestamps: true },
);

// Ensure one swipe per user-target pair
SwipeSchema.index({ userId: 1, targetUserId: 1 }, { unique: true });

export const Swipe = mongoose.model('Swipe', SwipeSchema);
