import type { Anime } from '../types/anime'
import type { Character } from '../types/character'

export const sampleAnimes: Anime[] = [
  {
    id: 1,
    anilistId: 16498, // AniList上の進撃の巨人のID
    title: '進撃の巨人',
    genre: ['アクション', 'ダーク'],
    year: 2013,
    synopsis: '巨人が支配する世界で人類の存続をかけた戦いを描く。',
    rating: 4.8,
  },
  {
    id: 2,
    anilistId: 101922, // 鬼滅の刃
    title: '鬼滅の刃',
    genre: ['アクション', '和風'],
    year: 2019,
    synopsis: '鬼と化した妹を人間に戻すため、炭治郎が鬼殺隊として戦う。',
    rating: 4.7,
  },
  {
    id: 3,
    anilistId: 140960, // SPY×FAMILY
    title: 'SPY×FAMILY',
    genre: ['コメディ', 'アクション'],
    year: 2022,
    synopsis: 'スパイ・殺し屋・超能力者が偽の家族を演じながら任務を遂行する。',
    rating: 4.6,
  },
  {
    id: 4,
    anilistId: 127230, // チェンソーマン
    title: 'チェンソーマン',
    genre: ['アクション', 'ダーク'],
    year: 2022,
    synopsis: 'チェンソーの悪魔と合体したデンジがデビルハンターとして活躍する。',
    rating: 4.5,
  },
]

export const sampleCharacters: Character[] = [
  {
    id: 1,
    animeId: 1,
    anilistId: 40882, // エレン・イェーガー
    name: 'エレン・イェーガー',
    role: '主人公',
    age: 15,
    description: '巨人に復讐を誓う少年。強い意志と自由への渇望を持つ。',
    abilities: ['巨人化', '始祖の巨人', '進撃の巨人'],
    personality: '熱血で意志が強く、自由のためなら何でもする。時に暴走することも。',
    firstAppearance: '第1話「二千年後の君へ」',
  },
  {
    id: 2,
    animeId: 1,
    anilistId: 40881, // ミカサ
    name: 'ミカサ・アッカーマン',
    role: 'ヒロイン',
    age: 15,
    description: 'エレンを守るために戦う天才兵士。冷静沈着で戦闘力は随一。',
    abilities: ['アッカーマンの力', '立体機動装置の達人'],
    personality: '冷静で寡黙。エレンへの深い愛情を持つ。',
    firstAppearance: '第1話「二千年後の君へ」',
  },
  {
    id: 3,
    animeId: 2,
    anilistId: 118737, // 炭治郎
    name: '竈門炭治郎',
    role: '主人公',
    age: 13,
    description: '鬼と化した妹を救うため鬼殺隊に入隊した優しき少年。',
    abilities: ['水の呼吸', 'ヒノカミ神楽', '嗅覚'],
    personality: '誰に対しても優しく、鬼にすら同情できる心を持つ。',
    firstAppearance: '第1話「残酷」',
  },
  {
    id: 4,
    animeId: 2,
    anilistId: 118738, // 禰豆子
    name: '竈門禰豆子',
    role: 'ヒロイン',
    age: 12,
    description: '鬼になりながらも人を襲わない炭治郎の妹。',
    abilities: ['血鬼術・爆血', '身体の縮小・拡大'],
    personality: '無口だが家族思いで勇敢。人間への優しさを失っていない。',
    firstAppearance: '第1話「残酷」',
  },
  {
    id: 5,
    animeId: 3,
    anilistId: 138101, // ロイド
    name: 'ロイド・フォージャー',
    role: '主人公',
    age: null,
    description: '凄腕スパイ。任務のため偽の家族を作ることになる。',
    abilities: ['変装', '格闘術', '情報収集'],
    personality: '冷静沈着で頭脳明晰。任務に忠実だが家族への愛情が芽生えていく。',
    firstAppearance: '第1話「オペレーション〈梟〉」',
  },
]

