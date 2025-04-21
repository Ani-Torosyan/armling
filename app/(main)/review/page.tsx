"use client";

import { useEffect, useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { FeedWrapper } from "@/components/feed-wrapper";
import { Header } from "../header";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const ReviewPage = () => {
  const { user } = useClerk();
  const [feedbacks, setFeedbacks] = useState([]);
  const [exerciseDetails, setExerciseDetails] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [showAnimation, setShowAnimation] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/feedbacks?userId=${user.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch feedbacks");
        }
        const data = await response.json();
        setFeedbacks(data);

        // Fetch exercise details
        const exerciseDetailsMap: Record<string, string> = {};

        await Promise.all(
          data.map(async (feedback: any) => {
            const { exerciseUUID } = feedback.submissionId;

            // Fetch exercise details from both speaking and writing sections
            if (exerciseUUID && !exerciseDetailsMap[exerciseUUID]) {
              try {
                const speakingResponse = await fetch(`/api/speakingexerciseName?uuid=${exerciseUUID}`);
                if (speakingResponse.ok) {
                  const speakingData = await speakingResponse.json();
                  exerciseDetailsMap[exerciseUUID] = speakingData.task || "Unnamed Exercise";
                  return;
                }

                const writingResponse = await fetch(`/api/exercise?uuid=${exerciseUUID}`);
                if (writingResponse.ok) {
                  const writingData = await writingResponse.json();
                  exerciseDetailsMap[exerciseUUID] = writingData.task || "Unnamed Exercise";
                  return;
                }

                exerciseDetailsMap[exerciseUUID] = "Unnamed Exercise";
              } catch {
                exerciseDetailsMap[exerciseUUID] = "Unnamed Exercise";
              }
            }
          })
        );

        setExerciseDetails(exerciseDetailsMap);
      } catch (error) {
        console.error("Error fetching feedbacks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [user]);

  const handleLike = async (feedbackId: string) => {
    try {
      await fetch(`/api/feedbacks/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedbackId }),
      });
      setShowAnimation(`like-${feedbackId}`);
      setTimeout(() => setShowAnimation(null), 2000); // Hide animation after 2 seconds
    } catch (error) {
      console.error("Error liking feedback:", error);
    }
  };

  const handleDislike = async (feedbackId: string) => {
    try {
      await fetch(`/api/feedbacks/dislike`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedbackId }),
      });
      setShowAnimation(`dislike-${feedbackId}`);
      setTimeout(() => setShowAnimation(null), 2000); // Hide animation after 2 seconds
    } catch (error) {
      console.error("Error disliking feedback:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)] text-lg font-semibold text-customShade">
        Loading feedbacks...
      </div>
    );
  }

  return (
    <div>
      <FeedWrapper>
        <Header title="Review" />
        <div className="space-y-4" />
      </FeedWrapper>

      <div className="p-6">
        {feedbacks.length === 0 ? (
          <div className="flex items-center justify-center h-[calc(100vh-100px)] text-lg font-semibold text-customShade">
            No feedbacks available
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((feedback: any) => (
              <div key={feedback._id} className="p-4 border rounded shadow relative">
                <p>
                  <strong>Task:</strong>{" "}
                  {exerciseDetails[feedback.submissionId.exerciseUUID] || "Loading..."}
                </p>
                <p><strong>Feedback:</strong> {feedback.feedback}</p>
                <div className="mt-4 flex gap-4">
                  <a
                    className="text-blue-500 underline"
                    href={feedback.submissionId.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View My Submission
                  </a>
                  <Button
                    variant="primary"
                    onClick={() => handleLike(feedback._id)}
                  >
                    Like
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDislike(feedback._id)}
                  >
                    Dislike
                  </Button>
                </div>

                {/* Animation */}
                {showAnimation === `like-${feedback._id}` && (
                  <motion.div
                    className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-green-100 bg-opacity-75"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5 }}
                  >
                    <p className="text-green-600 text-lg font-bold">Liked! 🎉</p>
                  </motion.div>
                )}
                {showAnimation === `dislike-${feedback._id}` && (
                  <motion.div
                    className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-red-100 bg-opacity-75"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5 }}
                  >
                    <p className="text-red-600 text-lg font-bold">Disliked! 😞</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewPage;