export type Character = {
    id: number
    animeId: number
    name: string
    role: '主人公' | 'ヒロイン' | '敵' | 'サブキャラ'
    age: number | null
    description: string
    imageUrl: string
}