import mongoose from "mongoose";

const positionAppliedSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Auth", required: true },
  emailApplied: [{
    type: String,
    required: true,
  }],
  positionApplied: {
    type: String,
    required: true,
  },
  dateAndTime: {
    type: Date,
    default: Date.now,
  },
});

const PositionAppliedModel = mongoose.model(
  "PositionApplied",
  positionAppliedSchema
);

export default PositionAppliedModel;
