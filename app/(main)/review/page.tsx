"use client";

import { useEffect, useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { FeedWrapper } from "@/components/feed-wrapper";
import { Header } from "../header";

const ReviewPage = () => {
  const { user } = useClerk();
  const [feedbacks, setFeedbacks] = useState([]);
  const [exerciseDetails, setExerciseDetails] = useState<Record<string, { task: string; exerciseType: string }>>({});
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

        // Fetch exercise details (task and exerciseType) for each feedback
        const details: Record<string, { task: string; exerciseType: string }> = {};
        await Promise.all(
          data.map(async (feedback: any) => {
            const exerciseUUID = feedback.submissionId.exerciseUUID;
            if (exerciseUUID && !details[exerciseUUID]) {
              try {
                const detailResponse = await fetch(`/api/exercise?uuid=${exerciseUUID}`);
                if (detailResponse.ok) {
                  const detailData = await detailResponse.json();
                  details[exerciseUUID] = {
                    task: detailData.task,
                    exerciseType: detailData.exerciseType,
                  };
                } else {
                  details[exerciseUUID] = { task: "Unnamed Exercise", exerciseType: "Unknown" };
                }
              } catch {
                details[exerciseUUID] = { task: "Unnamed Exercise", exerciseType: "Unknown" };
              }
            }
          })
        );
        setExerciseDetails(details);
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
              <div key={feedback._id} className="p-4 border rounded shadow">
                <p>
                  <strong>Task:</strong>{" "}
                  {exerciseDetails[feedback.submissionId.exerciseUUID]?.task || "Loading..."}
                </p>
                <p>
                  <strong>Exercise Type:</strong>{" "}
                  {exerciseDetails[feedback.submissionId.exerciseUUID]?.exerciseType || "Loading..."}
                </p>
                <p><strong>Feedback:</strong> {feedback.feedback}</p>
                <a
                  href={feedback.submissionId.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  View My Submission
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewPage;