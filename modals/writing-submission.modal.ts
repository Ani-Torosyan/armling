import mongoose from "mongoose";

const WritingSubmissionSchema = new mongoose.Schema({
  clerkId: { type: String, required: true },
  exerciseUUID: { type: String, required: true },
  fileUrl: { type: String, required: true },
  checked: { type: Boolean, default: false }, // New field
  createdAt: { type: Date, default: Date.now },
});

const WritingSubmission = mongoose.models.WritingSubmission || mongoose.model("WritingSubmission", WritingSubmissionSchema);

export default WritingSubmission;