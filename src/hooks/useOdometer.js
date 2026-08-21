import { useState, useEffect } from 'react';

export default function useOdometer(endValue, duration = 1500, trigger = true) {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    if (!trigger) return;

    let startTime = null;
    const startValue = 0;

    const animateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing friction curve (easeOutExpo)
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCurrentValue(Math.floor(easeProgress * (endValue - startValue) + startValue));

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };

    requestAnimationFrame(animateCount);
  }, [endValue, duration, trigger]);

  return currentValue;
}