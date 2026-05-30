import { useEffect, useRef } from 'react';
import L from 'leaflet';

function getRiskColor(weight) {
  if (weight < 0.3) return '#16A34A';
  if (weight < 0.5) return '#F59E0B';
  if (weight < 0.7) return '#F65B7F';
  return '#DC2626';
}

function getRiskZoneColor(weight) {
  if (weight < 0.3) return '#16A34A';
  if (weight < 0.5) return '#F59E0B';
  if (weight < 0.7) return '#F65B7F';
  return '#DC2626';
}

export default function MapView({ routePath, routeResult, allCoords, allNodes, allEdges, showGraph, showZones, riskZones, heatmapData, onToggleZones }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const routeLayer = useRef(null);
  const graphLayer = useRef(null);
  const heatLayer = useRef(null);
  const zoneLayer = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    mapInstance.current = L.map(mapRef.current, {
      center: [2.4440, -76.6070], zoom: 15, zoomControl: true, attributionControl: false,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(mapInstance.current);
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (!routeLayer.current) {
      routeLayer.current = L.layerGroup().addTo(map);
    }
    routeLayer.current.clearLayers();

    if (!routePath || routePath.length === 0) return;

    const allLatLngs = [];

    for (const seg of routePath) {
      const coords = seg.geometry && seg.geometry.length > 1
        ? seg.geometry
        : [seg.fromCoords, seg.toCoords];

      const latlngs = coords.map(c => [c[0], c[1]]);
      allLatLngs.push(...latlngs);

      const color = getRiskColor(seg.zoneRisk ?? 0.5);

      L.polyline(latlngs, {
        color,
        weight: 6,
        opacity: 0.92,
      }).addTo(routeLayer.current);

      L.polyline(latlngs, {
        color: '#111111',
        weight: 10,
        opacity: 0.08,
      }).addTo(routeLayer.current);
    }

    if (allLatLngs.length > 1) {
      const first = routePath[0].fromCoords;
      const last = routePath[routePath.length - 1].toCoords;

      const iconA = L.divIcon({
        html: '<div style="background:#16A34A;color:#fff;border:2px solid #111;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;box-shadow:3px 3px 0 #111;">A</div>',
        className: '', iconSize: [30, 30], iconAnchor: [15, 15],
      });
      const iconB = L.divIcon({
        html: '<div style="background:#DC2626;color:#fff;border:2px solid #111;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;box-shadow:3px 3px 0 #111;">B</div>',
        className: '', iconSize: [30, 30], iconAnchor: [15, 15],
      });

      L.marker(first, { icon: iconA }).bindPopup('Origen').addTo(routeLayer.current);
      L.marker(last, { icon: iconB }).bindPopup('Destino').addTo(routeLayer.current);

      map.fitBounds(L.latLngBounds(allLatLngs), { padding: [50, 50] });
    }
  }, [routePath, routeResult]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (!graphLayer.current) graphLayer.current = L.layerGroup().addTo(map);
    graphLayer.current.clearLayers();

    if (!showGraph || !allNodes || !allEdges) return;

    for (const e of allEdges) {
      const a = allNodes.find(n => n.id === e.from);
      const b = allNodes.find(n => n.id === e.to);
      if (a && b) L.polyline([[a.lat, a.lng], [b.lat, b.lng]], { color: '#A1A1AA', weight: 1, opacity: 0.35 }).addTo(graphLayer.current);
    }
    for (const n of allNodes) {
      L.circleMarker([n.lat, n.lng], { radius: 2.5, color: '#111', fillColor: '#F65B7F', fillOpacity: 0.9, weight: 1 })
        .bindPopup(`<b>${n.name}</b><br/><small>${n.zone}</small>`).addTo(graphLayer.current);
    }
  }, [showGraph, allNodes, allEdges]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (!heatLayer.current) heatLayer.current = L.layerGroup().addTo(map);
    heatLayer.current.clearLayers();

    if (!heatmapData?.length) return;

    for (const p of heatmapData) {
      L.circle([p.lat, p.lng], { radius: 35 * p.intensity, color: 'transparent', fillColor: '#DC2626', fillOpacity: 0.22 * p.intensity }).addTo(heatLayer.current);
    }
  }, [heatmapData]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    if (!zoneLayer.current) zoneLayer.current = L.layerGroup().addTo(map);
    zoneLayer.current.clearLayers();

    if (!showZones || !riskZones?.features) return;

    for (const f of riskZones.features) {
      const coords = f.geometry.coordinates[0];
      const latlngs = coords.map(c => [c[0], c[1]]);
      const risk = f.properties.riskLevel;
      const color = getRiskZoneColor(risk);

      L.polygon(latlngs, {
        color: color,
        fillColor: color,
        fillOpacity: 0.18,
        weight: 2,
        opacity: 0.6,
      }).bindPopup(`
        <b>${f.properties.name}</b><br/>
        Riesgo: <span style="color:${color};font-weight:800">${f.properties.riskLabel}</span>
      `).addTo(zoneLayer.current);
    }
  }, [showZones, riskZones]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%', background: 'var(--surface-alt)' }} />
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <button
          onClick={onToggleZones}
          style={{
            padding: '6px 12px', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.06em',
            background: showZones ? 'var(--near-black)' : 'var(--white)',
            color: showZones ? 'var(--white)' : 'var(--near-black)',
            border: '2px solid var(--near-black)',
            cursor: 'pointer',
            boxShadow: '2px 2px 0 #111',
          }}
        >
          {showZones ? 'OCULTAR ZONAS' : 'ZONAS DE RIESGO'}
        </button>
      </div>
    </div>
  );
}
