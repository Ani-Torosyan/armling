"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";
import { useClerk } from "@clerk/nextjs";

type Props = {
    hearts: number;
    time: number;
    sub: boolean;
};

export const Items = ({ hearts, time, sub }: Props) => {
    const [isSubscribed, setIsSubscribed] = useState(sub);
    const { user } = useClerk();

    const handleUpgrade = async () => {
        if (!user?.id) return;

        try {
            const response = await fetch('/api/update-subscription', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: user.id }),
            });

            if (response.ok) {
                setIsSubscribed(true);
            } else {
                console.error('Failed to update subscription');
            }
        } catch (error) {
            console.error('Error updating subscription:', error);
        }
    };

    return (
        <ul className="w-full">
            <div className="flex items-center w-full p-4 gap-x-4">
                <Image src="/heart.svg" alt="Heart" height={50} width={50} />
                <div className="flex-1">
                    <p className="text-customDark text-base lg:text-xl font-bold">
                        Refill hearts
                    </p>
                </div>
                <Button variant="ghost" disabled={hearts === 5 || time > 0}>
                    {hearts === 5 ? "full" : (
                        <p>
                            {`${Math.floor(time / 60)}`.padStart(2, "0")}:
                            {`${time % 60}`.padStart(2, "0")}
                        </p>
                    )}
                </Button>
            </div>
            <div className="flex items-center w-full p-4 pt-8 gap-x-4 border-t-2 border-customShade">
                <Image src="/unlimited.svg" alt="Unlimited" height={50} width={50} />
                <div className="flex-1">
                    <p className="text-customDark text-base lg:text-xl font-bold">
                        Unlimited hearts
                    </p>
                </div>
                <Button disabled={isSubscribed} onClick={handleUpgrade}>
                    {isSubscribed ? "active" : "upgrade"}
                </Button>
            </div>
        </ul>
    );
};