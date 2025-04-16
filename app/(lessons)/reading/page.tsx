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
  
  // Track the current exercise page index
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const { data } = await axios.get("/api/reading");
        setExercises(data);

        const initAnswers: Record<number, (number | null)[]> = {};
        const initStatuses: Record<number, ("correct" | "incorrect" | null)[]> = {};

        data.forEach((ex: ReadingExercise, idx: number) => {
          initAnswers[idx] = new Array(ex.questions.length).fill(null);
          initStatuses[idx] = new Array(ex.questions.length).fill(null);
        });

        setUserAnswers(initAnswers);
        setAnswerStatuses(initStatuses);
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
      } catch (error) {
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

  const handleNextExercise = () => {
    setCurrentExerciseIndex(prev => Math.min(exercises.length - 1, prev + 1));
  };

  const handlePreviousExercise = () => {
    setCurrentExerciseIndex(prev => Math.max(0, prev - 1));
  };

  if (loading) return <Loading />;
  if (!userData) return <div className="text-center text-customDark">Something went wrong. Please reload the page.</div>;

  const currentExercise = exercises[currentExerciseIndex];
  const allExercisesCompletedCorrectly = exercises.every((exercise, exIndex) =>
    submittedIndexes.includes(exIndex) &&
    answerStatuses[exIndex]?.every(status => status === "correct")
  );
  

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

        {currentExercise && (
          <div key={currentExercise._id} className="mb-10 pb-6">
            <div className="text-l mb-4 text-justify text-customDark">
              {currentExercise.passage.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
            </div>

            <div className="w-full flex flex-col items-center text-customDark">
              <h3 className="font-medium mb-4">{currentExercise.task}</h3>

              {currentExercise.questions.map((q, index) => (
                <div key={index} className="my-2">
                  <p className="text-center mb-2">{q.question}</p>
                  <div className="flex justify-center items-center space-x-4">
                    {q.options.map((option, i) => {
                      const selected = userAnswers[currentExerciseIndex]?.[index] === i;
                      const submitted = submittedIndexes.includes(currentExerciseIndex);
                      const status = answerStatuses[currentExerciseIndex]?.[index];

                      return (
                        <Button
                          key={i}
                          onClick={() => handleAnswerSubmit(currentExerciseIndex, index, i)}
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
                  {submittedIndexes.includes(currentExerciseIndex) &&
                    userAnswers[currentExerciseIndex][index] !== null && (
                      <p className={`mt-2 text-center ${answerStatuses[currentExerciseIndex][index] === "correct" ? "text-green-500" : "text-red-500"}`}>
                        {answerStatuses[currentExerciseIndex][index] === "correct" ? "Ճիշտ է!" : "Սխալ է. Փորձեք նորից!"}
                      </p>
                    )}
                </div>
              ))}

              {!submittedIndexes.includes(currentExerciseIndex) && (
                <Button variant="primary" onClick={() => handleSubmitExercise(currentExerciseIndex)} className="mt-6">
                  Submit
                </Button>
              )}

              {submittedIndexes.includes(currentExerciseIndex) && answerStatuses[currentExerciseIndex]?.includes("incorrect") && (
                <Button variant="primary" onClick={() => handleRetry(currentExerciseIndex)} className="mt-6">
                  Try Again
                </Button>
              )}
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="ghost" onClick={handlePreviousExercise} disabled={currentExerciseIndex === 0}>
                <img src="left.svg" alt="Back" className="w-4 h-4 mr-2" /> Previous Exercise
              </Button>
              <Button variant="ghost" onClick={handleNextExercise} disabled={currentExerciseIndex === exercises.length - 1}>
               Next Exercise <img src="right.svg" alt="Back" className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
          
        )}
        {allExercisesCompletedCorrectly && (
          <div className="flex justify-center mt-6">
             <Button variant="primary" onClick={() => router.push("/listening")}> Continue </Button>
             </div>
            )}

      </FeedWrapper>
    </div>
  );
};

export default ReadingPage;
