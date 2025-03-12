"use client";

import { useState, useEffect } from "react";
import { useClerk } from "@clerk/nextjs"; 
import { StickyWrapper } from "@/components/sticky-wrapper";
import { FeedWrapper } from "@/components/feed-wrapper";
import { UserProgress } from "@/components/user-progress";
import { Header } from "../header";
import { Promo } from "@/components/promo";
import Loading from "../loading";
import { Button } from "@/components/ui/button"; 
import Image from "next/image"; 

const LearnPage = () => {
    const { user } = useClerk();
    const [userData, setUserData] = useState<{ userHearts: number; userExp: number; subscription: boolean } | null>(null); 
    const [unit] = useState<{ title: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (!user?.id) return; 
                const response = await fetch(`/api/user?userId=${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log(data); 
                    setUserData(data); 
                } else {
                    console.error("Error fetching user data");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchUserData(); 
        }
    }, [user]); 

    if (loading) return <Loading/>

    if (!userData) {
        return <div className="text-center text-customDark">Something went wrong. Please reload the page.</div>;
    }

    return (
        <div className="flex flex-row-reverse gap-[48px] px-6">
            <StickyWrapper>
                <UserProgress
                    hearts={userData.userHearts}  
                    points={userData.userExp} 
                    hasActiveSubscription={userData.subscription}  
                />
                {userData.subscription === false && <Promo />}
            </StickyWrapper>
            <FeedWrapper>
                <Header title="Home" />
                <div className="space-y-4">
                    {unit && (
                        <h2 className="text-2xl font-bold text-customDark text-center">
                        {unit.title}
                        </h2>
                    )}

                    <div className="text-center mt-6 text-customDark">
                        <h1 className="font-bold text-base"> Lesson 1 </h1>
                    </div>

                    <div className="relative w-[300px] h-[300px] mx-auto mt-8">
                        <div className="absolute inset-0 flex items-center justify-center">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="absolute w-2 h-2 bg-gray-300 rounded-full animate-pulse" />
                        ))}
                        </div>

                        <div className="absolute top-[10%] left-1/2 transform -translate-x-1/2 group">
                        <Button
                            asChild
                            variant="primary"
                            size="icon"
                            className="rounded-full shadow-xl hover:scale-110 transition duration-300"
                        >
                            <a href="/lesson">
                            <Image src="/lesson.svg" alt="Lesson Icon" width={25} height={25} />
                            </a>
                        </Button>
                        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-sm text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                            Lesson
                        </div>
                    </div>

                    <div className="absolute top-[20%] left-[80%] transform -translate-x-1/2 group">
                        <Button
                            asChild
                            variant="primary"
                            size="icon"
                            className="rounded-full shadow-xl hover:scale-110 transition duration-300"
                        >
                            <a href="/reading">
                            <Image src="/reading.svg" alt="Reading Icon" width={26} height={26} />
                            </a>
                        </Button>
                        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-sm text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                            Reading
                        </div>
                    </div>

                    <div className="absolute top-[45%] left-[100%] transform -translate-x-full group">
                        <Button
                            asChild
                            variant="primary"
                            size="icon"
                            className="rounded-full shadow-xl hover:scale-110 transition duration-300"
                        >
                            <a href="/listening">
                            <Image src="/listening.svg" alt="Listening Icon" width={23} height={23} />
                            </a>
                        </Button>
                        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-sm text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                            Listening
                        </div>
                    </div>

                    <div className="absolute top-[70%] left-[80%] transform -translate-x-1/2 group">
                        <Button
                            asChild
                            variant="primary"
                            size="icon"
                            className="rounded-full shadow-xl hover:scale-110 transition duration-300"
                        >
                            <a href="/speaking">
                            <Image src="/speaking.svg" alt="Speaking Icon" width={23} height={23} />
                            </a>
                        </Button>
                        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-sm text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                            Speaking
                        </div>
                    </div>

                    <div className="absolute bottom-[10%] left-1/2 transform -translate-x-1/2 group">
                        <Button
                            asChild
                            variant="primary"
                            size="icon"
                            className="rounded-full shadow-xl hover:scale-110 transition duration-300"
                        >
                            <a href="/writing">
                            <Image src="/writing.svg" alt="Writing Icon" width={24} height={24} />
                            </a>
                        </Button>
                        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-sm text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                            Writing
                        </div>
                    </div>
                </div>
            </div>
        </FeedWrapper>
        </div>
    );
};

export default LearnPage;