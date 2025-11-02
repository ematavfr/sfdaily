#!/usr/bin/env python3
"""
MCP Server for Self Daily Newsletter Processing Agent
Provides tools to automate the SQL file generation workflow
"""

import os
import sys
from datetime import datetime
from pathlib import Path
import json
import re
from typing import Optional

from fastmcp import FastMCP
import psycopg2
from bs4 import BeautifulSoup

# Initialize FastMCP server
mcp = FastMCP("Self Daily Agent")

# Configuration
DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://sfdaily:sfdaily_pass@localhost:3052/sfdaily')
UPDATE_DIR = Path(os.environ.get('UPDATE_DIR', './database/sfdaily_update'))
PROCESSED_DIR = Path(os.environ.get('PROCESSED_DIR', './database/sfdaily_processed'))


def get_db_connection():
    """Get database connection"""
    try:
        return psycopg2.connect(DATABASE_URL)
    except Exception as e:
        return None


@mcp.tool()
def process_newsletter(date: str, newsletter_html: str) -> dict:
    """
    Process a Self Daily newsletter HTML and generate SQL file for articles.
    
    Args:
        date: Date in YYYY-MM-DD format
        newsletter_html: Full HTML content of the newsletter
        
    Returns:
        Dictionary with status and generated SQL file path
    """
    try:
        # Validate date format
        datetime.strptime(date, '%Y-%m-%d')
    except ValueError:
        return {"error": "Invalid date format. Use YYYY-MM-DD"}
    
    # Parse HTML
    soup = BeautifulSoup(newsletter_html, 'html.parser')
    
    # Find all article links (Self Daily style)
    articles = []
    for link in soup.find_all('a', href=True):
        text = link.get_text(strip=True)
        if 'READ MORE' in text or 'Read more' in text:
            # Get parent to find title
            parent = link.find_parent(['div', 'article', 'section', 'td', 'tr'])
            if parent:
                # Try to find title in nearby elements
                title_elem = parent.find(['h1', 'h2', 'h3', 'h4', 'strong', 'b'])
                if title_elem:
                    title = title_elem.get_text(strip=True)
                    url = link['href']
                    
                    # Handle base64 encoded URLs
                    if url.startswith('data:text/html'):
                        # Extract base64 content
                        match = re.search(r'base64,(.+)', url)
                        if match:
                            import base64
                            html_content = base64.b64decode(match.group(1)).decode('utf-8')
                            soup_url = BeautifulSoup(html_content, 'html.parser')
                            url_elem = soup_url.find('a', href=True)
                            if url_elem:
                                url = url_elem['href']
                    
                    if title and url and title not in [a['title'] for a in articles]:
                        articles.append({
                            'title': title,
                            'url': url
                        })
    
    if not articles:
        return {"error": "No articles found in newsletter HTML"}
    
    # Generate SQL file
    sql_content = f"""-- Self Daily Articles for {date}
-- Table creation if not exists

CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    title VARCHAR(500) NOT NULL,
    summary_fr TEXT,
    tags TEXT[],
    rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    url TEXT
);

-- Insert articles for {date}
"""
    
    for article in articles:
        title_escaped = article['title'].replace("'", "''")
        url_escaped = article['url'].replace("'", "''")
        tags = '{}'  # Will be populated later
        summary = "Summary to be generated"  # Will be populated later
        
        sql_content += f"""INSERT INTO articles (date, title, summary_fr, tags, rating, url) VALUES (
    '{date}',
    '{title_escaped}',
    '{summary}',
    '{tags}',
    0,
    '{url_escaped}'
);

"""
    
    # Write SQL file
    sql_file = UPDATE_DIR / f"self-daily-{date}.sql"
    sql_file.parent.mkdir(parents=True, exist_ok=True)
    
    with open(sql_file, 'w', encoding='utf-8') as f:
        f.write(sql_content)
    
    return {
        "status": "success",
        "articles_found": len(articles),
        "sql_file": str(sql_file),
        "message": f"Generated SQL file with {len(articles)} articles"
    }


