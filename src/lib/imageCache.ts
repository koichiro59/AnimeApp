// 取得済み画像URLをメモリにキャッシュする
const animeImageCache: Record<number, string> = {}
const characterImageCache: Record<number, string> = {}

export const getAnimeImageCache = () => animeImageCache
export const getCharacterImageCache = () => characterImageCache

export const setAnimeImageCache = (data: Record<number, string>) => {
  Object.assign(animeImageCache, data)
}

export const setCharacterImageCache = (data: Record<number, string>) => {
  Object.assign(characterImageCache, data)
}
