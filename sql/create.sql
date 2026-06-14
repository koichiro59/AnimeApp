-- 制作会社テーブル
CREATE TABLE productions (
  production_id CHAR(8) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  country VARCHAR(50)
);

-- アニメテーブル
CREATE TABLE animes (
  anime_id CHAR(6) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  broadcast_season VARCHAR(20),
  production_id CHAR(8) REFERENCES productions(production_id),
  type VARCHAR(50),
  episodes INT,
  author VARCHAR(100),
  synopsis TEXT,
  anilist_id INT
);

-- ジャンルテーブル
CREATE TABLE genres (
  genre_id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

-- アニメ×ジャンル中間テーブル
CREATE TABLE anime_genres (
  anime_id CHAR(6) REFERENCES animes(anime_id) ON DELETE CASCADE,
  genre_id INT REFERENCES genres(genre_id) ON DELETE CASCADE,
  PRIMARY KEY (anime_id, genre_id)
);

-- キャラクターテーブル
CREATE TABLE characters (
  character_id CHAR(8) PRIMARY KEY,
  anime_id CHAR(6) REFERENCES animes(anime_id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  age INT,
  gender VARCHAR(20),
  height INT,
  weight INT,
  anilist_id INT
);