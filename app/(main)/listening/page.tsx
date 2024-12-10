"use client";

import { useState, useEffect } from "react";
import axios from "axios"; // Import axios for API calls
import { useClerk } from "@clerk/nextjs"; // For user authentication
import { useRouter } from "next/navigation";
import { FeedWrapper } from "@/components/feed-wrapper";
import { Header } from "../header";
import { UserProgress } from "@/components/user-progress";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Button } from "@/components/ui/button";

interface ListeningExercise {
  _id: string;
  task: string;
  correct: number;
  exerciseType: string;
  point: string;
  title: string;
  question: string[];
  video: string;
  group: string;
}

const ListeningPage = () => {
  const { user } = useClerk(); // Get the current user from Clerk
  const router = useRouter();

  const [exercise, setExercise] = useState<ListeningExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [userAnswer, setUserAnswer] = useState<number | null>(null);
  const [answerStatus, setAnswerStatus] = useState<"correct" | "incorrect" | null>(null);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [userData, setUserData] = useState<{ userHearts: number; userExp: number } | null>(null);
  const [hasAnsweredCorrectly, setHasAnsweredCorrectly] = useState(false);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const response = await fetch("/api/listening");
        if (response.ok) {
          const data = await response.json();
          setExercise(data.ListeningExercise[0]);
        } else {
          console.error("Failed to fetch exercise data");
        }
      } catch (error) {
        console.error("Error fetching exercise data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserData = async () => {
      if (!user?.id) return;
      try {
        const response = await fetch(`/api/user?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          setHearts(data.userHearts || 5); // Initialize hearts from user data
          setScore(data.userExp || 0); // Initialize score from user data
        } else {
          console.error("Error fetching user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchExercise();
    fetchUserData();
  }, [user]);

  const handleAnswerSelect = async (index: number) => {
    if (hasAnsweredCorrectly) return;

    setUserAnswer(index);

    if (index === exercise?.correct) {
      const newScore = score + parseInt(exercise.point, 10);
      setScore(newScore);
      setAnswerStatus("correct");
      setHasAnsweredCorrectly(true);

      // Update user data in MongoDB
      try {
        await axios.put("/api/user", {
          userId: user?.id,
          score: newScore,
        });
      } catch (error) {
        console.error("Error updating user experience:", error);
      }
    } else {
      setAnswerStatus("incorrect");
      setHearts((prevHearts) => Math.max(0, prevHearts - 1));
    }
  };

  const handleContinue = () => {
    router.push("/speaking");
  };

  if (loading) return <div>Loading...</div>;
  if (!exercise) return <div>No exercise data available</div>;

  return (
    <div className="flex gap-[48px] px-6">
      <FeedWrapper>
        <Header title="Listening Exercise" />
        <div className="space-y-4" />

        <div className="my-4 p-4 bg-white shadow-lg rounded-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">{exercise.title}</h2>

          <div className="mb-4">
            <iframe
              width="560"
              height="315"
              src={exercise.video}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">{exercise.task}</h3>
            <div className="space-y-4">
              {exercise.question.map((option, index) => (
                <button
                  key={index}
                  className={`w-full p-4 text-left rounded-lg border ${
                    userAnswer === index
                      ? answerStatus === "correct"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                      : "bg-gray-100"
                  } hover:bg-gray-200`}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={hasAnsweredCorrectly}
                >
                  {option}
                </button>
              ))}
            </div>

            {userAnswer !== null && (
              <div
                className={`mt-4 text-center text-xl font-semibold ${
                  answerStatus === "correct" ? "text-green-500" : "text-red-500"
                }`}
              >
                {answerStatus === "correct" ? "Ճիշտ է!" : "Սխալ է. Փորձեք նորից!"}
              </div>
            )}
          </div>

          {hasAnsweredCorrectly && (
            <div className="mt-6 text-center">
              <Button
                onClick={handleContinue}
                className="py-3 px-8 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all duration-200"
              >
                Continue
              </Button>
            </div>
          )}
        </div>
      </FeedWrapper>

      <StickyWrapper>
        <UserProgress hearts={hearts} points={score} hasActiveSubscription={false} />
      </StickyWrapper>
    </div>
  );
};

export default ListeningPage;
