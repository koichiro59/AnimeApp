-- animes テーブルに is_hidden フラグを追加
ALTER TABLE animes ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;

-- 俺だけレベルアップな件（第1期・第2期）を非表示に
UPDATE animes SET is_hidden = TRUE WHERE anilist_id IN (151807, 176496);

-- キャラ一覧RPC: hidden anime のキャラを除外
CREATE OR REPLACE FUNCTION get_characters_list(
    p_offset INTEGER DEFAULT 0,
    p_limit  INTEGER DEFAULT 12,
    p_search TEXT    DEFAULT NULL
)
RETURNS SETOF characters
LANGUAGE sql
STABLE
AS $$
    SELECT c.*
    FROM characters c
    JOIN animes a ON c.anime_id = a.anime_id
    WHERE (p_search IS NULL OR c.name ILIKE '%' || p_search || '%')
      AND (a.is_hidden IS NULL OR a.is_hidden = FALSE)
    ORDER BY
        CASE WHEN c.anime_rank <= 3 THEN 1 ELSE 2 END ASC,
        c.favourites    DESC NULLS LAST,
        a.popularity    DESC NULLS LAST,
        c.anime_rank    ASC  NULLS LAST
    LIMIT  p_limit
    OFFSET p_offset;
$$;
