import { useState, useMemo } from 'react';
import DifficultySelector from '../components/DifficultySelector';

const QUESTIONS = [
  // ── Beginner (7) ──
  {
    id: 1,
    difficulty: 'beginner',
    question: 'What does AES stand for?',
    options: [
      'Advanced Encryption Standard',
      'Automated Encryption System',
      'Advanced Electronic Security',
      'Applied Encryption Scheme',
    ],
    answer: 0,
    explanation:
      'AES stands for Advanced Encryption Standard. It was established by NIST in 2001 and is the most widely used symmetric encryption algorithm today.',
  },
  {
    id: 2,
    difficulty: 'beginner',
    question: 'Which type of encryption uses the same key for both encryption and decryption?',
    options: [
      'Asymmetric encryption',
      'Symmetric encryption',
      'Hashing',
      'Digital signatures',
    ],
    answer: 1,
    explanation:
      'Symmetric encryption uses one shared secret key for both encrypting and decrypting data. Examples include AES, DES, and ChaCha20.',
  },
  {
    id: 3,
    difficulty: 'beginner',
    question: 'What is the Caesar cipher?',
    options: [
      'A modern block cipher used in TLS',
      'A substitution cipher that shifts letters by a fixed number',
      'An asymmetric encryption algorithm',
      'A hash function used for password storage',
    ],
    answer: 1,
    explanation:
      'The Caesar cipher is one of the simplest and earliest known encryption techniques. It works by shifting each letter in the plaintext by a fixed number of positions in the alphabet.',
  },
  {
    id: 4,
    difficulty: 'beginner',
    question: 'What is the primary purpose of a hash function?',
    options: [
      'Encrypt data so it can be decrypted later',
      'Generate a fixed-size fingerprint of data that cannot be reversed',
      'Create a pair of public and private keys',
      'Establish a secure channel between two parties',
    ],
    answer: 1,
    explanation:
      'A hash function produces a fixed-length digest (fingerprint) from arbitrary input. It is a one-way function: you cannot recover the original data from the hash.',
  },
  {
    id: 5,
    difficulty: 'beginner',
    question: 'What does SSL stand for?',
    options: [
      'Secure Sockets Layer',
      'System Security Lock',
      'Standard Security Level',
      'Symmetric Security Link',
    ],
    answer: 0,
    explanation:
      'SSL stands for Secure Sockets Layer. It is the predecessor to TLS and was used to secure internet communications. Modern systems use TLS instead.',
  },
  {
    id: 6,
    difficulty: 'beginner',
    question: 'In RSA, which key is used to encrypt a message that only the recipient can read?',
    options: [
      "The sender's private key",
      "The recipient's public key",
      'A shared symmetric key',
      "The sender's public key",
    ],
    answer: 1,
    explanation:
      "In RSA, you encrypt with the recipient's public key. Only the recipient's corresponding private key can decrypt the message, ensuring confidentiality.",
  },
  {
    id: 7,
    difficulty: 'beginner',
    question: 'What is plaintext?',
    options: [
      'Encrypted data ready for transmission',
      'A type of cipher algorithm',
      'The original unencrypted data or message',
      'Output of a hash function',
    ],
    answer: 2,
    explanation:
      'Plaintext is the original readable data before encryption. After encryption, it becomes ciphertext.',
  },

  // ── Intermediate (7) ──
  {
    id: 8,
    difficulty: 'intermediate',
    question: 'What key sizes does AES support?',
    options: [
      '64, 128, 192 bits',
      '128, 192, 256 bits',
      '56, 128, 256 bits',
      '128, 256, 512 bits',
    ],
    answer: 1,
    explanation:
      'AES supports three key sizes: 128, 192, and 256 bits. Longer keys provide stronger security but require more computational resources.',
  },
  {
    id: 9,
    difficulty: 'intermediate',
    question: 'What is the purpose of an Initialization Vector (IV) in block cipher modes?',
    options: [
      'To make the key longer',
      'To ensure identical plaintexts produce different ciphertexts',
      'To verify the integrity of the message',
      'To compress the plaintext before encryption',
    ],
    answer: 1,
    explanation:
      'An IV adds randomness so that encrypting the same plaintext with the same key produces different ciphertexts each time, preventing pattern analysis.',
  },
  {
    id: 10,
    difficulty: 'intermediate',
    question: 'What is a digital certificate used for?',
    options: [
      'Encrypting files on disk',
      'Binding a public key to an identity, verified by a Certificate Authority',
      'Generating random numbers for cryptography',
      'Storing passwords securely',
    ],
    answer: 1,
    explanation:
      'A digital certificate (X.509) binds a public key to an entity (person, server, organization). A trusted Certificate Authority (CA) signs the certificate to vouch for this binding.',
  },
  {
    id: 11,
    difficulty: 'intermediate',
    question: 'Which TLS handshake step establishes the shared session key?',
    options: [
      'ClientHello',
      'Certificate verification',
      'Key exchange (e.g., ECDHE)',
      'ChangeCipherSpec',
    ],
    answer: 2,
    explanation:
      'During the key exchange phase (e.g., using ECDHE or DHE), client and server agree on a shared secret that is used to derive the symmetric session keys.',
  },
  {
    id: 12,
    difficulty: 'intermediate',
    question: 'What is a salt in the context of password hashing?',
    options: [
      'A secret key used to encrypt the hash',
      'Random data added to the password before hashing to prevent rainbow table attacks',
      'The final output of a hash function',
      'A type of symmetric cipher',
    ],
    answer: 1,
    explanation:
      'A salt is random data prepended or appended to the password before hashing. It ensures that identical passwords produce different hashes, defeating precomputed rainbow table attacks.',
  },
  {
    id: 13,
    difficulty: 'intermediate',
    question: 'What is the Diffie-Hellman key exchange used for?',
    options: [
      'Encrypting messages directly',
      'Signing digital documents',
      'Allowing two parties to establish a shared secret over an insecure channel',
      'Hashing passwords',
    ],
    answer: 2,
    explanation:
      'Diffie-Hellman allows two parties to jointly establish a shared secret over an insecure channel without transmitting the secret itself. It is foundational for modern key exchange in TLS.',
  },
  {
    id: 14,
    difficulty: 'intermediate',
    question: 'What is HMAC?',
    options: [
      'A block cipher mode of operation',
      'A hash-based message authentication code that verifies integrity and authenticity',
      'A key exchange algorithm',
      'An asymmetric encryption scheme',
    ],
    answer: 1,
    explanation:
      'HMAC (Hash-based Message Authentication Code) combines a cryptographic hash function with a secret key to provide both data integrity and authentication.',
  },

  // ── Advanced (6) ──
  {
    id: 15,
    difficulty: 'advanced',
    question: 'What is the avalanche effect in cryptography?',
    options: [
      'When encryption speed increases exponentially with key size',
      'A small change in input produces a drastically different output',
      'When multiple ciphertexts collide to the same hash',
      'The cascading failure of certificate chains',
    ],
    answer: 1,
    explanation:
      'The avalanche effect means that changing even a single bit of the input should cause roughly half the output bits to change. This is a desirable property in both hash functions and block ciphers.',
  },
  {
    id: 16,
    difficulty: 'advanced',
    question: 'In AES-GCM, what does GCM provide that CBC does not?',
    options: [
      'Larger block sizes',
      'Authenticated encryption (confidentiality + integrity)',
      'Key stretching',
      'Resistance to quantum attacks',
    ],
    answer: 1,
    explanation:
      'GCM (Galois/Counter Mode) provides authenticated encryption with associated data (AEAD). Unlike CBC, it guarantees both confidentiality and integrity/authenticity of the data.',
  },
  {
    id: 17,
    difficulty: 'advanced',
    question: 'What is the security assumption that RSA relies on?',
    options: [
      'The discrete logarithm problem',
      'The difficulty of factoring large semiprimes',
      'The hardness of the knapsack problem',
      'The collision resistance of SHA-256',
    ],
    answer: 1,
    explanation:
      'RSA security is based on the computational difficulty of factoring the product of two large prime numbers. Breaking RSA requires efficiently factoring these semiprimes.',
  },
  {
    id: 18,
    difficulty: 'advanced',
    question: 'What is a nonce and why must it never be reused with the same key?',
    options: [
      'A nonce is a password hash; reuse causes collisions',
      'A nonce is a number used once; reuse can leak plaintext via XOR of ciphertexts',
      'A nonce is a certificate field; reuse invalidates the chain',
      'A nonce is a key derivation parameter; reuse weakens the derived key slightly',
    ],
    answer: 1,
    explanation:
      'A nonce (number used once) ensures unique ciphertext. In stream ciphers and CTR mode, reusing a nonce with the same key allows an attacker to XOR two ciphertexts together, revealing plaintext information.',
  },
  {
    id: 19,
    difficulty: 'advanced',
    question: 'What is forward secrecy (perfect forward secrecy)?',
    options: [
      'Ensuring old messages cannot be decrypted even if the server\'s long-term private key is compromised',
      'Encrypting messages twice for extra security',
      'Using a different hash algorithm for each session',
      'Storing keys in hardware security modules',
    ],
    answer: 0,
    explanation:
      'Forward secrecy ensures that session keys are not compromised even if the server\'s long-term private key is later exposed. This is achieved by using ephemeral Diffie-Hellman key exchange (DHE/ECDHE) for each session.',
  },
  {
    id: 20,
    difficulty: 'advanced',
    question: 'In PKCS#7 padding, how is a 16-byte block padded when the last block has 11 bytes of data?',
    options: [
      'Five bytes of 0x00 are appended',
      'Five bytes of 0x05 are appended',
      'Five random bytes are appended',
      'The block is left as-is with no padding',
    ],
    answer: 1,
    explanation:
      'PKCS#7 padding fills the remaining bytes with the value equal to the number of padding bytes needed. With 11 data bytes in a 16-byte block, 5 bytes remain, so each is set to 0x05.',
  },
];

