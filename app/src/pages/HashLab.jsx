import { useState, useRef, useCallback, useEffect } from 'react'
import CryptoJS from 'crypto-js'
import CopyButton from '../components/CopyButton'
import InfoPanel from '../components/InfoPanel'
import DifficultySelector from '../components/DifficultySelector'

// Brute force target: a random 4-char lowercase password picked once per mount
function pickRandomPassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  let pw = ''
  for (let i = 0; i < 4; i++) pw += chars[Math.floor(Math.random() * chars.length)]
  return pw
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function diffBits(hexA, hexB) {
  let diff = 0
  for (let i = 0; i < hexA.length; i++) {
    const a = parseInt(hexA[i], 16)
    const b = parseInt(hexB[i], 16)
    let xor = a ^ b
    while (xor) { diff += xor & 1; xor >>= 1 }
  }
  return diff
}

export default function HashLab() {
  // Difficulty
  const [difficulty, setDifficulty] = useState('beginner')

  // --- Feature 1: Hash Generator ---
  const [text, setText] = useState('')
  const [hashes, setHashes] = useState(null)

  // --- Feature 2: Avalanche Effect ---
  const [compareA, setCompareA] = useState('')
  const [compareB, setCompareB] = useState('')
  const [compareResult, setCompareResult] = useState(null)

  // --- Feature 3: File Hash ---
  const [fileInfo, setFileInfo] = useState(null)
  const [fileHash, setFileHash] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  // --- Feature 4: Salt Demo ---
  const [saltPassword, setSaltPassword] = useState('')
  const [unsaltedHash, setUnsaltedHash] = useState('')
  const [saltedResults, setSaltedResults] = useState([])

  // --- Feature 5: Brute Force Demo ---
  const [bruteTarget] = useState(() => {
    const pw = pickRandomPassword()
    return { password: pw, hash: CryptoJS.SHA256(pw).toString() }
  })
  const [bruteRunning, setBruteRunning] = useState(false)
  const [bruteResult, setBruteResult] = useState(null)
  const [bruteProgress, setBruteProgress] = useState({ attempts: 0, current: '', speed: 0 })
  const bruteAbortRef = useRef(false)

  // ---- Hash Generator ----
  function generateHashes() {
    if (!text) return
    setHashes({
      md5: CryptoJS.MD5(text).toString(),
      sha1: CryptoJS.SHA1(text).toString(),
      sha256: CryptoJS.SHA256(text).toString(),
      sha512: CryptoJS.SHA512(text).toString(),
      ripemd160: CryptoJS.RIPEMD160(text).toString(),
    })
  }

  // ---- Avalanche ----
  function compareHashes() {
    if (!compareA || !compareB) return
    const hashA = CryptoJS.SHA256(compareA).toString()
    const hashB = CryptoJS.SHA256(compareB).toString()
    const bits = diffBits(hashA, hashB)
    setCompareResult({ a: hashA, b: hashB, match: hashA === hashB, diffBits: bits })
  }

  // ---- File Hash ----
  const processFile = useCallback((file) => {
    if (!file) return
    setFileInfo({ name: file.name, size: file.size })
    setFileHash('')
    const reader = new FileReader()
    reader.onload = (e) => {
      const arrayBuffer = e.target.result
      const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer)
      const hash = CryptoJS.SHA256(wordArray).toString()
      setFileHash(hash)
    }
    reader.readAsArrayBuffer(file)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    processFile(file)
  }, [processFile])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  // ---- Salt Demo ----
  function hashWithoutSalt() {
    if (!saltPassword) return
    setUnsaltedHash(CryptoJS.SHA256(saltPassword).toString())
  }

  function hashWithSalt() {
    if (!saltPassword) return
    const salt = CryptoJS.lib.WordArray.random(16).toString()
    const hash = CryptoJS.SHA256(saltPassword + salt).toString()
    setSaltedResults(prev => [...prev, { salt, hash }])
  }

  // ---- Brute Force ----
  function startBruteForce() {
    if (bruteRunning) return
    setBruteRunning(true)
    setBruteResult(null)
    bruteAbortRef.current = false

    const targetHash = bruteTarget.hash
    const chars = 'abcdefghijklmnopqrstuvwxyz'
    const len = chars.length
    let attempts = 0
    let a = 0, b = 0, c = 0, d = 0
    const startTime = performance.now()

    function step() {
      if (bruteAbortRef.current) {
        setBruteRunning(false)
        return
      }

      const batchSize = 500
      for (let i = 0; i < batchSize; i++) {
        const guess = chars[a] + chars[b] + chars[c] + chars[d]
        attempts++
        const guessHash = CryptoJS.SHA256(guess).toString()

        if (guessHash === targetHash) {
          const elapsed = (performance.now() - startTime) / 1000
          setBruteProgress({ attempts, current: guess, speed: Math.round(attempts / elapsed) })
          setBruteResult({ password: guess, attempts, time: elapsed.toFixed(2) })
          setBruteRunning(false)
          return
        }

        d++
        if (d >= len) { d = 0; c++ }
        if (c >= len) { c = 0; b++ }
        if (b >= len) { b = 0; a++ }
        if (a >= len) {
          setBruteRunning(false)
          return
        }
      }

      const elapsed = (performance.now() - startTime) / 1000
      setBruteProgress({
        attempts,
        current: chars[a] + chars[b] + chars[c] + chars[d],
        speed: elapsed > 0 ? Math.round(attempts / elapsed) : 0,
      })

      setTimeout(step, 0)
    }

    step()
  }

  function stopBruteForce() {
    bruteAbortRef.current = true
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => { bruteAbortRef.current = true }
  }, [])

  // ---- Visibility helpers ----
  const showSection = (section) => {
    if (section === 'hashgen') return true
    if (section === 'avalanche') return difficulty !== 'beginner'
    if (section === 'filehash') return difficulty !== 'beginner'
    if (section === 'salt') return true
    if (section === 'brute') return difficulty === 'advanced'
    return true
  }

  const algoTagColor = (algo) => {
    switch (algo) {
      case 'sha256': return 'tag-green'
      case 'md5': return 'tag-cyan'
      case 'sha512': return 'tag-yellow'
      default: return 'tag-purple'
    }
  }

  return (
    <>
      <div className="page-header">
        <h2>HashLab</h2>
        <p>Generate cryptographic hashes, explore salting, and see brute force in action</p>
      </div>

      {/* Difficulty Selector */}
      <div style={{ marginBottom: 24 }}>
        <DifficultySelector value={difficulty} onChange={setDifficulty} />
      </div>

      {/* ===== 1. HASH GENERATOR ===== */}
      <div className="card">
        <h3># Hash Generator</h3>

        {difficulty === 'beginner' && (
          <InfoPanel title="What is a hash?">
            A hash function takes any input and produces a fixed-size string of characters.
            The same input always gives the same hash, but you cannot reverse the hash back to the original input.
            Even a tiny change in the input produces a completely different hash.
          </InfoPanel>
        )}

        <div className="input-group">
          <label>Input Text</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Enter text to hash..."
          />
        </div>

        <div className="btn-group">
          <button className="btn btn-primary" onClick={generateHashes}>
            # Generate Hashes
          </button>
          <button className="btn btn-secondary" onClick={() => { setText(''); setHashes(null) }}>
            Clear
          </button>
        </div>

        {hashes && (
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(hashes).map(([algo, hash]) => (
              <div key={algo} style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: 16,
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}>
                  <span className={`tag ${algoTagColor(algo)}`}>
                    {algo.toUpperCase()}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)' }}>
                      {hash.length * 4} bits
                    </span>
                    <CopyButton text={hash} />
                  </div>
                </div>
                <code style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 12,
                  color: 'var(--green)',
                  wordBreak: 'break-all',
                  display: 'block',
                  background: 'transparent',
                  padding: 0,
                }}>
                  {hash}
                </code>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== 2. AVALANCHE EFFECT ===== */}
      {showSection('avalanche') && (
        <div className="card">
          <h3>&#9876; Avalanche Effect &mdash; Hash Comparison</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 16 }}>
            Change a single character and see how the entire SHA-256 hash changes dramatically.
          </p>

          <InfoPanel title="Avalanche Effect">
            A good hash function exhibits the avalanche effect: changing even one bit of the input
            should flip roughly 50% of the output bits. This makes it impossible to predict how
            the hash will change from a small input modification.
          </InfoPanel>

          <div className="grid-2">
            <div className="input-group">
              <label>Text A</label>
              <input
                type="text"
                value={compareA}
                onChange={e => setCompareA(e.target.value)}
                placeholder="hello"
              />
            </div>
            <div className="input-group">
              <label>Text B</label>
              <input
                type="text"
                value={compareB}
                onChange={e => setCompareB(e.target.value)}
                placeholder="Hello"
              />
            </div>
          </div>

          <div className="btn-group">
            <button className="btn btn-primary" onClick={compareHashes}>
              Compare SHA-256
            </button>
          </div>

          {compareResult && (
            <div style={{ marginTop: 20 }}>
              <div className="output-box" style={{ marginTop: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="label">Text A &mdash; SHA-256</span>
                  <CopyButton text={compareResult.a} />
                </div>
                {compareResult.a}
              </div>
              <div className="output-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="label">Text B &mdash; SHA-256</span>
                  <CopyButton text={compareResult.b} />
                </div>
                {compareResult.b}
              </div>
              <div style={{
                marginTop: 12,
                padding: '10px 16px',
                borderRadius: 8,
                background: compareResult.match ? 'var(--green-glow)' : 'rgba(255, 68, 102, 0.1)',
                border: `1px solid ${compareResult.match ? 'var(--border-glow)' : 'rgba(255, 68, 102, 0.3)'}`,
                fontFamily: 'var(--mono)',
                fontSize: 13,
                color: compareResult.match ? 'var(--green)' : 'var(--red)',
              }}>
                {compareResult.match
                  ? '$ match: true \u2014 hashes are identical'
                  : `$ match: false \u2014 ${compareResult.diffBits} of 256 bits differ (${((compareResult.diffBits / 256) * 100).toFixed(1)}%)`}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== 3. FILE HASH ===== */}
      {showSection('filehash') && (
        <div className="card">
          <h3>&#128196; File Hash (SHA-256)</h3>

          <InfoPanel title="File Integrity">
            Hashing files lets you verify their integrity. If even a single byte changes,
            the hash will be completely different. This is how download verification and
            digital signatures work.
          </InfoPanel>

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? 'var(--cyan)' : 'var(--border)'}`,
              borderRadius: 12,
              padding: '40px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragOver ? 'rgba(0, 255, 255, 0.05)' : 'var(--bg-primary)',
              transition: 'all 0.2s ease',
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 14, color: dragOver ? 'var(--cyan)' : 'var(--text-dim)' }}>
              {dragOver ? 'Drop file here...' : 'Drag & drop a file here, or click to browse'}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              onChange={(e) => processFile(e.target.files[0])}
            />
          </div>

          {fileInfo && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{
                display: 'flex',
                gap: 16,
                alignItems: 'center',
                fontFamily: 'var(--mono)',
                fontSize: 13,
                color: 'var(--text)',
              }}>
                <span className="tag tag-cyan">{fileInfo.name}</span>
                <span style={{ color: 'var(--text-dim)' }}>{formatBytes(fileInfo.size)}</span>
              </div>
              {fileHash && (
                <div className="output-box" style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="label">SHA-256</span>
                    <CopyButton text={fileHash} />
                  </div>
                  <code style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 12,
                    color: 'var(--green)',
                    wordBreak: 'break-all',
                  }}>
                    {fileHash}
                  </code>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===== 4. SALT DEMO ===== */}
      {showSection('salt') && (
        <div className="card">
          <h3>&#127831; Salt Demo</h3>

          <InfoPanel title="Why use a salt?">
            Without a salt, the same password always produces the same hash. An attacker
            with a precomputed table (rainbow table) can look up common passwords instantly.
            A salt is random data added before hashing, making each hash unique even for
            identical passwords. This forces attackers to crack each hash individually.
          </InfoPanel>

          <div className="input-group">
            <label>Password</label>
            <input
              type="text"
              value={saltPassword}
              onChange={e => setSaltPassword(e.target.value)}
              placeholder="Enter a password..."
            />
          </div>

          <div className="btn-group">
            <button className="btn btn-secondary" onClick={hashWithoutSalt}>
              Hash without salt
            </button>
            <button className="btn btn-primary" onClick={hashWithSalt}>
              Hash with salt
            </button>
          </div>

          {unsaltedHash && (
            <div className="output-box" style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="label">SHA-256 (no salt) &mdash; always the same</span>
                <CopyButton text={unsaltedHash} />
              </div>
              <code style={{
                fontFamily: 'var(--mono)',
                fontSize: 12,
                color: 'var(--yellow)',
                wordBreak: 'break-all',
              }}>
                {unsaltedHash}
              </code>
            </div>
          )}

          {saltedResults.length > 0 && (
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span className="label" style={{ marginBottom: 4 }}>
                Salted hashes &mdash; same password, different result every time
              </span>
              {saltedResults.map((r, i) => (
                <div key={i} style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: 12,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)' }}>
                      Salt: {r.salt}
                    </span>
                    <CopyButton text={r.hash} />
                  </div>
                  <code style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 12,
                    color: 'var(--green)',
                    wordBreak: 'break-all',
                    display: 'block',
                  }}>
                    {r.hash}
                  </code>
                </div>
              ))}
            </div>
          )}

          {difficulty === 'beginner' && (
            <InfoPanel title="Real-world usage">
              In practice, you should never use plain SHA-256 for passwords. Use dedicated
              password hashing algorithms like bcrypt, scrypt, or Argon2 which are designed
              to be slow and include automatic salting. SHA-256 is too fast, making it
              easy for attackers to try billions of guesses per second.
            </InfoPanel>
          )}
        </div>
      )}

      {/* ===== 5. BRUTE FORCE DEMO ===== */}
      {showSection('brute') && (
        <div className="card">
          <h3>&#128274; Brute Force Demo</h3>

          <InfoPanel title="Brute Force Attacks">
            A brute force attack tries every possible combination until the correct password is found.
            This demo shows why short, simple passwords are dangerous: a 4-character lowercase password
            has only 26^4 = 456,976 possible combinations. Modern GPUs can compute billions of SHA-256
            hashes per second, cracking such passwords instantly.
          </InfoPanel>

          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span className="label">Target hash (SHA-256 of a 4-char lowercase password)</span>
              <CopyButton text={bruteTarget.hash} />
            </div>
            <code style={{
              fontFamily: 'var(--mono)',
              fontSize: 12,
              color: 'var(--cyan)',
              wordBreak: 'break-all',
              display: 'block',
            }}>
              {bruteTarget.hash}
            </code>
          </div>

          <div className="btn-group">
            <button
              className="btn btn-primary"
              onClick={startBruteForce}
              disabled={bruteRunning}
            >
              {bruteRunning ? 'Running...' : 'Start Brute Force'}
            </button>
            {bruteRunning && (
              <button className="btn btn-secondary" onClick={stopBruteForce}>
                Stop
              </button>
            )}
          </div>

          {(bruteRunning || bruteResult) && (
            <div style={{
              marginTop: 16,
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 16,
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 12,
                marginBottom: 12,
              }}>
                <div>
                  <span style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block' }}>Attempts</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 16, color: 'var(--text-bright)' }}>
                    {bruteProgress.attempts.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block' }}>Current Guess</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 16, color: 'var(--yellow)' }}>
                    {bruteProgress.current}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block' }}>Speed</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 16, color: 'var(--cyan)' }}>
                    {bruteProgress.speed.toLocaleString()} h/s
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{
                height: 4,
                background: 'var(--bg-secondary)',
                borderRadius: 2,
                overflow: 'hidden',
                marginBottom: 12,
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min((bruteProgress.attempts / 456976) * 100, 100)}%`,
                  background: bruteResult ? 'var(--green)' : 'var(--cyan)',
                  borderRadius: 2,
                  transition: 'width 0.3s ease',
                }} />
              </div>

              {bruteResult && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 8,
                  background: 'rgba(0, 255, 136, 0.1)',
                  border: '1px solid rgba(0, 255, 136, 0.3)',
                  fontFamily: 'var(--mono)',
                  fontSize: 13,
                  color: 'var(--green)',
                }}>
                  Password found: <strong>{bruteResult.password}</strong> in {bruteResult.attempts.toLocaleString()} attempts, took {bruteResult.time}s
                </div>
              )}
            </div>
          )}

          {/* Comparison table */}
          <div style={{ marginTop: 20 }}>
            <span className="label" style={{ marginBottom: 8, display: 'block' }}>
              Estimated brute force time (lowercase only, ~{bruteProgress.speed > 0 ? bruteProgress.speed.toLocaleString() : '1,000'} hashes/sec in browser)
            </span>
            <div style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              overflow: 'hidden',
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: 'var(--mono)',
                fontSize: 12,
              }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Length', 'Combinations', 'Est. Time (browser)', 'Est. Time (GPU)'].map(h => (
                      <th key={h} style={{
                        padding: '10px 12px',
                        textAlign: 'left',
                        color: 'var(--text-dim)',
                        fontWeight: 500,
                        fontSize: 11,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { len: 4, combos: '456,976', browser: '~8 minutes', gpu: '< 1 ms' },
                    { len: 6, combos: '308,915,776', browser: '~3.5 days', gpu: '~0.03 seconds' },
                    { len: 8, combos: '208,827,064,576', browser: '~6.6 years', gpu: '~21 seconds' },
                    { len: 10, combos: '141,167,095,653,376', browser: '~4,474 years', gpu: '~3.9 hours' },
                  ].map(row => (
                    <tr key={row.len} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px 12px', color: 'var(--text-bright)' }}>{row.len} chars</td>
                      <td style={{ padding: '8px 12px', color: 'var(--purple)' }}>{row.combos}</td>
                      <td style={{ padding: '8px 12px', color: 'var(--yellow)' }}>{row.browser}</td>
                      <td style={{ padding: '8px 12px', color: 'var(--red)' }}>{row.gpu}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <InfoPanel title="Why bcrypt and Argon2 matter">
            SHA-256 is designed to be fast, which is great for data integrity but terrible for
            password storage. Algorithms like bcrypt, scrypt, and Argon2 are intentionally slow
            and memory-intensive, reducing an attacker from billions of guesses per second to
            just a few thousand. Combined with salting, they make brute force attacks impractical
            even for short passwords.
          </InfoPanel>
        </div>
      )}
    </>
  )
}
