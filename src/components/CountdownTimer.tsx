import React, { useState, useEffect } from "react";

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const STORAGE_KEY = "ara_mart_flash_deal_target";
    let targetTime = localStorage.getItem(STORAGE_KEY);
    
    const getNewTarget = () => {
      const now = Date.now();
      const target = now + 24 * 60 * 60 * 1000; // 24 hours
      localStorage.setItem(STORAGE_KEY, target.toString());
      return target;
    };

    let targetTimestamp = targetTime ? parseInt(targetTime, 10) : getNewTarget();

    if (isNaN(targetTimestamp) || targetTimestamp <= Date.now()) {
      targetTimestamp = getNewTarget();
    }

    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = targetTimestamp - now;
      if (difference <= 0) {
        return 0;
      }
      return Math.floor(difference / 1000);
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      if (remaining <= 0) {
        const newTarget = getNewTarget();
        setTimeLeft(Math.floor((newTarget - Date.now()) / 1000));
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (timeLeft <= 0) {
    return (
      <span className="text-red-500 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-red-950/20 rounded border border-red-900/30">
        Deal Ended
      </span>
    );
  }

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const formatUnit = (num: number) => num.toString().padStart(2, "0");

  return (
    <div className="flex items-center gap-1 shrink-0 select-none" id="countdown-timer-container">
      <div className="flex items-center bg-gray-950 dark:bg-black border border-white/5 py-0.5 px-1.5 rounded shadow-inner">
        <span className="text-amber-500  font-mono text-[10px] sm:text-xs font-bold w-4.5 text-center">
          {formatUnit(hours)}
        </span>
      </div>
      <span className="text-gray-400 dark:text-gray-600 font-bold text-[10px] sm:text-xs leading-none">:</span>
      <div className="flex items-center bg-gray-950 dark:bg-black border border-white/5 py-0.5 px-1.5 rounded shadow-inner">
        <span className="text-emerald-400 font-mono text-[10px] sm:text-xs font-bold w-4.5 text-center">
          {formatUnit(minutes)}
        </span>
      </div>
      <span className="text-gray-400 dark:text-gray-600 font-bold text-[10px] sm:text-xs leading-none">:</span>
      <div className="flex items-center bg-gray-950 dark:bg-black border border-white/5 py-0.5 px-1.5 rounded shadow-inner">
        <span className="text-amber-500 font-mono text-[10px] sm:text-xs font-bold w-4.5 text-center">
          {formatUnit(seconds)}
        </span>
      </div>
    </div>
  );
}