const DIFFICULTY_COLORS = {
  beginner: 'var(--green)',
  intermediate: 'var(--yellow)',
  advanced: 'var(--purple)',
};

const TAG_CLASS = {
  beginner: 'tag tag-green',
  intermediate: 'tag tag-yellow',
  advanced: 'tag tag-purple',
};

function Quiz() {
  const [difficulty, setDifficulty] = useState('beginner');
  const [answers, setAnswers] = useState({});
  const [showSummary, setShowSummary] = useState(false);

  const filtered = useMemo(
    () => QUESTIONS.filter((q) => q.difficulty === difficulty),
    [difficulty]
  );

  const answered = filtered.filter((q) => answers[q.id] !== undefined);
  const correct = filtered.filter(
    (q) => answers[q.id] !== undefined && answers[q.id] === q.answer
  );
  const allDone = answered.length === filtered.length && filtered.length > 0;
  const progress = filtered.length ? (answered.length / filtered.length) * 100 : 0;

  const handleSelect = (questionId, optionIndex) => {
    if (answers[questionId] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleReset = () => {
    setAnswers({});
    setShowSummary(false);
  };

  const handleChangeDifficulty = (d) => {
    setDifficulty(d);
    setShowSummary(false);
  };

  const wrongQuestions = filtered.filter(
    (q) => answers[q.id] !== undefined && answers[q.id] !== q.answer
  );

  return (
    <div>
      <div className="page-header">
        <h1 style={{ color: 'var(--text-bright)', margin: 0 }}>
          <span style={{ color: 'var(--cyan)' }}>&#128218;</span> Cryptography Quiz
        </h1>
        <p style={{ color: 'var(--text-dim)', margin: '8px 0 0' }}>
          Test your knowledge of cryptographic concepts
        </p>
      </div>

      {/* Difficulty selector + score */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <DifficultySelector value={difficulty} onChange={handleChangeDifficulty} />
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: '14px',
              color: 'var(--text-bright)',
            }}
          >
            {correct.length}/{filtered.length} correct
          </span>
          <button className="btn btn-secondary" onClick={handleReset}>
            Reset Quiz
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: '100%',
          height: '6px',
          background: 'var(--bg-secondary)',
          borderRadius: '3px',
          marginBottom: '24px',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: `linear-gradient(90deg, var(--cyan), ${DIFFICULTY_COLORS[difficulty]})`,
            borderRadius: '3px',
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      {/* Questions */}
      {!showSummary &&
        filtered.map((q, idx) => {
          const userAnswer = answers[q.id];
          const isAnswered = userAnswer !== undefined;
          const isCorrect = userAnswer === q.answer;

          return (
            <div
              className="card"
              key={q.id}
              style={{
                marginBottom: '16px',
                border: isAnswered
                  ? `1px solid ${isCorrect ? 'var(--green)' : 'var(--red)'}`
                  : '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px',
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
                  Q{idx + 1}. {q.question}
                </h3>
                <span className={TAG_CLASS[q.difficulty]} style={{ flexShrink: 0, marginLeft: '12px' }}>
                  {q.difficulty}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {q.options.map((opt, oi) => {
                  const letter = String.fromCharCode(65 + oi);
                  let bg = 'var(--bg-secondary)';
                  let borderColor = 'var(--border)';
                  let textColor = 'var(--text)';

                  if (isAnswered) {
                    if (oi === q.answer) {
                      bg = 'rgba(0,255,136,0.1)';
                      borderColor = 'var(--green)';
                      textColor = 'var(--green)';
                    } else if (oi === userAnswer && !isCorrect) {
                      bg = 'rgba(255,85,85,0.1)';
                      borderColor = 'var(--red)';
                      textColor = 'var(--red)';
                    }
                  }

                  return (
                    <button
                      key={oi}
                      onClick={() => handleSelect(q.id, oi)}
                      disabled={isAnswered}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 14px',
                        background: bg,
                        border: `1px solid ${borderColor}`,
                        borderRadius: '6px',
                        color: textColor,
                        fontFamily: 'var(--mono)',
                        fontSize: '13px',
                        cursor: isAnswered ? 'default' : 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        opacity: isAnswered && oi !== q.answer && oi !== userAnswer ? 0.5 : 1,
                      }}
                    >
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          border: `1px solid ${borderColor}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        {letter}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '10px 14px',
                    background: isCorrect
                      ? 'rgba(0,255,136,0.06)'
                      : 'rgba(255,85,85,0.06)',
                    borderRadius: '6px',
                    borderLeft: `3px solid ${isCorrect ? 'var(--green)' : 'var(--red)'}`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: isCorrect ? 'var(--green)' : 'var(--red)',
                    }}
                  >
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </span>
                  <p
                    style={{
                      color: 'var(--text-dim)',
                      fontSize: '13px',
                      margin: '6px 0 0',
                      lineHeight: 1.5,
                    }}
                  >
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}

      {/* Show summary button */}
      {allDone && !showSummary && (
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button className="btn btn-primary" onClick={() => setShowSummary(true)}>
            View Summary
          </button>
        </div>
      )}

      {/* Summary */}
      {showSummary && (
        <div className="card" style={{ border: '1px solid var(--cyan)' }}>
          <h2
            style={{
              color: 'var(--text-bright)',
              margin: '0 0 16px',
              fontFamily: 'var(--mono)',
            }}
          >
            Quiz Summary
          </h2>

          <div
            style={{
              display: 'flex',
              gap: '24px',
              marginBottom: '20px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 700,
                  color: 'var(--cyan)',
                  fontFamily: 'var(--mono)',
                }}
              >
                {correct.length}/{filtered.length}
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Score</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '36px',
                  fontWeight: 700,
                  color:
                    correct.length / filtered.length >= 0.7
                      ? 'var(--green)'
                      : 'var(--red)',
                  fontFamily: 'var(--mono)',
                }}
              >
                {Math.round((correct.length / filtered.length) * 100)}%
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Accuracy</div>
            </div>
          </div>

          {wrongQuestions.length > 0 && (
            <>
              <h3
                style={{
                  color: 'var(--red)',
                  fontFamily: 'var(--mono)',
                  fontSize: '14px',
                  margin: '0 0 12px',
                }}
              >
                Questions you got wrong:
              </h3>
              {wrongQuestions.map((q) => (
                <div
                  key={q.id}
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(255,85,85,0.06)',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    borderLeft: '3px solid var(--red)',
                  }}
                >
                  <p
                    style={{
                      color: 'var(--text-bright)',
                      margin: '0 0 4px',
                      fontSize: '13px',
                      fontFamily: 'var(--mono)',
                    }}
                  >
                    {q.question}
                  </p>
                  <p style={{ color: 'var(--green)', margin: 0, fontSize: '12px' }}>
                    Correct answer: {q.options[q.answer]}
                  </p>
                </div>
              ))}
            </>
          )}

          {wrongQuestions.length === 0 && (
            <p style={{ color: 'var(--green)', fontFamily: 'var(--mono)', fontSize: '14px' }}>
              Perfect score! You got every question right.
            </p>
          )}

          <div style={{ marginTop: '20px' }}>
            <button className="btn btn-primary" onClick={handleReset}>
              Retake Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Quiz;
