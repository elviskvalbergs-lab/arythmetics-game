import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const { key } = req.query;

    if (req.method === 'GET') {
        try {
            const data = await kv.get(key);
            res.status(200).json(data || {});
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    } else if (req.method === 'POST') {
        try {
            await kv.set(key, req.body);
            res.status(200).json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
