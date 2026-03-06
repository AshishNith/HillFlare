import mongoose, { Schema } from 'mongoose';

const BlockSchema = new Schema(
  {
    userId: { type: String, required: true, maxlength: 254 },
    targetUserId: { type: String, required: true, maxlength: 254 },
    reason: { type: String, maxlength: 500 },
  },
  { timestamps: true },
);

// Compound unique index prevents duplicate blocks
BlockSchema.index({ userId: 1, targetUserId: 1 }, { unique: true });
// For reverse lookups (who blocked me)
BlockSchema.index({ targetUserId: 1 });

export const Block = mongoose.model('Block', BlockSchema);
