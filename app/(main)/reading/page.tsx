"use client";

import React, { useState, useEffect } from "react";
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

  const [exercise, setExercise] = useState<ReadingExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [answerStatuses, setAnswerStatuses] = useState<("correct" | "incorrect" | null)[]>([]);
  const [userData, setUserData] = useState<User | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [allCorrect, setAllCorrect] = useState(false);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const { data } = await axios.get("/api/reading");
        setExercise(data[0]);
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

  const handleAnswerSubmit = (index: number, optionIndex: number) => {
    if (!exercise) return;

    setUserAnswers((prev) => {
      const updated = [...prev];
      updated[index] = optionIndex;
      return updated;
    });
  };

  const handleSubmitAllAnswers = async () => {
    if (userData?.userHearts === 0 && userData.subscription === false) {
      router.push("/shop");
      return;
    }
  
    if (!exercise || !userData) return;
  
    const statuses = exercise.questions.map((q, index) => {
      const userAnswer = userAnswers[index];
      if (userAnswer == null || userAnswer === undefined) return "incorrect";
      const option = q.options[userAnswer];
      if (!option) return "incorrect";
      return option.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
        ? "correct"
        : "incorrect";
    });
  
    setAnswerStatuses(statuses); 
    setSubmitted(true);
  
    const allCorrectNow = statuses.every(status => status === "correct");
    setAllCorrect(allCorrectNow); 
  
    if (allCorrectNow) {
      if (!userData.completedReadingExercises.includes(exercise.uuid)) {
        const updatedScore = userData.userExp + exercise.point;
        try {
          await axios.put("/api/user", {
            userId: user?.id,
            score: updatedScore,
            completedReadingUUID: exercise.uuid,
          });
  
          setUserData(prev =>
            prev ? { ...prev, userExp: updatedScore } : prev
          );
        } catch (error) {
          console.error("Error updating user score:", error);
        }
      }
    } else {
      console.log("Some answers are incorrect, no points awarded.");
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

  const handleContinue = () => {
    router.push("/listening");
  };

  const handleRetry = () => {
    setUserAnswers((prev) => prev.map((answer, idx) => (answerStatuses[idx] === "incorrect" ? null : answer)));
    setAnswerStatuses((prev) => prev.map((status) => (status === "incorrect" ? null : status)));
    setSubmitted(false);
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
        <div className="text-l mb-4 text-justify text-customDark">
        {exercise?.passage?.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            <br />
          </React.Fragment>
        ))}
        </div>

        <div className="w-full flex flex-col items-center text-customDark">
          <h3 className="font-medium mb-4">{exercise?.task}</h3>
          {exercise?.questions.map((q, index) => (
            <div key={index} className="my-2">
              <p className="text-center mb-2">{q.question}</p>
              <div className="flex justify-center items-center space-x-4">
                {q.options.map((option, i) => (
                  <Button
                    variant={
                      userAnswers[index] === i
                        ? submitted
                          ? answerStatuses[index] === "correct"
                            ? "correct" 
                            : "danger" 
                          : "secondary"
                        : "default"
                    }
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
                <p className={`mt-2 text-center ${answerStatuses[index] === "correct" ? "text-green-500" : "text-red-500"}`}>
                  {answerStatuses[index] === "correct" ? "Ճիշտ է!" : "Սխալ է. Փորձեք նորից!"}
                </p>
              )}
            </div>
          ))}

          {!submitted && (
            <Button variant="primary" onClick={handleSubmitAllAnswers} className="mt-6">
              Submit
            </Button>
          )}

          {submitted && answerStatuses.includes("incorrect") && (
            <Button variant="primary" onClick={handleRetry} className="mt-6">
              Try Again
            </Button>
          )}

          {submitted && !answerStatuses.includes("incorrect") && (
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