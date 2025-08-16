import express from "express";
import authenticateUser from "../middleware/authenticateUser.js";
import { authorizeRoles } from "../middleware/authenticateUser.js";
import {
  createJobPost,
  deleteJobPost,
  getJobPostById,
  getJobPosts,
  updateJobPost,
} from "../controller/JobPostController.js";

const router = express.Router();

router.post(
  "/createJobPost",
  authenticateUser,
  authorizeRoles("recruiter"),
  createJobPost
);

router.get("/getAllJobsPost", getJobPosts);

router.get("/getJobPostById/:id", getJobPostById);

router.put(
  "/updateJobPost/:id",
  authenticateUser,
  authorizeRoles("recruiter"),
  updateJobPost
);
router.delete(
  "/deleteJobPost/:id",
  authenticateUser,
  authorizeRoles("recruiter"),
  deleteJobPost
);

export default router;
