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



    if (!user) {
        return <div>Loading...</div>;
    }

    const clerkId = user.id; // Get the unique Clerk ID
    console.log("Current Clerk ID:", clerkId);

    <div>Clerk ID: {clerkId}</div>;


    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (!user?.id) {
                    console.error("User ID is missing");
                    return;
                }
                console.log("Fetching data for user ID:", user.id);
                const response = await fetch(`/api/user?userId=${user.id}`);
                console.log("Response status:", response.status);
                if (response.ok) {
                    const data = await response.json();
                    console.log("User data fetched:", data);
                    setUserData(data);
                } else {
                    console.error("Error fetching user data:", await response.text());
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchUserData();
    }, [user]);
    

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
