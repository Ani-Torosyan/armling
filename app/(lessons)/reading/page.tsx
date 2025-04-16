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
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<User | null>(null);
  const [submittedIndexes, setSubmittedIndexes] = useState<number[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, (number | null)[]>>({});
  const [answerStatuses, setAnswerStatuses] = useState<Record<number, ("correct" | "incorrect" | null)[]>>({});
  
  // Track current page for each exercise
  const [currentPageIndex, setCurrentPageIndex] = useState<Record<number, number>>({});

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const { data } = await axios.get("/api/reading");
        setExercises(data);

        const initAnswers: Record<number, (number | null)[]> = {};
        const initStatuses: Record<number, ("correct" | "incorrect" | null)[]> = {};
        const initPageIndex: Record<number, number> = {};

        data.forEach((ex: ReadingExercise, idx: number) => {
          initAnswers[idx] = new Array(ex.questions.length).fill(null);
          initStatuses[idx] = new Array(ex.questions.length).fill(null);
          initPageIndex[idx] = 0; // Start on the first question
        });

        setUserAnswers(initAnswers);
        setAnswerStatuses(initStatuses);
        setCurrentPageIndex(initPageIndex);
      } catch (error) {
        console.error("Error fetching exercises:", error);
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
      }
    };

    fetchUserData();
  }, [user]);

  const handleAnswerSubmit = (exIndex: number, qIndex: number, optionIndex: number) => {
    setUserAnswers(prev => {
      const updated = { ...prev };
      updated[exIndex][qIndex] = optionIndex;
      return updated;
    });
  };

  const handleSubmitExercise = async (exIndex: number) => {
    const exercise = exercises[exIndex];
    if (!exercise || !userData) return;

    if (userData.userHearts === 0 && userData.subscription === false) {
      router.push("/shop");
      return;
    }

    const statuses = exercise.questions.map((q, index) => {
      const userAnswer = userAnswers[exIndex][index];
      if (userAnswer == null) return "incorrect";
      const option = q.options[userAnswer];
      if (!option) return "incorrect";
      return option.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
        ? "correct"
        : "incorrect";
    });

    setAnswerStatuses(prev => ({ ...prev, [exIndex]: statuses }));
    setSubmittedIndexes(prev => [...prev, exIndex]);

    const allCorrectNow = statuses.every(status => status === "correct");

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
      try {
        await axios.put("/api/decrement-hearts", {
          userId: user?.id,
        });
        setUserData(prev =>
          prev ? { ...prev, userHearts: Math.max(0, prev.userHearts - 1) } : prev
        );
      } catch (error)        {
        console.error("Error updating user hearts:", error);
      }
    }
  };

  const handleRetry = (exIndex: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [exIndex]: prev[exIndex].map((ans, idx) =>
        answerStatuses[exIndex][idx] === "incorrect" ? null : ans
      )
    }));
    setAnswerStatuses(prev => ({
      ...prev,
      [exIndex]: prev[exIndex].map((status) =>
        status === "incorrect" ? null : status
      )
    }));
    setSubmittedIndexes(prev => prev.filter(i => i !== exIndex));
  };

  const handleBackToLearn = () => router.push("/learn");

  const handleNextPage = (exIndex: number) => {
    setCurrentPageIndex(prev => ({
      ...prev,
      [exIndex]: Math.min(exercises[exIndex]?.questions.length - 1, prev[exIndex] + 1),
    }));
  };

  const handlePreviousPage = (exIndex: number) => {
    setCurrentPageIndex(prev => ({
      ...prev,
      [exIndex]: Math.max(0, prev[exIndex] - 1),
    }));
  };

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
        <Header title="Reading Exercises" />
        <Button onClick={handleBackToLearn} size="lg" className="rounded-full mb-4" variant="ghost">
          <img src="back.svg" alt="Back" className="w-4 h-4 mr-2" /> Back to Learn
        </Button>

        {exercises.map((exercise, exIndex) => (
          <div key={exercise._id} className="mb-10 border-b pb-6">
            <div className="text-l mb-4 text-justify text-customDark">
              {exercise.passage.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </div>

            <div className="w-full flex flex-col items-center text-customDark">
              <h3 className="font-medium mb-4">{exercise.task}</h3>

              {/* Render current page question */}
              {exercise.questions && exercise.questions.length > 0 && (
                <div className="my-2">
                  <p className="text-center mb-2">{exercise.questions[currentPageIndex[exIndex]].question}</p>
                  <div className="flex justify-center items-center space-x-4">
                    {exercise.questions[currentPageIndex[exIndex]].options.map((option, i) => {
                      const selected = userAnswers[exIndex]?.[currentPageIndex[exIndex]] === i;
                      const submitted = submittedIndexes.includes(exIndex);
                      const status = answerStatuses[exIndex]?.[currentPageIndex[exIndex]];

                      return (
                        <Button
                          key={i}
                          onClick={() => handleAnswerSubmit(exIndex, currentPageIndex[exIndex], i)}
                          variant={
                            selected
                              ? submitted
                                ? status === "correct"
                                  ? "correct"
                                  : "danger"
                                : "secondary"
                              : "default"
                          }
                          className={`${
                            submitted && selected
                              ? status === "correct"
                                ? "bg-green-500"
                                : "bg-red-500"
                              : ""
                          }`}
                          disabled={submitted}
                        >
                          {option}
                        </Button>
                      );
                    })}
                  </div>
                  {submittedIndexes.includes(exIndex) &&
                    userAnswers[exIndex][currentPageIndex[exIndex]] !== null && (
                      <p className={`mt-2 text-center ${answerStatuses[exIndex][currentPageIndex[exIndex]] === "correct" ? "text-green-500" : "text-red-500"}`}>
                        {answerStatuses[exIndex][currentPageIndex[exIndex]] === "correct" ? "Ճիշտ է!" : "Սխալ է. Փորձեք նորից!"}
                      </p>
                    )}
                </div>
              )}

              {/* Navigation and Submit Buttons */}
              <div className="flex justify-between mt-4 w-full max-w-md">
                {currentPageIndex[exIndex] > 0 && (
                  <Button onClick={() => handlePreviousPage(exIndex)}>← Previous</Button>
                )}
                {currentPageIndex[exIndex] < exercise.questions.length - 1 && (
                  <Button onClick={() => handleNextPage(exIndex)}>Next →</Button>
                )}
              </div>

              {!submittedIndexes.includes(exIndex) && (
                <Button variant="primary" onClick={() => handleSubmitExercise(exIndex)} className="mt-6">
                  Submit
                </Button>
              )}

              {submittedIndexes.includes(exIndex) && answerStatuses[exIndex]?.includes("incorrect") && (
                <Button variant="primary" onClick={() => handleRetry(exIndex)} className="mt-6">
                  Try Again
                </Button>
              )}
            </div>
          </div>
        ))}
      </FeedWrapper>
    </div>
  );
};

export default ReadingPage;
