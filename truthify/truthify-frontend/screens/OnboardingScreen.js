import React, { useState, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Dimensions,
    FlatList, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { setOnboarded } from '../utils/storage';

const { width } = Dimensions.get('window');

// Static slide data — colors are resolved at render time using the theme
const SLIDES = [
    {
        id: '1', icon: 'scan-outline', title: 'Scan Any Label',
        sub: 'Point your camera at any product label. Our OCR reads every ingredient instantly.',
        colorKey: 'cyan',
    },
    {
        id: '2', icon: 'flask-outline', title: 'AI Decodes the Truth',
        sub: 'Our AI analyzes every ingredient for health risks, greenwashing, and hidden dangers.',
        colorKey: 'primary',
    },
    {
        id: '3', icon: 'shield-checkmark-outline', title: 'Protect Your Health',
        sub: 'Get personalized safety scores based on your health profile. Know before you buy.',
        colorKey: 'success',
    },
];

export default function OnboardingScreen({ onDone }) {
    const { C } = useTheme();
    const styles = getStyles(C);

    const [index, setIndex] = useState(0);
    const listRef = useRef(null);

    const next = () => {
        if (index < SLIDES.length - 1) {
            listRef.current?.scrollToIndex({ index: index + 1 });
            setIndex(index + 1);
        } else {
            handleDone();
        }
    };

    const handleDone = async () => {
        await setOnboarded();
        onDone();
    };

    const renderSlide = ({ item }) => {
        const color = C[item.colorKey] || C.cyan;
        return (
            <View style={styles.slide}>
                <View style={[styles.iconCircle, { borderColor: color + '44', backgroundColor: color + '11' }]}>
                    <Ionicons name={item.icon} size={72} color={color} />
                </View>
                <Text style={styles.slideTitle}>{item.title}</Text>
                <Text style={styles.slideSub}>{item.sub}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={C.bg} />

            {/* Skip */}
            <TouchableOpacity style={styles.skip} onPress={handleDone}>
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            {/* Logo */}
            <Text style={styles.logo}>TRUTHIFY</Text>
            <Text style={styles.logoSub}>Know What You Consume</Text>

            {/* Slides */}
            <FlatList
                ref={listRef}
                data={SLIDES}
                renderItem={renderSlide}
                keyExtractor={i => i.id}
                horizontal pagingEnabled showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={e => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
                style={{ flex: 1 }}
            />

            {/* Dots */}
            <View style={styles.dots}>
                {SLIDES.map((_, i) => (
                    <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
                ))}
            </View>

            {/* CTA */}
            <TouchableOpacity style={styles.ctaWrap} onPress={next} activeOpacity={0.85}>
                <LinearGradient colors={C.gradCyan} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cta}>
                    <Text style={styles.ctaText}>{index < SLIDES.length - 1 ? 'Next' : 'Get Started'}</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}

const getStyles = (C) => StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg, paddingTop: 60, paddingBottom: 40 },
    skip: { position: 'absolute', top: 60, right: 24, zIndex: 10 },
    skipText: { color: C.textSub, fontSize: 14 },
    logo: { textAlign: 'center', fontSize: 28, fontWeight: '900', color: C.text, letterSpacing: 4 },
    logoSub: { textAlign: 'center', color: C.textSub, fontSize: 13, marginBottom: 20 },
    slide: { width, paddingHorizontal: 40, alignItems: 'center', justifyContent: 'center' },
    iconCircle: { width: 160, height: 160, borderRadius: 80, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 36 },
    slideTitle: { fontSize: 26, fontWeight: '800', color: C.text, textAlign: 'center', marginBottom: 14 },
    slideSub: { fontSize: 15, color: C.textSub, textAlign: 'center', lineHeight: 24 },
    dots: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.textMuted, marginHorizontal: 4 },
    dotActive: { width: 20, backgroundColor: C.cyan },
    ctaWrap: { marginHorizontal: 24, borderRadius: 50, overflow: 'hidden' },
    cta: { height: 54, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
