import { useState } from 'react'

const CERT_CHAIN = [
  { name: 'Root CA', icon: '\u{1F6E1}', color: 'var(--red)', desc: 'Self-signed certificate authority. Trusted by the OS/browser.' },
  { name: 'Intermediate CA', icon: '\u{1F517}', color: 'var(--yellow)', desc: 'Signed by Root CA. Signs server certificates.' },
  { name: 'Server Certificate', icon: '\u{1F512}', color: 'var(--green)', desc: 'Signed by Intermediate CA. Used by nginx/Apache for HTTPS.' },
]

const TLS_STEPS = [
  { title: 'Client Hello', desc: 'Browser sends supported TLS versions, cipher suites, and a random number.', side: 'client' },
  { title: 'Server Hello', desc: 'Server selects TLS version, cipher suite, and sends its certificate.', side: 'server' },
  { title: 'Certificate Verify', desc: 'Browser validates the certificate chain up to a trusted Root CA.', side: 'client' },
  { title: 'Key Exchange', desc: 'Both sides generate a shared secret using Diffie-Hellman or RSA key exchange.', side: 'both' },
  { title: 'Encrypted Session', desc: 'All traffic is now encrypted with the shared symmetric key (AES).', side: 'both' },
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

export default function SSLExplorer() {
  const [activeCmd, setActiveCmd] = useState(0)

  return (
    <>
      <div className="page-header">
        <h2>SSL/TLS Explorer</h2>
        <p>Visualize certificate chains, TLS handshake, and practical OpenSSL commands</p>
      </div>

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
      </div>

      <div className="card">
        <h3>&#128259; TLS Handshake</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
          {TLS_STEPS.map((step, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: 16,
              alignItems: 'center',
              padding: '12px 16px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: 8,
            }}>
              <div className="step-number">{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'var(--text-bright)', fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
                  {step.title}
                </div>
                <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>{step.desc}</div>
              </div>
              <span className={`tag ${step.side === 'client' ? 'tag-cyan' : step.side === 'server' ? 'tag-purple' : 'tag-green'}`}>
                {step.side}
              </span>
            </div>
          ))}
        </div>
      </div>

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
          </div>
          <div className="terminal-body">
            {OPENSSL_COMMANDS[activeCmd].commands}
          </div>
        </div>
      </div>

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
      </div>
    </>
  )
}
