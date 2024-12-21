"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FeedWrapper } from "@/components/feed-wrapper";
import { Header } from "../header";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Button } from "@/components/ui/button";
import { Promo } from "@/components/promo";
import Loading from "../loading";

interface LessonUnit {
  _id: string;
  uuid: string;
  title: string;
  question: string;
  groupId: string;
}

interface LessonExercise {
  _id: string;
  name: string;
  audio: string;
  picture: string;
  correct: string;
  point: string;
}

const LessonPage = () => {
  const { user } = useClerk();
  const router = useRouter();

  const [lessonUnits, setLessonUnits] = useState<LessonUnit[]>([]);
  const [lessonExercises, setLessonExercises] = useState<LessonExercise[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackColor, setFeedbackColor] = useState<string>(""); 
  const [userData, setUserData] = useState<{
    userExp: number;
    subscription: boolean;
    lesson: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [clickedExercise, setClickedExercise] = useState<{
    id: string | null;
    isCorrect: boolean | null;
  }>({ id: null, isCorrect: null });

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        const response = await axios.get("/api/lesson");
        const { lessonUnits, lessonExercises } = response.data;
        setLessonUnits(lessonUnits);
        setLessonExercises(lessonExercises);
      } catch (error) {
        console.error("Error fetching lesson data:", error);
      }
    };

    const fetchUserData = async () => {
      if (!user?.id) return;
      try {
        const response = await axios.get(`/api/user?userId=${user.id}`);
        if (response.status === 200) {
          const data = await response.data;
          setUserData(data);
        } else {
          console.error("Error fetching user data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
    fetchUserData();
  }, [user]);

  const handleExerciseClick = async (exercise: LessonExercise) => {
    if (!userData || !lessonUnits.length) return;

    const lessonUUID = lessonUnits[0]?.uuid;

    const audio = new Audio(exercise.audio);
    audio.play();

    if (exercise.correct === "1") {
      setClickedExercise({ id: exercise._id, isCorrect: true });
      setFeedbackMessage("Ճիշտ է!");
      setFeedbackColor("text-green-500"); 
    } else {
      setClickedExercise({ id: exercise._id, isCorrect: false });
      setFeedbackMessage("Սխալ է. Փորձեք նորից."); 
      setFeedbackColor("text-red-500");
    }
  };

  const handleContinue = () => {
    setFeedbackMessage(null);
    setClickedExercise({ id: null, isCorrect: null });
    setFeedbackColor(""); 
    router.push("/reading");
  };

  const handleBack = () => {
    router.push("/learn");
  };

  if (loading) return <Loading />;
  if (!userData) return <div>No user data available</div>;

  return (
    <div className="flex gap-[48px] px-6">
      <FeedWrapper>
        <Header title="Lesson Page" />
        <div className="space-y-4" />

        <div className="text-left mb-4">
          <Button onClick={handleBack} size="lg" className="rounded-full" variant={"ghost"}>
            <img src="back.svg" alt="Back" className="w-4 h-4 mr-2" />
            Back to Learn
          </Button>
        </div>

        {feedbackMessage === "Դուք արդեն ավարտել եք այս դասը." ? (
          <div className="text-center text-xl font-bold">Դուք արդեն ավարտել եք այս դասը:</div>
        ) : (
          <div>
            {lessonUnits.map((unit) => (
              <div key={unit._id} className="my-4 p-4 text-customDark">
                <h3 className="text-xl font-semibold">{unit.title}</h3>
                <p className="text-customDark text-l">{unit.question}</p>
              </div>
            ))}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
              {lessonExercises.map((exercise) => (
                <div
                  key={exercise._id}
                  className={`relative group flex flex-col items-center justify-center rounded-lg overflow-hidden ${
                    clickedExercise.id === exercise._id
                      ? clickedExercise.isCorrect
                        ? "bg-green-500"
                        : "bg-red-500"
                      : ""
                  }`}
                >
                  <div className="absolute top-0 left-0 right-0 p-4 bg-opacity-70 bg-customDark text-custom text-lg font-semibold text-center">
                    {exercise.name}
                  </div>
                  <button
                    onClick={() => handleExerciseClick(exercise)}
                    className={`w-full h-48 flex items-center justify-center bg-cover bg-center ${clickedExercise.isCorrect ? 'opacity-50' : ''}`}
                    style={{
                      backgroundImage: `url(${exercise.picture})`,
                      backgroundSize: "50%",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                    disabled={clickedExercise.isCorrect ?? false}
                  >
                    <div
                      className={`absolute inset-0 bg-customDark opacity-10 ${clickedExercise.isCorrect ? "opacity-10" : "group-hover:opacity-40"} transition-opacity`}
                    ></div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {feedbackMessage && (
          <div className="mt-4 text-center text-xl font-semibold">
            <p className={`font-semibold ${feedbackColor}`}>{feedbackMessage}</p>
          </div>
        )}

        {clickedExercise.isCorrect && (
          <div className="mt-6 text-center">
            <Button variant="primary" onClick={handleContinue}>
              Continue
            </Button>
          </div>
        )}
      </FeedWrapper>
    </div>
  );
};

export default LessonPage;
