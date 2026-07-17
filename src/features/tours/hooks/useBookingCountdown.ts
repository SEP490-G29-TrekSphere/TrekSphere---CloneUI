import { useEffect, useState } from 'react';

export function useBookingCountdown(
  createdAtStr: string | undefined,
  isActive: boolean,
  limitSeconds = 900
) {
  const [timeLeft, setTimeLeft] = useState<number>(limitSeconds);

  useEffect(() => {
    if (!isActive || !createdAtStr) return;

    const createdTime = new Date(createdAtStr).getTime();
    const updateTimer = () => {
      const elapsedSeconds = Math.floor((Date.now() - createdTime) / 1000);
      const remaining = Math.max(0, limitSeconds - elapsedSeconds);
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [createdAtStr, isActive, limitSeconds]);

  return timeLeft;
}
