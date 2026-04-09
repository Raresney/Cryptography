import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { FiHome, FiLock, FiHash, FiShield, FiCpu, FiGithub, FiHelpCircle, FiBook } from 'react-icons/fi'
import ThemeToggle from './components/ThemeToggle'
import Home from './pages/Home'
import CryptoLab from './pages/CryptoLab'
import HashLab from './pages/HashLab'
import SSLExplorer from './pages/SSLExplorer'
import AlgorithmViz from './pages/AlgorithmViz'
import Quiz from './pages/Quiz'
import Glossary from './pages/Glossary'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <h1>Crypto<span>Lab</span></h1>
            <p>$ interactive cryptography</p>
          </div>
          <nav>
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <FiHome className="icon" /> Home
            </NavLink>
            <NavLink to="/crypto" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <FiLock className="icon" /> CryptoLab
            </NavLink>
            <NavLink to="/hash" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <FiHash className="icon" /> HashLab
            </NavLink>
            <NavLink to="/ssl" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <FiShield className="icon" /> SSL/TLS Explorer
            </NavLink>
            <NavLink to="/algorithms" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <FiCpu className="icon" /> Algorithm Visualizer
            </NavLink>
            <NavLink to="/quiz" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <FiHelpCircle className="icon" /> Quiz
            </NavLink>
            <NavLink to="/glossary" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <FiBook className="icon" /> Glossary
            </NavLink>
          </nav>
          <div className="sidebar-footer">
            <ThemeToggle />
            <a href="https://github.com/Raresney/Cryptography" target="_blank" rel="noreferrer">
              <FiGithub /> Raresney/Cryptography
            </a>
          </div>
        </aside>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/crypto" element={<CryptoLab />} />
            <Route path="/hash" element={<HashLab />} />
            <Route path="/ssl" element={<SSLExplorer />} />
            <Route path="/algorithms" element={<AlgorithmViz />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/glossary" element={<Glossary />} />
          </Routes>
          <footer className="footer">
            &copy; 2026 Bighiu Rares. All rights reserved.
          </footer>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
