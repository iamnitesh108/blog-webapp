require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT;

// Middlewares
app.use(express.json());

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

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});