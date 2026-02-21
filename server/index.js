import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Helper to get value
const get = (key) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT data FROM kv_store WHERE id = ?', [key], (err, row) => {
            if (err) reject(err);
            else resolve(row ? JSON.parse(row.data) : null);
        });
    });
};

// Helper to set value
const setKey = (key, value) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT OR REPLACE INTO kv_store (id, data) VALUES (?, ?)', [key, JSON.stringify(value)], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

app.get('/api/storage/:key', async (req, res) => {
    try {
        const data = await get(req.params.key);
        res.json(data || {});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/storage/:key', async (req, res) => {
    try {
        await setKey(req.params.key, req.body);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
