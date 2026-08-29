PRAGMA foreign_keys = ON;

SELECT 'zone_count' AS check_name, COUNT(*) AS actual, 23 AS expected FROM zones;
SELECT 'route_stop_count' AS check_name, COUNT(*) AS actual, 18 AS expected FROM zones WHERE zone_scope='ROUTE_STOP';
SELECT 'operational_sector_count' AS check_name, COUNT(*) AS actual, 5 AS expected FROM zones WHERE zone_scope='OPERATIONAL_SECTOR';
SELECT 'facility_count' AS check_name, COUNT(*) AS actual, 432 AS expected FROM facilities;
SELECT 'orphan_facilities' AS check_name, COUNT(*) AS actual, 0 AS expected
FROM facilities f LEFT JOIN zones z ON z.zone_id=f.zone_id WHERE z.zone_id IS NULL;
SELECT 'duplicate_facility_ids' AS check_name, COUNT(*) AS actual, 0 AS expected
FROM (SELECT facility_id FROM facilities GROUP BY facility_id HAVING COUNT(*) > 1);
SELECT facility_type, COUNT(*) AS records FROM facilities GROUP BY facility_type ORDER BY facility_type;
PRAGMA foreign_key_check;
