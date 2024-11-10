"use client"

import { useState, useEffect } from "react";

const useShopData = () => {
    const [hearts, setHearts] = useState(5); // TODO import hearts from db
    const [points] = useState(0); // TODO import points from db
    const [hasActiveSubscription] = useState(false); // TODO import subsciption from db
    const [time, setTime] = useState(120);

    useEffect(() => {
        if (hearts < 5) {
            const storedEndTime = localStorage.getItem("heartsRefillEndTime");
            const now = Date.now();

            if (storedEndTime && Number(storedEndTime) > now) {
                setTime(Math.floor((Number(storedEndTime) - now) / 1000));
            } else {
                const newEndTime = now + 120 * 1000;
                localStorage.setItem("heartsRefillEndTime", newEndTime.toString());
                setTime(120);
            }

            const timer = setInterval(() => {
                setTime((prevTime) => {
                    if (prevTime <= 1) {
                        clearInterval(timer);
                        localStorage.removeItem("heartsRefillEndTime");

                        if (hearts < 5) {
                            setHearts(Math.min(hearts + 1, 5)); 
                        }
                        
                        return 5; 
                    }
                    return prevTime - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        } else {
            setTime(120);
            localStorage.removeItem("heartsRefillEndTime");
        }
    }, [hearts]);

    return { hearts, points, hasActiveSubscription, time };
};

export default useShopData;
