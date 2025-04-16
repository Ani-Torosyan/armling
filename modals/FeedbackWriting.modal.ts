import mongoose from "mongoose";

const FeedbackWritingSchema = new mongoose.Schema({
  submissionId: { type: mongoose.Schema.Types.ObjectId, ref: "writingsubmission", required: true },
  feedback: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const FeedbackWriting = mongoose.models.FeedbackWriting || mongoose.model("FeedbackWriting", FeedbackWritingSchema);

export default FeedbackWriting;