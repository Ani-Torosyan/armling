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
import Loading from "../loading";
import { Promo } from "@/components/promo";

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
  const { user } = useClerk(); 
  const router = useRouter();

  const [exercise, setExercise] = useState<ListeningExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [userAnswer, setUserAnswer] = useState<number | null>(null);
  const [answerStatus, setAnswerStatus] = useState<"correct" | "incorrect" | null>(null);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [sub, setSub] = useState(false);
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
          setHearts(data.userHearts || 5); 
          setScore(data.userExp || 0); 
          setSub(data.subscription || false)
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
    router.push("/learn");
  };

  if (loading) return <Loading/>;
  if (!exercise) return <div>No exercise data available</div>;

  const handleBack = () => {
    router.push("/learn");
  };

  return (
    <div className="flex gap-[48px] px-6">
      <FeedWrapper>
        <Header title="Listening Exercise" />
        <div className="space-y-4" />

        <div className="text-left mb-4">
          
          <Button onClick={handleBack} size="lg" className="rounded-full" variant={"ghost"}>
            <img src="back.svg" alt="Back" className="w-4 h-4 mr-2" />
            Back to Learn
          </Button>
        </div>

        <div className="my-4 p-4 rounded-md text-customDark">
          <h2 className="text-xl mb-4">{exercise.title}</h2>

          <div className="mb-4">
            <iframe
              width="560"
              height="315"
              src={exercise.video}
              title="YouTube video player"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="text-customDark">
            <h3 className="font-medium mb-4">{exercise.task}</h3>
            <div className="flex justify-center gap-4">
              {exercise.question.map((option, index) => (
                <Button
                  key={index}
                  className={`${
                    userAnswer === index
                      ? answerStatus === "correct"
                        ? "bg-green-500 text-customDark"
                        : "bg-red-500 text-customDark"
                      : "bg-custom"
                  } hover:bg-customMid`}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={hasAnsweredCorrectly}
                >
                  {option}
                </Button>
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
              <Button variant="primary" onClick={handleContinue}> Continue </Button>
            </div>
          )}
        </div>
      </FeedWrapper>

      <StickyWrapper>
        <UserProgress hearts={hearts} points={score} hasActiveSubscription={sub} />
        {sub === false && <Promo />}
      </StickyWrapper>
    </div>
  );
};

export default ListeningPage;
