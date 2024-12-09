'use client'

import { useState, useEffect } from 'react';
import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { Header } from "../header";
import { Promo } from "@/components/promo";

// A custom hook to fetch the user data
const useUserData = (userId: string | null) => {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) return;  // If userId is null, do not proceed with fetching

        const fetchUserData = async () => {
            try {
                const response = await fetch(`/api/user?userId=${userId}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch user data");
                }
                const data = await response.json();
                setUserData(data); // Set user data from the API response
            } catch (err) {
                setError("Error fetching user data");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    return { userData, loading, error };
};

const LearnPage = () => {
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const response = await fetch('/api/data'); // Endpoint to get current user data
            const data = await response.json();
            if (data?.userId) {
                setUserId(data.userId); // Set userId from the response
            }
        };

        fetchCurrentUser();
    }, []);

    // Only call useUserData if userId is defined (not null)
    const { userData, loading, error } = useUserData(userId);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    const hearts = userData?.userHearts ?? 0;
    const points = userData?.userExp ?? 0;
    const hasActiveSubscription = userData?.userExp > 0; // Assuming exp > 0 means the user has an active subscription

    return (
        <div className="flex flex-row-reverse gap-[48px] px-6"> 
            <StickyWrapper>
                <UserProgress
                    hearts={hearts}  // Get user hearts from API response
                    points={points}  // Get user points from API response
                    hasActiveSubscription={hasActiveSubscription} // Check subscription status
                />
                {!hasActiveSubscription && <Promo />}  {/* Show promo only if there's no active subscription */}
            </StickyWrapper>
            <FeedWrapper>
                <Header title="Home" />
                <div className="space-y-4" />
            </FeedWrapper>
        </div>
    );
};

export default LearnPage;
