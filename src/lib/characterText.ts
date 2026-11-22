import type { Character } from '@/types/character'
import type { Anime } from '@/types/anime'

const roleLabel = (role: Character['role']): string | null => {
  if (role === 'MAIN') return '主要キャラクターの一人'
  if (role === 'SUPPORTING') return '作品を支えるサポートキャラクター'
  return null
}

// A/B/O/AB 以外のノイズ値（"Poop" 等）は本文に載せない
const VALID_BLOOD = new Set(['A', 'B', 'O', 'AB'])

/**
 * 既存の構造化フィールドから自然な日本語の紹介文を組み立てる。
 * - 有料APIを使わずにページを「厚く」して薄コンテンツ判定を避ける目的
 * - キャラごとに名前・作品・声優・属性が変わるため内容はユニークになる
 */
export const buildCharacterDescription = (character: Character, anime: Anime | null): string => {
  const sentences: string[] = []
  const name = character.name

  // 1. 導入 + 役割
  const role = roleLabel(character.role)
  if (anime) {
    sentences.push(
      role
        ? `${name}は、アニメ「${anime.title}」に登場する${role}です。`
        : `${name}は、アニメ「${anime.title}」に登場するキャラクターです。`,
    )
  } else {
    sentences.push(`${name}は、アニメ作品に登場するキャラクターです。`)
  }

  // 2. 声優（CV）
  if (character.voice_actor) {
    sentences.push(`声優（CV）は${character.voice_actor}が担当しています。`)
  }

  // 3. プロフィール属性（検索需要の高い 年齢・身長・誕生日・性別・血液型）
  const profile: string[] = []
  if (character.gender && character.gender !== 'なし') profile.push(`性別は${character.gender}`)
  if (character.age != null) profile.push(`年齢は${character.age}歳`)
  if (character.height != null) profile.push(`身長は${character.height}cm`)
  if (character.birthday) profile.push(`誕生日は${character.birthday}`)
  if (character.blood_type && VALID_BLOOD.has(character.blood_type)) profile.push(`血液型は${character.blood_type}型`)
  if (profile.length) sentences.push(`${profile.join('、')}です。`)

  // 4. タグ（特徴）
  if (character.tags && character.tags.length) {
    sentences.push(`${name}の特徴は「${character.tags.slice(0, 5).join('」「')}」などが挙げられます。`)
  }

  // 5. 作品情報で締め
  if (anime?.genres?.length) {
    sentences.push(`登場作品「${anime.title}」のジャンルは${anime.genres.slice(0, 3).join('・')}です。`)
  }

  return sentences.join('')
}

/**
 * ページをインデックス対象にして良いだけの情報量があるか。
 * 名前と性別しか無いような本当に空のページは noindex のままにする。
 */
export const hasRichData = (character: Character): boolean =>
  !!character.description ||
  !!character.voice_actor ||
  (character.tags?.length ?? 0) >= 1 ||
  character.age != null ||
  character.height != null ||
  !!character.birthday
