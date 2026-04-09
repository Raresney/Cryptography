const LEVELS = [
  { key: 'beginner', label: 'Beginner', color: 'var(--green)' },
  { key: 'intermediate', label: 'Intermediate', color: 'var(--yellow)' },
  { key: 'advanced', label: 'Advanced', color: 'var(--purple)' },
];

function DifficultySelector({ value, onChange }) {
  return (
    <div style={{ display: 'inline-flex', gap: '6px' }}>
      {LEVELS.map(({ key, label, color }) => {
        const active = value === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            style={{
              padding: '5px 14px',
              borderRadius: '999px',
              border: `1px solid ${active ? color : 'var(--border)'}`,
              background: active ? `${color}18` : 'transparent',
              color: active ? color : 'var(--text-dim)',
              fontFamily: 'var(--mono)',
              fontSize: '12px',
              fontWeight: active ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: active ? `0 0 8px ${color}33` : 'none',
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.borderColor = color;
                e.currentTarget.style.color = color;
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-dim)';
              }
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export default DifficultySelector;
