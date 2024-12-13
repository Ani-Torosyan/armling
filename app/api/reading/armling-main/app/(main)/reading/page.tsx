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
  const [userAnswer, setUserAnswer] = useState<number | null>(null);
  const [answerStatus, setAnswerStatus] = useState<"correct" | "incorrect" | null>(null);
  const [score, setScore] = useState(0);
  const [userData, setUserData] = useState<User | null>(null);
  const [time, setTime] = useState<number>(0);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const response = await axios.get("/api/reading");
        console.log("Fetched exercise data:", response.data); // Debugging line
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

  useEffect(() => {
    if (userData && userData.lastHeartUpdate) {
      const updateTimer = () => {
        const now = Date.now();
        const lastUpdate = new Date(userData.lastHeartUpdate).getTime();
        const timeElapsed = Math.floor((now - lastUpdate) / 1000);
        const heartsToAdd = Math.floor(timeElapsed / 300);

        if (heartsToAdd > 0 && userData.userHearts < 5) {
          const newHearts = Math.min(userData.userHearts + heartsToAdd, 5);
          setUserData((prev) => prev && { ...prev, userHearts: newHearts });

          const newLastUpdate = new Date(lastUpdate + heartsToAdd * 300 * 1000);
          setUserData((prev) =>
            prev && { ...prev, lastHeartUpdate: newLastUpdate.toISOString() }
          );
        }

        const nextRefillTime = 300 - (timeElapsed % 300);
        setTime(nextRefillTime);
      };

      updateTimer();

      const timer = setInterval(updateTimer, 1000);
      return () => clearInterval(timer);
    }
  }, [userData]);

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
            <div key={index}>
              <p>{q.question}</p>
              {q.options.map((option, i) => (
                <Button key={i} onClick={() => setUserAnswer(i)}>
                  {option}
                </Button>
              ))}
            </div>
          ))}
        </div>
      </FeedWrapper>
    </div>
  );
};

export default ReadingPage;