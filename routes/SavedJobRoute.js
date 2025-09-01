import express from "express";
import {
  getSavedJobs,
  removeSavedJob,
  saveJobPost,
} from "../controller/SavedJobController.js";
import authenticateUser from "../middleware/authenticateUser.js";

const router = express.Router();

router.post("/", authenticateUser, saveJobPost);
router.get("/getSavedJobs", authenticateUser, getSavedJobs);
router.delete("/:jobId", authenticateUser, removeSavedJob);

export default router;
