import mongoose from "mongoose";

const SpeakingSubmissionSchema = new mongoose.Schema({
  clerkId: { type: String, required: true },
  exerciseUUID: { type: String, required: true },
  fileUrl: { type: String, required: true },
  checked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const SpeakingSubmission =
  mongoose.models.SpeakingSubmission ||
  mongoose.model("SpeakingSubmission", SpeakingSubmissionSchema);

export default SpeakingSubmission;