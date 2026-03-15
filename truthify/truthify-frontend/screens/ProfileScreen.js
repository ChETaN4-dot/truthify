import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, StatusBar, ActivityIndicator, Animated, Modal
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { C } from '../constants/colors';

// 👉 Backend API Imports
import { getAuth } from '../utils/storage';
import { getUserProfile, updateUserPreferences } from '../src/api/client';

const TOGGLES = [
    { key: 'diabetic', label: 'Diabetic Friendly', emoji: '🩺' },
    { key: 'vegan', label: 'Vegan', emoji: '🌱' },
    { key: 'glutenFree', label: 'Gluten Free', emoji: '🌾' },
    { key: 'lactoseFree', label: 'Lactose Intolerant', emoji: '🥛' },
    { key: 'nutAllergy', label: 'Nut Allergy', emoji: '🥜' },
    { key: 'noArtificialColors', label: 'No Artificial Colors', emoji: '🎨' },
    { key: 'noPreservatives', label: 'No Preservatives', emoji: '🧪' },
    { key: 'noPalmOil', label: 'No Palm Oil', emoji: '🌴' },
];

const LANGUAGES = ['English', 'Hinglish', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Kannada', 'Malayalam'];

export default function ProfileScreen({ userName, onLogout }) {
    const [profile, setProfile] = useState({ preferences: {}, language: 'English' });
    const [name, setName] = useState(userName || '');
    const [loading, setLoading] = useState(true);

    // 🌟 ANIMATION REFS 🌟
    const toastAnim = useRef(new Animated.Value(-100)).current;
    
    // 🌟 NEW LOGOUT MODAL STATE & ANIMATION 🌟
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const modalScale = useRef(new Animated.Value(0)).current;

    useFocusEffect(useCallback(() => {
        const fetchCloudProfile = async () => {
            setLoading(true);
            const user = await getAuth();
            if (user && user._id) {
                const result = await getUserProfile(user._id);
                if (result.success && result.profile) {
                    setProfile(result.profile);
                    setName(result.profile.name || userName || '');
                }
            }
            setLoading(false);
        };
        fetchCloudProfile();
    }, []));

    // Toast Animation
    const showSuccessToast = () => {
        Animated.spring(toastAnim, { toValue: 60, useNativeDriver: true, friction: 8, tension: 40 }).start();
        setTimeout(() => {
            Animated.timing(toastAnim, { toValue: -100, duration: 400, useNativeDriver: true }).start();
        }, 3000);
    };

    // 🌟 LOGOUT MODAL ANIMATIONS 🌟
    const openLogoutModal = () => {
        setShowLogoutModal(true);
        Animated.spring(modalScale, {
            toValue: 1,
            friction: 6,
            tension: 40,
            useNativeDriver: true
        }).start();
    };

    const closeLogoutModal = () => {
        Animated.timing(modalScale, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true
        }).start(() => setShowLogoutModal(false));
    };

    const confirmLogout = () => {
        closeLogoutModal();
        setTimeout(() => {
            if (onLogout) onLogout();
        }, 200); // Wait for the animation to finish before actually logging out
    };

    const togglePreference = (key) => setProfile(prev => ({
        ...prev, 
        preferences: { ...prev.preferences, [key]: !prev.preferences?.[key] }
    }));

    const handleSave = async () => {
        const user = await getAuth();
        if (user && user._id) {
            const payload = {
                name: name,
                language: profile.language || 'English',
                preferences: profile.preferences || {}
            };
            
            const result = await updateUserPreferences(user._id, payload);
            
            if (result.success) {
                showSuccessToast();
            } else {
                // We could make an error toast later, but this is fine for now
                console.log('Error saving to cloud'); 
            }
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={C.cyan || '#20964a'} />
            </View>
        );
    }

    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={C.bg} />

            {/* CUSTOM ANIMATED SUCCESS TOAST */}
            <Animated.View style={[styles.toastContainer, { transform: [{ translateY: toastAnim }] }]}>
                <LinearGradient colors={C.gradCyan || ['#20964a', '#2ab55c']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.toastGradient}>
                    <Ionicons name="checkmark-circle" size={32} color="#fff" />
                    <View style={styles.toastTextWrap}>
                        <Text style={styles.toastTitle}>Cloud Synced!</Text>
                        <Text style={styles.toastSub}>Your preferences are securely saved.</Text>
                    </View>
                </LinearGradient>
            </Animated.View>

            {/* 🌟 CUSTOM LOGOUT MODAL 🌟 */}
            <Modal transparent visible={showLogoutModal} animationType="fade">
                <View style={styles.modalOverlay}>
                    <Animated.View style={[styles.modalBox, { transform: [{ scale: modalScale }] }]}>
                        <View style={styles.modalIconBg}>
                            <Ionicons name="log-out" size={32} color={C.danger || '#EF4444'} />
                        </View>
                        <Text style={styles.modalTitle}>Sign Out</Text>
                        <Text style={styles.modalSubText}>Are you sure you want to log out? You will need your PIN to log back in.</Text>
                        
                        <View style={styles.modalBtnRow}>
                            <TouchableOpacity style={styles.modalCancelBtn} onPress={closeLogoutModal}>
                                <Text style={styles.modalCancelTxt}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalConfirmBtn} onPress={confirmLogout}>
                                <Text style={styles.modalConfirmTxt}>Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>

            {/* MAIN CONTENT SCROLL */}
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <LinearGradient colors={C.gradCyan || ['#20964a', '#2ab55c']} style={styles.avatar}>
                        <Text style={styles.avatarText}>{initials || 'U'}</Text>
                    </LinearGradient>
                    <View style={styles.headerInfo}>
                        <TextInput
                            style={styles.nameInput}
                            value={name}
                            onChangeText={setName}
                            placeholder= "Your Name"
                            placeholderTextColor={C.textMuted}
                        />
                        <Text style={styles.memberSince}>
                            Member since {new Date(profile.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                        </Text>
                    </View>
                    
                    {/* 🌟 TRIGGER CUSTOM MODAL INSTEAD OF ALERT 🌟 */}
                    <TouchableOpacity onPress={openLogoutModal} style={styles.logoutBtn}>
                        <Ionicons name="log-out-outline" size={20} color={C.danger} />
                    </TouchableOpacity>
                </View>

                {/* Health Preferences */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Health Preferences</Text>
                    <Text style={styles.cardSub}>Tap to personalize your scans</Text>

                    <View style={styles.tileGrid}>
                        {TOGGLES.map(({ key, label, emoji }) => {
                        const active = profile.preferences?.[key];

                        return (
                            <TouchableOpacity
                            key={key}
                            activeOpacity={0.85}
                            onPress={() => togglePreference(key)}
                            style={[
                                styles.prefTile,
                                active && styles.prefTileActive
                            ]}
                            >
                            <Text style={styles.prefEmoji}>{emoji}</Text>
                            <Text style={[
                                styles.prefLabel,
                                active && styles.prefLabelActive
                            ]}>
                                {label}
                            </Text>
                            </TouchableOpacity>
                        );
                        })}
                    </View>
                </View>
                
                {/* Language */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Default Language</Text>
                    <Text style={styles.cardSub}>AI responses will be in this language</Text>
                    <View style={styles.langRow}>
                        {LANGUAGES.map(l => (
                            <TouchableOpacity key={l} onPress={() => setProfile(prev => ({ ...prev, language: l }))}
                                style={[styles.langChip, profile.language === l && styles.langChipActive]}>
                                <Text style={[styles.langChipTxt, profile.language === l && { color: C.bg }]}>{l}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* App Info */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>App Info</Text>
                    <View style={styles.infoRow}><Text style={styles.infoLabel}>Version</Text><Text style={styles.infoVal}>1.0.0</Text></View>
                    <View style={styles.infoRow}><Text style={styles.infoLabel}>Vision Model</Text><Text style={styles.infoVal}>llama-4-scout-17b</Text></View>
                    <View style={styles.infoRow}><Text style={styles.infoLabel}>Chat Model</Text><Text style={styles.infoVal}>llama-3.3-70b-versatile</Text></View>
                    <View style={[styles.infoRow, { borderBottomWidth: 0 }]}><Text style={styles.infoLabel}>Powered by</Text><Text style={styles.infoVal}>Groq AI</Text></View>
                </View>

                {/* Save */}
                <TouchableOpacity onPress={handleSave} activeOpacity={0.85} style={styles.saveWrap}>
                    <LinearGradient colors={C.gradCyan || ['#20964a', '#2ab55c']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveBtn}>
                        <Text style={styles.saveTxt}>Save Changes</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    scroll: { padding: 20, paddingTop: 60, paddingBottom: 40 },
    
    // Toast Styles
    toastContainer: { position: 'absolute', top: 0, left: 20, right: 20, zIndex: 100 },
    toastGradient: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, shadowColor: C.cyan || '#20964a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 10 },
    toastTextWrap: { marginLeft: 14, flex: 1 },
    toastTitle: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
    toastSub: { color: 'rgba(255, 255, 255, 0.9)', fontSize: 13, marginTop: 2 },

    // 🌟 NEW MODAL STYLES 🌟
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalBox: { width: '100%', backgroundColor: C.surface || '#fff', borderRadius: 28, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 15, borderWidth: 1, borderColor: C.border || '#eee' },
    modalIconBg: { width: 64, height: 64, borderRadius: 32, backgroundColor: (C.danger || '#EF4444') + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 22, fontWeight: '900', color: C.text || '#000', marginBottom: 8 },
    modalSubText: { fontSize: 14, color: C.textSub || '#666', textAlign: 'center', marginBottom: 24, lineHeight: 20, paddingHorizontal: 10 },
    modalBtnRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 12 },
    modalCancelBtn: { flex: 1, height: 50, borderRadius: 14, backgroundColor: C.elevated || '#f5f5f5', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.border || '#eee' },
    modalCancelTxt: { color: C.textSub || '#666', fontSize: 15, fontWeight: '700' },
    modalConfirmBtn: { flex: 1, height: 50, borderRadius: 14, backgroundColor: C.danger || '#EF4444', justifyContent: 'center', alignItems: 'center', shadowColor: C.danger || '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
    modalConfirmTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },

    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    avatar: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#fff', fontWeight: '900', fontSize: 22 },
    headerInfo: { flex: 1, marginLeft: 14 },
    nameInput: { color: C.text, fontSize: 18, fontWeight: '700', borderBottomWidth: 1, borderBottomColor: C.border, paddingBottom: 4 },
    memberSince: { color: C.textMuted, fontSize: 12, marginTop: 4 },
    logoutBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.danger + '11', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.danger + '33' },
    card: { backgroundColor: C.surface, borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: C.border },
    cardTitle: { color: C.text, fontWeight: '800', fontSize: 15, marginBottom: 3 },
    cardSub: { color: C.textMuted, fontSize: 12, marginBottom: 16 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.border },
    rowLabel: { color: C.textSub, fontSize: 14 },
    langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    langChip: { backgroundColor: C.elevated, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: C.border },
    langChipActive: { backgroundColor: C.cyan },
    langChipTxt: { color: C.textSub, fontSize: 13, fontWeight: '600' },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
    infoLabel: { color: C.textSub, fontSize: 14 },
    infoVal: { color: C.textMuted, fontSize: 14 },
    saveWrap: { borderRadius: 50, overflow: 'hidden' },
    saveBtn: { height: 54, justifyContent: 'center', alignItems: 'center' },
    saveTxt: { color: '#fff', fontWeight: '800', fontSize: 16 },
    tileGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',},
    prefTile: {width: '47%',  backgroundColor: '#f4fff8',  borderRadius: 18,  paddingVertical: 18,  alignItems: 'center',  marginBottom: 14,  borderWidth: 1.5,  borderColor: '#b7e4c7',  shadowColor: '#1E8A44',  shadowOpacity: 0.08,  shadowRadius: 10,  elevation: 4,},
    prefTileActive: { backgroundColor: '#1E8A44', borderColor: '#1E8A44' },
    prefEmoji: { fontSize: 30, marginBottom: 6 },
    prefLabel: { fontSize: 12, fontWeight: '700', color: '#1E8A44', textAlign: 'center' },
    prefLabelActive: { color: '#ffffff' },
});