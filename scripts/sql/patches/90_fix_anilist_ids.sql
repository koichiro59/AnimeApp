-- =============================================
-- anilist_id 欠損 & キャラ未登録 修正 SQL
-- 生成日時: 2026-07-05T15:00:32.522Z
-- =============================================

-- ==================
-- アニメ anilist_id 修正
-- ==================
-- 対象なし

-- ==================
-- キャラクター 未登録分 INSERT
-- 対象アニメ: 30 件
-- ==================

INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013694', 'AN0918', 'Jin-U Seong', NULL, 23, '男性', 129928) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013695', 'AN0918', 'Yun-Ho Baek', NULL, NULL, '男性', 136077) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013696', 'AN0918', 'Chi-Yul Song', NULL, NULL, '男性', 136073) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013697', 'AN0918', 'Jeong-Ho Kang', NULL, NULL, NULL, 323589) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013698', 'AN0918', 'Seok-Min', NULL, NULL, NULL, 326060) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013699', 'AN0918', 'Ki-Hoon Son', NULL, NULL, '男性', 184541) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013700', 'AN0918', 'Ju-Hui Lee', NULL, NULL, '女性', 136074) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013701', 'AN0918', 'Geon-Hui Go', NULL, NULL, '男性', 138792) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013702', 'AN0918', 'Hye-Yeong Ra', NULL, NULL, NULL, 323591) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013703', 'AN0918', 'Jin-Seok', NULL, NULL, NULL, 326066) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013704', 'AN0918', 'Sang-Min Ahn', NULL, NULL, '男性', 306652) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013705', 'AN0918', 'Jin-A Seong', NULL, NULL, '女性', 138791) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013706', 'AN0918', 'Sin Sang', NULL, NULL, NULL, 210102) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013707', 'AN0918', 'Yu-Jeong An', NULL, NULL, NULL, 323592) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013708', 'AN0918', 'Jun-Tae Gu', NULL, NULL, NULL, 326067) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013709', 'AN0918', 'Laura', NULL, NULL, '女性', 210099) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013710', 'AN0918', 'Ki-Cheol Hyeon', NULL, NULL, '男性', 306680) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013711', 'AN0918', 'Dong-Hun Jeong', NULL, NULL, NULL, 323593) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013712', 'AN0918', 'Iron', NULL, NULL, NULL, 184956) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013713', 'AN0918', 'Jin-Seong Yu', NULL, NULL, '男性', 331026) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013714', 'AN0918', 'Jin-Cheol U', NULL, NULL, '男性', 136819) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013715', 'AN0918', 'Byeong-Gu Min', NULL, NULL, '男性', 148789) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013716', 'AN0918', 'Gu-Hyeon Kim', NULL, NULL, NULL, 324332) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013717', 'AN0918', 'Hee-Jin Park', NULL, NULL, '女性', 184538) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013718', 'AN0918', 'Dong-Suk Hwang', NULL, NULL, '男性', 306666) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013719', 'AN0918', 'Myung-Hwan Go', NULL, NULL, '男性', 306678) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013720', 'AN0918', 'Myung-Han Yu', NULL, NULL, '男性', 184530) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013721', 'AN0918', 'Igris', NULL, NULL, '男性', 145722) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013722', 'AN0918', 'Hae-In Cha', NULL, 23, '女性', 138789) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013723', 'AN0918', 'Eun-Seok', NULL, NULL, '男性', 323043) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013724', 'AN0918', 'Song-I Han', NULL, NULL, '女性', 138793) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013725', 'AN0918', 'Tae-Shik Kang', NULL, NULL, '男性', 181155) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013726', 'AN0918', 'Kyu-Hwan Jo', NULL, NULL, '男性', 306638) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013727', 'AN0918', 'Dong-Su Hwang', NULL, NULL, '男性', 136075) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013728', 'AN0918', 'Jin-Ho Yu', NULL, 22, '男性', 136076) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013729', 'AN0918', 'Beom-Shik Park', NULL, NULL, '男性', 306673) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013730', 'AN0918', 'Seong-Chul Yun', NULL, NULL, NULL, 323582) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013731', 'AN0918', 'Cheol-Jin Lee', NULL, NULL, '男性', 306675) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013732', 'AN0918', 'Gina', NULL, NULL, '女性', 210098) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013733', 'AN0918', 'Jong-In Choi', NULL, NULL, '男性', 138794) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013734', 'AN0918', 'Sang-Sik Kim', NULL, NULL, '男性', 306674) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013735', 'AN0918', 'Myeong Jo', NULL, NULL, NULL, 323588) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013736', 'AN0918', 'Jae-Hwan Ju', NULL, NULL, '男性', 210101) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013737', 'AN0918', 'Bo-Ra Lee', NULL, 23, '女性', 326616) ON CONFLICT DO NOTHING; -- 俺だけレベルアップな件
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013738', 'AN0929', 'Higan', NULL, NULL, '男性', 326717) ON CONFLICT DO NOTHING; -- Ninja Kamui
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013739', 'AN0929', 'Emma Samanda', NULL, NULL, NULL, 326719) ON CONFLICT DO NOTHING; -- Ninja Kamui
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013740', 'AN0929', 'Kagari', NULL, NULL, NULL, 327166) ON CONFLICT DO NOTHING; -- Ninja Kamui
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013741', 'AN0929', 'Mike Moriss', NULL, NULL, '男性', 326720) ON CONFLICT DO NOTHING; -- Ninja Kamui
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013742', 'AN0929', 'Joseph', NULL, NULL, '男性', 327163) ON CONFLICT DO NOTHING; -- Ninja Kamui
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013743', 'AN0929', 'Zai', NULL, NULL, '男性', 327167) ON CONFLICT DO NOTHING; -- Ninja Kamui
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013744', 'AN0929', 'Jason Cardenas', NULL, NULL, '男性', 329916) ON CONFLICT DO NOTHING; -- Ninja Kamui
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013745', 'AN0929', 'Boss Ninja', NULL, NULL, NULL, 326722) ON CONFLICT DO NOTHING; -- Ninja Kamui
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013746', 'AN0929', 'Yamaji', NULL, NULL, '男性', 327169) ON CONFLICT DO NOTHING; -- Ninja Kamui
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013747', 'AN0929', 'Big D', NULL, NULL, '男性', 328620) ON CONFLICT DO NOTHING; -- Ninja Kamui
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013748', 'AN0929', 'Mari', NULL, NULL, '女性', 326723) ON CONFLICT DO NOTHING; -- Ninja Kamui
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013749', 'AN0929', 'Eddie Read', NULL, NULL, '男性', 327168) ON CONFLICT DO NOTHING; -- Ninja Kamui
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013750', 'AN0929', 'Lil', NULL, NULL, NULL, 328112) ON CONFLICT DO NOTHING; -- Ninja Kamui
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013751', 'AN0929', 'Dilly', NULL, NULL, '女性', 328621) ON CONFLICT DO NOTHING; -- Ninja Kamui
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013752', 'AN0929', 'Ren', NULL, NULL, '男性', 326724) ON CONFLICT DO NOTHING; -- Ninja Kamui
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013753', 'AN0944', 'Elise De Clorance', NULL, NULL, '女性', 135657) ON CONFLICT DO NOTHING; -- 外科医エリーゼ
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013754', 'AN0944', 'Linden De Romanoff', NULL, NULL, '男性', 135658) ON CONFLICT DO NOTHING; -- 外科医エリーゼ
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013755', 'AN0944', 'Vent Gyeong', NULL, NULL, '男性', 327828) ON CONFLICT DO NOTHING; -- 外科医エリーゼ
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013756', 'AN0944', 'Emily De Clorance', NULL, NULL, '女性', 327836) ON CONFLICT DO NOTHING; -- 外科医エリーゼ
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013757', 'AN0944', 'Harver Gongjag Bu-in', NULL, NULL, '女性', 327829) ON CONFLICT DO NOTHING; -- 外科医エリーゼ
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013758', 'AN0944', 'Yulian De Childe', NULL, NULL, '女性', 322802) ON CONFLICT DO NOTHING; -- 外科医エリーゼ
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013759', 'AN0944', 'Randall', NULL, NULL, '男性', 327830) ON CONFLICT DO NOTHING; -- 外科医エリーゼ
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013760', 'AN0944', 'Lenne De Clorance', NULL, NULL, NULL, 165374) ON CONFLICT DO NOTHING; -- 外科医エリーゼ
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013761', 'AN0944', 'Gaut Jajag', NULL, NULL, '男性', 327831) ON CONFLICT DO NOTHING; -- 外科医エリーゼ
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013762', 'AN0944', 'Michael  De Romanoff', NULL, NULL, '男性', 165373) ON CONFLICT DO NOTHING; -- 外科医エリーゼ
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013763', 'AN0944', 'Marie', NULL, NULL, '女性', 327832) ON CONFLICT DO NOTHING; -- 外科医エリーゼ
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013764', 'AN0944', 'Graham De Fallon', NULL, NULL, '男性', 322806) ON CONFLICT DO NOTHING; -- 外科医エリーゼ
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013765', 'AN0944', 'El De Clorance', NULL, NULL, '男性', 327833) ON CONFLICT DO NOTHING; -- 外科医エリーゼ
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013766', 'AN0944', 'Minchester De Romanoff', NULL, NULL, '男性', 322803) ON CONFLICT DO NOTHING; -- 外科医エリーゼ
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013767', 'AN0944', 'Ven Gongjag', NULL, NULL, '男性', 327834) ON CONFLICT DO NOTHING; -- 外科医エリーゼ
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013768', 'AN0944', 'Chris De Clorance', NULL, NULL, '男性', 165375) ON CONFLICT DO NOTHING; -- 外科医エリーゼ
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013769', 'AN0944', 'Hans', NULL, NULL, '男性', 327835) ON CONFLICT DO NOTHING; -- 外科医エリーゼ
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013770', 'AN0993', 'Ji-Hyeok Woo', NULL, NULL, '男性', 193867) ON CONFLICT DO NOTHING; -- 喧嘩独学
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013771', 'AN0993', 'Ho-Bin Yu', NULL, NULL, '男性', 193869) ON CONFLICT DO NOTHING; -- 喧嘩独学
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013772', 'AN0993', 'Ga-Eul', NULL, NULL, '女性', 193868) ON CONFLICT DO NOTHING; -- 喧嘩独学
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013773', 'AN0993', 'Man-Gi Hwang', NULL, NULL, '男性', 193928) ON CONFLICT DO NOTHING; -- 喧嘩独学
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013774', 'AN0993', 'Ji-Hyeon Park', NULL, 43, '女性', 230033) ON CONFLICT DO NOTHING; -- 喧嘩独学
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013775', 'AN0993', 'Tae-Hoon Seong', NULL, NULL, '男性', 193930) ON CONFLICT DO NOTHING; -- 喧嘩独学
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013776', 'AN0993', 'Ppakgo', NULL, 18, '男性', 338803) ON CONFLICT DO NOTHING; -- 喧嘩独学
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013777', 'AN0993', 'Mun-Seong Kim', NULL, NULL, '男性', 194328) ON CONFLICT DO NOTHING; -- 喧嘩独学
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013778', 'AN0993', 'Ru-Mi Yeo', NULL, NULL, '女性', 193932) ON CONFLICT DO NOTHING; -- 喧嘩独学
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013779', 'AN0993', 'Bo-Mi Choi', NULL, NULL, '女性', 193929) ON CONFLICT DO NOTHING; -- 喧嘩独学
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013780', 'AN0993', 'Samdak', NULL, NULL, '男性', 329981) ON CONFLICT DO NOTHING; -- 喧嘩独学
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013781', 'AN1023', 'Twenty-Fifth Baam', NULL, NULL, '男性', 84769) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013782', 'AN1023', 'Aguero Agnis Khun', NULL, 17, '男性', 84781) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013783', 'AN1023', 'Wangnan Ja', NULL, NULL, '男性', 135472) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013784', 'AN1023', 'Rachel', NULL, NULL, '女性', 135466) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013785', 'AN1023', 'Ho-Ryang Kang', NULL, NULL, '男性', 330238) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013786', 'AN1023', 'Hwaryun', NULL, NULL, '女性', 135467) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013787', 'AN1023', 'Maschenny Jahad Khun', NULL, NULL, '女性', 168142) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013788', 'AN1023', 'Lero-Ro', NULL, NULL, '男性', 137948) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013789', 'AN1023', 'Hatz', NULL, NULL, '男性', 137952) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013790', 'AN1023', 'Reflejo', NULL, NULL, '男性', 353858) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013791', 'AN1023', 'Traveller', NULL, NULL, '男性', 355034) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013792', 'AN1023', 'Ron Mei', NULL, NULL, '女性', 383461) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013793', 'AN1023', 'Prince', NULL, NULL, '男性', 337750) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013794', 'AN1023', 'Augusgus', NULL, NULL, '男性', 189782) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013795', 'AN1023', 'Novick', NULL, NULL, '男性', 137961) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013796', 'AN1023', 'Quant Blitz', NULL, NULL, '男性', 137951) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013797', 'AN1023', 'Quaetro Blitz', NULL, NULL, '男性', 205162) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013798', 'AN1023', 'Edin Dan', NULL, NULL, '男性', 353859) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013799', 'AN1023', 'Apple', NULL, NULL, '女性', 355035) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013800', 'AN1023', 'Noma', NULL, NULL, '男性', 383462) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013801', 'AN1023', 'Rak Wraithraiser', NULL, NULL, '男性', 84783) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013802', 'AN1023', 'Goseng Yeo', NULL, NULL, '女性', 337746) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013803', 'AN1023', 'Jaina Repellista Jahad', NULL, NULL, '女性', 224309) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013804', 'AN1023', 'Anaak Jahad', NULL, NULL, '女性', 135470) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013805', 'AN1023', 'Cassano Beniamino', NULL, NULL, '男性', 344561) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013806', 'AN1023', 'Beta', NULL, NULL, '男性', 353860) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013807', 'AN1023', 'Punk', NULL, NULL, '男性', 383455) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013808', 'AN1023', 'Gyetang', NULL, NULL, '男性', 383463) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013809', 'AN1023', 'Arkraptor Hon', NULL, NULL, '男性', 337747) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013810', 'AN1023', 'Xia Xia', NULL, NULL, '女性', 223173) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013811', 'AN1023', 'Yu Han Sung', NULL, 500, '男性', 141286) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013812', 'AN1023', 'Gustang Po Bidau', NULL, NULL, '男性', 135478) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013813', 'AN1023', 'Madorako', NULL, NULL, '男性', 353862) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013814', 'AN1023', 'Io', NULL, NULL, '男性', 383456) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013815', 'AN1023', 'Yuri Ha Jahad', NULL, NULL, '女性', 84777) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013816', 'AN1023', 'Nia Nya', NULL, NULL, '男性', 337749) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013817', 'AN1023', 'Urek Mazino', NULL, NULL, '男性', 124137) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013818', 'AN1023', 'Lauroe Phonsekal', NULL, NULL, '男性', 137958) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013819', 'AN1023', 'Aleksai Amigochaz', NULL, NULL, '男性', 175702) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013820', 'AN1023', 'Miya', NULL, NULL, '女性', 383457) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013821', 'AN1023', 'Miseng Yeo', NULL, NULL, '女性', 337745) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013822', 'AN1023', 'Ran Khun', NULL, NULL, '男性', 135474) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013823', 'AN1023', 'Shibisu', NULL, NULL, '男性', 137957) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013824', 'AN1023', 'Vespa', NULL, NULL, '女性', 180904) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013825', 'AN1023', 'Michael', NULL, NULL, '男性', 355031) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013826', 'AN1023', 'Tebo & Lebo', NULL, NULL, NULL, 383458) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013827', 'AN1023', 'Endorsi Jahad', NULL, 300, '女性', 124138) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013828', 'AN1023', 'Lurker Kim', NULL, NULL, '男性', 337748) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013829', 'AN1023', 'Karaka', NULL, NULL, '男性', 135465) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013830', 'AN1023', 'Sophia Amae', NULL, NULL, '女性', 223783) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013831', 'AN1023', 'Hachuling Khun', NULL, NULL, '男性', 175047) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013832', 'AN1023', 'Chang Blarode', NULL, NULL, '男性', 355032) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013833', 'AN1023', 'Rapdevil', NULL, NULL, '男性', 383459) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013834', 'AN1023', 'Ehwa Yeon', NULL, 18, '女性', 135475) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013835', 'AN1023', 'Love Mule', NULL, NULL, '男性', 137953) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013836', 'AN1023', 'Jin-Seong Ha', NULL, NULL, '男性', 135469) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013837', 'AN1023', 'Parakewl', NULL, NULL, '男性', 175717) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013838', 'AN1023', 'Varagarv', NULL, NULL, '男性', 353857) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013839', 'AN1023', 'Verdi', NULL, NULL, '女性', 355033) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013840', 'AN1023', 'Devil Bon', NULL, NULL, '男性', 383460) ON CONFLICT DO NOTHING; -- 神之塔 -Tower of God- 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013841', 'AN1055', '千夜', NULL, NULL, '男性', 146191) ON CONFLICT DO NOTHING; -- 戦国妖狐 千魔混沌編
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013842', 'AN1055', '月湖', NULL, NULL, '女性', 146192) ON CONFLICT DO NOTHING; -- 戦国妖狐 千魔混沌編
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013843', 'AN1055', 'なう', NULL, NULL, NULL, 146618) ON CONFLICT DO NOTHING; -- 戦国妖狐 千魔混沌編
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013844', 'AN1055', 'Hanatora', NULL, NULL, NULL, 146952) ON CONFLICT DO NOTHING; -- 戦国妖狐 千魔混沌編
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013845', 'AN1055', 'たま', NULL, NULL, '女性', 27283) ON CONFLICT DO NOTHING; -- 戦国妖狐 千魔混沌編
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013846', 'AN1055', '神雲', NULL, NULL, '男性', 146283) ON CONFLICT DO NOTHING; -- 戦国妖狐 千魔混沌編
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013847', 'AN1055', '真介', NULL, NULL, '男性', 27282) ON CONFLICT DO NOTHING; -- 戦国妖狐 千魔混沌編
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013848', 'AN1055', 'ムド', NULL, NULL, NULL, 146617) ON CONFLICT DO NOTHING; -- 戦国妖狐 千魔混沌編
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013849', 'AN1055', 'Yoshiteru Ashikaga', NULL, NULL, '男性', 146814) ON CONFLICT DO NOTHING; -- 戦国妖狐 千魔混沌編
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013850', 'AN1145', 'オスカー・ファルサス', NULL, NULL, '男性', 220806) ON CONFLICT DO NOTHING; -- Unnamed Memory Act.2
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013851', 'AN1145', 'ティナーシャ', NULL, NULL, '女性', 220804) ON CONFLICT DO NOTHING; -- Unnamed Memory Act.2
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013852', 'AN1201', 'ラブラック=ベル', NULL, NULL, NULL, 316996) ON CONFLICT DO NOTHING; -- ばいばい、アース シーズン2
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013853', 'AN1201', 'ドランブイ', NULL, NULL, NULL, 345927) ON CONFLICT DO NOTHING; -- ばいばい、アース シーズン2
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013854', 'AN1201', 'クエスティオン＝アドニス', NULL, NULL, NULL, 330242) ON CONFLICT DO NOTHING; -- ばいばい、アース シーズン2
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013855', 'AN1201', 'ギネス', NULL, NULL, NULL, 330248) ON CONFLICT DO NOTHING; -- ばいばい、アース シーズン2
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013856', 'AN1201', 'キティ＝ザ・オール', NULL, NULL, NULL, 330245) ON CONFLICT DO NOTHING; -- ばいばい、アース シーズン2
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013857', 'AN1201', 'ローハイド王', NULL, NULL, '男性', 345929) ON CONFLICT DO NOTHING; -- ばいばい、アース シーズン2
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013858', 'AN1201', 'ラブラック＝シアン', NULL, NULL, NULL, 330244) ON CONFLICT DO NOTHING; -- ばいばい、アース シーズン2
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013859', 'AN1201', 'シャンディ＝ガフ', NULL, NULL, NULL, 330246) ON CONFLICT DO NOTHING; -- ばいばい、アース シーズン2
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013860', 'AN1201', 'シェリー', NULL, NULL, NULL, 330247) ON CONFLICT DO NOTHING; -- ばいばい、アース シーズン2
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013861', 'AN1201', 'ベネディクティン', NULL, NULL, NULL, 330249) ON CONFLICT DO NOTHING; -- ばいばい、アース シーズン2
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013862', 'AN1201', 'ローハイド王', NULL, NULL, '男性', 345928) ON CONFLICT DO NOTHING; -- ばいばい、アース シーズン2
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013863', 'AN1290', 'クリストル・ノバティ・ノカナティカ', NULL, NULL, '女性', 202157) ON CONFLICT DO NOTHING; -- 結婚指輪物語Ⅱ
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013864', 'AN1290', '佐藤春人', NULL, NULL, '男性', 202158) ON CONFLICT DO NOTHING; -- 結婚指輪物語Ⅱ
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013865', 'AN1290', 'モーリオン・ノバティ・ノカナティカ', NULL, NULL, '女性', 331021) ON CONFLICT DO NOTHING; -- 結婚指輪物語Ⅱ
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013866', 'AN1290', 'アンベル・イダノカン', NULL, NULL, NULL, 202153) ON CONFLICT DO NOTHING; -- 結婚指輪物語Ⅱ
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013867', 'AN1290', 'グラナート・ニーダキッタ', NULL, NULL, NULL, 202156) ON CONFLICT DO NOTHING; -- 結婚指輪物語Ⅱ
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013868', 'AN1290', 'サフィール・マーサ', NULL, NULL, '女性', 202155) ON CONFLICT DO NOTHING; -- 結婚指輪物語Ⅱ
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013869', 'AN1290', 'ネフリティス・ロムカ', NULL, NULL, NULL, 202154) ON CONFLICT DO NOTHING; -- 結婚指輪物語Ⅱ
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013870', 'AN1290', 'アラバスタ', NULL, NULL, '男性', 324330) ON CONFLICT DO NOTHING; -- 結婚指輪物語Ⅱ
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013871', 'AN1311', 'ダイヤ', NULL, NULL, '女性', 337783) ON CONFLICT DO NOTHING; -- 科学×冒険サバイバル！ 第2シリーズ
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013872', 'AN1311', 'ピピ', NULL, NULL, NULL, 214509) ON CONFLICT DO NOTHING; -- 科学×冒険サバイバル！ 第2シリーズ
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013873', 'AN1311', 'ケイ', NULL, NULL, NULL, 214511) ON CONFLICT DO NOTHING; -- 科学×冒険サバイバル！ 第2シリーズ
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013874', 'AN1311', 'ジオ', NULL, NULL, '男性', 214510) ON CONFLICT DO NOTHING; -- 科学×冒険サバイバル！ 第2シリーズ
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013875', 'AN1312', 'おしりたんてい', NULL, NULL, NULL, 358431) ON CONFLICT DO NOTHING; -- おしりたんてい(第9シリーズ)
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013876', 'AN1312', 'ブラウン', NULL, NULL, NULL, 358764) ON CONFLICT DO NOTHING; -- おしりたんてい(第9シリーズ)
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013877', 'AN1342', '王塚真唯', NULL, NULL, '女性', 196167) ON CONFLICT DO NOTHING; -- わたしが恋人になれるわけないじゃん、ムリムリ! (※ムリじゃなかった!?)〜ネクストシャイン！〜
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013878', 'AN1342', '甘織れな子', NULL, NULL, '女性', 196166) ON CONFLICT DO NOTHING; -- わたしが恋人になれるわけないじゃん、ムリムリ! (※ムリじゃなかった!?)〜ネクストシャイン！〜
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013879', 'AN1342', '琴紗月', NULL, NULL, '女性', 286332) ON CONFLICT DO NOTHING; -- わたしが恋人になれるわけないじゃん、ムリムリ! (※ムリじゃなかった!?)〜ネクストシャイン！〜
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013880', 'AN1342', '瀬名紫陽花', NULL, 15, '女性', 306048) ON CONFLICT DO NOTHING; -- わたしが恋人になれるわけないじゃん、ムリムリ! (※ムリじゃなかった!?)〜ネクストシャイン！〜
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013881', 'AN1342', '小柳香穗', NULL, 16, '女性', 306777) ON CONFLICT DO NOTHING; -- わたしが恋人になれるわけないじゃん、ムリムリ! (※ムリじゃなかった!?)〜ネクストシャイン！〜
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013882', 'AN1342', '甘織遥奈', NULL, NULL, '女性', 308290) ON CONFLICT DO NOTHING; -- わたしが恋人になれるわけないじゃん、ムリムリ! (※ムリじゃなかった!?)〜ネクストシャイン！〜
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013883', 'AN1429', '愛城恋太郎', NULL, 16, '男性', 173758) ON CONFLICT DO NOTHING; -- 君のことが大大大大大好きな100人の彼女 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013884', 'AN1429', '原賀胡桃', NULL, 14, '女性', 182333) ON CONFLICT DO NOTHING; -- 君のことが大大大大大好きな100人の彼女 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013885', 'AN1429', '薬膳ヤク', NULL, 89, '女性', 254932) ON CONFLICT DO NOTHING; -- 君のことが大大大大大好きな100人の彼女 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013886', 'AN1429', '花園羽香里', NULL, 16, '女性', 173759) ON CONFLICT DO NOTHING; -- 君のことが大大大大大好きな100人の彼女 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013887', 'AN1429', '薬膳楠莉', NULL, 18, '女性', 173763) ON CONFLICT DO NOTHING; -- 君のことが大大大大大好きな100人の彼女 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013888', 'AN1429', '土呂瀞騎士華', NULL, 18, '女性', 266529) ON CONFLICT DO NOTHING; -- 君のことが大大大大大好きな100人の彼女 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013889', 'AN1429', '院田唐音', NULL, 15, '女性', 173760) ON CONFLICT DO NOTHING; -- 君のことが大大大大大好きな100人の彼女 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013890', 'AN1429', '銘戸芽衣', NULL, 19, '女性', 188521) ON CONFLICT DO NOTHING; -- 君のことが大大大大大好きな100人の彼女 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013891', 'AN1429', '茂見紅葉', NULL, 14, '女性', 254931) ON CONFLICT DO NOTHING; -- 君のことが大大大大大好きな100人の彼女 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013892', 'AN1429', '栄逢凪乃', NULL, 15, '女性', 173762) ON CONFLICT DO NOTHING; -- 君のことが大大大大大好きな100人の彼女 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013893', 'AN1429', '須藤育', NULL, 15, '女性', 190912) ON CONFLICT DO NOTHING; -- 君のことが大大大大大好きな100人の彼女 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013894', 'AN1429', '優敷山女', NULL, 15, '女性', 240542) ON CONFLICT DO NOTHING; -- 君のことが大大大大大好きな100人の彼女 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013895', 'AN1429', '好本静', NULL, 15, '女性', 173761) ON CONFLICT DO NOTHING; -- 君のことが大大大大大好きな100人の彼女 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013896', 'AN1429', '美杉美々美', NULL, 17, '女性', 197921) ON CONFLICT DO NOTHING; -- 君のことが大大大大大好きな100人の彼女 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013897', 'AN1429', '伊院知与', NULL, 12, '女性', 214580) ON CONFLICT DO NOTHING; -- 君のことが大大大大大好きな100人の彼女 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013898', 'AN1429', '大和撫子', NULL, 24, '女性', 227073) ON CONFLICT DO NOTHING; -- 君のことが大大大大大好きな100人の彼女 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013899', 'AN1429', '華暮愛々', NULL, 15, '女性', 205771) ON CONFLICT DO NOTHING; -- 君のことが大大大大大好きな100人の彼女 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013900', 'AN1429', '花園羽々里', NULL, 29, '女性', 173812) ON CONFLICT DO NOTHING; -- 君のことが大大大大大好きな100人の彼女 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013901', 'AN1429', '神様', NULL, NULL, '男性', 306697) ON CONFLICT DO NOTHING; -- 君のことが大大大大大好きな100人の彼女 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013902', 'AN1429', 'ナレーター', NULL, NULL, NULL, 36309) ON CONFLICT DO NOTHING; -- 君のことが大大大大大好きな100人の彼女 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013903', 'AN1431', '北条時行', NULL, 8, '男性', 215499) ON CONFLICT DO NOTHING; -- 逃げ上手の若君 第二期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013904', 'AN1431', '袮津孤次郎', NULL, 8, '男性', 300904) ON CONFLICT DO NOTHING; -- 逃げ上手の若君 第二期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013905', 'AN1431', '雫', NULL, 8, '女性', 300902) ON CONFLICT DO NOTHING; -- 逃げ上手の若君 第二期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013906', 'AN1431', '望月亜也子', NULL, 8, '女性', 300905) ON CONFLICT DO NOTHING; -- 逃げ上手の若君 第二期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013907', 'AN1431', '風間玄蕃', NULL, NULL, '男性', 300906) ON CONFLICT DO NOTHING; -- 逃げ上手の若君 第二期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013908', 'AN1431', '吹雪', NULL, NULL, '男性', 320996) ON CONFLICT DO NOTHING; -- 逃げ上手の若君 第二期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013909', 'AN1431', '諏訪頼重', NULL, NULL, '男性', 300898) ON CONFLICT DO NOTHING; -- 逃げ上手の若君 第二期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013910', 'AN1431', '足利高氏', NULL, NULL, '男性', 300903) ON CONFLICT DO NOTHING; -- 逃げ上手の若君 第二期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013911', 'AN1472', '上杉魁人', NULL, 15, '男性', 390256) ON CONFLICT DO NOTHING; -- 鎧真伝サムライトルーパー 第2クール
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013912', 'AN1472', '凱', NULL, 15, '男性', 390257) ON CONFLICT DO NOTHING; -- 鎧真伝サムライトルーパー 第2クール
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013913', 'AN1472', '北条武蔵', NULL, 14, '男性', 390255) ON CONFLICT DO NOTHING; -- 鎧真伝サムライトルーパー 第2クール
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013914', 'AN1472', '織田龍成', NULL, NULL, '男性', 390254) ON CONFLICT DO NOTHING; -- 鎧真伝サムライトルーパー 第2クール
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013915', 'AN1475', '壬氏', NULL, 18, '男性', 127278) ON CONFLICT DO NOTHING; -- 薬屋のひとりごと 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013916', 'AN1475', '猫猫', NULL, 17, '女性', 126824) ON CONFLICT DO NOTHING; -- 薬屋のひとりごと 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013917', 'AN1481', 'Desir Herrman', NULL, 16, '男性', 141151) ON CONFLICT DO NOTHING; -- 帰還者の魔法は特別です 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013918', 'AN1481', 'Azest Kingscrown', NULL, 19, '女性', 141154) ON CONFLICT DO NOTHING; -- 帰還者の魔法は特別です 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013919', 'AN1481', 'Romantica Eru', NULL, NULL, '女性', 141152) ON CONFLICT DO NOTHING; -- 帰還者の魔法は特別です 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013920', 'AN1481', 'Pram Schneider', NULL, 16, '男性', 141153) ON CONFLICT DO NOTHING; -- 帰還者の魔法は特別です 第2期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013921', 'AN1483', 'リーツ・ミューセス', NULL, 14, '男性', 305393) ON CONFLICT DO NOTHING; -- 転生貴族、鑑定スキルで成り上がる 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013922', 'AN1483', 'アルス・ローベント', NULL, NULL, '男性', 305390) ON CONFLICT DO NOTHING; -- 転生貴族、鑑定スキルで成り上がる 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013923', 'AN1483', 'シャーロット・レイス', NULL, NULL, '女性', 305391) ON CONFLICT DO NOTHING; -- 転生貴族、鑑定スキルで成り上がる 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013924', 'AN1483', 'ロセル・キーシャ', NULL, 5, '男性', 305392) ON CONFLICT DO NOTHING; -- 転生貴族、鑑定スキルで成り上がる 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013925', 'AN1483', 'リシア・プレイド', NULL, NULL, '女性', 319090) ON CONFLICT DO NOTHING; -- 転生貴族、鑑定スキルで成り上がる 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013926', 'AN1483', 'ファム', NULL, 22, '男性', 326566) ON CONFLICT DO NOTHING; -- 転生貴族、鑑定スキルで成り上がる 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013927', 'AN1483', 'ミレーユ・グランジオン', NULL, NULL, '女性', 326565) ON CONFLICT DO NOTHING; -- 転生貴族、鑑定スキルで成り上がる 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013928', 'AN1485', 'ピエルカルロ', NULL, NULL, NULL, 283233) ON CONFLICT DO NOTHING; -- 佐々木とピーちゃん シーズン２
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013929', 'AN1485', '佐々木', NULL, 39, '男性', 283234) ON CONFLICT DO NOTHING; -- 佐々木とピーちゃん シーズン２
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013930', 'AN1485', 'フレンチ', NULL, NULL, '男性', 288298) ON CONFLICT DO NOTHING; -- 佐々木とピーちゃん シーズン２
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013931', 'AN1485', 'クロス', NULL, NULL, '女性', 288293) ON CONFLICT DO NOTHING; -- 佐々木とピーちゃん シーズン２
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013932', 'AN1485', '阿久津', NULL, NULL, '男性', 288303) ON CONFLICT DO NOTHING; -- 佐々木とピーちゃん シーズン２
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013933', 'AN1485', 'エルザ・ミュラー', NULL, NULL, '女性', 288295) ON CONFLICT DO NOTHING; -- 佐々木とピーちゃん シーズン２
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013934', 'AN1485', 'ヨーゼフ', NULL, NULL, '男性', 325590) ON CONFLICT DO NOTHING; -- 佐々木とピーちゃん シーズン２
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013935', 'AN1485', 'マジカルピンク', NULL, NULL, '女性', 288302) ON CONFLICT DO NOTHING; -- 佐々木とピーちゃん シーズン２
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013936', 'AN1485', 'アドニス', NULL, NULL, '男性', 288296) ON CONFLICT DO NOTHING; -- 佐々木とピーちゃん シーズン２
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013937', 'AN1485', '二人静', NULL, NULL, '女性', 288300) ON CONFLICT DO NOTHING; -- 佐々木とピーちゃん シーズン２
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013938', 'AN1485', 'マクシミリアン', NULL, NULL, NULL, 325591) ON CONFLICT DO NOTHING; -- 佐々木とピーちゃん シーズン２
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013939', 'AN1485', 'ミュラー', NULL, NULL, '男性', 288294) ON CONFLICT DO NOTHING; -- 佐々木とピーちゃん シーズン２
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013940', 'AN1485', '星崎さん', NULL, 16, '女性', 288299) ON CONFLICT DO NOTHING; -- 佐々木とピーちゃん シーズン２
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013941', 'AN1486', '早乙女乱馬', NULL, 16, '男性', 668) ON CONFLICT DO NOTHING; -- らんま1/2 (2024) 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013942', 'AN1486', '天道あかね', NULL, 16, '女性', 669) ON CONFLICT DO NOTHING; -- らんま1/2 (2024) 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013943', 'AN1486', '可崘', NULL, NULL, '女性', 24764) ON CONFLICT DO NOTHING; -- らんま1/2 (2024) 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013944', 'AN1486', '天道なびき', NULL, 17, '女性', 3664) ON CONFLICT DO NOTHING; -- らんま1/2 (2024) 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013945', 'AN1486', '九能小太刀', NULL, 16, '女性', 10028) ON CONFLICT DO NOTHING; -- らんま1/2 (2024) 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013946', 'AN1486', '小乃東風', NULL, NULL, '男性', 18771) ON CONFLICT DO NOTHING; -- らんま1/2 (2024) 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013947', 'AN1486', '響良牙', NULL, NULL, '男性', 2369) ON CONFLICT DO NOTHING; -- らんま1/2 (2024) 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013948', 'AN1486', '早乙女玄馬', NULL, NULL, '男性', 9913) ON CONFLICT DO NOTHING; -- らんま1/2 (2024) 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013949', 'AN1486', '三千院帝', NULL, NULL, '男性', 32560) ON CONFLICT DO NOTHING; -- らんま1/2 (2024) 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013950', 'AN1486', '久遠寺右京', NULL, NULL, '女性', 2374) ON CONFLICT DO NOTHING; -- らんま1/2 (2024) 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013951', 'AN1486', '白鳥あずさ', NULL, NULL, NULL, 9259) ON CONFLICT DO NOTHING; -- らんま1/2 (2024) 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013952', 'AN1486', '八宝斎', NULL, NULL, '男性', 17171) ON CONFLICT DO NOTHING; -- らんま1/2 (2024) 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013953', 'AN1486', '天道かすみ', NULL, 19, '女性', 3665) ON CONFLICT DO NOTHING; -- らんま1/2 (2024) 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013954', 'AN1486', '九能帯刀', NULL, 17, '男性', 7699) ON CONFLICT DO NOTHING; -- らんま1/2 (2024) 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013955', 'AN1486', '天道早雲', NULL, NULL, '男性', 9215) ON CONFLICT DO NOTHING; -- らんま1/2 (2024) 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013956', 'AN1486', '沐絲', NULL, NULL, '男性', 5210) ON CONFLICT DO NOTHING; -- らんま1/2 (2024) 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013957', 'AN1486', 'シャンプー', NULL, NULL, '女性', 2421) ON CONFLICT DO NOTHING; -- らんま1/2 (2024) 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013958', 'AN1486', 'いちろう', NULL, NULL, '男性', 349214) ON CONFLICT DO NOTHING; -- らんま1/2 (2024) 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013959', 'AN1486', '五寸釘光', NULL, NULL, '男性', 10813) ON CONFLICT DO NOTHING; -- らんま1/2 (2024) 第3期
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013960', 'AN1496', 'Yeong-U Sin', NULL, 26, '男性', 181138) ON CONFLICT DO NOTHING; -- テムパル～アイテムの力～
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013961', 'AN1496', 'Yu-Ra', NULL, NULL, '女性', 182899) ON CONFLICT DO NOTHING; -- テムパル～アイテムの力～
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013962', 'AN1496', 'Euphemina', NULL, 20, '女性', 182895) ON CONFLICT DO NOTHING; -- テムパル～アイテムの力～
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013963', 'AN1496', 'Huroi', NULL, NULL, '男性', 403291) ON CONFLICT DO NOTHING; -- テムパル～アイテムの力～
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013964', 'AN1501', '朝野太陽', NULL, 17, '男性', 162723) ON CONFLICT DO NOTHING; -- 夜桜さんちの大作戦 第2期 第2クール
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013965', 'AN1501', '夜桜六美', NULL, 17, '女性', 162724) ON CONFLICT DO NOTHING; -- 夜桜さんちの大作戦 第2期 第2クール
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013966', 'AN1501', '夜桜七悪', NULL, 15, '男性', 169988) ON CONFLICT DO NOTHING; -- 夜桜さんちの大作戦 第2期 第2クール
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013967', 'AN1501', '夜桜二刃', NULL, 20, '女性', 169990) ON CONFLICT DO NOTHING; -- 夜桜さんちの大作戦 第2期 第2クール
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013968', 'AN1501', '夜桜凶一郎', NULL, 21, '男性', 165308) ON CONFLICT DO NOTHING; -- 夜桜さんちの大作戦 第2期 第2クール
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013969', 'AN1501', '夜桜嫌五', NULL, 18, '男性', 169991) ON CONFLICT DO NOTHING; -- 夜桜さんちの大作戦 第2期 第2クール
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013970', 'AN1501', '夜桜辛三', NULL, 19, '男性', 170003) ON CONFLICT DO NOTHING; -- 夜桜さんちの大作戦 第2期 第2クール
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013971', 'AN1501', '夜桜四怨', NULL, 19, '女性', 169989) ON CONFLICT DO NOTHING; -- 夜桜さんちの大作戦 第2期 第2クール
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013972', 'AN1501', 'ゴリアテ', NULL, NULL, '男性', 169993) ON CONFLICT DO NOTHING; -- 夜桜さんちの大作戦 第2期 第2クール
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013973', 'AN1515', '沢村栄純', NULL, 15, '男性', 22998) ON CONFLICT DO NOTHING; -- ダイヤのA actⅡ -Second Season- 第2クール
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013974', 'AN1515', '御幸一也', NULL, 15, '男性', 30267) ON CONFLICT DO NOTHING; -- ダイヤのA actⅡ -Second Season- 第2クール
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013975', 'AN1515', '成宮鳴', NULL, NULL, '男性', 89310) ON CONFLICT DO NOTHING; -- ダイヤのA actⅡ -Second Season- 第2クール
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013976', 'AN1519', '野々山流', NULL, NULL, '女性', 377807) ON CONFLICT DO NOTHING; -- 魔法の姉妹ルルットリリィ 第2クール
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013977', 'AN1519', '野々山風', NULL, NULL, '女性', 377806) ON CONFLICT DO NOTHING; -- 魔法の姉妹ルルットリリィ 第2クール
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013978', 'AN1519', '新木あさひ', NULL, NULL, '女性', 402012) ON CONFLICT DO NOTHING; -- 魔法の姉妹ルルットリリィ 第2クール
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013979', 'AN1521', '越前リョーマ', NULL, NULL, '男性', 324) ON CONFLICT DO NOTHING; -- 新テニスの王子様 U-17 WORLD CUP 決勝メンバー決定戦
INSERT INTO characters (character_id, anime_id, name, description, age, gender, anilist_id) VALUES ('CH013980', 'AN1521', '不二周助', NULL, NULL, '男性', 327) ON CONFLICT DO NOTHING; -- 新テニスの王子様 U-17 WORLD CUP 決勝メンバー決定戦
