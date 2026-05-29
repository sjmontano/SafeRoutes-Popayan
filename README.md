# SafeRoutes Popayán 🛡️

> Rutas seguras basadas en teoría de grafos para Popayán, Colombia.

[![Deploy](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://saferoutes-popayan.vercel.app)
[![API](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)](https://saferoutes-popayan.onrender.com)

---

## 🎯 Problema

Popayán recibe constantemente turistas y estudiantes que no conocen sus calles ni los niveles de seguridad de cada zona. Las aplicaciones de navegación tradicionales solo optimizan por distancia o tiempo, ignorando factores de seguridad. SafeRoutes modela la ciudad como un **grafo dirigido ponderado** y calcula la ruta con menor riesgo.

---

## 🧠 Cómo funciona

```
Popayán → Grafo (874 nodos, 3374 aristas) → Dijkstra → Ruta más segura
```

- **Nodos:** 874 intersecciones reales en 12 zonas
- **Aristas:** 3374 calles con peso basado en seguridad
- **Algoritmo:** Dijkstra con pesos personalizados por tipo de ruta
- **Geometría:** OSRM dibuja las rutas siguiendo calles reales de OpenStreetMap
- **Tráfico:** Simulado por hora del día (pico 1.6x, valle 1.0x, noche 0.8x)

### Fórmula de peso por arista

```
peso = w1·seguridad_base + w2·reportes + w3·factor_hora 
     + w4·(1-comercio) + w5·(1-policía) + w6·(1-CAI) + w7·(1-iluminación)
```

---

## 🚀 Demo

| Servicio | URL | Estado |
|----------|-----|--------|
| **Frontend** | [Vercel](https://saferoutes-popayan.vercel.app) | 🟢 Live |
| **Backend API** | [Render](https://saferoutes-popayan.onrender.com) | 🟢 Live |

> ⚠️ El tier gratis de Render duerme tras 15 min de inactividad. La primera petición puede tardar ~50s.

### Usuarios demo

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| `admin` | `admin` | Admin |
| `santiago` | `santiago123` | Reportero |
| `sotelo` | `sotelo123` | Reportero |
| `luisa` | `luisa123` | Reportero |

---

## 🏗️ Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + Leaflet |
| Backend | Node.js + Express |
| Base de datos | PostgreSQL + PostGIS (schema listo) |
| Algoritmos | Dijkstra, A* (implementación propia) |
| Mapa | OpenStreetMap + OSRM |
| Diseño | Sistema brutalist editorial (Poppins, sombras offset) |

---

## 📦 Instalación local

```bash
git clone https://github.com/sjmontano/SafeRoutes-Popayan.git
cd SafeRoutes-Popayan

# Instalar dependencias
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# Ejecutar
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

---

## 🌐 Despliegue

### Frontend (Vercel)

Conecta el repo a Vercel. El `vercel.json` en la raíz configura:

```json
{
  "buildCommand": "cd client && npm install && npm run build",
  "outputDirectory": "client/dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Backend (Render)

1. New Web Service → conectar repo
2. Root Directory: `server`
3. Build Command: `npm install`
4. Start Command: `node src/index.js`
5. Health Check Path: `/health`

La URL del backend se configura en `client/src/utils/api.js`.

---

## 📂 Estructura

```
SafeRoutes-Popayan/
├── client/                     # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/         # Header, LoginModal
│   │   │   ├── Map/            # MapView (Leaflet)
│   │   │   ├── RoutePanel/     # RouteForm, RouteResult
│   │   │   ├── ReportForm/     # ReportPanel (animado)
│   │   │   └── UserProfile/    # ProfilePanel (gamificación)
│   │   ├── utils/              # api.js, auth.js, seedReports.js
│   │   ├── styles/             # CSS brutalist
│   │   └── App.jsx
│   └── vercel.json
├── server/                     # Node.js + Express
│   ├── src/
│   │   ├── algorithms/         # Graph.js, dijkstra.js, astar.js
│   │   ├── data/               # generate-popayan.js (874 nodos)
│   │   ├── routes/             # graphRoutes.js (15 endpoints)
│   │   ├── services/           # graphService.js, osrmService.js
│   │   └── index.js
│   └── package.json
├── database/                   # schema.sql (PostgreSQL + PostGIS)
├── BITACORA.md                 # Registro completo de desarrollo
├── DESIGN.md                   # Sistema de diseño
└── package.json                # Scripts raíz
```

---

## 📊 Datos de Popayán

- **874** intersecciones (nodos)
- **3374** calles (aristas dirigidas)
- **12** zonas con riesgo diferenciado
- **10** landmarks: Parque Caldas, Torre del Reloj, Humilladero, Universidad del Cauca, Terminal, Aeropuerto, Hospital, Coliseo, Estadio, Centro Comercial
- **50** reportes precargados en 8 zonas

---

## 🔐 Rangos de usuario

| Reportes | Rango | Emoji |
|----------|-------|-------|
| 0 | Visitante | 🆕 |
| 1+ | Centinela | 🥉 |
| 10+ | Guardián | 🥈 |
| 50+ | Protector | 🥇 |
| 100+ | Ángel de Popayán | 💎 |

---

## 📝 Proyecto universitario

Estructura de Datos — Colegio Mayor del Cauca

**Integrantes:** Santiago Montano, Sotelo, Luisa
