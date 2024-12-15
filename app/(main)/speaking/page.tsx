//TODO: Upload into cloud
//TODO: Lesson repetition case handeled(no repetition allowed!)

"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FeedWrapper } from "@/components/feed-wrapper";
import { Header } from "../header";
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

  const handleContinue = () => {
    router.push("/writing");
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
              <h3 className="font-semibold flex justify-center text-customDark">{exercise.title}</h3>
              <p className="mt-2 text-customShade flex justify-center">{exercise.content}</p>

              <div className="mt-4 space-x-4 flex justify-center">
                {recording ? (
                  <Button
                    onClick={stopRecording}
                    variant="danger"
                  >
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
                  onClick={() => {
                    uploadRecording(exercise._id);
                    setShowContinue(true);
                  }}
                  variant={"primary"}
                  disabled={!audioBlob || showContinue}
                >
                  Upload Recording
                </Button>
              </div>
            </div>
          ))}

          {showContinue && (
            <div className="mt-6 text-center">
              <p className="text-green-600 font-semibold mb-2">Submission was successful!</p>
              <Button variant="primary" onClick={handleContinue}> Continue </Button>
            </div>
          )}

        </div>
      </FeedWrapper>
    </div>
  );
};

export default SpeakingPage;
