import mongoose, { Schema, Document } from 'mongoose';

export interface ICrushSelectionDocument extends Document {
    userId: mongoose.Types.ObjectId;
    crushUserId: mongoose.Types.ObjectId;
    cycleMonth: string; // YYYY-MM format
    createdAt: Date;
}

const crushSelectionSchema = new Schema<ICrushSelectionDocument>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        crushUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        cycleMonth: { type: String, required: true },
    },
    { timestamps: true }
);

crushSelectionSchema.index({ userId: 1, cycleMonth: 1 });
crushSelectionSchema.index({ crushUserId: 1, cycleMonth: 1 });
crushSelectionSchema.index({ userId: 1, crushUserId: 1, cycleMonth: 1 }, { unique: true });

export const CrushSelection = mongoose.model<ICrushSelectionDocument>('CrushSelection', crushSelectionSchema);
