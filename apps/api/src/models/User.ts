import mongoose, { Schema } from 'mongoose';

const GENDER_ENUM = ['male', 'female', 'non-binary', 'prefer_not_to_say'] as const;
const INTERESTED_IN_ENUM = ['male', 'female', 'non-binary'] as const;

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    collegeId: { type: String, index: true },
    department: { type: String },
    year: { type: Number },
    bio: { type: String },
    gender: { type: String, enum: GENDER_ENUM, default: null },
    interestedIn: { type: [String], enum: INTERESTED_IN_ENUM, default: [] },
    interests: { type: [String], default: [] },
    clubs: { type: [String], default: [] },
    lookingFor: { type: String },
    avatarUrl: { type: String },
    galleryUrls: { type: [String], default: [] },
    verified: { type: Boolean, default: false },
    pushToken: { type: String },
  },
  { timestamps: true },
);

// Indexes for discover filtering
UserSchema.index({ gender: 1, collegeId: 1 });
UserSchema.index({ interestedIn: 1 });

export const User = mongoose.model('User', UserSchema);
