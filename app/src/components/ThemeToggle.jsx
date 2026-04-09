import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '34px',
        height: '34px',
        borderRadius: '50%',
        border: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
        color: theme === 'dark' ? 'var(--yellow)' : 'var(--cyan)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--green)';
        e.currentTarget.style.boxShadow = '0 0 8px var(--green-glow)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
    </button>
  );
}

export default ThemeToggle;
