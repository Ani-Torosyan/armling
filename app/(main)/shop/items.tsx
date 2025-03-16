"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useClerk } from "@clerk/nextjs";

type Props = {
    hearts: number;
    time: number;
    sub: boolean;
};

export const Items = ({ hearts, time, sub }: Props) => {
    const { user } = useClerk();
    const [isPurchased, setIsPurchased] = useState(sub);

    const checkSubscriptionStatus = async () => {
        if (!user?.id) return;

        try {
            const response = await fetch(`/api/user-status?clerkId=${user.id}`);
            const data = await response.json();
            setIsPurchased(data.subscription);
        } catch (error) {
            console.error("Error fetching subscription status:", error);
        }
    };

    useEffect(() => {
        checkSubscriptionStatus();
      }, [user]);
      

    const handlePurchase = async () => {
        if (!user?.id || !user?.emailAddresses[0]?.emailAddress) return;
    
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    email: user.emailAddresses[0]?.emailAddress,
                }),
            });
    
            const data = await response.json();
            if (response.ok && data.url) {
                window.location.href = data.url;
            } else {
                console.error("Checkout error:", data.error);
            }
        } catch (error) {
            console.error("Error processing purchase:", error);
        }
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <ul className="w-full">
            <div className="flex items-center w-full p-4 gap-x-4">
                <Image src="/heart.svg" alt="Heart" height={50} width={50} />
                <div className="flex-1">
                    <p className="text-customDark text-base lg:text-xl font-bold">Refill hearts</p>
                </div>
                <Button variant="ghost" disabled={hearts === 5 || time > 0}>
                    {hearts === 5 || isPurchased ? "FULL" : <p>{formatTime(time)}</p>}
                </Button>
            </div>
            <div className="flex items-center w-full p-4 pt-8 gap-x-4 border-t-2 border-customShade">
                <Image src="/unlimited.svg" alt="Unlimited" height={50} width={50} />
                <div className="flex-1">
                    <p className="text-customDark text-base lg:text-xl font-bold">Unlimited hearts</p>
                </div>
                <Button disabled={isPurchased} onClick={handlePurchase}>
                    {isPurchased ? "Active" : "Buy Now"}
                </Button>
            </div>
        </ul>
    );
};
