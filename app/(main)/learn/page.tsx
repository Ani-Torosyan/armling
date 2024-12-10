"use client";

import { useState, useEffect } from "react";
import { useClerk } from "@clerk/nextjs"; // To get the current user's Clerk ID
import { StickyWrapper } from "@/components/sticky-wrapper";
import { FeedWrapper } from "@/components/feed-wrapper";
import { UserProgress } from "@/components/user-progress";
import { Header } from "../header";
import { Promo } from "@/components/promo";
import { Button } from "@/components/ui/button"; 
import Image from "next/image"; 

const LearnPage = () => {
    const { user } = useClerk(); // Get the current user from Clerk
    const [userData, setUserData] = useState<{ userHearts: number; userExp: number } | null>(null); // Store user data here
    const [loading, setLoading] = useState(true); // For loading state
    const [unit, setUnit] = useState<{ title: string } | null>(null);

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
          {/* Unit Name */}
          {unit && (
            <h2 className="text-2xl font-bold text-gray-800 text-center">
              {unit.title}
            </h2>
          )}

          {/* Lesson 1 Button */}
          <div className="text-center mt-6">
            <Button variant="primary" size="lg" className="rounded-full shadow-lg">
              Lesson 1
            </Button>
          </div>

          {/* Buttons arranged in a circular path */}
          <div className="relative w-[300px] h-[300px] mx-auto mt-8">
            {/* Dots connecting the buttons */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="absolute w-2 h-2 bg-gray-300 rounded-full animate-pulse" />
              ))}
            </div>

            {/* Lesson Button */}
            <div className="absolute top-[10%] left-1/2 transform -translate-x-1/2 group">
              <Button
                asChild
                variant="primary"
                size="icon"
                className="rounded-full shadow-xl hover:scale-110 transition duration-300"
              >
                <a href="/lesson">
                  <Image src="/crown.svg" alt="Lesson Icon" width={24} height={24} />
                </a>
              </Button>
              <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-sm text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                Lesson
              </div>
            </div>

            {/* Reading Button */}
            <div className="absolute top-[30%] left-[80%] transform -translate-x-1/2 group">
              <Button
                asChild
                variant="primary"
                size="icon"
                className="rounded-full shadow-xl hover:scale-110 transition duration-300"
              >
                <a href="/reading">
                  <Image src="/crown.svg" alt="Reading Icon" width={24} height={24} />
                </a>
              </Button>
              <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-sm text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                Reading
              </div>
            </div>

            {/* Listening Button */}
            <div className="absolute top-1/2 left-[95%] transform -translate-x-full group">
              <Button
                asChild
                variant="primary"
                size="icon"
                className="rounded-full shadow-xl hover:scale-110 transition duration-300"
              >
                <a href="/listening">
                  <Image src="/crown.svg" alt="Listening Icon" width={24} height={24} />
                </a>
              </Button>
              <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-sm text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                Listening
              </div>
            </div>

            {/* Speaking Button */}
            <div className="absolute top-[70%] left-[80%] transform -translate-x-1/2 group">
              <Button
                asChild
                variant="primary"
                size="icon"
                className="rounded-full shadow-xl hover:scale-110 transition duration-300"
              >
                <a href="/speaking">
                  <Image src="/crown.svg" alt="Speaking Icon" width={24} height={24} />
                </a>
              </Button>
              <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-sm text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                Speaking
              </div>
            </div>

            {/* Writing Button */}
            <div className="absolute bottom-[10%] left-1/2 transform -translate-x-1/2 group">
              <Button
                asChild
                variant="primary"
                size="icon"
                className="rounded-full shadow-xl hover:scale-110 transition duration-300"
              >
                <a href="/writing">
                  <Image src="/crown.svg" alt="Writing Icon" width={24} height={24} />
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
