const LANDMARKS = [
  {
    "id": "lm_parque_caldas",
    "name": "Parque Caldas",
    "category": "turismo",
    "lat": 2.4417,
    "lng": -76.6064,
    "nodeId": "n5447"
  },
  {
    "id": "lm_torre_reloj",
    "name": "Torre del Reloj",
    "category": "turismo",
    "lat": 2.4422,
    "lng": -76.6067,
    "nodeId": "n5441"
  },
  {
    "id": "lm_catedral",
    "name": "Catedral Basílica de Popayán",
    "category": "turismo",
    "lat": 2.4419,
    "lng": -76.6063,
    "nodeId": "n5441"
  },
  {
    "id": "lm_san_francisco",
    "name": "Iglesia de San Francisco",
    "category": "turismo",
    "lat": 2.4428,
    "lng": -76.6065,
    "nodeId": "n5441"
  },
  {
    "id": "lm_santo_domingo",
    "name": "Iglesia de Santo Domingo",
    "category": "turismo",
    "lat": 2.4411,
    "lng": -76.6058,
    "nodeId": "n2316"
  },
  {
    "id": "lm_ermita",
    "name": "Iglesia de La Ermita",
    "category": "turismo",
    "lat": 2.4405,
    "lng": -76.607,
    "nodeId": "n110"
  },
  {
    "id": "lm_puente_humilladero",
    "name": "Puente del Humilladero",
    "category": "turismo",
    "lat": 2.4398,
    "lng": -76.6048,
    "nodeId": "n106"
  },
  {
    "id": "lm_morro_tulcan",
    "name": "Morro de Tulcán",
    "category": "turismo",
    "lat": 2.4395,
    "lng": -76.604,
    "nodeId": "n104"
  },
  {
    "id": "lm_panteon",
    "name": "Panteón de los Próceres",
    "category": "turismo",
    "lat": 2.4438,
    "lng": -76.6064,
    "nodeId": "n189"
  },
  {
    "id": "lm_museo_religioso",
    "name": "Museo de Arte Religioso",
    "category": "turismo",
    "lat": 2.4416,
    "lng": -76.6061,
    "nodeId": "n2316"
  },
  {
    "id": "lm_casa_mosquera",
    "name": "Casa Museo Mosquera",
    "category": "turismo",
    "lat": 2.4415,
    "lng": -76.6068,
    "nodeId": "n5447"
  },
  {
    "id": "lm_teatro_municipal",
    "name": "Teatro Municipal Guillermo Valencia",
    "category": "cultura",
    "lat": 2.4421,
    "lng": -76.6069,
    "nodeId": "n5441"
  },
  {
    "id": "lm_casa_moneda",
    "name": "Casa de la Moneda",
    "category": "cultura",
    "lat": 2.442,
    "lng": -76.6075,
    "nodeId": "n58"
  },
  {
    "id": "lm_banco_republica",
    "name": "Banco de la República - Área Cultural",
    "category": "cultura",
    "lat": 2.4413,
    "lng": -76.6062,
    "nodeId": "n2316"
  },
  {
    "id": "lm_unicauca",
    "name": "Universidad del Cauca",
    "category": "educacion",
    "lat": 2.4435,
    "lng": -76.605,
    "nodeId": "n6771"
  },
  {
    "id": "lm_fup",
    "name": "Fundación Universitaria de Popayán",
    "category": "educacion",
    "lat": 2.445,
    "lng": -76.603,
    "nodeId": "n5434"
  },
  {
    "id": "lm_sena",
    "name": "SENA Popayán",
    "category": "educacion",
    "lat": 2.45,
    "lng": -76.605,
    "nodeId": "n94"
  },
  {
    "id": "lm_cmc_claustro",
    "name": "Claustro Encarnación - Colegio Mayor del Cauca",
    "category": "educacion",
    "address": "Cra 5 # 5-40",
    "lat": 2.44105,
    "lng": -76.60514,
    "nodeId": "n786"
  },
  {
    "id": "lm_cmc_bicentenario",
    "name": "Sede Bicentenario - Colegio Mayor del Cauca",
    "category": "educacion",
    "address": "Cra 7 # 2-41",
    "lat": 2.44331,
    "lng": -76.60627,
    "nodeId": "n189"
  },
  {
    "id": "lm_cmc_casa_obando",
    "name": "Casa Obando - Colegio Mayor del Cauca",
    "category": "educacion",
    "address": "Calle 3 # 6-52",
    "lat": 2.44306,
    "lng": -76.6054,
    "nodeId": "n190"
  },
  {
    "id": "lm_cmc_norte",
    "name": "Sede Norte - Colegio Mayor del Cauca",
    "category": "educacion",
    "address": "Cra 6 # 46N-44",
    "lat": 2.454,
    "lng": -76.605,
    "nodeId": "n653"
  },
  {
    "id": "lm_cmc_posgrados",
    "name": "Sede Posgrados - Colegio Mayor del Cauca",
    "category": "educacion",
    "address": "Calle 3 # 5-35",
    "lat": 2.44278,
    "lng": -76.60451,
    "nodeId": "n191"
  },
  {
    "id": "lm_bbc_centro",
    "name": "BBC Centro Histórico",
    "category": "restaurante",
    "lat": 2.443,
    "lng": -76.607,
    "nodeId": "n431"
  },
  {
    "id": "lm_bbc_boulevard",
    "name": "BBC Boulevard Rose",
    "category": "restaurante",
    "lat": 2.448,
    "lng": -76.609,
    "nodeId": "n2605"
  },
  {
    "id": "lm_bbc_villa",
    "name": "BBC Villa del Viento",
    "category": "restaurante",
    "lat": 2.452,
    "lng": -76.613,
    "nodeId": null
  },
  {
    "id": "lm_cosecha",
    "name": "Restaurante Cosecha",
    "category": "restaurante",
    "lat": 2.4425,
    "lng": -76.6068,
    "nodeId": "n5441"
  },
  {
    "id": "lm_carmina",
    "name": "Carmina Restaurante",
    "category": "restaurante",
    "lat": 2.4428,
    "lng": -76.6062,
    "nodeId": "n5441"
  },
  {
    "id": "lm_italiano",
    "name": "Pizzería Italiana",
    "category": "restaurante",
    "lat": 2.4435,
    "lng": -76.6068,
    "nodeId": "n188"
  },
  {
    "id": "lm_juan_valdez",
    "name": "Juan Valdez Café",
    "category": "restaurante",
    "lat": 2.4418,
    "lng": -76.6065,
    "nodeId": "n5447"
  },
  {
    "id": "lm_kfc",
    "name": "KFC Popayán",
    "category": "restaurante",
    "lat": 2.4445,
    "lng": -76.608,
    "nodeId": "n4043"
  },
  {
    "id": "lm_don_quijote",
    "name": "Restaurante Don Quijote",
    "category": "restaurante",
    "lat": 2.445,
    "lng": -76.607,
    "nodeId": "n6946"
  },
  {
    "id": "lm_dom_burguer",
    "name": "Dom Burguer",
    "category": "restaurante",
    "address": "Calle 16 N 8-16, Barrio El Recuerdo",
    "lat": 2.451,
    "lng": -76.614,
    "nodeId": null
  },
  {
    "id": "lm_cosecha_parrillada",
    "name": "La Cosecha Parrillada",
    "category": "restaurante",
    "address": "Carrera 15 # 15N-20",
    "lat": 2.46043,
    "lng": -76.59842,
    "nodeId": "n3060"
  },
  {
    "id": "lm_dann",
    "name": "Hotel Dann Monasterio",
    "category": "hotel",
    "lat": 2.442,
    "lng": -76.6065,
    "nodeId": "n5441"
  },
  {
    "id": "lm_la_plazuela",
    "name": "Hotel La Plazuela",
    "category": "hotel",
    "lat": 2.4415,
    "lng": -76.607,
    "nodeId": "n5447"
  },
  {
    "id": "lm_camino_real",
    "name": "Hotel Camino Real",
    "category": "hotel",
    "lat": 2.445,
    "lng": -76.607,
    "nodeId": "n6946"
  },
  {
    "id": "lm_san_martin",
    "name": "Hotel San Martín",
    "category": "hotel",
    "lat": 2.448,
    "lng": -76.6068,
    "nodeId": "n817"
  },
  {
    "id": "lm_campanario",
    "name": "Centro Comercial Campanario",
    "category": "comercio",
    "address": "Carrera 9 # 24AN - 21",
    "lat": 2.45929,
    "lng": -76.595,
    "nodeId": "n5622"
  },
  {
    "id": "lm_exito",
    "name": "Éxito Popayán",
    "category": "comercio",
    "lat": 2.4465,
    "lng": -76.6095,
    "nodeId": "n2592"
  },
  {
    "id": "lm_alkosto",
    "name": "Alkosto Popayán",
    "category": "comercio",
    "lat": 2.448,
    "lng": -76.605,
    "nodeId": "n852"
  },
  {
    "id": "lm_homecenter",
    "name": "Homecenter Popayán",
    "category": "comercio",
    "lat": 2.449,
    "lng": -76.61,
    "nodeId": "n2852"
  },
  {
    "id": "lm_galeria_esmeralda",
    "name": "Galería La Esmeralda",
    "category": "comercio",
    "address": "Mercado público, Barrio La Esmeralda",
    "lat": 2.44449,
    "lng": -76.61543,
    "nodeId": "n1007"
  },
  {
    "id": "lm_el_cubo",
    "name": "El Cubo",
    "category": "comercio",
    "lat": 2.4581,
    "lng": -76.59826,
    "nodeId": "n2081"
  },
  {
    "id": "lm_el_empedrado",
    "name": "El Empedrado",
    "category": "comercio",
    "lat": 2.43848,
    "lng": -76.60564,
    "nodeId": "n152"
  },
  {
    "id": "lm_galeria_bolivar",
    "name": "Galería Barrio Bolívar",
    "category": "comercio",
    "lat": 2.44694,
    "lng": -76.60288,
    "nodeId": "n6325"
  },
  {
    "id": "lm_terminal",
    "name": "Terminal de Transportes",
    "category": "transporte",
    "lat": 2.453,
    "lng": -76.613,
    "nodeId": null
  },
  {
    "id": "lm_aeropuerto",
    "name": "Aeropuerto Guillermo León Valencia",
    "category": "transporte",
    "lat": 2.45466,
    "lng": -76.60852,
    "nodeId": null
  },
  {
    "id": "lm_hosp_san_jose",
    "name": "Hospital Universitario San José",
    "category": "salud",
    "lat": 2.446,
    "lng": -76.606,
    "nodeId": "n2584"
  },
  {
    "id": "lm_clinica_estancia",
    "name": "Clínica La Estancia",
    "category": "salud",
    "lat": 2.449,
    "lng": -76.608,
    "nodeId": "n815"
  },
  {
    "id": "lm_cruz_roja",
    "name": "Cruz Roja Popayán",
    "category": "salud",
    "lat": 2.445,
    "lng": -76.604,
    "nodeId": "n5514"
  },
  {
    "id": "lm_alcaldia",
    "name": "Alcaldía de Popayán",
    "category": "gobierno",
    "lat": 2.4423,
    "lng": -76.606,
    "nodeId": "n2318"
  },
  {
    "id": "lm_gobernacion",
    "name": "Gobernación del Cauca",
    "category": "gobierno",
    "lat": 2.4428,
    "lng": -76.6055,
    "nodeId": "n190"
  },
  {
    "id": "lm_fiscalia",
    "name": "Fiscalía General",
    "category": "gobierno",
    "lat": 2.445,
    "lng": -76.605,
    "nodeId": "n291"
  },
  {
    "id": "lm_policia",
    "name": "Comando de Policía Metropolitana",
    "category": "gobierno",
    "lat": 2.448,
    "lng": -76.606,
    "nodeId": "n65"
  },
  {
    "id": "lm_batallon",
    "name": "Batallón de Infantería Nº 7 José Hilario López",
    "category": "gobierno",
    "lat": 2.45604,
    "lng": -76.61566,
    "nodeId": null
  },
  {
    "id": "lm_tercera_division",
    "name": "Tercera División",
    "category": "gobierno",
    "lat": 2.45709,
    "lng": -76.60977,
    "nodeId": null
  },
  {
    "id": "lm_secretaria_salud",
    "name": "Secretaría Departamental de Salud del Cauca",
    "category": "gobierno",
    "lat": 2.4445,
    "lng": -76.60183,
    "nodeId": "n5484"
  },
  {
    "id": "lm_juzgados",
    "name": "Juzgados de Popayán",
    "category": "gobierno",
    "lat": 2.43957,
    "lng": -76.61081,
    "nodeId": "n1428"
  },
  {
    "id": "lm_estadio",
    "name": "Estadio Ciro López",
    "category": "deporte",
    "lat": 2.451,
    "lng": -76.604,
    "nodeId": "n733"
  },
  {
    "id": "lm_coliseo",
    "name": "Coliseo Mayor",
    "category": "deporte",
    "lat": 2.45,
    "lng": -76.61,
    "nodeId": "n5615"
  },
  {
    "id": "lm_gimnasio_comfacauca",
    "name": "Gimnasio Comfacauca",
    "category": "deporte",
    "address": "Carrera 15 # 18N-118",
    "lat": 2.46129,
    "lng": -76.59658,
    "nodeId": "n2285"
  },
  {
    "id": "lm_polideportivo_san_camilo",
    "name": "Polideportivo San Camilo",
    "category": "deporte",
    "lat": 2.43765,
    "lng": -76.61058,
    "nodeId": "n1488"
  },
  {
    "id": "lm_parque_bolivar",
    "name": "Parque de Bolívar",
    "category": "parque",
    "lat": 2.444,
    "lng": -76.6055,
    "nodeId": "n288"
  },
  {
    "id": "lm_parque_salud",
    "name": "Parque de la Salud",
    "category": "parque",
    "lat": 2.447,
    "lng": -76.605,
    "nodeId": "n5312"
  },
  {
    "id": "lm_parque_santa_gracia",
    "name": "Parque Santa Gracia",
    "category": "parque",
    "lat": 2.46035,
    "lng": -76.60298,
    "nodeId": null
  },
  {
    "id": "lm_bancolombia",
    "name": "Bancolombia Centro",
    "category": "banco",
    "lat": 2.4415,
    "lng": -76.6066,
    "nodeId": "n5447"
  },
  {
    "id": "lm_davivienda",
    "name": "Davivienda Popayán",
    "category": "banco",
    "lat": 2.442,
    "lng": -76.6068,
    "nodeId": "n5447"
  },
  {
    "id": "lm_parroquia_socorro",
    "name": "Parroquia Nuestra Señora del Perpetuo Socorro",
    "category": "religion",
    "address": "Carrera 23 # 5-74",
    "lat": 2.44725,
    "lng": -76.62019,
    "nodeId": "n474"
  },
  {
    "id": "lm_iglesia_belen",
    "name": "Iglesia de Belén",
    "category": "religion",
    "lat": 2.43935,
    "lng": -76.59948,
    "nodeId": "n5781"
  },
  {
    "id": "lm_cementerio_central",
    "name": "Cementerio Central",
    "category": "entierro",
    "lat": 2.44883,
    "lng": -76.62056,
    "nodeId": "n5522"
  },
  {
    "id": "lm_bambu",
    "name": "Urbanización El Bambú",
    "category": "barrio",
    "lat": 2.451,
    "lng": -76.601,
    "nodeId": "n5240"
  },
  {
    "id": "lm_bello_horizonte",
    "name": "Bello Horizonte",
    "category": "barrio",
    "lat": 2.44,
    "lng": -76.618,
    "nodeId": "n2202"
  },
  {
    "id": "lm_bolivar",
    "name": "Barrio Bolívar",
    "category": "barrio",
    "lat": 2.435,
    "lng": -76.605,
    "nodeId": "n179"
  },
  {
    "id": "lm_la_esmeralda",
    "name": "Barrio La Esmeralda",
    "category": "barrio",
    "lat": 2.44449,
    "lng": -76.61543,
    "nodeId": "n1007"
  },
  {
    "id": "lm_alfonso_lopez",
    "name": "Barrio Alfonso López",
    "category": "barrio",
    "lat": 2.448,
    "lng": -76.62,
    "nodeId": "n3757"
  },
  {
    "id": "lm_modelo",
    "name": "Barrio Modelo",
    "category": "barrio",
    "lat": 2.444,
    "lng": -76.609,
    "nodeId": "n306"
  },
  {
    "id": "lm_prados_norte",
    "name": "Prados del Norte",
    "category": "barrio",
    "lat": 2.448,
    "lng": -76.608,
    "nodeId": "n804"
  },
  {
    "id": "lm_campo_bello",
    "name": "Campo Bello",
    "category": "barrio",
    "lat": 2.452,
    "lng": -76.608,
    "nodeId": "n2540"
  },
  {
    "id": "lm_la_pamba",
    "name": "La Pamba",
    "category": "barrio",
    "lat": 2.443,
    "lng": -76.61,
    "nodeId": "n55"
  },
  {
    "id": "lm_el_cadillal",
    "name": "El Cadillal",
    "category": "barrio",
    "lat": 2.45,
    "lng": -76.602,
    "nodeId": "n5243"
  },
  {
    "id": "lm_maria_occidente",
    "name": "María Occidente",
    "category": "barrio",
    "lat": 2.449,
    "lng": -76.614,
    "nodeId": "n5621"
  },
  {
    "id": "lm_centenario",
    "name": "Barrio Centenario",
    "category": "barrio",
    "lat": 2.446,
    "lng": -76.607,
    "nodeId": "n2583"
  },
  {
    "id": "lm_loma_linda",
    "name": "Loma Linda",
    "category": "barrio",
    "lat": 2.448,
    "lng": -76.611,
    "nodeId": "n792"
  },
  {
    "id": "lm_santa_clara",
    "name": "Santa Clara",
    "category": "barrio",
    "lat": 2.445,
    "lng": -76.61,
    "nodeId": "n1434"
  },
  {
    "id": "lm_canterbury",
    "name": "Canterbury",
    "category": "barrio",
    "lat": 2.451,
    "lng": -76.606,
    "nodeId": "n1535"
  },
  {
    "id": "lm_la_florida",
    "name": "La Florida",
    "category": "barrio",
    "lat": 2.453,
    "lng": -76.605,
    "nodeId": "n658"
  },
  {
    "id": "lm_los_naranjos",
    "name": "Los Naranjos",
    "category": "barrio",
    "lat": 2.448,
    "lng": -76.616,
    "nodeId": "n932"
  },
  {
    "id": "lm_pubenza",
    "name": "Bloques de Pubenza",
    "category": "barrio",
    "lat": 2.45,
    "lng": -76.613,
    "nodeId": null
  },
  {
    "id": "lm_villa_paola",
    "name": "Villa Paola",
    "category": "barrio",
    "lat": 2.449,
    "lng": -76.615,
    "nodeId": null
  },
  {
    "id": "lm_jorge_eliecer",
    "name": "Jorge Eliécer Gaitán",
    "category": "barrio",
    "lat": 2.448,
    "lng": -76.618,
    "nodeId": "n904"
  },
  {
    "id": "lm_el_recuerdo",
    "name": "El Recuerdo",
    "category": "barrio",
    "lat": 2.452,
    "lng": -76.615,
    "nodeId": null
  },
  {
    "id": "lm_lomas_granada",
    "name": "Lomas de Granada",
    "category": "barrio",
    "lat": 2.46102,
    "lng": -76.64444,
    "nodeId": null
  },
  {
    "id": "lm_camilo_torres",
    "name": "Camilo Torres",
    "category": "barrio",
    "lat": 2.44957,
    "lng": -76.62236,
    "nodeId": "n1120"
  },
  {
    "id": "lm_villa_occidente",
    "name": "Barrio Villa de Occidente",
    "category": "barrio",
    "lat": 2.45359,
    "lng": -76.63542,
    "nodeId": "n2380"
  },
  {
    "id": "lm_ciudad_jardin",
    "name": "Ciudad Jardín",
    "category": "barrio",
    "lat": 2.45545,
    "lng": -76.5944,
    "nodeId": "n2462"
  },
  {
    "id": "lm_jose_maria_obando",
    "name": "José María Obando",
    "category": "barrio",
    "lat": 2.44539,
    "lng": -76.61931,
    "nodeId": "n991"
  },
  {
    "id": "lm_moscopan",
    "name": "Moscopan",
    "category": "barrio",
    "lat": 2.43517,
    "lng": -76.60261,
    "nodeId": "n421"
  },
  {
    "id": "lm_santa_monica",
    "name": "Santa Mónica",
    "category": "barrio",
    "lat": 2.43131,
    "lng": -76.6062,
    "nodeId": "n3946"
  },
  {
    "id": "lm_caldas",
    "name": "Caldas",
    "category": "barrio",
    "lat": 2.44367,
    "lng": -76.60013,
    "nodeId": "n443"
  },
  {
    "id": "lm_junin",
    "name": "Junín",
    "category": "barrio",
    "lat": 2.45324,
    "lng": -76.62405,
    "nodeId": "n534"
  },
  {
    "id": "lm_solidaridad",
    "name": "Barrio Solidaridad",
    "category": "barrio",
    "lat": 2.43871,
    "lng": -76.62857,
    "nodeId": "n4663"
  }
];

