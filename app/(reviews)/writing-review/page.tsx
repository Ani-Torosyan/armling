"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const WritingSubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [exerciseDetails, setExerciseDetails] = useState<Record<string, { task: string; exerciseType: string }>>({});
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
<<<<<<< HEAD
=======

        // Fetch exercise details for each submission
        const details: Record<string, { task: string; exerciseType: string }> = {};
        await Promise.all(
          data.map(async (submission: any) => {
            const exerciseUUID = submission.exerciseUUID;
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
>>>>>>> 5670c6fc54221328f0b0137f0ff7e11decddacaf
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Writing Submissions</h1>
      {submissions.length === 0 ? (
        <div className="text-center text-green-500 text-lg">
          🎉 No unchecked writing exercises! Great job! 🎉
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission: any) => (
            <div key={submission._id} className="p-4 border rounded shadow">
              <p><strong>Nickname:</strong> {submission.nickname}</p>
              <p><strong>Exercise Type:</strong> {exerciseDetails[submission.exerciseUUID]?.exerciseType || "Loading..."}</p>
              <p><strong>Task:</strong> {exerciseDetails[submission.exerciseUUID]?.task || "Loading..."}</p>
              <p><strong>Submitted At:</strong> {new Date(submission.createdAt).toLocaleString()}</p>
              <div className="flex gap-4 mt-2">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                  onClick={() => downloadFile(submission.fileUrl)}
                >
                  Download
                </button>
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded"
                  onClick={() => handleView(submission._id, submission.fileUrl)}
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WritingSubmissionsPage;