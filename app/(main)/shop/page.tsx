"use client";

import { useState, useEffect } from "react";
import { useClerk } from "@clerk/nextjs"; 
import { StickyWrapper } from "@/components/sticky-wrapper";
import { FeedWrapper } from "@/components/feed-wrapper";
import { UserProgress } from "@/components/user-progress";
import { Header } from "../header";
import { Items } from "./items";
import Loading from "../loading";

type User = {
    userName: string;
    userExp: number;
    userImg: string;
    firstName: string;
    lastName: string;
    userHearts: number;
    lastHeartUpdate: string;
};

const ShopPage = () => {
    const { user } = useClerk();
    const [userData, setUserData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [time, setTime] = useState<number>(0);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (!user?.id) return;
                const response = await fetch(`/api/user?userId=${user.id}`);
                if (response.ok) {
                    const data = await response.json();
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

    //Problems below
    useEffect(() => {
        if (userData && userData.lastHeartUpdate) {
            const updateTimer = () => {
                const now = Date.now();
                const lastUpdate = new Date(userData.lastHeartUpdate).getTime();
                const timeElapsed = Math.floor((now - lastUpdate) / 1000);
                const heartsToAdd = Math.floor(timeElapsed / 300);

                if (heartsToAdd > 0 && userData.userHearts < 5) {
                    const newHearts = Math.min(userData.userHearts + heartsToAdd, 5);
                    setUserData((prev) => prev && { ...prev, userHearts: newHearts });

                    const newLastUpdate = new Date(lastUpdate + heartsToAdd * 300 * 1000);
                    setUserData((prev) =>
                        prev && { ...prev, lastHeartUpdate: newLastUpdate.toISOString() }
                    );
                }

                const nextRefillTime = 300 - (timeElapsed % 300);
                setTime(nextRefillTime);
            };

            updateTimer();

            const timer = setInterval(updateTimer, 1000);
            return () => clearInterval(timer);
        }
    }, [userData]);

    if (loading) return <Loading/>

    if (!userData) {
        return <div>No user data available</div>;
    }

    return (
        <div className="flex flex-row-reverse gap-[48px] px-6">
            <StickyWrapper>
                <UserProgress
                    hearts={userData.userHearts}
                    points={userData.userExp}
                    hasActiveSubscription={false}
                />
            </StickyWrapper>
            <FeedWrapper>
                <Header title="Shop" />
                <div className="w-full flex flex-col items-center">
                    <Items hearts={userData.userHearts} time={time} sub={false} />
                </div>
            </FeedWrapper>
        </div>
    );
};

export default ShopPage;


