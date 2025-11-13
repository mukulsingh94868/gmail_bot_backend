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
} from "../controller/FollowUpController.js";

const router = express.Router();

/**
 * All follow-up routes require authentication
 * Adjust the middleware name (protect, authMiddleware, etc.) based on your setup
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
router.post("/send", protect, sendFollowUp);

/**
 * GET /api/followups/check
 * Check follow-up status for an email
 * Query: ?emailApplied=hr@company.com&positionApplied=React%20Developer
 */
router.get("/check", protect, checkFollowUpStatus);

/**
 * GET /api/followups/list
 * Get all follow-ups for the logged-in user
 * Query: ?status=pending&limit=10&skip=0
 */
router.get("/list", protect, listFollowUps);

/**
 * GET /api/followups/:id
 * Get detailed follow-up record with all templates
 */
router.get("/:id", protect, getFollowUpDetail);

/**
 * PUT /api/followups/:id/mark-responded
 * Mark a follow-up as responded
 */
router.put("/:id/mark-responded", protect, markFollowUpResponded);

/**
 * DELETE /api/followups/:id
 * Delete a follow-up record
 */
router.delete("/:id", protect, deleteFollowUp);

export default router;
