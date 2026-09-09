import React from 'react';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  onToggleTheme,
  className = '',
  showLabel = false,
}) => {
  const isDark = theme === 'dark';

  return (
    <button
      id="btn-theme-toggle"
      type="button"
      onClick={onToggleTheme}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl border transition-all cursor-pointer ${
        isDark
          ? 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-amber-400 hover:text-amber-300 shadow-xs'
          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Telegram Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Telegram Dark Mode'}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-slate-700 transition-transform duration-300 -rotate-12 hover:rotate-0" />
        )}
      </div>

      {showLabel && (
        <span className="ml-2 text-xs font-medium">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
};
