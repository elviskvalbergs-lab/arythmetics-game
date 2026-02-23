import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const { key } = req.query;

    if (req.method === 'GET') {
        try {
            const data = await kv.get(key);
            res.status(200).json(data || {});
        } catch (err) {
            console.error("GET Error:", err);
            res.status(500).json({ error: err?.message || String(err), stack: err?.stack });
        }
    } else if (req.method === 'POST') {
        try {
            await kv.set(key, req.body);
            res.status(200).json({ success: true });
        } catch (err) {
            console.error("POST Error:", err);
            res.status(500).json({ error: err?.message || String(err) });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
