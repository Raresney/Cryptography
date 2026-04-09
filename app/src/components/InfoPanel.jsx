import { useState, useRef, useEffect } from 'react';

function InfoPanel({ title, children }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [children, open]);

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: '8px',
        overflow: 'hidden',
        marginTop: '12px',
      }}
    >
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          background: 'var(--bg-secondary)',
          border: 'none',
          color: 'var(--cyan)',
          fontFamily: 'var(--mono)',
          fontSize: '13px',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--bg-card)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--bg-secondary)';
        }}
      >
        <span
          style={{
            display: 'inline-block',
            transition: 'transform 0.2s ease',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
          }}
        >
          &#9654;
        </span>
        <span>{'\u2139'} {title || 'How it works?'}</span>
      </button>
      <div
        style={{
          maxHeight: open ? `${height}px` : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
        }}
      >
        <div
          ref={contentRef}
          style={{
            padding: '14px',
            background: 'var(--bg-input)',
            color: 'var(--text)',
            fontFamily: 'var(--mono)',
            fontSize: '13px',
            lineHeight: '1.6',
            borderTop: '1px solid var(--border)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default InfoPanel;
