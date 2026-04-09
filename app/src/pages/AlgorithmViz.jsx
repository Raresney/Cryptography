import { useState } from 'react'
import CopyButton from '../components/CopyButton'
import InfoPanel from '../components/InfoPanel'
import DifficultySelector from '../components/DifficultySelector'

// ── Caesar Cipher ──────────────────────────────────────────────────────────────

function caesarEncrypt(text, shift) {
  const steps = []
  let result = ''
  for (const char of text) {
    if (/[a-zA-Z]/.test(char)) {
      const base = char === char.toUpperCase() ? 65 : 97
      const original = char.charCodeAt(0) - base
      const shifted = (original + shift) % 26
      const newChar = String.fromCharCode(shifted + base)
      steps.push({ original: char, code: original, shifted, result: newChar })
      result += newChar
    } else {
      steps.push({ original: char, code: '-', shifted: '-', result: char })
      result += char
    }
  }
  return { result, steps }
}

// ── Hill Cipher ────────────────────────────────────────────────────────────────

function hillEncrypt(text, matrix) {
  const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ?!. '
  const MOD = ALPHA.length
  const clean = text.toUpperCase()
  const pairs = []
  const steps = []
  let result = ''

  for (let i = 0; i < clean.length; i += 2) {
    const a = ALPHA.indexOf(clean[i]) >= 0 ? ALPHA.indexOf(clean[i]) : 0
    const b = i + 1 < clean.length ? (ALPHA.indexOf(clean[i + 1]) >= 0 ? ALPHA.indexOf(clean[i + 1]) : 0) : 0
    pairs.push([a, b])

    const r1 = (matrix[0][0] * a + matrix[0][1] * b) % MOD
    const r2 = (matrix[1][0] * a + matrix[1][1] * b) % MOD
    const c1 = ((r1 % MOD) + MOD) % MOD
    const c2 = ((r2 % MOD) + MOD) % MOD

    steps.push({
      input: `(${clean[i]}, ${clean[i + 1] || '_'})`,
      values: `(${a}, ${b})`,
      calc: `(${matrix[0][0]}*${a} + ${matrix[0][1]}*${b}, ${matrix[1][0]}*${a} + ${matrix[1][1]}*${b})`,
      mod: `(${c1}, ${c2})`,
      result: `${ALPHA[c1]}${ALPHA[c2]}`,
    })

    result += ALPHA[c1] + ALPHA[c2]
  }

  return { result, steps }
}

// ── AES Helpers (Educational / Simplified) ─────────────────────────────────────

const SBOX = [
  0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
  0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
  0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
  0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
  0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
  0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
  0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
  0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
  0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
  0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
  0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
  0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
  0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
  0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
  0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
  0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16,
]

const MIX_MATRIX = [
  [2, 3, 1, 1],
  [1, 2, 3, 1],
  [1, 1, 2, 3],
  [3, 1, 1, 2],
]

function textToState(text) {
  const bytes = []
  for (let i = 0; i < 16; i++) {
    bytes.push(i < text.length ? text.charCodeAt(i) & 0xff : 0x00)
  }
  // AES state is column-major
  const state = Array.from({ length: 4 }, () => Array(4).fill(0))
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      state[r][c] = bytes[c * 4 + r]
    }
  }
  return state
}

function copyState(s) {
  return s.map(row => [...row])
}

function subBytesStep(state) {
  const out = copyState(state)
  const details = []
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const original = state[r][c]
      const substituted = SBOX[original]
      out[r][c] = substituted
      details.push({ row: r, col: c, original, substituted })
    }
  }
  return { state: out, details }
}

function shiftRowsStep(state) {
  const out = copyState(state)
  for (let r = 1; r < 4; r++) {
    const row = [...state[r]]
    for (let c = 0; c < 4; c++) {
      out[r][c] = row[(c + r) % 4]
    }
  }
  return { state: out }
}

function gmul(a, b) {
  let p = 0
  for (let i = 0; i < 8; i++) {
    if (b & 1) p ^= a
    const hi = a & 0x80
    a = (a << 1) & 0xff
    if (hi) a ^= 0x1b
    b >>= 1
  }
  return p
}

function mixColumnsStep(state) {
  const out = copyState(state)
  const columnDetails = []
  for (let c = 0; c < 4; c++) {
    const col = [state[0][c], state[1][c], state[2][c], state[3][c]]
    const newCol = []
    const calcStrings = []
    for (let r = 0; r < 4; r++) {
      let val = 0
      const parts = []
      for (let k = 0; k < 4; k++) {
        const product = gmul(MIX_MATRIX[r][k], col[k])
        val ^= product
        parts.push(`${MIX_MATRIX[r][k]}*0x${col[k].toString(16).padStart(2, '0')}`)
      }
      newCol.push(val & 0xff)
      calcStrings.push({ parts, result: val & 0xff })
      out[r][c] = val & 0xff
    }
    columnDetails.push({ colIndex: c, input: col, output: newCol, calcs: calcStrings })
  }
  return { state: out, columnDetails }
}

function addRoundKeyStep(state, keyState) {
  const out = copyState(state)
  const details = []
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      out[r][c] = state[r][c] ^ keyState[r][c]
      details.push({
        row: r, col: c,
        stateVal: state[r][c],
        keyVal: keyState[r][c],
        result: out[r][c],
      })
    }
  }
  return { state: out, details }
}

