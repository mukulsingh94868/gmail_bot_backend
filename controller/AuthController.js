import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import Auth from "../model/AuthModel.js";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!["candidate", "recruiter"].includes(role || "candidate")) {
      return res.status(400).json({ message: "Invalid role provided" });
    }

    const existingUser = await Auth.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new Auth({
      name,
      email,
      password: hashedPassword,
      role: role || "candidate",
    });

    await user.save();

    res.status(201).json({
      statusCode: 201,
      message: `${
        role?.charAt(0).toUpperCase() + role?.slice(1).toLowerCase()
      } registered successfully`,
      userId: user?._id,
      role: user?.role,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await Auth.findOne({ email }).select("+password");
    // If no user exists → "Please Register First"
    if (!user) {
      return res.status(404).json({ message: "User not found, Please Register First" });
    }
    
    // If password doesn't match → "Invalid credentials"
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: user?._id,
        email: user?.email,
        name: user?.name,
        role: user?.role,
      },
      SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      statusCode: 200,
      message: "Login successful",
      token,
      data: {
        userId: user?._id,
        email: user?.email,
        name: user?.name,
        role: user?.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
