import mongoose from "mongoose";

const jobPostSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    JD: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("JobPost", jobPostSchema);
