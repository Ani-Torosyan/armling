"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FeedWrapper } from "@/components/feed-wrapper";
import { Button } from "@/components/ui/button";
import { Header } from "@/app/(main)/header";
import Loading from "@/app/(main)/loading";

interface WritingExercise {
  _id: string;
  task: string;
  title: string;
  exerciseType: string;
  group: string;
  uuid: string;
}

type User = {
  userExp: number;
  userHearts: number;
  writing: string[];
};

const WritingPage = () => {
  const { user } = useClerk();
  const router = useRouter();

  const [exercise, setExercise] = useState<WritingExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<User | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const response = await axios.get("/api/writing");
        setExercise(response.data.WritingExercises[0]);
      } catch (error) {
        console.error("Error fetching exercise:", error);
      }
    };

    fetchExercise();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user?.id || !exercise?.uuid) return;

        const response = await axios.get(`/api/user?userId=${user.id}`);
        if (response.status === 200) {
          const userInfo = response.data;
          setUserData(userInfo);

          if (userInfo.writing?.includes(exercise.uuid)) {
            setSubmitted(true);
          }
        } else {
          console.error("Error fetching user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && exercise) {
      fetchUserData();
    }
  }, [user, exercise]);

  const handleSubmitAll = async () => {
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
    const text = textarea?.value || "";

    if (!text.trim()) return;

    try {
      const response = await fetch("/api/save-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-clerk-user-id": user?.id || "",
        },
        body: JSON.stringify({ text, exerciseUUID: exercise?.uuid }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const errorData = await response.json();
        console.error("Failed to save text:", errorData.message);
      }
    } catch (error) {
      console.error("Error submitting text:", error);
    }
  };

  const handleBackToLearn = () => {
    router.push("/learn");
  };

  if (loading || !exercise || !userData) return <Loading />;

  return (
    <div className="gap-[48px] px-6">
      <FeedWrapper>
        <Header title="Writing Exercise" />
        <Button onClick={handleBackToLearn} size="lg" className="rounded-full" variant={"ghost"}>
          <img src="back.svg" alt="Back" className="w-4 h-4 mr-2" />
          Back to Learn
        </Button>

        <div className="w-full flex flex-col">
          <div className="my-4">
            <h3 className="font-semibold flex justify-center text-customDark">
              {exercise.title}
            </h3>
            <p className="mt-2 text-customDark flex justify-center">
              {exercise.task}
            </p>

            <div className="mt-4 flex justify-center">
              <textarea
                placeholder="Type your answer here"
                className={`border p-4 w-full max-w-lg resize-y ${
                  submitted ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
                }`}
                rows={3}
                disabled={submitted}
              />
            </div>
          </div>
        </div>
      </FeedWrapper>

      <div className="mt-6 flex flex-col items-center w-full">
        <Button
          variant="primary"
          onClick={handleSubmitAll}
          disabled={submitted}
        >
          Submit
        </Button>
        <p className="text-green-600 font-semibold mt-6 text-center text-lg">
                You have already submitted this exercise.
              </p>
      </div>
    </div>
  );
};

export default WritingPage;
