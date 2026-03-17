import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Animated } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { analyzeImageWithGroq } from '../services/groqApi';
import { prepareImageForOCR } from '../utils/imageProcessor';
import { getProfile } from '../utils/storage';

// 🌟 1. IMPORT YOUR NEW CLOUD API CALL 🌟
import { getFssaiRules } from '../src/api/client';

const STEPS = [
    { id: 1, icon: '📸', text: 'Image captured...' },
    { id: 2, icon: '🔍', text: 'Preparing image for AI...' },
    { id: 3, icon: '☁️', text: 'Syncing FSSAI Cloud Rules...' }, // 👈 Updated text!
    { id: 4, icon: '🧠', text: 'Sending to Groq Vision AI...' },
    { id: 5, icon: '⚗️', text: 'Analyzing ingredients...' },
    { id: 6, icon: '🛡️', text: 'Verifying with FSSAI regulations...' },
    { id: 7, icon: '🌍', text: 'Generating regional explanations...' },
    { id: 8, icon: '✨', text: 'Analysis complete!' },
];

function StepLine({ step, active, done, C }) {
    const opacity = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        if (active || done) {
            Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }).start();
        }
    }, [active, done]);

    return (
        <Animated.View style={[stepStyles.stepRow, { opacity }]}>
            <Text style={stepStyles.stepIcon}>{step.icon}</Text>
            <Text style={[
                stepStyles.stepText,
                done && { color: C.textSub },
                active && { color: C.cyan }
            ]}>
                {step.text}
            </Text>
            {done && <Text style={{ color: C.success, marginLeft: 8, fontSize: 13 }}>✓</Text>}
            {active && <Text style={{ color: C.cyan, marginLeft: 8, fontSize: 13 }}>...</Text>}
        </Animated.View>
    );
}

const stepStyles = StyleSheet.create({
    stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    stepIcon: { fontSize: 16, marginRight: 10, width: 24 },
    stepText: { color: '#9ABFAD', fontSize: 13, fontFamily: 'monospace', flex: 1 },
});

// 🌟 2. UPDATED VERIFICATION FUNCTION (Now accepts the cloud database) 🌟
const verifyWithFSSAI = (ingredients, liveCloudDb) => {
    if (!ingredients || !Array.isArray(ingredients)) return [];
    
    return ingredients.map(ing => {
        const key = (ing.name || '').toLowerCase(); 
        
        // Check against the LIVE database we just downloaded!
        if (liveCloudDb[key]) {
            return {
                ...ing,
                technicalName: liveCloudDb[key].technicalName,
                severity: liveCloudDb[key].severity,
                healthEffect: liveCloudDb[key].healthEffect,
                reason: `FSSAI Limit: ${liveCloudDb[key].fssaiLimit}`,
                isVerified: true, 
                source: liveCloudDb[key].source
            };
        }
        
        return { ...ing, isVerified: false };
    });
};

