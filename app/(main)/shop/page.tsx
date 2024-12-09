"use client";

import { useState, useEffect } from "react";
import { useClerk } from "@clerk/nextjs"; // To get the current user's clerkId
import { StickyWrapper } from "@/components/sticky-wrapper";
import { FeedWrapper } from "@/components/feed-wrapper";
import { UserProgress } from "@/components/user-progress";
import { Header } from "../header";

type User = {
    userName: string;
    userExp: number;
    userImg: string;
    firstName: string;
    lastName: string;
    userHearts: number;
    lastHeartUpdate: string; // Add the lastHeartUpdate field
};

const ShopPage = () => {
    const { user } = useClerk(); // Get the current user from Clerk
    const [userData, setUserData] = useState<User | null>(null); // Store user data here
    const [loading, setLoading] = useState(true); // For loading state
    const [timeUntilRefill, setTimeUntilRefill] = useState<string>("");

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (!user?.id) return; // If there's no user, stop fetching
                const response = await fetch(`/api/user?userId=${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setUserData(data); // Set user data in state
                } else {
                    console.error("Error fetching user data");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false); // Stop loading when data is fetched
            }
        };

        if (user) {
            fetchUserData(); // Call the function to fetch user data
        }
    }, [user]); // Re-run the effect when `user` changes

    useEffect(() => {
        // Calculate time until the next refill
        if (userData && userData.lastHeartUpdate) {
            const lastHeartUpdate = new Date(userData.lastHeartUpdate);
            const now = new Date();
            const refillTime = new Date(lastHeartUpdate.getTime() + 5 * 60 * 1000); // Add 5 minutes for the next refill
            const timeDiff = refillTime.getTime() - now.getTime();

            if (timeDiff > 0) {
                const minutes = Math.floor(timeDiff / 60000);
                const seconds = Math.floor((timeDiff % 60000) / 1000);
                setTimeUntilRefill(`${minutes}m ${seconds}s`);
            } else {
                setTimeUntilRefill("Ready for refill!");
            }
        }
    }, [userData]); // Recalculate when user data changes

    if (loading) {
        return <div>Loading...</div>; // Loading state while fetching
    }

    if (!userData) {
        return <div>No user data available</div>; // Handle case if there's no user data
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
                <div>
                    <Header title="Shop" />
                    <div className="space-y-4">
                        <p>
                            Time until next heart refill: {timeUntilRefill}
                        </p>
                    </div>
                </div>
            </FeedWrapper>
        </div>
    );
};

export default ShopPage;
