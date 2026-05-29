const LANDMARKS = [
  { id: 'lm_parque_caldas', name: 'Parque Caldas', category: 'turismo', lat: 2.44170, lng: -76.60640 },
  { id: 'lm_torre_reloj', name: 'Torre del Reloj', category: 'turismo', lat: 2.44220, lng: -76.60670 },
  { id: 'lm_catedral', name: 'Catedral Basílica de Popayán', category: 'turismo', lat: 2.44190, lng: -76.60630 },
  { id: 'lm_san_francisco', name: 'Iglesia de San Francisco', category: 'turismo', lat: 2.44280, lng: -76.60650 },
  { id: 'lm_santo_domingo', name: 'Iglesia de Santo Domingo', category: 'turismo', lat: 2.44110, lng: -76.60580 },
  { id: 'lm_ermita', name: 'Iglesia de La Ermita', category: 'turismo', lat: 2.44050, lng: -76.60700 },
  { id: 'lm_puente_humilladero', name: 'Puente del Humilladero', category: 'turismo', lat: 2.43980, lng: -76.60480 },
  { id: 'lm_morro_tulcan', name: 'Morro de Tulcán', category: 'turismo', lat: 2.43950, lng: -76.60400 },
  { id: 'lm_panteon', name: 'Panteón de los Próceres', category: 'turismo', lat: 2.44380, lng: -76.60640 },
  { id: 'lm_teatro_municipal', name: 'Teatro Municipal Guillermo Valencia', category: 'cultura', lat: 2.44210, lng: -76.60690 },
  { id: 'lm_casa_moneda', name: 'Casa de la Moneda', category: 'cultura', lat: 2.44200, lng: -76.60750 },
  { id: 'lm_banco_republica', name: 'Banco de la República - Área Cultural', category: 'cultura', lat: 2.44130, lng: -76.60620 },
  { id: 'lm_museo_religioso', name: 'Museo de Arte Religioso', category: 'turismo', lat: 2.44160, lng: -76.60610 },
  { id: 'lm_casa_mosquera', name: 'Casa Museo Mosquera', category: 'turismo', lat: 2.44150, lng: -76.60680 },

  { id: 'lm_unicauca', name: 'Universidad del Cauca', category: 'educacion', lat: 2.44350, lng: -76.60500 },
  { id: 'lm_fup', name: 'Fundación Universitaria de Popayán', category: 'educacion', lat: 2.44500, lng: -76.60300 },
  { id: 'lm_sena', name: 'SENA Popayán', category: 'educacion', lat: 2.45000, lng: -76.60500 },
  { id: 'lm_colegio_mayor', name: 'Colegio Mayor del Cauca', category: 'educacion', lat: 2.44950, lng: -76.60300 },

  { id: 'lm_bbc_centro', name: 'BBC Centro Histórico', category: 'restaurante', lat: 2.44300, lng: -76.60700 },
  { id: 'lm_bbc_boulevard', name: 'BBC Boulevard Rose', category: 'restaurante', lat: 2.44800, lng: -76.60900 },
  { id: 'lm_bbc_villa', name: 'BBC Villa del Viento', category: 'restaurante', lat: 2.45200, lng: -76.61300 },
  { id: 'lm_cosecha', name: 'Restaurante Cosecha', category: 'restaurante', lat: 2.44250, lng: -76.60680 },
  { id: 'lm_carmina', name: 'Carmina Restaurante', category: 'restaurante', lat: 2.44280, lng: -76.60620 },
  { id: 'lm_italiano', name: 'Pizzería Italiana', category: 'restaurante', lat: 2.44350, lng: -76.60680 },
  { id: 'lm_juan_valdez', name: 'Juan Valdez Café', category: 'restaurante', lat: 2.44180, lng: -76.60650 },
  { id: 'lm_kfc', name: 'KFC Popayán', category: 'restaurante', lat: 2.44450, lng: -76.60800 },
  { id: 'lm_don_quijote', name: 'Restaurante Don Quijote', category: 'restaurante', lat: 2.44500, lng: -76.60700 },

  { id: 'lm_dann', name: 'Hotel Dann Monasterio', category: 'hotel', lat: 2.44200, lng: -76.60650 },
  { id: 'lm_la_plazuela', name: 'Hotel La Plazuela', category: 'hotel', lat: 2.44150, lng: -76.60700 },
  { id: 'lm_camino_real', name: 'Hotel Camino Real', category: 'hotel', lat: 2.44500, lng: -76.60700 },
  { id: 'lm_san_martin', name: 'Hotel San Martín', category: 'hotel', lat: 2.44800, lng: -76.60680 },

  { id: 'lm_campanario', name: 'Centro Comercial Campanario', category: 'comercio', lat: 2.44700, lng: -76.60900 },
  { id: 'lm_exito', name: 'Éxito Popayán', category: 'comercio', lat: 2.44650, lng: -76.60950 },
  { id: 'lm_alkosto', name: 'Alkosto Popayán', category: 'comercio', lat: 2.44800, lng: -76.60500 },
  { id: 'lm_homecenter', name: 'Homecenter Popayán', category: 'comercio', lat: 2.44900, lng: -76.61000 },

  { id: 'lm_terminal', name: 'Terminal de Transportes', category: 'transporte', lat: 2.45300, lng: -76.61300 },
  { id: 'lm_aeropuerto', name: 'Aeropuerto Guillermo León Valencia', category: 'transporte', lat: 2.45700, lng: -76.61000 },

  { id: 'lm_hosp_san_jose', name: 'Hospital Universitario San José', category: 'salud', lat: 2.44600, lng: -76.60600 },
  { id: 'lm_clinica_estancia', name: 'Clínica La Estancia', category: 'salud', lat: 2.44900, lng: -76.60800 },
  { id: 'lm_cruz_roja', name: 'Cruz Roja Popayán', category: 'salud', lat: 2.44500, lng: -76.60400 },

  { id: 'lm_alcaldia', name: 'Alcaldía de Popayán', category: 'gobierno', lat: 2.44230, lng: -76.60600 },
  { id: 'lm_gobernacion', name: 'Gobernación del Cauca', category: 'gobierno', lat: 2.44280, lng: -76.60550 },
  { id: 'lm_fiscalia', name: 'Fiscalía General', category: 'gobierno', lat: 2.44500, lng: -76.60500 },
  { id: 'lm_policia', name: 'Comando de Policía Metropolitana', category: 'gobierno', lat: 2.44800, lng: -76.60600 },

  { id: 'lm_estadio', name: 'Estadio Ciro López', category: 'deporte', lat: 2.45100, lng: -76.60400 },
  { id: 'lm_coliseo', name: 'Coliseo Mayor', category: 'deporte', lat: 2.45000, lng: -76.61000 },

  { id: 'lm_parque_bolivar', name: 'Parque de Bolívar', category: 'parque', lat: 2.44400, lng: -76.60550 },
  { id: 'lm_parque_salud', name: 'Parque de la Salud', category: 'parque', lat: 2.44700, lng: -76.60500 },

  { id: 'lm_bancolombia', name: 'Bancolombia Centro', category: 'banco', lat: 2.44150, lng: -76.60660 },
  { id: 'lm_davivienda', name: 'Davivienda Popayán', category: 'banco', lat: 2.44200, lng: -76.60680 },

  { id: 'lm_bambu', name: 'Urbanización El Bambú', category: 'barrio', lat: 2.45100, lng: -76.60100 },
  { id: 'lm_bello_horizonte', name: 'Bello Horizonte', category: 'barrio', lat: 2.44000, lng: -76.61800 },
  { id: 'lm_bolivar', name: 'Barrio Bolívar', category: 'barrio', lat: 2.43500, lng: -76.60500 },
  { id: 'lm_la_esmeralda', name: 'Barrio La Esmeralda', category: 'barrio', lat: 2.43400, lng: -76.61300 },
  { id: 'lm_alfonso_lopez', name: 'Barrio Alfonso López', category: 'barrio', lat: 2.44800, lng: -76.62000 },
  { id: 'lm_modelo', name: 'Barrio Modelo', category: 'barrio', lat: 2.44400, lng: -76.60900 },
  { id: 'lm_prados_norte', name: 'Prados del Norte', category: 'barrio', lat: 2.44800, lng: -76.60800 },
  { id: 'lm_campo_bello', name: 'Campo Bello', category: 'barrio', lat: 2.45200, lng: -76.60800 },
  { id: 'lm_la_pamba', name: 'La Pamba', category: 'barrio', lat: 2.44300, lng: -76.61000 },
  { id: 'lm_el_cadillal', name: 'El Cadillal', category: 'barrio', lat: 2.45000, lng: -76.60200 },
  { id: 'lm_maria_occidente', name: 'María Occidente', category: 'barrio', lat: 2.44900, lng: -76.61400 },
  { id: 'lm_centenario', name: 'Barrio Centenario', category: 'barrio', lat: 2.44600, lng: -76.60700 },
  { id: 'lm_loma_linda', name: 'Loma Linda', category: 'barrio', lat: 2.44800, lng: -76.61100 },
  { id: 'lm_santa_clara', name: 'Santa Clara', category: 'barrio', lat: 2.44500, lng: -76.61000 },
  { id: 'lm_canterbury', name: 'Canterbury', category: 'barrio', lat: 2.45100, lng: -76.60600 },
  { id: 'lm_la_florida', name: 'La Florida', category: 'barrio', lat: 2.45300, lng: -76.60500 },
  { id: 'lm_los_naranjos', name: 'Los Naranjos', category: 'barrio', lat: 2.44800, lng: -76.61600 },
  { id: 'lm_pubenza', name: 'Bloques de Pubenza', category: 'barrio', lat: 2.45000, lng: -76.61300 },
  { id: 'lm_villa_paola', name: 'Villa Paola', category: 'barrio', lat: 2.44900, lng: -76.61500 },
  { id: 'lm_jorge_eliecer', name: 'Jorge Eliécer Gaitán', category: 'barrio', lat: 2.44800, lng: -76.61800 },
  { id: 'lm_el_recuerdo', name: 'El Recuerdo', category: 'barrio', lat: 2.45200, lng: -76.61500 },
];

