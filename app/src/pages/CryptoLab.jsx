import { useState } from 'react'
import CryptoJS from 'crypto-js'
import CopyButton from '../components/CopyButton'
import InfoPanel from '../components/InfoPanel'
import KeyStrength from '../components/KeyStrength'

export default function CryptoLab() {
  const [text, setText] = useState('')
  const [key, setKey] = useState('')
  const [algorithm, setAlgorithm] = useState('AES')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState('encrypt')

  // RSA demo state
  const [rsaP, setRsaP] = useState('61')
  const [rsaQ, setRsaQ] = useState('53')
  const [rsaMessage, setRsaMessage] = useState('42')
  const [rsaOutput, setRsaOutput] = useState('')

  function handleCrypto() {
    if (!text || !key) {
      setOutput('// Error: please provide text and key')
      return
    }
    try {
      const algo = algorithm === 'AES' ? CryptoJS.AES :
                   algorithm === 'DES' ? CryptoJS.DES :
                   CryptoJS.TripleDES

      if (mode === 'encrypt') {
        const encrypted = algo.encrypt(text, key).toString()
        setOutput(encrypted)
      } else {
        const bytes = algo.decrypt(text, key)
        const decrypted = bytes.toString(CryptoJS.enc.Utf8)
        setOutput(decrypted || '// Error: decryption failed — wrong key?')
      }
    } catch {
      setOutput('// Error: decryption failed')
    }
  }

  function gcd(a, b) {
    while (b) { [a, b] = [b, a % b] }
    return a
  }

  function modPow(base, exp, mod) {
    let result = 1n
    base = BigInt(base) % BigInt(mod)
    exp = BigInt(exp)
    mod = BigInt(mod)
    while (exp > 0n) {
      if (exp % 2n === 1n) result = (result * base) % mod
      exp = exp / 2n
      base = (base * base) % mod
    }
    return result
  }

  function handleRSA() {
    try {
      const p = parseInt(rsaP)
      const q = parseInt(rsaQ)
      const m = parseInt(rsaMessage)

      const n = p * q
      const phi = (p - 1) * (q - 1)

      let e = 17
      while (gcd(e, phi) !== 1) e += 2

      let d = 1
      while ((d * e) % phi !== 1) d++

      const encrypted = modPow(m, e, n)
      const decrypted = modPow(encrypted, d, n)

      setRsaOutput(
        `// Key Generation\n` +
        `p = ${p}, q = ${q}\n` +
        `n = p * q = ${n}\n` +
        `phi(n) = (p-1)(q-1) = ${phi}\n` +
        `e = ${e} (gcd(e, phi) = 1)\n\n` +
        `// Extended Euclidean Algorithm\n` +
        `d = ${d} (d * e mod phi = ${(d * e) % phi})\n\n` +
        `// Public Key:  (e=${e}, n=${n})\n` +
        `// Private Key: (d=${d}, n=${n})\n\n` +
        `// Encryption: c = m^e mod n\n` +
        `c = ${m}^${e} mod ${n} = ${encrypted}\n\n` +
        `// Decryption: m = c^d mod n\n` +
        `m = ${encrypted}^${d} mod ${n} = ${decrypted}`
      )
    } catch {
      setRsaOutput('// Error: use small prime numbers')
    }
  }

  return (
    <>
      <div className="page-header">
        <h2>CryptoLab</h2>
        <p>Symmetric encryption with AES/DES and RSA key pair demonstration</p>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3>&#128274; Symmetric Encryption</h3>

          <InfoPanel title="What is symmetric encryption?">
            <p>Symmetric encryption uses the <strong>same key</strong> for both encryption and decryption. It's fast and efficient, used for bulk data encryption.</p>
            <p style={{ marginTop: 8 }}>AES (128/256-bit) is the modern standard. DES (56-bit) is legacy and considered insecure. 3DES applies DES three times for better security but is slower than AES.</p>
          </InfoPanel>

          <div className="input-group">
            <label>Algorithm</label>
            <select value={algorithm} onChange={e => setAlgorithm(e.target.value)}>
              <option value="AES">AES (Advanced Encryption Standard)</option>
              <option value="DES">DES (Data Encryption Standard)</option>
              <option value="TripleDES">3DES (Triple DES)</option>
            </select>
          </div>

          <div className="input-group">
            <label>Mode</label>
            <select value={mode} onChange={e => setMode(e.target.value)}>
              <option value="encrypt">Encrypt</option>
              <option value="decrypt">Decrypt</option>
            </select>
          </div>

          <div className="input-group">
            <label>{mode === 'encrypt' ? 'Plaintext' : 'Ciphertext'}</label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={mode === 'encrypt' ? 'Enter text to encrypt...' : 'Paste ciphertext...'}
            />
          </div>

          <div className="input-group">
            <label>Secret Key</label>
            <input
              type="text"
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="Enter encryption key..."
            />
            <KeyStrength password={key} />
          </div>

          <div className="btn-group">
            <button className="btn btn-primary" onClick={handleCrypto}>
              {mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
            </button>
            <button className="btn btn-secondary" onClick={() => { setText(''); setKey(''); setOutput('') }}>
              Clear
            </button>
          </div>

          {output && (
            <div className="output-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="label">Output</span>
                <CopyButton text={output} />
              </div>
              {output}
            </div>
          )}
        </div>

        <div className="card">
          <h3>&#128273; RSA Demo</h3>
          <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 16 }}>
            Step-by-step RSA with small primes. See key generation, encryption, and decryption.
          </p>

          <InfoPanel title="What is RSA?">
            <p>RSA is an <strong>asymmetric</strong> encryption algorithm that uses two different keys: a public key (for encryption) and a private key (for decryption).</p>
            <p style={{ marginTop: 8 }}>Its security relies on the difficulty of factoring large numbers. The public key can be shared with anyone, while the private key must remain secret.</p>
          </InfoPanel>

          <div className="grid-2">
            <div className="input-group">
              <label>Prime p</label>
              <input type="number" value={rsaP} onChange={e => setRsaP(e.target.value)} />
            </div>
            <div className="input-group">
              <label>Prime q</label>
              <input type="number" value={rsaQ} onChange={e => setRsaQ(e.target.value)} />
            </div>
          </div>

          <div className="input-group">
            <label>Message (number)</label>
            <input type="number" value={rsaMessage} onChange={e => setRsaMessage(e.target.value)} />
          </div>

          <div className="btn-group">
            <button className="btn btn-primary" onClick={handleRSA}>
              Generate Keys & Encrypt
            </button>
          </div>

          {rsaOutput && (
            <div className="output-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="label">RSA Output</span>
                <CopyButton text={rsaOutput} />
              </div>
              {rsaOutput}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
