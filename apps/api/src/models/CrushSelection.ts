import mongoose, { Schema } from 'mongoose';

const CrushSelectionSchema = new Schema(
  {
    userId: { type: String, required: true, maxlength: 254 },
    targetUserId: { type: String, required: true, maxlength: 254 },
    revealed: { type: Boolean, default: false },
    collegeId: { type: String, index: true, maxlength: 100 },
  },
  { timestamps: true },
);

// Prevent duplicate crushes on same person
CrushSelectionSchema.index({ userId: 1, targetUserId: 1 }, { unique: true });
// For efficient lookups per user
CrushSelectionSchema.index({ userId: 1 });

export const CrushSelection = mongoose.model('CrushSelection', CrushSelectionSchema);
