const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userEmail: { type: String },
    action: { type: String, required: true },
    resource: { type: String }, // 'report', 'user', 'category', etc.
    resourceId: { type: mongoose.Schema.Types.ObjectId },
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },
    details: { type: mongoose.Schema.Types.Mixed },
    ip: { type: String },
  },
  { timestamps: true }
);

ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ userId: 1 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
