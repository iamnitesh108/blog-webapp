require('dotenv').config();

const express = require('express');
const multer = require('multer');

const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const port = process.env.PORT;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Database Connection
const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
});

pool.connect()
    .then(client => {
        console.log('Connected to PostgreSQL database!');
        client.release(); // Release the client back to the pool
    })
    .catch(err => {
        console.error('Error connecting to PostgreSQL database:', err.stack);
        process.exit(1); // Exit process if database connection fails
    });

// API Routes
app.get('/', (req, res) => {
    res.send('Blog API is running!');
});

// GET all articles
app.get('/api/articles', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM articles ORDER BY published_date DESC');
        res.json(result.rows); 
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' }); 
    }
});

app.get('/api/articles/:id', async (req, res) => {
   
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM articles WHERE id = $1', [id]);
    //    console.log(result)
        if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Article not found' });
        }

        res.json(result.rows[0])
    } catch (error) {
         if (error.code === '22P02') { 
                 return res.status(400).json({ error: 'Invalid article ID format' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
})

app.post('/api/articles', async (req, res) => {
    try {
        const { title, content, author, tags, is_published } = req.body;

        if (!title || title.trim() === '') {
            return res.status(400).json({ error: 'Title is required' });
        }

        if (!content || content.trim() === '') {
            return res.status(400).json({ error: 'Content is required' });
        }

        let tagsArray = [];
        try {
            tagsArray = JSON.parse(tags);
            if (!Array.isArray(tagsArray)) {
                return res.status(400).json({ error: 'Tags must be an array' });
            }
        } catch (e) {
            return res.status(400).json({ error: 'Tags must be valid JSON array' });
        }

        const isPublishedBool = is_published === 'true' || is_published === true;

        const result = await pool.query(
            'INSERT INTO articles (title, content, author, tags, is_published) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, content, author || 'Anonymous', tagsArray, isPublishedBool]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error inserting article:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.patch('/api/articles/:id', async (req, res) => {
    const { id } = req.params;
    const { title, content, author, tags, is_published } = req.body;

    try {
        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'Invalid article ID' });
        }

        const fields = [];
        const values = [];
        let index = 1;

        if (title !== undefined && title.trim() !== '') {
            fields.push(`title = $${index++}`);
            values.push(title.trim());
        }

        if (content !== undefined && content.trim() !== '') {
            fields.push(`content = $${index++}`);
            values.push(content.trim());
        }

        if (author !== undefined && author.trim() !== '') {
            fields.push(`author = $${index++}`);
            values.push(author.trim());
        }

        if (tags !== undefined) {
            let tagsArray = [];

            if (typeof tags === 'string') {
                if (tags.trim() === '') {
                    tagsArray = []; // empty string = empty array
                } else {
                    try {
                        const parsed = JSON.parse(tags);
                        if (!Array.isArray(parsed)) throw new Error();
                        tagsArray = parsed;
                    } catch {
                        return res.status(400).json({ error: 'Tags must be a valid JSON array or empty string' });
                    }
                }
            } else if (Array.isArray(tags)) {
                tagsArray = tags;
            } else {
                return res.status(400).json({ error: 'Tags must be an array or stringified array' });
            }

            fields.push(`tags = $${index++}`);
            values.push(tagsArray);
        }

        if (is_published !== undefined) {
            const isPublishedBool = is_published === 'true' || is_published === true;
            fields.push(`is_published = $${index++}`);
            values.push(isPublishedBool);
        }

        if (fields.length === 0) {
            return res.status(400).json({ error: 'No valid fields provided for update' });
        }

        values.push(id);
        const query = `UPDATE articles SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error('Error updating article:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});



app.delete('/api/articles/:id', async (req, res) => {
    const { id } = req.params;

    try {
        if (!id || isNaN(id)) {
            return res.status(400).json({ error: 'Invalid article ID' });
        }

        const result = await pool.query(
            'DELETE FROM articles WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }

        res.json({ message: 'Article deleted successfully', article: result.rows[0] });
    } catch (error) {
        console.error('Error deleting article:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});