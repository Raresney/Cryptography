import { useState, useMemo } from 'react';
import DifficultySelector from '../components/DifficultySelector';

const CATEGORY_TAG = {
  encryption: 'tag tag-green',
  hashing: 'tag tag-cyan',
  protocol: 'tag tag-yellow',
  concept: 'tag tag-purple',
};

const DIFFICULTY_TAG = {
  beginner: 'tag tag-green',
  intermediate: 'tag tag-yellow',
  advanced: 'tag tag-purple',
};

const TERMS = [
  {
    term: 'AES',
    category: 'encryption',
    difficulty: 'beginner',
    short: 'Advanced Encryption Standard -- the most widely used symmetric block cipher.',
    long: 'AES encrypts data in 128-bit blocks using keys of 128, 192, or 256 bits. It was adopted by NIST in 2001 to replace DES and is used everywhere from TLS to disk encryption.',
    related: ['Block Cipher', 'CBC', 'GCM', 'DES'],
  },
  {
    term: 'Asymmetric Encryption',
    category: 'encryption',
    difficulty: 'beginner',
    short: 'Encryption using a public/private key pair.',
    long: 'Also called public-key cryptography. One key encrypts, the other decrypts. The public key can be shared openly while the private key must remain secret. RSA and ECC are common examples.',
    related: ['RSA', 'Key Exchange', 'PKI', 'Symmetric Encryption'],
  },
  {
    term: 'Avalanche Effect',
    category: 'concept',
    difficulty: 'advanced',
    short: 'A small input change causes a drastic change in output.',
    long: 'A desirable property where flipping a single bit of input changes roughly half the output bits. This ensures that similar inputs produce completely unrelated outputs, making cryptanalysis harder.',
    related: ['Hash', 'AES', 'Block Cipher'],
  },
  {
    term: 'Block Cipher',
    category: 'encryption',
    difficulty: 'intermediate',
    short: 'Encrypts data in fixed-size blocks (e.g., 128 bits).',
    long: 'A block cipher processes plaintext in chunks of a fixed size. AES uses 128-bit blocks. Modes of operation (CBC, CTR, GCM) define how multiple blocks are chained together for messages longer than one block.',
    related: ['AES', 'CBC', 'GCM', 'Stream Cipher', 'Padding'],
  },
  {
    term: 'Brute Force',
    category: 'concept',
    difficulty: 'beginner',
    short: 'Trying every possible key or password until the correct one is found.',
    long: 'A brute-force attack systematically checks all possible keys. Protection comes from large key spaces: a 256-bit key has 2^256 possibilities, making brute force computationally infeasible with current technology.',
    related: ['Entropy', 'AES', 'DES'],
  },
  {
    term: 'CA (Certificate Authority)',
    category: 'protocol',
    difficulty: 'intermediate',
    short: 'A trusted entity that issues digital certificates.',
    long: 'A CA verifies the identity of certificate applicants and signs their certificates. Browsers and operating systems ship with a set of trusted root CAs. Examples include Let\'s Encrypt, DigiCert, and Comodo.',
    related: ['Certificate', 'PKI', 'TLS', 'Handshake'],
  },
  {
    term: 'CBC',
    category: 'encryption',
    difficulty: 'intermediate',
    short: 'Cipher Block Chaining -- a block cipher mode that chains blocks together.',
    long: 'In CBC mode, each plaintext block is XORed with the previous ciphertext block before encryption. An IV randomizes the first block. CBC provides confidentiality but not built-in authentication, unlike GCM.',
    related: ['Block Cipher', 'AES', 'IV', 'GCM', 'Padding'],
  },
  {
    term: 'Certificate',
    category: 'protocol',
    difficulty: 'intermediate',
    short: 'A digital document binding a public key to an identity.',
    long: 'An X.509 certificate contains the subject\'s public key, identity information, validity period, and the CA\'s digital signature. Browsers use certificates to verify website identities during TLS handshakes.',
    related: ['CA (Certificate Authority)', 'PKI', 'TLS', 'Asymmetric Encryption'],
  },
  {
    term: 'Cipher',
    category: 'concept',
    difficulty: 'beginner',
    short: 'An algorithm for encrypting and decrypting data.',
    long: 'A cipher transforms plaintext into ciphertext (encryption) and back (decryption) using a key. Ciphers can be symmetric (AES, DES) or asymmetric (RSA). Historical ciphers include the Caesar cipher and Vigenere cipher.',
    related: ['AES', 'RSA', 'Plaintext', 'Ciphertext'],
  },
  {
    term: 'Ciphertext',
    category: 'concept',
    difficulty: 'beginner',
    short: 'The encrypted (unreadable) form of a message.',
    long: 'Ciphertext is produced by applying an encryption algorithm and key to plaintext. Without the correct key, ciphertext should be indistinguishable from random data. Decryption reverses the process to recover the plaintext.',
    related: ['Plaintext', 'Cipher', 'AES'],
  },
  {
    term: 'DES',
    category: 'encryption',
    difficulty: 'intermediate',
    short: 'Data Encryption Standard -- a legacy 56-bit symmetric cipher.',
    long: 'DES was the dominant symmetric cipher from the 1970s until the late 1990s. Its 56-bit key is now considered insecure due to brute-force feasibility. Triple DES (3DES) extended its life, but AES has replaced both.',
    related: ['AES', 'Block Cipher', 'Symmetric Encryption', 'Brute Force'],
  },
  {
    term: 'Diffie-Hellman',
    category: 'protocol',
    difficulty: 'intermediate',
    short: 'A key exchange protocol for establishing a shared secret over an insecure channel.',
    long: 'Diffie-Hellman allows two parties to agree on a shared secret without ever transmitting it. Security relies on the discrete logarithm problem. Modern variants (ECDHE) provide forward secrecy in TLS.',
    related: ['Key Exchange', 'TLS', 'Asymmetric Encryption', 'Entropy'],
  },
  {
    term: 'Entropy',
    category: 'concept',
    difficulty: 'advanced',
    short: 'A measure of randomness or unpredictability in data.',
    long: 'In cryptography, entropy quantifies how unpredictable a key or password is. Higher entropy means more possible values and greater resistance to brute force. A truly random 256-bit key has 256 bits of entropy.',
    related: ['Brute Force', 'Nonce', 'Salt'],
  },
  {
    term: 'GCM',
    category: 'encryption',
    difficulty: 'advanced',
    short: 'Galois/Counter Mode -- authenticated encryption mode for block ciphers.',
    long: 'GCM combines CTR-mode encryption with Galois-field authentication. It provides both confidentiality and integrity (AEAD) in a single pass, making it faster and more secure than CBC + separate HMAC. AES-GCM is the standard in TLS 1.3.',
    related: ['AES', 'Block Cipher', 'CBC', 'HMAC', 'Nonce'],
  },
  {
    term: 'Handshake',
    category: 'protocol',
    difficulty: 'intermediate',
    short: 'The initial negotiation phase of a TLS/SSL connection.',
    long: 'During the TLS handshake, client and server agree on cipher suites, authenticate via certificates, and perform key exchange to derive session keys. TLS 1.3 reduced the handshake to a single round trip.',
    related: ['TLS', 'SSL', 'Certificate', 'Key Exchange', 'Diffie-Hellman'],
  },
  {
    term: 'Hash',
    category: 'hashing',
    difficulty: 'beginner',
    short: 'A one-way function producing a fixed-size fingerprint of data.',
    long: 'Cryptographic hash functions (SHA-256, SHA-3, BLAKE2) produce a deterministic, fixed-length output from any input. They are one-way (cannot reverse), collision-resistant, and exhibit the avalanche effect.',
    related: ['SHA', 'HMAC', 'Salt', 'Avalanche Effect'],
  },
  {
    term: 'HMAC',
    category: 'hashing',
    difficulty: 'intermediate',
    short: 'Hash-based Message Authentication Code -- verifies integrity and authenticity.',
    long: 'HMAC combines a hash function with a secret key: HMAC(K, m) = H((K XOR opad) || H((K XOR ipad) || m)). It ensures that a message has not been tampered with and was sent by someone holding the secret key.',
    related: ['Hash', 'SHA', 'GCM', 'TLS'],
  },
  {
    term: 'IV (Initialization Vector)',
    category: 'concept',
    difficulty: 'intermediate',
    short: 'A random value used to ensure unique ciphertext for identical plaintexts.',
    long: 'An IV is prepended to encryption to add randomness. In CBC mode, the IV must be unpredictable; in CTR/GCM, it must be unique (nonce). Reusing an IV with the same key can catastrophically compromise security.',
    related: ['CBC', 'GCM', 'Nonce', 'Block Cipher'],
  },
  {
    term: 'Key Exchange',
    category: 'protocol',
    difficulty: 'intermediate',
    short: 'A method for two parties to securely agree on a shared cryptographic key.',
    long: 'Key exchange protocols allow parties to derive a shared secret over an untrusted channel. Diffie-Hellman and ECDHE are the most common. In TLS, ephemeral key exchange provides forward secrecy.',
    related: ['Diffie-Hellman', 'TLS', 'Asymmetric Encryption', 'Handshake'],
  },
  {
    term: 'Nonce',
    category: 'concept',
    difficulty: 'advanced',
    short: 'A number used once to prevent replay attacks and ensure unique ciphertexts.',
    long: 'A nonce must never be reused with the same key. In AES-GCM, the nonce is typically 96 bits. Nonce reuse with the same key can allow an attacker to XOR ciphertexts together, leaking plaintext information.',
    related: ['IV (Initialization Vector)', 'GCM', 'Salt'],
  },
  {
    term: 'Padding',
    category: 'concept',
    difficulty: 'advanced',
    short: 'Extra bytes added to make plaintext fit the block size.',
    long: 'Block ciphers require input to be a multiple of the block size. PKCS#7 padding fills remaining bytes with the count of padding bytes (e.g., 5 bytes of 0x05). Improper padding validation led to the padding oracle attack.',
    related: ['Block Cipher', 'CBC', 'AES'],
  },
  {
    term: 'PKI (Public Key Infrastructure)',
    category: 'protocol',
    difficulty: 'advanced',
    short: 'The framework of CAs, certificates, and policies that manage public keys.',
    long: 'PKI provides the trust hierarchy for the internet. Root CAs sign intermediate CAs, which sign end-entity certificates. Revocation is handled via CRLs and OCSP. PKI underpins TLS, code signing, and email encryption.',
    related: ['CA (Certificate Authority)', 'Certificate', 'TLS', 'Asymmetric Encryption'],
  },
  {
    term: 'Plaintext',
    category: 'concept',
    difficulty: 'beginner',
    short: 'The original, readable form of data before encryption.',
    long: 'Plaintext is the input to an encryption algorithm. After encryption it becomes ciphertext. The goal of cryptography is to protect plaintext confidentiality so only authorized parties can recover it.',
    related: ['Ciphertext', 'Cipher', 'AES'],
  },
  {
    term: 'RSA',
    category: 'encryption',
    difficulty: 'beginner',
    short: 'A widely used asymmetric encryption algorithm based on prime factorization.',
    long: 'RSA (Rivest-Shamir-Adleman) uses the difficulty of factoring large semiprimes for security. Key sizes are typically 2048 or 4096 bits. RSA can encrypt data and create digital signatures, though ECC is increasingly preferred for performance.',
    related: ['Asymmetric Encryption', 'PKI', 'Certificate', 'Key Exchange'],
  },
  {
    term: 'SHA',
    category: 'hashing',
    difficulty: 'beginner',
    short: 'Secure Hash Algorithm -- a family of cryptographic hash functions.',
    long: 'SHA-1 (160-bit, deprecated), SHA-256 and SHA-512 (SHA-2 family), and SHA-3 are NIST standards. SHA-256 is used in TLS, Bitcoin, and certificate signing. SHA-3 uses a different internal structure (Keccak sponge).',
    related: ['Hash', 'HMAC', 'Avalanche Effect'],
  },
  {
    term: 'Salt',
    category: 'hashing',
    difficulty: 'intermediate',
    short: 'Random data added to a password before hashing to prevent rainbow table attacks.',
    long: 'A unique salt is generated for each password and stored alongside the hash. This ensures identical passwords produce different hashes, defeating precomputed lookup tables. Salts should be at least 16 bytes of cryptographic randomness.',
    related: ['Hash', 'Nonce', 'Brute Force', 'Entropy'],
  },
  {
    term: 'SSL',
    category: 'protocol',
    difficulty: 'beginner',
    short: 'Secure Sockets Layer -- the predecessor to TLS.',
    long: 'SSL was developed by Netscape in the 1990s. SSL 3.0 was deprecated in 2015 due to the POODLE vulnerability. All modern "SSL" connections actually use TLS, but the term "SSL" persists colloquially.',
    related: ['TLS', 'Handshake', 'Certificate'],
  },
  {
    term: 'Stream Cipher',
    category: 'encryption',
    difficulty: 'advanced',
    short: 'Encrypts data one bit or byte at a time using a keystream.',
    long: 'A stream cipher generates a pseudo-random keystream that is XORed with the plaintext. Examples include RC4 (deprecated) and ChaCha20. Stream ciphers are often faster than block ciphers for streaming data.',
    related: ['Block Cipher', 'Nonce', 'Cipher'],
  },
  {
    term: 'Symmetric Encryption',
    category: 'encryption',
    difficulty: 'beginner',
    short: 'Encryption where the same key is used to encrypt and decrypt.',
    long: 'Symmetric algorithms are fast and efficient, suitable for bulk data encryption. The main challenge is key distribution: both parties must share the secret key securely. AES, ChaCha20, and DES are symmetric ciphers.',
    related: ['AES', 'DES', 'Asymmetric Encryption', 'Key Exchange'],
  },
  {
    term: 'TLS',
    category: 'protocol',
    difficulty: 'beginner',
    short: 'Transport Layer Security -- the protocol securing internet communications.',
    long: 'TLS encrypts data in transit between clients and servers. TLS 1.3 (2018) removed legacy ciphers, reduced handshake latency to 1 round trip, and mandates forward secrecy via ephemeral key exchange.',
    related: ['SSL', 'Handshake', 'Certificate', 'Diffie-Hellman'],
  },
];

