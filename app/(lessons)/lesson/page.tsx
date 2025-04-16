"use client";
// userExp update in mongodb
import { useState, useEffect } from "react";
import axios from "axios";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FeedWrapper } from "@/components/feed-wrapper";
import { Header } from "@/app/(main)/header";
import { Button } from "@/components/ui/button";
import Loading from "@/app/(main)/loading";

interface LessonUnit {
  _id: string;
  uuid: string;
  title: string;
  groupId: string;
}

interface LessonExercise {
  _id: string;
  name: string;
  audio: string;
  picture: string;
  correct: string;
  point: string;
  name2: string;
}

const LessonPage = () => {
  const { user } = useClerk();
  const router = useRouter();

  const [lessonUnits, setLessonUnits] = useState<LessonUnit[]>([]);
  const [lessonExercises, setLessonExercises] = useState<LessonExercise[]>([]);
  const [userData, setUserData] = useState<{
    userExp: number;
    subscription: boolean;
    lesson: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<1 | 2>(1);

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
          setUserData(response.data);
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

  const handleContinue = () => {
    router.push("/reading");
  };

  const handleBack = () => {
    router.push("/learn");
  };

  if (loading) return <Loading />;
  if (!userData) return <div className="text-center text-customDark">Something went wrong. Please reload the page.</div>;

  return (
    <div className="flex gap-[48px] px-6">
      <FeedWrapper>
        <Header title="Lesson Page" />

        <div className="text-left mb-4">
          <Button onClick={handleBack} size="lg" className="rounded-full" variant="ghost">
            <img src="/back.svg" alt="Back" className="w-4 h-4 mr-2" />
            Back to Learn
          </Button>
        </div>

        
        {lessonUnits.map((unit) => (
          <div key={unit._id} className="my-4 p-4 text-customDark">
            <h3 className="text-xl font-semibold flex flex-col items-center">{unit.title}</h3>
            <p className="text-center text-l text-customDark mt-2">Vocabulary and Audio study materials for the Lesson unit.</p>
          </div>
        ))}

        
        {step === 1 && (
          <div className="flex flex-col gap-6 items-center mt-6">
            {lessonExercises.map((exercise) => (
              <div key={exercise._id} className="flex items-center gap-4">
                <img
                  src={exercise.picture}
                  alt={exercise.name}
                  className="w-32 h-32 object-contain mr-14"
                />
                <span className="text-lg font-medium">{exercise.name}</span>
              </div>
            ))}

            <Button variant="primary" onClick={() => setStep(2)} className="mt-6 text-center">
              Continue
            </Button>
          </div>
        )}

        
      {step === 2 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
            {lessonExercises.map((exercise) => (
              <div
                key={exercise._id}
                className="relative group flex flex-col items-center justify-center rounded-lg overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 p-4 bg-opacity-70 bg-customDark text-custom text-lg font-semibold text-center">
                  {exercise.name2}
                </div>
                <button
                  onClick={() => new Audio(exercise.audio).play()}
                  className="w-full h-48 flex items-center justify-center bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${exercise.picture})`,
                    backgroundSize: "50%",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  <div className="absolute inset-0 bg-customDark opacity-10 group-hover:opacity-40 transition-opacity"></div>
                </button>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button variant="primary" onClick={() => setStep(1)} className="mt-6 text-center mr-8">
              Previous
            </Button>
            <Button variant="primary" onClick={handleContinue}>
              Continue
            </Button>
          </div>
        </>
      )}
      </FeedWrapper>
    </div>
  );
};

export default LessonPage;
