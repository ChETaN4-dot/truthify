import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    SCANS: 'truthify_scans',
    PROFILE: 'truthify_profile',
    ONBOARDING: 'truthify_onboarded',
    SETTINGS: 'truthify_settings',
    AUTH: 'truthify_auth',
    SESSION: 'truthify_session',
};

// ── Scans ──────────────────────────────────────────────────────
export const saveScan = async (scanResult) => {
    const scans = await getScans();
    const newScan = { id: Date.now().toString(), timestamp: new Date().toISOString(), ...scanResult };
    await AsyncStorage.setItem(KEYS.SCANS, JSON.stringify([newScan, ...scans]));
    return newScan;
};

export const getScans = async () => {
    const data = await AsyncStorage.getItem(KEYS.SCANS);
    return data ? JSON.parse(data) : [];
};

export const deleteScan = async (id) => {
    const scans = await getScans();
    await AsyncStorage.setItem(KEYS.SCANS, JSON.stringify(scans.filter(s => s.id !== id)));
};

// Legacy aliases used in older screens
export const saveToHistory = saveScan;
export const getHistory = getScans;
export const deleteFromHistory = deleteScan;

// ── Profile ────────────────────────────────────────────────────
export const saveProfile = async (profile) => {
    await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
};

export const getProfile = async () => {
    const data = await AsyncStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : {
        name: 'User',
        language: 'English',
        memberSince: new Date().toISOString(),
        filters: {
            diabetic: false, vegan: false, glutenFree: false,
            lactoseFree: false, nutAllergy: false,
            noArtificialColors: false, noPreservatives: false, noPalmOil: false,
        },
        notifications: { highSeverity: true, greenwashing: true },
    };
};

// ── Onboarding ─────────────────────────────────────────────────
export const setOnboarded = async () => AsyncStorage.setItem(KEYS.ONBOARDING, 'true');
export const isOnboarded = async () => !!(await AsyncStorage.getItem(KEYS.ONBOARDING));

// ── Auth ───────────────────────────────────────────────────────
export const saveAuth = async (user) => AsyncStorage.setItem(KEYS.AUTH, JSON.stringify(user));
export const getAuth = async () => { const d = await AsyncStorage.getItem(KEYS.AUTH); return d ? JSON.parse(d) : null; };
export const saveSession = async () => AsyncStorage.setItem(KEYS.SESSION, JSON.stringify({ loginTime: Date.now() }));
export const getSession = async () => { const d = await AsyncStorage.getItem(KEYS.SESSION); return d ? JSON.parse(d) : null; };
export const clearSession = async () => AsyncStorage.removeItem(KEYS.SESSION);
