#!/usr/bin/env node
/**
 * Self Daily CLI Agent
 * Automates newsletter processing workflows
 * 
 * Usage:
 *   node sfdaily-cli.js process <date> <newsletter_html_file>
 *   node sfdaily-cli.js delete <date>
 *   node sfdaily-cli.js list [date]
 *   node sfdaily-cli.js stats
 *   node sfdaily-cli.js trigger-update
 */

const fs = require('fs');
const path = require('path');

// Add backend/node_modules to module resolution path
const Module = require('module');
const backendNodeModules = path.join(__dirname, '..', 'backend', 'node_modules');
const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function(request, parent, isMain, options) {
  try {
    return originalResolveFilename.call(this, request, parent, isMain, options);
  } catch (err) {
    const updatedRequest = path.join(backendNodeModules, request);
    return originalResolveFilename.call(this, updatedRequest, parent, isMain, options);
  }
};

const { Pool } = require('pg');
const cheerio = require('cheerio');
const axios = require('axios');

// Configuration
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://sfdaily:sfdaily_pass@localhost:3052/sfdaily';
const UPDATE_DIR = path.join(__dirname, '..', 'database', 'sfdaily_update');
const PROCESSED_DIR = path.join(__dirname, '..', 'database', 'sfdaily_processed');

const pool = new Pool({
  connectionString: DATABASE_URL,
});

// Ensure directories exist
fs.mkdirSync(UPDATE_DIR, { recursive: true });
fs.mkdirSync(PROCESSED_DIR, { recursive: true });

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateDate(dateStr) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    throw new Error('Invalid date format. Use YYYY-MM-DD');
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }
  return dateStr;
}

/**
 * Process newsletter HTML and generate SQL file
 */
