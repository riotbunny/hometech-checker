import React from 'react';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';

export default function RevealOnScroll({ children, className = '', delay = 0 }) {
  const [setRef, isVisible] = useIntersectionObserver();

  return (
    <div
      ref={setRef}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 transform ${
        isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-8 scale-[0.98]'
      } ${className}`}
    >
      {children}
    </div>
  );
}