const CATEGORY_ICONS = {
  turismo: '🏛️', cultura: '🎭', restaurante: '🍽️', hotel: '🏨',
  comercio: '🛍️', transporte: '🚌', salud: '🏥', educacion: '🎓',
  gobierno: '🏛', deporte: '⚽', parque: '🌳', banco: '🏦', barrio: '🏘️',
};

const CATEGORY_LABELS = {
  turismo: 'Turismo', cultura: 'Cultura', restaurante: 'Restaurantes',
  hotel: 'Hoteles', comercio: 'Comercio', transporte: 'Transporte',
  salud: 'Salud', educacion: 'Educación', gobierno: 'Gobierno',
  deporte: 'Deportes', parque: 'Parques', banco: 'Bancos', barrio: 'Barrios',
};

function findNearestNode(lat, lng, nodes) {
  let best = null, bestDist = Infinity;
  for (const n of nodes) {
    const d = (n.lat - lat) ** 2 + (n.lng - lng) ** 2;
    if (d < bestDist) { bestDist = d; best = n; }
  }
  return best;
}

function searchLandmarks(query) {
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return LANDMARKS.filter(l => {
    const name = l.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return name.includes(q) || l.category.toLowerCase().includes(q);
  });
}

export { LANDMARKS, CATEGORY_ICONS, CATEGORY_LABELS, searchLandmarks, findNearestNode };
