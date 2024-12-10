"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FeedWrapper } from "@/components/feed-wrapper";
import { Header } from "../header";
import { UserProgress } from "@/components/user-progress";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Button } from "@/components/ui/button";
import { Promo } from "@/components/promo";

interface LessonUnit {
  _id: string;
  uuid: string;
  title: string;
  question: string;
  groupId: string;
}

interface LessonExercise {
  _id: string;
  name: string;
  audio: string;
  picture: string;
  correct: string;
  point: string;
}

const LessonPage = () => {
  const { user } = useClerk(); // Get the current user from Clerk
  const router = useRouter();

  // States
  const [lessonUnits, setLessonUnits] = useState<LessonUnit[]>([]);
  const [lessonExercises, setLessonExercises] = useState<LessonExercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<LessonExercise | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctAnswerClicked, setCorrectAnswerClicked] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [hearts, setHearts] = useState(5);
  const [points, setPoints] = useState(0);
  const [userData, setUserData] = useState<{ userHearts: number; userExp: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const completedExercises = new Set<string>(); // Track exercises already answered correctly

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        const response = await axios.get("/api/lesson");
        const { lessonUnits, lessonExercises } = response.data;
        setLessonUnits(lessonUnits);
        setLessonExercises(lessonExercises);
      } catch (error) {
        console.error("Error fetching lesson data:", error);
      }
    };

    const fetchUserData = async () => {
      if (!user?.id) return; // Ensure we have a user ID
      try {
        const response = await fetch(`/api/user?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          setHearts(data.userHearts || 5); // Set initial hearts from user data
          setPoints(data.userExp || 0); // Set initial points from user data
        } else {
          console.error("Error fetching user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
    fetchUserData();
  }, [user]);

  const handleExerciseClick = async (exercise: LessonExercise) => {
    if (completedExercises.has(exercise._id)) {
      setFeedbackMessage("Այս հարցն արդեն ճիշտ եք պատասխանել!");
      return;
    }

    const audio = new Audio(exercise.audio);
    audio.play();

    setSelectedExercise(exercise);
    setAnswered(true);

    if (exercise.correct === "1") {
      const newPoints = points + parseInt(exercise.point);
      setPoints(newPoints);
      setFeedbackMessage("Ճիշտ է!");
      setCorrectAnswerClicked(true);

      // Mark the exercise as completed
      completedExercises.add(exercise._id);

      // Update user experience in MongoDB
      try {
        await axios.put("/api/user", {
          userId: user?.id,
          score: newPoints,
        });
      } catch (error) {
        console.error("Error updating user experience:", error);
      }
    } else {
      setFeedbackMessage("Սխալ է. Փորձեք նորից!");
      setHearts((prevHearts) => Math.max(0, prevHearts - 1));
    }
  };

  const handleContinue = () => {
    setAnswered(false);
    setSelectedExercise(null);
    setCorrectAnswerClicked(false);
    setFeedbackMessage(null);
    router.push("/listening");
  };

  const handleBack = () => {
    router.push("/learn");
  };

  // Handle loading and error states
  if (loading) return <div>Loading...</div>;
  if (!userData) return <div>No user data available</div>;

  return (
    <div className="flex gap-[48px] px-6">
      <FeedWrapper>
        <Header title="Lesson Page" />
        <div className="space-y-4" />

        {/* Back Button */}
        <div className="text-left mb-4">
          <Button onClick={handleBack} size="lg" className="rounded-full">
            Back to Learn
          </Button>
        </div>

        {/* Lesson Units Section */}
        <div>
          {lessonUnits.map((unit) => (
            <div key={unit._id} className="my-4 p-4 bg-white shadow-lg rounded-md border border-gray-200">
              <h3 className="text-xl font-semibold">{unit.title}</h3>
              <p className="text-gray-600">{unit.question}</p>
            </div>
          ))}
        </div>

        {/* Lesson Exercises Section */}
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
            {lessonExercises.map((exercise) => (
              <div
                key={exercise._id}
                className={`relative group flex flex-col items-center justify-center bg-white shadow-xl rounded-lg overflow-hidden transform transition-all duration-300 ease-in-out ${
                  answered
                    ? exercise.correct === "1"
                      ? "bg-green-500"
                      : "bg-red-500"
                    : "bg-gray-300"
                }`}
              >
                <div className="absolute top-0 left-0 right-0 p-4 bg-opacity-70 bg-black text-white text-lg font-semibold text-center">
                  {exercise.name}
                </div>
                <button
                  onClick={() => handleExerciseClick(exercise)}
                  className="w-full h-48 flex items-center justify-center bg-cover bg-center hover:scale-105 transition-all duration-300"
                  style={{ backgroundImage: `url(${exercise.picture})` }}
                >
                  <div className="absolute inset-0 bg-black opacity-30 group-hover:opacity-40 transition-opacity"></div>
                </button>
              </div>
            ))}
          </div>

          {/* Feedback Message */}
          {feedbackMessage && (
            <div className="mt-4 text-center text-xl font-semibold">
              <p className={feedbackMessage === "Ճիշտ է!" ? "text-green-500" : "text-red-500"}>
                {feedbackMessage}
              </p>
            </div>
          )}

          {/* Continue Button */}
          {answered && correctAnswerClicked && (
            <div className="mt-6 text-center">
              <button
                onClick={handleContinue}
                className="py-3 px-8 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all duration-200"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </FeedWrapper>

      <StickyWrapper>
        <UserProgress hearts={hearts} points={points} hasActiveSubscription={false} />
        <Promo />
      </StickyWrapper>
    </div>
  );
};

export default LessonPage;
