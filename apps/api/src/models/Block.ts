import mongoose, { Schema } from 'mongoose';

const BlockSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    targetUserId: { type: String, required: true, index: true },
    reason: { type: String },
  },
  { timestamps: true },
);

export const Block = mongoose.model('Block', BlockSchema);
