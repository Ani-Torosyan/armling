"use client"

import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { Header } from "../header";
import { Promo } from "@/components/promo";
//import useShopData from "@/shopData"; 

const LearnPage = () => {
    //const { hearts, points, hasActiveSubscription } = useShopData(); 

    return(
        <div className="flex flex-row-reverse gap-[48px] px-6"> 
            <StickyWrapper>
                <UserProgress
                hearts={5}  //TODO get userHearts & userExp & usersub from the db & if there is sub don't show Promo
                points={0}
                hasActiveSubscription={false}
                />
                <Promo/>  
            </StickyWrapper>
            <FeedWrapper>
                <Header title="Home" />
                <div className="space-y-4"/>
            </FeedWrapper>
            
        </div>
    );
};

export default LearnPage;