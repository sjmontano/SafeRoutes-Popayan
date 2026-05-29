# Bitácora de Desarrollo - SafeRoutes Popayán

> **Proyecto:** Aplicación de rutas seguras basada en grafos para Popayán
> **Fecha inicio:** 27 Mayo 2026
> **Entrega:** 12 horas
> **Equipo:** Proyecto universitario - Estructura de Datos

---

## 1. Contexto del Proyecto

### Problemática

Popayán recibe turistas, estudiantes y extranjeros que no conocen sus calles ni niveles de seguridad. Las apps de navegación tradicionales (Google Maps, Waze) solo optimizan por distancia/tiempo, ignorando:

- Zonas con alta percepción de inseguridad
- Reportes ciudadanos
- Incidentes recientes
- Variaciones de riesgo según la hora del día

No existe una plataforma colaborativa enfocada en seguridad urbana de Popayán.

### Idea de Solución

App web que modela las calles de Popayán como un **grafo**:
- **Nodos:** Intersecciones de calles
- **Aristas:** Calles con peso según nivel de seguridad
- **Algoritmos:** Dijkstra, A* para calcular la ruta más segura
- **Colaborativo:** Usuarios reportan zonas peligrosas para mejorar rutas

"A cada arista se le asigna un peso relacionado con el nivel de seguridad de la ruta. El algoritmo analiza los caminos posibles y selecciona aquel con menor riesgo."

"La aplicación incentivará a los usuarios a reportar zonas peligrosas para mejorar continuamente la precisión de las rutas seguras."

---

## 2. Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React (Vite) |
| Backend | Node.js + Express |
| Base de datos | PostgreSQL + PostGIS |
| Algoritmos de grafos | Implementación propia en Node.js (Graph class + Dijkstra + A*) |
| Mapa | Leaflet (OpenStreetMap) |
| Diseño | Sistema brutalist editorial (DESIGN.md) |
| Tipografía | Poppins |

### Por qué implementación propia de grafos y no NetworkX

- Coherencia con el stack Node.js (monolenguaje)
- Experiencia educativa: implementar las estructuras de datos desde cero
- Evita complejidad de microservicio Python
- Las implementaciones de Dijkstra y A* son compactas y didácticas

---

## 3. Modelado del Grafo

### Datos de la Ciudad

- **Ciudad:** Popayán, Cauca, Colombia
- **Barrios:** 295 barrios en 9 comunas
- **Población:** ~346,403 habitantes (2025)
- **Prototipo:** ~100-150 nodos (intersecciones principales del centro y zonas aledañas)
- **Fuente de coordenadas:** OpenStreetMap (coordenadas reales)

### Estructura del Grafo

```
Grafo Dirigido Ponderado G = (V, E)

V = {intersecciones de calles}
E = {calles que conectan intersecciones}

Para cada arista e ∈ E:
  peso(e) = f(seguridad_base, reportes, hora, comercio, policía, CAI)
```

### Fórmula de Peso de Arista (Riesgo)

```
peso_total = w1·seguridad_base + w2·reportes_recientes + w3·factor_hora 
           + w4·(1 - presencia_comercio) + w5·(1 - presencia_policial) 
           + w6·(1 - cai_cercano) + w7·iluminacion

Donde:
  - Todos los factores normalizados [0, 1]
  - Mayor peso = MAYOR riesgo
  - Pesos default: w1=0.25, w2=0.25, w3=0.20, w4=0.10, w5=0.10, w6=0.05, w7=0.05
  - factor_hora: noche (20:00-06:00) = 1.0, día = 0.3
```

---

## 4. Algoritmos de Grafos

### Dijkstra - Ruta Más Segura

- Minimiza el peso acumulado de riesgo
- Complejidad: O((V+E) log V) con heap binario
- Ideal para el MVP

### A* - Ruta Más Segura con Heurística

- Usa distancia euclidiana como heurística admisible
- Más eficiente que Dijkstra para pares origen-destino específicos
- Heurística: h(n) = distancia_recta(n, destino) * riesgo_promedio_zona

### Variantes de Ruta

