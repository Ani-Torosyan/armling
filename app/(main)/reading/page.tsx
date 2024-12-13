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
  lastHeartUpdate: string;
};

const ReadingPage = () => {
  const { user } = useClerk();
  const router = useRouter();

  const [exercise, setExercise] = useState<ReadingExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]); // Store answers for each question
  const [answerStatuses, setAnswerStatuses] = useState<("correct" | "incorrect" | null)[]>([]); // Store answer status for each question
  const [score, setScore] = useState(0);
  const [userData, setUserData] = useState<User | null>(null);
  const [submitted, setSubmitted] = useState(false); // Track if answers are submitted

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const response = await axios.get("/api/reading");
        setExercise(response.data[0]); // Assuming response.data is an array
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

    // Mark that the user has selected an answer for this question
    setUserAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      newAnswers[index] = optionIndex;
      return newAnswers;
    });
  };

  const handleSubmitAllAnswers = () => {
    if (!exercise) return;

    let calculatedScore = 0;

    // Check all answers and set feedback statuses
    const updatedAnswerStatuses = exercise.questions.map((q, index) => {
      // Normalize both the user answer and the correct answer to lowercase and trim spaces
      const correctAnswer = q.correctAnswer.trim().toLowerCase();

      // Make sure userAnswers[index] is valid before attempting to access q.options
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
    setScore(calculatedScore);
    setSubmitted(true);

    // Update score in the backend
    try {
      axios.put("/api/user", {
        userId: user?.id,
        score: calculatedScore,
      });
    } catch (error) {
      console.error("Error updating score:", error);
    }
  };

  const handleBackToLearn = () => {
    router.push("/learn"); // Replace with the correct path to the learning page
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
        <Header title="Reading Exercise" />
        <div className="w-full flex flex-col items-center">
          <h1>{exercise.task}</h1>
          <p>{exercise.passage}</p>
          {exercise.questions && exercise.questions.map((q, index) => (
            <div key={index} className="my-4">
              <p>{q.question}</p>
              {q.options.map((option, i) => (
                <Button
                  key={i}
                  onClick={() => handleAnswerSubmit(index, i)}
                  className={`${
                    userAnswers[index] === i
                      ? "bg-blue-500" // Blue color when the answer is selected
                      : "bg-gray-200"
                  } ${
                    submitted
                      ? answerStatuses[index] !== null && userAnswers[index] === i
                        ? answerStatuses[index] === "correct"
                          ? "bg-green-500" // Green for correct selected answer
                          : "bg-red-500"  // Red for incorrect selected answer
                        : ""
                      : ""
                  }`}
                  disabled={submitted} // Disable button after submission
                  style={{
                    opacity: submitted ? 1 : 0.8, // Maintain opacity for disabled buttons but ensure visibility
                    pointerEvents: submitted ? 'none' : 'auto', // Ensure no interaction after submission
                  }}
                >
                  {option}
                </Button>
              ))}
              {submitted && userAnswers[index] !== null && (
                <p
                  className={`mt-2 ${
                    answerStatuses[index] === "correct"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {answerStatuses[index] === "correct" ? "Correct!" : "Incorrect. Try again!"}
                </p>
              )}
            </div>
          ))}
          <div className="mt-6 flex flex-col items-center w-full">
            {!submitted && (
              <Button onClick={handleSubmitAllAnswers}>Submit Answers</Button>
            )}
            {submitted && (
              <div className="flex justify-end w-full mt-4">
                <Button onClick={handleBackToLearn}>Back to Learn</Button>
              </div>
            )}
          </div>
        </div>
      </FeedWrapper>
    </div>
  );
};

export default ReadingPage;
