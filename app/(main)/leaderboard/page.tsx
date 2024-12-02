"use client"

import { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  clerkId: string;
  userName: string;
  userImg: string;
  firstName: string;
  lastName: string;
  userHearts: number;
  userExp: number;
  reading: string[];
  listening: string[];
  speaking: string[];
  writing: string[];
}

const Leaderboard = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('app\api\users.ts');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <h1>Leaderboard</h1>
      <ul>
        {users.map((user) => (
          <li key={user._id}>
            <img src={user.userImg} alt={`${user.firstName} ${user.lastName}`} />
            <p>{user.userName}</p>
            <p>{user.firstName} {user.lastName}</p>
            <p>Experience: {user.userExp}</p>
            <p>Hearts: {user.userHearts}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;