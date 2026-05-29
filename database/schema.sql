-- SafeRoutes Popayán - Esquema PostgreSQL + PostGIS
-- Para usar cuando se migre de almacenamiento en memoria a base de datos

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE zones (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  risk_level DECIMAL(3,2) DEFAULT 0.50,
  commerce_presence DECIMAL(3,2) DEFAULT 0.50,
  police_presence DECIMAL(3,2) DEFAULT 0.50,
  cai_nearby BOOLEAN DEFAULT false,
  illumination DECIMAL(3,2) DEFAULT 0.50,
  description TEXT,
  geom GEOMETRY(POLYGON, 4326),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE nodes (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  lat DECIMAL(10,7) NOT NULL,
  lng DECIMAL(10,7) NOT NULL,
  zone_id INTEGER REFERENCES zones(id),
  geom GEOMETRY(POINT, 4326),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE edges (
  id VARCHAR(10) PRIMARY KEY,
  from_node VARCHAR(10) REFERENCES nodes(id),
  to_node VARCHAR(10) REFERENCES nodes(id),
  name VARCHAR(200),
  distance_meters DECIMAL(10,2),
  geom GEOMETRY(LINESTRING, 4326),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE report_types (
  id VARCHAR(20) PRIMARY KEY,
  label VARCHAR(100) NOT NULL,
  base_weight DECIMAL(3,2) DEFAULT 0.50,
  color VARCHAR(7) DEFAULT '#6B7280'
);

CREATE TABLE reports (
  id VARCHAR(30) PRIMARY KEY,
  edge_id VARCHAR(10) REFERENCES edges(id),
  type VARCHAR(20) REFERENCES report_types(id),
  description TEXT,
  username VARCHAR(100) NOT NULL,
  geom GEOMETRY(POINT, 4326),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_nodes_zone ON nodes(zone_id);
CREATE INDEX idx_edges_from ON edges(from_node);
CREATE INDEX idx_edges_to ON edges(to_node);
CREATE INDEX idx_reports_edge ON reports(edge_id);
CREATE INDEX idx_reports_created ON reports(created_at DESC);
CREATE INDEX idx_nodes_geom ON nodes USING GIST(geom);
CREATE INDEX idx_edges_geom ON edges USING GIST(geom);
