const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const cache = new Map();

export async function searchAddress(query) {
  const key = query.toLowerCase().trim();
  if (cache.has(key)) return cache.get(key);

  const url = `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(query + ', Popayán, Colombia')}&limit=6&countrycodes=co&accept-language=es`;

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 10000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'SafeRoutes-Popayan/1.0' },
    });
    clearTimeout(t);

    if (!res.ok) return [];

    const data = await res.json();
    if (!data || data.length === 0) return [];

    const seen = new Set();
    const results = data
      .filter((r) => {
        const name = r.display_name.split(',')[0].toLowerCase();
        if (name.length < 3 || seen.has(name)) return false;
        seen.add(name);
        return true;
      })
      .map((r) => {
        const parts = r.display_name.split(',');
        const typeLabel =
          r.type === 'residential' || r.type === 'neighbourhood' || r.type === 'suburb' ? 'Barrio' :
          r.type === 'restaurant' || r.type === 'cafe' || r.type === 'fast_food' ? 'Restaurante' :
          r.type === 'hotel' || r.type === 'hostel' || r.type === 'guest_house' ? 'Hotel' :
          r.type === 'university' || r.type === 'school' || r.type === 'college' ? 'Educación' :
          r.type === 'hospital' || r.type === 'clinic' || r.type === 'pharmacy' ? 'Salud' :
          r.type === 'mall' || r.type === 'supermarket' || r.type === 'department_store' ? 'Comercio' :
          r.type === 'tourism' || r.type === 'museum' || r.type === 'attraction' ? 'Turismo' :
          r.type === 'bus_station' || r.type === 'aerodrome' ? 'Transporte' :
          'Dirección';

        const iconMap = {
          Barrio: '🏘️', Restaurante: '🍽️', Hotel: '🏨', Educación: '🎓',
          Salud: '🏥', Comercio: '🛍️', Turismo: '🏛️', Transporte: '🚌', 'Dirección': '📍',
        };

        return {
          name: parts[0].trim(),
          displayName: r.display_name,
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lon),
          type: typeLabel,
          icon: iconMap[typeLabel] || '📍',
        };
      });

    if (cache.size < 500) cache.set(key, results);
    return results;
  } catch {
    return [];
  }
}

export async function reverseGeocode(lat, lng) {
  const key = `rev:${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (cache.has(key)) return cache.get(key);

  const url = `${NOMINATIM_BASE}/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=es`;

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'SafeRoutes-Popayan/1.0' },
    });
    clearTimeout(t);

    if (!res.ok) return null;
    const data = await res.json();

    const result = {
      name: data.display_name.split(',')[0],
      displayName: data.display_name,
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lon),
      category: data.type,
    };

    if (cache.size < 500) cache.set(key, result);
    return result;
  } catch {
    return null;
  }
}
