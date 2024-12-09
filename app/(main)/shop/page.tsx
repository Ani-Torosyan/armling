"use client";

import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { Header } from "../header";
import { useEffect, useState } from "react";

const ShopPage = () => {
  const [userHearts, setUserHearts] = useState(0);

  useEffect(() => {
    async function fetchUserData() {
      const res = await fetch("/api/data"); // Update with your API route
      const data = await res.json();
      setUserHearts(data.userHearts);
    }

    fetchUserData();
  }, []);

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <UserProgress hearts={userHearts} points={0} hasActiveSubscription={false} />
      </StickyWrapper>
      <FeedWrapper>
        <div>
          <Header title="Shop" />
          <div className="space-y-4" />
        </div>
      </FeedWrapper>
    </div>
  );
};

export default ShopPage;
