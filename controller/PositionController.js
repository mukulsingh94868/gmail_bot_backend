import axios from "axios";
import Position from "../model/PositionModel.js";
// import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleGenerativeAI } from "@google/generative-ai";

import dotenv from "dotenv";

dotenv.config();

// ✅ Initialize the Gemini AI client with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

export const getUserPositionById = async (req, res) => {
  try {
    const positionId = req.params.id;
    const position = await Position.findById(positionId);

    if (!position) {
      return res.status(404).json({ message: "Position not found" });
    }

    res.status(200).json({
      statusCode: 200,
      message: "User position fetched successfully",
      data: position,
    });
  } catch (error) {
    console.error("Fetch User Position Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const editUserPosition = async (req, res) => {
  try {
    const positionId = req.params.id;
    const { position, emailSubject, emailBody } = req.body;

    if (!position || !emailSubject || !emailBody) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not authenticated" });
    }

    const updatedPosition = await Position.findByIdAndUpdate(
      positionId,
      {
        position,
        emailSubject,
        emailBody,
      },
      { new: true }
    );

    if (!updatedPosition) {
      return res.status(404).json({ message: "Position not found" });
    }

    res.status(200).json({
      statusCode: 200,
      message: "Position updated successfully",
      data: updatedPosition,
    });
  } catch (err) {
    console.error("Email Send Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUserPosition = async (req, res) => {
  try {
    const positionId = req.params.id;

    if (!req.userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not authenticated" });
    }

    const deletedPosition = await Position.findByIdAndDelete(positionId);

    if (!deletedPosition) {
      return res.status(404).json({ message: "Position not found" });
    }

    res.status(200).json({
      statusCode: 200,
      message: "Position deleted successfully",
    });
  } catch (err) {
    console.error("Email Send Error:", err);
    res.status(500).json({ message: "Internal server error" });
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

    const userPositions = await Position.find({ userId }).select(
      "position -_id"
    );

    const uniquePositions = [
      ...new Set(userPositions.map((pos) => pos.position)),
    ];

    const index = positionId - 1;
    if (index < 0 || index >= uniquePositions.length) {
      return res
        .status(404)
        .json({ message: "Position not found for given ID" });
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

// export const generateMail = async (req, res) => {
//   const { position } = req.body;
//   const applicantName = req.name;
//   const applicantEmail = req.email;

//   try {
//     const prompt = `${position}`;

//     const response = await axios.post(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
//       {
//         contents: [
//           {
//             parts: [{ text: prompt }],
//           },
//         ],
//       }
//     );

//     const fullText = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;

//     let subject = "";
//     let body = "";

//     if (fullText) {
//       const [subjectLine, ...bodyLines] = fullText.split("\n\n");
//       subject = subjectLine.replace(/^Subject:\s*/i, "").trim();

//       subject = subject.replace(/\[Your Name\]/i, applicantName);

//       body = bodyLines.join("\n\n").trim();
//       body = body
//         .replace(/\[Your Name\]/gi, applicantName)
//         .replace(/\[Your Email Address\]/gi, applicantEmail || "");
//     }

//     res.status(200).json({
//       statusCode: 200,
//       message: `Email is generated successfully`,
//       data: {
//         subject,
//         body,
//       },
//     });
//   } catch (error) {
//     console.error(
//       "Error generating email:",
//       error.response?.data || error.message
//     );
//     res.status(500).json({
//       statusCode: 500,
//       message: "Error generating email",
//       error: error.response?.data || error.message,
//     });
//   }
// };

async function generateContentWithRetry(
  model,
  prompt,
  retries = 3,
  delay = 2000
) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result;
    } catch (error) {
      if (error.message.includes("503")) {
        console.warn(`Gemini overloaded. Retrying... (${i + 1}/${retries})`);
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error("Gemini API is overloaded. Please try again later.");
}

export const generateMail = async (req, res) => {
  const { position } = req.body;
  const applicantName = req.name;
  const applicantEmail = req.email;

  try {
    // const prompt = `Write a professional email regarding the position: ${position}.`;
    const prompt = `${position}`;
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // ✅ valid model
    // const result = await model.generateContent(prompt);
    const result = await generateContentWithRetry(model, prompt);

    const fullText = result.response.text();
    let subject = "",
      body = "";

    if (fullText) {
      const [subjectLine, ...bodyLines] = fullText.split("\n\n");
      subject = subjectLine.replace(/^Subject:\s*/i, "").trim();
      subject = subject.replace("[Your Name]", applicantName);
      body = bodyLines.join("\n\n").trim();
      body = body
        .replace(/\[Your Name\]/gi, applicantName)
        .replace(/\[Your Email Address\]/gi, applicantEmail || "");
    }

    res.status(200).json({
      statusCode: 200,
      message: "Email is generated successfully",
      data: { subject, body },
    });
  } catch (error) {
    console.error("Error generating email:", error);
    res.status(500).json({
      statusCode: 500,
      message: "Error generating email",
      error: error.message,
    });
  }
};
