import AsyncStorage from '@react-native-async-storage/async-storage';

// These are the "keys" (like labels on a folder) where we save data locally
const AUTH_KEY = 'truthify_auth';
const SESSION_KEY = 'truthify_session';
const ONBOARD_KEY = 'truthify_onboarded';

// 1. Save the user data (like their MongoDB _id and name) when they log in
export const saveAuth = async (user) => {
  try {
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Error saving auth data locally', e);
  }
};

// 2. Read the user data to check who is currently logged in
export const getAuth = async () => {
  try {
    const userStr = await AsyncStorage.getItem(AUTH_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error('Error reading auth data', e);
    return null;
  }
};

// 3. Save the exact time they logged in (so we can log them out after 7 days for security)
export const saveSession = async () => {
  try {
    const session = { loginTime: Date.now() };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Error saving session time', e);
  }
};

// 4. Get the time they logged in
export const getSession = async () => {
  try {
    const sessionStr = await AsyncStorage.getItem(SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  } catch (e) {
    console.error('Error getting session time', e);
    return null;
  }
};

// 5. Delete everything when the user clicks "Logout"
export const clearSession = async () => {
  try {
    await AsyncStorage.removeItem(AUTH_KEY);
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.error('Error clearing session', e);
  }
};

// 6. Mark the tutorial as "completed" so they never see it again
export const setOnboarded = async () => {
  try {
    await AsyncStorage.setItem(ONBOARD_KEY, 'true');
  } catch (e) {
    console.error('Error setting onboarded flag', e);
  }
};

// 7. Check if they have finished the tutorial
export const isOnboarded = async () => {
  try {
    const value = await AsyncStorage.getItem(ONBOARD_KEY);
    return value === 'true';
  } catch (e) {
    console.error('Error getting onboarded flag', e);
    return false;
  }
};
// Add this near the top with your other keys
const SCANS_KEY = 'truthify_scans';

// Add these to the bottom of the file
export const saveScans = async (scans) => {
  try {
    await AsyncStorage.setItem(SCANS_KEY, JSON.stringify(scans));
  } catch (e) {
    console.error('Error saving scans', e);
  }
};

export const getScans = async () => {
  try {
    const scansStr = await AsyncStorage.getItem(SCANS_KEY);
    // Return the array of scans, or an empty array [] if they have none
    return scansStr ? JSON.parse(scansStr) : []; 
  } catch (e) {
    console.error('Error reading scans', e);
    return [];
  }
};
// Add this near the top with your other keys if you want to keep it organized:
// const PROFILE_KEY = 'truthify_profile';

const PROFILE_KEY = 'truthify_profile';

export const saveProfile = async (profile) => {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile', e);
  }
};

export const getProfile = async () => {
  try {
    const profileStr = await AsyncStorage.getItem(PROFILE_KEY);
    // Returning a safe default object here instead of null so your LinearGradient doesn't crash!
    return profileStr ? JSON.parse(profileStr) : { name: 'User', avatar: null }; 
  } catch (e) {
    console.error('Error reading profile', e);
    return { name: 'User', avatar: null };
  }
};