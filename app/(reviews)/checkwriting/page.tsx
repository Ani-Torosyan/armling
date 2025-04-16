"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Header } from "../../(main)/header";

const CheckWritingPage = () => {
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
      const response = await fetch("/api/feedbackwriting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ submissionId, feedback }),
      });

      if (response.ok) {
        alert("Feedback submitted successfully!");
        router.push("/writing-review"); // Navigate back to /writing-review
      } else {
        const errorData = await response.json();
        console.error("Failed to submit feedback:", errorData.message);
        alert(errorData.message || "An error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Header title="Check Writing Submission" />
      <div className="p-6 text-customDark">
        <div className="mb-4">
          <a
            href={fileUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-customDark underline"
          >
            Download the Submission
          </a>
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
            onClick={() => router.push("/writing-review")} // Explicitly navigate to /writing-review
          >
            Back
          </Button>
        </div>
      </div>
    </>
  );
};

export default CheckWritingPage;