"use client";

import { useState, useEffect } from "react";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { FeedWrapper } from "@/components/feed-wrapper";
import { UserProgress } from "@/components/user-progress";
import { Header } from "../header";

type User = {
    userId: string;
    username: string;
    hearts: number;
};

const ShopPage = () => {
    const [userData, setUserData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Step 1: Fetch userId from /api/data
                const dataResponse = await fetch("/api/data");
                if (!dataResponse.ok) {
                    console.error("Error fetching /api/data:", await dataResponse.text());
                    return;
                }
                const { data } = await dataResponse.json();
                const { userId, username } = data;

                // Step 2: Use userId to fetch full user data from MongoDB
                const userResponse = await fetch(`/api/user?userId=${userId}`);
                if (!userResponse.ok) {
                    console.error("Error fetching user data from MongoDB:", await userResponse.text());
                    return;
                }
                const userData = await userResponse.json();

                // Combine username from /api/data and hearts from MongoDB
                setUserData({
                    userId,
                    username,
                    hearts: userData.userHearts, // Retrieved from MongoDB
                });
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData(); // Fetch data
    }, []);

    if (loading) {
        return <div>Loading...</div>; // Show loading state
    }

    if (!userData) {
        return <div>No user data available</div>; // Handle missing data
    }

    return (
        <div className="flex flex-row-reverse gap-[48px] px-6">
            <StickyWrapper>
                <UserProgress
                    hearts={userData.hearts} // Use fetched hearts
                    points={0} // Placeholder, adjust if you track points
                    hasActiveSubscription={false}
                />
            </StickyWrapper>
            <FeedWrapper>
                <div>
                    <Header title="Shop" />
                    <div className="space-y-4" />

                    {/* Debugging: Display fetched full user data */}
                    <div>
                        <h2>Debugging Full User Data</h2>
                        <pre>{JSON.stringify(userData, null, 2)}</pre>
                    </div>
                </div>
            </FeedWrapper>
        </div>
    );
};

export default ShopPage;
