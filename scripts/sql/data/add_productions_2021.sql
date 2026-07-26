-- 2021年 未マッチ制作会社の追加 (PR0174〜PR0184)
INSERT INTO productions (production_id, name, country) VALUES ('PR0174', 'Visual Flight', '日本') ON CONFLICT DO NOTHING;
INSERT INTO productions (production_id, name, country) VALUES ('PR0175', 'Hoods Entertainment', '日本') ON CONFLICT DO NOTHING;
INSERT INTO productions (production_id, name, country) VALUES ('PR0176', 'NAS', '日本') ON CONFLICT DO NOTHING;
INSERT INTO productions (production_id, name, country) VALUES ('PR0177', 'Vega Entertainment', '日本') ON CONFLICT DO NOTHING;
INSERT INTO productions (production_id, name, country) VALUES ('PR0178', 'Shirogumi', '日本') ON CONFLICT DO NOTHING;
INSERT INTO productions (production_id, name, country) VALUES ('PR0179', 'Bee Media', '日本') ON CONFLICT DO NOTHING;
INSERT INTO productions (production_id, name, country) VALUES ('PR0180', 'WolfsBane', '日本') ON CONFLICT DO NOTHING;
INSERT INTO productions (production_id, name, country) VALUES ('PR0181', 'Hotline', '日本') ON CONFLICT DO NOTHING;
INSERT INTO productions (production_id, name, country) VALUES ('PR0182', 'Sola Digital Arts', '日本') ON CONFLICT DO NOTHING;
INSERT INTO productions (production_id, name, country) VALUES ('PR0183', 'Gambit', '日本') ON CONFLICT DO NOTHING;
INSERT INTO productions (production_id, name, country) VALUES ('PR0184', 'Sublimation', '日本') ON CONFLICT DO NOTHING;

-- アニメの production_id を更新（NULL → 対応する制作会社ID）
UPDATE animes SET production_id = 'PR0174' WHERE anime_id = 'AN1952'; -- EX-ARM エクスアーム
UPDATE animes SET production_id = 'PR0175' WHERE anime_id = 'AN1962'; -- ゲキドル
UPDATE animes SET production_id = 'PR0176' WHERE anime_id = 'AN1968'; -- 真・中華一番! 2
UPDATE animes SET production_id = 'PR0177' WHERE anime_id = 'AN2032'; -- 出会って5秒でバトル
UPDATE animes SET production_id = 'PR0178' WHERE anime_id = 'AN2047'; -- NIGHT HEAD 2041
UPDATE animes SET production_id = 'PR0179' WHERE anime_id = 'AN2050'; -- ゲッターロボ アーク
UPDATE animes SET production_id = 'PR0180' WHERE anime_id = 'AN2062'; -- 真の仲間じゃないと〜辺境でスローライフ
UPDATE animes SET production_id = 'PR0181' WHERE anime_id = 'AN2065'; -- 進化の実～知らないうちに勝ち組人生～
UPDATE animes SET production_id = 'PR0182' WHERE anime_id = 'AN2082'; -- BLADE RUNNER — BLACK LOTUS
UPDATE animes SET production_id = 'PR0183' WHERE anime_id = 'AN2083'; -- テスラノート
UPDATE animes SET production_id = 'PR0184' WHERE anime_id = 'AN2088'; -- シキザクラ
