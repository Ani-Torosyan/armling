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
  const [loading, setLoading] = useState(true);
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
      } finally {
        setLoading(false);
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

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <FeedWrapper>
        <Header title="Speaking Reviews" />
        <div className="space-y-6">
          {submissions.length === 0 ? (
            <p className="text-center text-gray-500">No unchecked submissions available.</p>
          ) : (
            submissions.map((submission) => (
              <div key={submission._id} className="p-6 rounded-md border border-gray-300">
                <h3 className="font-semibold">Exercise: {submission.exerciseName}</h3>
                <p>
                  Submitted by: {submission.firstName} {submission.lastName}
                </p>
                <p>Submitted on: {new Date(submission.createdAt).toLocaleString()}</p>
                <div className="mt-4 flex gap-4">
                  <Button
                    variant="secondary"
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