async function processNewsletter(date, htmlFilePath) {
  try {
    validateDate(date);
    
    log('📰 Processing newsletter...', 'blue');
    
    // Read HTML file
    const html = fs.readFileSync(htmlFilePath, 'utf-8');
    const $ = cheerio.load(html);
    
    // Find all article links
    const articles = [];
    $('a').each((i, elem) => {
      const $link = $(elem);
      const text = $link.text().trim();
      
      if (text.includes('READ MORE') || text.includes('Read more')) {
        // Get parent element to find title
        const $parent = $link.parent();
        const title = $parent.find('h1, h2, h3, h4, strong, b').first().text().trim();
        let url = $link.attr('href');
        
        // Handle base64 encoded URLs
        if (url && url.startsWith('data:text/html')) {
          const match = url.match(/base64,(.+)/);
          if (match) {
            const htmlContent = Buffer.from(match[1], 'base64').toString('utf-8');
            const $decoded = cheerio.load(htmlContent);
            const decodedUrl = $decoded('a').first().attr('href');
            if (decodedUrl) url = decodedUrl;
          }
        }
        
        if (title && url && !articles.find(a => a.title === title)) {
          articles.push({ title, url });
        }
      }
    });
    
    if (articles.length === 0) {
      throw new Error('No articles found in newsletter HTML');
    }
    
    log(`✓ Found ${articles.length} articles`, 'green');
    
    // Generate SQL content
    let sqlContent = `-- Self Daily Articles for ${date}
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

-- Insert articles for ${date}
`;

    for (const article of articles) {
      const titleEscaped = article.title.replace(/'/g, "''");
      const urlEscaped = article.url.replace(/'/g, "''");
      
      sqlContent += `INSERT INTO articles (date, title, summary_fr, tags, rating, url) VALUES (
    '${date}',
    '${titleEscaped}',
    'Summary to be generated',
    '{}',
    0,
    '${urlEscaped}'
);

`;
    }
    
    // Write SQL file
    const sqlFilename = `self-daily-${date}.sql`;
    const sqlFilePath = path.join(UPDATE_DIR, sqlFilename);
    fs.writeFileSync(sqlFilePath, sqlContent, 'utf-8');
    
    log(`✓ Generated SQL file: ${sqlFilename}`, 'green');
    log(`📁 Location: ${sqlFilePath}`, 'blue');
    
    return {
      success: true,
      articlesCount: articles.length,
      sqlFile: sqlFilePath
    };
    
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

/**
 * Delete articles by date
 */
async function deleteByDate(date) {
  try {
    validateDate(date);
    
    log(`🗑️  Deleting articles for ${date}...`, 'yellow');
    
    // Check articles first
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM articles WHERE date = $1',
      [date]
    );
    const count = parseInt(countResult.rows[0].count);
    
    if (count === 0) {
      log('⚠ No articles found for this date', 'yellow');
      return { success: true, deletedCount: 0 };
    }
    
    log(`Found ${count} article(s) to delete`, 'blue');
    
    // Delete articles
    const result = await pool.query(
      'DELETE FROM articles WHERE date = $1 RETURNING id',
      [date]
    );
    
    log(`✓ Deleted ${result.rows.length} article(s)`, 'green');
    
    return {
      success: true,
      deletedCount: result.rows.length
    };
    
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

/**
 * List articles
 */
async function listArticles(date = null) {
  try {
    let query, params;
    
    if (date) {
      validateDate(date);
      query = 'SELECT id, date, title, LEFT(summary_fr, 80) as summary_preview FROM articles WHERE date = $1 ORDER BY id';
      params = [date];
    } else {
      query = 'SELECT id, date, title, LEFT(summary_fr, 80) as summary_preview FROM articles ORDER BY date DESC, id ASC LIMIT 20';
      params = [];
    }
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      log('No articles found', 'yellow');
      return { success: true, articles: [] };
    }
    
    log(`\n${result.rows.length} article(s):`, 'blue');
    result.rows.forEach(article => {
      log(`  ${article.id}. [${article.date}] ${article.title}`, 'reset');
      if (article.summary_preview) {
        log(`     ${article.summary_preview}...`, 'blue');
      }
    });
    
    return {
      success: true,
      articles: result.rows
    };
    
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

/**
 * Get database statistics
 */
async function getStats() {
  try {
    log('📊 Getting statistics...', 'blue');
    
    // Total articles
    const totalResult = await pool.query('SELECT COUNT(*) FROM articles');
    const totalArticles = parseInt(totalResult.rows[0].count);
    
    // Articles by date
    const byDateResult = await pool.query(
      'SELECT date, COUNT(*) as count FROM articles GROUP BY date ORDER BY date DESC'
    );
    
    // Total unique tags
    const tagsResult = await pool.query('SELECT COUNT(*) FROM (SELECT DISTINCT unnest(tags) FROM articles) AS unique_tags');
    const totalTags = parseInt(tagsResult.rows[0].count);
    
    log('\n📈 Statistics:', 'bold');
    log(`  Total articles: ${totalArticles}`, 'green');
    log(`  Total tags: ${totalTags}`, 'green');
    log(`  Articles by date:`, 'blue');
    
    byDateResult.rows.forEach(row => {
      log(`    ${row.date}: ${row.count} article(s)`, 'reset');
    });
    
    return {
      success: true,
      totalArticles,
      totalTags,
      byDate: byDateResult.rows
    };
    
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

/**
 * Trigger manual update
 */
async function triggerUpdate() {
  try {
    log('🔄 Triggering base_updater...', 'blue');
    
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);
    
    // Restart the updater service
    await execPromise('docker-compose restart base_updater', {
      cwd: path.join(__dirname, '..')
    });
    
    log('✓ Base updater restarted', 'green');
    log('Check logs with: docker logs sfdaily_updater', 'blue');
    
    return { success: true };
    
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

// Main CLI handler
async function main() {
  const command = process.argv[2];
  
  if (!command) {
    log('\nSelf Daily CLI Agent', 'bold');
    log('Usage:', 'blue');
    log('  node sfdaily-cli.js process <date> <html_file>');
    log('  node sfdaily-cli.js delete <date>');
    log('  node sfdaily-cli.js list [date]');
    log('  node sfdaily-cli.js stats');
    log('  node sfdaily-cli.js trigger-update');
    process.exit(0);
  }
  
  let result;
  
  switch (command) {
    case 'process':
      const date = process.argv[3];
      const htmlFile = process.argv[4];
      if (!date || !htmlFile) {
        log('Error: Missing arguments for process command', 'red');
        log('Usage: node sfdaily-cli.js process <date> <html_file>', 'yellow');
        process.exit(1);
      }
      result = await processNewsletter(date, htmlFile);
      break;
      
    case 'delete':
      const deleteDate = process.argv[3];
      if (!deleteDate) {
        log('Error: Missing date argument for delete command', 'red');
        log('Usage: node sfdaily-cli.js delete <date>', 'yellow');
        process.exit(1);
      }
      result = await deleteByDate(deleteDate);
      break;
      
    case 'list':
      const listDate = process.argv[3];
      result = await listArticles(listDate);
      break;
      
    case 'stats':
      result = await getStats();
      break;
      
    case 'trigger-update':
      result = await triggerUpdate();
      break;
      
    default:
      log(`Unknown command: ${command}`, 'red');
      process.exit(1);
  }
  
  // Close database connection
  await pool.end();
  
  // Exit with appropriate code
  process.exit(result.success ? 0 : 1);
}

// Run CLI
main().catch(error => {
  log(`Fatal error: ${error.message}`, 'red');
  process.exit(1);
});

