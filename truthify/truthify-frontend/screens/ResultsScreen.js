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
import { saveUserScan, getUserProfile } from '../src/api/client';

const LANGS = ['Hinglish', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Kannada', 'Malayalam'];

export default function ResultsScreen({ route, navigation }) {
    const { C } = useTheme();
    const styles = getStyles(C);

<<<<<<< HEAD
    const { analysis, imageUri, compareMode } = route.params;
    const [selectedLang, setSelectedLang] = useState('English');
    const [userPrefs, setUserPrefs] = useState({});
=======
    const { analysis, imageUri, compareMode, fromCache } = route.params;
    const [selectedLang, setSelectedLang] = useState('Hinglish');
>>>>>>> a9affef9a3b535cce675a7ae5ba412820c4c685c
    const [showAllSafe, setShowAllSafe] = useState(false);
    const [saved, setSaved] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();

        const syncWithCloud = async () => {
            try {
                const user = await getAuth();
                if (user && user._id) {
                    
                    // 1. FETCH USER PROFILE
                    const profileResult = await getUserProfile(user._id);
                    if (profileResult.success && profileResult.profile) {
                        const { language, preferences } = profileResult.profile;
                        if (language && LANGS.includes(language)) {
                            setSelectedLang(language);
                        } else if (language === 'English' && LANGS.includes('Hinglish')) {
                            setSelectedLang('Hinglish');
                        }
                        if (preferences) setUserPrefs(preferences);
                    }

                    // 2. SAVE SCAN TO MONGODB
                    if (!saved) {
                        const payload = {
                            userId: user._id,
                            ...analysis,
                            imageUri: imageUri || null
                        };
                        const result = await saveUserScan(payload);
                        if (result.success) console.log('✅ Successfully saved to MongoDB!');
                        setSaved(true);
                    }
                }
            } catch (error) {
                console.error('Error syncing with cloud:', error);
                setSaved(true);
            }
        };
        
        syncWithCloud();
    }, []);

    const safe = analysis.safeIngredients || [];
    const visibleSafe = showAllSafe ? safe : safe.slice(0, 3);
    const suitability = analysis.suitableFor || {};

    // 🌟 COUNT VERIFIED INGREDIENTS FOR THE FSSAI BANNER 🌟
    const allIngredients = [
        ...(analysis.redFlagIngredients || []),
        ...(analysis.warningIngredients || []),
        ...(analysis.safeIngredients || [])
    ];
    const verifiedCount = allIngredients.filter(ing => ing.isVerified).length;

    const suitLabels = {
        diabetic: '🩺 Diabetic', vegan: '🌱 Vegan', glutenFree: '🌾 Gluten Free',
        lactoseFree: '🥛 Lactose Free', nutFree: '🥜 Nut Free',
        noArtificialColors: '🎨 No Art. Colors', 
        noPreservatives: '🧪 No Preservatives', 
        noPalmOil: '🌴 No Palm Oil'
    };

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
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
                        <Text style={styles.productMeta}>
                            {analysis.brand ? `${analysis.brand} · ` : ''}{analysis.productCategory} · {new Date().toLocaleDateString('en-IN')}
                        </Text>
                        {fromCache && <View style={styles.cacheBadge}><Text style={styles.cacheBadgeTxt}>⚡ CACHED</Text></View>}
                    </View>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Chat', { analysis })} style={styles.chatBtn}>
                    <Ionicons name="chatbubble-ellipses-outline" size={20} color={C.cyan} />
                </TouchableOpacity>
            </View>

            {/* Score Hero */}
            <View style={styles.scoreCard}>
                <ScoreGauge score={analysis.overallScore || 0} />
                
                {/* 🌟 OVERALL FSSAI VERIFICATION BANNER 🌟 */}
                {verifiedCount > 0 ? (
                    <View style={styles.fssaiBanner}>
                        <Ionicons name="shield-checkmark" size={16} color={C.success} />
                        <Text style={styles.fssaiBannerTxt}>
                            {verifiedCount} ingredients verified by FSSAI Cloud
                        </Text>
                    </View>
                ) : (
                    <View style={[styles.fssaiBanner, { backgroundColor: C.warning + '15', borderColor: C.warning + '44' }]}>
                        <Ionicons name="warning-outline" size={16} color={C.warning} />
                        <Text style={[styles.fssaiBannerTxt, { color: C.warning }]}>
                            AI Analysis (No FSSAI matches found)
                        </Text>
                    </View>
                )}

                <Text style={styles.basedOn}>Based on {analysis.totalIngredients || 0} ingredients analyzed</Text>
                <View style={styles.miniStats}>
                    <Pill label={`${(analysis.redFlagIngredients || []).length} Red Flags`} color={C.danger} />
                    <Pill label={`${(analysis.safeIngredients || []).length} Safe`} color={C.success} />
                    <Pill label={`${(analysis.warningIngredients || []).length} Warnings`} color={C.warning} />
                </View>
            </View>

            {/* Nutrition Highlights */}
            {analysis.nutritionHighlights && (
                <View style={styles.nutritionCard}>
                    <Text style={styles.nutritionLabel}>📊 NUTRITION HIGHLIGHTS</Text>
                    <Text style={styles.nutritionText}>{analysis.nutritionHighlights}</Text>
                </View>
            )}

            {/* Ingredients Pie Chart */}
            <Section title="📊 Ingredient Breakdown">
                <IngredientsPieChart
                    safe={(analysis.safeIngredients || []).length}
                    warning={(analysis.warningIngredients || []).length}
                    danger={(analysis.redFlagIngredients || []).length}
                />
            </Section>

            {/* What Is It Good For */}
            {analysis.whatIsItGoodFor && (
                <View style={styles.goodForCard}>
                    <Text style={styles.goodForLabel}>✅ WHAT IS IT GOOD FOR</Text>
                    <Text style={styles.goodForText}>{analysis.whatIsItGoodFor}</Text>
                </View>
            )}

            {/* What To Avoid / Concerns */}
            {analysis.whatToAvoid && analysis.whatToAvoid !== 'No major concerns.' && (
                <View style={styles.avoidCard}>
                    <Text style={styles.avoidLabel}>⚠️ WHAT TO BE AWARE OF</Text>
                    <Text style={styles.avoidText}>{analysis.whatToAvoid}</Text>
                </View>
            )}

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

            {/* Personal Suitability */}
            <Section title="👤 Personal Suitability">
                <Text style={{color: C.textSub, fontSize: 12, marginBottom: 12}}>
                    Based on your saved cloud preferences
                </Text>
                <View style={styles.suitRow}>
                    {Object.entries(suitLabels).map(([key, label]) => {
                        const isSuitable = suitability[key]; 
                        const dbKey = key === 'nutFree' ? 'nutAllergy' : key; 
                        const isUserPreference = userPrefs[dbKey] === true;

                        const chipStyle = isUserPreference 
                            ? [styles.suitChip, styles.suitChipImportant, { borderColor: isSuitable ? C.success : C.danger, backgroundColor: (isSuitable ? C.success : C.danger) + '15' }]
                            : [styles.suitChip, { borderColor: isSuitable ? C.success : C.danger }];

                        return (
                            <View key={key} style={chipStyle}>
                                {isUserPreference && <Text style={{fontSize: 10, marginBottom: 2, color: isSuitable ? C.success : C.danger, fontWeight: '800'}}>YOUR PROFILE</Text>}
                                <Text style={{ color: isSuitable ? C.success : C.danger, fontSize: 12, fontWeight: '700' }}>
                                    {isSuitable ? '✓' : '✗'}  {label}
                                </Text>
                            </View>
                        );
                    })}
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
                        <Text style={styles.langText}>
                            {analysis.regionalExplanations[selectedLang] || analysis.regionalExplanations['Hinglish'] || 'Translation not available'}
                        </Text>
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

            {/* 🌟 RESTORED: Fun Fact 🌟 */}
            {analysis.funFact && (
                <View style={styles.funFactCard}>
                    <Text style={styles.funFactLabel}>💡 DID YOU KNOW?</Text>
                    <Text style={styles.funFactText}>{analysis.funFact}</Text>
                </View>
            )}

            {/* 🌟 RESTORED: Safety Tip 🌟 */}
            {analysis.safetyTip && (
                <View style={styles.safetyTipCard}>
                    <Text style={styles.safetyTipLabel}>🛡️ SAFETY TIP</Text>
                    <Text style={styles.safetyTipText}>{analysis.safetyTip}</Text>
                </View>
            )}

            {/* 🌟 RESTORED: Extracted Text 🌟 */}
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
    productMeta: { fontSize: 12, color: C.textSub },
    cacheBadge: { marginLeft: 8, backgroundColor: C.cyan + '22', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: C.cyan },
    cacheBadgeTxt: { color: C.cyan, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
    goodForCard: { backgroundColor: '#0A2B1A', borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.success + '55', borderLeftWidth: 4, borderLeftColor: C.success },
    goodForLabel: { color: C.success, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
    goodForText: { color: C.text, fontSize: 14, lineHeight: 22 },
    avoidCard: { backgroundColor: '#2B0A0A', borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.danger + '55', borderLeftWidth: 4, borderLeftColor: C.danger },
    avoidLabel: { color: C.danger, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
    avoidText: { color: C.text, fontSize: 14, lineHeight: 22 },
    nutritionCard: { backgroundColor: C.elevated, borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.border, borderLeftWidth: 4, borderLeftColor: '#A020F0' },
    nutritionLabel: { color: '#A020F0', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
    nutritionText: { color: C.text, fontSize: 14, lineHeight: 22 },
    chatBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: C.border },
    scoreCard: { backgroundColor: C.surface, borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: C.border },
    
    // FSSAI Banner
    fssaiBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.success + '15', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginTop: 16, borderWidth: 1, borderColor: C.success + '44' },
    fssaiBannerTxt: { color: C.success, fontWeight: '800', fontSize: 13, marginLeft: 8, letterSpacing: 0.3 },
    
    basedOn: { color: C.textSub, fontSize: 12, marginTop: 14, marginBottom: 14 },
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
    suitChipImportant: { borderWidth: 2 },
    summaryBox: { backgroundColor: C.elevated, borderRadius: 14, padding: 16, borderLeftWidth: 3, borderLeftColor: C.cyan },
    summaryText: { color: C.textSub, fontSize: 14, lineHeight: 22 },
    langChip: { backgroundColor: C.elevated, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, borderWidth: 1, borderColor: C.border },
    langChipActive: { backgroundColor: C.cyan },
    langChipTxt: { color: C.textSub, fontSize: 13, fontWeight: '600' },
    langBox: { backgroundColor: C.elevated, borderRadius: 14, padding: 14 },
    langText: { color: C.text, fontSize: 14, lineHeight: 22 },
    altRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
    altText: { color: C.textSub, fontSize: 14, marginLeft: 10 },
    
    // 🌟 RESTORED STYLES 🌟
    funFactCard: { backgroundColor: C.warning + '11', borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.warning + '44', borderLeftWidth: 3, borderLeftColor: C.warning },
    funFactLabel: { color: C.warning, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
    funFactText: { color: C.text, fontSize: 14, lineHeight: 22 },
    safetyTipCard: { backgroundColor: C.cyan + '11', borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: C.cyan + '44', borderLeftWidth: 3, borderLeftColor: C.cyan },
    safetyTipLabel: { color: C.cyan, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
    safetyTipText: { color: C.text, fontSize: 14, lineHeight: 22 },
    ocrBox: { backgroundColor: '#080814', borderRadius: 12, padding: 12 },
    ocrText: { color: C.cyan, fontSize: 11, fontFamily: 'monospace', lineHeight: 18 },
    scanImg: { height: 160, borderRadius: 14, resizeMode: 'cover' },
    
    chatCta: { borderRadius: 50, overflow: 'hidden', marginTop: 8 },
    chatCtaGrad: { height: 54, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    chatCtaTxt: { color: '#fff', fontWeight: '800', fontSize: 15 },
});