UPDATE characters SET role = 'MAIN', favourites = 4637 WHERE character_id = 'CH006838';
UPDATE characters SET role = 'MAIN', favourites = 7261 WHERE character_id = 'CH006839';
UPDATE characters SET role = 'SUPPORTING', favourites = 6138 WHERE character_id = 'CH006840';
UPDATE characters SET role = 'SUPPORTING', favourites = 82 WHERE character_id = 'CH006841';
UPDATE characters SET role = 'SUPPORTING', favourites = 0 WHERE character_id = 'CH006842';
UPDATE characters SET role = 'SUPPORTING', favourites = 27 WHERE character_id = 'CH006843';
UPDATE characters SET role = 'SUPPORTING', favourites = 6 WHERE character_id = 'CH006844';
UPDATE characters SET role = 'SUPPORTING', favourites = 236 WHERE character_id = 'CH006845';
UPDATE characters SET role = 'SUPPORTING', favourites = 9 WHERE character_id = 'CH006846';
UPDATE characters SET role = 'SUPPORTING', favourites = 106 WHERE character_id = 'CH006847';
UPDATE characters SET role = 'SUPPORTING', favourites = 0 WHERE character_id = 'CH006848';
UPDATE characters SET role = 'SUPPORTING', favourites = 6 WHERE character_id = 'CH006849';
UPDATE characters SET role = 'SUPPORTING', favourites = 2172 WHERE character_id = 'CH006850';
UPDATE characters SET role = 'SUPPORTING', favourites = 1 WHERE character_id = 'CH006851';
UPDATE characters SET role = 'SUPPORTING', favourites = 116 WHERE character_id = 'CH006852';
UPDATE characters SET role = 'SUPPORTING', favourites = 120 WHERE character_id = 'CH006853';
UPDATE characters SET role = 'SUPPORTING', favourites = 0 WHERE character_id = 'CH006854';
UPDATE characters SET role = 'SUPPORTING', favourites = 3 WHERE character_id = 'CH006855';
UPDATE characters SET role = 'SUPPORTING', favourites = 1765 WHERE character_id = 'CH006856';
UPDATE characters SET role = 'SUPPORTING', favourites = 0 WHERE character_id = 'CH006857';
UPDATE characters SET role = 'SUPPORTING', favourites = 5 WHERE character_id = 'CH006858';
UPDATE characters SET role = 'SUPPORTING', favourites = 28 WHERE character_id = 'CH006859';
UPDATE characters SET role = 'SUPPORTING', favourites = 0 WHERE character_id = 'CH006860';
UPDATE characters SET role = 'SUPPORTING', favourites = 844 WHERE character_id = 'CH006861';
UPDATE characters SET role = 'SUPPORTING', favourites = 116 WHERE character_id = 'CH006862';
UPDATE characters SET role = 'SUPPORTING', favourites = 7 WHERE character_id = 'CH009770';
UPDATE characters SET role = 'SUPPORTING', favourites = 9 WHERE character_id = 'CH009771';
UPDATE characters SET role = 'SUPPORTING', favourites = 28 WHERE character_id = 'CH009772';
UPDATE characters SET role = 'SUPPORTING', favourites = 7 WHERE character_id = 'CH009773';
UPDATE characters SET role = 'SUPPORTING', favourites = 615 WHERE character_id = 'CH009774';
UPDATE characters SET role = 'SUPPORTING', favourites = 5 WHERE character_id = 'CH009775';
UPDATE characters SET role = 'SUPPORTING', favourites = 6 WHERE character_id = 'CH009776';
UPDATE characters SET role = 'SUPPORTING', favourites = 28 WHERE character_id = 'CH009777';
UPDATE characters SET role = 'SUPPORTING', favourites = 0 WHERE character_id = 'CH009778';
UPDATE characters SET role = 'SUPPORTING', favourites = 4 WHERE character_id = 'CH009779';
UPDATE characters SET role = 'SUPPORTING', favourites = 78 WHERE character_id = 'CH009780';
UPDATE characters SET role = 'SUPPORTING', favourites = 258 WHERE character_id = 'CH009781';
UPDATE characters SET role = 'SUPPORTING', favourites = 1 WHERE character_id = 'CH009782';
UPDATE characters SET role = 'SUPPORTING', favourites = 333 WHERE character_id = 'CH009783';
UPDATE characters SET role = 'SUPPORTING', favourites = 1 WHERE character_id = 'CH008057';

-- anime_rank 再計算
UPDATE characters c SET anime_rank = sub.rank
FROM (
    SELECT character_id,
           ROW_NUMBER() OVER (
               PARTITION BY anime_id
               ORDER BY
                   CASE role WHEN 'MAIN' THEN 1 WHEN 'SUPPORTING' THEN 2 ELSE 3 END,
                   favourites DESC NULLS LAST
           ) AS rank
    FROM characters
) sub
WHERE c.character_id = sub.character_id;