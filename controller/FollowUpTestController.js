// ============================================
// FILE: controllers/followUpController.js
// LOCATION: Place this in your backend controllers folder
// ============================================

import FollowUp from "../model/FollowUpTestModel.js";

/**
 * POST /api/followups/send
 * Send a follow-up email and record it in the database
 * Validation: max 3 follow-ups per unique (userId, emailApplied, positionApplied) tuple
 */
export const sendFollowUp = async (req, res) => {
  try {
    const { emailApplied, positionApplied, originalMailId, followUpTemplate } =
      req.body;
    const userId = req.userId; // adjust based on your auth middleware

    // Validation
    if (!emailApplied || !positionApplied || !followUpTemplate) {
      return res.status(400).json({
        statusCode: 400,
        message:
          "Missing required fields: emailApplied, positionApplied, followUpTemplate",
      });
    }

    if (!userId) {
      return res.status(401).json({
        statusCode: 401,
        message: "User not authenticated",
      });
    }

    // Check or create follow-up record scoped to positionApplied
    // This ensures follow-up counts are tracked per (userId, emailApplied, positionApplied)
    let followUpRecord = await FollowUp.findOne({
      userId,
      emailApplied,
      positionApplied,
    });

    if (!followUpRecord) {
      // First time following up for this email+position - create new record
      followUpRecord = new FollowUp({
        userId,
        emailApplied,
        positionApplied,
        originalMailId,
        followUpCount: 1,
        status: "sent",
        lastFollowUpDate: new Date(),
        followUpDates: [new Date()],
        followUpTemplates: [
          {
            templateText: followUpTemplate,
            sentAt: new Date(),
            followUpNumber: 1,
          },
        ],
      });
    } else {
      // Existing record - validate and increment
      if (followUpRecord.followUpCount >= 3) {
        return res.status(400).json({
          statusCode: 400,
          message: "Maximum follow-ups (3) reached for this email and position",
          data: {
            followUpCount: followUpRecord.followUpCount,
            canFollowUp: false,
          },
        });
      }

      // Increment follow-up count
      followUpRecord.followUpCount += 1;
      followUpRecord.lastFollowUpDate = new Date();
      followUpRecord.status = "sent";
      followUpRecord.followUpDates.push(new Date());
      followUpRecord.followUpTemplates.push({
        templateText: followUpTemplate,
        sentAt: new Date(),
        followUpNumber: followUpRecord.followUpCount,
      });

      // Update position if provided (in case it changed)
      if (positionApplied) {
        followUpRecord.positionApplied = positionApplied;
      }
    }
    
    // Save the record
    await followUpRecord.save();

    // Return success response
    return res.status(201).json({
      statusCode: 201,
      message: "Follow-up sent successfully",
      data: {
        followUpId: followUpRecord._id,
        followUpCount: followUpRecord.followUpCount,
        canFollowUp: followUpRecord.followUpCount < 3,
        lastFollowUpDate: followUpRecord.lastFollowUpDate,
        nextFollowUpAllowed: followUpRecord.followUpCount < 3,
      },
    });
  } catch (error) {
    console.error("Error in sendFollowUp:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Error sending follow-up",
      error: error.message,
    });
  }
};

/**
 * GET /api/followups/check
 * Check follow-up count and history for a specific email
 * Query params: ?emailApplied=...&positionApplied=...
 */
export const checkFollowUpStatus = async (req, res) => {
  try {
    const { emailApplied, positionApplied } = req.query;
    const userId = req.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        statusCode: 401,
        message: "User not authenticated",
      });
    }

    // Require both email and position when checking follow-ups so status is per-position
    if (!emailApplied || !positionApplied) {
      return res.status(400).json({
        statusCode: 400,
        message:
          "emailApplied and positionApplied query parameters are required",
      });
    }

    // Find follow-up record scoped to the position
    const followUpRecord = await FollowUp.findOne({
      userId,
      emailApplied,
      positionApplied,
    });

    if (!followUpRecord) {
      // No follow-ups yet
      return res.status(200).json({
        statusCode: 200,
        data: {
          emailApplied,
          followUpCount: 0,
          canFollowUp: true,
          lastFollowUpDate: null,
          followUpDates: [],
          message: "No follow-ups sent yet",
        },
      });
    }

    // Return existing follow-up data
    return res.status(200).json({
      statusCode: 200,
      data: {
        emailApplied,
        positionApplied: followUpRecord.positionApplied,
        followUpCount: followUpRecord.followUpCount,
        canFollowUp: followUpRecord.followUpCount < 3,
        lastFollowUpDate: followUpRecord.lastFollowUpDate,
        followUpDates: followUpRecord.followUpDates,
        status: followUpRecord.status,
        respondedAt: followUpRecord.respondedAt,
      },
    });
  } catch (error) {
    console.error("Error in checkFollowUpStatus:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Error checking follow-up status",
      error: error.message,
    });
  }
};

