import JobPostModel from "../model/JobPostModel.js";

export const createJobPost = async (req, res) => {
  try {
    if (req.role !== "recruiter") {
      return res.status(403).json({ message: "Only recruiters can post jobs" });
    }

    const job = new JobPostModel({
      ...req.body,
      recruiter: req.userId,
    });

    await job.save();
    res.status(201).json({
      statusCode: 201,
      message: "Job posted successfully",
      job,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJobPosts = async (req, res) => {
  try {
    const jobs = await JobPostModel.find().populate(
      "recruiterId",
      "name email role"
    );

    res.status(200).json({ statusCode: 200, data: jobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJobPostById = async (req, res) => {
  const id = req.params.id;
  try {
    const job = await JobPostModel.findById(id).populate(
      "recruiterId",
      "name email role"
    );
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.status(200).json({ statusCode: 200, message: "Job found", data: job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateJobPost = async (req, res) => {
  const { id } = req.params;

  try {
    if (req.role !== "recruiter") {
      return res
        .status(403)
        .json({ message: "Only recruiters can update jobs" });
    }

    const job = await JobPostModel.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.recruiterId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this job" });
    }

    const updatedJob = await JobPostModel.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      statusCode: 200,
      message: "Job updated successfully",
      data: updatedJob,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteJobPost = async (req, res) => {
  const { id } = req.params;

  try {
    if (req.role !== "recruiter") {
      return res
        .status(403)
        .json({ message: "Only recruiters can delete jobs" });
    }

    const job = await JobPostModel.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.recruiterId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this job" });
    }

    await job.deleteOne();

    res.status(200).json({
      statusCode: 200,
      message: "Job deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
