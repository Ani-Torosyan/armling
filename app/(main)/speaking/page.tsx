"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FeedWrapper } from "@/components/feed-wrapper";
import { Header } from "../header";
import { UserProgress } from "@/components/user-progress";
import { StickyWrapper } from "@/components/sticky-wrapper";
import Loading from "../loading";
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
  const [hearts] = useState(5);
  const [hasActiveSubscription] = useState(false);
  const [recording, setRecording] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

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

      mediaRecorder.ondataavailable = (event) => {
        setAudioBlob(event.data); 
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

  const handleBack = () => {
    router.push("/learn");
  };

  const uploadRecording = async (exerciseId: string) => {
    if (!audioBlob || !user?.id) return;

    const formData = new FormData();
    const audioFile = new File([audioBlob], `exercise_${exerciseId}_${Date.now()}.webm`, {
      type: "audio/webm",
    });
    formData.append("file", audioFile);

    try {
      const azureResponse = await axios.post(
        "https://armling01.blob.core.windows.net/user-recordings?sp=rawdl&st=2024-12-10T06:24:09Z&se=2025-01-02T14:24:09Z&spr=https&sv=2022-11-02&sr=c&sig=Lq%2FmPkELpJUsBziABoUlWFn%2FJYCL0vKY6afFDDtnP2w%3D",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${process.env.AZURE_SAS_TOKEN}`,
          },
        }
      );

      if (azureResponse.status === 201) {
        console.log("Audio uploaded to Azure successfully");

        await axios.post("/api/speaking", {
          userId: user.id,
          exerciseId,
          audioUrl: azureResponse.data.url,
        });

        alert("Recording uploaded successfully!");
      } else {
        console.error("Azure upload failed", azureResponse.data);
        alert("Failed to upload recording");
      }
    } catch (error) {
      console.error("Error uploading audio:", error);
    }
  };

  if (loading) return <Loading/>;

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
            <div
              key={exercise._id}
              className="p-6 rounded-md"
            >
              <h3 className="font-semibold">{exercise.title}</h3>
              <p className="mt-2 text-gray-700">{exercise.content}</p>

              <div className="mt-4 space-x-4">
                {recording ? (
                  <button
                    onClick={stopRecording}
                    className="py-2 px-6 bg-red-500 text-custom rounded-lg hover:bg-red-600 transition-all duration-200"
                  >
                    Stop Recording
                  </button>
                ) : (
                  <button
                    onClick={startRecording}
                    className="py-2 px-6 bg-gray-400 text-custom rounded-lg hover:bg-gray-400/90 transition-all duration-200"
                  >
                    Start Recording
                  </button>
                )}

                <button
                  onClick={() => uploadRecording(exercise._id)}
                  className="py-2 px-6 bg-orange-400 text-custom rounded-lg hover:bg-orange-400/90 transition-all duration-200"
                  disabled={!audioBlob}
                >
                  Upload Recording
                </button>
              </div>
            </div>
          ))}
        </div>
      </FeedWrapper>

      <StickyWrapper>
        <UserProgress
          hearts={hearts} 
          points={0} 
          hasActiveSubscription={hasActiveSubscription} 
        />
      </StickyWrapper>
    </div>
  );
};

export default SpeakingPage;
