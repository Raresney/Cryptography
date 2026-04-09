import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <>
      <div className="page-header">
        <h2>Welcome to CryptoLab</h2>
        <p>Interactive cryptography toolkit — encrypt, hash, explore SSL/TLS, and visualize algorithms.</p>
      </div>

      <div className="home-grid">
        <Link to="/crypto" className="home-card">
          <div className="card-icon">&#128274;</div>
          <h3>CryptoLab</h3>
          <p>Encrypt and decrypt text using AES, DES, and explore RSA key pair generation with real-time output.</p>
          <div className="card-tags">
            <span className="tag tag-green">AES</span>
            <span className="tag tag-cyan">DES</span>
            <span className="tag tag-purple">RSA</span>
          </div>
        </Link>

        <Link to="/hash" className="home-card">
          <div className="card-icon">&#128256;</div>
          <h3>HashLab</h3>
          <p>Generate MD5, SHA-1, SHA-256, SHA-512 hashes. Compare hashes and see how a single character changes everything.</p>
          <div className="card-tags">
            <span className="tag tag-green">SHA-256</span>
            <span className="tag tag-cyan">MD5</span>
            <span className="tag tag-yellow">SHA-512</span>
          </div>
        </Link>

        <Link to="/ssl" className="home-card">
          <div className="card-icon">&#128737;</div>
          <h3>SSL/TLS Explorer</h3>
          <p>Visualize the TLS handshake, certificate chains, and learn the OpenSSL commands used in practice.</p>
          <div className="card-tags">
            <span className="tag tag-green">Easy-RSA</span>
            <span className="tag tag-purple">OpenSSL</span>
            <span className="tag tag-yellow">HTTPS</span>
          </div>
        </Link>

        <Link to="/algorithms" className="home-card">
          <div className="card-icon">&#9881;</div>
          <h3>Algorithm Visualizer</h3>
          <p>Step-by-step visualization of Caesar cipher, Hill cipher, AES rounds, and RSA encryption/decryption.</p>
          <div className="card-tags">
            <span className="tag tag-cyan">Caesar</span>
            <span className="tag tag-purple">Hill</span>
            <span className="tag tag-green">AES</span>
            <span className="tag tag-yellow">RSA</span>
          </div>
        </Link>

        <Link to="/quiz" className="home-card">
          <div className="card-icon">&#128218;</div>
          <h3>Quiz</h3>
          <p>Test your cryptography knowledge with 20 questions across beginner, intermediate, and advanced levels.</p>
          <div className="card-tags">
            <span className="tag tag-green">Beginner</span>
            <span className="tag tag-yellow">Intermediate</span>
            <span className="tag tag-purple">Advanced</span>
          </div>
        </Link>

        <Link to="/glossary" className="home-card">
          <div className="card-icon">&#128214;</div>
          <h3>Glossary</h3>
          <p>Searchable glossary of 30+ cryptography terms with definitions, categories, and related concepts.</p>
          <div className="card-tags">
            <span className="tag tag-cyan">30+ terms</span>
            <span className="tag tag-green">Searchable</span>
            <span className="tag tag-purple">Interactive</span>
          </div>
        </Link>
      </div>

    </>
  )
}
