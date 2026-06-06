export type Anime = {
    id: number
    title: { native: string }
    genres: string[]
    startDate: { year: number }
    description: string
    coverImage: { large: string }
    averageScore: number
}