import Position from "../model/PositionModel.js";

export const applyForPosition = async (req, res) => {
  try {
    const { position, emailSubject, emailBody } = req.body;

    if (!position || !emailSubject || !emailBody) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not authenticated" });
    }

    const positionData = new Position({
      userId: req.userId,
      position,
      emailSubject,
      emailBody,
    });
    await positionData.save();

    res.status(200).json({
      message: "Position Saved successfully",
      data: positionData,
    });
  } catch (err) {
    console.error("Email Send Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
