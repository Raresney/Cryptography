import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const PLAINTEXTS = [
  'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG',
  'TO BE OR NOT TO BE THAT IS THE QUESTION',
  'ALL THAT GLITTERS IS NOT GOLD',
  'KNOWLEDGE IS POWER AND POWER IS KNOWLEDGE',
  'IN CRYPTOGRAPHY WE TRUST NO ONE AND VERIFY EVERYTHING',
]

// English letter frequency order (most → least common)
const EN_FREQ = 'ETAOINSHRDLCUMWFGYPBVKJXQZ'

function generateSubstitution() {
  const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  let perm
  do {
    perm = [...alpha].sort(() => Math.random() - 0.5)
  } while (perm.some((c, i) => c === alpha[i]))

  const encryptMap = {}  // plaintext → cipher
  const decryptMap = {}  // cipher → plaintext
  alpha.forEach((c, i) => {
    encryptMap[c] = perm[i]
    decryptMap[perm[i]] = c
  })
  return { encryptMap, decryptMap }
}

function applySubstitution(text, encryptMap) {
  return text.split('').map((c) => (encryptMap[c] ? encryptMap[c] : c)).join('')
}

function computeFrequency(text) {
  const freq = {}
  text.split('').forEach((c) => {
    if (c >= 'A' && c <= 'Z') freq[c] = (freq[c] || 0) + 1
  })
  return freq
}

