"use client";

import { useEffect, useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { FeedWrapper } from "@/components/feed-wrapper";
import { Header } from "../header";
import { Loader } from "lucide-react"

const ReviewPage = () => {
  const { user } = useClerk();
  const [feedbacks, setFeedbacks] = useState([]);
  const [exerciseDetails, setExerciseDetails] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);


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

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader className="h-6 w-6 text-muted-foreground animate-spin" />
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
              <div key={feedback._id} className="p-4 border border-customShade rounded relative">
                <p>
                  <strong>Task:</strong>{" "}
                  {exerciseDetails[feedback.submissionId.exerciseUUID] || "Loading..."}
                </p>
                <p><strong>Feedback:</strong> {feedback.feedback}</p>
                <div className="mt-4 flex gap-4">
                  <a
                    className="text-customShade underline"
                    href={feedback.submissionId.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View My Submission
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewPage;