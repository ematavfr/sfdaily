# Self Daily CLI Agent

Automated workflow tools for processing Self Daily newsletter articles.

## Installation

The CLI agent requires Node.js dependencies. Install them by running:

```bash
cd backend
npm install
```

This will install `cheerio` and `axios` needed for HTML parsing.

## Usage

### Option 1: Direct Command

```bash
# Process a newsletter
node mcp_server/sfdaily-cli.js process 2025-11-01 /path/to/newsletter.html

# Delete articles by date
node mcp_server/sfdaily-cli.js delete 2025-11-01

# List articles
node mcp_server/sfdaily-cli.js list 2025-11-01
node mcp_server/sfdaily-cli.js list  # All articles (last 20)

# Get statistics
node mcp_server/sfdaily-cli.js stats

# Trigger manual update
node mcp_server/sfdaily-cli.js trigger-update
```

### Option 2: Wrapper Script (Recommended)

```bash
# Make sure the wrapper is executable
chmod +x sfdaily

# Use it like a normal command
./sfdaily process 2025-11-01 /path/to/newsletter.html
./sfdaily delete 2025-11-01
./sfdaily list 2025-11-01
./sfdaily stats
./sfdaily trigger-update
```

### Option 3: Via Docker

```bash
# Inside backend container
docker exec sfdaily_backend node /app/../mcp_server/sfdaily-cli.js stats

# Or use the wrapper
./sfdaily stats
```

## Workflow: Processing a Newsletter

1. **Extract HTML from Gmail** (using MCP tools)
   ```bash
   # Use Rube/Composio MCP to fetch newsletter from Gmail
   # Save the HTML content to a file
   ```

2. **Process the newsletter**
   ```bash
   ./sfdaily process 2025-11-01 /tmp/newsletter.html
   ```

3. **Generate summaries** (optional, using LLM)
   - The SQL file will be created with placeholder summaries
   - You can manually update summaries later using SQL UPDATE commands

4. **Trigger update** (if not automatic)
   ```bash
   ./sfdaily trigger-update
   ```
   
   Or wait 30 minutes for automatic processing.

5. **Verify articles**
   ```bash
   ./sfdaily list 2025-11-01
   ./sfdaily stats
   ```

## Commands Reference

### `process <date> <html_file>`

Processes a newsletter HTML file and generates a SQL file for the articles.

**Arguments:**
- `date`: Date in YYYY-MM-DD format
- `html_file`: Path to the newsletter HTML file

**Example:**
```bash
./sfdaily process 2025-11-01 /tmp/newsletter.html
```

### `delete <date>`

Deletes all articles for a specific date from the database.

**Arguments:**
- `date`: Date in YYYY-MM-DD format

**Example:**
```bash
./sfdaily delete 2025-11-01
```

**Safety:** Shows a confirmation before deleting.

### `list [date]`

Lists articles from the database.

**Arguments:**
- `date`: (Optional) Date filter in YYYY-MM-DD format

**Examples:**
```bash
./sfdaily list 2025-11-01  # Articles for specific date
./sfdaily list             # Last 20 articles (all dates)
```

### `stats`

Displays database statistics.

**Output:**
- Total articles
- Total unique tags
- Articles grouped by date

**Example:**
```bash
./sfdaily stats
```

### `trigger-update`

Manually triggers the base_updater service to process pending SQL files immediately.

**Example:**
```bash
./sfdaily trigger-update
```

## Integration with Cursor/Chat

The CLI agent can be integrated with Cursor commands:

1. **Create Cursor command aliases** in `.cursorrules` or settings:

```
# Add to Cursor settings.json
{
  "customCommands": {
    "sfdaily:process": {
      "command": "./sfdaily process",
      "description": "Process Self Daily newsletter"
    },
    "sfdaily:delete": {
      "command": "./sfdaily delete",
      "description": "Delete articles by date"
    },
    "sfdaily:stats": {
      "command": "./sfdaily stats",
      "description": "Show database statistics"
    }
  }
}
```

2. **Use in chat**:
   - Run: `/sfdaily process 2025-11-01 /tmp/newsletter.html`
   - The agent will guide you through the workflow

## Troubleshooting

### Database Connection Error

Ensure the PostgreSQL container is running:
```bash
docker-compose ps sfdaily_postgres
```

### SQL File Not Generated

Check file permissions:
```bash
ls -la database/sfdaily_update/
```

### Updater Not Processing

Manually trigger:
```bash
./sfdaily trigger-update
docker logs sfdaily_updater --tail 50
```

## File Structure

```
sfdaily/
├── mcp_server/
│   ├── sfdaily-cli.js      # Main CLI agent
│   ├── requirements.txt    # Python dependencies (future)
│   ├── sfdaily_agent.py   # Python MCP server (future)
│   └── README.md          # This file
├── sfdaily                # Wrapper script
├── database/
│   ├── sfdaily_update/    # SQL files to process
│   └── sfdaily_processed/ # Processed SQL files
└── backend/
    └── package.json        # Node.js dependencies
```

## Future Enhancements

- [ ] Python MCP server for better integration
- [ ] Automatic summary generation using LLM
- [ ] Batch processing of multiple newsletters
- [ ] Tag auto-detection
- [ ] Article thumbnail extraction
- [ ] Webhook support for automated processing

## License

Same as the main project.

