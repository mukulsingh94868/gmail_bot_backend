import mongoose from "mongoose";

const positionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Auth", required: true },
  position: { type: String, required: true },
  emailSubject: { type: String, required: true },
  emailBody: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Position = mongoose.model("Position", positionSchema);

export default Position;
