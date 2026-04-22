import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function caesarEncrypt(text, shift) {
  return text.toUpperCase().split('').map((c) => {
    if (c >= 'A' && c <= 'Z') return String.fromCharCode(((c.charCodeAt(0) - 65 + shift) % 26) + 65)
    return c
  }).join('')
}

function vigenereEncrypt(text, key) {
  const upper = text.toUpperCase()
  const k = key.toUpperCase()
  let ki = 0
  return upper.split('').map((c) => {
    if (c >= 'A' && c <= 'Z') {
      const s = k.charCodeAt(ki % k.length) - 65
      ki++
      return String.fromCharCode(((c.charCodeAt(0) - 65 + s) % 26) + 65)
    }
    return c
  }).join('')
}

const CHALLENGES = {
  easy: [
    { plaintext: 'HELLO WORLD', shift: 3 },
    { plaintext: 'CRYPTO IS FUN', shift: 7 },
    { plaintext: 'KEEP IT SECRET', shift: 5 },
    { plaintext: 'LOCK THE DOOR', shift: 12 },
    { plaintext: 'BINARY CODE', shift: 9 },
  ],
  medium: [
    { plaintext: 'THE QUICK BROWN FOX', shift: 13 },
    { plaintext: 'ENCRYPTION SAVES DATA', shift: 17 },
    { plaintext: 'JULIUS CAESAR RULES', shift: 21 },
    { plaintext: 'FREQUENCY BEATS SHIFT', shift: 8 },
    { plaintext: 'SHIFT BY FIFTEEN', shift: 15 },
  ],
  hard: [
    { plaintext: 'ATTACK AT DAWN', key: 'KEY' },
    { plaintext: 'VIGENERE IS STRONGER', key: 'POLY' },
    { plaintext: 'THE ART OF SECRETS', key: 'CODE' },
    { plaintext: 'BRUTE FORCE FAILS HERE', key: 'SEC' },
    { plaintext: 'LAYERED CIPHER APPLIED', key: 'ABC' },
  ],
}

const TIME_LIMITS = { easy: 60, medium: 45, hard: 90 }
const BASE_POINTS = { easy: 100, medium: 150, hard: 250 }
const HINT_PENALTY = 30

const DIFF_COLOR = { easy: 'var(--green)', medium: 'var(--yellow)', hard: 'var(--red)' }
const DIFF_DESC = {
  easy: 'Caesar cipher · 60 s per challenge · Guess the shift (1–25)',
  medium: 'Caesar cipher · 45 s per challenge · Larger shifts',
  hard: 'Vigenère cipher · 90 s per challenge · Guess the key word',
}

