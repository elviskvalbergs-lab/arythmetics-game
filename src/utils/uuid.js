export const generateUUID = () => {
    // If we're in a secure context with crypto.randomUUID, use it
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    // Otherwise fallback to a manual implementation (UUID v4)
    // This is necessary for non-HTTPS network access (e.g. 192.168.x.x)
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
        (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & 15) >> (c / 4)).toString(16)
    );
};

// Even safer fallback if crypto.getRandomValues is also missing (highly unlikely in modern browsers but possible)
function fallbackUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Override slightly to checking getRandomValues
export const safeUUID = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
        return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
            (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & 15) >> (c / 4)).toString(16)
        );
    }

    return fallbackUUID();
};