function Glossary() {
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const filtered = useMemo(() => {
    let list = TERMS;
    if (difficulty) {
      list = list.filter((t) => t.difficulty === difficulty);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.term.toLowerCase().includes(q) ||
          t.short.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => a.term.localeCompare(b.term));
  }, [search, difficulty]);

  // Group by first letter
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((t) => {
      const letter = t.term[0].toUpperCase();
      if (!map[letter]) map[letter] = [];
      map[letter].push(t);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const toggleExpand = (term) => {
    setExpanded((prev) => (prev === term ? null : term));
  };

  const handleRelatedClick = (relatedTerm) => {
    setSearch(relatedTerm);
    setExpanded(null);
    setDifficulty(null);
  };

  return (
    <div>
      <div className="page-header">
        <h1 style={{ color: 'var(--text-bright)', margin: 0 }}>
          <span style={{ color: 'var(--green)' }}>&#128214;</span> Cryptography Glossary
        </h1>
        <p style={{ color: 'var(--text-dim)', margin: '8px 0 0' }}>
          {filtered.length} terms &mdash; search, filter, and explore
        </p>
      </div>

      {/* Search + Difficulty */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '24px',
        }}
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search terms..."
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '10px 14px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text)',
            fontFamily: 'var(--mono)',
            fontSize: '14px',
            outline: 'none',
          }}
        />
        <div className="btn-group">
          <button
            className={`btn ${difficulty === null ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setDifficulty(null)}
          >
            All
          </button>
        </div>
        <DifficultySelector value={difficulty} onChange={(d) => setDifficulty(d === difficulty ? null : d)} />
      </div>

      {/* Grouped terms */}
      {grouped.length === 0 && (
        <div
          className="card"
          style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '40px' }}
        >
          No terms match your search.
        </div>
      )}

      {grouped.map(([letter, terms]) => (
        <div key={letter} style={{ marginBottom: '24px' }}>
          <h2
            style={{
              color: 'var(--cyan)',
              fontFamily: 'var(--mono)',
              fontSize: '20px',
              margin: '0 0 12px',
              paddingBottom: '4px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            {letter}
          </h2>

          <div className="grid-2">
            {terms.map((t) => {
              const isExpanded = expanded === t.term;
              return (
                <div
                  className="card"
                  key={t.term}
                  onClick={() => toggleExpand(t.term)}
                  style={{
                    cursor: 'pointer',
                    border: isExpanded
                      ? '1px solid var(--cyan)'
                      : '1px solid var(--border)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Header */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px',
                    }}
                  >
                    <h3
                      style={{
                        color: 'var(--text-bright)',
                        margin: 0,
                        fontFamily: 'var(--mono)',
                        fontSize: '15px',
                      }}
                    >
                      {t.term}
                    </h3>
                    <span
                      style={{
                        color: 'var(--text-dim)',
                        fontSize: '14px',
                        flexShrink: 0,
                        marginLeft: '8px',
                        transition: 'transform 0.2s ease',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    >
                      &#9660;
                    </span>
                  </div>

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span className={CATEGORY_TAG[t.category]}>{t.category}</span>
                    <span className={DIFFICULTY_TAG[t.difficulty]}>{t.difficulty}</span>
                  </div>

                  {/* Short definition */}
                  <p
                    style={{
                      color: 'var(--text-dim)',
                      fontSize: '13px',
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {t.short}
                  </p>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div
                      style={{
                        marginTop: '12px',
                        paddingTop: '12px',
                        borderTop: '1px solid var(--border)',
                      }}
                    >
                      <p
                        style={{
                          color: 'var(--text)',
                          fontSize: '13px',
                          margin: '0 0 12px',
                          lineHeight: 1.6,
                        }}
                      >
                        {t.long}
                      </p>

                      {t.related.length > 0 && (
                        <div>
                          <span
                            style={{
                              color: 'var(--text-dim)',
                              fontSize: '11px',
                              fontFamily: 'var(--mono)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                            }}
                          >
                            Related:
                          </span>
                          <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                            {t.related.map((r) => (
                              <button
                                key={r}
                                className="tag tag-cyan"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRelatedClick(r);
                                }}
                                style={{
                                  cursor: 'pointer',
                                  background: 'rgba(0,255,255,0.08)',
                                  border: '1px solid var(--cyan)',
                                }}
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Glossary;
