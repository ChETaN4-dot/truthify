import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C } from '../constants/colors';

export default function ChatBubble({ message, isUser }) {
    if (isUser) {
        return (
            <View style={styles.userWrap}>
                <LinearGradient colors={C.gradCyan} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.userBubble}>
                    <Text style={styles.userText}>{message.content}</Text>
                </LinearGradient>
            </View>
        );
    }
    return (
        <View style={styles.aiWrap}>
            <View style={styles.avatar}><Text style={styles.avatarText}>T</Text></View>
            <View style={styles.aiBubble}>
                <Text style={styles.aiText}>{message.content}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    userWrap: { alignItems: 'flex-end', marginBottom: 12, marginLeft: 60 },
    userBubble: { borderRadius: 18, borderBottomRightRadius: 4, padding: 12, paddingHorizontal: 16 },
    userText: { color: '#fff', fontSize: 14, lineHeight: 20 },
    aiWrap: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, marginRight: 60 },
    avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.cyan, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    avatarText: { color: C.bg, fontWeight: '900', fontSize: 14 },
    aiBubble: { flex: 1, backgroundColor: C.card, borderRadius: 18, borderBottomLeftRadius: 4, padding: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: C.border },
    aiText: { color: C.text, fontSize: 14, lineHeight: 22 },
});
