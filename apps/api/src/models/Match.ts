import mongoose, { Schema } from 'mongoose';

const MatchSchema = new Schema(
  {
    user1Id: { type: String, required: true, index: true },
    user2Id: { type: String, required: true, index: true },
  },
  { timestamps: true },
);

export const Match = mongoose.model('Match', MatchSchema);
