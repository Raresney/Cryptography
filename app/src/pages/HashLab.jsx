import { useState } from 'react'
import CryptoJS from 'crypto-js'

export default function HashLab() {
  const [text, setText] = useState('')
  const [hashes, setHashes] = useState(null)
  const [compareA, setCompareA] = useState('')
  const [compareB, setCompareB] = useState('')
  const [compareResult, setCompareResult] = useState(null)

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

  function compareHashes() {
    if (!compareA || !compareB) return
    const hashA = CryptoJS.SHA256(compareA).toString()
    const hashB = CryptoJS.SHA256(compareB).toString()
    setCompareResult({ a: hashA, b: hashB, match: hashA === hashB })
  }

  return (
    <>
      <div className="page-header">
        <h2>HashLab</h2>
        <p>Generate cryptographic hashes and see the avalanche effect in action</p>
      </div>

      <div className="card">
        <h3># Hash Generator</h3>

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
                  <span className={`tag ${algo === 'sha256' ? 'tag-green' : algo === 'md5' ? 'tag-cyan' : algo === 'sha512' ? 'tag-yellow' : 'tag-purple'}`}>
                    {algo.toUpperCase()}
                  </span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)' }}>
                    {hash.length * 4} bits
                  </span>
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

      <div className="card">
        <h3>&#9876; Avalanche Effect — Hash Comparison</h3>
        <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 16 }}>
          Change a single character and see how the entire SHA-256 hash changes dramatically.
        </p>

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
              <span className="label">Text A — SHA-256</span>
              {compareResult.a}
            </div>
            <div className="output-box">
              <span className="label">Text B — SHA-256</span>
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
              {compareResult.match ? '$ match: true — hashes are identical' : '$ match: false — completely different hashes'}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
