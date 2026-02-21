import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Alert, Image, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { C } from '../constants/colors';
import { prepareImageForOCR } from '../utils/imageProcessor';
import { getScans } from '../utils/storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
}

export default function ScanScreen({ navigation, route }) {
    const userName = route?.params?.userName || 'User';
    const [mode, setMode] = useState('single');
    const [frontUri, setFrontUri] = useState(null);
    const [frontBase64, setFrontBase64] = useState(null);
    const [recentScans, setRecentScans] = useState([]);

    useFocusEffect(useCallback(() => {
        getScans().then(s => setRecentScans(s.slice(0, 5)));
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

    const getScoreColor = (s) => s >= 70 ? C.success : s >= 40 ? C.warning : C.danger;

    return (
        <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={C.cyan} />

            {/* TOP BRAND BAR */}
            <View style={styles.appBar}>
                <Text style={styles.appTitle}>Truthify</Text>

                <TouchableOpacity
                    onPress={() => navigation.navigate('Profile')}
                    style={styles.topAvatarBtn}
                >
                    <LinearGradient colors={C.gradCyan} style={styles.topAvatar}>
                        <Text style={styles.topAvatarText}>
                            {userName[0]?.toUpperCase()}
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
                Let’s uncover what’s really inside your food.
                </Text>
            </View>

            {/* ORIGINAL CONTENT STARTS */}
            <View style={styles.header}>
                <View>
                <Text style={styles.headerSub}>Choose your scan mode</Text>
                </View>
            </View>

            {recentScans.length > 0 && (
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

            {/* KEEP ALL YOUR EXISTING MODE + SCAN UI BELOW */}
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
                    <LinearGradient colors={C.gradCyan} style={styles.primaryBtn}>
                    <Ionicons name="camera-outline" size={20} color="#fff" />
                    <Text style={styles.primaryBtnTxt}>  SCAN LABEL</Text>
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
                    <Ionicons name="image-outline" size={18} color={C.cyan} />
                    <Text style={styles.outlineBtnTxt}>
                    Upload from Gallery
                    </Text>
                </TouchableOpacity>
                </>
            ) : null}

            </ScrollView>
        </View>
        </SafeAreaView>
        );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    scroll: { padding: 20, paddingTop: 60, paddingBottom: 30 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    greeting: { fontSize: 20, fontWeight: '800', color: C.text },
    headerSub: { fontSize: 13, color: C.textSub, marginTop: 2 },
    avatarBtn: { borderRadius: 22 },
    avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#fff', fontWeight: '900', fontSize: 18 },
    statsRow: { flexDirection: 'row', marginBottom: 20 },
    statPill: { backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 10, borderWidth: 1, borderColor: C.border, alignItems: 'center' },
    statVal: { fontSize: 22, fontWeight: '900', color: C.cyan },
    statLbl: { fontSize: 11, color: C.textSub, marginTop: 2 },
    modeRow: { flexDirection: 'row', backgroundColor: C.surface, borderRadius: 16, padding: 4, marginBottom: 20, borderWidth: 1, borderColor: C.border },
    modeBtn: { flex: 1, flexDirection: 'row', paddingVertical: 10, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
    modeBtnActive: { backgroundColor: C.cyan + 'CC' },
    modeTxt: { color: C.textSub, fontWeight: '700', fontSize: 13 },
    viewfinder: {
        height: 220, borderRadius: 22, backgroundColor: C.surface, marginBottom: 20,
        justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.border,
    },
    corner: { position: 'absolute', width: 22, height: 22, borderColor: C.cyan, borderWidth: 2.5 },
    tl: { top: 16, left: 16, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 4 },
    tr: { top: 16, right: 16, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 4 },
    bl: { bottom: 16, left: 16, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 4 },
    br: { bottom: 16, right: 16, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 4 },
    vfHint: { color: C.textMuted, fontSize: 13, marginTop: 10 },
    primaryBtnWrap: { borderRadius: 50, overflow: 'hidden', marginBottom: 14 },
    primaryBtn: { height: 54, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    primaryBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 16 },
    orRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    orLine: { flex: 1, height: 1, backgroundColor: C.border },
    orTxt: { color: C.textMuted, marginHorizontal: 12, fontSize: 13 },
    outlineBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 54, borderRadius: 50, borderWidth: 1.5, borderColor: C.cyan },
    outlineBtnTxt: { color: C.cyan, fontWeight: '700', fontSize: 15 },
    compareInfo: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: C.border },
    compareInfoTxt: { color: C.textSub, fontSize: 13, lineHeight: 20, flex: 1 },
    compareCard: { backgroundColor: C.surface, borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
    compareCardTitle: { color: C.text, fontWeight: '700', fontSize: 14, marginBottom: 12 },
    compareImg: { height: 110, borderRadius: 12, resizeMode: 'cover' },
    compareBtns: { flexDirection: 'row', gap: 10 },
    compareBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: C.elevated, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: C.border },
    compareBtnTxt: { color: C.cyan, fontWeight: '600', fontSize: 13, marginLeft: 6 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { color: C.text, fontWeight: '700', fontSize: 16 },
    seeAll: { color: C.cyan, fontSize: 13 },
    recentCard: { backgroundColor: C.surface, borderRadius: 14, padding: 14, marginRight: 10, width: 130, borderWidth: 1, borderColor: C.border },
    recentName: { color: C.text, fontWeight: '600', fontSize: 13, marginBottom: 8 },
    recentScore: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
    recentScoreVal: { fontWeight: '900', fontSize: 16 },
    appBar: {
    height: 65,
    backgroundColor: C.cyan,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    elevation: 6,
    },

    topAvatarBtn: {
    borderRadius: 20,
    },

    appTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1.5,
    },

    topAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    },

    topAvatarText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
    },

    hero: {
    marginTop: 50,
    marginBottom: 90,
    },

    heroGreeting: {
    fontSize: 44,
    color: C.text,
    fontWeight: '900',
    lineHeight: 50,
    },

    heroName: {
    fontSize: 44,
    fontWeight: '900',
    color: C.text,
    lineHeight: 50,
    },

    heroSub: {
    fontSize: 16,
    color: C.textSub,
    marginTop: 12,
    maxWidth: '85%'},
    
    safe:{flex:1, backgroundColor:C.bg,},

});
