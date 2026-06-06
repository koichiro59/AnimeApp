import type { Anime } from '../types/anime'
import type { Character } from '../types/character'

export const sampleAnimes: Anime[] = [
    {
        id: 1,
        title: '進撃の巨人',
        genre: ['アクション', 'ダーク'],
        year: 2013,
        synopsis: '巨人が支配する世界で人類の存続をかけた戦いを描く。',
        imageUrl: 'https://placehold.co/300x420?text=AoT',
        rating: 4.8,
    },
    {
        id: 2,
        title: '鬼滅の刃',
        genre: ['アクション', '和風'],
        year: 2019,
        synopsis: '鬼と化した妹を人間に戻すため、炭治郎が鬼殺隊として戦う。',
        imageUrl: 'https://placehold.co/300x420?text=KnY',
        rating: 4.7,
    },
    {
        id: 3,
        title: 'SPY×FAMILY',
        genre: ['コメディ', 'アクション'],
        year: 2022,
        synopsis: 'スパイ・殺し屋・超能力者が偽の家族を演じながら任務を遂行する。',
        imageUrl: 'https://placehold.co/300x420?text=SPY',
        rating: 4.6,
    },
    {
        id: 4,
        title: 'チェンソーマン',
        genre: ['アクション', 'ダーク'],
        year: 2022,
        synopsis: 'チェンソーの悪魔と合体したデンジがデビルハンターとして活躍する。',
        imageUrl: 'https://placehold.co/300x420?text=CSM',
        rating: 4.5,
    },
]

export const sampleCharacters: Character[] = [
    {
        id: 1,
        animeId: 1,
        name: 'エレン・イェーガー',
        role: '主人公',
        age: 15,
        description: '巨人に復讐を誓う少年。強い意志と自由への渇望を持つ。',
        imageUrl: 'https://placehold.co/200x280?text=Eren',
    },
    {
        id: 2,
        animeId: 1,
        name: 'ミカサ・アッカーマン',
        role: 'ヒロイン',
        age: 15,
        description: 'エレンを守るために戦う天才兵士。冷静沈着で戦闘力は随一。',
        imageUrl: 'https://placehold.co/200x280?text=Mikasa',
    },
    {
        id: 3,
        animeId: 2,
        name: '竈門炭治郎',
        role: '主人公',
        age: 13,
        description: '鬼と化した妹を救うため鬼殺隊に入隊した優しき少年。',
        imageUrl: 'https://placehold.co/200x280?text=Tanjiro',
    },
    {
        id: 4,
        animeId: 2,
        name: '竈門禰豆子',
        role: 'ヒロイン',
        age: 12,
        description: '鬼になりながらも人を襲わない炭治郎の妹。',
        imageUrl: 'https://placehold.co/200x280?text=Nezuko',
    },
    {
        id: 5,
        animeId: 3,
        name: 'ロイド・フォージャー',
        role: '主人公',
        age: null,
        description: '凄腕スパイ。任務のため偽の家族を作ることになる。',
        imageUrl: 'https://placehold.co/200x280?text=Loid',
    },
]