import express from "express";
import {
  getPositionApplied,
  PositionApplied,
} from "../controller/PositionAppliedController.js";
import authenticateUser from "../middleware/authenticateUser.js";

const router = express.Router();

router.post("/position-applied", authenticateUser, PositionApplied);
router.get("/get-position-applied", authenticateUser, getPositionApplied);

export default router;
