import mongoose, { Schema } from 'mongoose';

const CrushSelectionSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    targetUserId: { type: String, required: true },
    revealed: { type: Boolean, default: false },
    collegeId: { type: String, index: true },
  },
  { timestamps: true },
);

export const CrushSelection = mongoose.model('CrushSelection', CrushSelectionSchema);
