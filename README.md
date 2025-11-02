# Self Daily Explorer

Application web moderne pour explorer les articles de la newsletter Self Daily.

## Architecture

L'application est organisée en microservices Docker :

- **Frontend** (Port 3050) : Interface React avec Tailwind CSS
- **Backend** (Port 3051) : API REST Node.js/Express
- **Database** (Port 3052) : PostgreSQL 16
- **Base Updater** : Service Python qui surveille et applique les mises à jour SQL

## Fonctionnalités

- Visualisation des articles Self Daily en grille de 5 colonnes
- Filtrage par tags et par notation
- Système de notation par étoiles (1-5)
- Lien direct vers les articles originaux
- Design moderne avec palette de couleurs beige et marron

## Installation

### Prérequis

- Docker et Docker Compose installés

### Lancement

```bash
# Cloner le dépôt
git clone <repository-url>
cd sfdaily

# Lancer tous les services
docker-compose up -d

# Vérifier le statut
docker-compose ps

# Voir les logs du base_updater
docker-compose logs -f base_updater

# Voir tous les logs
docker-compose logs -f
```

L'application sera accessible sur :
- Frontend : http://localhost:3050
- Backend API : http://localhost:3051

## Structure des dossiers

```
sfdaily/
├── frontend/           # Application React
├── backend/            # API Express
├── base_updater/       # Service de mise à jour
├── database/           # Fichiers SQL
│   ├── sfdaily_update/  # SQL à traiter
│   └── sfdaily_processed/  # SQL traités
├── docker-compose.yml  # Configuration Docker
└── README.md
```

## Mise à jour des données

### Méthode 1 : CLI Agent (Recommandé)

Le CLI agent automatise le traitement des newsletters :

```bash
# Installer les dépendances
cd backend
npm install

# Utiliser le CLI
cd ..
./sfdaily stats              # Afficher les statistiques
./sfdaily list 2025-11-01    # Lister les articles d'une date
./sfdaily delete 2025-11-01  # Supprimer les articles d'une date
./sfdaily trigger-update     # Déclencher un update manuel
```

**Traiter une newsletter :**

```bash
# Affiche un guide interactif pour traiter avec Agent MCP
./sfdaily process 2025-11-01

# Ou avec fichier HTML (traitement manuel partiel)
./sfdaily process 2025-11-01 /path/to/newsletter.html
```

⚠️ **Traitement automatisé complet** : Utilisez l'agent MCP dans Cursor (voir prompt dans le guide affiché ci-dessus ou [AGENT_GUIDE.md](AGENT_GUIDE.md)).

Voir [mcp_server/README.md](mcp_server/README.md) pour plus de détails.

### Méthode 2 : Fichier SQL manuel

Pour ajouter de nouveaux articles manuellement :

1. Placer le fichier SQL dans `database/sfdaily_update/`
2. Le service base_updater va automatiquement :
   - Vérifier toutes les 30 minutes
   - Exécuter le fichier SQL
   - Déplacer le fichier vers `database/sfdaily_processed/`
   - Créer un fichier log correspondant

### Format SQL

Chaque fichier SQL doit respecter ce format :

```sql
-- Table creation (if not exists)
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    title VARCHAR(500) NOT NULL,
    summary_fr TEXT,
    tags TEXT[],
    rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    url TEXT
);

-- Insert articles
INSERT INTO articles (date, title, summary_fr, tags, rating, url) VALUES (...);
```

## Scripts utilitaires

Des scripts Bash sont disponibles dans `scripts/` :

```bash
./scripts/sfdaily-delete-by-date.sh 2025-11-01  # Supprimer par date (avec confirmation)
./scripts/sfdaily-trigger-update.sh              # Déclencher un update manuel
```

## Technologies

- **Frontend** : React 18, Tailwind CSS, Axios
- **Backend** : Node.js, Express, PostgreSQL
- **Database** : PostgreSQL 16
- **Updater** : Python, psycopg2, watchdog
- **Containerisation** : Docker, Docker Compose

## Développement

Pour modifier l'application en développement :

```bash
# Frontend
cd frontend
npm install
npm start  # Démarrera sur http://localhost:3000

# Backend
cd backend
npm install
npm start  # Démarrera sur http://localhost:3001
```

## Licence

MIT

