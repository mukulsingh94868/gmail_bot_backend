import JobPost from "../model/JDModel.js";
import SavedJob from "../model/SavedJobModel.js";

// Save a job
export const saveJobPost = async (req, res) => {
  try {
    const userId = req.userId;
    const { jobId } = req.body;
    
    const jobExists = await JobPost.findById(jobId);
    if (!jobExists) {
      return res.status(404).json({ message: "Job post not found" });
    }

    const savedJob = await SavedJob.create({ userId, jobId });
    res.status(201).json({ statusCode: 201, savedJob, message: "Job saved successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Job already saved" });
    }
    res.status(500).json({ message: "Error saving job", error: error.message });
  }
};

// Get all saved jobs for a user
export const getSavedJobs = async (req, res) => {
  try {
    const userId = req.userId;

    const savedJobs = await SavedJob.find({ userId })
      .populate("jobId")
      .sort({ createdAt: -1 });

    res.json({ savedJobs });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching saved jobs", error: error.message });
  }
};

// Remove a saved job
export const removeSavedJob = async (req, res) => {
  try {
    const userId = req.userId;
    const { jobId } = req.params;

    const removed = await SavedJob.findOneAndDelete({ userId, jobId });
    if (!removed) {
      return res.status(404).json({ message: "Saved job not found" });
    }

    res.json({ message: "Job removed from saved list" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing saved job", error: error.message });
  }
};