1. **Más segura:** Minimiza solo riesgo
2. **Más rápida:** Minimiza solo distancia (Dijkstra clásico)
3. **Balanceada:** peso_balanceado = α·riesgo + (1-α)·distancia (α=0.6 default)

### Floyd-Warshall

- Reservado para análisis global (matriz de todas las rutas)
- No se usa en el MVP por complejidad O(V³)

---

## 5. Sistema de Reportes Colaborativos

### Tipos de Reporte

| Tipo | Descripción | Peso base |
|------|-------------|-----------|
| ROBO | Robo o hurto | 0.9 |
| ACOSO | Acoso callejero | 0.8 |
| ZONA_OSCURA | Mala iluminación | 0.6 |
| SOSPECHOSO | Actividad sospechosa | 0.7 |
| ACCIDENTE | Accidente vial | 0.4 |
| OTRO | Otro incidente | 0.5 |

### Mecánica de Reportes

- Los reportes NO caducan, quedan como historial
- Se muestra: "Último reporte hace X días"
- El peso de reportes en la fórmula considera los últimos 30 días con mayor ponderación
- Reportes más antiguos tienen peso reducido (decaimiento exponencial)

### Modelo de Negocio - Gamificación

- **Rangos de usuario por reportes:**
  - 🥉 Centinela (1-10 reportes)
  - 🥈 Guardián (11-50 reportes)
  - 🥇 Protector (51-100 reportes)
  - 💎 Ángel de Popayán (100+ reportes)

- **Comercios verificados:** Negocios pueden pautar como "Comercio Seguro" (pago mensual)
  - Aparecen destacados en el mapa con badge verde
  - Tienen prioridad en rutas que pasan cerca
  - Ingresos mantienen la aplicación

- **No se obliga a reportar** para usar la app

---

## 6. Interfaz de Usuario

### Tecnología de Mapa
- **Leaflet** con tiles de OpenStreetMap
- Capas: ruta, heatmap, grafo completo, reportes

### Vistas

1. **Vista principal:** Mapa + panel lateral
   - Formulario origen/destino con autocompletado
   - Selector de tipo de ruta (segura/rápida/balanceada)
   - Ruta dibujada sobre el mapa con colores por nivel de riesgo

2. **Vista de resultados:**
   - Ruta trazada en el mapa
   - Estadísticas: distancia total, riesgo promedio, tiempo estimado
   - Lista de calles a tomar (turn-by-turn)

3. **Vista de reportes:**
   - Formulario para reportar incidente
   - Historial de reportes del usuario
   - Mapa de calor de reportes

4. **Panel de administración (dev):**
   - Visualización del grafo completo (activar/desactivar)
   - Ver nodos y aristas sobre el mapa

5. **Perfil de usuario:**
   - Rango y estadísticas
   - Historial de rutas

### Sistema de Diseño (DESIGN.md)

