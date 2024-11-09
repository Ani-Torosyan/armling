import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { Header } from "./header";
import { auth } from "@clerk/nextjs/server";
import { getUserData } from "@/actions/user.actions";

const LearnPage = async () => {
    // Get the current user's id from Clerk
    const { userId } = await auth();
    
    // Fetch user data from the database using the Clerk user ID
    const userData = await getUserData(userId);

    return (
        <div className="flex flex-row-reverse gap-[48px] px-6"> 
            <StickyWrapper>
                <UserProgress
                    hearts={userData?.userHearts || 0} // Use hearts from db, default to 0
                    points={userData?.userExp || 0} // Use exp from db, default to 0
                    hasActiveSubscription={false} // Adjust this if needed based on user data
                />
            </StickyWrapper>
            <FeedWrapper>
                <Header title="Home" />
                <div className="space-y-4"/>
            </FeedWrapper>
        </div>
    );
};

export default LearnPage;
