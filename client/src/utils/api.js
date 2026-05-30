const API = import.meta.env.DEV
  ? '/api'
  : 'https://saferoutes-popayan.onrender.com/api';

export async function fetchRiskZones() {
  const res = await fetch(`${API}/graph/risk-zones`);
  return res.json();
}

export async function fetchGraphData() {
  const res = await fetch(`${API}/graph`);
  return res.json();
}

export async function fetchNodes() {
  const res = await fetch(`${API}/graph/nodes`);
  return res.json();
}

export async function fetchZones() {
  const res = await fetch(`${API}/graph/zones`);
  return res.json();
}

export async function fetchReportTypes() {
  const res = await fetch(`${API}/graph/report-types`);
  return res.json();
}

export async function fetchTransportModes() {
  const res = await fetch(`${API}/graph/transport-modes`);
  return res.json();
}

export async function fetchHourFactor() {
  const res = await fetch(`${API}/graph/current-hour-factor`);
  return res.json();
}

export async function fetchTraffic() {
  const res = await fetch(`${API}/traffic/current`);
  return res.json();
}

export async function search(query) {
  const res = await fetch(`${API}/search?q=${encodeURIComponent(query)}`);
  return res.json();
}

export async function calculateRoute(type, from, to, extra = {}) {
  const res = await fetch(`${API}/route/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, type, ...extra }),
  });
  return res.json();
}

export async function calculateRouteLegacy(type, from, to, extra = {}) {
  const res = await fetch(`${API}/route/${type}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, ...extra }),
  });
  return res.json();
}

export async function fetchReports() {
  const res = await fetch(`${API}/reports`);
  return res.json();
}

export async function submitReport(data) {
  const res = await fetch(`${API}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchHeatmap() {
  const res = await fetch(`${API}/reports/heatmap`);
  return res.json();
}
