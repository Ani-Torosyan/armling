"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FeedWrapper } from "@/components/feed-wrapper";
import { Header } from "../header";
import { UserProgress } from "@/components/user-progress";
import { StickyWrapper } from "@/components/sticky-wrapper";

interface SpeakingExercise {
  _id: string;
  title: string;
  content: string;
  point: string; // Not needed, but keeping for existing structure
}

const SpeakingPage = () => {
  const { user } = useClerk(); // Get the current user from Clerk
  const router = useRouter();

  // States
  const [speakingExercises, setSpeakingExercises] = useState<SpeakingExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [hearts, setHearts] = useState(5);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [recording, setRecording] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  useEffect(() => {
    // Fetch speaking exercises
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

  // Start Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        setAudioBlob(event.data); // Save the recorded audio blob
      };

      mediaRecorder.start();
      setRecording(mediaRecorder);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (recording) {
      recording.stop();
      setRecording(null);
    }
  };

  // Upload Audio
  const uploadRecording = async (exerciseId: string) => {
    if (!audioBlob || !user?.id) return;

    // Step 1: Upload audio to Azure Blob Storage
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
            Authorization: `Bearer ${process.env.AZURE_SAS_TOKEN}`, // Use your SAS token
          },
        }
      );

      if (azureResponse.status === 201) {
        console.log("Audio uploaded to Azure successfully");

        // Step 2: Save metadata to MongoDB
        await axios.post("/api/speaking", {
          userId: user.id,
          exerciseId,
          audioUrl: azureResponse.data.url, // Assuming Azure returns the URL of the uploaded file
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

  // Handle loading and error states
  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex gap-[48px] px-6">
      <FeedWrapper>
        <Header title="Speaking Exercises" />

        <div className="space-y-6">
          {speakingExercises.map((exercise) => (
            <div
              key={exercise._id}
              className="p-6 bg-white shadow-md rounded-md border border-gray-200"
            >
              <h3 className="font-semibold">{exercise.title}</h3>
              <p className="mt-2 text-gray-700">{exercise.content}</p>

              <div className="mt-4 space-x-4">
                {recording ? (
                  <button
                    onClick={stopRecording}
                    className="py-2 px-6 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
                  >
                    Stop Recording
                  </button>
                ) : (
                  <button
                    onClick={startRecording}
                    className="py-2 px-6 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200"
                  >
                    Start Recording
                  </button>
                )}

                <button
                  onClick={() => uploadRecording(exercise._id)}
                  className="py-2 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
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
          hearts={hearts} // Pass hearts from state
          points={0} // Points are not relevant for recording
          hasActiveSubscription={hasActiveSubscription} // Pass subscription status from state
        />
      </StickyWrapper>
    </div>
  );
};

export default SpeakingPage;
