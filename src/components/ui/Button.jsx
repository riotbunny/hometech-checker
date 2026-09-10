import React from 'react';

export default function Button({ children, onClick, type = 'button', disabled = false, className = '' }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`font-semibold px-6 py-3 rounded-lg transition-colors duration-200 bg-blue-600 hover:bg-blue-700 text-white shadow-sm active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${className}`}
    >
      <span className="flex items-center gap-2">
        {children}
      </span>
    </button>
  );
}