// models/ApplicationModel.js
import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobPost",
      required: true,
    },
    status: {
      type: String,
      enum: ["Applied"],
      default: "Applied",
    },
  },
  { timestamps: true }
);

applicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export default mongoose.model("Application", applicationSchema);
