import express from "express";
import { applyForPosition, getAvailablePositions, getUserPositionRecords, getUserPositions } from "../controller/PositionController.js";
import authenticateUser from "../middleware/authenticateUser.js";

const router = express.Router();

router.post("/positionApply", authenticateUser, applyForPosition);
router.get("/getUserPositions", authenticateUser, getUserPositions);
router.get("/options", authenticateUser, getAvailablePositions);
router.get("/postionRecord/:id", authenticateUser, getUserPositionRecords);

export default router;
