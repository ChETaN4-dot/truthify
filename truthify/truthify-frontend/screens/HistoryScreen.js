import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    Alert, TextInput, StatusBar
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants/colors';
import { getScans, deleteScan } from '../utils/storage';

const FILTERS = ['All', 'This Week', 'High Risk', 'Safe'];

function getColor(s) { return s >= 70 ? C.success : s >= 40 ? C.warning : C.danger; }

export default function HistoryScreen({ navigation }) {
    const [scans, setScans] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');

    useFocusEffect(useCallback(() => { getScans().then(setScans); }, []));

    const handleDelete = (id) => Alert.alert('Delete', 'Remove this scan?', [
        { text: 'Cancel', style: 'cancel' },
        {
            text: 'Delete', style: 'destructive', onPress: async () => {
                await deleteScan(id);
                setScans(prev => prev.filter(s => s.id !== id));
            }
        }
    ]);

    const now = Date.now();
    const filtered = scans.filter(s => {
        const matchSearch = (s.productName || '').toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'All' ? true
            : filter === 'This Week' ? (now - new Date(s.timestamp).getTime()) < 7 * 86400000
                : filter === 'High Risk' ? (s.overallScore || 0) < 40
                    : (s.overallScore || 0) >= 70;
        return matchSearch && matchFilter;
    });

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Results', { analysis: item, imageUri: item.imageUri })}
            onLongPress={() => handleDelete(item.id)}
        >
            <View style={[styles.scoreBadge, { backgroundColor: getColor(item.overallScore) + '22' }]}>
                <Text style={[styles.scoreVal, { color: getColor(item.overallScore) }]}>{item.overallScore}</Text>
            </View>
            <View style={styles.info}>
                <Text style={styles.name}>{item.productName || 'Unknown Product'}</Text>
                <Text style={styles.meta}>{new Date(item.timestamp).toLocaleDateString('en-IN')} · {item.productCategory || 'Product'}</Text>
                <Text style={styles.flags}>{(item.redFlagIngredients || []).length} red flags found</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={C.bg} />
            <View style={styles.headerRow}>
                <Text style={styles.title}>History</Text>
                <View style={styles.countBadge}><Text style={styles.countTxt}>{scans.length}</Text></View>
            </View>

            {/* Search */}
            <View style={styles.searchWrap}>
                <Ionicons name="search-outline" size={16} color={C.textMuted} style={{ marginLeft: 14 }} />
                <TextInput style={styles.search} placeholder="Search products..." placeholderTextColor={C.textMuted}
                    value={search} onChangeText={setSearch} />
            </View>

            {/* Filters */}
            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                {FILTERS.map(f => (
                    <TouchableOpacity key={f} onPress={() => setFilter(f)}
                        style={[styles.filterChip, filter === f && styles.filterChipActive]}>
                        <Text style={[styles.filterTxt, filter === f && { color: C.bg }]}>{f}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {filtered.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={{ fontSize: 52 }}>📋</Text>
                    <Text style={styles.emptyTitle}>No scans yet</Text>
                    <Text style={styles.emptySub}>Scan a product to see it here</Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={i => i.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg, padding: 20, paddingTop: 60 },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 28, fontWeight: '900', color: C.text },
    countBadge: { backgroundColor: C.cyan + '22', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3, marginLeft: 10, borderWidth: 1, borderColor: C.cyan + '55' },
    countTxt: { color: C.cyan, fontWeight: '700', fontSize: 13 },
    searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
    search: { flex: 1, padding: 13, color: C.text, fontSize: 14 },
    filterChip: { backgroundColor: C.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, borderWidth: 1, borderColor: C.border },
    filterChipActive: { backgroundColor: C.cyan },
    filterTxt: { color: C.textSub, fontSize: 12, fontWeight: '600' },
    card: {
        backgroundColor: C.surface, borderRadius: 18, padding: 16, marginBottom: 10,
        flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.border,
    },
    scoreBadge: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    scoreVal: { fontSize: 20, fontWeight: '900' },
    info: { flex: 1 },
    name: { color: C.text, fontWeight: '700', fontSize: 15, marginBottom: 3 },
    meta: { color: C.textMuted, fontSize: 12, marginBottom: 2 },
    flags: { color: C.textSub, fontSize: 12 },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyTitle: { color: C.text, fontSize: 18, fontWeight: '700', marginTop: 12 },
    emptySub: { color: C.textSub, fontSize: 14, marginTop: 4 },
});
