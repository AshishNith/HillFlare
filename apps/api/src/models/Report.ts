import mongoose, { Schema } from 'mongoose';

const ReportSchema = new Schema(
  {
    reporterId: { type: String, required: true },
    reportedUserId: { type: String, required: true },
    reason: { type: String, required: true },
    details: { type: String },
    status: { type: String, enum: ['open', 'reviewed', 'resolved'], default: 'open' },
    collegeId: { type: String, index: true },
  },
  { timestamps: true },
);

export const Report = mongoose.model('Report', ReportSchema);
