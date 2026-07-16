-- anime_rank をロール基準で再計算
-- backfill_character_favourites.sql が favourites 順で上書きしていたため修正
-- 順序: MAIN(1) → SUPPORTING(2) → BACKGROUND(3)、同一ロール内は favourites 降順
UPDATE characters c SET anime_rank = sub.rank
FROM (
    SELECT character_id,
           ROW_NUMBER() OVER (
               PARTITION BY anime_id
               ORDER BY
                   CASE WHEN role = 'MAIN' THEN 1 ELSE 2 END,
                   favourites DESC NULLS LAST
           ) AS rank
    FROM characters
) sub
WHERE c.character_id = sub.character_id;
