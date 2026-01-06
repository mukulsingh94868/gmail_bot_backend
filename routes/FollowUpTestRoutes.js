// ============================================
// FILE: routes/followUpRoutes.js
// LOCATION: Place this in your backend routes folder
// ============================================

import express from "express";
import {
  sendFollowUp,
  checkFollowUpStatus,
  listFollowUps,
  getFollowUpDetail,
  markFollowUpResponded,
  deleteFollowUp,
} from "../controller/FollowUpTestController.js";
import authenticateUser from "../middleware/authenticateUser.js";

const router = express.Router();

/**
 * All follow-up routes require authentication
 * Adjust the middleware name (authenticateUser, authMiddleware, etc.) based on your setup
 */

/**
 * POST /api/followups/send
 * Send a follow-up email
 * Body: {
 *   emailApplied: "hr@company.com",
 *   positionApplied: "React Developer",
 *   originalMailId: "...", (optional)
 *   followUpTemplate: "Hi [Name], following up on..."
 * }
 */
router.post("/send", authenticateUser, sendFollowUp);

/**
 * GET /api/followups/check
 * Check follow-up status for an email
 * Query: ?emailApplied=hr@company.com&positionApplied=React%20Developer
 */
router.get("/check", authenticateUser, checkFollowUpStatus);

/**
 * GET /api/followups/list
 * Get all follow-ups for the logged-in user
 * Query: ?status=pending&limit=10&skip=0
 */
router.get("/list", authenticateUser, listFollowUps);

/**
 * GET /api/followups/:id
 * Get detailed follow-up record with all templates
 */
router.get("/:id", authenticateUser, getFollowUpDetail);

/**
 * PUT /api/followups/:id/mark-responded
 * Mark a follow-up as responded
 */
router.put("/:id/mark-responded", authenticateUser, markFollowUpResponded);

/**
 * DELETE /api/followups/:id
 * Delete a follow-up record
 */
router.delete("/:id", authenticateUser, deleteFollowUp);

export default router;
