import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Alert, Image, StatusBar, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { prepareImageForOCR } from '../utils/imageProcessor';
import { useFocusEffect } from '@react-navigation/native';

// Backend API Imports
import { getAuth } from '../utils/storage';
import { getUserHistory } from '../src/api/client';

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
}

export default function ScanScreen({ navigation, route }) {
    const { C, isDark, toggleTheme } = useTheme();
    const styles = getStyles(C);

    // Safe gradient — falls back if theme value is missing
    const SAFE_GRADIENT = Array.isArray(C.gradCyan) ? C.gradCyan : ['#20964a', '#2ab55c'];

    const userName = route?.params?.userName || 'User';
    const [mode, setMode] = useState('single');
    const [frontUri, setFrontUri] = useState(null);
    const [frontBase64, setFrontBase64] = useState(null);

    // Cloud Data States
    const [recentScans, setRecentScans] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);

    // Fetch stats from MongoDB Cloud
    useFocusEffect(useCallback(() => {
        const fetchStats = async () => {
            setLoadingStats(true);
            const user = await getAuth();
            if (user && user._id) {
                const result = await getUserHistory(user._id);
                if (result.success) {
                    setRecentScans(result.history);
                }
            }
            setLoadingStats(false);
        };
        fetchStats();
    }, []));

    const pickOrCapture = async (source) => {
        let result;
        if (source === 'camera') {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') { Alert.alert('Permission needed', 'Camera access required.'); return null; }
            result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.9 });
        } else {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') { Alert.alert('Permission needed', 'Gallery access required.'); return null; }
            result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.9 });
        }
        return result.canceled ? null : result.assets[0].uri;
    };

    const startScan = async (source) => {
        const uri = await pickOrCapture(source);
        if (!uri) return;
        navigation.navigate('Processing', { imageUri: uri, mode: 'single' });
    };

    const pickFront = async (source) => {
        const uri = await pickOrCapture(source);
        if (!uri) return;
        const b64 = await prepareImageForOCR(uri);
        setFrontUri(uri);
        setFrontBase64(b64);
    };

    const pickBack = async (source) => {
        const uri = await pickOrCapture(source);
        if (!uri) return;
        navigation.navigate('Processing', { imageUri: uri, mode: 'compare', frontBase64 });
    };

    const resetCompare = () => { setFrontUri(null); setFrontBase64(null); };

    return (
        <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={C.cyan || '#20964a'} />

            {/* TOP BRAND BAR */}
            <View style={styles.appBar}>
                <Text style={styles.appTitle}>Truthify</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Profile')}
                    style={styles.topAvatarBtn}
                >
                    <LinearGradient colors={SAFE_GRADIENT} style={styles.topAvatar}>
                        <Text style={styles.topAvatarText}>
                            {userName[0]?.toUpperCase() || 'U'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

            {/* HERO GREETING */}
            <View style={styles.hero}>
                <Text style={styles.heroGreeting}>
                    {getGreeting()},
                </Text>
                <Text style={styles.heroName}>
                    {userName.charAt(0).toUpperCase() + userName.slice(1)}
                </Text>
                <Text style={styles.heroSub}>
                    Let's uncover what's really inside your food.
                </Text>
            </View>

            {/* MODE TOGGLE */}
            <View style={styles.modeRow}>
                <TouchableOpacity
                    style={[styles.modeBtn, mode === 'single' && styles.modeBtnActive]}
                    onPress={() => { setMode('single'); resetCompare(); }}
                >
                    <Ionicons name="scan-outline" size={16} color={mode === 'single' ? '#fff' : C.textSub} />
                    <Text style={[styles.modeTxt, mode === 'single' && { color: '#fff' }]}>  Single Scan</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.modeBtn, mode === 'compare' && styles.modeBtnActive]}
                    onPress={() => { setMode('compare'); resetCompare(); }}
                >
                    <Ionicons name="git-compare-outline" size={16} color={mode === 'compare' ? '#fff' : C.textSub} />
                    <Text style={[styles.modeTxt, mode === 'compare' && { color: '#fff' }]}>  Compare Labels</Text>
                </TouchableOpacity>
            </View>

            {/* STATS & CLOUD EMPTY STATE */}
            {loadingStats ? (
                <View style={styles.emptyCard}>
                    <ActivityIndicator size="small" color={C.cyan || '#20964a'} />
                    <Text style={[styles.emptySub, { marginLeft: 12, marginTop: 0 }]}>Syncing with cloud...</Text>
                </View>
            ) : recentScans.length === 0 ? (
                <View style={styles.emptyCard}>
                    <View style={styles.emptyIconBg}>
                        <Ionicons name="shield-checkmark" size={24} color={C.cyan || '#20964a'} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 16 }}>
                        <Text style={styles.emptyTitle}>Zero Scans Yet</Text>
                        <Text style={styles.emptySub}>Scan your first product to start building your health profile.</Text>
                    </View>
                </View>
            ) : (
                <View style={styles.statsRow}>
                    <View style={styles.statPill}>
                        <Text style={styles.statVal}>{recentScans.length}</Text>
                        <Text style={styles.statLbl}>Scanned</Text>
                    </View>
                    <View style={[styles.statPill, { marginLeft: 10 }]}>
                        <Text style={styles.statVal}>
                            {Math.round(
                                recentScans.reduce((a, s) => a + (s.overallScore || 0), 0) /
                                recentScans.length
                            )}
                        </Text>
                        <Text style={styles.statLbl}>Avg Score</Text>
                    </View>
                </View>
            )}

            {/* SINGLE SCAN MODE */}
            {mode === 'single' ? (
            <>
            <View style={styles.viewfinder}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
            <Ionicons name="scan-outline" size={56} color={C.textMuted} />
            <Text style={styles.vfHint}>Point at ingredient label</Text>
            </View>

            <TouchableOpacity
            onPress={() => startScan('camera')}
            activeOpacity={0.85}
            style={styles.primaryBtnWrap}
            >
            <LinearGradient colors={SAFE_GRADIENT} style={styles.primaryBtn}>
            <Ionicons name="camera-outline" size={20} color="#fff" />
            <Text style={styles.primaryBtnTxt}> SCAN LABEL</Text>
            </LinearGradient>
            </TouchableOpacity>

            <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orTxt}>or</Text>
            <View style={styles.orLine} />
            </View>

            <TouchableOpacity
            onPress={() => startScan('gallery')}
            style={styles.outlineBtn}
            activeOpacity={0.85}
            >
            <Ionicons name="image-outline" size={18} color={C.cyan || '#20964a'} />
            <Text style={styles.outlineBtnTxt}> Upload from Gallery</Text>
            </TouchableOpacity>
            </>
            ) : (
            <>
            {/* COMPARE LABELS MODE */}
            <View style={styles.compareInfo}>
            <Ionicons name="information-circle-outline" size={16} color={C.cyan} />
            <Text style={styles.compareInfoTxt}>
            Upload <Text style={{ color: C.cyan }}>front label</Text> first, then{' '}
            <Text style={{ color: C.success }}>back ingredients</Text>. AI detects greenwashing.
            </Text>
            </View>

            <View style={styles.compareCard}>
            <Text style={styles.compareCardTitle}>① Front Label (Claims)</Text>

            {frontUri ? (
            <>
            <Image source={{ uri: frontUri }} style={styles.compareImg} />
            <Text style={[styles.compareCardTitle, { color: C.success, marginTop: 8 }]}>
            ✓ Captured — now upload back label
            </Text>
            </>
            ) : (
            <View style={styles.compareBtns}>
            <TouchableOpacity style={styles.compareBtn} onPress={() => pickFront('camera')}>
            <Ionicons name="camera-outline" size={18} color={C.cyan || '#20964a'} />
            <Text style={styles.compareBtnTxt}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.compareBtn} onPress={() => pickFront('gallery')}>
            <Ionicons name="image-outline" size={18} color={C.cyan || '#20964a'} />
            <Text style={styles.compareBtnTxt}>Gallery</Text>
            </TouchableOpacity>
            </View>
            )}
            </View>

            <View style={[styles.compareCard, !frontUri && { opacity: 0.35 }]}>
            <Text style={styles.compareCardTitle}>② Back Label (Ingredients)</Text>
            <View style={styles.compareBtns}>
            <TouchableOpacity
            style={styles.compareBtn}
            onPress={() => frontUri && pickBack('camera')}
            disabled={!frontUri}
            >
            <Ionicons name="camera-outline" size={18} color={C.cyan || '#20964a'} />
            <Text style={styles.compareBtnTxt}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
            style={styles.compareBtn}
            onPress={() => frontUri && pickBack('gallery')}
            disabled={!frontUri}
            >
            <Ionicons name="image-outline" size={18} color={C.cyan || '#20964a'} />
            <Text style={styles.compareBtnTxt}>Gallery</Text>
            </TouchableOpacity>
            </View>
            </View>
            </>
            )}

            </ScrollView>
        </View>
        </SafeAreaView>
    );
}

