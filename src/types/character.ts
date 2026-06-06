export type Character = {
    role: string
    node: {
        id: number
        name: { native: string; full: string }
        image: { large: string }
        description: string
        age: string | null
    }
}