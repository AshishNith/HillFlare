import mongoose, { Schema } from 'mongoose';

const GENDER_ENUM = ['male', 'female', 'non-binary', 'prefer_not_to_say'] as const;
const INTERESTED_IN_ENUM = ['male', 'female', 'non-binary'] as const;

const UserSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 100, trim: true },
    email: { type: String, required: true, unique: true, maxlength: 254, trim: true, lowercase: true },
    collegeId: { type: String, index: true, maxlength: 100 },
    department: { type: String, maxlength: 100 },
    year: { type: Number, min: 1, max: 6 },
    bio: { type: String, maxlength: 500 },
    gender: { type: String, enum: GENDER_ENUM, default: null },
    interestedIn: { type: [String], enum: INTERESTED_IN_ENUM, default: [] },
    interests: { type: [String], default: [], validate: [(v: string[]) => v.length <= 20, 'Too many interests (max 20)'] },
    clubs: { type: [String], default: [], validate: [(v: string[]) => v.length <= 10, 'Too many clubs (max 10)'] },
    lookingFor: { type: String, maxlength: 100 },
    avatarUrl: { type: String, maxlength: 2048 },
    galleryUrls: { type: [String], default: [], validate: [(v: string[]) => v.length <= 6, 'Too many gallery images (max 6)'] },
    verified: { type: Boolean, default: false },
    pushToken: { type: String, maxlength: 500 },
  },
  { timestamps: true },
);

// Exclude pushToken from JSON responses to prevent leaking to other users
UserSchema.set('toJSON', {
  transform: (_doc, ret: Record<string, unknown>) => {
    delete ret.pushToken;
    delete ret.__v;
    return ret;
  },
});

// Indexes for discover filtering
UserSchema.index({ gender: 1, collegeId: 1 });
UserSchema.index({ interestedIn: 1 });

export const User = mongoose.model('User', UserSchema);
