import { useState, useEffect, useRef, useCallback } from 'react'
import CopyButton from '../components/CopyButton'
import InfoPanel from '../components/InfoPanel'
import DifficultySelector from '../components/DifficultySelector'

const CERT_CHAIN = [
  { name: 'Root CA', icon: '\u{1F6E1}', color: 'var(--red)', desc: 'Self-signed certificate authority. Trusted by the OS/browser.' },
  { name: 'Intermediate CA', icon: '\u{1F517}', color: 'var(--yellow)', desc: 'Signed by Root CA. Signs server certificates.' },
  { name: 'Server Certificate', icon: '\u{1F512}', color: 'var(--green)', desc: 'Signed by Intermediate CA. Used by nginx/Apache for HTTPS.' },
]

const TLS_STEPS = [
  { title: 'Client Hello', desc: 'Browser sends supported TLS versions, cipher suites, and a random number.', side: 'client', simpleDesc: 'Browser says hello and shares what encryption it supports.' },
  { title: 'Server Hello', desc: 'Server selects TLS version, cipher suite, and sends its certificate.', side: 'server', simpleDesc: 'Server picks encryption method and sends its ID card.' },
  { title: 'Certificate Verify', desc: 'Browser validates the certificate chain up to a trusted Root CA.', side: 'client', simpleDesc: 'Browser checks if the server ID card is legit.' },
  { title: 'Key Exchange', desc: 'Both sides generate a shared secret using Diffie-Hellman or RSA key exchange.', side: 'both', simpleDesc: 'Both sides agree on a secret code only they know.' },
  { title: 'Encrypted Session', desc: 'All traffic is now encrypted with the shared symmetric key (AES).', side: 'both', simpleDesc: 'Everything is now locked with the shared secret key!' },
]

const OPENSSL_COMMANDS = [
  {
    title: 'Initialize PKI & Build CA',
    commands: `# Initialize Public Key Infrastructure
$ cd /usr/share/easy-rsa/3
$ ./easyrsa init-pki

# Build Certificate Authority
$ ./easyrsa build-ca
# Enter passphrase for CA key (required for signing)`,
  },
  {
    title: 'Generate Server Certificate',
    commands: `# Generate cert for app.fiipractic.lan
$ ./easyrsa --subject-alt-name=DNS:app.fiipractic.lan \\
    build-server-full app nopass

# Files created:
# Certificate: pki/issued/app.crt
# Private key: pki/private/app.key
# CA cert:     pki/ca.crt`,
  },
  {
    title: 'Encrypt with Public Key',
    commands: `# Extract public key from certificate
$ openssl x509 -pubkey -noout \\
    -in pki/issued/app.crt > pubkey.pem

# Encrypt a file
$ openssl pkeyutl -encrypt \\
    -pubin -inkey pubkey.pem \\
    -in secret.txt -out secret.encrypt`,
  },
  {
    title: 'Decrypt with Private Key',
    commands: `# Decrypt using the private key
$ openssl pkeyutl -decrypt \\
    -inkey pki/private/app.key \\
    -in secret.encrypt -out secret.decrypt

$ cat secret.decrypt`,
  },
  {
    title: 'Nginx HTTPS Configuration',
    commands: `# /etc/nginx/conf.d/app-ssl.conf
server {
    listen 443 ssl;
    server_name app.fiipractic.lan;

    ssl_certificate     pki/issued/app.crt;
    ssl_certificate_key pki/private/app.key;

    location / {
        try_files $uri $uri/ =404;
    }
}`,
  },
]

const OPENSSL_EXPLANATIONS = [
  'Initializes a fresh PKI directory structure and creates the root Certificate Authority. The CA is the foundation of your trust chain -- all other certificates derive their trust from it.',
  'Generates a server certificate signed by your CA, with a Subject Alternative Name (SAN) for hostname validation. The "nopass" flag skips key encryption for automated deployments.',
  'Extracts the public key from the server certificate, then uses it to encrypt a file. Only the holder of the corresponding private key can decrypt this data (asymmetric encryption).',
  'Decrypts data that was encrypted with the public key. This demonstrates the core asymmetric principle: public key encrypts, private key decrypts.',
  'Configures Nginx to serve HTTPS on port 443 using the generated certificate and private key. The ssl_certificate directive points to the full chain, ssl_certificate_key to the private key.',
]

