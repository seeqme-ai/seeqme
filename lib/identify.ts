/**
 * Production-grade Persistent Browser Identification
 * 
 * This utility ensures every visitor has a unique, stable identity that persists
 * across browser sessions, even if they aren't logged in.
 */

const SEEQME_ANON_ID_KEY = 'seeqme_device_id';

export function getAnonymousId(): string {
    if (typeof window === 'undefined') return 'server';

    let anonId = localStorage.getItem(SEEQME_ANON_ID_KEY);

    if (!anonId) {
        // Generate a high-entropy stable ID
        const timestamp = Date.now().toString(36);
        const randomStr = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        anonId = `dev_${timestamp}_${randomStr}`;
        localStorage.setItem(SEEQME_ANON_ID_KEY, anonId);
    }

    return anonId;
}

/**
 * Convenience to check if the current user is tracked via a legacy guest string
 */
export function cleanupLegacyGuest(): void {
    if (typeof window === 'undefined') return;
    const draft = localStorage.getItem('seeqme_portfolio_draft');
    if (draft && draft.includes('"userId":"guest"')) {
        localStorage.removeItem('seeqme_portfolio_draft');
    }
}
