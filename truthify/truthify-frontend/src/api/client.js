// truthify-app/src/api/client.js
import Constants from 'expo-constants';

// 🌟 MAGIC IP DETECTOR 🌟
// Automatically finds your PC's IP address from Expo's connection
const hostUri = Constants.expoConfig?.hostUri;

// Extracts just the IP part (e.g., "192.168.1.104"). 
// If it fails for any reason, it falls back to your last known IP just to be safe.
const MY_IP = hostUri ? hostUri.split(':')[0] : '192.168.1.105';

const BASE_URL = `http://${MY_IP}:5000/api/auth`;

console.log("🔥 Auto-Detected Backend IP:", MY_IP);
console.log("🔥 Full Auth URL:", BASE_URL);

// 1. Register API Call
export const registerUser = async (name, pin) => {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, pin }),
    });
    return await response.json();
  } catch (error) {
    console.error('Register API Error:', error);
    return { success: false, message: 'Network error. Make sure your PC and phone are on the same Wi-Fi.' };
  }
};

// 2. Login API Call
export const loginUser = async (name, pin) => {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, pin }),
    });
    return await response.json();
  } catch (error) {
    console.error('Login API Error:', error);
    return { success: false, message: 'Network error. Make sure your PC and phone are on the same Wi-Fi.' };
  }
};

// 3. Get User's Scan History from MongoDB
export const getUserHistory = async (userId) => {
  try {
    // We replace '/auth' with '/scans' so it points to the right backend folder
    const url = BASE_URL.replace('/auth', '') + `/scans/history/${userId}`;

    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('History API Error:', error);
    return { success: false, history: [] };
  }
};
// 4. Save a New Scan to MongoDB
export const saveUserScan = async (scanData) => {
  try {
    // Pointing to POST /api/scans/save
    const url = BASE_URL.replace('/auth', '') + `/scans/save`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scanData), // We package the user ID and scan details here!
    });
    return await response.json();
  } catch (error) {
    console.error('Save Scan API Error:', error);
    return { success: false, message: 'Network error while saving scan.' };
  }
};
// ==========================================
// 🌟 PROFILE & PREFERENCES API 🌟
// ==========================================

// 4. Get User Profile Data
export const getUserProfile = async (userId) => {
  try {
    // We replace '/auth' with '/profile' to hit our new backend route
    const url = BASE_URL.replace('/auth', '') + `/profile/${userId}`;

    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error('Profile Fetch API Error:', error);
    return { success: false, message: 'Network error while fetching profile.' };
  }
};

// 5. Update User Profile (Name, Language, Preferences)
export const updateUserPreferences = async (userId, profileData) => {
  try {
    const url = BASE_URL.replace('/auth', '') + `/profile/${userId}/preferences`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData), // 👈 Send the whole package!
    });
    return await response.json();
  } catch (error) {
    console.error('Update Preferences API Error:', error);
    return { success: false, message: 'Network error while saving preferences.' };
  }
};