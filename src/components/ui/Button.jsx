import React from 'react';

export default function Button({ children, onClick, type = 'button', disabled = false, className = '' }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{ transform: 'translate3d(0, 0, 0)' }}
      className={`relative group font-black px-6 py-4 rounded-2xl transition-all duration-200 shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:shadow-[0_0_35px_rgba(16,185,129,0.5)] active:scale-[0.97] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl transition-all group-hover:from-emerald-300 group-hover:to-green-400" />
      <span className="relative z-10 flex items-center gap-2 text-slate-950">
        {children}
      </span>
    </button>
  );
}