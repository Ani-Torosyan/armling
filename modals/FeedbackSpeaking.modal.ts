import mongoose from "mongoose";

const FeedbackSpeakingSchema = new mongoose.Schema({
  submissionId: { type: mongoose.Schema.Types.ObjectId, ref: "SpeakingSubmission", required: true },
  feedback: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const FeedbackSpeaking =
  mongoose.models.FeedbackSpeaking ||
  mongoose.model("FeedbackSpeaking", FeedbackSpeakingSchema);

export default FeedbackSpeaking;