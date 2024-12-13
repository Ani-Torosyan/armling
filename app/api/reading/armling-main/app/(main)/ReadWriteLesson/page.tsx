"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FeedWrapper } from "@/components/feed-wrapper";
import { Header } from "../header";
import { UserProgress } from "@/components/user-progress";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { Button } from "@/components/ui/button";
import { Promo } from "@/components/promo";

interface ReadingLesson {
    _id: string;
    task: string;
    explanation: string;
    passage?: string;
    romanizedPassage?: string;
    correct: number;
    point: number;
    vocabulary?: {
        word: string;
        translation: string;
        pronunciation: string;
    }[];
}

interface WritingLesson {
    _id: string;
    title: string;
    introduction: string;
    sentences: {
        sentence: string;
        translation: string;
        explanation: string;
    }[];
    correct: number;
    point: number;
}

const LessonPage = () => {
    const { user } = useClerk(); // Get the current user from Clerk
    const router = useRouter();

    // States
    const [readingLessons, setReadingLessons] = useState<ReadingLesson[]>([]);
    const [writingLessons, setWritingLessons] = useState<WritingLesson[]>([]);
    const [points, setPoints] = useState(0);
    const [hearts, setHearts] = useState(5);
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<{ userHearts: number; userExp: number } | null>(null);

    useEffect(() => {
        const fetchLessonData = async () => {
            try {
                const response = await axios.get("/api/reading-writing-lessons");
                const { readingLessons, writingLessons } = response.data;
                setReadingLessons(readingLessons);
                setWritingLessons(writingLessons);
            } catch (error) {
                console.error("Error fetching lesson data:", error);
            }
        };

        const fetchUserData = async () => {
            if (!user?.id) return; // Ensure we have a user ID
            try {
                const response = await fetch(`/api/user?userId=${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setUserData(data);
                    setHearts(data.userHearts || 5); // Set initial hearts from user data
                    setPoints(data.userExp || 0); // Set initial points from user data
                } else {
                    console.error("Error fetching user data");
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

    const handleReadingTaskSubmit = async (correct: boolean, point: number) => {
        if (correct) {
            const newPoints = points + point;
            setPoints(newPoints);
            setFeedbackMessage("Ճիշտ է!");

            try {
                await axios.put("/api/user", {
                    userId: user?.id,
                    score: newPoints,
                });
            } catch (error) {
                console.error("Error updating user experience:", error);
            }
        } else {
            setFeedbackMessage("Սխալ է. Փորձեք նորից!");
            setHearts((prevHearts) => Math.max(0, prevHearts - 1));
        }
    };

    const handleWritingSubmit = async (correct: boolean, point: number) => {
        if (correct) {
            const newPoints = points + point;
            setPoints(newPoints);
            setFeedbackMessage("Ճիշտ է!");

            try {
                await axios.put("/api/user", {
                    userId: user?.id,
                    score: newPoints,
                });
            } catch (error) {
                console.error("Error updating user experience:", error);
            }
        } else {
            setFeedbackMessage("Սխալ է. Փորձեք նորից!");
            setHearts((prevHearts) => Math.max(0, prevHearts - 1));
        }
    };

    // Handle loading and error states
    if (loading) return <div>Loading...</div>;
    if (!userData) return <div>No user data available</div>;

    return (
        <div className="flex gap-[48px] px-6">
            <FeedWrapper>
                <Header title="Reading & Writing Lessons" />

                {/* Reading Section */}
                <div>
                    <h2 className="text-2xl font-semibold">Reading Lessons</h2>
                    {readingLessons.map((lesson) => (
                        <div key={lesson._id} className="my-4 p-4 bg-white shadow-lg rounded-md border border-gray-200">
                            <h3 className="text-xl font-semibold">{lesson.task}</h3>
                            <p className="text-gray-600">{lesson.explanation}</p>

                            {/* Render passage and romanizedPassage if available */}
                            {lesson.passage && <p className="text-gray-800">{lesson.passage}</p>}
                            {lesson.romanizedPassage && <p className="text-gray-500 italic">{lesson.romanizedPassage}</p>}

                            {/* Render Vocabulary if available */}
                            {lesson.vocabulary && (
                                <div className="mt-4">
                                    <h4 className="text-lg font-semibold">Vocabulary</h4>
                                    <ul>
                                        {lesson.vocabulary.map((wordObj, index) => (
                                            <li key={index} className="mt-2">
                                                <p className="text-gray-800">{wordObj.word}</p>
                                                <p className="text-gray-500 italic">{wordObj.translation}</p>
                                                <p className="text-gray-400 text-sm">{wordObj.pronunciation}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <Button
                                onClick={() => handleReadingTaskSubmit(lesson.correct === 1, lesson.point)}
                                size="sm"
                                className="mt-4"
                            >
                                Submit
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Writing Section */}
                <div className="mt-6">
                    <h2 className="text-2xl font-semibold">Writing Lessons</h2>
                    {writingLessons.map((lesson) => (
                        <div key={lesson._id} className="my-4 p-4 bg-white shadow-lg rounded-md border border-gray-200">
                            <h3 className="text-xl font-semibold">{lesson.title}</h3>
                            <p className="text-gray-600">{lesson.introduction}</p>
                            <div>
                                {lesson.sentences.map((sentenceObj, index) => (
                                    <div key={index} className="my-2">
                                        <p className="text-gray-800">{sentenceObj.sentence}</p>
                                        <p className="text-gray-500 italic">{sentenceObj.translation}</p>
                                        <p className="text-gray-400 text-sm">{sentenceObj.explanation}</p>
                                    </div>
                                ))}
                            </div>
                            <Button
                                onClick={() => handleWritingSubmit(lesson.correct === 1, lesson.point)}
                                size="sm"
                                className="mt-4"
                            >
                                Submit
                            </Button>
                        </div>
                    ))}
                </div>

                {/* Feedback Message */}
                {feedbackMessage && (
                    <div className="mt-4 text-center text-xl font-semibold">
                        <p className={feedbackMessage === "Ճիշտ է!" ? "text-green-500" : "text-red-500"}>{feedbackMessage}</p>
                    </div>
                )}
            </FeedWrapper>

            <StickyWrapper>
                <UserProgress hearts={hearts} points={points} hasActiveSubscription={false} />
                <Promo />
            </StickyWrapper>
        </div>
    );
};

export default LessonPage;
