"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "../../(main)/header";
import { Button } from "@/components/ui/button";

const WritingSubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
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
    <>
      <Header title="Writing Reviews" />
      <div className="space-y-4 text-customDark border-2 rounded shadow border-customShade mt-4">
        {submissions.map((submission: any) => (
          <div key={submission._id} className="p-4">
            <p><strong>Nickname:</strong> {submission.nickname}</p>
            <p><strong>Exercise UUID:</strong> {submission.exerciseUUID}</p>
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
                View
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default WritingSubmissionsPage;