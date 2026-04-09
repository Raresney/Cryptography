function evaluateStrength(password) {
  if (!password) return { score: 0, label: 'Weak', color: 'var(--red)' };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { score: 1, label: 'Weak', color: 'var(--red)' };
  if (score <= 3) return { score: 2, label: 'Medium', color: 'var(--yellow)' };
  if (score <= 4) return { score: 3, label: 'Strong', color: 'var(--green-dim, var(--green))' };
  return { score: 4, label: 'Very Strong', color: 'var(--green)' };
}

function KeyStrength({ password }) {
  const { score, label, color } = evaluateStrength(password);
  const percentage = (score / 4) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
      <div
        style={{
          height: '4px',
          borderRadius: '2px',
          background: 'var(--border)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            background: color,
            borderRadius: '2px',
            transition: 'width 0.3s ease, background 0.3s ease',
          }}
        />
      </div>
      <span
        style={{
          fontFamily: 'var(--mono)',
          fontSize: '11px',
          color: color,
        }}
      >
        {password ? label : ''}
      </span>
    </div>
  );
}

export default KeyStrength;
