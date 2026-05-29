import { useState, useEffect } from 'react';
import { fetchReportTypes, submitReport, fetchReports, fetchGraphData } from '../../utils/api';

const ANIM_STYLE = `
@keyframes reportFadeUp {
  0% { opacity: 0; transform: translateY(12px); }
  100% { opacity: 1; transform: translateY(0); }
}
.report-feed-item {
  animation: reportFadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
}
`;

export default function ReportPanel({ user }) {
  const [reportTypes, setReportTypes] = useState({});
  const [edges, setEdges] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [reports, setReports] = useState([]);
  const [form, setForm] = useState({ edgeId: '', type: 'ROBO', description: '' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReportTypes().then(setReportTypes).catch(() => {});
    fetchGraphData().then((d) => { setEdges(d.edges || []); setNodes(d.nodes || []); }).catch(() => {});
    loadReports();
  }, []);

  const loadReports = () => { fetchReports().then(setReports).catch(() => {}); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.edgeId || !form.type) { setError('Selecciona calle y tipo'); return; }
    if (!user) { setError('Inicia sesión para reportar'); return; }
    setError('');
    try {
      const r = await submitReport({ ...form, username: user.username });
      if (r.error) { setError(r.error); } else {
        setSubmitted(true);
        setForm({ edgeId: '', type: 'ROBO', description: '' });
        loadReports();
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch { setError('Error de conexión'); }
  };

  const getEdgeLabel = (e) => {
    const fn = nodes.find(n => n.id === e.from);
    const tn = nodes.find(n => n.id === e.to);
    return e.name || `${fn?.name || e.from} → ${tn?.name || e.to}`;
  };

  const recent = [...reports].reverse();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, overflow: 'hidden' }}>
      <style>{ANIM_STYLE}</style>
      <div>
        <span className="eyebrow">Reportes Ciudadanos</span>
        <h3 style={{ marginTop: 4 }}>Popayán Segura</h3>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6,
        paddingRight: 4,
      }}>
        {recent.length === 0 && (
          <div style={{ padding: 20, color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', border: '1px dashed var(--border)' }}>
            No hay reportes aún.
          </div>
        )}
        {recent.map((r, i) => {
          const ti = reportTypes[r.type] || {};
          const edge = edges.find(e => e.id === r.edgeId);
          const daysAgo = Math.floor((Date.now() - new Date(r.createdAt)) / 86400000);
          return (
            <div key={r.id} className="report-feed-item" style={{
              animationDelay: `${Math.min(i * 0.04, 0.6)}s`,
              padding: '10px 12px',
              borderLeft: `3px solid ${ti.color || '#6B7280'}`,
              background: 'var(--white)',
              borderBottom: '1px solid var(--border)',
              borderRight: '1px solid var(--border)',
              borderTop: '1px solid var(--border)',
              transition: 'all 0.2s ease',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '3px 3px 0 #111'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img src={`https://i.pravatar.cc/30?u=${r.username}`} alt="" style={{ width: 24, height: 24, border: '2px solid #111', objectFit: 'cover' }} />
                  <strong style={{ fontSize: '0.6875rem' }}>{r.username}</strong>
                  <span style={{
                    fontSize: '0.5625rem', padding: '1px 6px', background: ti.color || '#666', color: 'white',
                    fontWeight: 700, letterSpacing: '0.04em',
                  }}>
                    {ti.label || r.type}
                  </span>
                </div>
                <span style={{ fontSize: '0.5625rem', color: 'var(--text-muted)' }}>
                  {daysAgo === 0 ? 'Hoy' : daysAgo === 1 ? 'Ayer' : `Hace ${daysAgo}d`}
                </span>
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', marginBottom: 2 }}>
                {edge ? getEdgeLabel(edge) : r.edgeId}
              </div>
              {r.description && (
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-primary)', fontStyle: 'italic' }}>
                  "{r.description}"
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{
        borderTop: '2px solid var(--near-black)', paddingTop: 14,
      }}>
        <span className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>{user ? 'Nuevo Reporte' : 'Inicia sesión para reportar'}</span>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <select value={form.edgeId} onChange={e => setForm({ ...form, edgeId: e.target.value })} style={{ width: '100%', fontSize: '0.6875rem' }}>
            <option value="">Selecciona calle...</option>
            {edges.slice(0, 40).map(e => (
              <option key={e.id} value={e.id}>{getEdgeLabel(e)}</option>
            ))}
          </select>

          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {Object.entries(reportTypes).map(([k, v]) => (
              <button key={k} type="button" onClick={() => setForm({ ...form, type: k })}
                style={{
                  padding: '4px 10px', fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.04em',
                  background: form.type === k ? v.color : 'var(--white)',
                  color: form.type === k ? 'white' : 'var(--near-black)',
                  border: `2px solid ${form.type === k ? v.color : 'var(--border)'}`,
                  boxShadow: form.type === k ? 'var(--shadow-active)' : 'none',
                }}
              >{v.label}</button>
            ))}
          </div>

          <input
            placeholder="Descripción (opcional)"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            style={{ fontSize: '0.6875rem' }}
          />

          {error && <div style={{ padding: '4px 8px', background: 'var(--error)', color: 'white', fontSize: '0.625rem', fontWeight: 700 }}>{error}</div>}
          {submitted && <div style={{ padding: '4px 8px', background: 'var(--green)', color: 'white', fontSize: '0.625rem', fontWeight: 700 }}>✓ Reporte registrado</div>}

          <button type="submit" className="btn-primary btn-sm" disabled={!user} style={{ opacity: user ? 1 : 0.5, cursor: user ? 'pointer' : 'not-allowed' }}>
            {user ? 'Enviar Reporte' : 'Inicia sesión para reportar'}
          </button>
        </form>
      </div>
    </div>
  );
}
