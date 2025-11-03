# 📋 Résumé des Commandes Self Daily

## 🎯 Commandes Principales

⚠️ **Note importante** : Il peut y avoir plusieurs newsletters Self Daily pour une même date (envoyées à des heures différentes). Dans ce cas, utilisez `./sfdaily process YYYY-MM-DD HH:MM` pour cibler une newsletter spécifique.

### Agent MCP (Automatisation Complète) ⭐

**Utilisation** : Via Cursor Chat avec `AGENT_GUIDE.md`

```bash
# Prompt pour Cursor :
"Process the Self Daily newsletter for 2025-11-XX"
```

✅ **Ce que fait l'agent automatiquement** :
1. Récupère la newsletter depuis Gmail MCP
2. Parse le HTML pour extraire les articles
3. Scrape chaque article via Firecrawl
4. Génère les résumés FR via LLM
5. Extrait les tags pertinents
6. Crée le fichier SQL complet
7. Déclenche le base_updater
8. Vérifie l'insertion

**Aucun fichier HTML requis !** 🎉

---

### CLI Self Daily (Outils de Gestion)

```bash
# Traiter une newsletter (affiche le guide)
./sfdaily process 2025-11-01

# Avec heure spécifique (si plusieurs newsletters par date)
./sfdaily process 2025-11-02 23:05

# Statistiques globales
./sfdaily stats

# Liste les articles
./sfdaily list                # 20 derniers articles
./sfdaily list 2025-11-01     # Articles d'une date

# Supprimer des articles
./sfdaily delete 2025-11-01

# Déclencher manuellement l'updater
./sfdaily trigger-update

# Process avec HTML (traitement partiel manuel)
./sfdaily process 2025-11-01 /path/to/html
```

---

## 🔄 Workflows

### Workflow 1 : Automatique (Recommandé)

```
Cursor Agent MCP
  ↓
Gmail MCP → Newsletter HTML
  ↓
Parsing HTML → Titres + URLs
  ↓
Firecrawl → Contenu articles
  ↓
LLM → Résumés FR + Tags
  ↓
Génération SQL file
  ↓
base_updater → PostgreSQL
  ↓
Frontend (localhost:3050)
```

### Workflow 2 : Manuel

```
1. Récupérer le HTML manuellement
2. ./sfdaily process <date> <html>
   → Génère SQL incomplet
3. Completer les résumés manuellement
4. ./sfdaily trigger-update
```

⚠️ **Non recommandé** : Préférez l'agent MCP !

---

## 📁 Structure des Fichiers

```
database/
├── sfdaily_update/          # SQL files en attente
│   └── self-daily-2025-11-XX.sql
└── sfdaily_processed/       # SQL files traités
    ├── self-daily-2025-11-XX.sql
    └── self-daily-2025-11-XX.log
```

---

## 🆘 Aide Rapide

| Besoin | Commande |
|--------|----------|
| Traiter une newsletter | `./sfdaily process YYYY-MM-DD` → Guide |
| Newsletter spécifique (avec heure) | `./sfdaily process YYYY-MM-DD HH:MM` → Guide |
| Agent MCP complet | Voir prompt dans le guide ou [AGENT_GUIDE.md](AGENT_GUIDE.md) |
| Voir statistiques | `./sfdaily stats` |
| Lister articles | `./sfdaily list [date]` |
| Supprimer date | `./sfdaily delete YYYY-MM-DD` |
| Forcer update | `./sfdaily trigger-update` |
| Logs updater | `docker logs sfdaily_updater` |
| Logs backend | `docker logs sfdaily_backend` |
| Logs database | `docker logs sfdaily_postgres` |

---

## 📚 Documentation

- **AGENT_GUIDE.md** → Workflow MCP automatisé complet
- **README.md** → Installation et architecture
- **mcp_server/README.md** → Détails techniques du CLI

