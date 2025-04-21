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

const WritingPage = () => {
  const { user } = useClerk();
  const router = useRouter();

  const [exercise, setExercise] = useState<WritingExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Fetch the exercise details
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

  // Fetch submission and feedback status
  useEffect(() => {
    const fetchSubmissionAndFeedback = async () => {
      try {
        if (!user?.id || !exercise?.uuid) return;

        const response = await axios.get(
          `/api/user-submission-feedback?userId=${user.id}&exerciseUUID=${exercise.uuid}`
        );

        if (response.status === 200) {
          const { submission, feedback } = response.data;

          if (submission) {
            setSubmitted(true);
          }

          if (feedback) {
            setFeedback(feedback.feedback);
          }
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          // No submission found, handle gracefully
          setSubmitted(false);
          setFeedback(null);
        } else {
          console.error("Error fetching submission and feedback:", error);
        }
      }
    };

    if (user && exercise) {
      fetchSubmissionAndFeedback();
    }
  }, [user, exercise]);

  const handleSubmitAll = async () => {
    const textarea = document.querySelector("textarea");
    const text = textarea?.value || "";

    if (!text.trim()) {
      alert("Please write something before submitting.");
      return;
    }
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
        alert(errorData.message || "An error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting text:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleBackToLearn = () => {
    router.push("/learn");
  };

  if (loading) return <Loading />;

  if (!exercise) {
    return <div>No exercise found</div>;
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
            <p className="mt-2 text-customDark flex justify-center">{exercise.task}</p>
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
      <div className="mt-6 flex flex-col items-center w-full">
        {submitted ? (
          <>
            <p className="text-green-600 font-semibold">Thanks for submission of this exercise!</p>
            {feedback ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => router.push("/review")}
                  className="mt-4"
                >
                  View Review
                </Button>
              </>
            ) : (
              <p className="text-gray-600 mt-2">No feedback available yet.</p>
            )}
          </>
        ) : (
          <Button variant="primary" onClick={handleSubmitAll} disabled={submitted}>
            Submit
          </Button>
        )}
      </div>
    </div>
  );
};

export default WritingPage;