import express from "express";

import { applyToJob, getAppliedJobs, getAvailableJobs } from "../controller/AppliedController.js";
import authenticateUser from "../middleware/authenticateUser.js";

const router = express.Router();

router.post("/apply", authenticateUser, applyToJob);
router.get("/applied", authenticateUser, getAppliedJobs);
router.get("/available", authenticateUser, getAvailableJobs);

export default router;
