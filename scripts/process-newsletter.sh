#!/bin/bash
# Script pour traiter une newsletter Self Daily
# Usage: ./scripts/process-newsletter.sh 2025-11-01

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if date parameter is provided
if [ -z "$1" ]; then
    echo -e "${RED}✗ Error: Date parameter is required${NC}"
    echo "Usage: $0 YYYY-MM-DD"
    echo "Example: $0 2025-11-01"
    exit 1
fi

DATE=$1

# Validate date format
if ! [[ $DATE =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
    echo -e "${RED}✗ Error: Invalid date format${NC}"
    echo "Date must be in format YYYY-MM-DD"
    exit 1
fi

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   SELF DAILY NEWSLETTER PROCESSOR                           ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}📅 Date: ${DATE}${NC}"
echo ""

echo -e "${BLUE}ℹ️  Ce script vous guide pour traiter la newsletter avec Agent MCP${NC}"
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  OPTION 1 : Traitement Automatique avec Agent MCP (Recommandé)${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Dans Cursor Chat, copiez et collez ce prompt :"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "Process the Self Daily newsletter for ${DATE}:"
echo ""
echo "1. Use Gmail MCP to fetch the newsletter from \"Self Daily\""
echo "2. Parse the HTML to find all article titles and READ MORE links"
echo "3. For each article:"
echo "   - Use Firecrawl to scrape the article content"
echo "   - Generate a 2-3 line French summary using the LLM"
echo "   - Extract relevant tags"
echo "4. Create a SQL file in \`database/sfdaily_update/\`"
echo "5. Trigger the updater: ./sfdaily trigger-update"
echo "6. Verify: ./sfdaily list ${DATE}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${GREEN}✅ Avantages :${NC}"
echo "   • Récupération automatique depuis Gmail"
echo "   • Scraping intelligent avec Firecrawl"
echo "   • Résumés FR générés par LLM"
echo "   • Tags automatiques"
echo "   • Aucun fichier HTML requis !"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  OPTION 2 : Traitement Manuel (avec fichier HTML)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Si vous avez déjà téléchargé le HTML de la newsletter :"
echo ""
echo -e "${YELLOW}./sfdaily process ${DATE} /path/to/newsletter.html${NC}"
echo ""
echo "⚠️  Note: Cette méthode génère uniquement le SQL avec résumés vides"
echo "   Vous devrez ensuite compléter les résumés manuellement"
echo ""

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  COMMANDES UTILES${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  Stats:         ./sfdaily stats"
echo "  List:          ./sfdaily list ${DATE}"
echo "  Delete:        ./sfdaily delete ${DATE}"
echo "  Trigger:       ./sfdaily trigger-update"
echo ""

echo -e "${BLUE}📚 Documentation complète : AGENT_GUIDE.md${NC}"
echo ""

