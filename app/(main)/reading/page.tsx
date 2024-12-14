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

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface ReadingExercise {
  _id: string;
  task: string;
  correct: number;
  exerciseType: string;
  point: number;
  passage: string;
  questions: Question[];
  group: string;
}

type User = {
  userName: string;
  userExp: number;
  userImg: string;
  firstName: string;
  lastName: string;
  userHearts: number;
  sub: boolean;
};

const ReadingPage = () => {
  const { user } = useClerk();
  const router = useRouter();

  const [exercise, setExercise] = useState<ReadingExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [answerStatuses, setAnswerStatuses] = useState<("correct" | "incorrect" | null)[]>([]);
  const [userData, setUserData] = useState<User | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const response = await axios.get("/api/reading");
        setExercise(response.data[0]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching exercise:", error);
        setLoading(false);
      }
    };

    fetchExercise();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user?.id) return;
        const response = await fetch(`/api/user?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          console.error("Error fetching user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleAnswerSubmit = (index: number, optionIndex: number) => {
    if (!exercise) return;

    setUserAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      newAnswers[index] = optionIndex;
      return newAnswers;
    });
  };

  const handleSubmitAllAnswers = () => {
    if (!exercise) return;

    let calculatedScore = 0;

    const updatedAnswerStatuses = exercise.questions.map((q, index) => {
      const correctAnswer = q.correctAnswer.trim().toLowerCase();
      const userAnswer = userAnswers[index] !== null && userAnswers[index] >= 0
        ? q.options[userAnswers[index]].trim().toLowerCase()
        : "";

      const isCorrect = userAnswer === correctAnswer;

      if (isCorrect) {
        calculatedScore += exercise.point;
      }

      return isCorrect ? "correct" : "incorrect";
    });

    setAnswerStatuses(updatedAnswerStatuses);
    setSubmitted(true);

    try {
      axios.put("/api/user", {
        userId: user?.id,
        score: calculatedScore,
      });
    } catch (error) {
      console.error("Error updating score:", error);
    }
  };

  const handleTryAgain = () => {
    setUserAnswers((prevAnswers) =>
      prevAnswers.map((answer, index) =>
        answerStatuses[index] === "incorrect" ? null : answer
      )
    );
    setAnswerStatuses((prevStatuses) =>
      prevStatuses.map((status) => (status === "incorrect" ? null : status))
    );
    setSubmitted(false);
  };

  const handleBackToLearn = () => {
    router.push("/learn");
  };

  if (loading || !exercise) return <Loading />;

  if (!userData) {
    return <div>No user data available</div>;
  }

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          hearts={userData.userHearts}
          points={userData.userExp}
          hasActiveSubscription={userData.sub}
        />
        {userData.sub === false && <Promo />}
      </StickyWrapper>
      <FeedWrapper>
        <Header title="Reading Exercise" />
        <div className="text-left mb-4">
          <Button onClick={handleBackToLearn} size="lg" className="rounded-full" variant={"ghost"}>
            <img src="back.svg" alt="Back" className="w-4 h-4 mr-2" />
            Back to Learn
          </Button>
        </div>
        <div className="text-xl mb-4 text-justify"> {exercise.passage} </div>
        <div className="w-full flex flex-col items-center">
          <h3 className="font-medium mb-4">{exercise.task}</h3>
          {exercise.questions.map((q, index) => (
            <div key={index} className="my-4">
              <p className="text-center mb-2">{q.question}</p>
              <div className="flex justify-center items-center space-x-4">
                {q.options.map((option, i) => (
                  <Button
                    variant={userAnswers[index] === i || submitted ? "secondary" : "default"}
                    key={i}
                    onClick={() => handleAnswerSubmit(index, i)}
                    className={`${
                      submitted
                        ? answerStatuses[index] !== null && userAnswers[index] === i
                          ? answerStatuses[index] === "correct"
                            ? "bg-green-500"
                            : "bg-red-500"
                          : ""
                        : ""
                    }`}
                    disabled={submitted}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              {submitted && userAnswers[index] !== null && (
                <p
                  className={`mt-2 flex justify-center ${
                    answerStatuses[index] === "correct"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {answerStatuses[index] === "correct" ? "Correct!" : "Incorrect. Try Again."}
                </p>
              )}

              <div className="flex justify-center">
              {submitted &&
                  userAnswers[index] !== null &&
                  index === answerStatuses.lastIndexOf("incorrect") && (
                    <div className="flex justify-center">
                      <Button variant={"secondary"} onClick={handleTryAgain}>
                        Try Again
                      </Button>
                    </div>
                  )}
              </div>

              <div className="flex justify-center">
                {submitted &&
                  userAnswers[index] !== null &&
                  answerStatuses[index] === "correct" &&
                  index === answerStatuses.length - 1 && (
                    <div className="flex justify-center">
                      <Button variant={"primary"} onClick={handleBackToLearn}>
                        Continue
                      </Button>
                    </div>
                  )}
              </div>
            </div>
          ))}
          <div className="mt-6 flex flex-col items-center w-full">
            {!submitted && (
              <Button variant={"primary"} onClick={handleSubmitAllAnswers}>
                Submit
              </Button>
            )}
            
          </div>
        </div>
      </FeedWrapper>
    </div>
  );
};

export default ReadingPage;