const ANIMATION_STYLES = `
@keyframes slideRight {
  0% { transform: translateX(0); opacity: 0.8; }
  50% { opacity: 1; }
  100% { transform: translateX(calc(100% - 20px)); opacity: 0.8; }
}
@keyframes slideLeft {
  0% { transform: translateX(0); opacity: 0.8; }
  50% { opacity: 1; }
  100% { transform: translateX(calc(-100% + 20px)); opacity: 0.8; }
}
@keyframes slideBothRight {
  0% { transform: translateX(0); opacity: 0.7; }
  50% { opacity: 1; }
  100% { transform: translateX(calc(100% - 20px)); opacity: 0.7; }
}
@keyframes slideBothLeft {
  0% { transform: translateX(0); opacity: 0.7; }
  50% { opacity: 1; }
  100% { transform: translateX(calc(-100% + 20px)); opacity: 0.7; }
}
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 8px var(--cyan), 0 0 16px transparent; }
  50% { box-shadow: 0 0 16px var(--cyan), 0 0 32px var(--cyan); }
}
@keyframes verifyPulse {
  0%, 100% { box-shadow: 0 0 8px var(--yellow), inset 0 0 8px transparent; }
  50% { box-shadow: 0 0 20px var(--yellow), inset 0 0 12px rgba(255,200,0,0.1); }
}
@keyframes tunnelExpand {
  0% { opacity: 0; height: 4px; }
  50% { opacity: 0.6; height: 6px; }
  100% { opacity: 1; height: 8px; }
}
@keyframes tunnelGlow {
  0%, 100% { box-shadow: 0 0 8px var(--green), 0 0 16px transparent; }
  50% { box-shadow: 0 0 16px var(--green), 0 0 32px var(--green); }
}
@keyframes fadeInUp {
  0% { opacity: 0; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes packetBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}
`

