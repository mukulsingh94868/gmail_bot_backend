import Application from "../model/AppliedModel.js";
import JobPost from "../model/JDModel.js";

export const applyToJob = async (req, res) => {
  try {
    const userId = req.userId;
    const { jobId } = req.body;

    const job = await JobPost.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const application = await Application.create({ userId, jobId });
    res.status(201).json({ application, message: "Applied successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Already applied to this job" });
    }
    res
      .status(500)
      .json({ message: "Error applying to job", error: error.message });
  }
};

export const getAppliedJobs = async (req, res) => {
  try {
    const userId = req.userId;

    const applications = await Application.find({ userId })
      .populate("jobId")
      .sort({ createdAt: -1 });

    res.json({ appliedJobs: applications });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching applied jobs", error: error.message });
  }
};

// Get jobs user has NOT applied to (available jobs)
export const getAvailableJobs = async (req, res) => {
  try {
    const userId = req.userId;

    // find all applied job IDs
    const applied = await Application.find({ userId }).select("jobId");
    const appliedJobIds = applied.map((a) => a.jobId);

    // find jobs not in applied list
    const jobs = await JobPost.find({ _id: { $nin: appliedJobIds } }).sort({
      createdAt: -1,
    });

    res.json({ availableJobs: jobs });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching available jobs", error: error.message });
  }
};