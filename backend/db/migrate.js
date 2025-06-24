
require('dotenv').config({ path: '.env' });

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
});

async function runMigrations() {
    let client;
    try {
        client = await pool.connect();
        const schemaSql = fs.readFileSync(path.join(__dirname, 'init.sql')).toString();

        console.log('Running database migrations...');
        await client.query(schemaSql);
        console.log('Database migrations completed successfully!');
    } catch (err) {
        console.error('Error running database migrations:', err.stack);
        process.exit(1); 
    } finally {
        if (client) {
            client.release();
        }
        await pool.end(); // Close the pool after migrations are done
    }
}

runMigrations();