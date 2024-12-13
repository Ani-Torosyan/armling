"use client";

import { useState, useEffect } from "react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FeedWrapper } from "@/components/feed-wrapper";
import { Header } from "../header";
import { UserProgress } from "@/components/user-progress";
import { StickyWrapper } from "@/components/sticky-wrapper";

interface ReadingExercise {
    _id: string;
    task: string;
    correct: number;
    exerciseType: string;
    point: string;
    passage: string;
    questions: { question: string; options: string[]; correctAnswer: string }[]; 
    group: string;
}

const ReadingPage = () => {
    const { user } = useClerk();
    const router = useRouter();

    const [exercise, setExercise] = useState<ReadingExercise | null>(null);
    const [loading, setLoading] = useState(true);
    const [userAnswer, setUserAnswer] = useState<number | null>(null);
    const [answerStatus, setAnswerStatus] = useState<"correct" | "incorrect" | null>(null);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const fetchExercise = async () => {
            if (!user?.id) return; // Ensure user is authenticated
            try {
                const response = await fetch("/api/reading"); // Adjust the API endpoint for reading
                if (response.ok) {
                    const data = await response.json();
                    if (data.ReadingExercise && data.ReadingExercise.length > 0) {
                        setExercise(data.ReadingExercise[0]);
                    } else {
                        setExercise(null); // No exercises found, set to null
                    }
                } else {
                    setExercise(null); // In case of failed API call, set to null
                }
            } catch (error) {
                console.error("Error fetching exercise data:", error);
                setExercise(null); // In case of error, set to null
            } finally {
                setLoading(false);
            }
        };

        fetchExercise();
    }, [user]); // Run when `user` changes

    const handleAnswerSelect = (index: number) => {
        if (userAnswer !== null) return; // Prevent multiple answers
        setUserAnswer(index);
        const correctAnswer = exercise?.questions[0].correctAnswer;

        if (exercise?.questions[0].options[index] === correctAnswer) {
            setScore(score + parseInt(exercise?.point || "0", 10));
            setAnswerStatus("correct");
        } else {
            setAnswerStatus("incorrect");
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!exercise) return <div>No reading exercises found. Please try again later.</div>; // Show a user-friendly message

    return (
        <div className="flex gap-[48px] px-6">
            <FeedWrapper>
                <Header title="Reading Exercise" />
                <div className="space-y-4">
                    <p>{exercise.passage}</p>
                    <div className="my-4 p-4 bg-white shadow-lg rounded-md border border-gray-200">
                        <h2 className="text-xl font-semibold mb-4">{exercise.task}</h2>

                        {exercise.questions.map((q, index) => (
                            <div key={index}>
                                <p>{q.question}</p>
                                <div className="space-y-4">
                                    {q.options.map((option, optionIndex) => (
                                        <button
                                            key={optionIndex}
                                            className={`w-full p-4 text-left rounded-lg border ${
                                                userAnswer === optionIndex
                                                    ? answerStatus === "correct"
                                                        ? "bg-green-500 text-white"
                                                        : "bg-red-500 text-white"
                                                    : "bg-gray-100"
                                            } hover:bg-gray-200`}
                                            onClick={() => handleAnswerSelect(optionIndex)}
                                            disabled={userAnswer !== null} // Disable after answer is selected
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {userAnswer !== null && (
                            <div className="mt-4 text-center text-xl font-semibold">
                                {answerStatus === "correct" ? "Ճիշտ է!" : "Սխալ է. Փորձեք նորից!"}
                            </div>
                        )}
                    </div>
                </div>
            </FeedWrapper>

            <StickyWrapper>
                <UserProgress points={score} hearts={5} hasActiveSubscription={false} />
            </StickyWrapper>
        </div>
    );
};

export default ReadingPage;