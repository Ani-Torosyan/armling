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

interface RearrangeSentence {
  words: string[];
  correctAnswer: string;
}

interface WritingExercise {
  _id: string;
  task: string;
  correct: number;
  exerciseType: string;
  point: number;
  rearrangeSentences: RearrangeSentence[];
  group: string;
}

type User = {
  userName: string;
  userExp: number;
  userImg: string;
  firstName: string;
  lastName: string;
  userHearts: number;
  lastHeartUpdate: string;
};

const WritingPage = () => {
  const { user } = useClerk();
  const router = useRouter();

  const [exercise, setExercise] = useState<WritingExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<string[]>([]); // Store typed answers for each exercise
  const [answerStatuses, setAnswerStatuses] = useState<("correct" | "incorrect" | null)[]>([]); // Store status for each exercise
  const [score, setScore] = useState(0);
  const [userData, setUserData] = useState<User | null>(null);
  const [submitted, setSubmitted] = useState(false); // Track if answer is submitted

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const response = await axios.get("/api/writing");
        setExercise(response.data.WritingExercises[0]);
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
      try {
        if (!user?.id) return;
        const response = await axios.get(`/api/user?userId=${user.id}`);
        if (response.status === 200) {
          setUserData(response.data);
        } else {
          console.error("Error fetching user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleAnswerChange = (index: number, answer: string) => {
    setUserAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      newAnswers[index] = answer;
      return newAnswers;
    });
  };

  const handleSubmitAll = async () => {
    if (!exercise) return;

    let totalScore = 0;
    const statuses: ("correct" | "incorrect" | null)[] = [];

    exercise.rearrangeSentences.forEach((sentence, index) => {
      const correctAnswer = sentence.correctAnswer.toLowerCase();
      const userAnswer = userAnswers[index]?.trim().toLowerCase();

      const isCorrect = userAnswer === correctAnswer;
      statuses.push(isCorrect ? "correct" : "incorrect");

      if (isCorrect) {
        totalScore += exercise.point;
      }
    });

    // Update the scores and answer statuses after submission
    setAnswerStatuses(statuses);
    setScore(totalScore);

    try {
      await axios.put("/api/user", {
        userId: user?.id,
        score: totalScore,
      });
    } catch (error) {
      console.error("Error updating score:", error);
    }

    setSubmitted(true); // Mark the submission as complete
  };

  const handleBackToLearn = () => {
    router.push("/learn"); // Navigate back to the Learn page
  };

  if (loading) return <Loading />;

  if (!exercise) {
    return <div>No exercise found</div>;
  }

  if (!userData) {
    return <div>No user data available</div>;
  }

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress
          hearts={userData.userHearts}
          points={userData.userExp}
          hasActiveSubscription={false}
        />
      </StickyWrapper>
      <FeedWrapper>
        <Header title="Writing Exercise" />
        <div className="w-full flex flex-col items-center">
          <h1>{exercise.task}</h1>
          {exercise.rearrangeSentences.map((sentence, index) => (
            <div key={index} className="my-4">
              <p>Rearrange the words to form a correct sentence:</p>
              <div className="flex flex-wrap gap-2">
                {sentence.words.map((word, i) => {
                  return (
                    <Button
                      key={i}
                      className="bg-gray-200"
                      onClick={() =>
                        setUserAnswers((prev) => {
                          const newAnswers = [...prev];
                          if (!newAnswers[index]) newAnswers[index] = "";
                          newAnswers[index] += word + " ";
                          return newAnswers;
                        })
                      }
                      disabled={submitted} // Allow interaction until submission
                    >
                      {word}
                    </Button>
                  );
                })}
              </div>
              <div className="mt-4">
                <input
                  type="text"
                  value={userAnswers[index] || ""}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  placeholder="Or type your answer here"
                  className="border p-2"
                  disabled={submitted} // Allow typing until submission
                />
              </div>
              {answerStatuses[index] !== null && submitted && (
                <div
                  className={`mt-2 p-2 rounded-md ${
                    answerStatuses[index] === "correct"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  <p>
                    {answerStatuses[index] === "correct"
                      ? "Correct!"
                      : "Incorrect. Try again!"}
                  </p>
                </div>
              )}
            </div>
          ))}
          {!submitted && (
            <div className="mt-6">
              <Button onClick={handleSubmitAll}>Submit All Answers</Button>
            </div>
          )}
          {submitted && (
            <div className="mt-6 flex justify-end w-full">
              <Button onClick={handleBackToLearn}>Back to Learn</Button>
            </div>
          )}
        </div>
      </FeedWrapper>
    </div>
  );
};

export default WritingPage;
