import { useState } from 'react'

export default function Login({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (password === 'cryptolab2026') {
      sessionStorage.setItem('auth', 'true')
      onLogin()
    } else {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: 40,
        width: 400,
        maxWidth: '90vw',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontFamily: 'var(--mono)',
          fontSize: 28,
          color: 'var(--green)',
          marginBottom: 8,
        }}>
          Crypto<span style={{ color: 'var(--text-dim)' }}>Lab</span>
        </h1>
        <p style={{
          color: 'var(--text-dim)',
          fontFamily: 'var(--mono)',
          fontSize: 13,
          marginBottom: 32,
        }}>
          $ enter access code
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Access code..."
              autoFocus
              style={{
                textAlign: 'center',
                fontSize: 16,
                letterSpacing: 4,
              }}
            />
          </div>

          {error && (
            <p style={{
              color: 'var(--red)',
              fontFamily: 'var(--mono)',
              fontSize: 13,
              marginBottom: 12,
            }}>
              $ access denied
            </p>
          )}

          <button className="btn btn-primary" type="submit" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
            Unlock
          </button>
        </form>
      </div>
    </div>
  )
}
