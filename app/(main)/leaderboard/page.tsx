"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useClerk } from "@clerk/nextjs";
import { FeedWrapper } from "@/components/feed-wrapper";
import { Header } from "../header";

type User = {
  userName: string;
  userExp: number;
  userImg: string;
  firstName: string;
  lastName: string;
};

const Leaderboard = () => {
  const { user } = useClerk();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const fetchData = async () => {
    try {
      const response = await axios.get("/api/leaderboard");
      const { users } = response.data;
      setUsers(users);
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
    }
  };

  const fetchCurrentUser = async (userId: string) => {
    try {
      const response = await axios.get(`/api/user?userId=${userId}`);
      setCurrentUser(response.data);
    } catch (error) {
      console.error("Error fetching current user data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    if (user?.id) {
      fetchCurrentUser(user.id);
    }
  }, [user]);

  return (
    <div className="text-customDark">
      <FeedWrapper>
        <Header title="Leaderboard" />
        <div className="space-y-4" />
      </FeedWrapper>

      <div className="p-5">
        <div className="grid grid-cols-2 gap-4 font-bold">
          <div className="flex items-center">
            <img src="/crown.svg" alt="Crown" className="w-6 h-6 mr-2" />
            Username
          </div>
          <div className="text-right">EXP</div>
        </div>

        {users.map((user, index) => (
          <div
            key={user.userName}
            className={`flex justify-between items-center p-4 mt-2 rounded ${
              index === 0
                ? "bg-gradient-to-r from-yellow-400 to-amber-500"
                : index === 1
                ? "bg-gradient-to-r from-gray-300 to-gray-500"
                : index === 2
                ? "bg-gradient-to-r from-yellow-600 to-amber-700"
                : "bg-custom"
            }`}
          >
            <div className="flex items-center gap-4">
              <span>
                {index === 0 ? (
                  <img src="/1.svg" alt="First place" className="w-6 h-6" />
                ) : index === 1 ? (
                  <img src="/2.svg" alt="Second place" className="w-6 h-6" />
                ) : index === 2 ? (
                  <img src="/3.svg" alt="Third place" className="w-6 h-6" />
                ) : (
                  index + 1
                )}
              </span>
              <div>
                <p>{user.userName}</p>
                <p className="text-sm text-customShade">
                  {user.firstName} {user.lastName}
                </p>
              </div>
            </div>
            <div className="text-right">{user.userExp}</div>
          </div>
        ))}

        {currentUser && (
          <div className="sticky bottom-0 bg-custom p-4 mt-4 rounded shadow-md">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <img
                  src={currentUser.userImg}
                  alt="User"
                  className="w-6 h-6 rounded-full"
                />
                <div>
                  <p>{currentUser.userName}</p>
                  <p className="text-sm text-customShade">
                    {currentUser.firstName} {currentUser.lastName}
                  </p>
                </div>
              </div>
              <div className="text-right">{currentUser.userExp}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;