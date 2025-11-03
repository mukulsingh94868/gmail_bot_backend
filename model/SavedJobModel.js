import mongoose from "mongoose";

const savedJobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    jobId: {
      type: String,
      required: true,
    },
    JD: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

savedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });

export default mongoose.model("SavedJob", savedJobSchema);
