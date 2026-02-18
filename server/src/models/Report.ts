import mongoose, { Schema, Document } from 'mongoose';

export interface IReportDocument extends Document {
    reporter: mongoose.Types.ObjectId;
    reportedUser: mongoose.Types.ObjectId;
    reason: string;
    description: string;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    createdAt: Date;
}

const reportSchema = new Schema<IReportDocument>(
    {
        reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        reportedUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        reason: { type: String, required: true },
        description: { type: String, default: '' },
        status: { type: String, enum: ['pending', 'reviewed', 'resolved', 'dismissed'], default: 'pending' },
    },
    { timestamps: true }
);

reportSchema.index({ reportedUser: 1 });
reportSchema.index({ status: 1 });

export const Report = mongoose.model<IReportDocument>('Report', reportSchema);
