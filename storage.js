(function(root, factory) {
    const storageApi = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = storageApi;
    }
    root.HanziFunStorage = storageApi;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
    const STORAGE_KEY = 'hanzifun.learning.v1';
    const DATA_VERSION = 1;
    const MAX_SESSIONS = 50;

    function createEmptyData() {
        return {
            version: DATA_VERSION,
            sessions: [],
            characters: {},
        };
    }

    function asNonNegativeInteger(value) {
        return Number.isInteger(value) && value >= 0 ? value : 0;
    }

    function normalizeCharacterStats(stats) {
        if (!stats || typeof stats !== 'object') return null;
        return {
            seenCount: asNonNegativeInteger(stats.seenCount),
            familiarCount: asNonNegativeInteger(stats.familiarCount),
            unfamiliarCount: asNonNegativeInteger(stats.unfamiliarCount),
            needsReview: stats.needsReview === true,
            lastResult: typeof stats.lastResult === 'boolean' ? stats.lastResult : null,
            lastSeenAt: Number.isFinite(stats.lastSeenAt) ? stats.lastSeenAt : null,
        };
    }

    function normalizeSession(session) {
        if (!session || typeof session !== 'object') return null;
        if (!Array.isArray(session.results)) return null;

        const results = session.results
            .filter(result => result && typeof result.char === 'string' && typeof result.status === 'boolean')
            .map(result => ({ char: result.char, status: result.status }));
        if (results.length === 0) return null;

        const familiar = results.filter(result => result.status).length;
        return {
            id: typeof session.id === 'string' ? session.id : String(session.completedAt || ''),
            kind: session.kind === 'review' ? 'review' : 'learning',
            completedAt: Number.isFinite(session.completedAt) ? session.completedAt : Date.now(),
            total: results.length,
            familiar,
            unfamiliar: results.length - familiar,
            results,
        };
    }

    function normalizeData(value) {
        if (!value || typeof value !== 'object') return createEmptyData();

        const sessions = Array.isArray(value.sessions)
            ? value.sessions.map(normalizeSession).filter(Boolean).slice(0, MAX_SESSIONS)
            : [];
        const characters = {};
        if (value.characters && typeof value.characters === 'object') {
            Object.entries(value.characters).forEach(([char, stats]) => {
                const normalized = normalizeCharacterStats(stats);
                if (char && normalized) characters[char] = normalized;
            });
        }

        return { version: DATA_VERSION, sessions, characters };
    }

    function loadData(storage) {
        if (!storage || typeof storage.getItem !== 'function') return createEmptyData();
        try {
            const raw = storage.getItem(STORAGE_KEY);
            return raw ? normalizeData(JSON.parse(raw)) : createEmptyData();
        } catch (error) {
            return createEmptyData();
        }
    }

    function saveData(storage, data) {
        if (!storage || typeof storage.setItem !== 'function') return false;
        try {
            storage.setItem(STORAGE_KEY, JSON.stringify(normalizeData(data)));
            return true;
        } catch (error) {
            return false;
        }
    }

    function clearData(storage) {
        if (!storage) return false;
        try {
            if (typeof storage.removeItem === 'function') {
                storage.removeItem(STORAGE_KEY);
            } else if (typeof storage.setItem === 'function') {
                storage.setItem(STORAGE_KEY, JSON.stringify(createEmptyData()));
            } else {
                return false;
            }
            return true;
        } catch (error) {
            return false;
        }
    }

    function recordSession(data, payload) {
        const current = normalizeData(data);
        const cards = Array.isArray(payload && payload.cards) ? payload.cards : [];
        const statuses = Array.isArray(payload && payload.statuses) ? payload.statuses : [];
        const results = cards
            .map((card, index) => ({
                char: typeof card === 'string' ? card : card && card.char,
                status: statuses[index],
            }))
            .filter(result => typeof result.char === 'string' && typeof result.status === 'boolean');

        if (results.length === 0) return current;

        const completedAt = Number.isFinite(payload.completedAt) ? payload.completedAt : Date.now();
        const kind = payload.kind === 'review' ? 'review' : 'learning';
        const familiar = results.filter(result => result.status).length;
        const session = {
            id: `${completedAt}-${kind}-${current.sessions.length + 1}`,
            kind,
            completedAt,
            total: results.length,
            familiar,
            unfamiliar: results.length - familiar,
            results,
        };
        const characters = { ...current.characters };

        results.forEach(result => {
            const previous = normalizeCharacterStats(characters[result.char]) || normalizeCharacterStats({});
            characters[result.char] = {
                seenCount: previous.seenCount + 1,
                familiarCount: previous.familiarCount + (result.status ? 1 : 0),
                unfamiliarCount: previous.unfamiliarCount + (result.status ? 0 : 1),
                needsReview: result.status === false,
                lastResult: result.status,
                lastSeenAt: completedAt,
            };
        });

        return {
            version: DATA_VERSION,
            sessions: [session, ...current.sessions].slice(0, MAX_SESSIONS),
            characters,
        };
    }

    function getDashboard(data) {
        const normalized = normalizeData(data);
        const weakCharacters = Object.entries(normalized.characters)
            .filter(([, stats]) => stats.needsReview)
            .sort((a, b) => {
                if (b[1].unfamiliarCount !== a[1].unfamiliarCount) {
                    return b[1].unfamiliarCount - a[1].unfamiliarCount;
                }
                return (b[1].lastSeenAt || 0) - (a[1].lastSeenAt || 0);
            })
            .map(([char, stats]) => ({ char, ...stats }));

        return {
            learningRounds: normalized.sessions.filter(session => session.kind === 'learning').length,
            reviewRounds: normalized.sessions.filter(session => session.kind === 'review').length,
            learnedCharacters: Object.keys(normalized.characters).length,
            weakCharacters,
            recentSessions: normalized.sessions.slice(0, 8),
        };
    }

    function createStore(storage) {
        let data = loadData(storage);
        return {
            getData() {
                return normalizeData(data);
            },
            getDashboard() {
                return getDashboard(data);
            },
            record(payload) {
                data = recordSession(data, payload);
                return { data: normalizeData(data), saved: saveData(storage, data) };
            },
            clear() {
                data = createEmptyData();
                return clearData(storage);
            },
        };
    }

    return {
        STORAGE_KEY,
        createEmptyData,
        normalizeData,
        loadData,
        saveData,
        clearData,
        recordSession,
        getDashboard,
        createStore,
    };
});
