import jwt from "jsonwebtoken";
import Auth from "../model/AuthModel.js";

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.role)) {
      return res.status(403).json({
        message: "Access Denied: You do not have the required role",
      });
    }
    next();
  };
};

const authenticateUser = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "Access Denied: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await Auth.findById(decoded?.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.userId = user?._id;
    req.name = user?.name;
    req.email = user?.email;
    req.role = user?.role;

    next();
  } catch (err) {
    console.log("JWT Error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authenticateUser;
