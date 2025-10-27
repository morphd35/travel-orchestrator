// Temporary password storage for production
// In production, we'll store temporary passwords in memory since SQLite is readonly
// This is a temporary solution - in real production, you'd use Redis or similar

const tempPasswords = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of tempPasswords.entries()) {
        if (now - data.timestamp > 15 * 60 * 1000) { // 15 minutes expiry
            tempPasswords.delete(key);
        }
    }
}, 5 * 60 * 1000);

export function storeTempPassword(email: string, hashedPassword: string) {
    tempPasswords.set(email, {
        hashedPassword,
        timestamp: Date.now()
    });
}

export function getTempPassword(email: string): string | null {
    const data = tempPasswords.get(email);
    if (!data) return null;

    // Check if expired (15 minutes)
    if (Date.now() - data.timestamp > 15 * 60 * 1000) {
        tempPasswords.delete(email);
        return null;
    }

    return data.hashedPassword;
}

export function clearTempPassword(email: string) {
    tempPasswords.delete(email);
}
