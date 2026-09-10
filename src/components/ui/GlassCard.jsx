import React from 'react';

export default function GlassCard({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}