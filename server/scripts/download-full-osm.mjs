import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'src', 'data');

// Expand Popayán bounds to cover all barrios + periphery
// Current bounds: lat [2.406, 2.481], lng [-76.640, -76.561]
// Expanded to include Lomas de Granada, Villa de Occidente, Aeropuerto, etc.
const BBOX = [2.42, -76.66, 2.48, -76.55]; // south, west, north, east

// Filter to street-level highways only (skip paths, tracks, footways, etc.)
const HIGHWAY_FILTER = [
  'motorway', 'trunk', 'primary', 'secondary', 'tertiary',
  'unclassified', 'residential', 'motorway_link', 'trunk_link',
  'primary_link', 'secondary_link', 'tertiary_link',
  'living_street', 'service', 'road',
];

const overpassQl = `[out:json][timeout:120];
(
  way(${BBOX[0]},${BBOX[1]},${BBOX[2]},${BBOX[3]})["highway"~"^(${HIGHWAY_FILTER.join('|')})$"];
);
out geom;`;

console.log('Downloading OSM streets for Popayán...');
console.log(`Bbox: ${BBBOX}`);

const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQl)}`;
const resp = await fetch(url, {
  headers: { 'User-Agent': 'SafeRoutesPopayan/1.0', 'Accept': 'application/json' }
});

if (!resp.ok) {
  const text = await resp.text();
  console.error(`Overpass ${resp.status}: ${text.slice(0, 300)}`);
  process.exit(1);
}

const data = await resp.json();
console.log(`Received ${data.elements?.length || 0} elements`);

const ways = data.elements.filter(e => e.type === 'way' && e.geometry?.length > 0);
console.log(`Filtered to ${ways.length} LineStrings`);

const features = ways.map(way => ({
  type: 'Feature',
  properties: {
    highway: way.tags?.highway || 'unclassified',
    name: way.tags?.name || null,
    oneway: way.tags?.oneway || null,
    surface: way.tags?.surface || null,
    lit: way.tags?.lit || null,
    junction: way.tags?.junction || null,
  },
  geometry: {
    type: 'LineString',
    coordinates: way.geometry.map(p => [p.lon, p.lat]),
  },
}));

const geojson = {
  type: 'FeatureCollection',
  features,
};

const outPath = join(dataDir, 'popayan-streets-full.geojson');
writeFileSync(outPath, JSON.stringify(geojson));
const mb = Buffer.byteLength(JSON.stringify(geojson)) / 1024 / 1024;
console.log(`Written: ${outPath} (${mb.toFixed(1)} MB, ${features.length} features)`);

// Compare with current
import { readFileSync } from 'fs';
const current = JSON.parse(readFileSync(join(dataDir, 'popayan-streets.geojson'), 'utf8'));
console.log(`Current GeoJSON: ${current.features.length} features`);
console.log(`Increase: ${features.length - current.features.length} features (${((features.length/current.features.length-1)*100).toFixed(0)}%)`);
