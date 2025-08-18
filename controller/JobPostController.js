import JobPostModel from "../model/JobPostModel.js";

export const createJobPost = async (req, res) => {
  const recruiterId = req.userId;
  try {
    const {
      title,
      description,
      employmentType,
      location,
      workMode,
      experienceLevel,
      yearsOfExperience,
      skillsRequired,
    } = req.body;

    if (req.role !== "recruiter") {
      return res.status(403).json({ message: "Only recruiters can post jobs" });
    }

    const job = new JobPostModel({
      recruiterId,
      title,
      description,
      employmentType,
      location,
      workMode,
      experienceLevel,
      yearsOfExperience,
      skillsRequired,
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    const searchFilter = search
      ? {
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
            { employmentType: { $regex: search, $options: "i" } },
            { workMode: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const totalJobs = await JobPostModel.countDocuments(searchFilter);

    const jobs = await JobPostModel.find(searchFilter)
      .populate("recruiterId", "name email role")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      statusCode: 200,
      totalJobs,
      currentPage: page,
      totalPages: Math.ceil(totalJobs / limit),
      pageSize: jobs.length,
      data: jobs,
    });
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

export const getJobPostsByRecruiter = async (req, res) => {
  const recruiterId = req.userId;
  try {
    const jobs = await JobPostModel.find({ recruiterId });
    if (!jobs) return res.status(404).json({ message: "Jobs not found" });
    res
      .status(200)
      .json({ statusCode: 200, message: "Jobs found", data: jobs });
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
