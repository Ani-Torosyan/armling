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

interface WritingExercise {
  _id: string;
  task: string;
  title: string;
  exerciseType: string;
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
  const [userData, setUserData] = useState<User | null>(null);
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmitAll = async () => {
    setSubmitted(true);
  };

  const handleBackToLearn = () => {
    router.push("/learn");
  };

  if (loading) return <Loading />;

  if (!exercise) {
    return <div>No exercise found</div>;
  }

  if (!userData) {
    return <div>No user data available</div>;
  }

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
            <h3 className="font-semibold flex justify-center text-customDark">{exercise.title}</h3>
            <p className="mt-2 text-customShade flex justify-center">{exercise.task}</p>
            <div className="mt-4 flex justify-center">
              <textarea
                placeholder="Type your answer here"
                className="border p-4 w-full max-w-lg resize-y"
                rows={3} 
                disabled={submitted}
              />
            </div>
          </div>
        </div>
      </FeedWrapper>
      <div className="mt-6 flex justify-center w-full">
            <Button variant="primary" onClick={handleSubmitAll}>Submit</Button>
      </div>
    </div>
  );
};

export default WritingPage;