export default function ProcessingScreen({ route, navigation }) {
    const { C } = useTheme();
    const styles = getStyles(C);

    const { imageUri, mode, frontBase64 } = route.params;
    const [currentStep, setCurrentStep] = useState(0);
    const [extractedPreview, setExtractedPreview] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => { runPipeline(); }, []);

    const delay = (ms) => new Promise(r => setTimeout(r, ms));

    const runPipeline = async () => {
        try {
            setCurrentStep(1);
            await delay(400);

            setCurrentStep(2);
            const base64 = await prepareImageForOCR(imageUri);

            // 🌟 3. FETCH PROFILE AND LIVE FSSAI RULES FROM MONGODB 🌟
            setCurrentStep(3);
            const profile = await getProfile();
            const fssaiResult = await getFssaiRules(); 
            const liveFssaiDb = fssaiResult.success ? fssaiResult.data : {}; // Store the cloud dictionary

            setCurrentStep(4);
            await delay(300);

            setCurrentStep(5);
            let analysis = await analyzeImageWithGroq(
                base64,
                profile,
                profile?.language || 'English',
                mode === 'compare' ? frontBase64 : null
            );

            // 🌟 4. PASS THE CLOUD DB INTO THE VERIFIER 🌟
            setCurrentStep(6);
            if (analysis) {
                if (analysis.redFlagIngredients) {
                    analysis.redFlagIngredients = verifyWithFSSAI(analysis.redFlagIngredients, liveFssaiDb);
                }
                if (analysis.warningIngredients) {
                    analysis.warningIngredients = verifyWithFSSAI(analysis.warningIngredients, liveFssaiDb);
                }
                if (analysis.extractedText) {
                    setExtractedPreview(analysis.extractedText.slice(0, 300));
                }
            }
            await delay(600); 

            setCurrentStep(7);
            await delay(400);

            setCurrentStep(8);
            await delay(500);

            navigation.replace('Results', {
                analysis,
                imageUri,
                compareMode: mode === 'compare',
            });
        } catch (e) {
            setError(e.message || 'Something went wrong. Please try again.');
        }
    };

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorTitle}>Scan Failed</Text>
                <Text style={styles.errorMsg}>{error}</Text>
                <Text style={styles.errorAction} onPress={() => navigation.goBack()}>← Try Again</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={C.bg} />

            <View style={styles.header}>
                <Text style={styles.title}>Analyzing</Text>
                <Text style={styles.sub}>Groq Vision AI is reading your label...</Text>
            </View>

            {/* Terminal card */}
            <View style={styles.terminal}>
                <View style={styles.terminalHeader}>
                    <View style={[styles.dot, { backgroundColor: '#FF5F57' }]} />
                    <View style={[styles.dot, { backgroundColor: '#FFBD2E' }]} />
                    <View style={[styles.dot, { backgroundColor: '#28C840' }]} />
                    <Text style={styles.terminalTitle}>truthify_ai — groq-vision</Text>
                </View>
                <ScrollView style={styles.terminalBody} showsVerticalScrollIndicator={false}>
                    {STEPS.map((step, i) => {
                        const stepNum = i + 1;
                        if (stepNum > currentStep) return null;
                        return (
                            <StepLine
                                key={step.id}
                                step={step}
                                active={stepNum === currentStep}
                                done={stepNum < currentStep}
                                C={C}
                            />
                        );
                    })}
                    {currentStep > 0 && currentStep <= STEPS.length && (
                        <Text style={styles.cursor}>▋</Text>
                    )}
                </ScrollView>
            </View>

            {/* OCR preview */}
            {extractedPreview.length > 0 && (
                <View style={styles.ocrBox}>
                    <Text style={styles.ocrLabel}>RAW EXTRACTED TEXT</Text>
                    <ScrollView style={{ maxHeight: 90 }} showsVerticalScrollIndicator={false}>
                        <Text style={styles.ocrText}>
                            {extractedPreview}{extractedPreview.length >= 300 ? '...' : ''}
                        </Text>
                    </ScrollView>
                </View>
            )}

            {/* Powered by badge */}
            <View style={styles.poweredRow}>
                <Text style={styles.poweredText}>⚡ Powered by Groq · llama-4-scout vision</Text>
            </View>
        </View>
    );
}

const getStyles = (C) => StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg, padding: 24, paddingTop: 70 },
    header: { marginBottom: 24 },
    title: { fontSize: 28, fontWeight: '900', color: C.text },
    sub: { fontSize: 13, color: C.textSub, marginTop: 4 },
    terminal: {
        backgroundColor: '#080814', borderRadius: 18, overflow: 'hidden',
        marginBottom: 14, borderWidth: 1, borderColor: C.border, flex: 1,
    },
    terminalHeader: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#12122A', paddingHorizontal: 14, paddingVertical: 10,
    },
    dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
    terminalTitle: { color: C.textSub, fontSize: 11, marginLeft: 8, fontFamily: 'monospace' },
    terminalBody: { padding: 16 },
    cursor: { color: C.cyan, fontSize: 18, marginTop: 4 },
    ocrBox: {
        backgroundColor: '#080814', borderRadius: 14, padding: 14,
        borderWidth: 1, borderColor: C.border, marginBottom: 12,
    },
    ocrLabel: { color: C.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
    ocrText: { color: C.cyan, fontSize: 11, fontFamily: 'monospace', lineHeight: 17 },
    poweredRow: { alignItems: 'center', paddingBottom: 10 },
    poweredText: { color: C.textMuted, fontSize: 11 },
    errorContainer: { flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center', padding: 40 },
    errorIcon: { fontSize: 52, marginBottom: 16 },
    errorTitle: { color: C.text, fontSize: 22, fontWeight: '800', marginBottom: 12 },
    errorMsg: { color: C.textSub, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
    errorAction: { color: C.cyan, fontSize: 16, fontWeight: '600' },
});