export default function CrackTheCipher() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('menu')
  const [difficulty, setDifficulty] = useState('easy')
  const [challengeIdx, setChallengeIdx] = useState(0)
  const [input, setInput] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)
  const [score, setScore] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [result, setResult] = useState(null)
  const [hintShown, setHintShown] = useState(false)
  const [hintUsed, setHintUsed] = useState(false)
  const [shake, setShake] = useState(false)

  const intervalRef = useRef(null)
  const keyRef = useRef(0)
  const startRef = useRef(0)

  useEffect(() => () => clearInterval(intervalRef.current), [])

  function stopTimer() {
    keyRef.current++
    clearInterval(intervalRef.current)
  }

  function startTimer(diff, idx) {
    stopTimer()
    const capturedKey = keyRef.current
    const limit = TIME_LIMITS[diff]
    startRef.current = Date.now()
    setTimeLeft(limit)

    intervalRef.current = setInterval(() => {
      if (keyRef.current !== capturedKey) return
      const elapsed = (Date.now() - startRef.current) / 1000
      const remaining = Math.max(0, limit - elapsed)
      setTimeLeft(Math.ceil(remaining))
      if (remaining <= 0) {
        clearInterval(intervalRef.current)
        const ch = CHALLENGES[diff][idx]
        const answer = diff === 'hard' ? ch.key : String(ch.shift)
        setResult({ type: 'timeout', earned: 0, answer })
        setPhase('result')
      }
    }, 200)
  }

  function startGame(diff) {
    setDifficulty(diff)
    setChallengeIdx(0)
    setScore(0)
    setCorrectCount(0)
    setInput('')
    setHintShown(false)
    setHintUsed(false)
    setResult(null)
    setPhase('playing')
    startTimer(diff, 0)
  }

  function handleSubmit() {
    if (phase !== 'playing' || !input.trim()) return
    const ch = CHALLENGES[difficulty][challengeIdx]
    const val = input.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
    const isCorrect =
      difficulty === 'hard'
        ? val === ch.key
        : val === String(ch.shift)

    if (!isCorrect) {
      setShake(true)
      setTimeout(() => setShake(false), 400)
      return
    }

    stopTimer()
    const bonus = Math.floor((timeLeft / TIME_LIMITS[difficulty]) * BASE_POINTS[difficulty])
    const earned = Math.max(10, BASE_POINTS[difficulty] + bonus - (hintUsed ? HINT_PENALTY : 0))
    setScore((s) => s + earned)
    setCorrectCount((c) => c + 1)
    setResult({ type: 'correct', earned, answer: difficulty === 'hard' ? ch.key : String(ch.shift) })
    setPhase('result')
  }

  function handleNext() {
    const nextIdx = challengeIdx + 1
    if (nextIdx >= CHALLENGES[difficulty].length) {
      setPhase('gameover')
      return
    }
    setChallengeIdx(nextIdx)
    setInput('')
    setHintShown(false)
    setHintUsed(false)
    setResult(null)
    setPhase('playing')
    startTimer(difficulty, nextIdx)
  }

  const ch = CHALLENGES[difficulty][challengeIdx]
  const encrypted = ch
    ? difficulty === 'hard'
      ? vigenereEncrypt(ch.plaintext, ch.key)
      : caesarEncrypt(ch.plaintext, ch.shift)
    : ''

  const timerPct = TIME_LIMITS[difficulty] ? (timeLeft / TIME_LIMITS[difficulty]) * 100 : 100
  const timerColor = timerPct > 50 ? 'var(--green)' : timerPct > 20 ? 'var(--yellow)' : 'var(--red)'

  const hintText = ch
    ? difficulty === 'hard'
      ? `Key length: ${ch.key.length} letter${ch.key.length > 1 ? 's' : ''}. Starts with "${ch.key[0]}".`
      : `The shift is between ${Math.max(1, ch.shift - 4)} and ${Math.min(25, ch.shift + 4)}.`
    : ''

  const total = CHALLENGES[difficulty].length

  // ── Menu ──
  if (phase === 'menu') {
    return (
      <div>
        <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <button
              className="btn btn-secondary"
              style={{ marginBottom: '12px', padding: '6px 12px', fontSize: '12px' }}
              onClick={() => navigate('/games')}
            >
              ← Back
            </button>
            <h1 style={{ color: 'var(--text-bright)', margin: 0, fontFamily: 'var(--mono)', fontSize: '24px' }}>
              🔑 Crack the Cipher
            </h1>
            <p style={{ color: 'var(--text-dim)', margin: '8px 0 0' }}>
              Guess the key used to encrypt each message before time runs out!
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {['easy', 'medium', 'hard'].map((d) => (
            <div
              key={d}
              className="card"
              style={{ marginBottom: 0, cursor: 'pointer', borderColor: 'var(--border)' }}
              onClick={() => startGame(d)}
            >
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>
                {d === 'easy' ? '🟢' : d === 'medium' ? '🟡' : '🔴'}
              </div>
              <h3 style={{ color: DIFF_COLOR[d], textTransform: 'capitalize', marginBottom: '8px' }}>{d}</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '12px', lineHeight: 1.6, marginBottom: '16px' }}>
                {DIFF_DESC[d]}
              </p>
              <button className="btn btn-primary" style={{ width: '100%' }}>Start →</button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Game Over ──
  if (phase === 'gameover') {
    const pct = Math.round((correctCount / total) * 100)
    const grade = pct === 100 ? 'S' : pct >= 80 ? 'A' : pct >= 60 ? 'B' : pct >= 40 ? 'C' : 'F'
    const gradeColor = pct === 100 ? 'var(--cyan)' : pct >= 60 ? 'var(--green)' : pct >= 40 ? 'var(--yellow)' : 'var(--red)'
    return (
      <div>
        <div className="page-header">
          <h1 style={{ color: 'var(--text-bright)', margin: 0, fontFamily: 'var(--mono)', fontSize: '24px' }}>
            🔑 Crack the Cipher — Results
          </h1>
        </div>
        <div className="card" style={{ border: '1px solid var(--cyan)', maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '64px', fontFamily: 'var(--mono)', fontWeight: 700, color: gradeColor }}>{grade}</div>
            <div style={{ color: 'var(--text-dim)', fontSize: '13px', marginTop: '4px', textTransform: 'capitalize' }}>
              {difficulty} · {correctCount}/{total} correct
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--cyan)', fontFamily: 'var(--mono)' }}>{score}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: '12px' }}>Total Score</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--mono)' }}>{pct}%</div>
              <div style={{ color: 'var(--text-dim)', fontSize: '12px' }}>Accuracy</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => startGame(difficulty)}>
              Retry
            </button>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setPhase('menu')}>
              Change Difficulty
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Playing / Result ──
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <button
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '12px' }}
          onClick={() => { stopTimer(); setPhase('menu') }}
        >
          ← Back
        </button>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text-dim)' }}>
            Challenge <span style={{ color: 'var(--text-bright)' }}>{challengeIdx + 1}</span>/{total}
          </span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text-dim)' }}>
            Score <span style={{ color: 'var(--cyan)' }}>{score}</span>
          </span>
        </div>
      </div>

      {/* Timer bar */}
      <div style={{ width: '100%', height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', marginBottom: '20px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ width: `${timerPct}%`, height: '100%', background: timerColor, borderRadius: '3px', transition: 'width 0.2s linear, background 0.5s ease' }} />
      </div>

      <div className="card" style={{ border: phase === 'result' ? `1px solid ${result?.type === 'correct' ? 'var(--green)' : 'var(--red)'}` : '1px solid var(--border)' }}>
        {/* Timer + cipher type */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span className={`tag ${difficulty === 'easy' ? 'tag-green' : difficulty === 'medium' ? 'tag-yellow' : 'tag-purple'}`} style={{ textTransform: 'capitalize' }}>
            {difficulty === 'hard' ? 'Vigenère' : 'Caesar'} · {difficulty}
          </span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '28px', fontWeight: 700, color: timerColor }}>
            {timeLeft}s
          </span>
        </div>

        {/* Encrypted text */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Ciphertext</div>
          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px 20px', fontFamily: 'var(--mono)', fontSize: '22px', color: 'var(--green)', letterSpacing: '3px', textAlign: 'center', wordBreak: 'break-all' }}>
            {encrypted}
          </div>
        </div>

        {/* Input */}
        {phase === 'playing' && (
          <>
            <div className="input-group" style={{ marginBottom: '12px' }}>
              <label>{difficulty === 'hard' ? 'Key Word (letters only)' : 'Shift Number (1–25)'}</label>
              <input
                type={difficulty === 'hard' ? 'text' : 'number'}
                min={difficulty !== 'hard' ? 1 : undefined}
                max={difficulty !== 'hard' ? 25 : undefined}
                placeholder={difficulty === 'hard' ? 'e.g. KEY' : 'e.g. 13'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                style={{ textTransform: difficulty === 'hard' ? 'uppercase' : undefined, outline: shake ? '2px solid var(--red)' : undefined }}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit}>
                Submit
              </button>
              {!hintShown && (
                <button
                  className="btn btn-secondary"
                  onClick={() => { setHintShown(true); setHintUsed(true) }}
                >
                  Hint (−{HINT_PENALTY}pts)
                </button>
              )}
            </div>
            {hintShown && (
              <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(255,204,0,0.07)', border: '1px solid rgba(255,204,0,0.3)', borderRadius: '8px', fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--yellow)' }}>
                💡 {hintText}
              </div>
            )}
          </>
        )}

        {/* Result panel */}
        {phase === 'result' && result && (
          <div>
            <div style={{ padding: '16px', background: result.type === 'correct' ? 'rgba(0,255,136,0.07)' : 'rgba(255,68,102,0.07)', border: `1px solid ${result.type === 'correct' ? 'var(--green)' : 'var(--red)'}`, borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '15px', fontWeight: 700, color: result.type === 'correct' ? 'var(--green)' : 'var(--red)', marginBottom: '8px' }}>
                {result.type === 'correct' ? `✓ Correct! +${result.earned} pts` : '✗ Time\'s up!'}
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: '13px' }}>
                The {difficulty === 'hard' ? 'key' : 'shift'} was:{' '}
                <span style={{ color: 'var(--text-bright)', fontFamily: 'var(--mono)', fontWeight: 700 }}>{result.answer}</span>
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: '13px', marginTop: '4px' }}>
                Plaintext:{' '}
                <span style={{ color: 'var(--cyan)', fontFamily: 'var(--mono)' }}>{ch?.plaintext}</span>
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleNext}>
              {challengeIdx + 1 < total ? 'Next Challenge →' : 'View Results →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
