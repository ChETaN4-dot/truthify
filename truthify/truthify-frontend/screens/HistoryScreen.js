import React, { useState, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    TextInput, StatusBar, ActivityIndicator, Modal, Animated
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

// Backend Imports
import { getAuth } from '../utils/storage';
import { getUserHistory, deleteUserScan } from '../src/api/client'; 

const FILTERS = ['All', 'This Week', 'High Risk', 'Safe'];

export default function HistoryScreen({ navigation }) {
    const { C } = useTheme();
    const styles = getStyles(C);

    const getColor = (s) => s >= 70 ? C.success : s >= 40 ? C.warning : C.danger;

    const [scans, setScans] = useState([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');
    const [loading, setLoading] = useState(true);

    // 🌟 CUSTOM ANIMATED MODAL STATE 🌟
    const [deleteModal, setDeleteModal] = useState({ visible: false, id: null });
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useFocusEffect(useCallback(() => {
        const fetchCloudHistory = async () => {
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
        fetchCloudHistory();
    }, []));

    // 🌟 OPEN ANIMATED MODAL 🌟
    const openDeleteModal = (id) => {
        setDeleteModal({ visible: true, id });
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 6,
            tension: 40,
            useNativeDriver: true
        }).start();
    };

    // 🌟 CLOSE ANIMATED MODAL 🌟
    const closeDeleteModal = () => {
        Animated.timing(scaleAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true
        }).start(() => setDeleteModal({ visible: false, id: null }));
    };

    // 🌟 EXECUTE DELETE 🌟
    const confirmDelete = async () => {
        const idToDelete = deleteModal.id;
        closeDeleteModal(); // Instantly hide the popup

        // 1. Optimistically hide it from the UI instantly for a snappy feel
        setScans(prevScans => prevScans.filter(s => s._id !== idToDelete));
        
        // 2. Tell the cloud to actually delete it
        const result = await deleteUserScan(idToDelete);
        if (!result.success) {
            // If the cloud fails, you could show a toast here, but usually, it's fine!
            console.log("Failed to delete from cloud");
        }
    };

    const now = Date.now();
    const filtered = scans.filter(s => {
        const matchSearch = (s.productName || '').toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'All' ? true
            : filter === 'This Week' ? (now - new Date(s.timestamp || s.createdAt).getTime()) < 7 * 86400000
                : filter === 'High Risk' ? (s.overallScore || 0) < 40
                    : (s.overallScore || 0) >= 70;
        return matchSearch && matchFilter;
    });

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Scan', { screen: 'Results', params: { analysis: item, imageUri: item.imageUri } })}
        >
            <View style={[styles.scoreBadge, { backgroundColor: getColor(item.overallScore) + '22' }]}>
                <Text style={[styles.scoreVal, { color: getColor(item.overallScore) }]}>{item.overallScore}</Text>
            </View>
            <View style={styles.info}>
                <Text style={styles.name}>{item.productName || 'Unknown Product'}</Text>
                <Text style={styles.meta}>{new Date(item.createdAt || item.timestamp).toLocaleDateString('en-IN')} · {item.productCategory || 'Product'}</Text>
                <Text style={styles.flags}>{(item.redFlagIngredients || []).length} red flags found</Text>
            </View>
            
            {/* 🌟 TRASH BUTTON THAT OPENS CUSTOM MODAL 🌟 */}
            <TouchableOpacity 
                style={{ padding: 10, backgroundColor: C.danger + '15', borderRadius: 10 }} 
                onPress={() => openDeleteModal(item._id)}
            >
                <Ionicons name="trash-outline" size={20} color={C.danger} />
            </TouchableOpacity>
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

            {loading ? (
                <View style={styles.empty}>
                    <ActivityIndicator size="large" color={C.cyan} />
                    <Text style={styles.emptySub}>Fetching from cloud...</Text>
                </View>
            ) : filtered.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={{ fontSize: 52 }}>📋</Text>
                    <Text style={styles.emptyTitle}>No scans yet</Text>
                    <Text style={styles.emptySub}>Scan a product to save it to the cloud</Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={i => i._id || i.id || Math.random().toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* 🌟 CUSTOM ANIMATED DELETE MODAL 🌟 */}
            <Modal transparent visible={deleteModal.visible} animationType="fade">
                <View style={styles.modalOverlay}>
                    <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}>
                        <View style={styles.modalIconWrap}>
                            <Ionicons name="trash" size={32} color={C.danger} />
                        </View>
                        <Text style={styles.modalTitle}>Delete Scan?</Text>
                        <Text style={styles.modalSubTxt}>This action cannot be undone. It will be permanently removed from your cloud history.</Text>
                        
                        <View style={styles.modalBtnRow}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={closeDeleteModal}>
                                <Text style={styles.cancelBtnTxt}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmBtn} onPress={confirmDelete}>
                                <Text style={styles.confirmBtnTxt}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}

const getStyles = (C) => StyleSheet.create({
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
    
    // 🌟 CUSTOM MODAL STYLES 🌟
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: C.surface, borderRadius: 24, padding: 24, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: C.border },
    modalIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: C.danger + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: C.danger + '44' },
    modalTitle: { fontSize: 22, fontWeight: '800', color: C.text, marginBottom: 8 },
    modalSubTxt: { fontSize: 14, color: C.textSub, textAlign: 'center', lineHeight: 22, marginBottom: 24, paddingHorizontal: 10 },
    modalBtnRow: { flexDirection: 'row', gap: 12 },
    cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: C.elevated, alignItems: 'center', borderWidth: 1, borderColor: C.border },
    cancelBtnTxt: { color: C.text, fontSize: 15, fontWeight: '700' },
    confirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: C.danger, alignItems: 'center' },
    confirmBtnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
});