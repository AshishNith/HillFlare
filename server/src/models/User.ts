import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDocument extends Document {
    name: string;
    email: string;
    collegeId: string;
    department: string;
    year: number;
    interests: string[];
    clubs: string[];
    photos: string[];
    bio: string;
    avatar: string;
    isSuspended: boolean;
    role: 'user' | 'admin';
    isVerified: boolean;
    isProfileComplete: boolean;
    otp?: string;
    otpExpiresAt?: Date;
    refreshToken?: string;
    blockedUsers: mongoose.Types.ObjectId[];
    reportCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
    {
        name: { type: String, default: '' },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        collegeId: { type: String, default: '' },
        department: { type: String, default: '' },
        year: { type: Number, default: 1 },
        interests: [{ type: String }],
        clubs: [{ type: String }],
        photos: [{ type: String }],
        bio: { type: String, default: '', maxlength: 500 },
        avatar: { type: String, default: '' },
        isSuspended: { type: Boolean, default: false },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        isVerified: { type: Boolean, default: false },
        isProfileComplete: { type: Boolean, default: false },
        otp: { type: String },
        otpExpiresAt: { type: Date },
        refreshToken: { type: String },
        blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        reportCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ department: 1, year: 1 });
userSchema.index({ interests: 1 });
userSchema.index({ clubs: 1 });

export const User = mongoose.model<IUserDocument>('User', userSchema);
