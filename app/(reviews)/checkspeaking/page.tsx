"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Header } from "../../(main)/header";

const CheckSpeakingPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("id");
  const fileUrl = searchParams.get("fileUrl");

  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) {
      alert("Please write feedback before submitting.");
      return;
    }

    setLoading(true);

    try {
      // Submit feedback
      const feedbackResponse = await fetch("/api/feedbackspeaking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ submissionId, feedback }),
      });

      if (!feedbackResponse.ok) {
        const errorData = await feedbackResponse.json();
        console.error("Failed to submit feedback:", errorData.message);
        alert(errorData.message || "An error occurred. Please try again.");
        return;
      }

      

      

      alert("Feedback submitted and submission marked as checked!");
      router.push("/speaking-review"); // Navigate back to /speaking-review
    } catch (error) {
      console.error("Error submitting feedback or updating status:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header title="Check Speaking Submission" />
      <div className="p-6 text-customDark">
        <div className="mb-4">
          <audio controls className="w-full">
            <source src={fileUrl || "#"} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
        <textarea
          className="w-full p-4 border rounded mb-4"
          rows={5}
          placeholder="Write your feedback here..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
        <div className="flex gap-4">
          <Button
            variant={"primary"}
            onClick={handleSubmitFeedback}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Feedback"}
          </Button>
          <Button
            variant={"sidebar"}
            onClick={() => router.push("/speaking-review")} // Explicitly navigate to /speaking-review
          >
            Back
          </Button>
        </div>
      </div>
    </>
  );
};

export default CheckSpeakingPage;