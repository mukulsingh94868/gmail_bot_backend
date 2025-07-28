import express from "express";
import { applyForPosition, deleteUserPosition, editUserPosition, getAvailablePositions, getUserPositionById, getUserPositionRecords, getUserPositions } from "../controller/PositionController.js";
import authenticateUser from "../middleware/authenticateUser.js";

const router = express.Router();

router.post("/positionApply", authenticateUser, applyForPosition);
router.get("/getUserPositions", authenticateUser, getUserPositions);
router.get("/getUserPositionsById/:id", authenticateUser, getUserPositionById);
router.put("/editUserPositions/:id", authenticateUser, editUserPosition);
router.delete("/deleteUserPositions/:id", authenticateUser, deleteUserPosition);
router.get("/options", authenticateUser, getAvailablePositions);
router.get("/postionRecord/:id", authenticateUser, getUserPositionRecords);

export default router;
