import { FiCopy } from 'react-icons/fi';
import { useToast } from '../context/ToastContext';

function CopyButton({ text }) {
  const { showToast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard!', 'success');
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy to clipboard"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px',
        background: 'transparent',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        color: 'var(--text-dim)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--green)';
        e.currentTarget.style.borderColor = 'var(--green)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--text-dim)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      <FiCopy size={14} />
    </button>
  );
}

export default CopyButton;