/**
 * GET /api/followups/list
 * Get all follow-ups for the current user
 * Optional query: ?status=pending&limit=10&skip=0
 */
export const listFollowUps = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    const {
      status = "pending",
      limit = 10,
      skip = 0,
      positionApplied,
    } = req.query;

    if (!userId) {
      return res.status(401).json({
        statusCode: 401,
        message: "User not authenticated",
      });
    }

    // Build query
    const query = { userId };
    if (status) {
      query.status = status;
    }
    // optional filter by positionApplied to list follow-ups for a specific position
    if (positionApplied) {
      query.positionApplied = positionApplied;
    }

    // Fetch follow-ups
    const followUps = await FollowUp.find(query)
      .sort({ lastFollowUpDate: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .select("-followUpTemplates"); // Exclude templates from list view for performance

    const total = await FollowUp.countDocuments(query);

    return res.status(200).json({
      statusCode: 200,
      data: {
        followUps,
        total,
        limit: Number(limit),
        skip: Number(skip),
        hasMore: Number(skip) + Number(limit) < total,
      },
    });
  } catch (error) {
    console.error("Error in listFollowUps:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Error listing follow-ups",
      error: error.message,
    });
  }
};

/**
 * GET /api/followups/:id
 * Get detailed follow-up record including all templates
 */
export const getFollowUpDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        statusCode: 401,
        message: "User not authenticated",
      });
    }

    const followUpRecord = await FollowUp.findById(id);

    if (!followUpRecord) {
      return res.status(404).json({
        statusCode: 404,
        message: "Follow-up record not found",
      });
    }

    // Verify ownership (compare string forms to be safe with ObjectId vs string)
    if (followUpRecord.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        statusCode: 403,
        message: "Unauthorized: You do not own this follow-up record",
      });
    }

    return res.status(200).json({
      statusCode: 200,
      data: followUpRecord,
    });
  } catch (error) {
    console.error("Error in getFollowUpDetail:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Error fetching follow-up detail",
      error: error.message,
    });
  }
};

/**
 * PUT /api/followups/:id/mark-responded
 * Mark a follow-up as responded by the HR
 */
export const markFollowUpResponded = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        statusCode: 401,
        message: "User not authenticated",
      });
    }

    const followUpRecord = await FollowUp.findById(id);

    if (!followUpRecord) {
      return res.status(404).json({
        statusCode: 404,
        message: "Follow-up record not found",
      });
    }

    if (followUpRecord.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        statusCode: 403,
        message: "Unauthorized",
      });
    }

    followUpRecord.status = "responded";
    followUpRecord.respondedAt = new Date();
    await followUpRecord.save();

    return res.status(200).json({
      statusCode: 200,
      message: "Follow-up marked as responded",
      data: followUpRecord,
    });
  } catch (error) {
    console.error("Error in markFollowUpResponded:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Error updating follow-up status",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/followups/:id
 * Delete a follow-up record (soft delete recommended)
 */
export const deleteFollowUp = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        statusCode: 401,
        message: "User not authenticated",
      });
    }

    const followUpRecord = await FollowUp.findById(id);

    if (!followUpRecord) {
      return res.status(404).json({
        statusCode: 404,
        message: "Follow-up record not found",
      });
    }

    if (followUpRecord.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        statusCode: 403,
        message: "Unauthorized",
      });
    }

    await FollowUp.findByIdAndDelete(id);

    return res.status(200).json({
      statusCode: 200,
      message: "Follow-up deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteFollowUp:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Error deleting follow-up",
      error: error.message,
    });
  }
};
