import JobPost from "../model/JDModel.js";
import SavedJob from "../model/SavedJobModel.js";

// Create a new job post
export const createJobPost = async (req, res) => {
  const recruiterId = req.userId;
  try {
    const { JD } = req.body;
    if (!JD) {
      return res.status(400).json({ message: "JD is required" });
    }

    const job = new JobPost({
      recruiterId,
      JD,
    });

    await job.save();
    res
      .status(201)
      .json({ job, message: "Job post created successfully", statusCode: 201 });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error creating job post", error });
  }
};

// Get all job posts
export const getAllRecruiterJobPosts = async (req, res) => {
  const recruiterId = req.userId;
  try {
    const jobPosts = await JobPost.find({ recruiterId }).sort({
      createdAt: -1,
    });
    res.json({ jobPosts });
  } catch (error) {
    res.status(500).json({ message: "Error fetching job posts", error });
  }
};

// Controller
export const getAllJobPosts = async (req, res) => {
  try {
    // parse pagination values as integers
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";

    const query = search ? { JD: { $regex: search, $options: "i" } } : {};

    const jobPosts = await JobPost.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalJobs = await JobPost.countDocuments(query);

    // Determine saved jobs for the requesting user (if authenticated)
    const userId = req.userId; // set by authenticate middleware when present

    let savedJobIdsSet = new Set();
    if (userId && jobPosts.length > 0) {
      const jobIdStrings = jobPosts.map((j) => j._id.toString());
      const savedJobs = await SavedJob.find({
        userId,
        jobId: { $in: jobIdStrings },
      }).select("jobId");

      savedJobIdsSet = new Set(savedJobs.map((s) => s.jobId));
    }

    // Attach isSaved flag to each job post
    const jobPostsWithSavedFlag = jobPosts.map((job) => {
      const jobObj = job.toObject ? job.toObject() : job;
      jobObj.isSaved = savedJobIdsSet.has(jobObj._id.toString());
      return jobObj;
    });

    res.json({
      jobPosts: jobPostsWithSavedFlag,
      statusCode: 200,
      pagination: {
        totalJobs,
        currentPage: page,
        pageSize: limit,
        totalPages: Math.ceil(totalJobs / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching job posts",
      error: error.message,
    });
  }
};

// Get single job post
export const getJobPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const jobPost = await JobPost.findById(id);
    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found" });
    }
    res.json({ jobPost });
  } catch (error) {
    res.status(500).json({ message: "Error fetching job post", error });
  }
};

export const updateJobPost = async (req, res) => {
  try {
    const { JD } = req.body;
    const updatedJobPost = await JobPost.findByIdAndUpdate(
      req.params.id,
      { JD },
      { new: true }
    );
    if (!updatedJobPost) {
      return res.status(404).json({ message: "Job post not found" });
    }
    res.json(updatedJobPost);
  } catch (error) {
    res.status(500).json({ message: "Error updating job post", error });
  }
};

// Delete job post
export const deleteJobPost = async (req, res) => {
  try {
    const deletedJobPost = await JobPost.findByIdAndDelete(req.params.id);
    if (!deletedJobPost) {
      return res.status(404).json({ message: "Job post not found" });
    }
    res.json({ message: "Job post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting job post", error });
  }
};
