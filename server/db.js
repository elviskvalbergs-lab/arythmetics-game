import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'game.db');
const sqlite3Verbose = sqlite3.verbose();

const db = new sqlite3Verbose.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath + ': ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS kv_store (
            id TEXT PRIMARY KEY,
            data TEXT
        )`, (err) => {
            if (err) {
                console.error('Error creating table: ' + err.message);
            }
        });
    }
});

export default db;
