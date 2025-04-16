"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FeedWrapper } from "@/components/feed-wrapper";
import { Header } from "@/app/(main)/header";
import { UserProgress } from "@/components/user-progress";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Button } from "@/components/ui/button";
import Loading from "@/app/(main)/loading";
import { Promo } from "@/components/promo";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
  uuid: string;
}

type User = {
  userExp: number;
  userHearts: number;
  subscription: boolean;
  completedReadingExercises: string[];
};

const ReadingPage = () => {
  const { user } = useClerk();
  const router = useRouter();

  const [exercises, setExercises] = useState<ReadingExercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<(number | null)[][]>([]);
  const [answerStatuses, setAnswerStatuses] = useState<(("correct" | "incorrect" | null)[])[]>([]);
  const [userData, setUserData] = useState<User | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const { data } = await axios.get("/api/reading");
        setExercises(data);
        setUserAnswers(data.map((ex: { questions: string | any[]; }) => new Array(ex.questions.length).fill(null)));
        setAnswerStatuses(data.map((ex: { questions: string | any[]; }) => new Array(ex.questions.length).fill(null)));
      } catch (error) {
        console.error("Error fetching exercise:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;
      try {
        const response = await fetch(`/api/user?userId=${user.id}`);
        if (response.ok) {
          setUserData(await response.json());
        } else {
          console.error("Error fetching user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const currentExercise = exercises[currentExerciseIndex];
  const currentQuestion = currentExercise?.questions[currentQuestionIndex];

  const handleAnswerSubmit = (optionIndex: number) => {
    if (!currentExercise) return;

    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentExerciseIndex][currentQuestionIndex] = optionIndex;
    setUserAnswers(updatedAnswers);
  };

  const handleSubmitAllAnswers = async () => {
    if (userData?.userHearts === 0 && userData.subscription === false) {
      router.push("/shop");
      return;
    }

    if (!currentExercise || !userData) return;

    const statuses = currentExercise.questions.map((q, index) => {
      const userAnswer = userAnswers[currentExerciseIndex][index];
      const option = q.options[userAnswer!];
      if (!option) return "incorrect";
      return option.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
        ? "correct"
        : "incorrect";
    });

    const updatedStatuses = [...answerStatuses];
    updatedStatuses[currentExerciseIndex] = statuses;
    setAnswerStatuses(updatedStatuses);
    setSubmitted(true);

    const allCorrectNow = statuses.every(status => status === "correct");

    if (allCorrectNow) {
      if (!userData.completedReadingExercises.includes(currentExercise.uuid)) {
        const updatedScore = userData.userExp + currentExercise.point;
        try {
          await axios.put("/api/user", {
            userId: user?.id,
            score: updatedScore,
            completedReadingUUID: currentExercise.uuid,
          });

          setUserData(prev =>
            prev ? { ...prev, userExp: updatedScore } : prev
          );
        } catch (error) {
          console.error("Error updating user score:", error);
        }
      }
    } else {
      try {
        await axios.put("/api/decrement-hearts", {
          userId: user?.id,
        });
        setUserData(prev =>
          prev ? { ...prev, userHearts: Math.max(0, prev.userHearts - 1) } : prev
        );
      } catch (error) {
        console.error("Error updating user hearts:", error);
      }
    }
  };

  const handleContinue = () => router.push("/listening");

  const handleRetry = () => {
    const newAnswers = [...userAnswers];
    const newStatuses = [...answerStatuses];

    currentExercise.questions.forEach((_, idx) => {
      if (newStatuses[currentExerciseIndex][idx] === "incorrect") {
        newAnswers[currentExerciseIndex][idx] = null;
        newStatuses[currentExerciseIndex][idx] = null;
      }
    });

    setUserAnswers(newAnswers);
    setAnswerStatuses(newStatuses);
    setSubmitted(false);
    setCurrentQuestionIndex(0);
  };

  const handleBackToLearn = () => router.push("/learn");

  if (loading) return <Loading />;
  if (!userData) return <div className="text-center text-customDark">Something went wrong. Please reload the page.</div>;

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          hearts={userData.userHearts}
          points={userData.userExp}
          hasActiveSubscription={userData.subscription}
        />
        {!userData.subscription && <Promo />}
      </StickyWrapper>

      <FeedWrapper>
        <Header title="Reading Exercise" />
        <Button onClick={handleBackToLearn} size="lg" className="rounded-full mb-4" variant="ghost">
          <img src="back.svg" alt="Back" className="w-4 h-4 mr-2" /> Back to Learn
        </Button>
        <div className="text-l mb-4 text-justify text-customDark whitespace-pre-line">
          {currentExercise?.passage}
        </div>

        <div className="w-full flex flex-col items-center text-customDark">
          <h3 className="font-medium mb-4">{currentExercise?.task}</h3>
          {currentQuestion && (
            <div className="w-full max-w-xl text-center border rounded-xl p-6 shadow-md">
              <p className="mb-4 text-lg font-medium">{currentQuestion.question}</p>
              <div className="flex flex-col gap-2">
                {currentQuestion.options.map((option, i) => {
                  const isSelected = userAnswers[currentExerciseIndex][currentQuestionIndex] === i;
                  const isSubmitted = submitted;
                  const status = answerStatuses[currentExerciseIndex][currentQuestionIndex];
                  let buttonStyle = "default";
                  if (isSelected) {
                    if (!isSubmitted) {
                      buttonStyle = "secondary";
                    } else {
                      buttonStyle = status === "correct" ? "correct" : "danger";
                    }
                  }
                  return (
                    <Button
  key={i}
  onClick={() => handleAnswerSubmit(i)}
  variant={buttonStyle as
    | "correct"
    | "default"
    | "primary"
    | "primaryOutline"
    | "secondary"
    | "secondaryOutline"
    | "danger"
    | "dangerOutline"
    | "super"
    | "superOutline"
    | "ghost"
    | "sidebar"
    | "sidebarOutline"}
  disabled={submitted}
  className={
    submitted && isSelected
      ? status === "correct"
        ? "bg-green-500"
        : "bg-red-500"
      : ""
  }
>
  {option}
</Button>

                  );
                })}
              </div>
              {submitted && (
                <p
                  className={`mt-4 ${
                    answerStatuses[currentExerciseIndex][currentQuestionIndex] === "correct"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {answerStatuses[currentExerciseIndex][currentQuestionIndex] === "correct"
                    ? "Ճիշտ է!"
                    : "Սխալ է. Փորձեք նորից!"}
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-center gap-4 mt-6">
            <Button
              variant="ghost"
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="mr-2" /> Previous
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                setCurrentQuestionIndex((prev) =>
                  Math.min((currentExercise?.questions.length || 1) - 1, prev + 1)
                )
              }
              disabled={currentQuestionIndex === (currentExercise?.questions.length || 1) - 1}
            >
              Next <ArrowRight className="ml-2" />
            </Button>
          </div>

          {!submitted && (
            <Button variant="primary" onClick={handleSubmitAllAnswers} className="mt-6">
              Submit All
            </Button>
          )}

          {submitted && answerStatuses[currentExerciseIndex].includes("incorrect") && (
            <Button variant="primary" onClick={handleRetry} className="mt-6">
              Try Again
            </Button>
          )}

          {submitted && !answerStatuses[currentExerciseIndex].includes("incorrect") && (
            <Button variant="primary" onClick={handleContinue} className="mt-6">
              Continue
            </Button>
          )}
        </div>
      </FeedWrapper>
    </div>
  );
};

export default ReadingPage;