export default function FrequencyAttacker() {
  const navigate = useNavigate()
  const [gameState, setGameState] = useState('menu')
  const [plaintext, setPlaintext] = useState('')
  const [ciphertext, setCiphertext] = useState('')
  const [decryptMap, setDecryptMap] = useState({})   // correct: cipher→plain
  const [playerMap, setPlayerMap] = useState({})     // player guess: cipher→plain
  const [selectedCipher, setSelectedCipher] = useState(null)
  const [hintsLeft, setHintsLeft] = useState(3)
  const [gameWon, setGameWon] = useState(false)
  const [score, setScore] = useState(0)

  const startGame = useCallback(() => {
    const pt = PLAINTEXTS[Math.floor(Math.random() * PLAINTEXTS.length)]
    const { encryptMap, decryptMap: dm } = generateSubstitution()
    const ct = applySubstitution(pt, encryptMap)
    setPlaintext(pt)
    setCiphertext(ct)
    setDecryptMap(dm)
    setPlayerMap({})
    setSelectedCipher(null)
    setHintsLeft(3)
    setGameWon(false)
    setScore(1000)
    setGameState('playing')
  }, [])

  const handleCipherClick = useCallback((letter) => {
    if (!letter || letter === ' ') return
    setSelectedCipher((prev) => (prev === letter ? null : letter))
  }, [])

  const handlePlainGuess = useCallback((plain) => {
    if (!selectedCipher) return

    setPlayerMap((prev) => {
      const next = { ...prev }
      // If this plaintext letter is already used elsewhere, unassign it first
      Object.keys(next).forEach((k) => { if (next[k] === plain) delete next[k] })
      next[selectedCipher] = plain
      return next
    })
    setSelectedCipher(null)

    // Check win after state update via setTimeout
    setTimeout(() => {
      setPlayerMap((current) => {
        const uniqueCipher = new Set(ciphertext.split('').filter((c) => c !== ' '))
        const won = [...uniqueCipher].every((c) => current[c] === decryptMap[c])
        if (won) {
          setGameWon(true)
          setGameState('won')
        }
        return current
      })
    }, 0)
  }, [selectedCipher, ciphertext, decryptMap])

  const handleHint = useCallback(() => {
    if (hintsLeft <= 0) return
    const uniqueCipher = [...new Set(ciphertext.split('').filter((c) => c !== ' '))]
    const unsolved = uniqueCipher.filter((c) => playerMap[c] !== decryptMap[c])
    if (unsolved.length === 0) return
    const pick = unsolved[Math.floor(Math.random() * unsolved.length)]
    setPlayerMap((prev) => ({ ...prev, [pick]: decryptMap[pick] }))
    setHintsLeft((h) => h - 1)
    setScore((s) => Math.max(0, s - 150))
    setSelectedCipher(null)
  }, [hintsLeft, ciphertext, decryptMap, playerMap])

  const handleClearMapping = useCallback((cipher) => {
    setPlayerMap((prev) => {
      const next = { ...prev }
      delete next[cipher]
      return next
    })
  }, [])

  const freq = computeFrequency(ciphertext)
  const sortedFreq = Object.entries(freq).sort((a, b) => b[1] - a[1])
  const maxFreq = sortedFreq[0]?.[1] || 1
  const uniqueCipherLetters = [...new Set(ciphertext.split('').filter((c) => c !== ' '))]
  const solvedCount = uniqueCipherLetters.filter((c) => playerMap[c] === decryptMap[c]).length

  if (gameState === 'menu') {
    return (
      <div>
        <div className="page-header">
          <button className="btn btn-secondary" style={{ marginBottom: '12px', padding: '6px 12px', fontSize: '12px' }} onClick={() => navigate('/games')}>
            ← Back
          </button>
          <h1 style={{ color: 'var(--text-bright)', margin: 0, fontFamily: 'var(--mono)', fontSize: '24px' }}>
            📊 Frequency Attacker
          </h1>
          <p style={{ color: 'var(--text-dim)', margin: '8px 0 0' }}>
            A substitution cipher replaces every letter with a different one. Crack it using frequency analysis!
          </p>
        </div>
        <div className="card" style={{ maxWidth: '520px', marginBottom: 0 }}>
          <h3 style={{ color: 'var(--purple)', marginBottom: '16px' }}>How to play</h3>
          <ul style={{ color: 'var(--text-dim)', fontSize: '13px', lineHeight: 2, paddingLeft: '20px', marginBottom: '16px' }}>
            <li>Click a cipher letter in the frequency chart or ciphertext</li>
            <li>Then click the plaintext letter you think it maps to</li>
            <li>Use English frequency order as a guide: <span style={{ fontFamily: 'var(--mono)', color: 'var(--yellow)' }}>E T A O I N S H R D...</span></li>
            <li>You have 3 hints — each reveals one correct mapping (−150 pts each)</li>
          </ul>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={startGame}>
            Start Attack →
          </button>
        </div>
      </div>
    )
  }

  if (gameState === 'won') {
    const grade = score >= 800 ? 'S' : score >= 600 ? 'A' : score >= 400 ? 'B' : 'C'
    const gradeColor = score >= 800 ? 'var(--cyan)' : score >= 600 ? 'var(--green)' : score >= 400 ? 'var(--yellow)' : 'var(--red)'
    return (
      <div>
        <div className="page-header">
          <h1 style={{ color: 'var(--text-bright)', margin: 0, fontFamily: 'var(--mono)', fontSize: '24px' }}>
            📊 Cipher Cracked!
          </h1>
        </div>
        <div className="card" style={{ border: '1px solid var(--purple)', maxWidth: '480px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '64px', fontFamily: 'var(--mono)', fontWeight: 700, color: gradeColor }}>{grade}</div>
            <div style={{ color: 'var(--text-dim)', fontSize: '13px', marginTop: '4px' }}>Cipher fully decoded!</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--purple)', fontFamily: 'var(--mono)' }}>{score}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: '12px' }}>Score</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--mono)' }}>{3 - hintsLeft}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: '12px' }}>Hints Used</div>
            </div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--green)', marginBottom: '20px', letterSpacing: '1px' }}>
            {plaintext}
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
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setGameState('menu')}>
          ← Back
        </button>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text-dim)' }}>
            Solved <span style={{ color: 'var(--green)' }}>{solvedCount}</span>/{uniqueCipherLetters.length}
          </span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text-dim)' }}>
            Score <span style={{ color: 'var(--purple)' }}>{score}</span>
          </span>
          <button
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px', opacity: hintsLeft === 0 ? 0.4 : 1 }}
            onClick={handleHint}
            disabled={hintsLeft === 0}
          >
            💡 Hint ({hintsLeft})
          </button>
        </div>
      </div>

      {/* Ciphertext display */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Ciphertext — click a letter to select it
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', lineHeight: 2 }}>
          {ciphertext.split('').map((c, i) => {
            if (c === ' ') return <span key={i} style={{ width: '12px', display: 'inline-block' }} />
            const mapped = playerMap[c]
            const isCorrect = mapped && mapped === decryptMap[c]
            const isWrong = mapped && mapped !== decryptMap[c]
            const isSelected = selectedCipher === c

            return (
              <span
                key={i}
                onClick={() => handleCipherClick(c)}
                style={{
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  background: isSelected ? 'rgba(255,204,0,0.15)' : isCorrect ? 'rgba(0,255,136,0.08)' : 'transparent',
                  border: `1px solid ${isSelected ? 'var(--yellow)' : isCorrect ? 'var(--green)' : isWrong ? 'var(--red)' : 'transparent'}`,
                  transition: 'all 0.15s',
                  userSelect: 'none',
                }}
              >
                <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-dim)' }}>{mapped || '\u00A0'}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '15px', color: isSelected ? 'var(--yellow)' : isCorrect ? 'var(--green)' : isWrong ? 'var(--red)' : 'var(--text-bright)' }}>
                  {c}
                </span>
              </span>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Frequency chart */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Letter Frequency — click to select
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {sortedFreq.map(([letter, count]) => {
              const pct = Math.round((count / maxFreq) * 100)
              const isSelected = selectedCipher === letter
              const mapped = playerMap[letter]
              const isCorrect = mapped && mapped === decryptMap[letter]
              return (
                <div
                  key={letter}
                  onClick={() => handleCipherClick(letter)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '3px 6px', borderRadius: '4px', background: isSelected ? 'rgba(255,204,0,0.1)' : 'transparent', border: `1px solid ${isSelected ? 'var(--yellow)' : 'transparent'}` }}
                >
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 700, width: '18px', color: isSelected ? 'var(--yellow)' : isCorrect ? 'var(--green)' : 'var(--text-bright)' }}>{letter}</span>
                  <div style={{ flex: 1, height: '10px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: isSelected ? 'var(--yellow)' : isCorrect ? 'var(--green)' : 'var(--purple)', borderRadius: '3px', transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-dim)', width: '20px', textAlign: 'right' }}>{count}</span>
                  {mapped && <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: isCorrect ? 'var(--green)' : 'var(--red)', width: '14px' }}>→{mapped}</span>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right panel: plaintext selector + hint */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Plaintext keyboard */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {selectedCipher
                ? <span>Assign <span style={{ color: 'var(--yellow)' }}>{selectedCipher}</span> → click a plaintext letter</span>
                : 'Select a cipher letter first'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
              {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((plain) => {
                const alreadyUsed = Object.values(playerMap).includes(plain)
                const isAssigned = selectedCipher && playerMap[selectedCipher] === plain
                return (
                  <button
                    key={plain}
                    onClick={() => handlePlainGuess(plain)}
                    disabled={!selectedCipher}
                    style={{
                      padding: '6px 4px',
                      fontFamily: 'var(--mono)',
                      fontSize: '13px',
                      fontWeight: 700,
                      background: isAssigned ? 'var(--green)' : alreadyUsed ? 'rgba(0,255,136,0.06)' : 'var(--bg-secondary)',
                      border: `1px solid ${isAssigned ? 'var(--green)' : alreadyUsed ? 'var(--border-glow)' : 'var(--border)'}`,
                      borderRadius: '6px',
                      color: isAssigned ? 'var(--bg-primary)' : alreadyUsed ? 'var(--green)' : selectedCipher ? 'var(--text-bright)' : 'var(--text-dim)',
                      cursor: selectedCipher ? 'pointer' : 'default',
                      transition: 'all 0.15s',
                    }}
                  >
                    {plain}
                  </button>
                )
              })}
            </div>
          </div>

          {/* English frequency reference */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              English frequency (most → least)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {EN_FREQ.split('').map((c, i) => (
                <span key={c} style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: i < 6 ? 'var(--green)' : i < 12 ? 'var(--cyan)' : 'var(--text-dim)' }}>{c}</span>
              ))}
            </div>
          </div>

          {/* Current mappings */}
          {Object.keys(playerMap).length > 0 && (
            <div className="card" style={{ marginBottom: 0 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Your mappings
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {Object.entries(playerMap).sort().map(([cipher, plain]) => {
                  const correct = decryptMap[cipher] === plain
                  return (
                    <span
                      key={cipher}
                      onClick={() => handleClearMapping(cipher)}
                      title="Click to remove"
                      style={{
                        fontFamily: 'var(--mono)',
                        fontSize: '12px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: correct ? 'rgba(0,255,136,0.1)' : 'rgba(255,68,102,0.1)',
                        border: `1px solid ${correct ? 'var(--green)' : 'var(--red)'}`,
                        color: correct ? 'var(--green)' : 'var(--red)',
                        cursor: 'pointer',
                      }}
                    >
                      {cipher}→{plain}
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
