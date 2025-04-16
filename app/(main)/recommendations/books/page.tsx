"use client"

import { FeedWrapper } from "@/components/feed-wrapper";
import { Header } from "../../header";

const booksPage = () => {
    return(
        <div>
            <FeedWrapper>
                <Header title="Armenian Literature" />
                <div className="space-y-4"/>
            </FeedWrapper>

        </div>
    );
};

export default booksPage;