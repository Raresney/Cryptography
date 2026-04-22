import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const PAIRS = [
  { id: 1, term: 'AES', def: 'Symmetric block cipher with 128/192/256-bit keys' },
  { id: 2, term: 'RSA', def: 'Asymmetric encryption based on integer factorization' },
  { id: 3, term: 'SHA-256', def: 'Produces a 256-bit one-way hash digest' },
  { id: 4, term: 'ECDHE', def: 'Elliptic-curve ephemeral Diffie-Hellman key exchange' },
  { id: 5, term: 'HMAC', def: 'Hash-based message authentication code' },
  { id: 6, term: 'ChaCha20', def: 'Stream cipher, alternative to AES-GCM' },
  { id: 7, term: 'Blowfish', def: 'Variable-length key block cipher by Bruce Schneier' },
  { id: 8, term: 'MD5', def: '128-bit hash, now considered cryptographically broken' },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildCards() {
  const cards = []
  PAIRS.forEach((p) => {
    cards.push({ uid: `${p.id}-t`, pairId: p.id, content: p.term, type: 'term' })
    cards.push({ uid: `${p.id}-d`, pairId: p.id, content: p.def, type: 'def' })
  })
  return shuffle(cards)
}

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function MemoryMatch() {
  const navigate = useNavigate()
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])    // indices of face-up unmatched cards (max 2)
  const [matched, setMatched] = useState(new Set())  // pairIds that are matched
  const [isChecking, setIsChecking] = useState(false)
  const [moves, setMoves] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [gameState, setGameState] = useState('menu') // 'menu' | 'playing' | 'won'

  const timerRef = useRef(null)
  const startRef = useRef(0)

  const startGame = useCallback(() => {
    setCards(buildCards())
    setFlipped([])
    setMatched(new Set())
    setIsChecking(false)
    setMoves(0)
    setElapsed(0)
    setGameState('playing')
    startRef.current = Date.now()
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
    }, 500)
  }, [])

  useEffect(() => () => clearInterval(timerRef.current), [])

  const handleCardClick = useCallback((idx) => {
    if (isChecking) return
    if (matched.has(cards[idx]?.pairId)) return
    if (flipped.includes(idx)) return
    if (flipped.length >= 2) return

    const newFlipped = [...flipped, idx]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1)
      const [a, b] = newFlipped
      if (cards[a].pairId === cards[b].pairId) {
        const newMatched = new Set(matched)
        newMatched.add(cards[a].pairId)
        setMatched(newMatched)
        setFlipped([])
        if (newMatched.size === PAIRS.length) {
          clearInterval(timerRef.current)
          setGameState('won')
        }
      } else {
        setIsChecking(true)
        setTimeout(() => {
          setFlipped([])
          setIsChecking(false)
        }, 900)
      }
    }
  }, [cards, flipped, matched, isChecking])

  if (gameState === 'menu') {
    return (
      <div>
        <div className="page-header">
          <button className="btn btn-secondary" style={{ marginBottom: '12px', padding: '6px 12px', fontSize: '12px' }} onClick={() => navigate('/games')}>
            ← Back
          </button>
          <h1 style={{ color: 'var(--text-bright)', margin: 0, fontFamily: 'var(--mono)', fontSize: '24px' }}>
            🃏 Crypto Memory Match
          </h1>
          <p style={{ color: 'var(--text-dim)', margin: '8px 0 0' }}>
            Match each cryptographic algorithm with its definition. 8 pairs · 16 cards.
          </p>
        </div>
        <div className="card" style={{ maxWidth: '480px', marginBottom: 0 }}>
          <h3 style={{ color: 'var(--cyan)', marginBottom: '16px' }}>How to play</h3>
          <ul style={{ color: 'var(--text-dim)', fontSize: '13px', lineHeight: 2, paddingLeft: '20px' }}>
            <li>Click any card to flip it face-up</li>
            <li>Click a second card to see if they match</li>
            <li>Matched pairs stay revealed — mismatches flip back</li>
            <li>Match all 8 pairs as fast as possible with fewest moves</li>
          </ul>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }} onClick={startGame}>
            Start Game →
          </button>
        </div>
      </div>
    )
  }

  if (gameState === 'won') {
    const baseScore = PAIRS.length * 100
    const timePenalty = Math.floor(elapsed * 0.5)
    const movePenalty = Math.max(0, (moves - PAIRS.length) * 5)
    const finalScore = Math.max(50, baseScore - timePenalty - movePenalty)
    const grade = finalScore >= 700 ? 'S' : finalScore >= 550 ? 'A' : finalScore >= 400 ? 'B' : 'C'
    const gradeColor = finalScore >= 700 ? 'var(--cyan)' : finalScore >= 550 ? 'var(--green)' : finalScore >= 400 ? 'var(--yellow)' : 'var(--red)'

    return (
      <div>
        <div className="page-header">
          <h1 style={{ color: 'var(--text-bright)', margin: 0, fontFamily: 'var(--mono)', fontSize: '24px' }}>
            🃏 Memory Match — Results
          </h1>
        </div>
        <div className="card" style={{ border: '1px solid var(--cyan)', maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '64px', fontFamily: 'var(--mono)', fontWeight: 700, color: gradeColor }}>{grade}</div>
            <div style={{ color: 'var(--text-dim)', fontSize: '13px', marginTop: '4px' }}>All pairs matched!</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '24px' }}>
            {[
              { label: 'Score', value: finalScore, color: 'var(--cyan)' },
              { label: 'Time', value: formatTime(elapsed), color: 'var(--green)' },
              { label: 'Moves', value: moves, color: 'var(--yellow)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color, fontFamily: 'var(--mono)' }}>{value}</div>
                <div style={{ color: 'var(--text-dim)', fontSize: '12px' }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={startGame}>Play Again</button>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/games')}>Other Games</button>
          </div>
        </div>
      </div>
    )
  }

  // Playing
  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => { clearInterval(timerRef.current); setGameState('menu') }}>
          ← Back
        </button>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text-dim)' }}>
            Matched <span style={{ color: 'var(--green)' }}>{matched.size}</span>/{PAIRS.length}
          </span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text-dim)' }}>
            Moves <span style={{ color: 'var(--cyan)' }}>{moves}</span>
          </span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '20px', fontWeight: 700, color: 'var(--text-bright)' }}>
            {formatTime(elapsed)}
          </span>
        </div>
      </div>

      {/* Card grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        {cards.map((card, idx) => {
          const isMatched = matched.has(card.pairId)
          const isFaceUp = flipped.includes(idx) || isMatched
          const isTerm = card.type === 'term'

          let bg = 'var(--bg-secondary)'
          let borderColor = 'var(--border)'
          let textColor = 'var(--text-dim)'
          let cursor = 'pointer'

          if (isMatched) {
            bg = 'rgba(0,255,136,0.08)'
            borderColor = 'var(--green)'
            textColor = 'var(--green)'
            cursor = 'default'
          } else if (flipped.includes(idx)) {
            bg = 'var(--bg-card)'
            borderColor = 'var(--cyan)'
            textColor = isTerm ? 'var(--cyan)' : 'var(--text-bright)'
          }

          return (
            <div
              key={card.uid}
              onClick={() => !isMatched && handleCardClick(idx)}
              style={{
                background: bg,
                border: `1px solid ${borderColor}`,
                borderRadius: '10px',
                padding: '12px 10px',
                minHeight: '90px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor,
                transition: 'all 0.25s ease',
                textAlign: 'center',
                userSelect: 'none',
              }}
            >
              {isFaceUp ? (
                <div>
                  {isTerm && (
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: isMatched ? 'var(--green)' : 'var(--cyan)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>term</div>
                  )}
                  <div style={{ fontFamily: 'var(--mono)', fontSize: isTerm ? '15px' : '11px', fontWeight: isTerm ? 700 : 400, color: textColor, lineHeight: 1.4 }}>
                    {card.content}
                  </div>
                </div>
              ) : (
                <div style={{ fontFamily: 'var(--mono)', fontSize: '24px', color: 'var(--border)', userSelect: 'none' }}>?</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