@mcp.tool()
def delete_by_date(date: str) -> dict:
    """
    Delete all articles for a specific date from the database.
    
    Args:
        date: Date in YYYY-MM-DD format
        
    Returns:
        Dictionary with deletion status
    """
    try:
        # Validate date format
        datetime.strptime(date, '%Y-%m-%d')
    except ValueError:
        return {"error": "Invalid date format. Use YYYY-MM-DD"}
    
    conn = get_db_connection()
    if not conn:
        return {"error": "Could not connect to database"}
    
    try:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM articles WHERE date = %s RETURNING id", (date,))
        deleted_ids = cursor.fetchall()
        conn.commit()
        cursor.close()
        conn.close()
        
        return {
            "status": "success",
            "deleted_count": len(deleted_ids),
            "message": f"Deleted {len(deleted_ids)} articles for {date}"
        }
    except Exception as e:
        return {"error": f"Database error: {str(e)}"}


@mcp.tool()
def trigger_update() -> dict:
    """
    Manually trigger the base_updater to process pending SQL files immediately.
    
    Returns:
        Dictionary with trigger status
    """
    import subprocess
    
    try:
        # Restart the updater service
        result = subprocess.run(
            ['docker-compose', 'restart', 'base_updater'],
            capture_output=True,
            text=True,
            cwd=Path.cwd()
        )
        
        if result.returncode == 0:
            return {
                "status": "success",
                "message": "Base updater restarted successfully. Check logs for processing status."
            }
        else:
            return {
                "error": "Failed to restart base_updater",
                "stderr": result.stderr
            }
    except Exception as e:
        return {"error": f"Failed to trigger update: {str(e)}"}


@mcp.tool()
def list_articles(date: Optional[str] = None) -> dict:
    """
    List articles from the database.
    
    Args:
        date: Optional date filter in YYYY-MM-DD format
        
    Returns:
        Dictionary with list of articles
    """
    conn = get_db_connection()
    if not conn:
        return {"error": "Could not connect to database"}
    
    try:
        cursor = conn.cursor()
        
        if date:
            # Validate date format
            try:
                datetime.strptime(date, '%Y-%m-%d')
            except ValueError:
                return {"error": "Invalid date format. Use YYYY-MM-DD"}
            
            cursor.execute(
                "SELECT id, date, title, LEFT(summary_fr, 80) as summary_preview FROM articles WHERE date = %s ORDER BY id",
                (date,)
            )
        else:
            cursor.execute(
                "SELECT id, date, title, LEFT(summary_fr, 80) as summary_preview FROM articles ORDER BY date DESC, id ASC LIMIT 20"
            )
        
        articles = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return {
            "status": "success",
            "count": len(articles),
            "articles": [
                {
                    "id": article[0],
                    "date": str(article[1]),
                    "title": article[2],
                    "summary_preview": article[3]
                }
                for article in articles
            ]
        }
    except Exception as e:
        return {"error": f"Database error: {str(e)}"}


@mcp.tool()
def get_stats() -> dict:
    """
    Get statistics about the database.
    
    Returns:
        Dictionary with database statistics
    """
    conn = get_db_connection()
    if not conn:
        return {"error": "Could not connect to database"}
    
    try:
        cursor = conn.cursor()
        
        # Total articles
        cursor.execute("SELECT COUNT(*) FROM articles")
        total_articles = cursor.fetchone()[0]
        
        # Articles by date
        cursor.execute("SELECT date, COUNT(*) as count FROM articles GROUP BY date ORDER BY date DESC")
        articles_by_date = cursor.fetchall()
        
        # Total tags
        cursor.execute("SELECT COUNT(DISTINCT unnest(tags)) FROM articles")
        total_tags = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        return {
            "status": "success",
            "total_articles": total_articles,
            "total_tags": total_tags,
            "articles_by_date": [
                {"date": str(row[0]), "count": row[1]}
                for row in articles_by_date
            ]
        }
    except Exception as e:
        return {"error": f"Database error: {str(e)}"}


if __name__ == "__main__":
    # Run the MCP server
    mcp.run()

