import mongoose from "mongoose";

const ExerciseSchema = new mongoose.Schema({
  uuid: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  point: { type: String, required: true },
  group: { type: String, required: true },
});

const Exercise =
  mongoose.models.Exercise || mongoose.model("SpeakingExercise", ExerciseSchema);

export default Exercise;