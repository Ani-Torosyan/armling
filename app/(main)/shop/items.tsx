"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";

type Props = {
    hearts: number;
    sub: boolean;
};

export const Items = ({ hearts, sub }: Props) => {
    const [isSubscribed, setIsSubscribed] = useState(sub);

    return (
        <ul className="w-full">
            <div className="flex items-center w-full p-4 gap-x-4">
                <Image src="/heart.svg" alt="Heart" height={50} width={50} />
                <div className="flex-1">
                    <p className="text-customDark text-base lg:text-xl font-bold">
                        Refill hearts
                    </p>
                </div>
                <Button variant="ghost" disabled={hearts === 5}>
                    {hearts === 5 ? "full" : (
                        <p>Refilling in process...</p>
                    )}
                </Button>
            </div>
            <div className="flex items_center w-full p-4 pt-8 gap-x-4 border-t-2 border-customShade">
                <Image src="/unlimited.svg" alt="Unlimited" height={50} width={50} />
                <div className="flex-1">
                    <p className="text-customDark text-base lg:text-xl font-bold">
                        Unlimited hearts
                    </p>
                </div>
                <Button disabled={isSubscribed} onClick={() => {
                    window.location.href = "https://buy.stripe.com/test_4gw7vYdPn7001a0000";
                    setIsSubscribed(true); //TODO update the db: update-sub
                }}>
                    {isSubscribed ? "active" : "upgrade"}
                </Button>
            </div>
        </ul>
    );
};






