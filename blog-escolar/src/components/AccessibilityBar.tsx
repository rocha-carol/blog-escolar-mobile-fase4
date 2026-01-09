import React, { useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import useAuth from '../hooks/useAuth';
import { FaFont, FaArrowsAltV } from 'react-icons/fa';
import { MdAccessibility } from 'react-icons/md';
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';
// ...existing code...
import NightModeToggle from './NightModeToggle';

const options = [
  { key: 'spacing', label: 'Espaçamento', icon: <FaArrowsAltV /> },
  { key: 'audio', label: 'Leitura por áudio', icon: <FaFont /> },
];

const AccessibilityBar: React.FC = () => {
    const { user, logout } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);

  const [fontSize, setFontSize] = React.useState(1);
  React.useEffect(() => {
    document.documentElement.style.fontSize = fontSize !== 1 ? `${fontSize}em` : '';
    document.body.style.letterSpacing = selected.includes('spacing') ? '0.12em' : '';
    document.body.style.wordSpacing = selected.includes('spacing') ? '0.18em' : '';
    return () => {
      document.documentElement.style.fontSize = '';
      document.body.style.letterSpacing = '';
      document.body.style.wordSpacing = '';
      document.body.classList.remove('night-mode');
    };
  }, [selected, fontSize]);

  const toggleOption = (key: string) => {
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  // Expor se áudio está habilitado
  window.__audioAccessibilityEnabled = selected.includes('audio');

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8, gap: 18, background: 'rgba(255,255,255,0.85)', boxShadow: '0 2px 16px #0001', borderRadius: 16, flexWrap: 'wrap', zIndex: 10, position: 'relative', minHeight: 56 }}>
      {/* Título à esquerda */}
      <span style={{ fontWeight: 700, fontSize: '1.45rem', color: '#111', marginLeft: 10, marginRight: 24, letterSpacing: 1 }}>Escola piloto</span>
      {user ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, color: '#7c4dbe', fontSize: '1.08rem', marginRight: 8 }}>
          <FaUserCircle style={{ fontSize: 24, color: '#7c4dbe', marginRight: 4 }} />
          {user.nome}
          <button onClick={logout} style={{ padding: '6px 16px', borderRadius: 8, background: '#e04d4d', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, marginLeft: 6 }}>
            Logout
          </button>
        </span>
      ) : (
        <a href="/login">
          <button style={{ padding: '8px 20px', borderRadius: 8, background: '#7c4dbe', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            Login
          </button>
        </a>
      )}
      <NightModeToggle />
      <button
        title="Aumentar fonte"
        onClick={() => setFontSize(f => Math.min(f + 0.3, 2))}
        style={{ padding: '10px 18px', borderRadius: 50, background: '#7c4dbe', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, fontSize: 22, boxShadow: '0 2px 8px #7c4dbe33', transition: 'background 0.2s, box-shadow 0.2s' }}
        onMouseOver={e => e.currentTarget.style.background = '#4dbec7'}
        onMouseOut={e => e.currentTarget.style.background = '#7c4dbe'}
      >
        <span style={{ fontWeight:700 }}>A</span><AiOutlinePlus />
      </button>
      <button
        title="Reduzir fonte"
        onClick={() => setFontSize(f => Math.max(f - 0.3, 0.7))}
        style={{ padding: '10px 18px', borderRadius: 50, background: '#7c4dbe', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, fontSize: 22, boxShadow: '0 2px 8px #7c4dbe33', transition: 'background 0.2s, box-shadow 0.2s' }}
        onMouseOver={e => e.currentTarget.style.background = '#4dbec7'}
        onMouseOut={e => e.currentTarget.style.background = '#7c4dbe'}
      >
        <span style={{ fontWeight:700 }}>A</span><AiOutlineMinus />
      </button>
      <div style={{ position: 'relative', marginLeft: 8 }}>
        <button
          style={{ padding: '10px', borderRadius: 50, background: '#fff', color: '#7c4dbe', border: '2px solid #7c4dbe', cursor: 'pointer', fontWeight: 600, fontSize: 22, boxShadow: '0 2px 8px #7c4dbe22', transition: 'background 0.2s, color 0.2s', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => {
            const dropdown = document.getElementById('access-dropdown');
            if (dropdown) dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
          }}
          onMouseOver={e => { e.currentTarget.style.background = '#7c4dbe'; e.currentTarget.style.color = '#fff'; }}
          onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#7c4dbe'; }}
        >
            <MdAccessibility style={{ fontSize: 28 }} />
          </button>
        <div id="access-dropdown" style={{ display: 'none', position: 'absolute', right: 0, top: 48, background: '#fff', border: '1px solid #ccc', borderRadius: 16, boxShadow: '0 4px 24px #0002', minWidth: 200, zIndex: 100, color: '#111', padding: '12px 0', transition: 'box-shadow 0.2s' }}>
          {options.map(opt => (
            <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', cursor: 'pointer', fontWeight: 500, fontSize: 17, borderRadius: 8, margin: '2px 0', transition: 'background 0.2s' }}>
              <input
                type="checkbox"
                checked={selected.includes(opt.key)}
                onChange={() => toggleOption(opt.key)}
                style={{ marginRight: 10, accentColor: '#7c4dbe', width: 18, height: 18 }}
              />
              <span style={{ fontSize: 22 }}>{opt.icon}</span> {opt.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccessibilityBar;
