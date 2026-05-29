import { useState, useEffect, useRef, useCallback } from 'react';
import {
  search,
  calculateRoute,
  fetchHourFactor,
  fetchTraffic,
} from '../../utils/api';
import { getResultIcon, getModeIcon, getRouteTypeIcon, IconMapPin } from '../../utils/icons';

const MODES = [
  { key: 'walking', label: 'Caminando' },
  { key: 'bike', label: 'Bicicleta' },
  { key: 'car', label: 'Carro' },
  { key: 'motorcycle', label: 'Moto' },
];

const TRAFFIC_AFFECTED = ['car', 'motorcycle'];

export default function RouteForm({ onRouteResult }) {
  const [origin, setOrigin] = useState('');
  const [dest, setDest] = useState('');
  const [originResults, setOriginResults] = useState([]);
  const [destResults, setDestResults] = useState([]);
  const [selectedOrigin, setSelectedOrigin] = useState(null);
  const [selectedDest, setSelectedDest] = useState(null);
  const [routeType, setRouteType] = useState('safest');
  const [mode, setMode] = useState('walking');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hourInfo, setHourInfo] = useState(null);
  const [trafficInfo, setTrafficInfo] = useState(null);

  const hasRoute = selectedOrigin && selectedDest;
  const mounted = useRef(false);
  const routeTypeRef = useRef(routeType);
  const modeRef = useRef(mode);
  const originRef = useRef(selectedOrigin);
  const destRef = useRef(selectedDest);

  routeTypeRef.current = routeType;
  modeRef.current = mode;
  originRef.current = selectedOrigin;
  destRef.current = selectedDest;

  useEffect(() => {
    fetchHourFactor().then(setHourInfo).catch(() => {});
    fetchTraffic().then(setTrafficInfo).catch(() => {});
  }, []);

  useEffect(() => {
    fetchTraffic().then(setTrafficInfo).catch(() => {});
  }, [mode]);

  const doCalculate = useCallback(async (type, m, o, d) => {
    if (!o || !d) return;
    setError('');
    setLoading(true);
    onRouteResult(null);
    try {
      const result = await calculateRoute(type, o.id, d.id, { mode: m });
      if (result.error) {
        setError(result.error);
        onRouteResult(null);
      } else {
        onRouteResult(result);
      }
    } catch {
      setError('Error de conexión con el servidor');
      onRouteResult(null);
    }
    setLoading(false);
  }, [onRouteResult]);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (!originRef.current || !destRef.current) return;
    doCalculate(routeType, mode, selectedOrigin, selectedDest);
  }, [routeType, mode]);

  const handleSearchOrigin = async (q) => {
    setOrigin(q);
    if (q.length < 2) { setOriginResults([]); return; }
    try {
      const results = await search(q);
      setOriginResults(Array.isArray(results) ? results : []);
    } catch { setOriginResults([]); }
  };

  const handleSearchDest = async (q) => {
    setDest(q);
    if (q.length < 2) { setDestResults([]); return; }
    try {
      const results = await search(q);
      setDestResults(Array.isArray(results) ? results : []);
    } catch { setDestResults([]); }
  };

  const handleCalculate = () => {
    if (!selectedOrigin || !selectedDest) {
      setError('Selecciona origen y destino');
      return;
    }
    doCalculate(routeType, mode, selectedOrigin, selectedDest);
  };

  const selectOrigin = (node) => {
    setSelectedOrigin(node);
    setOrigin(node.name);
    setOriginResults([]);
  };

  const selectDest = (node) => {
    setSelectedDest(node);
    setDest(node.name);
    setDestResults([]);
  };

  const isNight = hourInfo && (hourInfo.hour >= 20 || hourInfo.hour < 6);
  const showTraffic = TRAFFIC_AFFECTED.includes(mode);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {isNight && (
        <div style={{
          background: 'var(--purple)',
          color: 'var(--white)',
          padding: '8px 12px',
          fontSize: '0.6875rem',
          fontWeight: 700,
          textAlign: 'center',
          letterSpacing: '0.04em',
        }}>
          HORARIO NOCTURNO — Mayor precaución
        </div>
      )}

      {showTraffic && trafficInfo && (
        <div style={{
          background: trafficInfo.factor >= 1.5 ? '#FEF2F2' : trafficInfo.factor <= 0.8 ? '#F0FDF4' : '#EFF6FF',
          border: `2px solid ${trafficInfo.color || 'var(--border)'}`,
          padding: '8px 12px',
          fontSize: '0.6875rem',
          fontWeight: 700,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>{trafficInfo.text || 'Tráfico Normal'}</span>
          <span style={{
            background: trafficInfo.color || '#3B82F6',
            color: 'white',
            padding: '2px 8px',
            fontSize: '0.625rem',
            fontWeight: 800,
          }}>
            {Math.round(trafficInfo.factor * 100)}%
          </span>
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <label className="eyebrow" style={{ display: 'block', marginBottom: 4 }}>Origen</label>
          <input
            placeholder="Buscar lugar, restaurante, hotel..."
            value={origin}
            onChange={(e) => handleSearchOrigin(e.target.value)}
            style={{ width: '100%' }}
          />
          {originResults.length > 0 && (
            <div style={{
            position: 'absolute',
            zIndex: 10,
            width: '100%',
            maxHeight: 360,
            overflowY: 'auto',
            background: 'var(--white)',
            border: '2px solid var(--near-black)',
            boxShadow: '6px 6px 0 #111',
          }}>
            {originResults.map((n) => (
              <div
                key={n.id + (n.landmarkId || '')}
                onClick={() => selectOrigin(n)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  borderBottom: '1px solid var(--border)',
                }}
                onMouseEnter={(e) => e.target.style.background = 'var(--surface-alt)'}
                onMouseLeave={(e) => e.target.style.background = 'var(--white)'}
              >
                <span style={{ marginRight: 6, display: 'inline-flex', verticalAlign: 'middle' }}>{getResultIcon(n)}</span>
                <strong>{n.name}</strong>
                <span style={{ color: 'var(--text-muted)', marginLeft: 8, fontSize: '0.625rem' }}>{n.zone}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <label className="eyebrow" style={{ display: 'block', marginBottom: 4 }}>Destino</label>
        <input
            placeholder="Buscar lugar, restaurante, hotel..."
            value={dest}
            onChange={(e) => handleSearchDest(e.target.value)}
          style={{ width: '100%' }}
        />
        {destResults.length > 0 && (
          <div style={{
            position: 'absolute',
            zIndex: 10,
            width: '100%',
            maxHeight: 360,
            overflowY: 'auto',
            background: 'var(--white)',
            border: '2px solid var(--near-black)',
            boxShadow: '6px 6px 0 #111',
          }}>
            {destResults.map((n) => (
              <div
                key={n.id + (n.landmarkId || '')}
                onClick={() => selectDest(n)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  borderBottom: '1px solid var(--border)',
                }}
                onMouseEnter={(e) => e.target.style.background = 'var(--surface-alt)'}
                onMouseLeave={(e) => e.target.style.background = 'var(--white)'}
              >
                <span style={{ marginRight: 6, display: 'inline-flex', verticalAlign: 'middle' }}>{getResultIcon(n)}</span>
                <strong>{n.name}</strong>
                <span style={{ color: 'var(--text-muted)', marginLeft: 8, fontSize: '0.625rem' }}>{n.zone}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="eyebrow" style={{ display: 'block', marginBottom: 4 }}>Modo de transporte</label>
        <div style={{ display: 'flex', gap: 4 }}>
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              disabled={loading}
              title={m.label}
              style={{
                flex: 1,
                padding: '8px 4px',
                fontSize: '0.625rem',
                background: mode === m.key ? 'var(--near-black)' : 'var(--white)',
                color: mode === m.key ? 'var(--white)' : 'var(--near-black)',
                boxShadow: mode === m.key ? 'var(--shadow-active)' : 'none',
                borderColor: mode === m.key ? 'var(--near-black)' : 'var(--border)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'wait' : 'pointer',
              }}
            >
              <span style={{ display: 'inline-flex' }}>{getModeIcon(m.key, 20)}</span>
              <span style={{ letterSpacing: '0.02em' }}>{m.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2px 0' }}>
        {!['car','motorcycle'].includes(mode)
          ? 'A pie/bici puedes ir en cualquier dirección'
          : 'En carro/moto respeta el sentido de las calles'}
      </div>

      <div>
        <label className="eyebrow" style={{ display: 'block', marginBottom: 4 }}>Tipo de ruta</label>
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { key: 'safest', label: 'Más Segura', color: 'var(--green)' },
            { key: 'balanced', label: 'Balanceada', color: 'var(--warning)' },
            { key: 'fastest', label: 'Más Rápida', color: 'var(--primary)' },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setRouteType(opt.key)}
              disabled={loading}
              style={{
                flex: 1,
                padding: '8px',
                fontSize: '0.625rem',
                background: routeType === opt.key ? opt.color : 'var(--white)',
                color: routeType === opt.key ? 'var(--white)' : 'var(--near-black)',
                boxShadow: routeType === opt.key ? 'var(--shadow-active)' : 'none',
                borderColor: routeType === opt.key ? opt.color : 'var(--border)',
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span style={{ display: 'inline-flex' }}>{getRouteTypeIcon(opt.key, 18)}</span>
              <span>{loading && routeType === opt.key ? '...' : opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{
          padding: '8px 12px',
          background: 'var(--error)',
          color: 'var(--white)',
          fontSize: '0.75rem',
          fontWeight: 700,
        }}>
          {error}
        </div>
      )}

      <button
        className="btn-primary"
        onClick={handleCalculate}
        disabled={loading}
        style={{ width: '100%', opacity: loading ? 0.7 : 1, fontSize: '0.75rem' }}
      >
        {loading ? 'Calculando...' : `Calcular Ruta`}
      </button>

      {selectedOrigin && selectedDest && (
        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
          <strong>{selectedOrigin.name}</strong> → <strong>{selectedDest.name}</strong>
        </div>
      )}
    </div>
  );
}
