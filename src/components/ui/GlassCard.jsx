import React from 'react';
import useMouseSpotlight from '../../hooks/useMouseSpotlight';

export default function GlassCard({ children, className = '' }) {
  const spotlightRef = useMouseSpotlight();

  return (
    <div 
      ref={spotlightRef}
      style={{ transform: 'translate3d(0, 0, 0)' }}
      className={`group relative bg-slate-900/60 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden ${className}`}
    >
      {/* Dynamic Mouse Spotlight Layer */}
      <div 
        className="absolute pointer-events-none inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100 z-0"
        style={{
          background: `radial-gradient(600px circle at var(--mouse-x, 0) var(--mouse-y, 0), rgba(16,185,129,0.12), transparent 40%)`
        }}
      />
      
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] z-10" />
      
      {/* Content wrapper */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}