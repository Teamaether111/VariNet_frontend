PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    password_hash TEXT,
    role TEXT NOT NULL CHECK (role IN ('pilgrim','volunteer','police','temple-authority','admin')),
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0,1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS zones (
    zone_id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    zone_scope TEXT NOT NULL CHECK (zone_scope IN ('OPERATIONAL_SECTOR','ROUTE_STOP')),
    latitude REAL CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
    longitude REAL CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),
    map_x REAL,
    map_y REAL,
    map_width REAL,
    map_height REAL,
    max_safe_capacity INTEGER CHECK (max_safe_capacity IS NULL OR max_safe_capacity >= 0),
    status TEXT NOT NULL DEFAULT 'NORMAL' CHECK (status IN ('NORMAL','MONITORING','INTERVENTION_REQUIRED','DIVERTED','ACTIVE','INACTIVE')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS facilities (
    facility_id TEXT PRIMARY KEY,
    zone_id TEXT NOT NULL,
    name TEXT NOT NULL,
    facility_type TEXT NOT NULL,
    latitude REAL CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
    longitude REAL CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),
    map_x REAL,
    map_y REAL,
    is_temporary INTEGER NOT NULL DEFAULT 0 CHECK (is_temporary IN (0,1)),
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('ACTIVE','INACTIVE','OPEN','BUSY','FULL','MAINTENANCE')),
    capacity INTEGER CHECK (capacity IS NULL OR capacity >= 0),
    capacity_pct REAL CHECK (capacity_pct IS NULL OR capacity_pct BETWEEN 0 AND 100),
    description TEXT,
    source TEXT NOT NULL DEFAULT 'SEED_DEMO',
    verified_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES zones(zone_id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS weather_observations (
    weather_id TEXT PRIMARY KEY,
    zone_id TEXT NOT NULL,
    temperature_c REAL NOT NULL,
    feels_like_c REAL,
    humidity_pct REAL CHECK (humidity_pct IS NULL OR humidity_pct BETWEEN 0 AND 100),
    rain_probability_pct REAL CHECK (rain_probability_pct IS NULL OR rain_probability_pct BETWEEN 0 AND 100),
    wind_speed_kmh REAL,
    condition TEXT,
    heat_risk TEXT CHECK (heat_risk IS NULL OR heat_risk IN ('Low','Moderate','High','Extreme')),
    air_quality_index INTEGER,
    observed_at TEXT NOT NULL,
    FOREIGN KEY (zone_id) REFERENCES zones(zone_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS crowd_observations (
    observation_id TEXT PRIMARY KEY,
    zone_id TEXT NOT NULL,
    crowd_count INTEGER NOT NULL CHECK (crowd_count >= 0),
    crowd_density REAL CHECK (crowd_density IS NULL OR crowd_density >= 0),
    source TEXT NOT NULL DEFAULT 'MANUAL',
    observed_at TEXT NOT NULL,
    FOREIGN KEY (zone_id) REFERENCES zones(zone_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS zone_risk_snapshots (
    risk_id TEXT PRIMARY KEY,
    zone_id TEXT NOT NULL,
    risk_score REAL NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
    risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW','MEDIUM','HIGH','CRITICAL')),
    predicted_issue TEXT,
    confidence REAL CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 100),
    model_version TEXT,
    calculated_at TEXT NOT NULL,
    FOREIGN KEY (zone_id) REFERENCES zones(zone_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS incidents (
    incident_id TEXT PRIMARY KEY,
    incident_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    zone_id TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('LOW','MEDIUM','HIGH','CRITICAL')),
    status TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW','ACKNOWLEDGED','IN_PROGRESS','RESOLVED')),
    reported_by TEXT NOT NULL,
    reported_role TEXT NOT NULL CHECK (reported_role IN ('AI_DETECTION','VOLUNTEER','PILGRIM','POLICE')),
    location_details TEXT,
    latitude REAL,
    longitude REAL,
    map_x REAL,
    map_y REAL,
    assigned_to TEXT,
    evidence_url TEXT,
    audio_note_url TEXT,
    reported_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TEXT,
    FOREIGN KEY (zone_id) REFERENCES zones(zone_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS recommendations (
    recommendation_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    target_zone_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    expected_impact TEXT,
    confidence REAL CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 100),
    status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL' CHECK (status IN ('PENDING_APPROVAL','APPROVED','REJECTED','EXECUTING','COMPLETED')),
    suggested_resources_json TEXT NOT NULL DEFAULT '{}',
    approved_by TEXT,
    approved_at TEXT,
    estimated_resolution_minutes INTEGER,
    prevented_incident_estimate TEXT,
    model_version TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (target_zone_id) REFERENCES zones(zone_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS volunteer_tasks (
    task_id TEXT PRIMARY KEY,
    volunteer_id TEXT,
    title TEXT NOT NULL,
    instruction TEXT NOT NULL,
    zone_id TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('MEDIUM','HIGH','CRITICAL')),
    status TEXT NOT NULL DEFAULT 'ASSIGNED' CHECK (status IN ('ASSIGNED','NAVIGATING','IN_ACTION','EVIDENCE_UPLOADED','COMPLETED')),
    incident_id TEXT,
    recommendation_id TEXT,
    location TEXT,
    description TEXT,
    estimated_minutes INTEGER,
    evidence_photo_url TEXT,
    evidence_notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,
    FOREIGN KEY (volunteer_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (zone_id) REFERENCES zones(zone_id) ON DELETE RESTRICT,
    FOREIGN KEY (incident_id) REFERENCES incidents(incident_id) ON DELETE SET NULL,
    FOREIGN KEY (recommendation_id) REFERENCES recommendations(recommendation_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS temple_queue_snapshots (
    snapshot_id TEXT PRIMARY KEY,
    zone_id TEXT NOT NULL,
    darshan_wait_time_minutes INTEGER NOT NULL CHECK (darshan_wait_time_minutes >= 0),
    sanctum_throughput_per_hour INTEGER NOT NULL CHECK (sanctum_throughput_per_hour >= 0),
    total_in_queue INTEGER NOT NULL CHECK (total_in_queue >= 0),
    vip_gate_status TEXT NOT NULL CHECK (vip_gate_status IN ('FLOWING','RESTRICTED','PAUSED')),
    annachhatra_meals_served_today INTEGER NOT NULL DEFAULT 0,
    recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (zone_id) REFERENCES zones(zone_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS queue_enclosures (
    enclosure_id TEXT PRIMARY KEY,
    snapshot_id TEXT NOT NULL,
    name TEXT NOT NULL,
    current_occupancy INTEGER NOT NULL CHECK (current_occupancy >= 0),
    max_capacity INTEGER NOT NULL CHECK (max_capacity >= 0),
    status TEXT NOT NULL CHECK (status IN ('NORMAL','FILLING','CRITICAL')),
    FOREIGN KEY (snapshot_id) REFERENCES temple_queue_snapshots(snapshot_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
    audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    old_values_json TEXT,
    new_values_json TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_zones_scope ON zones(zone_scope);
CREATE INDEX IF NOT EXISTS idx_facilities_zone_type_status ON facilities(zone_id, facility_type, status);
CREATE INDEX IF NOT EXISTS idx_facilities_coordinates ON facilities(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_crowd_zone_time ON crowd_observations(zone_id, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_risk_zone_time ON zone_risk_snapshots(zone_id, calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_zone_status ON incidents(zone_id, status, priority);
CREATE INDEX IF NOT EXISTS idx_recommendations_status_time ON recommendations(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_volunteer_status ON volunteer_tasks(volunteer_id, status);

COMMIT;
