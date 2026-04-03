import { useState } from 'react'

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

export default function AlgorithmViz() {
  const [tab, setTab] = useState('caesar')

  // Caesar
  const [caesarText, setCaesarText] = useState('HELLO WORLD')
  const [caesarShift, setCaesarShift] = useState(3)
  const [caesarResult, setCaesarResult] = useState(null)

  // Hill
  const [hillText, setHillText] = useState('HOGWARTS')
  const [hillMatrix] = useState([[27, 7], [1, 20]])
  const [hillResult, setHillResult] = useState(null)

  function runCaesar() {
    setCaesarResult(caesarEncrypt(caesarText, caesarShift))
  }

  function runHill() {
    setHillResult(hillEncrypt(hillText, hillMatrix))
  }

  return (
    <>
      <div className="page-header">
        <h2>Algorithm Visualizer</h2>
        <p>Step-by-step visualization of classical and modern ciphers</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button className={`btn ${tab === 'caesar' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('caesar')}>
          Caesar Cipher
        </button>
        <button className={`btn ${tab === 'hill' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('hill')}>
          Hill Cipher
        </button>
      </div>

      {tab === 'caesar' && (
        <div className="card">
          <h3>&#9881; Caesar Cipher — Shift Each Letter</h3>

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
              <div className="output-box" style={{ marginTop: 20 }}>
                <span className="label">Result</span>
                {caesarResult.result}
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
            </>
          )}
        </div>
      )}

      {tab === 'hill' && (
        <div className="card">
          <h3>&#128256; Hill Cipher — Matrix Multiplication mod 30</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 16 }}>
            Using a 2x2 encryption matrix. Alphabet: ABCDEFGHIJKLMNOPQRSTUVWXYZ?!. (space)
          </p>

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
              <div className="output-box" style={{ marginTop: 20 }}>
                <span className="label">Result</span>
                {hillResult.result}
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
            </>
          )}
        </div>
      )}
    </>
  )
}

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
