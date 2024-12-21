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

interface ReadingExercise {
  _id: string;
  task: string;
  correct: number;
  exerciseType: string;
  point: string;
  title: string;
  question: string[];
  group: string;
  uuid: string
}

const ReadingPage = () => {
  const { user } = useClerk(); 
  const router = useRouter();

  const [exercise, setExercise] = useState<ReadingExercise | null>(null);
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
        const response = await fetch("/api/reading");
        if (response.ok) {
          const data = await response.json();
          setExercise(data.ReadingExercise[0]);
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

  const handleAnswerSubmit = async (index: number, optionIndex: number) => {
    if (!exercise) return;

    setUserAnswer(optionIndex);

    if (optionIndex === exercise.correct) {
        if (hearts == 0 && sub == false) {
            router.push("/shop");
            return;
        }

        setAnswerStatus("correct");
        let isAlreadyCompleted = false;

        try {
            const userDataResponse = await axios.get(`/api/user?userId=${user?.id}`);
            if (userDataResponse.status === 200) {
                const userData = userDataResponse.data;
                isAlreadyCompleted = userData.completedReadingExercises?.includes(exercise.uuid);
            }
        } catch (error) {
            console.error("Error fetching user data to check completed exercises:", error);
        }

        if (isAlreadyCompleted) {
            setAnswerStatus("correct");
            setHasAnsweredCorrectly(true);
            return; 
        }

        const newScore = score + parseInt(exercise.point, 10);
        if(!isAlreadyCompleted) setScore(newScore);
        setHasAnsweredCorrectly(true);

        try {
            await axios.put("/api/user", {
                userId: user?.id,
                score: newScore,
                completedReadingUUID: exercise.uuid, 
            });
        } catch (error) {
            console.error("Error updating user experience:", error);
        }
    } else if (answerStatus !== "correct" && hearts == 0 && sub == false) {
        router.push("/shop");
    } else {
        setAnswerStatus("incorrect");
        setHearts((prevHearts) => Math.max(0, prevHearts - 1));
    }
  };

  const handleContinue = () => {
    router.push("/speaking");
  };

  if (loading) return <Loading/>;
  if (!exercise) return <div>No exercise data available</div>;

  const handleBack = () => {
    router.push("/learn");
  };

  return (
    <div className="flex gap-[48px] px-6">
      <FeedWrapper>
        <Header title="Reading Exercise" />
        <div className="space-y-4" />

        <div className="text-left mb-4">
          <Button onClick={handleBack} size="lg" className="rounded-full" variant={"ghost"}>
            <img src="back.svg" alt="Back" className="w-4 h-4 mr-2" />
            Back to Learn
          </Button>
        </div>

        <div className="my-4 p-4 rounded-md text-customDark">
          <h2 className="text-xl mb-4">{exercise.title}</h2>

          <div className="text-customDark">
            <h3 className="font-medium mb-4">{exercise.task}</h3>