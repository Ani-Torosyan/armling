"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';


type Props = {
  hearts: number;
  time: number;
  sub: boolean;
};

export const Items = ({ hearts, time, sub }: Props) => {
  const [isSubscribed, setIsSubscribed] = useState(sub);

  useEffect(() => {
    if (time === 0) {
      fetch('https://armling.vercel.app/api/heart-refill', {
        method: 'POST',
      })
        .then(response => response.json())
        .then(data => {
          console.log('Heart refill successful:', data);
        })
        .catch(error => {
          console.error('Error refilling hearts:', error);
        });
    }
  }, [time]);

  return (
    <ul className="w-full">
      <div className="flex items-center w-full p-4 gap-x-4">
        <Image src="/heart.svg" alt="Heart" height={50} width={50} />
        <div className="flex-1">
          <p className="text-customDark text-base lg:text-xl font-bold">
            Refill hearts
          </p>
        </div>
        <Button variant="ghost" disabled={hearts === 5 || time > 0}>
          {hearts === 5 ? "full" : (
            <p>
              {`${Math.floor(time / 60)}`.padStart(2, "0")}:
              {`${time % 60}`.padStart(2, "0")}
            </p>
          )}
        </Button>
      </div>
      <div className="flex items-center w-full p-4 pt-8 gap-x-4 border-t-2 border-customShade">
        <Image src="/unlimited.svg" alt="Unlimited" height={50} width={50} />
        <div className="flex-1">
          <p className="text-customDark text-base lg:text-xl font-bold">
            Unlimited
          </p>
        </div>
      </div>
    </ul>
  );
};