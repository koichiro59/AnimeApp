-- キャラ一覧取得RPC（再作成）
-- 表示ルール：各アニメの上位3キャラ（anime_rank <= 3）を先に、残りを後続に
-- ソート：① 上位3か否か → ② キャラのお気に入り数（個人人気）の高い順 → ③ アニメ人気順

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
    ORDER BY
        CASE WHEN c.anime_rank <= 3 THEN 1 ELSE 2 END ASC,
        c.favourites    DESC NULLS LAST,
        a.popularity    DESC NULLS LAST,
        c.anime_rank    ASC  NULLS LAST
    LIMIT  p_limit
    OFFSET p_offset;
$$;
