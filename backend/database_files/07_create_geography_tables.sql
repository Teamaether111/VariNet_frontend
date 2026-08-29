PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

/*
The zones and facilities tables already exist from earlier stages.

Current canonical key names:
- zones.id
- facilities.id
- facilities.zone_id → zones.id
*/

CREATE INDEX IF NOT EXISTS idx_zones_id
ON zones(id);

CREATE INDEX IF NOT EXISTS idx_facilities_zone
ON facilities(zone_id);

CREATE INDEX IF NOT EXISTS idx_facilities_type
ON facilities(facility_type);

CREATE INDEX IF NOT EXISTS idx_facilities_status
ON facilities(status);

CREATE INDEX IF NOT EXISTS idx_facilities_zone_type_status
ON facilities(zone_id, facility_type, status);

CREATE INDEX IF NOT EXISTS idx_facilities_coordinates
ON facilities(latitude, longitude);

COMMIT;