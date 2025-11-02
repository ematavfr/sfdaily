#!/bin/bash

# Script to delete articles from the database for a specific date
# Usage: ./sfdaily-delete-by-date.sh 2025-11-01

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if date parameter is provided
if [ -z "$1" ]; then
    echo -e "${RED}✗ Error: Date parameter is required${NC}"
    echo "Usage: $0 YYYY-MM-DD"
    echo "Example: $0 2025-11-01"
    exit 1
fi

DATE=$1

# Validate date format (basic check)
if ! [[ $DATE =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
    echo -e "${RED}✗ Error: Invalid date format${NC}"
    echo "Date must be in format YYYY-MM-DD"
    exit 1
fi

# Check if docker is running
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}✗ Error: Docker is not running${NC}"
    exit 1
fi

# Check if postgres container exists and is running
if ! docker ps | grep -q sfdaily_postgres; then
    echo -e "${RED}✗ Error: Database container sfdaily_postgres is not running${NC}"
    echo "Please start the services with: docker-compose up -d"
    exit 1
fi

echo -e "${YELLOW}📋 Checking articles for date: $DATE${NC}"

# Count articles before deletion
BEFORE_COUNT=$(docker exec sfdaily_postgres psql -U sfdaily -d sfdaily -t -c "SELECT COUNT(*) FROM articles WHERE date = '$DATE';" | tr -d ' ')

if [ "$BEFORE_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}⚠ No articles found for date $DATE${NC}"
    exit 0
fi

echo -e "${YELLOW}Found $BEFORE_COUNT article(s) for date $DATE${NC}"

# Show articles before deletion
echo -e "\n${YELLOW}Articles to be deleted:${NC}"
docker exec sfdaily_postgres psql -U sfdaily -d sfdaily -c "SELECT id, title FROM articles WHERE date = '$DATE';"

# Ask for confirmation
echo -e "\n${RED}⚠ WARNING: This will permanently delete $BEFORE_COUNT article(s)${NC}"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${YELLOW}Deletion cancelled${NC}"
    exit 0
fi

# Delete articles
echo -e "\n${YELLOW}🗑️  Deleting articles...${NC}"
docker exec sfdaily_postgres psql -U sfdaily -d sfdaily -c "DELETE FROM articles WHERE date = '$DATE';"

# Count articles after deletion
AFTER_COUNT=$(docker exec sfdaily_postgres psql -U sfdaily -d sfdaily -t -c "SELECT COUNT(*) FROM articles WHERE date = '$DATE';" | tr -d ' ')

if [ "$AFTER_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✓ Successfully deleted $BEFORE_COUNT article(s) for date $DATE${NC}"
else
    echo -e "${RED}✗ Error: Some articles could not be deleted (remaining: $AFTER_COUNT)${NC}"
    exit 1
fi

