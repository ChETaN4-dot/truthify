import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity,
    TextInput, Alert, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { C } from '../constants/colors';
import { getProfile, saveProfile } from '../utils/storage';

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
    const [profile, setProfile] = useState(null);
    const [name, setName] = useState(userName || '');

    useEffect(() => {
        getProfile().then(p => { setProfile(p); setName(p.name || userName || ''); });
    }, []);

    if (!profile) return null;

    const toggleFilter = (key) => setProfile(prev => ({
        ...prev, filters: { ...prev.filters, [key]: !prev.filters?.[key] }
    }));

    const handleSave = async () => {
        await saveProfile({ ...profile, name });
        Alert.alert('Saved!', 'Your health profile has been updated.');
    };

    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
            <StatusBar barStyle="light-content" backgroundColor={C.bg} />

            {/* Header */}
            <View style={styles.header}>
                <LinearGradient colors={C.gradCyan} style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials || 'U'}</Text>
                </LinearGradient>
                <View style={styles.headerInfo}>
                    <TextInput
                        style={styles.nameInput}
                        value={name}
                        onChangeText={setName}
                        placeholder="Your name"
                        placeholderTextColor={C.textMuted}
                    />
                    <Text style={styles.memberSince}>Member since {new Date(profile.memberSince || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</Text>
                </View>
                <TouchableOpacity onPress={() => Alert.alert('Logout', 'Are you sure?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Logout', style: 'destructive', onPress: onLogout }
                ])} style={styles.logoutBtn}>
                    <Ionicons name="log-out-outline" size={20} color={C.danger} />
                </TouchableOpacity>
            </View>

            {/* Health Filters */}
            {/* Health Preferences */}
            <View style={styles.card}>
            <Text style={styles.cardTitle}>Health Preferences</Text>
            <Text style={styles.cardSub}>Tap to personalize your scans</Text>

            <View style={styles.tileGrid}>
                {TOGGLES.map(({ key, label, emoji }) => {
                const active = profile.filters?.[key];

                return (
                    <TouchableOpacity
                    key={key}
                    activeOpacity={0.85}
                    onPress={() => toggleFilter(key)}
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
                <LinearGradient colors={C.gradCyan} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveBtn}>
                    <Text style={styles.saveTxt}>Save Changes</Text>
                </LinearGradient>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    scroll: { padding: 20, paddingTop: 60, paddingBottom: 40 },
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
    prefTileActive: {
  backgroundColor: '#1E8A44',
  borderColor: '#1E8A44',
},

prefEmoji: {
  fontSize: 30,
  marginBottom: 6,
},

prefLabel: {
  fontSize: 12,
  fontWeight: '700',
  color: '#1E8A44',
  textAlign: 'center',
},

prefLabelActive: {
  color: '#ffffff',
},


});
