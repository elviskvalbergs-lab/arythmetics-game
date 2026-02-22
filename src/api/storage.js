export const remoteStorage = {
    getItem: async (name) => {
        try {
            const response = await fetch(`/api/storage/${name}`);
            if (!response.ok) return null;
            const data = await response.json();

            // If the database is completely empty (no rows), the API returns {}
            // Zustand's persist middleware expects null to fallback to default state
            if (Object.keys(data).length === 0) return null;

            // Zustand expects { state: ... }, which our API returns
            return data;
        } catch (e) {
            console.error('Failed to fetch from storage:', e);
            return null;
        }
    },
    setItem: async (name, value) => {
        try {
            await fetch(`/api/storage/${name}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(value), // Use state directly based on condition or parameter handling logic in original file
            });
        } catch (e) {
            console.error('Failed to save to storage:', e);
        }
    },
    removeItem: async (name) => {
        // Not implemented for now, or could POST null
    },
};