function runAES(plaintext, key) {
  const inputState = textToState(plaintext)
  const keyState = textToState(key)

  // Initial AddRoundKey
  const afterInitialKey = addRoundKeyStep(inputState, keyState)

  // Round 1
  const afterSubBytes = subBytesStep(afterInitialKey.state)
  const afterShiftRows = shiftRowsStep(afterSubBytes.state)
  const afterMixColumns = mixColumnsStep(afterShiftRows.state)

  // Derive a simple round key (simplified: XOR key with round constant for education)
  const roundKey = copyState(keyState)
  roundKey[0][0] ^= 0x01 // Simplified Rcon
  const afterAddRoundKey = addRoundKeyStep(afterMixColumns.state, roundKey)

  return {
    inputState,
    keyState,
    afterInitialKey,
    afterSubBytes,
    afterShiftRows,
    afterMixColumns,
    roundKey,
    afterAddRoundKey,
  }
}

// ── RSA Helpers ────────────────────────────────────────────────────────────────

function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b)
  while (b) { [a, b] = [b, a % b] }
  return a
}

function modPow(base, exp, mod) {
  const steps = []
  let result = 1n
  base = BigInt(base) % BigInt(mod)
  exp = BigInt(exp)
  const modBig = BigInt(mod)
  let bitPos = 0

  if (base === 0n) return { result: 0, steps: [] }

  let b = base
  let e = exp
  while (e > 0n) {
    if (e % 2n === 1n) {
      const prev = result
      result = (result * b) % modBig
      steps.push({
        bit: bitPos,
        bitValue: 1,
        base: b.toString(),
        resultBefore: prev.toString(),
        resultAfter: result.toString(),
      })
    } else {
      steps.push({
        bit: bitPos,
        bitValue: 0,
        base: b.toString(),
        resultBefore: result.toString(),
        resultAfter: result.toString(),
      })
    }
    e = e / 2n
    b = (b * b) % modBig
    bitPos++
  }

  return { result: Number(result), steps }
}

function findE(phi) {
  const candidates = [3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 65537]
  for (const e of candidates) {
    if (e < phi && gcd(e, phi) === 1) return e
  }
  return 2
}

function modInverse(e, phi) {
  let [old_r, r] = [e, phi]
  let [old_s, s] = [1, 0]
  while (r !== 0) {
    const q = Math.floor(old_r / r);
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s]
  }
  return ((old_s % phi) + phi) % phi
}

