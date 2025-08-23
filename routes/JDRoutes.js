// routes/jobPostRoutes.js
import express from "express";
import { createJobPost, deleteJobPost, getAllJobPosts, getAllRecruiterJobPosts, getJobPostById, updateJobPost } from "../controller/JDController.js";
import authenticateUser, { authorizeRoles } from "../middleware/authenticateUser.js";

const router = express.Router();

router.post("/createJd", authenticateUser, authorizeRoles("recruiter"), createJobPost);
router.get("/getRecruiterJds", authenticateUser, authorizeRoles("recruiter"), getAllRecruiterJobPosts);
router.put("/updateJd/:id", authenticateUser, authorizeRoles("recruiter"), updateJobPost);
router.delete("/deleteJd/:id", authenticateUser, authorizeRoles("recruiter"), deleteJobPost);
router.get("/getJd/:id", getJobPostById);
router.get("/getAllJds", authenticateUser, getAllJobPosts);

export default router;
