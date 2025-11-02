const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://sfdaily:sfdaily_pass@database:5432/sfdaily',
});

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get articles for a specific date
app.get('/api/articles/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const result = await pool.query(
      'SELECT * FROM articles WHERE date = $1 ORDER BY id',
      [date]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all unique dates
app.get('/api/dates', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT date FROM articles ORDER BY date DESC'
    );
    res.json(result.rows.map(row => row.date));
  } catch (error) {
    console.error('Error fetching dates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update article rating
app.put('/api/articles/:id/rating', async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    
    if (rating < 0 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 0 and 5' });
    }
    
    const result = await pool.query(
      'UPDATE articles SET rating = $1 WHERE id = $2 RETURNING *',
      [rating, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating rating:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get articles filtered by tags
app.get('/api/articles/search', async (req, res) => {
  try {
    const { tags, date } = req.query;
    
    let query = 'SELECT * FROM articles WHERE 1=1';
    const params = [];
    let paramCount = 0;
    
    if (date) {
      paramCount++;
      query += ` AND date = $${paramCount}`;
      params.push(date);
    }
    
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      paramCount++;
      query += ` AND tags && $${paramCount}`;
      params.push(tagArray);
    }
    
    query += ' ORDER BY id';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error searching articles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});