const getStyles = (C) => StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg || '#ffffff' },
    scroll: { padding: 20, paddingBottom: 30 },
    emptyCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface || '#fff', borderRadius: 20, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: C.border || '#eee' },
    emptyIconBg: { width: 48, height: 48, borderRadius: 24, backgroundColor: (C.cyan || '#20964a') + '22', justifyContent: 'center', alignItems: 'center' },
    emptyTitle: { color: C.text || '#000', fontSize: 16, fontWeight: '800' },
    emptySub: { color: C.textSub || '#666', fontSize: 13, marginTop: 4, lineHeight: 18 },
    statsRow: { flexDirection: 'row', marginBottom: 20 },
    statPill: { flex: 1, backgroundColor: C.surface || '#fff', borderRadius: 14, paddingHorizontal: 18, paddingVertical: 10, borderWidth: 1, borderColor: C.border || '#eee', alignItems: 'center' },
    statVal: { fontSize: 22, fontWeight: '900', color: C.cyan || '#20964a' },
    statLbl: { fontSize: 11, color: C.textSub || '#666', marginTop: 2 },
    modeRow: { flexDirection: 'row', backgroundColor: C.surface || '#fff', borderRadius: 16, padding: 4, marginBottom: 20, borderWidth: 1, borderColor: C.border || '#eee' },
    modeBtn: { flex: 1, flexDirection: 'row', paddingVertical: 10, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
    modeBtnActive: { backgroundColor: (C.cyan || '#20964a') + 'CC' },
    modeTxt: { color: C.textSub || '#666', fontWeight: '700', fontSize: 13 },
    viewfinder: {
        height: 220, borderRadius: 22, backgroundColor: C.surface || '#fff', marginBottom: 20,
        justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.border || '#eee',
    },
    corner: { position: 'absolute', width: 22, height: 22, borderColor: C.cyan || '#20964a', borderWidth: 2.5 },
    tl: { top: 16, left: 16, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 4 },
    tr: { top: 16, right: 16, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 4 },
    bl: { bottom: 16, left: 16, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 4 },
    br: { bottom: 16, right: 16, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 4 },
    vfHint: { color: C.textMuted || '#999', fontSize: 13, marginTop: 10 },
    primaryBtnWrap: { borderRadius: 50, overflow: 'hidden', marginBottom: 14 },
    primaryBtn: { height: 54, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    primaryBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 16 },
    orRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    orLine: { flex: 1, height: 1, backgroundColor: C.border || '#eee' },
    orTxt: { color: C.textMuted || '#999', marginHorizontal: 12, fontSize: 13 },
    outlineBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 54, borderRadius: 50, borderWidth: 1.5, borderColor: C.cyan || '#20964a' },
    outlineBtnTxt: { color: C.cyan || '#20964a', fontWeight: '700', fontSize: 15 },
    compareInfo: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: C.surface || '#fff', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: C.border || '#eee' },
    compareInfoTxt: { color: C.textSub || '#666', fontSize: 13, lineHeight: 20, flex: 1, marginLeft: 8 },
    compareCard: { backgroundColor: C.surface || '#fff', borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border || '#eee' },
    compareCardTitle: { color: C.text || '#000', fontWeight: '700', fontSize: 14, marginBottom: 12 },
    compareImg: { height: 110, borderRadius: 12, resizeMode: 'cover' },
    compareBtns: { flexDirection: 'row', gap: 10 },
    compareBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: C.elevated || '#f5f5f5', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: C.border || '#eee' },
    compareBtnTxt: { color: C.cyan || '#20964a', fontWeight: '600', fontSize: 13, marginLeft: 6 },
    appBar: {
        height: 65,
        backgroundColor: C.cyan || '#20964a',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    topAvatarBtn: { borderRadius: 20 },
    appTitle: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: 1.5 },
    topAvatar: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
    topAvatarText: { color: '#fff', fontWeight: '900', fontSize: 16 },
    hero: { marginTop: 24, marginBottom: 28 },
    heroGreeting: { fontSize: 36, color: C.text || '#000', fontWeight: '900', lineHeight: 42 },
    heroName: { fontSize: 36, fontWeight: '900', color: C.cyan || '#20964a', lineHeight: 42 },
    heroSub: { fontSize: 15, color: C.textSub || '#666', marginTop: 10, maxWidth: '85%', lineHeight: 22 },
    safe: { flex: 1, backgroundColor: C.bg || '#ffffff' },
});