"use client"

import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { Header } from "../header";
//import { Items } from "./items";
//import useShopData from "@/shopData"; 

const ShopPage = () => {
    //const { hearts, points, hasActiveSubscription, time } = useShopData();  //TODO get userHearts & userExp & usersub from the db

    return (
        <div className="flex flex-row-reverse gap-[48px] px-6">
            <StickyWrapper>
                <UserProgress
                    hearts={5}
                    points={0}
                    hasActiveSubscription={false}
                />
            </StickyWrapper>
            <FeedWrapper>
                <div>
                    <Header title="Shop" />
                    <div className="space-y-4"/>
                </div>
            </FeedWrapper>
        </div>
    );
};

export default ShopPage;