Se usa el sistema de diseño definido en `DESIGN.md`:
- **Brutalismo suave:** sombras offset, sin border-radius
- **Paleta:** Rosa coral (#F65B7F) = peligro/alerta, Verde (#1A4A3C) = seguro, Near-black (#111111) = bordes
- **Tipografía:** Poppins (400, 500, 700, 800)
- **Layout:** 12 columnas, max-width 1740px, left-aligned

---

## 7. API Endpoints

```
GET    /api/graph                    - Grafo completo
GET    /api/graph/nodes              - Todos los nodos
GET    /api/graph/edges              - Todas las aristas
POST   /api/route/safest             - Ruta más segura (Dijkstra)
POST   /api/route/fastest            - Ruta más rápida
POST   /api/route/balanced           - Ruta balanceada
GET    /api/zones                    - Barrios y zonas
GET    /api/zones/:id                - Detalle de zona
POST   /api/reports                  - Crear reporte
GET    /api/reports                  - Listar reportes
GET    /api/reports/heatmap          - Datos para mapa de calor
GET    /api/commerce/verified        - Comercios verificados
```

---

## 8. Estructura del Proyecto

```
Grafos/
├── client/                      # React (Vite)
│   ├── src/
│   │   ├── App.jsx              # App principal con tabs
│   │   ├── main.jsx             # Entry point
│   │   ├── components/
│   │   │   ├── Layout/Header.jsx
│   │   │   ├── Map/MapView.jsx
│   │   │   ├── RoutePanel/RouteForm.jsx
│   │   │   ├── RoutePanel/RouteResult.jsx
│   │   │   ├── ReportForm/ReportPanel.jsx
│   │   │   └── UserProfile/ProfilePanel.jsx
│   │   ├── hooks/
│   │   ├── utils/api.js         # Cliente HTTP
│   │   └── styles/index.css     # Diseño brutalist
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                      # Node.js + Express
│   ├── src/
│   │   ├── algorithms/
│   │   │   ├── Graph.js         # Clase Graph + PriorityQueue
│   │   │   ├── dijkstra.js      # Dijkstra + reconstructPath
│   │   │   └── astar.js         # A* con heurística Haversine
│   │   ├── data/
│   │   │   ├── popayan-nodes.js # 105 nodos, 5 zonas
│   │   │   └── popayan-edges.js # 318 aristas dirigidas
│   │   ├── routes/
│   │   │   └── graphRoutes.js   # 14 endpoints
│   │   ├── services/
│   │   │   └── graphService.js  # Construcción del grafo + pesos
│   │   └── index.js             # Express server
│   └── package.json
├── database/
│   └── schema.sql               # PostgreSQL + PostGIS
├── AGENTS.md
├── BITACORA.md                  # Esta bitácora
├── CLAUDE.md
├── DESIGN.md                    # Sistema de diseño brutalist
└── package.json                 # Scripts raíz (dev, install:all)
```

---

## 9. Decisiones Técnicas

### Por qué grafo dirigido
- Una calle puede ser segura en un sentido pero no en el otro (ej. por iluminación)
- Refleja mejor calles de un solo sentido

### Por qué no autenticación
- MVP rápido, 12 horas de entrega
- Se identifica por nombre de usuario simple
- Evita complejidad de JWT, sesiones, hashing

### Por qué PostgreSQL + PostGIS (aunque el MVP use datos en memoria)
- Escalabilidad futura
- Consultas geoespaciales eficientes
- Para el prototipo inmediato, los datos del grafo se cargan en memoria desde archivo JS

### Por qué implementación propia de algoritmos
- Requisito académico: demostrar comprensión de grafos
- Código didáctico y documentado
- Sin dependencias externas para el core

---

## 10. Integración OSRM (v2)

### ¿Qué es OSRM?
Open Source Routing Machine — motor de ruteo gratuito que calcula rutas sobre calles reales de OpenStreetMap. La API pública `router.project-osrm.org` devuelve la geometría exacta (polyline con waypoints) para cualquier par de coordenadas.

### Cómo funciona en SafeRoutes

1. **Dijkstra** encuentra la ruta óptima en nuestro grafo de seguridad (105 nodos, 318 aristas)
2. Para cada arista del camino, se consulta OSRM: `GET /route/v1/{profile}/{lon1},{lat1};{lon2},{lat2}?geometries=geojson`
3. OSRM devuelve la geometría real de la calle (entre 4 y 50 waypoints por arista)
4. Se concatenan todas las geometrías → ruta completa que sigue las calles reales
5. OSRM también da distancia y duración para cada perfil (foot, bicycle, driving)
6. Se aplica caché en memoria para no repetir consultas

### Perfiles OSRM utilizados

| Modo | Perfil OSRM | Velocidad ajuste | Tráfico |
|------|------------|-----------------|---------|
| 🚶 Caminando | `foot` | 1.0x | No afecta |
| 🚴 Bicicleta | `bicycle` | 1.0x | No afecta |
| 🚗 Carro | `driving` | 1.0x | Sí (1.5x pico) |
| 🏍️ Moto | `driving` | 0.7x (más rápido) | Sí (1.5x pico) |

### Tráfico simulado

| Hora | Factor | Etiqueta |
|------|--------|----------|
| 7-9am (lun-vie) | 1.5x | Tráfico Pesado |
| 12-2pm | 1.2x | Tráfico Moderado |
| 5-7pm | 1.6x | Tráfico Pesado |
| 8pm-6am | 0.8x | Vía Despejada |
| Resto | 1.0x | Tráfico Normal |
| Fin de semana | 0.7x | Vía Despejada |

---

## 11. Pruebas de Integración (15/15 OK)

| Método | Endpoint | Estado |
|--------|----------|--------|
| GET | /health | OK |
| GET | /api/graph | OK (105 nodos, 318 aristas, 5 zonas) |
| GET | /api/graph/nodes | OK |
| GET | /api/graph/zones | OK |
| GET | /api/graph/report-types | OK |
| GET | /api/graph/transport-modes | OK (4 modos) |
| GET | /api/traffic/current | OK |
| GET | /api/reports | OK |
| GET | /api/reports/heatmap | OK |
| GET | /api/search/nodes?q=calle | OK |
| POST | /api/route/calculate (walking, safest) | OK (99pts geometría) |
| POST | /api/route/calculate (car, fastest) | OK (133pts geometría) |
| POST | /api/route/calculate (bike, balanced) | OK (133pts geometría) |
| POST | /api/route/calculate (motorcycle, safest) | OK (99pts geometría) |
| POST | /api/reports | OK |

**Build frontend:** Vite build exitoso (320KB JS gzipped → 97KB)

### Resultados de ruta (Parque Caldas → Campo Bello, Calle 25)

| Modo | Tipo | Tiempo | Distancia | Geometría |
|------|------|--------|-----------|-----------|
| 🚶 Caminando | Más segura | 18 min | 9.4 km | 364 pts |
| 🚗 Carro | Más segura | 5 min | 3.2 km | 133 pts |
| 🚴 Bicicleta | Más rápida | 12 min | 6.2 km | 133 pts |
| 🏍️ Moto | Balanceada | 11 min | 8.9 km | 151 pts |

---

## 11. Cómo Ejecutar

```bash
# Instalar todo
npm run install:all

# Dev (ambos servidores)
npm run dev

# O por separado:
npm run dev:server   # API en http://localhost:3001
npm run dev:client   # UI en http://localhost:5173
```

---

## 12. Registro de Cambios

| Hora | Cambio | Detalle |
|------|--------|---------|
| 22:00 | Inicio | Creación de bitácora y planificación |
| 22:15 | Scaffolding | Estructura del proyecto client/server + package.json |
| 22:25 | DB Schema | Esquema PostgreSQL + PostGIS (database/schema.sql) |
| 22:30 | Algoritmos | Graph.js (PriorityQueue + Graph class), dijkstra.js, astar.js |
| 22:40 | Seed Data | 105 nodos, 318 aristas, 5 zonas de Popayán |
| 22:45 | API v1 | 14 endpoints REST (rutas, reportes, búsqueda, heatmap) |
| 22:50 | Frontend v1 | App.jsx, Header, MapView (Leaflet), RouteForm, RouteResult |
| 22:55 | Reportes | ReportPanel con formulario y lista de reportes |
| 23:00 | Perfil | ProfilePanel con rankings, gamificación, zonas |
| 23:05 | Integración v1 | Vite build exitoso, 14/14 endpoints OK |
| 23:10 | Pruebas v1 | Ruta Parque Caldas → Campo Bello: 9 pasos, riesgo 3.122 |
| 23:20 | Nodos precisos | Reescritura de 105 nodos con grilla calculada (calle/carrera) |
| 23:25 | OSRM Service | Integración router.project-osrm.org para geometría real de calles |
| 23:30 | Modos transporte | Walking, bike, car, motorcycle con OSRM profiles nativos |
| 23:35 | Tráfico simulado | Factor por hora pico (1.5x-1.6x), valle (1.0x), noche (0.8x) |
| 23:40 | API v2 | Nuevo /route/calculate unificado + /traffic/current + /transport-modes |
| 23:45 | Frontend v2 | Selector modo, badge tráfico, geometría OSRM en mapa |
| 23:50 | Build + Pruebas | 15/15 endpoints OK, geometría real 99-364pts por ruta |
