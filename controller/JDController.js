import JobPost from "../model/JDModel.js";

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
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = search ? { JD: { $regex: search, $options: "i" } } : {};

    const jobPosts = await JobPost.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalJobs = await JobPost.countDocuments(query);

    res.json({
      jobPosts,
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
