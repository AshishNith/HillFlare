import mongoose, { Schema } from 'mongoose';

const CollegeSchema = new Schema(
  {
    name: { type: String, required: true },
    domain: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

export const College = mongoose.model('College', CollegeSchema);
