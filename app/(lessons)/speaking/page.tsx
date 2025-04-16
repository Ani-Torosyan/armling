"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FeedWrapper } from "@/components/feed-wrapper";
import { Header } from "@/app/(main)/header";
import Loading from "@/app/(main)/loading";
import { Button } from "@/components/ui/button";

interface SpeakingExercise {
  _id: string;
  title: string;
  content: string;
  point: string;
}

const SpeakingPage = () => {
  const { user } = useClerk();
  const router = useRouter();

  const [speakingExercises, setSpeakingExercises] = useState<SpeakingExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [showContinue, setShowContinue] = useState(false);

  useEffect(() => {
    const fetchSpeakingExercises = async () => {
      try {
        const response = await axios.get("/api/speaking");
        if (response.data.SpeakingExercise) {
          setSpeakingExercises(response.data.SpeakingExercise);
        } else {
          console.error("No speaking exercises found");
        }
      } catch (error) {
        console.error("Error fetching speaking exercises:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpeakingExercises();
  }, [user]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const fullBlob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(fullBlob);
      };

      mediaRecorder.start();
      setRecording(mediaRecorder);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (recording) {
      recording.stop();
      setRecording(null);
    }
  };

  const uploadRecording = async (exerciseId: string) => {
    if (!audioBlob || !user?.id) return;
  
    const fileName = `exercise_${exerciseId}_${user.id}_${Date.now()}.webm`;
    const sasToken = process.env.NEXT_PUBLIC_AZURE_SAS_TOKEN;
    const uploadUrl = `https://armling01.blob.core.windows.net/user-recordings/${fileName}?${sasToken}`;
    console.log("Upload URL:", uploadUrl);

  
    const audioFile = new File([audioBlob], fileName, { type: "audio/webm" });
  
    try {
      await axios.put(uploadUrl, audioFile, {
        headers: {
          "x-ms-blob-type": "BlockBlob",
          "Content-Type": "audio/webm",
        },
      });
  
      console.log("Uploaded successfully to Azure");
  
      await axios.post("/api/speaking", {
        userId: user.id,
        exerciseId,
        audioUrl: uploadUrl.split("?")[0],
      });
  
      alert("Recording uploaded successfully!");
      setShowContinue(true);
      setAudioBlob(null);
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error details:", error.toJSON());
      } else {
        console.error("Unexpected error:", error);
      }
    
      alert("Failed to upload recording. Check CORS settings and SAS token.");
    }
  };
  

  const handleBack = () => {
    router.push("/learn");
  };

  const handleContinue = () => {
    router.push("/writing");
  };

  if (loading) return <Loading />;

  return (
    <div className="flex gap-[48px] px-6">
      <FeedWrapper>
        <Header title="Speaking Exercises" />

        <div className="space-y-6">
          <div className="text-left mb-4">
            <Button onClick={handleBack} size="lg" className="rounded-full" variant={"ghost"}>
              <img src="back.svg" alt="Back" className="w-4 h-4 mr-2" />
              Back to Learn
            </Button>
          </div>

          {speakingExercises.map((exercise) => (
            <div key={exercise._id} className="p-6 rounded-md">
              <h3 className="font-semibold flex justify-center text-customDark">{exercise.title}</h3>
              <p className="mt-2 text-customDark flex justify-center">{exercise.content}</p>

              <div className="mt-4 space-x-4 flex justify-center">
                {recording ? (
                  <Button onClick={stopRecording} variant="danger">
                    Stop Recording
                  </Button>
                ) : (
                  <Button
                    onClick={startRecording}
                    variant={"secondary"}
                    disabled={showContinue}
                  >
                    Start Recording
                  </Button>
                )}

                <Button
                  onClick={() => uploadRecording(exercise._id)}
                  variant={"primary"}
                  disabled={!audioBlob || showContinue}
                >
                  Upload Recording
                </Button>
              </div>

              {audioBlob && (
                <div className="mt-4 flex justify-center">
                  <audio controls src={URL.createObjectURL(audioBlob)} />
                </div>
              )}
            </div>
          ))}

          {showContinue && (
            <div className="mt-6 text-center">
              <Button variant="primary" onClick={handleContinue}>
                Continue
              </Button>
            </div>
          )}
        </div>
      </FeedWrapper>
    </div>
  );
};

export default SpeakingPage;
