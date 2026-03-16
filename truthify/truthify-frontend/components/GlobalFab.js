import React, { useRef } from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export default function GlobalFab() {
    const { C, isDark, toggleTheme } = useTheme();
    const styles = getStyles(C);

    return (
        <TouchableOpacity 
            style={[styles.fab, { backgroundColor: C.elevated, borderColor: C.border }]} 
            onPress={toggleTheme}
            activeOpacity={0.8}
        >
            <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={28} color={isDark ? C.gold : C.cyan} />
        </TouchableOpacity>
    );
}

const getStyles = (C) => StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 90, // Above the bottom tab bar
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        zIndex: 9999,
    }
});
