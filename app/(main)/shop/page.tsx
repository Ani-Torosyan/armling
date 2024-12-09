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
    exp: number;
    img: string;
};

const ShopPage = () => {
    const [userData, setUserData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch("/api/data"); // Fetch from your existing API route
                if (response.ok) {
                    const data = await response.json();
                    setUserData(data.data); // Extract user data
                } else {
                    console.error("Error fetching user data:", await response.text());
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData(); // Call the function to fetch user data
    }, []);

    if (loading) {
        return <div>Loading...</div>; // Show a loading state
    }

    if (!userData) {
        return <div>No user data available</div>; // Handle missing user data
    }

    return (
        <div className="flex flex-row-reverse gap-[48px] px-6">
            <StickyWrapper>
                <UserProgress
                    hearts={userData.hearts} // Display hearts from fetched data
                    points={userData.exp} // Display experience points from fetched data
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
