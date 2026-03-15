import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Rect, G } from 'react-native-svg';
import { C } from '../constants/colors';

// 👉 Backend API Imports
import { getAuth } from '../utils/storage';
import { getUserHistory } from '../src/api/client'; 

function getColor(s) { return s >= 70 ? C.success : s >= 40 ? C.warning : C.danger; }

const ACHIEVEMENTS = [
    { id: 'first', icon: '🔍', label: 'First Scan', req: 1 },
    { id: 'ten', icon: '🏆', label: '10 Scans', req: 10 },
    { id: 'twenty', icon: '⭐', label: '20 Scans', req: 20 },
    { id: 'safe', icon: '🛡️', label: 'Safety Seeker', req: 5 },
];

export default function DashboardScreen() {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🌟 MONGODB CLOUD FETCH 🌟
    useFocusEffect(useCallback(() => { 
        const fetchCloudData = async () => {
            setLoading(true);
            const user = await getAuth();
            if (user && user._id) {
                const result = await getUserHistory(user._id);
                if (result.success) {
                    setScans(result.history);
                }
            }
            setLoading(false);
        };
        fetchCloudData();
    }, []));

    const total = scans.length;
    const avgScore = total > 0 ? Math.round(scans.reduce((s, h) => s + (h.overallScore || 0), 0) / total) : 0;
    
    // Updated to use MongoDB's 'createdAt'
    const thisWeek = scans.filter(s => Date.now() - new Date(s.createdAt || s.timestamp).getTime() < 7 * 86400000).length;

    const allFlags = scans.flatMap(h => h.redFlagIngredients || []);
    const flagCounts = allFlags.reduce((acc, f) => { acc[f.name] = (acc[f.name] || 0) + 1; return acc; }, {});
    const topFlags = Object.entries(flagCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);

    const last10 = scans.slice(0, 10).reverse(); // Reverse so chart goes left-to-right (oldest to newest)
    const BAR_W = 26;
    const BAR_MAX_H = 80;

    const safeCount = scans.filter(s => (s.overallScore || 0) >= 70).length;
    const warnCount = scans.filter(s => (s.overallScore || 0) >= 40 && (s.overallScore || 0) < 70).length;
    const dangerCount = scans.filter(s => (s.overallScore || 0) < 40).length;

    const motivation = avgScore >= 70 ? '🌟 Great choices! Keep it up!'
        : avgScore >= 40 ? '⚠️ Some room for improvement'
            : total === 0 ? '👋 Start scanning to see insights'
                : '🚨 High risk products detected — be careful!';

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={C.cyan} />
                <Text style={{ color: C.textSub, marginTop: 12 }}>Syncing Dashboard...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
            <StatusBar barStyle="light-content" backgroundColor={C.bg} />
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.motivation}>{motivation}</Text>

            {/* Stats */}
            <View style={styles.statsRow}>
                {[
                    { label: 'Total Scanned', val: total, color: C.cyan },
                    { label: 'Avg Score', val: avgScore || '—', color: getColor(avgScore) },
                    { label: 'This Week', val: thisWeek, color: C.purple },
                ].map(({ label, val, color }) => (
                    <View key={label} style={[styles.statCard, { borderTopColor: color }]}>
                        <Text style={[styles.statVal, { color }]}>{val}</Text>
                        <Text style={styles.statLbl}>{label}</Text>
                    </View>
                ))}
            </View>

            {/* Bar Chart */}
            {last10.length > 0 && (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📊 Score Trend (Last {last10.length})</Text>
                    <Svg width={last10.length * (BAR_W + 8)} height={BAR_MAX_H + 24} style={{ alignSelf: 'center' }}>
                        {last10.map((s, i) => {
                            const h = Math.max(4, ((s.overallScore || 0) / 100) * BAR_MAX_H);
                            const color = getColor(s.overallScore || 0);
                            return (
                                <G key={i} x={i * (BAR_W + 8)} y={0}>
                                    <Rect x={0} y={BAR_MAX_H - h} width={BAR_W} height={h} rx={5} fill={color} opacity={0.85} />
                                </G>
                            );
                        })}
                    </Svg>
                </View>
            )}

            {/* Safety Distribution */}
            {total > 0 && (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📈 Safety Distribution</Text>
                    <View style={styles.distRow}>
                        {[
                            { label: 'Safe', count: safeCount, color: C.success },
                            { label: 'Warning', count: warnCount, color: C.warning },
                            { label: 'Danger', count: dangerCount, color: C.danger },
                        ].map(({ label, count, color }) => (
                            <View key={label} style={styles.distItem}>
                                <View style={[styles.distBar, { backgroundColor: color + '22', borderColor: color }]}>
                                    <Text style={[styles.distVal, { color }]}>{count}</Text>
                                </View>
                                <Text style={styles.distLbl}>{label}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Top Red Flags */}
            {topFlags.length > 0 && (
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>☣️ Most Common Harmful Ingredients</Text>
                    {topFlags.map(([name, count], i) => (
                        <View key={name} style={styles.flagRow}>
                            <View style={styles.flagRank}><Text style={styles.flagRankTxt}>#{i + 1}</Text></View>
                            <Text style={styles.flagName}>{name}</Text>
                            <View style={styles.flagBadge}><Text style={styles.flagCount}>{count}×</Text></View>
                        </View>
                    ))}
                </View>
            )}

            {/* Achievements */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>🏅 Achievements</Text>
                <View style={styles.achieveGrid}>
                    {ACHIEVEMENTS.map(a => {
                        const unlocked = total >= a.req;
                        return (
                            <View key={a.id} style={[styles.achieveItem, !unlocked && { opacity: 0.35 }]}>
                                <Text style={styles.achieveIcon}>{a.icon}</Text>
                                <Text style={styles.achieveLabel}>{a.label}</Text>
                                {unlocked && <Text style={styles.achieveCheck}>✓</Text>}
                            </View>
                        );
                    })}
                </View>
            </View>

            {total === 0 && (
                <View style={styles.empty}>
                    <Text style={{ fontSize: 52 }}>📊</Text>
                    <Text style={styles.emptyTitle}>No data yet</Text>
                    <Text style={styles.emptySub}>Scan products to see analytics</Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    scroll: { padding: 20, paddingTop: 60, paddingBottom: 40 },
    title: { fontSize: 28, fontWeight: '900', color: C.text, marginBottom: 4 },
    motivation: { color: C.textSub, fontSize: 13, marginBottom: 22 },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    statCard: { flex: 1, backgroundColor: C.surface, borderRadius: 18, padding: 16, alignItems: 'center', borderTopWidth: 3, borderWidth: 1, borderColor: C.border },
    statVal: { fontSize: 30, fontWeight: '900' },
    statLbl: { color: C.textMuted, fontSize: 11, marginTop: 4, textAlign: 'center' },
    card: { backgroundColor: C.surface, borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: C.border },
    cardTitle: { color: C.text, fontWeight: '800', fontSize: 14, marginBottom: 16 },
    distRow: { flexDirection: 'row', justifyContent: 'space-around' },
    distItem: { alignItems: 'center' },
    distBar: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', borderWidth: 2, marginBottom: 8 },
    distVal: { fontSize: 22, fontWeight: '900' },
    distLbl: { color: C.textSub, fontSize: 12 },
    flagRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
    flagRank: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.elevated, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    flagRankTxt: { color: C.textMuted, fontSize: 11, fontWeight: '700' },
    flagName: { color: C.text, fontSize: 14, flex: 1 },
    flagBadge: { backgroundColor: C.danger + '22', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1, borderColor: C.danger + '55' },
    flagCount: { color: C.danger, fontWeight: '700', fontSize: 12 },
    achieveGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    achieveItem: { backgroundColor: C.elevated, borderRadius: 14, padding: 14, alignItems: 'center', width: '47%', borderWidth: 1, borderColor: C.border },
    achieveIcon: { fontSize: 28, marginBottom: 6 },
    achieveLabel: { color: C.textSub, fontSize: 12, textAlign: 'center' },
    achieveCheck: { color: C.success, fontSize: 12, fontWeight: '700', marginTop: 4 },
    empty: { alignItems: 'center', marginTop: 40 },
    emptyTitle: { color: C.text, fontSize: 18, fontWeight: '700', marginTop: 12 },
    emptySub: { color: C.textSub, fontSize: 14, marginTop: 4 },
});