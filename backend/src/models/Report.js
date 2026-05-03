const mongoose = require('mongoose');

const InternalNoteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
});

const ReportSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      unique: true,
      default: () => Math.random().toString(36).substring(2, 10).toUpperCase(),
    },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isAnonymous: { type: Boolean, default: false },
    // Reporter contact for anonymous (optional)
    anonymousContact: { type: String },

    // Images
    photo: { type: String, required: true },     // main complaint photo URL
    photoPublicId: { type: String },
    beforePhoto: { type: String },
    beforePhotoPublicId: { type: String },
    afterPhoto: { type: String },
    afterPhotoPublicId: { type: String },

    // Location (GeoJSON)
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: { type: String },
      landmark: { type: String },
    },

    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    description: { type: String, trim: true },

    status: {
      type: String,
      enum: ['pending', 'assigned', 'in_progress', 'in_review', 'completed', 'rejected'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    assignedAt: { type: Date },

    nagarPalikaId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    upvoteCount: { type: Number, default: 0 },

    internalNotes: [InternalNoteSchema],

    completedAt: { type: Date },
    rejectionReason: { type: String },

    // Status timeline
    statusHistory: [
      {
        status: String,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// 2dsphere index for geospatial queries
ReportSchema.index({ location: '2dsphere' });
ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Report', ReportSchema);
