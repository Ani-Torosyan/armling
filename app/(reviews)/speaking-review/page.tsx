"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { FeedWrapper } from "@/components/feed-wrapper";
import { Header } from "../../(main)/header";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface SpeakingSubmission {
  _id: string;
  clerkId: string;
  exerciseUUID: string;
  fileUrl: string;
  createdAt: string;
  firstName?: string;
  lastName?: string;
  exerciseName?: string;
}

const SpeakingReviewPage = () => {
  const [submissions, setSubmissions] = useState<SpeakingSubmission[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await axios.get("/api/speaking-review");
        const submissions = response.data.submissions || [];

        const enrichedSubmissions = await Promise.all(
          submissions.map(async (submission: SpeakingSubmission) => {
            const [userResponse, exerciseResponse] = await Promise.all([
              axios.get(`/api/user?userId=${submission.clerkId}`),
              axios.get(`/api/speakingexerciseName?uuid=${submission.exerciseUUID}`),
            ]);

            return {
              ...submission,
              firstName: userResponse.data.firstName || "Unknown",
              lastName: userResponse.data.lastName || "User",
              exerciseName: exerciseResponse.data.task || "Unknown Exercise",
            };
          })
        );

        setSubmissions(enrichedSubmissions);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      }
    };

    fetchSubmissions();
  }, []);

  const downloadAudio = (fileUrl: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = "audio-file.mp3"; // Default filename
    link.click();
  };

  const goToCheckSpeaking = (submissionId: string, fileUrl: string) => {
    router.push(`/checkspeaking?id=${submissionId}&fileUrl=${encodeURIComponent(fileUrl)}`);
  };

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <FeedWrapper>
        <Header title="Speaking Reviews" />
        <div className="space-y-6 text-customDark mt-4">
          {submissions.length === 0 ? (
            <p className="p-4 text-center text-customDark">No unchecked submissions available or loading, please wait.</p>
          ) : (
            submissions.map((submission) => (
              <div key={submission._id} className="p-4">
                <p><strong>Submitted by:</strong> {submission.firstName} {submission.lastName}</p>
                <p><strong>Exercise:</strong> {submission.exerciseName}</p>
                <p><strong>Submitted At:</strong> {new Date(submission.createdAt).toLocaleString()}</p>
                <div className="flex gap-4 mt-2">
                  <Button
                    variant="primary"
                    onClick={() => downloadAudio(submission.fileUrl)}
                  >
                    Download Audio
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => goToCheckSpeaking(submission._id, submission.fileUrl)}
                  >
                    Check Speaking
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </FeedWrapper>
    </div>
  );
};

export default SpeakingReviewPage;