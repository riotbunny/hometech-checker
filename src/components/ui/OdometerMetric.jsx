import React from 'react';
import useOdometer from '../../hooks/useOdometer';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';

export default function OdometerMetric({ endValue, suffix = '', className = '' }) {
  const [setRef, isVisible] = useIntersectionObserver();
  const animatedValue = useOdometer(endValue, 1500, isVisible);

  return (
    <span ref={setRef} className={`font-mono ${className}`}>
      {animatedValue.toLocaleString()}{suffix}
    </span>
  );
}