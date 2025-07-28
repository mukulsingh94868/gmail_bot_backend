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
      statusCode: 200,
      message: "Position Saved successfully",
      data: positionData,
    });
  } catch (err) {
    console.error("Email Send Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserPositions = async (req, res) => {
  try {
    const userId = req.userId;

    const positions = await Position.find({ userId });

    res.status(200).json({
      statusCode: 200,
      message: "User positions fetched successfully",
      data: positions,
    });
  } catch (error) {
    console.error("Fetch User Positions Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAvailablePositions = async (req, res) => {
  try {
    const userId = req.userId;

    const positions = await Position.find({ userId }).select("position -_id");

    const positionList = positions.map((pos) => pos.position);

    const uniquePositions = [...new Set(positionList)]?.map(
      (position, index) => ({
        _id: index + 1,
        name: position,
      })
    );

    res.status(200).json({
      statusCode: 200,
      message: "Available positions fetched successfully",
      data: uniquePositions,
    });
  } catch (error) {
    console.error("Get Positions Options Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserPositionRecords = async (req, res) => {
  try {
    const userId = req.userId;
    const positionId = parseInt(req.params.id);

    if (!positionId || positionId <= 0) {
      return res.status(400).json({ message: "Invalid position ID" });
    }

    const userPositions = await Position.find({ userId }).select("position -_id");

    const uniquePositions = [...new Set(userPositions.map((pos) => pos.position))];

    const index = positionId - 1;
    if (index < 0 || index >= uniquePositions.length) {
      return res.status(404).json({ message: "Position not found for given ID" });
    }

    const selectedPosition = uniquePositions[index];

    const records = await Position.find({ userId, position: selectedPosition });

    res.status(200).json({
      statusCode: 200,
      message: `Records for '${selectedPosition}' fetched successfully`,
      data: records,
    });
  } catch (error) {
    console.error("Fetch Position Records Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const PositionApplied = async (req, res) => {

}
