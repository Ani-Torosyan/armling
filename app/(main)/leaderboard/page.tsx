"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type User = {
    userName: string;
    userExp: number;
    userImg: string;
    firstName: string;
    lastName: string;
};

const Leaderboard = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch leaderboard data
    const fetchData = async () => {
        try {
            const response = await axios.get("/api/leaderboard");
            const { users } = response.data;
            setUsers(users);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching leaderboard data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return <div className="text-white text-center p-10">Loading...</div>;
    }

    return (
        <div className="bg-custom min-h-screen text-white">
            <div className="text-center p-5">
                <h1 className="text-3xl font-bold">Leaderboard</h1>
            </div>
            <div className="p-5">
                <div className="grid grid-cols-2 gap-4 font-bold border-b border-gray-700 pb-3">
                    <div>👑 Username</div>
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
                                : "bg-gray-800"
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <span>
                                {index === 0
                                    ? "🥇"
                                    : index === 1
                                    ? "🥈"
                                    : index === 2
                                    ? "🥉"
                                    : index + 1}
                            </span>
                            <div>
                                <p>{user.userName}</p>
                                <p className="text-sm text-custom">
                                    {user.firstName} {user.lastName}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">{user.userExp}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Leaderboard;
