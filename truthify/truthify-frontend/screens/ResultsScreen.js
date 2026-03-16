import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Image, StatusBar, Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import ScoreGauge from '../components/ScoreGauge';
import IngredientCard from '../components/IngredientCard';
import IngredientsPieChart from '../components/IngredientsPieChart';

// Backend API Imports
import { getAuth } from '../utils/storage';
import { saveUserScan } from '../src/api/client';

const LANGS = ['Hinglish', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Kannada', 'Malayalam'];

export default function ResultsScreen({ route, navigation }) {
    const { C } = useTheme();
    const styles = getStyles(C);

    const { analysis, imageUri, compareMode } = route.params;
    const [selectedLang, setSelectedLang] = useState('Hinglish');
    const [showAllSafe, setShowAllSafe] = useState(false);
    const [saved, setSaved] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();

        const saveToCloud = async () => {
            if (!saved) {
                try {
                    const user = await getAuth();
                    if (user && user._id) {
                        const payload = {
                            userId: user._id,
                            ...analysis,
                            imageUri: imageUri || null
                        };
                        const result = await saveUserScan(payload);
                        if (result.success) {
                            console.log('✅ Successfully saved to MongoDB!');
                        } else {
                            console.log('❌ Failed to save to MongoDB:', result.message);
                        }
                    }
                    setSaved(true);
                } catch (error) {
                    console.error('Error saving to cloud:', error);
                    setSaved(true);
                }
            }
        };
        saveToCloud();
    }, []);

    const safe = analysis.safeIngredients || [];
    const visibleSafe = showAllSafe ? safe : safe.slice(0, 3);
    const suitability = analysis.suitableFor || {};

    const suitLabels = {
        diabetic: '🩺 Diabetic', vegan: '🌱 Vegan', glutenFree: '🌾 Gluten Free',
        lactoseFree: '🥛 Lactose Free', nutFree: '🥜 Nut Free',
    };

    // Section and Pill defined inside so they can close over styles
    function Section({ title, children, style: s }) {
        return (
            <View style={[styles.section, s]}>
                <Text style={styles.sectionTitle}>{title}</Text>
                {children}
            </View>
        );
    }

    function Pill({ label, color }) {
        return (
            <View style={[styles.pill, { backgroundColor: color + '22', borderColor: color }]}>
                <Text style={[styles.pillText, { color }]}>{label}</Text>
            </View>
        );
    }

    return (
        <Animated.ScrollView style={[styles.container, { opacity: fadeAnim }]} contentContainerStyle={styles.scroll}>
            <StatusBar barStyle="light-content" backgroundColor={C.bg} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={C.text} />
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.productName} numberOfLines={2}>{analysis.productName || 'Unknown Product'}</Text>
                    <Text style={styles.productMeta}>{analysis.productCategory} · {new Date().toLocaleDateString('en-IN')}</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Chat', { analysis })} style={styles.chatBtn}>
                    <Ionicons name="chatbubble-ellipses-outline" size={20} color={C.cyan} />
                </TouchableOpacity>
            </View>

            {/* Score Hero */}
            <View style={styles.scoreCard}>
                <ScoreGauge score={analysis.overallScore || 0} />
                <Text style={styles.basedOn}>Based on {analysis.totalIngredients || 0} ingredients analyzed</Text>
                <View style={styles.miniStats}>
                    <Pill label={`${(analysis.redFlagIngredients || []).length} Red Flags`} color={C.danger} />
                    <Pill label={`${(analysis.safeIngredients || []).length} Safe`} color={C.success} />
                    <Pill label={`${(analysis.warningIngredients || []).length} Warnings`} color={C.warning} />
                </View>
            </View>

            {/* Ingredients Pie Chart */}
            <Section title="📊 Ingredient Breakdown">
                <IngredientsPieChart
                    safe={(analysis.safeIngredients || []).length}
                    warning={(analysis.warningIngredients || []).length}
                    danger={(analysis.redFlagIngredients || []).length}
                />
            </Section>

            {/* Greenwashing */}
            {(analysis.greenwashingAlerts || []).length > 0 && (
                <Section title="🚨 Greenwashing Detector">
                    {analysis.greenwashingAlerts.map((alert, i) => (
                        <View key={i} style={styles.gwCard}>
                            <View style={styles.gwRow}>
                                <View style={styles.gwBadge}><Text style={styles.gwBadgeTxt}>CLAIM</Text></View>
                                <Text style={styles.gwClaim}>{alert.claim}</Text>
                            </View>
                            <View style={styles.gwArrow}><Text style={{ color: C.textMuted }}>↓</Text></View>
                            <View style={styles.gwRow}>
                                <View style={[styles.gwBadge, { backgroundColor: C.danger + '22', borderColor: C.danger }]}>
                                    <Text style={[styles.gwBadgeTxt, { color: C.danger }]}>REALITY</Text>
                                </View>
                                <Text style={styles.gwReality}>{alert.reality}</Text>
                            </View>
                            <View style={[styles.gwStamp, { backgroundColor: alert.isDeceptive ? C.danger + '22' : C.success + '22' }]}>
                                <Text style={{ color: alert.isDeceptive ? C.danger : C.success, fontWeight: '800', fontSize: 12 }}>
                                    {alert.isDeceptive ? '⚠️ DECEPTION DETECTED' : '✓ CLAIM VERIFIED'}
                                </Text>
                            </View>
                        </View>
                    ))}
                </Section>
            )}

            {/* Comparison Summary */}
            {analysis.comparisonSummary && (
                <Section title="⚖️ Label vs Ingredients">
                    <View style={styles.comparisonBox}>
                        <Text style={styles.comparisonText}>{analysis.comparisonSummary}</Text>
                    </View>
                </Section>
            )}

            {/* Red Flags */}
            {(analysis.redFlagIngredients || []).length > 0 && (
                <Section title={`⚠️ Red Flag Ingredients  ·  ${(analysis.redFlagIngredients || []).length} Found`}>
                    {analysis.redFlagIngredients.map((item, i) => (
                        <IngredientCard key={i} item={item} type="red" />
                    ))}
                </Section>
            )}

            {/* Safe */}
            {safe.length > 0 && (
                <Section title="✅ Safe Ingredients">
                    {visibleSafe.map((item, i) => <IngredientCard key={i} item={item} type="safe" />)}
                    {safe.length > 3 && (
                        <TouchableOpacity onPress={() => setShowAllSafe(!showAllSafe)} style={styles.showMore}>
                            <Text style={styles.showMoreTxt}>{showAllSafe ? '▲ Show less' : `▼ Show ${safe.length - 3} more`}</Text>
                        </TouchableOpacity>
                    )}
                </Section>
            )}

            {/* Suitability */}
            <Section title="👤 Personal Suitability">
                <View style={styles.suitRow}>
                    {Object.entries(suitLabels).map(([key, label]) => (
                        <View key={key} style={[styles.suitChip, { borderColor: suitability[key] ? C.success : C.danger }]}>
                            <Text style={{ color: suitability[key] ? C.success : C.danger, fontSize: 12, fontWeight: '700' }}>
                                {suitability[key] ? '✓' : '✗'}  {label}
                            </Text>
                        </View>
                    ))}
                </View>
            </Section>

            {/* AI Summary */}
            <Section title="🤖 Truthify Says">
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryText}>{analysis.summary}</Text>
                </View>
            </Section>

            {/* Regional Languages */}
            {analysis.regionalExplanations && (
                <Section title="🗣️ Explanation in Indian Languages">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                        {LANGS.map(lang => (
                            <TouchableOpacity key={lang} onPress={() => setSelectedLang(lang)}
                                style={[styles.langChip, selectedLang === lang && styles.langChipActive]}>
                                <Text style={[styles.langChipTxt, selectedLang === lang && { color: C.bg }]}>{lang}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <View style={styles.langBox}>
                        <Text style={styles.langText}>{analysis.regionalExplanations[selectedLang] || 'Not available'}</Text>
                    </View>
                </Section>
            )}

            {/* Alternatives */}
            {(analysis.alternatives || []).length > 0 && (
                <Section title="💡 Healthier Alternatives">
                    {analysis.alternatives.map((alt, i) => (
                        <View key={i} style={styles.altRow}>
                            <Ionicons name="leaf-outline" size={16} color={C.success} />
                            <Text style={styles.altText}>{alt}</Text>
                        </View>
                    ))}
                </Section>
            )}

            {/* Fun Fact */}
            {analysis.funFact && (
                <View style={styles.funFactCard}>
                    <Text style={styles.funFactLabel}>💡 DID YOU KNOW?</Text>
                    <Text style={styles.funFactText}>{analysis.funFact}</Text>
                </View>
            )}

            {/* Safety Tip */}
            {analysis.safetyTip && (
                <View style={styles.safetyTipCard}>
                    <Text style={styles.safetyTipLabel}>🛡️ SAFETY TIP</Text>
                    <Text style={styles.safetyTipText}>{analysis.safetyTip}</Text>
                </View>
            )}

            {/* Extracted Text */}
            {analysis.extractedText && (
                <Section title="📄 Extracted Label Text">
                    <View style={styles.ocrBox}>
                        <Text style={styles.ocrText}>{analysis.extractedText}</Text>
                    </View>
                </Section>
            )}

            {/* Compare images */}
            {compareMode && imageUri && (
                <Section title="📷 Scanned Labels">
                    <Image source={{ uri: imageUri }} style={styles.scanImg} />
                </Section>
            )}

            {/* Chat CTA */}
            <TouchableOpacity onPress={() => navigation.navigate('Chat', { analysis })} activeOpacity={0.85} style={styles.chatCta}>
                <LinearGradient colors={C.gradCyan} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.chatCtaGrad}>
                    <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
                    <Text style={styles.chatCtaTxt}>  💬 Ask Truthify About This Product</Text>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.ScrollView>
    );
}

