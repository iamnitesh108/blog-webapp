require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT;

// Middlewares
app.use(express.json());

// API Routes
app.get('/', (req, res) => {
    res.send('Blog API is running!');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});