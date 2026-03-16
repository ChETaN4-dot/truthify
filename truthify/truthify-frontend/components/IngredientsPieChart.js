import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Path, G, Circle } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';

export default function IngredientsPieChart({ safe = 0, warning = 0, danger = 0 }) {
    const { C, isDark, toggleTheme } = useTheme();
    const styles = getStyles(C);
    const total = safe + warning + danger;
    
    // For simple donut, calculate strokes using dasharray/dashoffset
    // But CSS/SVG strokes are best drawn as concentric rings if simple, 
    // or as actual path arcs. Since it's a simple React Native SVG, let's use Dasharray on circles.
    
    // Total circumference
    const r = 50;
    const c = 2 * Math.PI * r;
    
    // We calculate percentages
    const pD = danger / (total || 1);
    const pW = warning / (total || 1);
    const pS = safe / (total || 1);
    
    // Danger ring starts at 0
    const dashD = c * pD;
    
    // Warning ring starts after danger
    const dashW = c * pW;
    const offsetW = -dashD;
    
    // Safe ring starts after warning
    const dashS = c * pS;
    const offsetS = -(dashD + dashW);

    return (
        <View style={styles.container}>
            <View style={styles.chartWrapper}>
                <Svg width={140} height={140} viewBox="0 0 140 140">
                    {/* Background track */}
                    <Circle cx="70" cy="70" r={r} stroke={C.border} strokeWidth="16" fill="transparent" />
                    
                    {/* Safe */}
                    {pS > 0 && (
                        <Circle cx="70" cy="70" r={r} stroke={C.success} 
                                strokeWidth="16" fill="transparent" 
                                strokeDasharray={`${dashS} ${c}`} 
                                strokeDashoffset={offsetS} 
                                origin="70, 70" rotation="-90" strokeLinecap="round" />
                    )}
                    
                    {/* Warning */}
                    {pW > 0 && (
                        <Circle cx="70" cy="70" r={r} stroke={C.warning} 
                                strokeWidth="16" fill="transparent" 
                                strokeDasharray={`${dashW} ${c}`} 
                                strokeDashoffset={offsetW} 
                                origin="70, 70" rotation="-90" strokeLinecap="round" />
                    )}
                    
                    {/* Danger */}
                    {pD > 0 && (
                        <Circle cx="70" cy="70" r={r} stroke={C.danger} 
                                strokeWidth="16" fill="transparent" 
                                strokeDasharray={`${dashD} ${c}`} 
                                strokeDashoffset="0" 
                                origin="70, 70" rotation="-90" strokeLinecap="round" />
                    )}
                </Svg>
                <View style={styles.centerText}>
                    <Text style={[styles.total, { color: C.text }]}>{total}</Text>
                    <Text style={[styles.totalLabel, { color: C.textSub }]}>Total</Text>
                </View>
            </View>

            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: C.success }]} />
                    <Text style={[styles.lText, { color: C.textSub }]}>Safe ({safe})</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: C.warning }]} />
                    <Text style={[styles.lText, { color: C.textSub }]}>Warn ({warning})</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.dot, { backgroundColor: C.danger }]} />
                    <Text style={[styles.lText, { color: C.textSub }]}>Danger ({danger})</Text>
                </View>
            </View>
        </View>
    );
}

const getStyles = (C) => StyleSheet.create({
    container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, width: '100%' },
    chartWrapper: { width: 140, height: 140, position: 'relative', justifyContent: 'center', alignItems: 'center' },
    centerText: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
    total: { fontSize: 28, fontWeight: 'bold' },
    totalLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
    legend: { marginLeft: 20, justifyContent: 'center' },
    legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    dot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
    lText: { fontSize: 13, fontWeight: '600' }
});