const getStyles = (C) => StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    scroll: { padding: 20, paddingTop: 60, paddingBottom: 40 },
    header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.border },
    productName: { fontSize: 20, fontWeight: '800', color: C.text },
    productMeta: { fontSize: 12, color: C.textSub, marginTop: 3 },
    chatBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.border },
    scoreCard: { backgroundColor: C.surface, borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: C.border },
    basedOn: { color: C.textSub, fontSize: 12, marginTop: 10, marginBottom: 14 },
    miniStats: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
    pill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
    pillText: { fontSize: 12, fontWeight: '700' },
    section: { backgroundColor: C.surface, borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: C.border },
    sectionTitle: { color: C.text, fontWeight: '800', fontSize: 14, marginBottom: 14, letterSpacing: 0.3 },
    gwCard: { backgroundColor: C.elevated, borderRadius: 14, padding: 14, marginBottom: 10 },
    gwRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    gwBadge: { backgroundColor: C.warning + '22', borderColor: C.warning, borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    gwBadgeTxt: { color: C.warning, fontSize: 10, fontWeight: '800' },
    gwClaim: { color: C.text, fontSize: 13, flex: 1 },
    gwArrow: { paddingLeft: 14, paddingVertical: 4 },
    gwReality: { color: C.textSub, fontSize: 13, flex: 1 },
    gwStamp: { marginTop: 10, borderRadius: 8, padding: 8, alignItems: 'center' },
    comparisonBox: { backgroundColor: C.elevated, borderRadius: 14, padding: 14, borderLeftWidth: 3, borderLeftColor: C.warning },
    comparisonText: { color: C.textSub, fontSize: 14, lineHeight: 22 },
    showMore: { alignItems: 'center', paddingTop: 8 },
    showMoreTxt: { color: C.cyan, fontSize: 13, fontWeight: '600' },
    suitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    suitChip: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
    summaryBox: { backgroundColor: C.elevated, borderRadius: 14, padding: 16, borderLeftWidth: 3, borderLeftColor: C.cyan },
    summaryText: { color: C.textSub, fontSize: 14, lineHeight: 22 },
    langChip: { backgroundColor: C.elevated, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, borderWidth: 1, borderColor: C.border },
    langChipActive: { backgroundColor: C.cyan },
    langChipTxt: { color: C.textSub, fontSize: 13, fontWeight: '600' },
    langBox: { backgroundColor: C.elevated, borderRadius: 14, padding: 14 },
    langText: { color: C.text, fontSize: 14, lineHeight: 22 },
    altRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
    altText: { color: C.textSub, fontSize: 14, marginLeft: 10 },
    scanImg: { height: 160, borderRadius: 14, resizeMode: 'cover' },
    chatCta: { borderRadius: 50, overflow: 'hidden', marginTop: 8 },
    chatCtaGrad: { height: 54, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    chatCtaTxt: { color: '#fff', fontWeight: '800', fontSize: 15 },
    funFactCard: { backgroundColor: C.warning + '11', borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.warning + '44', borderLeftWidth: 3, borderLeftColor: C.warning },
    funFactLabel: { color: C.warning, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
    funFactText: { color: C.text, fontSize: 14, lineHeight: 22 },
    safetyTipCard: { backgroundColor: C.cyan + '11', borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.cyan + '44', borderLeftWidth: 3, borderLeftColor: C.cyan },
    safetyTipLabel: { color: C.cyan, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
    safetyTipText: { color: C.text, fontSize: 14, lineHeight: 22 },
    ocrBox: { backgroundColor: '#080814', borderRadius: 12, padding: 12 },
    ocrText: { color: C.cyan, fontSize: 11, fontFamily: 'monospace', lineHeight: 18 },
});