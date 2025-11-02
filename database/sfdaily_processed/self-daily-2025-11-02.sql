-- Self Daily Articles for 2025-11-02
-- Table creation if not exists

CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    title VARCHAR(500) NOT NULL,
    summary_fr TEXT NOT NULL,
    tags TEXT[] NOT NULL,
    rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    url TEXT
);

-- Insert articles for 2025-11-02
INSERT INTO articles (date, title, summary_fr, tags, rating, url) VALUES (
    '2025-11-02',
    '10 Movies That''ll Help You Embrace Being Single During Cuffing Season',
    'Cet article propose une sélection de dix films qui célèbrent la vie de célibataire et offrent du réconfort pendant la «cuffing season», période où la pression sociale pousse souvent à chercher un couple. Chaque film met en avant l''autonomie, le plaisir de soi et la joie de profiter de son propre temps.',
    '{"movies","relationships","entertainment"}',
    0,
    'https://www.self.com/story/best-movies-for-single-people'
);

INSERT INTO articles (date, title, summary_fr, tags, rating, url) VALUES (
    '2025-11-02',
    '16 Plyometric Exercises That''ll Build Explosive Strength',
    'Ces 16 exercices pliométriques, présentés dans un entraînement de 10 minutes à faire chez soi, visent à développer une puissance explosive tout en brûlant les graisses. Chaque mouvement combine sauts, rebonds et changements de direction pour solliciter rapidement les muscles et améliorer la force fonctionnelle.',
    '{"fitness","exercise","strength training"}',
    0,
    'https://www.self.com/story/a-10-minute-fat-burning-plyometric-workout-you-can-do-at-home'
);

INSERT INTO articles (date, title, summary_fr, tags, rating, url) VALUES (
    '2025-11-02',
    '47 Tasty Snack Ideas That''ll Get You Out of Your Rut',
    'Cet article propose 47 idées de collations savoureuses et faciles à garder à portée de main, idéales pour sortir de la routine alimentaire. Il met l''accent sur des options saines, rapides à préparer et pratiques pour le bureau ou la maison.',
    '{"healthy eating","snacks","nutrition"}',
    0,
    'https://www.self.com/gallery/14-healthy-snacks-that-you-can-and-should-keep-at-your-desk'
);

INSERT INTO articles (date, title, summary_fr, tags, rating, url) VALUES (
    '2025-11-02',
    '''Book Compatibility'' Is the New Love Language',
    '« Book Compatibility » désigne la tendance croissante où les couples utilisent leurs goûts littéraires communs comme nouveau langage amoureux, partageant lectures, recommandations et discussions de livres pour renforcer leur intimité. L''article montre comment cette connexion autour de la lecture crée des liens émotionnels profonds et offre une façon originale de découvrir et d''apprécier son partenaire.',
    '{"dating","books","relationships"}',
    0,
    'https://www.self.com/story/book-compatibility'
);

INSERT INTO articles (date, title, summary_fr, tags, rating, url) VALUES (
    '2025-11-02',
    '6 Ways I''m Navigating Loneliness This Holiday Season',
    'Cet article propose six stratégies pour atténuer la solitude pendant les fêtes, comme planifier des activités sociales, se connecter virtuellement avec des proches, et cultiver des rituels personnels réconfortants. L''auteure encourage à accepter ses émotions, à se concentrer sur le soin de soi et à créer de nouvelles traditions qui apportent du sens et du réconfort.',
    '{"mental health","relationships","holidays"}',
    0,
    'https://www.self.com/story/holiday-loneliness-strategies'
);

