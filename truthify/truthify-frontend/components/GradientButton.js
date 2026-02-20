import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C } from '../constants/colors';

export default function GradientButton({ label, onPress, colors, loading, style, textStyle, disabled }) {
    return (
        <TouchableOpacity onPress={onPress} disabled={disabled || loading} activeOpacity={0.85} style={[styles.wrap, style]}>
            <LinearGradient colors={colors || C.gradCyan} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradient}>
                {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={[styles.label, textStyle]}>{label}</Text>
                }
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    wrap: { borderRadius: 50, overflow: 'hidden' },
    gradient: { height: 54, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
    label: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
});
