"use client";

import { useState, useEffect } from "react";
import { useClerk } from "@clerk/nextjs"; // To get the current user's Clerk ID
import { StickyWrapper } from "@/components/sticky-wrapper";
import { FeedWrapper } from "@/components/feed-wrapper";
import { UserProgress } from "@/components/user-progress";
import { Header } from "../header";
import { Promo } from "@/components/promo";

const LearnPage = () => {
    const { user } = useClerk(); // Get the current user from Clerk
    const [userData, setUserData] = useState<{ userHearts: number; userExp: number } | null>(null); // Store user data here
    const [loading, setLoading] = useState(true); // For loading state
    const [timeUntilRefill, setTimeUntilRefill] = useState<string>("");

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (!user?.id) return; // If there's no user, stop fetching
                const response = await fetch(`/api/user?userId=${user.id}`); // Assuming the user data API
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

    // Handling loading state
    if (loading) {
        return <div>Loading...</div>;
    }

    // Handling case where user data isn't available
    if (!userData) {
        return <div>No user data available</div>;
    }

    return (
        <div className="flex flex-row-reverse gap-[48px] px-6">
            <StickyWrapper>
                <UserProgress
                    hearts={userData.userHearts}  // Set hearts from MongoDB
                    points={userData.userExp}  // Set points from MongoDB
                    hasActiveSubscription={false}  // Assuming false here, you can adjust logic as necessary
                />
                <Promo />
            </StickyWrapper>
            <FeedWrapper>
                <Header title="Home" />
                <div className="space-y-4">
                    {/* Additional content can go here */}
                </div>
            </FeedWrapper>
        </div>
    );
};

export default LearnPage;
