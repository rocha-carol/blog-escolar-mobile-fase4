import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';
import { FaFont, FaArrowsAltV } from 'react-icons/fa';
import { MdAccessibility, MdRefresh } from 'react-icons/md';
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import NightModeToggle from './NightModeToggle';

const options = [
  { key: 'spacing', label: 'Espaçamento', icon: <FaArrowsAltV /> },
  { key: 'audio', label: 'Leitura por áudio', icon: <FaFont /> },
];

const AccessibilityBar: React.FC = () => {
    const { user, logout } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [isAccessOpen, setIsAccessOpen] = useState(false);

  const getIniciais = (nome?: string) => {
    const n = (nome ?? '').trim();
    if (!n) return '??';
    const partes = n.split(/\s+/).filter(Boolean);
    if (partes.length === 1) {
      const p = partes[0];
      const a = p.charAt(0);
      const b = p.charAt(1);
      return (a + (b || '')).toUpperCase();
    }
    const first = partes[0].charAt(0);
    const last = partes[partes.length - 1].charAt(0);
    return (first + last).toUpperCase();
  };

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

  const resetAll = () => {
    setSelected([]);
    setFontSize(1);
    setIsAccessOpen(false);
  };

  // (o flag de áudio é atualizado no useLayoutEffect acima)

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8, gap: 18, background: 'rgba(255,255,255,0.85)', boxShadow: '0 2px 16px #0001', borderRadius: 16, flexWrap: 'wrap', zIndex: 10, position: 'relative', minHeight: 56 }}>
      {/* Título à esquerda */}
      <Link to="/" aria-label="Voltar para a página inicial" style={{ textDecoration: 'none' }}>
        <span className="app-fun-font" style={{ fontWeight: 700, fontSize: '1.45rem', color: '#7c4dbe', marginLeft: 10, marginRight: 24, letterSpacing: 1, cursor: 'pointer' }}>
          Escola piloto
        </span>
      </Link>
      {/* Controles à direita (mantém A+ e A- à esquerda do bloco do usuário) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginLeft: 'auto', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <NightModeToggle />
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 600, color: '#7c4dbe', fontSize: '1.08rem', paddingRight: 6 }}>
            <span
              aria-label={`Usuário: ${user.nome}`}
              title={user.nome}
              style={{
                width: 34,
                height: 34,
                borderRadius: 999,
                background: '#7c4dbe',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: 0.5,
                boxShadow: '0 10px 20px rgba(124, 77, 190, 0.25)',
                flexShrink: 0,
              }}
            >
              {getIniciais(user.nome)}
            </span>
            {user.nome}
            <button onClick={logout} style={{ padding: '6px 16px', borderRadius: 8, background: '#e04d4d', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, marginLeft: 6 }}>
              Logout
            </button>
          </div>
        ) : (
          <div style={{ paddingRight: 6 }}>
            <a href="/login">
              <button style={{ padding: '8px 20px', borderRadius: 8, background: '#7c4dbe', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Login
              </button>
            </a>
          </div>
        )}
      </div>

      {/* Ícone de acessibilidade em modo flutuante */}
      <div style={{ position: 'fixed', right: 18, bottom: 18, zIndex: 3000 }}>
        <button
          style={{ padding: '10px', borderRadius: 50, background: '#fff', color: '#7c4dbe', border: '2px solid #7c4dbe', cursor: 'pointer', fontWeight: 600, fontSize: 22, boxShadow: '0 2px 8px #7c4dbe22', transition: 'background 0.2s, color 0.2s', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => {
            setIsAccessOpen(o => !o);
          }}
          onMouseOver={e => { e.currentTarget.style.background = '#7c4dbe'; e.currentTarget.style.color = '#fff'; }}
          onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#7c4dbe'; }}
          aria-haspopup="menu"
          aria-expanded={isAccessOpen}
          aria-label="Acessibilidade"
        >
            <MdAccessibility style={{ fontSize: 28 }} />
          </button>
        {isAccessOpen && (
          <div
            role="menu"
            style={{
              position: 'absolute',
              right: 0,
              bottom: 52,
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: 16,
              boxShadow: '0 4px 24px #0002',
              minWidth: 240,
              zIndex: 3001,
              color: '#111',
              padding: 0,
              transition: 'box-shadow 0.2s',
              overflow: 'hidden',
            }}
          >
            {/* Itens de fonte (igual referência) */}
            <button
              role="menuitem"
              onClick={() => setFontSize(f => Math.min(f + 0.3, 2))}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer', background: 'transparent', border: 'none', textAlign: 'left', fontWeight: 600, fontSize: 16, color: '#111' }}
            >
              <AiOutlinePlus style={{ fontSize: 20, color: '#4b1f73' }} />
              Aumentar fonte
            </button>
            <div style={{ height: 1, background: '#e8e8ee' }} />
            <button
              role="menuitem"
              onClick={() => setFontSize(f => Math.max(f - 0.3, 0.7))}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer', background: 'transparent', border: 'none', textAlign: 'left', fontWeight: 600, fontSize: 16, color: '#111' }}
            >
              <AiOutlineMinus style={{ fontSize: 20, color: '#4b1f73' }} />
              Diminuir fonte
            </button>
            <div style={{ height: 1, background: '#e8e8ee' }} />

            {/* Alternâncias (igual referência) */}
            {options.slice(0, 3).map(opt => {
              const active = selected.includes(opt.key);
              return (
                <React.Fragment key={opt.key}>
                  <button
                    role="menuitemcheckbox"
                    aria-checked={active}
                    onClick={() => toggleOption(opt.key)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer', background: active ? 'rgba(124, 77, 190, 0.10)' : 'transparent', border: 'none', textAlign: 'left', fontWeight: 600, fontSize: 16, color: '#111' }}
                  >
                    <span style={{ width: 22, display: 'inline-flex', justifyContent: 'center', color: '#4b1f73', fontSize: 18 }}>
                      {opt.icon}
                    </span>
                    <span style={{ flex: 1 }}>{opt.label}</span>
                    <span style={{ width: 18, textAlign: 'right', color: active ? '#4b1f73' : '#999', fontWeight: 900 }}>{active ? '✓' : ''}</span>
                  </button>
                  <div style={{ height: 1, background: '#e8e8ee' }} />
                </React.Fragment>
              );
            })}

            {/* Ações (igual referência) */}
            <button
              role="menuitem"
              onClick={() => setFontSize(1)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer', background: 'transparent', border: 'none', textAlign: 'left', fontWeight: 600, fontSize: 16, color: '#111' }}
            >
              <span style={{ width: 22, display: 'inline-flex', justifyContent: 'center', color: '#4b1f73', fontSize: 18 }}>
                <FaFont />
              </span>
              Fonte regular
            </button>

            {/* Extras do projeto (mantidos) */}
            <div style={{ height: 1, background: '#d8d8e2' }} />
            {options.slice(3).map((opt, idx, arr) => {
              const active = selected.includes(opt.key);
              return (
                <React.Fragment key={opt.key}>
                  <button
                    role="menuitemcheckbox"
                    aria-checked={active}
                    onClick={() => toggleOption(opt.key)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer', background: active ? 'rgba(124, 77, 190, 0.10)' : 'transparent', border: 'none', textAlign: 'left', fontWeight: 600, fontSize: 16, color: '#111' }}
                  >
                    <span style={{ width: 22, display: 'inline-flex', justifyContent: 'center', color: '#4b1f73', fontSize: 18 }}>
                      {opt.icon}
                    </span>
                    <span style={{ flex: 1 }}>{opt.label}</span>
                    <span style={{ width: 18, textAlign: 'right', color: active ? '#4b1f73' : '#999', fontWeight: 900 }}>{active ? '✓' : ''}</span>
                  </button>
                  {idx < arr.length - 1 && <div style={{ height: 1, background: '#e8e8ee' }} />}
                </React.Fragment>
              );
            })}

            {/* Redefinir por último */}
            <div style={{ height: 1, background: '#d8d8e2' }} />
            <button
              role="menuitem"
              onClick={resetAll}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer', background: 'transparent', border: 'none', textAlign: 'left', fontWeight: 700, fontSize: 16, color: '#111' }}
            >
              <span style={{ width: 22, display: 'inline-flex', justifyContent: 'center', color: '#4b1f73', fontSize: 18 }}>
                <MdRefresh />
              </span>
              Redefinir
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessibilityBar;
