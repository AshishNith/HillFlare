import mongoose, { Schema } from 'mongoose';

const MatchSchema = new Schema(
  {
    user1Id: { type: String, required: true, maxlength: 254 },
    user2Id: { type: String, required: true, maxlength: 254 },
  },
  { timestamps: true },
);

// Compound index for efficient lookup + prevents duplicate matches
MatchSchema.index({ user1Id: 1, user2Id: 1 }, { unique: true });
MatchSchema.index({ user2Id: 1 });

export const Match = mongoose.model('Match', MatchSchema);
