import mongoose, { Schema } from 'mongoose';

const ReportSchema = new Schema(
  {
    reporterId: { type: String, required: true, maxlength: 254, index: true },
    reportedUserId: { type: String, required: true, maxlength: 254, index: true },
    reason: { type: String, required: true, maxlength: 200 },
    details: { type: String, maxlength: 2000 },
    status: { type: String, enum: ['open', 'reviewed', 'resolved'], default: 'open', index: true },
    collegeId: { type: String, index: true, maxlength: 100 },
  },
  { timestamps: true },
);

export const Report = mongoose.model('Report', ReportSchema);
