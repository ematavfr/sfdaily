#!/bin/bash

# Script to manually trigger the updater to process SQL files immediately
# Usage: ./sfdaily-trigger-update.sh

set -e

# Colors
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${YELLOW}🔄 Checking for SQL files in sfdaily_update...${NC}"

# Check if docker is running
if ! docker ps > /dev/null 2>&1; then
    echo "✗ Error: Docker is not running"
    exit 1
fi

# Check if updater container exists and is running
if ! docker ps | grep -q sfdaily_updater; then
    echo "✗ Error: Updater container is not running"
    echo "Please start the services with: docker-compose up -d"
    exit 1
fi

# List SQL files waiting to be processed
SQL_FILES=$(find database/sfdaily_update -name "*.sql" -type f | wc -l | tr -d ' ')

if [ "$SQL_FILES" -eq 0 ]; then
    echo "No SQL files found in database/sfdaily_update/"
    exit 0
fi

echo -e "${YELLOW}Found $SQL_FILES SQL file(s) waiting to be processed${NC}"
ls -lh database/sfdaily_update/*.sql

echo -e "\n${YELLOW}🔄 Triggering updater manually...${NC}"

# Restart the updater to trigger immediate processing
docker-compose restart base_updater

echo -e "${GREEN}✓ Updater restarted. Waiting 10 seconds for processing...${NC}"
sleep 10

# Show logs
docker logs sfdaily_updater --tail 30

echo -e "\n${YELLOW}Check the logs above to see if files were processed${NC}"