function TLSHandshakeAnimation({ simplified }) {
  const [currentStep, setCurrentStep] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [mode, setMode] = useState('auto') // 'auto' or 'manual'
  const timerRef = useRef(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    clearTimer()
    setCurrentStep(-1)
    setIsPlaying(false)
  }, [clearTimer])

  const startAutoPlay = useCallback(() => {
    reset()
    setIsPlaying(true)
    setMode('auto')
    let step = 0
    const advance = () => {
      setCurrentStep(step)
      step++
      if (step < TLS_STEPS.length) {
        timerRef.current = setTimeout(advance, 1500)
      } else {
        timerRef.current = setTimeout(() => setIsPlaying(false), 1500)
      }
    }
    timerRef.current = setTimeout(advance, 300)
  }, [reset])

  const startManual = useCallback(() => {
    reset()
    setMode('manual')
    setCurrentStep(0)
  }, [reset])

  const nextStep = useCallback(() => {
    setCurrentStep(prev => {
      if (prev < TLS_STEPS.length - 1) return prev + 1
      return prev
    })
  }, [])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  const getPacketStyle = (step) => {
    if (step !== currentStep) return null
    const s = TLS_STEPS[step]
    const base = {
      position: 'absolute',
      top: '50%',
      width: 20,
      height: 20,
      borderRadius: 4,
      marginTop: -10,
      zIndex: 5,
    }
    if (s.side === 'client') {
      return {
        ...base,
        left: 0,
        background: 'var(--cyan)',
        animation: 'slideRight 1.2s ease-in-out forwards',
      }
    }
    if (s.side === 'server') {
      return {
        ...base,
        right: 0,
        background: 'var(--purple)',
        animation: 'slideLeft 1.2s ease-in-out forwards',
      }
    }
    return null
  }

  const tunnelActive = currentStep === 4

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="btn btn-primary" onClick={startAutoPlay} disabled={isPlaying}>
          {currentStep >= 0 ? 'Replay' : 'Start Handshake'}
        </button>
        <button className="btn btn-secondary" onClick={startManual}>
          Step-by-step
        </button>
        {mode === 'manual' && currentStep >= 0 && currentStep < TLS_STEPS.length - 1 && (
          <button className="btn btn-secondary" onClick={nextStep} style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}>
            Next Step
          </button>
        )}
        {currentStep >= 0 && (
          <button className="btn btn-secondary" onClick={reset} style={{ marginLeft: 'auto' }}>
            Reset
          </button>
        )}
      </div>

      {/* Client / Server arena */}
      <div style={{ display: 'flex', gap: 0, alignItems: 'stretch', minHeight: 180 }}>
        {/* Client */}
        <div style={{
          flex: '0 0 100px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px 8px',
          background: 'var(--bg-primary)',
          border: '2px solid var(--border)',
          borderRadius: '12px 0 0 12px',
          transition: 'all 0.4s ease',
          ...(currentStep === 2 ? {
            borderColor: 'var(--yellow)',
            animation: 'verifyPulse 1s ease-in-out 2',
          } : {}),
          ...(tunnelActive ? { borderColor: 'var(--green)' } : {}),
        }}>
          <div style={{ fontSize: 32, marginBottom: 6 }}>&#128187;</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--cyan)', fontWeight: 700 }}>CLIENT</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>Browser</div>
        </div>

        {/* Channel */}
        <div style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 120,
        }}>
          {/* Base line */}
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            height: tunnelActive ? 8 : 2,
            marginTop: tunnelActive ? -4 : -1,
            background: tunnelActive ? 'var(--green)' : 'var(--border)',
            borderRadius: 4,
            transition: 'all 0.5s ease',
            ...(tunnelActive ? {
              animation: 'tunnelGlow 1.5s ease-in-out infinite',
            } : {}),
          }} />

          {/* Tunnel label */}
          {tunnelActive && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -24px)',
              fontFamily: 'var(--mono)',
              fontSize: 11,
              color: 'var(--green)',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              animation: 'fadeInUp 0.5s ease-out',
            }}>
              &#128274; ENCRYPTED TUNNEL
            </div>
          )}

          {/* Animated packets */}
          {currentStep >= 0 && currentStep <= 1 && getPacketStyle(currentStep) && (
            <div style={getPacketStyle(currentStep)} />
          )}

          {/* Key exchange: two packets */}
          {currentStep === 3 && (
            <>
              <div style={{
                position: 'absolute',
                top: 'calc(50% - 14px)',
                left: 0,
                width: 16,
                height: 16,
                borderRadius: 4,
                background: 'var(--cyan)',
                zIndex: 5,
                animation: 'slideRight 1.2s ease-in-out forwards',
              }} />
              <div style={{
                position: 'absolute',
                top: 'calc(50% + 2px)',
                right: 0,
                width: 16,
                height: 16,
                borderRadius: 4,
                background: 'var(--purple)',
                zIndex: 5,
                animation: 'slideLeft 1.2s ease-in-out forwards',
              }} />
            </>
          )}

          {/* Step indicator dots */}
          <div style={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 6,
          }}>
            {TLS_STEPS.map((_, i) => (
              <div key={i} style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: i === currentStep ? 'var(--cyan)' : i < currentStep ? 'var(--text-dim)' : 'var(--border)',
                transition: 'all 0.3s ease',
                ...(i === currentStep ? { animation: 'packetBounce 0.6s ease' } : {}),
              }} />
            ))}
          </div>
        </div>

        {/* Server */}
        <div style={{
          flex: '0 0 100px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px 8px',
          background: 'var(--bg-primary)',
          border: '2px solid var(--border)',
          borderRadius: '0 12px 12px 0',
          transition: 'all 0.4s ease',
          ...(tunnelActive ? { borderColor: 'var(--green)' } : {}),
        }}>
          <div style={{ fontSize: 32, marginBottom: 6 }}>&#128421;</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--purple)', fontWeight: 700 }}>SERVER</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>Nginx</div>
        </div>
      </div>

      {/* Step descriptions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
        {TLS_STEPS.map((step, i) => {
          const isActive = i === currentStep
          const isPast = i < currentStep
          const isFuture = i > currentStep
          return (
            <div key={i} style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              padding: '10px 14px',
              background: isActive ? 'var(--bg-secondary)' : 'var(--bg-primary)',
              border: `1px solid ${isActive ? 'var(--cyan)' : 'var(--border)'}`,
              borderRadius: 8,
              opacity: isFuture ? 0.35 : isPast ? 0.6 : 1,
              transition: 'all 0.4s ease',
              ...(isActive ? { animation: 'fadeInUp 0.4s ease-out', boxShadow: '0 0 12px rgba(0,200,255,0.1)' } : {}),
            }}>
              <div className="step-number" style={{
                ...(isActive ? { background: 'var(--cyan)', color: 'var(--bg-primary)' } : {}),
                ...(isPast ? { background: 'var(--text-dim)', color: 'var(--bg-primary)' } : {}),
              }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{
                  color: isActive ? 'var(--text-bright)' : 'var(--text)',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: 14,
                  marginBottom: 2,
                }}>
                  {step.title}
                </div>
                <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>
                  {simplified ? step.simpleDesc : step.desc}
                </div>
              </div>
              <span className={`tag ${step.side === 'client' ? 'tag-cyan' : step.side === 'server' ? 'tag-purple' : 'tag-green'}`}>
                {step.side}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function SSLExplorer() {
  const [activeCmd, setActiveCmd] = useState(0)
  const [difficulty, setDifficulty] = useState('beginner')

  const showOpenSSL = difficulty === 'intermediate' || difficulty === 'advanced'
  const showWireshark = difficulty === 'advanced'

  return (
    <>
      <style>{ANIMATION_STYLES}</style>

      <div className="page-header">
        <h2>SSL/TLS Explorer</h2>
        <p>Visualize certificate chains, TLS handshake, and practical OpenSSL commands</p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <DifficultySelector value={difficulty} onChange={setDifficulty} />
      </div>

      {/* Certificate Chain */}
      <div className="card">
        <h3>&#128279; Certificate Chain</h3>
        <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 20 }}>
          Certificates form a chain of trust from the server up to a trusted Root CA.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {CERT_CHAIN.map((cert, i) => (
            <div key={i}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px 20px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: 8,
              }}>
                <span style={{ fontSize: 28 }}>{cert.icon}</span>
                <div>
                  <div style={{ color: cert.color, fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 14 }}>
                    {cert.name}
                  </div>
                  <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 2 }}>{cert.desc}</div>
                </div>
              </div>
              {i < CERT_CHAIN.length - 1 && (
                <div style={{
                  textAlign: 'center',
                  color: 'var(--text-dim)',
                  fontFamily: 'var(--mono)',
                  fontSize: 12,
                  padding: '4px 0',
                }}>
                  signs &#8595;
                </div>
              )}
            </div>
          ))}
        </div>

        <InfoPanel title="What is PKI and why do we need Certificate Authorities?">
          <p><strong>Public Key Infrastructure (PKI)</strong> is the framework of policies, hardware, software, and procedures needed to create, manage, distribute, and revoke digital certificates.</p>
          <p style={{ marginTop: 8 }}>Certificate Authorities (CAs) solve a fundamental trust problem: how do you verify that a public key truly belongs to who it claims? CAs act as trusted third parties that vouch for identities by signing their certificates.</p>
          <p style={{ marginTop: 8 }}>Without CAs, anyone could claim to be "google.com" and serve a fake public key. The chain of trust -- from Root CA to Intermediate CA to Server Certificate -- lets browsers verify authenticity without needing to trust every server individually.</p>
        </InfoPanel>
      </div>

      {/* Animated TLS Handshake */}
      <div className="card">
        <h3>&#128259; TLS Handshake</h3>
        <p style={{ color: 'var(--text-dim)', fontSize: 13, marginBottom: 16 }}>
          Watch how a browser and server establish a secure connection in real time.
        </p>
        <TLSHandshakeAnimation simplified={difficulty === 'beginner'} />

        <InfoPanel title="Diffie-Hellman key exchange and Perfect Forward Secrecy">
          <p><strong>Diffie-Hellman (DH)</strong> is a method that allows two parties to generate a shared secret over an insecure channel without ever transmitting the secret itself. Each side contributes a random value, and through mathematical operations (modular exponentiation), they arrive at the same shared key.</p>
          <p style={{ marginTop: 8 }}><strong>Perfect Forward Secrecy (PFS)</strong> means that even if a server's private key is compromised in the future, past sessions remain secure. This is achieved by using <em>ephemeral</em> DH keys -- a fresh key pair is generated for every session and discarded afterward.</p>
          <p style={{ marginTop: 8 }}>Modern TLS uses <strong>ECDHE</strong> (Elliptic Curve Diffie-Hellman Ephemeral) which provides the same security with smaller key sizes and faster computation than classic DH.</p>
        </InfoPanel>
      </div>

      {/* OpenSSL Commands */}
      {showOpenSSL && (
        <div className="card">
          <h3>$ OpenSSL Commands</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {OPENSSL_COMMANDS.map((cmd, i) => (
              <button
                key={i}
                className={`btn ${activeCmd === i ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveCmd(i)}
                style={{ fontSize: 12 }}
              >
                {cmd.title}
              </button>
            ))}
          </div>

          <div className="terminal">
            <div className="terminal-header">
              <span className="terminal-dot red" />
              <span className="terminal-dot yellow" />
              <span className="terminal-dot green" />
              <span className="terminal-title">{OPENSSL_COMMANDS[activeCmd].title}</span>
              <span style={{ marginLeft: 'auto' }}>
                <CopyButton text={OPENSSL_COMMANDS[activeCmd].commands} />
              </span>
            </div>
            <div className="terminal-body">
              {OPENSSL_COMMANDS[activeCmd].commands}
            </div>
          </div>

          <InfoPanel title="What does this command do?">
            <p>{OPENSSL_EXPLANATIONS[activeCmd]}</p>
          </InfoPanel>
        </div>
      )}

      {/* HTTP vs HTTPS Wireshark */}
      {showWireshark && (
        <div className="card">
          <h3>&#128270; HTTP vs HTTPS — Wireshark</h3>
          <div className="grid-2">
            <div style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 16,
            }}>
              <span className="tag tag-cyan" style={{ marginBottom: 12, display: 'inline-block' }}>HTTP (Port 80)</span>
              <div className="terminal-body" style={{ padding: 0, fontSize: 12 }}>
                {`GET / HTTP/1.1
Host: app.fiipractic.lan
User-Agent: Mozilla/5.0

<html>
  <body>Hello World</body>
</html>`}
              </div>
              <p style={{ color: 'var(--red)', fontFamily: 'var(--mono)', fontSize: 12, marginTop: 12 }}>
                &#9888; Everything visible in plaintext
              </p>
            </div>
            <div style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 16,
            }}>
              <span className="tag tag-green" style={{ marginBottom: 12, display: 'inline-block' }}>HTTPS (Port 443)</span>
              <div className="terminal-body" style={{ padding: 0, fontSize: 12 }}>
                {`17 03 03 00 1c a4 b2 f7
3e 8c 91 d5 27 6a e3 00
c8 4f 2b 9d 11 e4 7a 88
f3 65 ab 72 19 c0 d4 55
...encrypted TLS data...`}
              </div>
              <p style={{ color: 'var(--green)', fontFamily: 'var(--mono)', fontSize: 12, marginTop: 12 }}>
                &#128274; Traffic encrypted — nothing readable
              </p>
            </div>
          </div>

          <InfoPanel title="What does Wireshark actually capture?">
            <p><strong>Wireshark</strong> is a network protocol analyzer that captures packets as they travel across the network.</p>
            <p style={{ marginTop: 8 }}>With <strong>HTTP</strong>, Wireshark captures everything in plaintext: URLs, headers, cookies, request/response bodies, and even credentials. An attacker on the same network can read all of it.</p>
            <p style={{ marginTop: 8 }}>With <strong>HTTPS</strong>, Wireshark only sees the TLS record layer -- encrypted byte sequences that are computationally infeasible to decrypt without the session keys. The only visible metadata is the server IP, port, and the SNI (Server Name Indication) field in the Client Hello.</p>
            <p style={{ marginTop: 8 }}>This is why HTTPS matters: even on untrusted networks (public Wi-Fi, compromised routers), your data remains confidential and tamper-proof.</p>
          </InfoPanel>
        </div>
      )}
    </>
  )
}
