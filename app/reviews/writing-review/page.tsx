"use client";

import { FeedWrapper } from "@/components/feed-wrapper";
import { Header } from "../../(main)/header";

const reviewsPage = () => {
    return (
        <div className="flex flex-row-reverse gap-[48px] px-6">
            <FeedWrapper>
                <Header title="Writing Reviews" />
            </FeedWrapper>
        </div>
    );
};

export default reviewsPage;






