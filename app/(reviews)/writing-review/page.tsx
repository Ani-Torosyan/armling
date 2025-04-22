"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "../../(main)/header";
import { Button } from "@/components/ui/button";
import { FeedWrapper } from "@/components/feed-wrapper";

const WritingSubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [exerciseNames, setExerciseNames] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch("/api/writingsubmission");
        if (!response.ok) {
          throw new Error("Failed to fetch writing submissions");
        }
        const data = await response.json();
        setSubmissions(data);

        // Fetch exercise names for each submission
        const exerciseNamesMap: { [key: string]: string } = {};
        await Promise.all(
          data.map(async (submission: any) => {
            if (!exerciseNamesMap[submission.exerciseUUID]) {
              const exerciseResponse = await fetch(`/api/exercise?uuid=${submission.exerciseUUID}`);
              if (exerciseResponse.ok) {
                const exerciseData = await exerciseResponse.json();
                exerciseNamesMap[submission.exerciseUUID] = exerciseData.task || "Unknown Exercise";
              } else {
                exerciseNamesMap[submission.exerciseUUID] = "Unknown Exercise";
              }
            }
          })
        );
        setExerciseNames(exerciseNamesMap);
      } catch (error) {
        console.error("Error fetching writing submissions:", error);
      }
    };

    fetchSubmissions();
  }, []);

  const downloadFile = (fileUrl: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileUrl.split("/").pop() || "file.txt";
    link.click();
  };

  const handleView = (submissionId: string, fileUrl: string) => {
    router.push(`/checkwriting?id=${submissionId}&fileUrl=${encodeURIComponent(fileUrl)}`);
  };

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
    <FeedWrapper>
      <Header title="Writing Reviews" />
      <div className="space-y-6 text-customDark mt-4">
        {submissions.length === 0 ? (
          <p className="p-4 text-center text-customDark">No submissions available or loading, please wait.</p>
          
        ) : (
          submissions.map((submission: any) => (
            <div key={submission._id} className="p-4">
              <p><strong>Nickname:</strong> {submission.nickname}</p>
              <p><strong>Exercise:</strong> {exerciseNames[submission.exerciseUUID] || "Loading..."}</p>
              <p><strong>Submitted At:</strong> {new Date(submission.createdAt).toLocaleString()}</p>
              <div className="flex gap-4 mt-2">
                <Button
                  variant="primary"
                  onClick={() => downloadFile(submission.fileUrl)}
                >
                  Download
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleView(submission._id, submission.fileUrl)}
                >
                  Check Writing
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

export default WritingSubmissionsPage;