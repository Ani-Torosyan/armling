"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const Leaderboard = () => {
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [users, setUsers] = useState<any>([]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get("./leaderboard");
                const { currentUser, users } = response.data;
                setCurrentUser(currentUser);
                setUsers(users);
            } catch (error) {
                console.error("Error fetching leaderboard data:", error);
            }
        };

        fetchUserData();

        const intervalId = setInterval(fetchUserData, 5000);
        return () => clearInterval(intervalId);
    }, []);

    const sortedUsers = [...users].sort((a: any, b: any) => b.userExp - a.userExp);
    const currentUserIndex = sortedUsers.findIndex(
        (user) => user.clerkId === currentUser?.clerkId
    );

    return (
        <div className="bg-black h-screen overflow-y-auto text-white">
            <header className="p-4 text-center text-2xl font-bold bg-gray-800">
                Leaderboard
            </header>
            <div className="sticky top-0 bg-black p-5 flex justify-between font-bold border-b border-slate-700">
                <p className="w-2/3">👑 User</p>
                <p className="w-1/3 text-right">Exp</p>
            </div>
            {sortedUsers.slice(0, 10).map((user, index) => (
                <div
                    key={user.clerkId}
                    className={`p-5 flex justify-between items-center ${
                        index === 0
                            ? "bg-gradient-to-r from-yellow-400 to-amber-500"
                            : index === 1
                            ? "bg-gradient-to-r from-gray-300 to-gray-500"
                            : index === 2
                            ? "bg-gradient-to-r from-yellow-500 to-amber-700"
                            : "border-b border-slate-700"
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <p>
                            {index === 0
                                ? "🥇"
                                : index === 1
                                ? "🥈"
                                : index === 2
                                ? "🥉"
                                : index + 1}
                        </p>
                        <img
                            src={user.userImg}
                            alt={user.userName}
                            className="w-8 h-8 rounded-full"
                        />
                        <p>
                            {user.userName ||
                                `${user.firstName} ${user.lastName}`}
                        </p>
                    </div>
                    <p>{user.userExp}</p>
                </div>
            ))}
            {currentUserIndex >= 10 && currentUser && (
                <div className="p-5 flex justify-between items-center bg-gradient-to-r from-red-500 to-red-700">
                    <div className="flex items-center gap-3">
                        <p>{currentUserIndex + 1}</p>
                        <img
                            src={currentUser.userImg}
                            alt={currentUser.userName}
                            className="w-8 h-8 rounded-full"
                        />
                        <p>
                            {currentUser.userName ||
                                `${currentUser.firstName} ${currentUser.lastName}`}
                        </p>
                    </div>
                    <p>{currentUser.userExp}</p>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