function runRSA(p, q, m) {
  const n = p * q
  const phi = (p - 1) * (q - 1)
  const e = findE(phi)
  const d = modInverse(e, phi)

  const encryption = modPow(m, e, n)
  const c = encryption.result
  const decryption = modPow(c, d, n)

  return {
    p, q, n, phi, e, d, m, c,
    decryptedM: decryption.result,
    encSteps: encryption.steps,
    decSteps: decryption.steps,
    keyGenSteps: [
      { label: 'Choose primes', formula: `p = ${p}, q = ${q}`, detail: 'Two distinct prime numbers' },
      { label: 'Compute n', formula: `n = p * q = ${p} * ${q} = ${n}`, detail: 'Modulus for both keys' },
      { label: 'Compute phi(n)', formula: `phi = (p-1)(q-1) = ${p - 1} * ${q - 1} = ${phi}`, detail: "Euler's totient function" },
      { label: 'Choose e', formula: `e = ${e} (gcd(${e}, ${phi}) = 1)`, detail: 'Public exponent, coprime to phi' },
      { label: 'Compute d', formula: `d = e^(-1) mod phi = ${d}`, detail: `Private exponent: ${e} * ${d} mod ${phi} = ${(e * d) % phi}` },
    ],
  }
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const thStyle = {
  textAlign: 'left',
  padding: '8px 12px',
  color: 'var(--text-dim)',
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '1px',
}

const tdStyle = {
  padding: '8px 12px',
  color: 'var(--text)',
}

const matrixCellStyle = (highlight) => ({
  width: 48,
  height: 36,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid var(--border)',
  borderRadius: 4,
  fontFamily: 'var(--mono)',
  fontSize: 11,
  color: highlight === 'green' ? 'var(--green)' : highlight === 'cyan' ? 'var(--cyan)' : 'var(--text)',
  background: highlight ? `${highlight === 'green' ? 'var(--green)' : 'var(--cyan)'}10` : 'var(--bg-primary)',
})

function StateMatrix({ state, highlight, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      {label && (
        <div style={{ color: 'var(--text-dim)', fontSize: 11, marginBottom: 6, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {label}
        </div>
      )}
      <div style={{ display: 'inline-grid', gridTemplateColumns: 'repeat(4, 48px)', gap: 3 }}>
        {state.map((row, r) =>
          row.map((val, c) => (
            <div key={`${r}-${c}`} style={matrixCellStyle(highlight)}>
              {val.toString(16).padStart(2, '0')}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function StepIndicator({ currentStep, totalSteps, labels }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
      {labels.map((label, i) => (
        <div
          key={i}
          style={{
            padding: '4px 12px',
            borderRadius: 999,
            fontSize: 11,
            fontFamily: 'var(--mono)',
            border: `1px solid ${i === currentStep ? 'var(--cyan)' : 'var(--border)'}`,
            background: i === currentStep ? 'var(--cyan)18' : 'transparent',
            color: i < currentStep ? 'var(--green)' : i === currentStep ? 'var(--cyan)' : 'var(--text-dim)',
            fontWeight: i === currentStep ? 600 : 400,
          }}
        >
          {i < currentStep ? '\u2713 ' : ''}{label}
        </div>
      ))}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function AlgorithmViz() {
  const [difficulty, setDifficulty] = useState('intermediate')
  const [tab, setTab] = useState('caesar')

  // Caesar
  const [caesarText, setCaesarText] = useState('HELLO WORLD')
  const [caesarShift, setCaesarShift] = useState(3)
  const [caesarResult, setCaesarResult] = useState(null)

  // Hill
  const [hillText, setHillText] = useState('HOGWARTS')
  const [hillMatrix] = useState([[27, 7], [1, 20]])
  const [hillResult, setHillResult] = useState(null)

  // AES
  const [aesPlaintext, setAesPlaintext] = useState('Attack at dawn!!')
  const [aesKey, setAesKey] = useState('MySecretKey12345')
  const [aesResult, setAesResult] = useState(null)
  const [aesStep, setAesStep] = useState(0)

  // RSA
  const [rsaP, setRsaP] = useState(61)
  const [rsaQ, setRsaQ] = useState(53)
  const [rsaM, setRsaM] = useState(42)
  const [rsaResult, setRsaResult] = useState(null)
  const [rsaStep, setRsaStep] = useState(0)

  function runCaesar() {
    setCaesarResult(caesarEncrypt(caesarText, caesarShift))
  }

  function runHill() {
    setHillResult(hillEncrypt(hillText, hillMatrix))
  }

  function runAESViz() {
    const padded = aesPlaintext.padEnd(16, '\0').slice(0, 16)
    const keyPadded = aesKey.padEnd(16, '\0').slice(0, 16)
    setAesResult(runAES(padded, keyPadded))
    setAesStep(0)
  }

  function runRSAViz() {
    const p = Math.max(2, rsaP)
    const q = Math.max(2, rsaQ)
    const m = Math.max(1, rsaM)
    if (m >= p * q) {
      alert('Message m must be less than n = p*q = ' + (p * q))
      return
    }
    setRsaResult(runRSA(p, q, m))
    setRsaStep(0)
  }

  const showAdvanced = difficulty === 'intermediate' || difficulty === 'advanced'

  const allTabs = [
    { key: 'caesar', label: 'Caesar Cipher' },
    { key: 'hill', label: 'Hill Cipher' },
    ...(showAdvanced ? [
      { key: 'aes', label: 'AES' },
      { key: 'rsa', label: 'RSA' },
    ] : []),
  ]

  const aesStepLabels = ['SubBytes', 'ShiftRows', 'MixColumns', 'AddRoundKey']
  const rsaStepLabels = ['Key Generation', 'Encryption', 'Decryption']

  return (
    <>
      <div className="page-header">
        <h2>Algorithm Visualizer</h2>
        <p>Step-by-step visualization of classical and modern ciphers</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <DifficultySelector value={difficulty} onChange={setDifficulty} />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {allTabs.map(t => (
          <button
            key={t.key}
            className={`btn ${tab === t.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Caesar Cipher Tab ─────────────────────────────────────────────── */}

      {tab === 'caesar' && (
        <div className="card">
          <h3>&#9881; Caesar Cipher — Shift Each Letter</h3>

          {difficulty === 'beginner' && (
            <InfoPanel title="What is Caesar Cipher?">
              <p>The Caesar cipher is one of the simplest encryption techniques. It works by shifting each letter in the plaintext by a fixed number of positions in the alphabet.</p>
              <p style={{ marginTop: 8 }}>For example, with a shift of 3: A becomes D, B becomes E, and so on. It wraps around, so X becomes A.</p>
              <p style={{ marginTop: 8 }}>Named after Julius Caesar, who reportedly used it for military correspondence.</p>
            </InfoPanel>
          )}

          <div className="grid-2">
            <div className="input-group">
              <label>Plaintext</label>
              <input type="text" value={caesarText} onChange={e => setCaesarText(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Shift (0-25)</label>
              <input type="number" min="0" max="25" value={caesarShift} onChange={e => setCaesarShift(parseInt(e.target.value) || 0)} />
            </div>
          </div>

          <div className="btn-group">
            <button className="btn btn-primary" onClick={runCaesar}>Encrypt Step-by-Step</button>
          </div>

          {caesarResult && (
            <>
              <div className="output-box" style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="label">Result</span>
                <span style={{ flex: 1 }}>{caesarResult.result}</span>
                <CopyButton text={caesarResult.result} />
              </div>

              <div style={{ marginTop: 20, overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontFamily: 'var(--mono)',
                  fontSize: 13,
                }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={thStyle}>Char</th>
                      <th style={thStyle}>Position</th>
                      <th style={thStyle}>+ Shift</th>
                      <th style={thStyle}>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {caesarResult.steps.map((s, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={tdStyle}>{s.original}</td>
                        <td style={tdStyle}><span style={{ color: 'var(--cyan)' }}>{s.code}</span></td>
                        <td style={tdStyle}><span style={{ color: 'var(--yellow)' }}>{s.shifted}</span></td>
                        <td style={tdStyle}><span style={{ color: 'var(--green)', fontWeight: 700 }}>{s.result}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <InfoPanel title="How Caesar Cipher works">
                <p>Each letter is converted to its position (A=0, B=1, ..., Z=25), then the shift value is added modulo 26, and the result is converted back to a letter.</p>
                <p style={{ marginTop: 8 }}>Formula: <span style={{ color: 'var(--cyan)' }}>E(x) = (x + shift) mod 26</span></p>
              </InfoPanel>
            </>
          )}
        </div>
      )}

      {/* ── Hill Cipher Tab ───────────────────────────────────────────────── */}

      {tab === 'hill' && (
        <div className="card">
          <h3>&#128256; Hill Cipher — Matrix Multiplication mod 30</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 16 }}>
            Using a 2x2 encryption matrix. Alphabet: ABCDEFGHIJKLMNOPQRSTUVWXYZ?!. (space)
          </p>

          {difficulty === 'beginner' && (
            <InfoPanel title="What is Hill Cipher?">
              <p>The Hill cipher uses linear algebra (matrix multiplication) to encrypt text. Letters are grouped into pairs and treated as vectors, then multiplied by a key matrix.</p>
              <p style={{ marginTop: 8 }}>This makes it a polygraphic cipher -- it encrypts multiple letters at once, making frequency analysis much harder than with Caesar.</p>
            </InfoPanel>
          )}

          <div className="grid-2">
            <div className="input-group">
              <label>Plaintext</label>
              <input type="text" value={hillText} onChange={e => setHillText(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Key Matrix (2x2)</label>
              <div style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: 12,
                fontFamily: 'var(--mono)',
                fontSize: 14,
                color: 'var(--green)',
              }}>
                A = [{hillMatrix[0][0]}, {hillMatrix[0][1]}]<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;[{hillMatrix[1][0]}, {hillMatrix[1][1]}]
              </div>
            </div>
          </div>

          <div className="btn-group">
            <button className="btn btn-primary" onClick={runHill}>Encrypt Step-by-Step</button>
          </div>

          {hillResult && (
            <>
              <div className="output-box" style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="label">Result</span>
                <span style={{ flex: 1 }}>{hillResult.result}</span>
                <CopyButton text={hillResult.result} />
              </div>

              <div style={{ marginTop: 20 }}>
                {hillResult.steps.map((s, i) => (
                  <div key={i} style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 8,
                    fontFamily: 'var(--mono)',
                    fontSize: 12,
                  }}>
                    <div><span style={{ color: 'var(--text-dim)' }}>pair:</span> <span style={{ color: 'var(--cyan)' }}>{s.input}</span> = {s.values}</div>
                    <div><span style={{ color: 'var(--text-dim)' }}>calc:</span> <span style={{ color: 'var(--yellow)' }}>{s.calc}</span></div>
                    <div><span style={{ color: 'var(--text-dim)' }}>mod {30}:</span> {s.mod}</div>
                    <div><span style={{ color: 'var(--text-dim)' }}>result:</span> <span style={{ color: 'var(--green)', fontWeight: 700 }}>{s.result}</span></div>
                  </div>
                ))}
              </div>

              <InfoPanel title="How Hill Cipher works">
                <p>Text is split into pairs of characters, each pair treated as a vector. The key matrix multiplies each vector, and results are taken modulo 30 (the alphabet size).</p>
                <p style={{ marginTop: 8 }}>Formula: <span style={{ color: 'var(--cyan)' }}>C = K * P mod 30</span></p>
              </InfoPanel>
            </>
          )}
        </div>
      )}

      {/* ── AES Tab ───────────────────────────────────────────────────────── */}

      {tab === 'aes' && showAdvanced && (
        <div className="card">
          <h3>&#128274; AES — Advanced Encryption Standard (Round 1)</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 16 }}>
            Educational visualization of one AES round. Showing the 4 core transformations on a 4x4 byte state matrix.
          </p>

          <div className="grid-2">
            <div className="input-group">
              <label>Plaintext (16 chars)</label>
              <input
                type="text"
                value={aesPlaintext}
                onChange={e => setAesPlaintext(e.target.value)}
                maxLength={16}
                placeholder="16 characters..."
              />
              <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{aesPlaintext.length}/16 characters</span>
            </div>
            <div className="input-group">
              <label>Key (16 chars)</label>
              <input
                type="text"
                value={aesKey}
                onChange={e => setAesKey(e.target.value)}
                maxLength={16}
                placeholder="16-character key..."
              />
              <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{aesKey.length}/16 characters</span>
            </div>
          </div>

          <div className="btn-group">
            <button className="btn btn-primary" onClick={runAESViz}>Visualize Round 1</button>
          </div>

          {aesResult && (
            <>
              <StepIndicator currentStep={aesStep} totalSteps={4} labels={aesStepLabels} />

              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setAesStep(s => Math.max(0, s - 1))}
                  disabled={aesStep === 0}
                >
                  Previous Step
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setAesStep(s => Math.min(3, s + 1))}
                  disabled={aesStep === 3}
                >
                  Next Step
                </button>
              </div>

              {/* Step 0: SubBytes */}
              {aesStep === 0 && (
                <div>
                  <h4 style={{ color: 'var(--cyan)', fontFamily: 'var(--mono)', marginBottom: 12 }}>Step 1: SubBytes</h4>
                  <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 16 }}>
                    Each byte of the state is replaced with its corresponding value from the AES S-Box lookup table.
                    This provides non-linearity (confusion) in the cipher.
                  </p>

                  <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <StateMatrix state={aesResult.afterInitialKey.state} highlight="cyan" label="Input State" />
                    <div style={{ fontSize: 24, color: 'var(--text-dim)' }}>{'\u2192'}</div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: 'var(--text-dim)', fontSize: 11, marginBottom: 6, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        S-Box Lookup
                      </div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--yellow)', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-primary)' }}>
                        S[xy] = SBOX[x*16 + y]
                      </div>
                    </div>
                    <div style={{ fontSize: 24, color: 'var(--text-dim)' }}>{'\u2192'}</div>
                    <StateMatrix state={aesResult.afterSubBytes.state} highlight="green" label="After SubBytes" />
                  </div>

                  {difficulty === 'advanced' && (
                    <div style={{ marginTop: 16, overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--mono)', fontSize: 11 }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            <th style={thStyle}>Position</th>
                            <th style={thStyle}>Input Byte</th>
                            <th style={thStyle}>S-Box Output</th>
                          </tr>
                        </thead>
                        <tbody>
                          {aesResult.afterSubBytes.details.slice(0, 8).map((d, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={tdStyle}>[{d.row},{d.col}]</td>
                              <td style={tdStyle}><span style={{ color: 'var(--cyan)' }}>0x{d.original.toString(16).padStart(2, '0')}</span></td>
                              <td style={tdStyle}><span style={{ color: 'var(--green)' }}>0x{d.substituted.toString(16).padStart(2, '0')}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <p style={{ color: 'var(--text-dim)', fontSize: 11, marginTop: 4 }}>Showing first 8 of 16 substitutions</p>
                    </div>
                  )}

                  <InfoPanel title="About SubBytes">
                    <p>The S-Box (Substitution Box) is a 256-entry lookup table derived from the multiplicative inverse in GF(2^8) followed by an affine transformation.</p>
                    <p style={{ marginTop: 8 }}>This step provides <strong>confusion</strong> -- it makes the relationship between the key and ciphertext as complex as possible.</p>
                  </InfoPanel>
                </div>
              )}

              {/* Step 1: ShiftRows */}
              {aesStep === 1 && (
                <div>
                  <h4 style={{ color: 'var(--cyan)', fontFamily: 'var(--mono)', marginBottom: 12 }}>Step 2: ShiftRows</h4>
                  <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 16 }}>
                    Each row of the state matrix is cyclically shifted to the left by its row index (row 0: no shift, row 1: 1 position, row 2: 2 positions, row 3: 3 positions).
                  </p>

                  <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <StateMatrix state={aesResult.afterSubBytes.state} highlight="cyan" label="Before ShiftRows" />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--yellow)' }}>
                        <div>Row 0: no shift</div>
                        <div>Row 1: {'\u2190'} 1</div>
                        <div>Row 2: {'\u2190'} 2</div>
                        <div>Row 3: {'\u2190'} 3</div>
                      </div>
                    </div>
                    <StateMatrix state={aesResult.afterShiftRows.state} highlight="green" label="After ShiftRows" />
                  </div>

                  <div style={{ marginTop: 16 }}>
                    {[0, 1, 2, 3].map(r => (
                      <div key={r} style={{
                        display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6,
                        fontFamily: 'var(--mono)', fontSize: 12,
                      }}>
                        <span style={{ color: 'var(--text-dim)', width: 50 }}>Row {r}:</span>
                        <span style={{ color: 'var(--cyan)' }}>
                          [{aesResult.afterSubBytes.state[r].map(v => v.toString(16).padStart(2, '0')).join(', ')}]
                        </span>
                        <span style={{ color: 'var(--text-dim)' }}>{'\u2192'} shift {r} {'\u2192'}</span>
                        <span style={{ color: 'var(--green)' }}>
                          [{aesResult.afterShiftRows.state[r].map(v => v.toString(16).padStart(2, '0')).join(', ')}]
                        </span>
                      </div>
                    ))}
                  </div>

                  <InfoPanel title="About ShiftRows">
                    <p>ShiftRows provides <strong>diffusion</strong> by spreading bytes across different columns. After this step, each column of the state is composed of bytes from different input columns.</p>
                    <p style={{ marginTop: 8 }}>Combined with MixColumns, this ensures that after a few rounds, every output byte depends on every input byte.</p>
                  </InfoPanel>
                </div>
              )}

              {/* Step 2: MixColumns */}
              {aesStep === 2 && (
                <div>
                  <h4 style={{ color: 'var(--cyan)', fontFamily: 'var(--mono)', marginBottom: 12 }}>Step 3: MixColumns</h4>
                  <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 16 }}>
                    Each column is multiplied by a fixed polynomial matrix in the Galois Field GF(2^8). This mixes the bytes within each column.
                  </p>

                  <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <StateMatrix state={aesResult.afterShiftRows.state} highlight="cyan" label="Before MixColumns" />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: 'var(--text-dim)', fontSize: 11, marginBottom: 6, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Fixed Matrix
                      </div>
                      <div style={{ display: 'inline-grid', gridTemplateColumns: 'repeat(4, 32px)', gap: 2 }}>
                        {MIX_MATRIX.flat().map((v, i) => (
                          <div key={i} style={{
                            width: 32, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1px solid var(--border)', borderRadius: 3,
                            fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--yellow)',
                            background: 'var(--bg-primary)',
                          }}>
                            {v}
                          </div>
                        ))}
                      </div>
                    </div>
                    <StateMatrix state={aesResult.afterMixColumns.state} highlight="green" label="After MixColumns" />
                  </div>

                  {difficulty === 'advanced' && aesResult.afterMixColumns.columnDetails.length > 0 && (
                    <div style={{ marginTop: 16, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8, padding: 12 }}>
                      <div style={{ color: 'var(--text-dim)', fontSize: 11, fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
                        Column 0 Calculation Detail
                      </div>
                      {aesResult.afterMixColumns.columnDetails[0].calcs.map((calc, i) => (
                        <div key={i} style={{ fontFamily: 'var(--mono)', fontSize: 11, marginBottom: 4 }}>
                          <span style={{ color: 'var(--text-dim)' }}>row {i}: </span>
                          <span style={{ color: 'var(--yellow)' }}>{calc.parts.join(' XOR ')}</span>
                          <span style={{ color: 'var(--text-dim)' }}> = </span>
                          <span style={{ color: 'var(--green)' }}>0x{calc.result.toString(16).padStart(2, '0')}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <InfoPanel title="About MixColumns">
                    <p>MixColumns treats each column as a polynomial over GF(2^8) and multiplies it by a fixed polynomial. The multiplication uses the "xtime" operation for multiplication by 2 and XOR for addition.</p>
                    <p style={{ marginTop: 8 }}>This provides <strong>diffusion</strong> within each column, ensuring that changing one byte affects all four bytes in the column.</p>
                  </InfoPanel>
                </div>
              )}

              {/* Step 3: AddRoundKey */}
              {aesStep === 3 && (
                <div>
                  <h4 style={{ color: 'var(--cyan)', fontFamily: 'var(--mono)', marginBottom: 12 }}>Step 4: AddRoundKey</h4>
                  <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 16 }}>
                    The state is combined with the round key using bitwise XOR. Each byte of the state is XORed with the corresponding byte of the round key.
                  </p>

                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <StateMatrix state={aesResult.afterMixColumns.state} highlight="cyan" label="State" />
                    <div style={{ fontSize: 18, color: 'var(--yellow)', fontFamily: 'var(--mono)', fontWeight: 700 }}>XOR</div>
                    <StateMatrix state={aesResult.roundKey} highlight={null} label="Round Key" />
                    <div style={{ fontSize: 18, color: 'var(--text-dim)' }}>=</div>
                    <StateMatrix state={aesResult.afterAddRoundKey.state} highlight="green" label="Result" />
                  </div>

                  {difficulty === 'advanced' && (
                    <div style={{ marginTop: 16, overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--mono)', fontSize: 11 }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            <th style={thStyle}>Position</th>
                            <th style={thStyle}>State</th>
                            <th style={thStyle}>XOR</th>
                            <th style={thStyle}>Key</th>
                            <th style={thStyle}>=</th>
                            <th style={thStyle}>Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {aesResult.afterAddRoundKey.details.slice(0, 8).map((d, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={tdStyle}>[{d.row},{d.col}]</td>
                              <td style={tdStyle}><span style={{ color: 'var(--cyan)' }}>0x{d.stateVal.toString(16).padStart(2, '0')}</span></td>
                              <td style={tdStyle}><span style={{ color: 'var(--yellow)' }}>{'\u2295'}</span></td>
                              <td style={tdStyle}>0x{d.keyVal.toString(16).padStart(2, '0')}</td>
                              <td style={tdStyle}>=</td>
                              <td style={tdStyle}><span style={{ color: 'var(--green)' }}>0x{d.result.toString(16).padStart(2, '0')}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <p style={{ color: 'var(--text-dim)', fontSize: 11, marginTop: 4 }}>Showing first 8 of 16 XOR operations</p>
                    </div>
                  )}

                  <div className="output-box" style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="label">Round 1 Output (hex)</span>
                    <span style={{ flex: 1, fontFamily: 'var(--mono)', fontSize: 12 }}>
                      {aesResult.afterAddRoundKey.state.flat().map(b => b.toString(16).padStart(2, '0')).join(' ')}
                    </span>
                    <CopyButton text={aesResult.afterAddRoundKey.state.flat().map(b => b.toString(16).padStart(2, '0')).join(' ')} />
                  </div>

                  <InfoPanel title="About AddRoundKey">
                    <p>AddRoundKey is the only step that uses the secret key. It XORs the state with a round-specific key derived from the original key through the Key Expansion process.</p>
                    <p style={{ marginTop: 8 }}>XOR is its own inverse: applying it twice with the same key returns the original value. This is what makes decryption possible.</p>
                    <p style={{ marginTop: 8 }}>In a full AES-128 implementation, there are 10 rounds, each with a different round key. This visualization shows only Round 1 for clarity.</p>
                  </InfoPanel>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── RSA Tab ───────────────────────────────────────────────────────── */}

      {tab === 'rsa' && showAdvanced && (
        <div className="card">
          <h3>&#128272; RSA — Asymmetric Encryption</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 16 }}>
            Step-by-step RSA key generation, encryption, and decryption with small primes.
          </p>

          <div className="grid-2">
            <div>
              <div className="input-group">
                <label>Prime p</label>
                <input type="number" min="2" value={rsaP} onChange={e => setRsaP(parseInt(e.target.value) || 2)} />
              </div>
              <div className="input-group">
                <label>Prime q</label>
                <input type="number" min="2" value={rsaQ} onChange={e => setRsaQ(parseInt(e.target.value) || 2)} />
              </div>
            </div>
            <div>
              <div className="input-group">
                <label>Message m (number {'<'} p*q = {rsaP * rsaQ})</label>
                <input type="number" min="1" value={rsaM} onChange={e => setRsaM(parseInt(e.target.value) || 1)} />
              </div>
              <div style={{
                background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8,
                padding: 12, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text-dim)', marginTop: 8,
              }}>
                <span style={{ color: 'var(--yellow)' }}>Note:</span> Use small primes for visualization. Real RSA uses primes with 300+ digits.
              </div>
            </div>
          </div>

          <div className="btn-group">
            <button className="btn btn-primary" onClick={runRSAViz}>Visualize RSA</button>
          </div>

          {rsaResult && (
            <>
              <StepIndicator currentStep={rsaStep} totalSteps={3} labels={rsaStepLabels} />

              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setRsaStep(s => Math.max(0, s - 1))}
                  disabled={rsaStep === 0}
                >
                  Previous Step
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setRsaStep(s => Math.min(2, s + 1))}
                  disabled={rsaStep === 2}
                >
                  Next Step
                </button>
              </div>

              {/* Step 0: Key Generation */}
              {rsaStep === 0 && (
                <div>
                  <h4 style={{ color: 'var(--cyan)', fontFamily: 'var(--mono)', marginBottom: 12 }}>Step 1: Key Generation</h4>

                  <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                    <div style={{
                      flex: 1, minWidth: 200, background: 'var(--bg-primary)', border: '1px solid var(--border)',
                      borderRadius: 8, padding: 16,
                    }}>
                      <div style={{ color: 'var(--green)', fontFamily: 'var(--mono)', fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Public Key
                      </div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 14 }}>
                        <span style={{ color: 'var(--text-dim)' }}>e = </span>
                        <span style={{ color: 'var(--cyan)' }}>{rsaResult.e}</span>
                        <br />
                        <span style={{ color: 'var(--text-dim)' }}>n = </span>
                        <span style={{ color: 'var(--cyan)' }}>{rsaResult.n}</span>
                      </div>
                    </div>
                    <div style={{
                      flex: 1, minWidth: 200, background: 'var(--bg-primary)', border: '1px solid var(--border)',
                      borderRadius: 8, padding: 16,
                    }}>
                      <div style={{ color: 'var(--red)', fontFamily: 'var(--mono)', fontSize: 12, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Private Key
                      </div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 14 }}>
                        <span style={{ color: 'var(--text-dim)' }}>d = </span>
                        <span style={{ color: 'var(--purple)' }}>{rsaResult.d}</span>
                        <br />
                        <span style={{ color: 'var(--text-dim)' }}>n = </span>
                        <span style={{ color: 'var(--purple)' }}>{rsaResult.n}</span>
                      </div>
                    </div>
                  </div>

                  {rsaResult.keyGenSteps.map((step, i) => (
                    <div key={i} style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 8,
                      fontFamily: 'var(--mono)',
                      fontSize: 12,
                    }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                        <span className={`tag ${i === 0 ? 'tag-cyan' : i === 4 ? 'tag-purple' : 'tag-yellow'}`}>{step.label}</span>
                        <span style={{ color: 'var(--green)' }}>{step.formula}</span>
                      </div>
                      <div style={{ color: 'var(--text-dim)', fontSize: 11, marginTop: 4 }}>{step.detail}</div>
                    </div>
                  ))}

                  <InfoPanel title="About RSA Key Generation">
                    <p>RSA security relies on the difficulty of factoring large numbers. Knowing n = p*q, it is computationally infeasible to recover p and q when they are large primes (300+ digits each).</p>
                    <p style={{ marginTop: 8 }}>The public exponent e is typically 65537 in practice. The private exponent d is the modular multiplicative inverse of e modulo phi(n).</p>
                  </InfoPanel>
                </div>
              )}

              {/* Step 1: Encryption */}
              {rsaStep === 1 && (
                <div>
                  <h4 style={{ color: 'var(--cyan)', fontFamily: 'var(--mono)', marginBottom: 12 }}>Step 2: Encryption</h4>
                  <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 16 }}>
                    Computing <span style={{ color: 'var(--cyan)' }}>c = m^e mod n = {rsaResult.m}^{rsaResult.e} mod {rsaResult.n}</span>
                  </p>

                  <div style={{
                    background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8,
                    padding: 16, marginBottom: 16, textAlign: 'center',
                  }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 18, marginBottom: 8 }}>
                      <span style={{ color: 'var(--cyan)' }}>{rsaResult.m}</span>
                      <span style={{ color: 'var(--text-dim)', verticalAlign: 'super', fontSize: 12 }}>{rsaResult.e}</span>
                      <span style={{ color: 'var(--text-dim)' }}> mod </span>
                      <span style={{ color: 'var(--yellow)' }}>{rsaResult.n}</span>
                      <span style={{ color: 'var(--text-dim)' }}> = </span>
                      <span style={{ color: 'var(--green)', fontWeight: 700 }}>{rsaResult.c}</span>
                    </div>
                  </div>

                  {difficulty === 'advanced' && rsaResult.encSteps.length > 0 && (
                    <>
                      <div style={{ color: 'var(--text-dim)', fontSize: 12, fontFamily: 'var(--mono)', marginBottom: 8 }}>
                        Modular Exponentiation (Square-and-Multiply):
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--mono)', fontSize: 11 }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                              <th style={thStyle}>Bit</th>
                              <th style={thStyle}>Bit Value</th>
                              <th style={thStyle}>Base</th>
                              <th style={thStyle}>Result Before</th>
                              <th style={thStyle}>Result After</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rsaResult.encSteps.map((s, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={tdStyle}>{s.bit}</td>
                                <td style={tdStyle}>
                                  <span style={{ color: s.bitValue ? 'var(--green)' : 'var(--text-dim)' }}>{s.bitValue}</span>
                                </td>
                                <td style={tdStyle}><span style={{ color: 'var(--cyan)' }}>{s.base}</span></td>
                                <td style={tdStyle}>{s.resultBefore}</td>
                                <td style={tdStyle}><span style={{ color: 'var(--yellow)' }}>{s.resultAfter}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  <div className="output-box" style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="label">Ciphertext</span>
                    <span style={{ flex: 1 }}>{rsaResult.c}</span>
                    <CopyButton text={String(rsaResult.c)} />
                  </div>

                  <InfoPanel title="About RSA Encryption">
                    <p>RSA encryption computes c = m^e mod n using modular exponentiation. The "square-and-multiply" algorithm efficiently computes this even for large exponents by processing the exponent bit by bit.</p>
                    <p style={{ marginTop: 8 }}>Anyone with the public key (e, n) can encrypt, but only the holder of the private key (d, n) can decrypt.</p>
                  </InfoPanel>
                </div>
              )}

              {/* Step 2: Decryption */}
              {rsaStep === 2 && (
                <div>
                  <h4 style={{ color: 'var(--cyan)', fontFamily: 'var(--mono)', marginBottom: 12 }}>Step 3: Decryption</h4>
                  <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 16 }}>
                    Computing <span style={{ color: 'var(--purple)' }}>m = c^d mod n = {rsaResult.c}^{rsaResult.d} mod {rsaResult.n}</span>
                  </p>

                  <div style={{
                    background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8,
                    padding: 16, marginBottom: 16, textAlign: 'center',
                  }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: 18, marginBottom: 8 }}>
                      <span style={{ color: 'var(--purple)' }}>{rsaResult.c}</span>
                      <span style={{ color: 'var(--text-dim)', verticalAlign: 'super', fontSize: 12 }}>{rsaResult.d}</span>
                      <span style={{ color: 'var(--text-dim)' }}> mod </span>
                      <span style={{ color: 'var(--yellow)' }}>{rsaResult.n}</span>
                      <span style={{ color: 'var(--text-dim)' }}> = </span>
                      <span style={{ color: 'var(--green)', fontWeight: 700 }}>{rsaResult.decryptedM}</span>
                    </div>
                  </div>

                  {difficulty === 'advanced' && rsaResult.decSteps.length > 0 && (
                    <>
                      <div style={{ color: 'var(--text-dim)', fontSize: 12, fontFamily: 'var(--mono)', marginBottom: 8 }}>
                        Modular Exponentiation (Square-and-Multiply):
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--mono)', fontSize: 11 }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                              <th style={thStyle}>Bit</th>
                              <th style={thStyle}>Bit Value</th>
                              <th style={thStyle}>Base</th>
                              <th style={thStyle}>Result Before</th>
                              <th style={thStyle}>Result After</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rsaResult.decSteps.map((s, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={tdStyle}>{s.bit}</td>
                                <td style={tdStyle}>
                                  <span style={{ color: s.bitValue ? 'var(--green)' : 'var(--text-dim)' }}>{s.bitValue}</span>
                                </td>
                                <td style={tdStyle}><span style={{ color: 'var(--cyan)' }}>{s.base}</span></td>
                                <td style={tdStyle}>{s.resultBefore}</td>
                                <td style={tdStyle}><span style={{ color: 'var(--yellow)' }}>{s.resultAfter}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
                    <div className="output-box" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="label">Decrypted Message</span>
                      <span style={{ flex: 1, color: 'var(--green)', fontWeight: 700 }}>{rsaResult.decryptedM}</span>
                      <CopyButton text={String(rsaResult.decryptedM)} />
                    </div>
                  </div>

                  <div style={{
                    marginTop: 16, padding: 12, borderRadius: 8,
                    border: `1px solid ${rsaResult.decryptedM === rsaResult.m ? 'var(--green)' : 'var(--red)'}`,
                    background: rsaResult.decryptedM === rsaResult.m ? 'var(--green)10' : 'var(--red)10',
                    fontFamily: 'var(--mono)', fontSize: 13,
                    color: rsaResult.decryptedM === rsaResult.m ? 'var(--green)' : 'var(--red)',
                  }}>
                    {rsaResult.decryptedM === rsaResult.m
                      ? '\u2713 Decryption successful! Original message recovered: m = ' + rsaResult.m
                      : '\u2717 Decryption mismatch. Check your prime inputs.'}
                  </div>

                  <InfoPanel title="About RSA Decryption">
                    <p>Decryption uses the private key d to compute m = c^d mod n. This works because of Euler's theorem: m^(e*d) mod n = m^(1 + k*phi(n)) mod n = m.</p>
                    <p style={{ marginTop: 8 }}>The security of RSA relies on the computational difficulty of factoring n into its prime factors p and q. Without knowing p and q, computing d from e is infeasible for large key sizes.</p>
                  </InfoPanel>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  )
}
