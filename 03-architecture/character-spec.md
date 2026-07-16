# キャラクターデータ仕様・優先度

## フィールド優先度

### 必須（Priority 1）
表示・検索の根幹。欠けていると機能が成立しない。

| フィールド | 理由 |
|---|---|
| `character_id` | 内部識別子 |
| `anime_id` | 紐付け先アニメ |
| `name` | キャラ名（日本語優先、なければ英語名） |

### 重要（Priority 2）
詳細ページの主要表示項目。取得できない場合は「－」表示。

| フィールド | 表示ラベル | 備考 |
|---|---|---|
| `image_url` | （画像） | AniList `image.large` |
| `gender` | 性別 | `男性` / `女性` / `なし` に正規化 |
| `age` | 年齢 | 数値のみ（単位は表示側で付与） |
| `birthday` | 誕生日 | `X月X日` 形式（年なし） |
| `height` | 身長 | cm（description内テキストから抽出） |
| `voice_actor` | 声優 | 日本語声優のみ |

### 補助（Priority 3）
あれば表示、なくても問題なし。

| フィールド | 表示ラベル | 備考 |
|---|---|---|
| `description` | 説明文 | 英語→DeepL翻訳済み、最大500文字 |
| `tags` | 属性タグ | 手動付与 |
| `blood_type` | 血液型 | 現状UIで未使用 |

### 将来対応（Priority 4）
型定義・DBカラムは存在するが現状UIで未使用。

| フィールド | 備考 |
|---|---|
| `weight` | 身長と同様にdescriptionから抽出予定 |
| `popularity` | ソート・ランキング機能実装時に使用予定 |
| `favourites` | 同上 |
| `anime_rank` | 同上 |

---

## データ取得元の優先順位

| フィールド | 第1優先 | 第2優先 | フォールバック |
|---|---|---|---|
| `name` | AniList `name.native`（日本語） | AniList `name.full` | null→スキップ |
| `description` | AniList `description`（日本語そのまま） | AniList `description`（英語→DeepL翻訳） | null |
| `image_url` | AniList `image.large` | — | null（プレースホルダー表示） |
| `birthday` | AniList `dateOfBirth` | — | null |
| `height` | AniList `description` 内の `Height: Xcm` | — | null |
| `voice_actor` | AniList `voiceActors[0].name.native` | — | null |

---

## 取得対象キャラのフィルタ条件

- AniListロールが `MAIN` または `SUPPORTING`（`BACKGROUND` はスキップ）
- `name` が取得できないキャラはスキップ
- `anilist_id` の重複はスキップ（同一キャラが複数アニメに登場しても1件のみ登録）

---

## ID体系

| エンティティ | 形式 | 例 | 管理場所 |
|---|---|---|---|
| アニメ | `AN` + 4桁 | `AN0001` | `scripts/counter.json` |
| キャラ | `CH` + 6桁 | `CH000001` | `scripts/counter.json` |

---

## 未完了TODO

- [ ] `image_url` の表示をAniList API経由→DBカラム直接参照に変更（`CharacterDetailPage.tsx`）
- [ ] `weight` のUI表示追加
- [ ] `fix_anilist_ids.sql`（韓中キャラ287件）のSupabase適用確認
