# Guide Agent MCP Self Daily

Ce guide explique comment utiliser un agent MCP dans Cursor pour automatiser complètement le traitement des newsletters Self Daily.

## 🔄 Workflow Automatisé Complet

### Exemple de Prompt pour Cursor Agent

```markdown
Process the Self Daily newsletter for 2025-11-02:

1. Use Gmail MCP to fetch the newsletter from "Self Daily" with subject containing "2025-11-02" or the date
2. Extract the HTML content from the email body
3. Parse the HTML to find all article titles and READ MORE links
4. For each article:
   - Use Firecrawl to scrape the article content
   - Generate a 2-3 line French summary using the LLM
   - Extract relevant tags from the content
5. Create a SQL file in `database/sfdaily_update/` with all articles
6. Trigger the updater to process the SQL file
7. Verify the articles were inserted correctly
```

## 🛠️ Outils MCP Disponibles

### 1. Gmail - Récupérer la Newsletter

**Tool**: `RUBE_SEARCH_TOOLS` → `GMAIL_FETCH_EMAILS`

**Exemple**:
```javascript
{
  "queries": [{
    "use_case": "fetch emails from gmail",
    "known_fields": "sender:Self Daily, subject:2025-11-02"
  }]
}
```

### 2. Firecrawl - Scraper les Articles

**Tool**: `firecrawl_scrape` ou `firecrawl_search`

**Exemple**:
```javascript
// Pour une URL d'article
firecrawl_scrape({
  url: "https://www.self.com/story/article-url",
  formats: ["markdown"],
  onlyMainContent: true
})
```

### 3. LLM - Générer Résumés

**Tool**: `invoke_llm` (via Rube Workbench)

**Exemple**:
```python
summary, err = invoke_llm("""
Créez un résumé ultra-court en 2-3 lignes (150-200 caractères) de cet article français :
[contenu de l'article]
""")
```

### 4. DeepL - Traduction (optionnel si déjà en anglais)

**Tool**: `mcp_deepl_translate-text`

### 5. CLI Self Daily - Traitement SQL

**Tool**: Appeler directement le CLI

```bash
./sfdaily process <date> <html_file>
./sfdaily trigger-update
./sfdaily list <date>
```

## 📝 Prompt Complet pour Cursor

Voici un prompt complet que vous pouvez utiliser dans Cursor :

---

**Process Self Daily Newsletter**

I need to process the Self Daily newsletter for 2025-11-02 (adjust date as needed). Please:

1. **Fetch the newsletter from Gmail**:
   - Use Rube search to find Gmail tools
   - Fetch emails from sender "Self Daily" 
   - Filter by date or subject containing "2025-11-02"
   - Extract the HTML body content

2. **Parse newsletter HTML**:
   - Find all article titles and "READ MORE" links
   - Handle base64-encoded URLs if present
   - Extract both title and URL for each article

3. **Generate content** (for each article):
   - Use Firecrawl to scrape the article content
   - Use LLM to create a 2-3 line French summary (150-200 chars)
   - Extract 3-5 relevant tags from the content

4. **Generate SQL file**:
   - Create file `database/sfdaily_update/self-daily-2025-11-02.sql`
   - Include table creation (if not exists)
   - INSERT statements for all articles with:
     - date, title, summary_fr, tags, rating (0), url

5. **Process and verify**:
   - Run: `./sfdaily trigger-update` to process immediately
   - Run: `./sfdaily list 2025-11-02` to verify articles
   - Run: `./sfdaily stats` to show statistics

---

## 🎯 Utilisation Pratique

### Dans Cursor Chat

1. Copiez le prompt ci-dessus
2. Ajustez la date si nécessaire (2025-11-02)
3. Envoyez à Cursor
4. L'agent utilisera automatiquement les bons outils MCP
5. Suivez les étapes du workflow

### Vérifier le Résultat

```bash
# Voir les articles
./sfdaily list 2025-11-02

# Statistiques
./sfdaily stats

# Si erreur, supprimer et recommencer
./sfdaily delete 2025-11-02
```

## 🔍 Dépannage

### Newsletter non trouvée

- Vérifiez la date exacte dans le sujet
- Essayez différents formats de recherche
- Utilisez `GMAIL_SEARCH_MESSAGES` avec plus de mots-clés

### Articles non extraits

- Vérifiez le HTML avec: `cat /tmp/newsletter.html`
- Ajustez le parsing dans le prompt
- Gmail peut retourner l'HTML différemment

### SQL Non Traité

- Vérifiez: `docker logs sfdaily_updater --tail 50`
- Forcez: `./sfdaily trigger-update`
- Vérifiez permissions: `ls -la database/sfdaily_update/`

## 🚀 Améliorations Futures

- Créer un agent MCP Python avec FastMCP qui orchestre tout
- Implémenter un webhook qui détecte les nouveaux emails Self Daily
- Ajouter auto-tagging avec LLM
- Implémenter thumbnail extraction

## 📚 Ressources

- [MCP Server Documentation](https://modelcontextprotocol.io)
- [Gmail API Reference](https://developers.google.com/gmail/api)
- [Firecrawl Documentation](https://docs.firecrawl.dev)
- CLI Self Daily: `./sfdaily` ou voir `mcp_server/README.md`

