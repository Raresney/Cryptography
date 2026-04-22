import { useNavigate } from 'react-router-dom'

const GAMES = [
  {
    path: '/games/crack',
    emoji: '🔑',
    title: 'Crack the Cipher',
    description: 'A message has been encrypted. Find the key before the timer runs out! Supports Caesar (Easy/Medium) and Vigenère (Hard) ciphers.',
    color: 'var(--yellow)',
    tags: ['Caesar', 'Vigenère', 'Timer', 'Score'],
  },
  {
    path: '/games/memory',
    emoji: '🃏',
    title: 'Crypto Memory Match',
    description: 'Flip cards to find matching pairs of cryptographic algorithms and their definitions. How fast can you match them all?',
    color: 'var(--cyan)',
    tags: ['Pairs', 'Memory', 'Timer', 'Moves'],
  },
  {
    path: '/games/frequency',
    emoji: '📊',
    title: 'Frequency Attacker',
    description: 'A substitution cipher stands between you and the plaintext. Analyze letter frequencies to crack it — just like a real codebreaker!',
    color: 'var(--purple)',
    tags: ['Substitution', 'Analysis', 'Strategy', 'Hints'],
  },
]

export default function Games() {
  const navigate = useNavigate()

  return (
    <div>
      <div className="page-header">
        <h1 style={{ color: 'var(--text-bright)', margin: 0, fontFamily: 'var(--mono)', fontSize: '26px' }}>
          <span style={{ color: 'var(--yellow)' }}>⚡</span> Games
        </h1>
        <p style={{ color: 'var(--text-dim)', margin: '8px 0 0' }}>
          Learn cryptography through interactive challenges
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {GAMES.map((game) => (
          <div
            key={game.path}
            className="card"
            style={{ cursor: 'pointer', marginBottom: 0, display: 'flex', flexDirection: 'column' }}
            onClick={() => navigate(game.path)}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px', lineHeight: 1 }}>{game.emoji}</div>
            <h2 style={{ color: game.color, fontFamily: 'var(--mono)', fontSize: '17px', marginBottom: '10px' }}>
              {game.title}
            </h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '13px', lineHeight: 1.6, flex: 1, marginBottom: '16px' }}>
              {game.description}
            </p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {game.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: '2px 8px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: 'var(--text-dim)',
                    fontFamily: 'var(--mono)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }}>
              Play Now →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
