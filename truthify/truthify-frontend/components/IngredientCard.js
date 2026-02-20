import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { C } from '../constants/colors';

const SEV_COLOR = { HIGH: C.danger, MEDIUM: C.warning, LOW: C.textSub };

export default function IngredientCard({ item, type = 'red' }) {
    const [expanded, setExpanded] = useState(false);

    if (type === 'safe') {
        return (
            <View style={[styles.card, { borderLeftColor: C.success }]}>
                <Text style={[styles.name, { color: C.success }]}>{item.name}</Text>
                <Text style={styles.sub}>{item.benefit}</Text>
            </View>
        );
    }

    const sevColor = SEV_COLOR[item.severity] || C.textSub;

    return (
        <View style={[styles.card, { borderLeftColor: sevColor }]}>
            <View style={styles.row}>
                <Text style={[styles.name, { color: C.text, flex: 1 }]}>{item.name}</Text>
                <View style={[styles.badge, { backgroundColor: sevColor + '22', borderColor: sevColor }]}>
                    <Text style={[styles.badgeText, { color: sevColor }]}>{item.severity || 'MED'}</Text>
                </View>
            </View>
            <Text style={styles.sub}>{item.reason}</Text>
            {item.expandedDetail && (
                <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.expandBtn}>
                    <Text style={styles.expandText}>{expanded ? '▲ Less' : '▼ Why harmful?'}</Text>
                </TouchableOpacity>
            )}
            {expanded && <Text style={styles.expanded}>{item.expandedDetail}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: C.card, borderRadius: 14, padding: 14,
        marginBottom: 10, borderLeftWidth: 3,
        borderWidth: 1, borderColor: C.border,
    },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    name: { fontWeight: '700', fontSize: 14 },
    sub: { color: C.textSub, fontSize: 13, lineHeight: 20 },
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
    badgeText: { fontSize: 10, fontWeight: '800' },
    expandBtn: { marginTop: 8 },
    expandText: { color: C.cyan, fontSize: 12, fontWeight: '600' },
    expanded: { color: C.textSub, fontSize: 13, marginTop: 8, lineHeight: 20 },
});
