# キャラクター表示順仕様

## キャラ一覧ページ（`/characters`）

Supabase RPC `get_characters_list` による並び順。

### 優先度（高い順）

| 優先度 | 条件 | 説明 |
|---|---|---|
| 1 | `anime_rank <= 3` | 各アニメの主要キャラ（上位3位）を先頭グループに |
| 2 | `favourites DESC` | キャラのお気に入り数が多い順（NULL は末尾） |
| 3 | `a.popularity DESC` | 紐付けアニメの人気度が高い順（NULL は末尾） |
| 4 | `anime_rank ASC` | アニメ内の登場順（NULL は末尾） |

```sql
ORDER BY
    CASE WHEN c.anime_rank <= 3 THEN 1 ELSE 2 END ASC,
    c.favourites  DESC NULLS LAST,
    a.popularity  DESC NULLS LAST,
    c.anime_rank  ASC  NULLS LAST
```

**意図：** 有名作品の主人公・ヒロインクラスが上位に来るよう、「主要キャラかどうか」を最優先にしている。

---

## アニメ詳細ページのキャラプレビュー（上位3件）

関数：`fetchCharactersPreview`

```
① favourites DESC（お気に入り数の多い順）
② anime_rank ASC（アニメ内登場順）
```

**意図：** そのアニメで人気のキャラを先に見せる。

---

## アニメ詳細ページのキャラ全件表示

関数：`fetchCharactersByAnimeId`

ソート指定なし → **DB登録順**（= `fetchAndGenerateSQL.ts` でAniListから取得した順＝ROLE順）

---

## `anime_rank` の定義

AniList API から `sort: ROLE` で取得した際の登場順インデックス（1始まり）。

- 1〜3 = MAIN クラス（主要キャラ）
- 4以降 = SUPPORTING クラス（サブキャラ）
- BACKGROUND キャラは取得対象外

`scripts/backfill_character_roles.sql` でバックフィル済み。
