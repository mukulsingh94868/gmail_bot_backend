import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
    {
        recruiterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
            required: true,
        },
        title: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
        },
        employmentType: {
            type: String,
            enum: ["Full-time", "Part-time", "Contract", "Internship", "Freelance"],
        },
        location: {
            type: String,
        },
        workMode: {
            type: String,
            enum: ["On-site", "Remote", "Hybrid"],
        },
        experienceLevel: {
            type: String,
            enum: ["Entry", "Mid", "Senior"],
        },
        yearsOfExperience: {
            type: String,
        },
        skillsRequired: {
            type: [String],
        },
        status: {
            type: String,
            enum: ["Open", "Closed"],
            default: "Open",
        },
        isApplied: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

export default mongoose.model("Job", jobSchema);
