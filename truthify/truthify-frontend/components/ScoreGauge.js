import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { C } from '../constants/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const SIZE = 180;
const STROKE = 12;
const R = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

function getColor(score) {
    if (score >= 90) return C.gold;
    if (score >= 70) return C.success;
    if (score >= 40) return C.warning;
    return C.danger;
}

function getLabel(score) {
    if (score >= 90) return 'EXCELLENT';
    if (score >= 70) return 'GOOD';
    if (score >= 40) return 'MODERATE';
    return 'POOR';
}

export default function ScoreGauge({ score = 0 }) {
    const anim = useRef(new Animated.Value(0)).current;
    const displayScore = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(anim, { toValue: score, duration: 1500, useNativeDriver: false }).start();
        Animated.timing(displayScore, { toValue: score, duration: 1500, useNativeDriver: false }).start();
    }, [score]);

    const strokeDashoffset = anim.interpolate({
        inputRange: [0, 100],
        outputRange: [CIRCUMFERENCE, 0],
    });

    const color = getColor(score);
    const label = getLabel(score);

    return (
        <View style={styles.container}>
            <Svg width={SIZE} height={SIZE}>
                {/* Track */}
                <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={C.elevated} strokeWidth={STROKE} fill="none" />
                {/* Progress */}
                <AnimatedCircle
                    cx={SIZE / 2} cy={SIZE / 2} r={R}
                    stroke={color} strokeWidth={STROKE} fill="none"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    rotation="-90"
                    origin={`${SIZE / 2}, ${SIZE / 2}`}
                />
            </Svg>
            <View style={styles.center}>
                <Animated.Text style={[styles.score, { color }]}>
                    {displayScore.interpolate({ inputRange: [0, 100], outputRange: ['0', '100'] })}
                </Animated.Text>
                <Text style={[styles.label, { color }]}>{label}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { alignItems: 'center', justifyContent: 'center' },
    center: { position: 'absolute', alignItems: 'center' },
    score: { fontSize: 52, fontWeight: '900' },
    label: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
});
