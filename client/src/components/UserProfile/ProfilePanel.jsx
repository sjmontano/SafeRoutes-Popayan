import { useState, useEffect } from 'react';
import { fetchReports, fetchGraphData } from '../../utils/api';

const RANKS = [
  { min: 100, rank: 'Ángel de Popayán', emoji: '💎', color: '#5E3A8A', bg: '#F3E8FF' },
  { min: 50, rank: 'Protector', emoji: '🥇', color: '#D97706', bg: '#FEF3C7' },
  { min: 10, rank: 'Guardián', emoji: '🥈', color: '#1A4A3C', bg: '#D1FAE5' },
  { min: 1, rank: 'Centinela', emoji: '🥉', color: '#52525B', bg: '#F4F4F3' },
  { min: 0, rank: 'Visitante', emoji: '🆕', color: '#A1A1AA', bg: '#FAFAF9' },
];

function getRank(count) { return RANKS.find(r => count >= r.min) || RANKS[RANKS.length - 1]; }

export default function ProfilePanel({ user }) {
  const [reports, setReports] = useState([]);
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    fetchReports().then(setReports).catch(() => {});
    fetchGraphData().then(d => setNodes(d.nodes || [])).catch(() => {});
  }, []);

  const userReports = user ? reports.filter(r => r.username === user.username) : [];
  const rank = getRank(userReports.length);
  const nextRank = [...RANKS].reverse().find(r => r.min > userReports.length);

  const topReporters = (() => {
    const cnt = {};
    reports.forEach(r => { cnt[r.username] = (cnt[r.username] || 0) + 1; });
    return Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 10);
  })();

  const zoneCounts = (() => {
    const zc = {};
    reports.forEach(r => {
      const edge = nodes.find(n => n.id === r.edgeId || n.id === r.from);
      const z = edge?.zone || 'Desconocida';
      zc[z] = (zc[z] || 0) + 1;
    });
    return Object.entries(zc).sort((a, b) => b[1] - a[1]);
  })();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, overflowY: 'auto' }}>
      <div>
        <span className="eyebrow">Perfil</span>
        <h3 style={{ marginTop: 4 }}>{user ? user.name : 'Visitante'}</h3>
      </div>

      {!user && (
        <div style={{ padding: 16, border: '2px dashed var(--border)', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Inicia sesión para ver tu perfil y estadísticas.
        </div>
      )}

      {user && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img
              src={user.avatar || `https://i.pravatar.cc/80?u=${user.username}`}
              alt=""
              style={{ width: 60, height: 60, border: '3px solid var(--near-black)', boxShadow: '3px 3px 0 #111', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>{user.name}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>@{user.username}</div>
              <span className="badge" style={{ background: rank.color, color: 'white', marginTop: 4, display: 'inline-block' }}>
                {rank.emoji} {rank.rank}
              </span>
            </div>
          </div>

          <div className="card" style={{ padding: 14, background: rank.bg, textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: rank.color }}>
              {userReports.length}
            </div>
            <div style={{ fontSize: '0.5625rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
              Reportes realizados
            </div>
            {nextRank && (
              <div style={{ marginTop: 6, fontSize: '0.5625rem', color: 'var(--text-muted)' }}>
                {nextRank.min - userReports.length} más para {nextRank.emoji} {nextRank.rank}
              </div>
            )}
          </div>

          {userReports.length > 0 && (
            <div>
              <span className="eyebrow">Tus reportes</span>
              <div style={{ maxHeight: 160, overflowY: 'auto', marginTop: 6 }}>
                {[...userReports].reverse().slice(0, 12).map(r => {
                  const daysAgo = Math.floor((Date.now() - new Date(r.createdAt)) / 86400000);
                  return (
                    <div key={r.id} style={{ padding: '3px 6px', fontSize: '0.625rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
                      <span>{r.type}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{daysAgo === 0 ? 'Hoy' : `Hace ${daysAgo}d`}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      <div>
        <span className="eyebrow">Top Reporteros</span>
        <div style={{ marginTop: 6 }}>
          {topReporters.map(([name, cnt], i) => (
            <div key={name} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0',
              borderBottom: '1px solid var(--border)', fontSize: '0.6875rem',
            }}>
              <span style={{ fontWeight: 800, minWidth: 20 }}>#{i + 1}</span>
              <img src={`https://i.pravatar.cc/24?u=${name}`} alt="" style={{ width: 20, height: 20, border: '2px solid #111', objectFit: 'cover' }} />
              <span style={{ flex: 1 }}>{name}</span>
              <span style={{ fontWeight: 800 }}>{cnt}</span>
            </div>
          ))}
        </div>
      </div>

      {zoneCounts.length > 0 && (
        <div>
          <span className="eyebrow">Zonas con más reportes</span>
          <div style={{ marginTop: 6 }}>
            {zoneCounts.map(([z, cnt]) => {
              const max = zoneCounts[0][1];
              return (
                <div key={z} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <div style={{ flex: 1, height: 14, background: 'var(--surface-alt)', border: '1px solid var(--border)', position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'var(--primary)', width: `${(cnt / max) * 100}%` }} />
                  </div>
                  <span style={{ fontSize: '0.5625rem', minWidth: 75, textAlign: 'right' }}>{z} ({cnt})</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
