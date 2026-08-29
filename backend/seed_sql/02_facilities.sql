/*
Synthetic VARI-Net demonstration facilities.

Creates exactly 432 facilities:
- 72 medical facilities
- 72 toilets
- 72 water points
- 72 police posts
- 72 food-distribution points
- 72 shelters

The facilities are distributed cyclically across all 23 zones.
*/

WITH RECURSIVE facility_numbers(number) AS (
    SELECT 1

    UNION ALL

    SELECT number + 1
    FROM facility_numbers
    WHERE number < 432
)
INSERT OR IGNORE INTO facilities (
    id,
    zone_id,
    name,
    facility_type,
    latitude,
    longitude,
    capacity,
    current_availability,
    status,
    contact_number
)
SELECT
    printf('FAC-%04d', number),

    printf(
        'ZONE-%03d',
        ((number - 1) % 23) + 1
    ),

    CASE ((number - 1) % 6)
        WHEN 0 THEN 'Medical Camp ' || printf('%03d', number)
        WHEN 1 THEN 'Public Toilet ' || printf('%03d', number)
        WHEN 2 THEN 'Jal Seva Point ' || printf('%03d', number)
        WHEN 3 THEN 'Police Help Post ' || printf('%03d', number)
        WHEN 4 THEN 'Food Distribution Point ' || printf('%03d', number)
        WHEN 5 THEN 'Pilgrim Shelter ' || printf('%03d', number)
    END,

    CASE ((number - 1) % 6)
        WHEN 0 THEN 'MEDICAL'
        WHEN 1 THEN 'TOILET'
        WHEN 2 THEN 'WATER'
        WHEN 3 THEN 'POLICE'
        WHEN 4 THEN 'FOOD'
        WHEN 5 THEN 'SHELTER'
    END,

    /* Demonstration coordinates around each assigned zone */
    (
        SELECT z.latitude
        FROM zones AS z
        WHERE z.id = printf(
            'ZONE-%03d',
            ((number - 1) % 23) + 1
        )
    ) + (((number - 1) % 5) - 2) * 0.00018,

    (
        SELECT z.longitude
        FROM zones AS z
        WHERE z.id = printf(
            'ZONE-%03d',
            ((number - 1) % 23) + 1
        )
    ) + (((number - 1) % 7) - 3) * 0.00018,

    CASE ((number - 1) % 6)
        WHEN 0 THEN 50
        WHEN 1 THEN 20
        WHEN 2 THEN 300
        WHEN 3 THEN 15
        WHEN 4 THEN 500
        WHEN 5 THEN 200
    END,

    CASE ((number - 1) % 6)
        WHEN 0 THEN 35
        WHEN 1 THEN 15
        WHEN 2 THEN 240
        WHEN 3 THEN 10
        WHEN 4 THEN 400
        WHEN 5 THEN 150
    END,

    'AVAILABLE',
    ''

FROM facility_numbers;