const CATEGORY_ICONS = {
  "turismo": "🏛️",
  "cultura": "🎭",
  "restaurante": "🍽️",
  "hotel": "🏨",
  "comercio": "🛍️",
  "transporte": "🚌",
  "salud": "🏥",
  "educacion": "🎓",
  "gobierno": "🏛",
  "deporte": "⚽",
  "parque": "🌳",
  "banco": "🏦",
  "barrio": "🏘️",
  "religion": "⛪",
  "entierro": "🪦"
};

const CATEGORY_LABELS = {
  "turismo": "Turismo",
  "cultura": "Cultura",
  "restaurante": "Restaurantes",
  "hotel": "Hoteles",
  "comercio": "Comercio",
  "transporte": "Transporte",
  "salud": "Salud",
  "educacion": "Educación",
  "gobierno": "Gobierno",
  "deporte": "Deportes",
  "parque": "Parques",
  "banco": "Bancos",
  "barrio": "Barrios",
  "religion": "Religión",
  "entierro": "Cementerio"
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
  const words = q.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  return LANDMARKS.filter(l => {
    const name = l.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const cat = l.category.toLowerCase();
    return name.includes(q) || words.every(w => name.includes(w)) || cat.includes(q);
  });
}

export { LANDMARKS, CATEGORY_ICONS, CATEGORY_LABELS, searchLandmarks, findNearestNode };
