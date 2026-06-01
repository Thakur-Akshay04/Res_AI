import { Sun, Moon } from 'lucide-react';
import useThemeStore from '@/stores/themeStore';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-800 hover:border-neutral-700/80 bg-neutral-900/60 hover:bg-neutral-900 transition-all duration-200 shadow-sm shadow-black/10"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="w-3.5 h-3.5 text-neutral-400 hover:text-yellow-400 transition-colors" strokeWidth={2.25} />
      ) : (
        <Moon className="w-3.5 h-3.5 text-neutral-400 hover:text-neu-primary transition-colors" strokeWidth={2.25} />
      )}
    </button>
  );
};

export default ThemeToggle;