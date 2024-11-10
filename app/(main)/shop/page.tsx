"use client"

import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import Image from "next/image";
import { Items } from "./items";
import useShopData from "@/shopData"; 

const ShopPage = () => {
    const { hearts, points, hasActiveSubscription, time } = useShopData();  //TODO get userHearts & userExp & usersub from the db

    return (
        <div className="flex flex-row-reverse gap-[48px] px-6">
            <StickyWrapper>
                <UserProgress
                    hearts={hearts}
                    points={points}
                    hasActiveSubscription={hasActiveSubscription}
                />
            </StickyWrapper>

            <FeedWrapper>
                <div className="w-full flex flex-col items-center">
                    <Image 
                        src="/shop.svg"
                        alt="Shop"
                        height={70}
                        width={70}
                    />
                    <h1 className="text-center font-bold text-customDark text-2xl my-6">
                        Shop
                    </h1>
                    <Items 
                        hearts={hearts}
                        time={time}
                        sub={hasActiveSubscription}                    
                    />
                </div>
            </FeedWrapper>
        </div>
    );
};

export default ShopPage;


