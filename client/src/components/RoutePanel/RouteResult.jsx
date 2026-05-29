function getRiskLabel(weight) {
  if (weight < 0.3) return { text: 'BAJO', color: 'var(--green)' };
  if (weight < 0.5) return { text: 'MEDIO', color: 'var(--warning)' };
  if (weight < 0.7) return { text: 'ALTO', color: 'var(--primary)' };
  return { text: 'CRÍTICO', color: 'var(--error)' };
}

const MODE_META = {
  walking: { icon: '🚶', label: 'Caminando', speed: '5 km/h' },
  bike: { icon: '🚴', label: 'Bicicleta', speed: '15 km/h' },
  car: { icon: '🚗', label: 'Carro', speed: '40 km/h' },
  motorcycle: { icon: '🏍️', label: 'Moto', speed: '50 km/h' },
};

export default function RouteResult({ result }) {
  if (!result) return (
    <div style={{
      padding: 24,
      textAlign: 'center',
      color: 'var(--text-muted)',
      fontSize: '0.8125rem',
      border: '2px dashed var(--border)',
    }}>
      Selecciona origen y destino para calcular una ruta
    </div>
  );

  const avgWeight = result.avgRisk !== undefined ? result.avgRisk : 0.5;
  const riskLabel = result.riskLabel || (avgWeight < 0.35 ? 'Bajo' : avgWeight < 0.55 ? 'Medio' : avgWeight < 0.70 ? 'Alto' : 'Crítico');
  const riskColor = avgWeight < 0.35 ? 'var(--green)' : avgWeight < 0.55 ? 'var(--warning)' : avgWeight < 0.70 ? 'var(--primary)' : 'var(--error)';
  const modeMeta = MODE_META[result.mode] || MODE_META.walking;

  const typeLabels = {
    safest: 'Más Segura',
    balanced: 'Balanceada',
    fastest: 'Más Rápida',
    'astar-safest': 'A* Segura',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="eyebrow">Resultado</span>
        <span className="badge badge-green">{typeLabels[result.type] || result.type}</span>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 10px',
        background: 'var(--near-black)',
        color: 'var(--white)',
        fontSize: '0.6875rem',
      }}>
        <span>{modeMeta.icon}</span>
        <span style={{ fontWeight: 700, letterSpacing: '0.04em' }}>{modeMeta.label}</span>
      </div>

      {result.trafficLabel && (result.mode === 'car' || result.mode === 'motorcycle') && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '4px 8px',
          background: result.trafficLabel.color + '18',
          borderLeft: `3px solid ${result.trafficLabel.color}`,
          fontSize: '0.625rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
        }}>
          <span>{result.trafficLabel.text}</span>
          <span>{(result.trafficFactor * 100).toFixed(0)}%</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        <div className="card" style={{ padding: 10 }}>
          <div style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tiempo</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{result.totalDuration || '—'}</div>
        </div>
        <div className="card" style={{ padding: 10 }}>
          <div style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Distancia</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{result.totalDistance || '—'}</div>
        </div>
        <div className="card" style={{ padding: 10 }}>
          <div style={{ fontSize: '0.5625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Riesgo</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: riskColor }}>
            {riskLabel}
          </div>
        </div>
      </div>

      <div style={{
        padding: '6px 10px',
        background: 'var(--surface-alt)',
        fontSize: '0.625rem',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}>
        Ruta paso a paso ({result.steps} tramos)
      </div>

      <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {result.path.map((step, i) => {
          const risk = step.weight !== undefined ? getRiskLabel(step.weight) : { text: '—', color: 'var(--text-muted)' };
          return (
            <div
              key={step.edgeId || i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 8px',
                borderLeft: `3px solid ${risk.color}`,
                background: 'var(--white)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <span style={{
                minWidth: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--near-black)',
                color: 'var(--white)',
                fontSize: '0.625rem',
                fontWeight: 800,
              }}>
                {i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {step.name}
                </div>
                {step.distanceMeters !== undefined && (
                  <div style={{ fontSize: '0.5625rem', color: 'var(--text-muted)' }}>
                    {step.distanceMeters}m
                    {step.durationSecs !== undefined && ` · ${Math.round(step.durationSecs / 60)}min`}
                  </div>
                )}
              </div>
              <span style={{
                fontSize: '0.5625rem',
                fontWeight: 700,
                padding: '2px 6px',
                background: risk.color,
                color: 'var(--white)',
              }}>
                {risk.text}
              </span>
            </div>
          );
        })}
      </div>

      {result.hourFactor !== undefined && (
        <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Factor horario: {(result.hourFactor * 100).toFixed(0)}%
          {result.hourFactor >= 0.7 && ' — Noche'}
        </div>
      )}
    </div>
  );
}
