PRAGMA foreign_keys = ON;
BEGIN TRANSACTION;

INSERT OR IGNORE INTO zones (zone_id,code,name,description,zone_scope,latitude,longitude,status) VALUES
('Z001','Z001','Dehu','Sant Tukaram Maharaj Palkhi starting region','ROUTE_STOP',18.7180,73.7694,'ACTIVE'),
('Z002','Z002','Alandi','Sant Dnyaneshwar Maharaj Palkhi starting region','ROUTE_STOP',18.6775,73.8973,'ACTIVE'),
('Z003','Z003','Pune City','Major urban route location','ROUTE_STOP',18.5204,73.8567,'ACTIVE'),
('Z004','Z004','Loni Kalbhor','Wari route location','ROUTE_STOP',18.4862,74.0220,'ACTIVE'),
('Z005','Z005','Yavat','Wari route location','ROUTE_STOP',18.4780,74.2690,'ACTIVE'),
('Z006','Z006','Varvand','Wari route location','ROUTE_STOP',18.3240,74.5360,'ACTIVE'),
('Z007','Z007','Baramati','Wari route location','ROUTE_STOP',18.1517,74.5777,'ACTIVE'),
('Z008','Z008','Indapur','Wari route location','ROUTE_STOP',18.1180,75.0230,'ACTIVE'),
('Z009','Z009','Akluj','Wari route location','ROUTE_STOP',17.8840,75.0230,'ACTIVE'),
('Z010','Z010','Wakhari','Final convergence point before Pandharpur','ROUTE_STOP',17.7289,75.2586,'ACTIVE'),
('Z011','Z011','Pandharpur','Primary destination and case-study city','ROUTE_STOP',17.6775,75.3283,'ACTIVE'),
('Z012','Z012','Saswad','Wari route location','ROUTE_STOP',18.3435,74.0310,'ACTIVE'),
('Z013','Z013','Jejuri','Wari route location','ROUTE_STOP',18.2760,74.1600,'ACTIVE'),
('Z014','Z014','Phaltan','Wari route location','ROUTE_STOP',17.9910,74.4310,'ACTIVE'),
('Z015','Z015','Natepute','Wari route location','ROUTE_STOP',17.9500,74.8700,'ACTIVE'),
('Z016','Z016','Malshiras','Wari route location','ROUTE_STOP',17.8630,74.9110,'ACTIVE'),
('Z017','Z017','Velapur','Wari route location','ROUTE_STOP',17.8640,75.0340,'ACTIVE'),
('Z018','Z018','Bhandishegaon','Wari route location near Pandharpur','ROUTE_STOP',17.7310,75.2020,'ACTIVE');

INSERT OR IGNORE INTO zones (zone_id,code,name,description,zone_scope,map_x,map_y,map_width,map_height,max_safe_capacity,status) VALUES
('sector-a','Sector A','Chandrabhaga Holy Ghats','Riverfront bathing ghats and gathering area','OPERATIONAL_SECTOR',50,350,280,180,85000,'NORMAL'),
('sector-b','Sector B','Vitthal Temple Quad & Mahadwar','Temple enclosure and queue entrance','OPERATIONAL_SECTOR',380,220,260,210,50000,'MONITORING'),
('sector-c','Sector C','Palkhi Marg & VIP Junction','Primary procession spine and junction','OPERATIONAL_SECTOR',320,460,340,200,70000,'NORMAL'),
('sector-d','Sector D','Gopalpur Base Camp & Shelters','Resting camp, food distribution and medical hub','OPERATIONAL_SECTOR',680,380,270,230,120000,'NORMAL'),
('sector-e','Sector E','Station Depot & Outer Parking','Railway, bus and ring-road transit hub','OPERATIONAL_SECTOR',420,50,320,160,60000,'NORMAL');

COMMIT;
