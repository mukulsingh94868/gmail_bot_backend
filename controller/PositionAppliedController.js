import PositionAppliedModel from "../model/PositionAppliedModel.js";

export const PositionApplied = async (req, res) => {
  try {
    const { emailApplied, positionApplied, dateAndTime } = req.body;

    if (!emailApplied || !positionApplied || !dateAndTime) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newEntry = new PositionAppliedModel({
      userId: req.userId,
      emailApplied,
      positionApplied,
      dateAndTime,
    });

    await newEntry.save();

    return res.status(201).json({
      statusCode: 201,
      message: "Successfully Sended Mail",
      data: newEntry,
    });
  } catch (error) {
    console.error("Error saving position applied:", error);
    return res.status(500).json({ message: "Server error." });
  }
};

export const getPositionApplied = async (req, res) => {
  const userId = req.userId;
  try {
    const positionApplied = await PositionAppliedModel.find({ userId });

    return res.status(200).json({
      statusCode: 200,
      message: "Position applied data fetched successfully.",
      data: positionApplied,
    });
  } catch (error) {
    console.error("Error fetching position applied:", error);
    return res.status(500).json({ message: "Server error." });
  }
};
