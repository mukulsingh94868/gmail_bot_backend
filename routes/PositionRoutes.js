import express from "express";
import { applyForPosition } from "../controller/PositionController.js";
import authenticateUser from "../middleware/authenticateUser.js";

const router = express.Router();

router.post("/positionApply", authenticateUser, applyForPosition);

export default router;
