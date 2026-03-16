import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, StatusBar, ScrollView, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { sendChatMessage } from '../services/groqApi';
import ChatBubble from '../components/ChatBubble';

const QUICK_QUESTIONS = [
    'Is this safe for kids?',
    'Suggest alternatives',
    'Is this diabetic friendly?',
    'What does this do to my body?',
];

const LANGUAGES = ['English', 'Hinglish', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Kannada', 'Malayalam'];

export default function ChatScreen({ route, navigation }) {
    const { C, isDark, toggleTheme } = useTheme();
    const styles = getStyles(C);

    const { analysis } = route.params;
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState('English');
    const [showLangPicker, setShowLangPicker] = useState(false);
    const listRef = useRef(null);

    useEffect(() => {
        // Auto-send welcome message
        const redFlags = (analysis.redFlagIngredients || []).slice(0, 2).map(r => r.name).join(', ');
        const welcome = {
            role: 'assistant',
            content: `I've analyzed **${analysis.productName || 'your product'}** 🔍\n\nHealth Score: **${analysis.overallScore}/100** (${analysis.scoreLabel})\n\n${redFlags ? `Found ${(analysis.redFlagIngredients || []).length} red flag ingredients including **${redFlags}**.` : 'No major red flags detected!'}\n\nWhat would you like to know? Ask me anything about the ingredients, alternatives, or health impacts.`,
        };
        setMessages([welcome]);
    }, []);

    const send = async (text) => {
        const userMsg = text || input.trim();
        if (!userMsg || loading) return;
        setInput('');
        const newMessages = [...messages, { role: 'user', content: userMsg }];
        setMessages(newMessages);
        setLoading(true);
        try {
            const reply = await sendChatMessage(
                newMessages.map(m => ({ role: m.role, content: m.content })),
                analysis,
                language
            );
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, I encountered an error: ${e.message}` }]);
        }
        setLoading(false);
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
            <StatusBar barStyle="light-content" backgroundColor={C.bg} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color={C.text} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <View style={styles.aiAvatar}><Text style={styles.aiAvatarText}>T</Text></View>
                    <View>
                        <Text style={styles.headerTitle}>Truthify AI</Text>
                        <View style={styles.onlineRow}>
                            <View style={styles.onlineDot} />
                            <Text style={styles.onlineText}>Online</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity onPress={() => setShowLangPicker(!showLangPicker)} style={styles.langBtn}>
                    <Ionicons name="globe-outline" size={20} color={C.cyan} />
                </TouchableOpacity>
            </View>

            {/* Language Picker */}
            {showLangPicker && (
                <View style={styles.langPicker}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {LANGUAGES.map(l => (
                            <TouchableOpacity key={l} onPress={() => { setLanguage(l); setShowLangPicker(false); }}
                                style={[styles.langOption, language === l && styles.langOptionActive]}>
                                <Text style={[styles.langOptionTxt, language === l && { color: C.bg }]}>{l}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Messages */}
            <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={(_, i) => i.toString()}
                renderItem={({ item }) => <ChatBubble message={item} isUser={item.role === 'user'} />}
                contentContainerStyle={styles.messageList}
                onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            />

            {/* Typing indicator */}
            {loading && (
                <View style={styles.typingWrap}>
                    <View style={styles.aiAvatar}><Text style={styles.aiAvatarText}>T</Text></View>
                    <View style={styles.typingBubble}>
                        <ActivityIndicator size="small" color={C.cyan} />
                        <Text style={styles.typingText}> Thinking...</Text>
                    </View>
                </View>
            )}

            {/* Quick Questions */}
            {messages.length <= 1 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickScroll} contentContainerStyle={{ paddingHorizontal: 16 }}>
                    {QUICK_QUESTIONS.map(q => (
                        <TouchableOpacity key={q} onPress={() => send(q)} style={styles.quickChip}>
                            <Text style={styles.quickChipTxt}>{q}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {/* Input */}
            <View style={styles.inputBar}>
                <TextInput
                    style={styles.input}
                    placeholder="Ask about this product..."
                    placeholderTextColor={C.textMuted}
                    value={input}
                    onChangeText={setInput}
                    multiline
                    maxLength={500}
                    onSubmitEditing={() => send()}
                />
                <TouchableOpacity onPress={() => send()} disabled={!input.trim() || loading} style={styles.sendBtn}>
                    <LinearGradient colors={input.trim() ? C.gradCyan : [C.elevated, C.elevated]} style={styles.sendGrad}>
                        <Ionicons name="send" size={18} color={input.trim() ? '#fff' : C.textMuted} />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
            <Text style={styles.poweredBy}>Powered by Groq AI · llama-3.3-70b-versatile</Text>
        </KeyboardAvoidingView>
    );
}

const getStyles = (C) => StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.border },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface, justifyContent: 'center', alignItems: 'center' },
    headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 12 },
    aiAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.cyan, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    aiAvatarText: { color: C.bg, fontWeight: '900', fontSize: 16 },
    headerTitle: { color: C.text, fontWeight: '700', fontSize: 15 },
    onlineRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.success, marginRight: 5 },
    onlineText: { color: C.success, fontSize: 11 },
    langBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface, justifyContent: 'center', alignItems: 'center' },
    langPicker: { backgroundColor: C.surface, paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: C.border },
    langOption: { backgroundColor: C.elevated, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, borderWidth: 1, borderColor: C.border },
    langOptionActive: { backgroundColor: C.cyan },
    langOptionTxt: { color: C.textSub, fontSize: 13, fontWeight: '600' },
    messageList: { padding: 16, paddingBottom: 8 },
    typingWrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
    typingBubble: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 18, padding: 12, borderWidth: 1, borderColor: C.border },
    typingText: { color: C.textSub, fontSize: 13 },
    quickScroll: { paddingVertical: 10 },
    quickChip: { backgroundColor: C.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: C.border },
    quickChipTxt: { color: C.textSub, fontSize: 13 },
    inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: C.border },
    input: { flex: 1, backgroundColor: C.surface, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, color: C.text, fontSize: 14, maxHeight: 100, borderWidth: 1, borderColor: C.border },
    sendBtn: { marginLeft: 10, borderRadius: 22, overflow: 'hidden' },
    sendGrad: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    poweredBy: { textAlign: 'center', color: C.textMuted, fontSize: 10, paddingBottom: 8 },
});
