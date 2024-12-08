"use client"

import { FeedWrapper } from "@/components/feed-wrapper";
import { Header } from "../header";

const ReviewPage = () => {
    return(
        <div>
            <FeedWrapper>
                <Header title="Review" />
                <div className="space-y-4"/>
            </FeedWrapper>

            <div className="flex items-center justify-center h-[calc(100vh-100px)] text-lg font-semibold text-customShade">
                    No reviews available
            </div>

        </div>
    );
};

export default ReviewPage;