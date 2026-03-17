import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // 👈 Added this for the shield icon
import { useTheme } from '../theme/ThemeContext';

export default function IngredientCard({ item, type = 'red' }) {
    const { C } = useTheme();
    const styles = getStyles(C);

    // SEV_COLOR moved inside the component so it has access to the theme object C
    const SEV_COLOR = { HIGH: C.danger, MEDIUM: C.warning, LOW: C.textSub };

    const [expanded, setExpanded] = useState(false);

    // 🌟 Reusable FSSAI Shield Component 🌟
    const VerifiedBadge = () => {
        if (!item.isVerified) return null;
        return (
            <View style={styles.verifiedBadge}>
                <Ionicons name="shield-checkmark" size={12} color={C.success} />
                <Text style={styles.verifiedTxt}>
                    Verified by {item.source || 'FSSAI'}
                </Text>
            </View>
        );
    };

    if (type === 'safe') {
        return (
            <View style={[styles.card, { borderLeftColor: C.success }]}>
                <Text style={[styles.name, { color: C.success }]}>{item.name}</Text>
                {item.technicalName && <Text style={styles.technicalName}>{item.technicalName}</Text>}
                <VerifiedBadge />
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
            
            {/* Show the official chemical name if the FSSAI database found it */}
            {item.technicalName && <Text style={styles.technicalName}>{item.technicalName}</Text>}
            
            {/* Show the Green Shield if verified! */}
            <VerifiedBadge />
            
            <Text style={styles.sub}>{item.reason}</Text>
            
            {/* Show expand button if there are more details OR health effects */}
            {(item.expandedDetail || item.healthEffect) && (
                <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.expandBtn}>
                    <Text style={styles.expandText}>{expanded ? '▲ Less' : '▼ Why harmful?'}</Text>
                </TouchableOpacity>
            )}
            
            {expanded && (
                <Text style={styles.expanded}>
                    {/* If we have a verified health effect from FSSAI, show it first! */}
                    {item.healthEffect ? `Health Impact: ${item.healthEffect}\n\n` : ''}
                    {item.expandedDetail}
                </Text>
            )}
        </View>
    );
}

const getStyles = (C) => StyleSheet.create({
    card: {
        backgroundColor: C.surface, borderRadius: 14, padding: 14,
        marginBottom: 10, borderLeftWidth: 3,
        borderWidth: 1, borderColor: C.border,
    },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    name: { fontWeight: '700', fontSize: 14, textTransform: 'capitalize' },
    sub: { color: C.textSub, fontSize: 13, lineHeight: 20 },
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
    badgeText: { fontSize: 10, fontWeight: '800' },
    expandBtn: { marginTop: 8 },
    expandText: { color: C.cyan, fontSize: 12, fontWeight: '600' },
    expanded: { color: C.textSub, fontSize: 13, marginTop: 8, lineHeight: 20 },
    
    // 🌟 New Styles for FSSAI Verification 🌟
    technicalName: { 
        color: C.textMuted, fontSize: 11, fontFamily: 'monospace', marginBottom: 6 
    },
    verifiedBadge: { 
        flexDirection: 'row', alignItems: 'center', backgroundColor: C.success + '15', 
        alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, 
        borderRadius: 6, borderWidth: 1, borderColor: C.success + '44', marginBottom: 8 
    },
    verifiedTxt: { 
        color: C.success, fontSize: 10, fontWeight: '800', marginLeft: 4, letterSpacing: 0.5 
    },
});