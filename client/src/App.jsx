import { useState, useEffect, useCallback } from 'react';
import MapView from './components/Map/MapView';
import Header from './components/Layout/Header';
import RouteForm from './components/RoutePanel/RouteForm';
import RouteResult from './components/RoutePanel/RouteResult';
import ReportPanel from './components/ReportForm/ReportPanel';
import ProfilePanel from './components/UserProfile/ProfilePanel';
import { fetchGraphData, fetchReports, fetchHeatmap, fetchRiskZones } from './utils/api';
import { getSession } from './utils/auth';

export default function App() {
  const [routeResult, setRouteResult] = useState(null);
  const [showGraph, setShowGraph] = useState(false);
  const [showZones, setShowZones] = useState(false);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [reports, setReports] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [riskZones, setRiskZones] = useState(null);
  const [activeTab, setActiveTab] = useState('route');
  const [user, setUser] = useState(() => getSession());

  useEffect(() => {
    fetchGraphData().then(setGraphData).catch(() => {});
    fetchReports().then(setReports).catch(() => {});
    fetchHeatmap().then(setHeatmapData).catch(() => {});
    fetchRiskZones().then(setRiskZones).catch(() => {});
  }, []);

  const handleRouteResult = useCallback((r) => setRouteResult(r), []);
  const toggleGraph = () => setShowGraph(p => !p);
  const toggleZones = () => setShowZones(p => !p);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', fontFamily: 'var(--font)' }}>
      <Header
        user={user}
        onLogin={setUser}
        onLogout={() => setUser(null)}
        onToggleGraph={toggleGraph}
        showGraph={showGraph}
        reportCount={reports.length}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ width: 380, minWidth: 380, borderRight: '2px solid var(--near-black)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: 'var(--spacing-lg)', overflowY: 'auto', flex: 1 }}>
            {activeTab === 'route' && (
              <>
                <div style={{ marginBottom: 18 }}>
                  <span className="eyebrow">Navegación Segura</span>
                  <h2 style={{ marginTop: 4 }}>Encuentra tu ruta</h2>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    Calcula la ruta con menor riesgo usando teoría de grafos y reportes ciudadanos.
                  </p>
                </div>
                <RouteForm onRouteResult={handleRouteResult} />
                <div style={{ marginTop: 18 }}><RouteResult result={routeResult} /></div>
              </>
            )}
            {activeTab === 'reports' && <ReportPanel user={user} />}
            {activeTab === 'profile' && <ProfilePanel user={user} />}
          </div>
        </div>

        <div style={{ flex: 1, position: 'relative' }}>
          <MapView
            routePath={routeResult?.path}
            routeResult={routeResult}
            allCoords={routeResult?.allCoords}
            allNodes={graphData.nodes}
            allEdges={graphData.edges}
            showGraph={showGraph}
            showZones={showZones}
            riskZones={riskZones}
            heatmapData={heatmapData}
            onToggleZones={toggleZones}
          />
          <div style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 1000, background: 'var(--white)', border: '2px solid var(--near-black)', boxShadow: 'var(--shadow-offset)', padding: 12, fontSize: '0.5625rem' }}>
            <div style={{ fontWeight: 800, marginBottom: 4, letterSpacing: '0.06em' }}>RIESGO</div>
            {[
              { color: '#16A34A', label: 'Bajo', range: '0 - 0.29' },
              { color: '#F59E0B', label: 'Medio', range: '0.30 - 0.54' },
              { color: '#F65B7F', label: 'Alto', range: '0.55 - 0.69' },
              { color: '#DC2626', label: 'Crítico', range: '0.70 - 1.0' },
            ].map(item => (
              <div key={item.color} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 14, height: 14, background: item.color, border: '2px solid #111' }} />
                <span><strong>{item.label}</strong> <span style={{ color: 'var(--text-muted)' }}>{item.range}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer style={{ height: 28, background: 'var(--near-black)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5625rem', letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0 }}>
        874 nodos · 3374 aristas · 12 zonas · {reports.length} reportes · Popayán
      </footer>
    </div>
  );
}
