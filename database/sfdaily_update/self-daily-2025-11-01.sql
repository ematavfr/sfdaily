-- Self Daily Articles for 2025-11-01
-- Table creation if not exists

CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    title VARCHAR(500) NOT NULL,
    summary_fr TEXT NOT NULL,
    tags TEXT[] NOT NULL,
    rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5)
);

-- Insert articles for 2025-11-01
INSERT INTO articles (date, title, summary_fr, tags, rating) VALUES (
    '2025-11-01',
    '6 Signs You''re Settling, According to Couples Therapists',
    'Dans cet article, des thérapeutes de couple décrivent six signaux d''alarme qui indiquent que votre relation est peut-être en train de s''installer. Premièrement, vous vous sentez plus comme des colocataires que comme des partenaires romantiques, manquant d''intimité et d''excitation. Deuxièmement, vous donnez la priorité à un calendrier - comme le mariage ou les enfants - plutôt qu''à la qualité réelle de la relation. Troisièmement, vous restez dans la relation par peur d''être seul ou d''être confronté à l''incertitude. Quatrièmement, vous vous accrochez à l''espoir que votre partenaire changera des aspects fondamentaux de sa personnalité. Cinquièmement, vous faites des compromis sur des points essentiels, en sacrifiant des valeurs que vous considériez auparavant comme non négociables. Enfin, vous imaginez souvent d''autres partenaires, rêvant d''une meilleure relation au lieu de vous investir pleinement dans la relation actuelle.',
    '{"relationships","couples therapy","settling","red flags"}',
    0
);

INSERT INTO articles (date, title, summary_fr, tags, rating) VALUES (
    '2025-11-01',
    'We Tested Dozens of Zero-Proof Drinks—These Are the Best Money Can Buy',
    'L''article évalue des dizaines de boissons zero-proof - vins, bières, spiritueux, mocktails et packs assortis - en fonction de leur dégustation, de leur prix et de leur teneur en sucre. Plus de 20 produits ont été rigoureusement testés, chaque catégorie recevant une recommandation de premier choix. Les évaluateurs mettent en avant les options les plus savoureuses qui offrent également un bon rapport qualité-prix et une faible teneur en sucre. Ce guide aide les lecteurs à s''orienter sur le marché croissant des boissons non alcoolisées et à choisir des produits de qualité supérieure sans gueule de bois.',
    '{"drinks","non-alcoholic","mocktails","reviews"}',
    0
);

INSERT INTO articles (date, title, summary_fr, tags, rating) VALUES (
    '2025-11-01',
    'Here''s Exactly How Much Protein to Eat If You''re on a GLP-1',
    'Les personnes qui prennent des médicaments GLP-1 tels qu''Ozempic devraient viser un apport de 1 à 1,5 g de protéines par kilogramme de poids corporel afin de prévenir la perte de masse musculaire. Cet apport plus élevé favorise à la fois la gestion du poids et la santé générale pendant le traitement. L''article recommande de répartir les protéines sur l''ensemble des repas afin d''en améliorer l''absorption. Donner la priorité aux protéines au début de chaque repas permet d''atteindre les objectifs quotidiens. Il est essentiel d''incorporer des aliments riches en protéines comme les œufs, les produits laitiers, les légumineuses et les viandes maigres. Lorsque les aliments entiers ne suffisent pas, les protéines en poudre ou les suppléments peuvent combler l''écart.',
    '{"protein","GLP-1","Ozempic","nutrition"}',
    0
);

INSERT INTO articles (date, title, summary_fr, tags, rating) VALUES (
    '2025-11-01',
    '14 Possible Reasons Why You''re So Damn Bloated',
    'Les ballonnements sont souvent dus à des habitudes quotidiennes et à des problèmes de santé cachés. Les aliments riches en fibres, les substituts de sucre et les boissons gazeuses peuvent retenir les gaz, tandis que les repas copieux ou rapides surchargent la digestion. Les intolérances, la constipation, le syndrome de l''intestin irritable, le syndrome de l''intestin irritable, la maladie cœliaque et les maladies inflammatoires de l''intestin provoquent des gonflements chroniques. La sédentarité, le stress et la position assise prolongée aggravent la pression abdominale. Les changements liés aux voyages, les changements hormonaux pendant le syndrome prémenstruel et les dysfonctionnements du plancher pelvien y contribuent également. L''identification de l''élément déclencheur spécifique est essentielle pour soulager l''inconfort.',
    '{"bloating","digestive health","IBS","gut health"}',
    0
);

