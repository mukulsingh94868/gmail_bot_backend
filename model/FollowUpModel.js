// ============================================
// FILE: models/FollowUp.js
// LOCATION: Place this in your backend models folder
// ============================================

import mongoose from "mongoose";

const followUpSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    emailApplied: {
      type: String,
      required: true,
      lowercase: true,
    },
    positionApplied: {
      type: String,
      required: true,
    },
    originalMailId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Apply", // or whatever your original mail collection is called
      default: null,
    },
    followUpCount: {
      type: Number,
      default: 0,
      min: 0,
      max: 3,
    },
    lastFollowUpDate: {
      type: Date,
      default: null,
    },
    followUpDates: [
      {
        type: Date,
      },
    ],
    status: {
      type: String,
      enum: ["pending", "sent", "responded"],
      default: "pending",
    },
    followUpTemplates: [
      {
        templateText: String,
        sentAt: Date,
        followUpNumber: Number, // 1st, 2nd, or 3rd follow-up
      },
    ],
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index on userId and emailApplied
// This ensures only one follow-up record per user per email
followUpSchema.index({ userId: 1, emailApplied: 1 }, { unique: true });

// Index for querying pending follow-ups
followUpSchema.index({ userId: 1, status: 1 });

// Index for analytics - follow-ups by date
followUpSchema.index({ createdAt: -1 });

const FollowUp = mongoose.model("FollowUp", followUpSchema);

export default FollowUp;
