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
    userHearts: number;  // Adding the hearts field as it's important
};

const ShopPage = () => {
    const { user } = useClerk(); // Get the current user from Clerk
    const [userData, setUserData] = useState<User | null>(null); // Store user data here
    const [loading, setLoading] = useState(true); // For loading state

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (!user?.id) return; // If there's no user, stop fetching
                const response = await fetch(`/api/user?clerkId=${user.id}`);
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
                    <div className="space-y-4" />
                </div>
            </FeedWrapper>
        </div>
    );
};

export default ShopPage;
