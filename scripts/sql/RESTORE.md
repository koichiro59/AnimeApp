# DB 復旧手順

## ディレクトリ構成

```
sql/
├── data/         年別の基本データ（アニメ・キャラ・ジャンル等）
├── patches/      適用済みパッチ（番号順に実行）
├── functions/    RPC関数・ビュー等
└── RESTORE.md    本ファイル
```

## 復旧手順

### Step 1: スキーマ（テーブル定義）の復元

Supabase ダッシュボード → **Project Settings > Database > Backups** からスナップショットを復元するか、
`supabase db dump --schema-only` でエクスポートしたスキーマを適用する。

テーブル一覧:
- `animes`
- `characters`
- `genres`
- `anime_genres`
- `productions`

### Step 2: 基本データの適用（data/）

Supabase SQL Editor で以下の順番に実行する。

```
data/output_2024.sql
data/output_2025.sql
data/output_2026.sql
```

### Step 3: パッチの適用（patches/）

**番号順に全て実行する。** 途中でエラーが出ても `ON CONFLICT DO NOTHING` があるため継続可。

| ファイル | 内容 | 状態 |
|---|---|---|
| `01_backfill_characters.sql` | 追加キャラ（メイン） | 適用済 |
| `02_backfill_characters_part1.sql` | 追加キャラ（分割1） | 適用済 |
| `03_backfill_characters_part2.sql` | 追加キャラ（分割2） | 適用済 |
| `04_backfill_characters_part3.sql` | 追加キャラ（分割3） | 適用済 |
| `05_backfill_characters_part4.sql` | 追加キャラ（分割4） | 適用済 |
| `06_backfill_character_roles.sql` | キャラ role の設定 | 適用済 |
| `07_backfill_character_favourites.sql` | キャラ favourites 設定 | 適用済 |
| `08_backfill_popularity.sql` | キャラ popularity 設定 | 適用済 |
| `09_backfill_tags.sql` | キャラ tags 設定 | 適用済 |
| `10_fix_dandadan_roles.sql` | Dandadan キャラの role 修正 | 適用済 |
| `11_fix_anime_rank.sql` | anime_rank を role 基準で再計算 | 適用済 |
| `12_hide_solo_leveling_s2.sql` | ソロレベリング S2 の非表示設定 | 適用済 |
| `90_fix_anilist_ids.sql` | 韓中キャラの anilist_id 修正（287件） | **未適用** |
| `91_backfill_missing_data.sql` | role・favourites の不足データ補完 | **未適用** |

> **注意**: `90_` および `91_` は未適用。Supabase SQL Editor で実行すること。

### Step 4: RPC 関数の適用（functions/）

```
functions/create_character_list_rpc.sql
```

## 新規データ追加時の手順

1. `npx tsx scripts/fetchAndGenerateSQL.ts <年>` を実行
2. 生成された `sql/data/output_<年>.sql` を Supabase SQL Editor で実行
3. 不足データがある場合: `npx tsx scripts/generateMissingDataSQL.ts` を実行
4. 生成された `sql/patches/91_backfill_missing_data.sql` を適用
