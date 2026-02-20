import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { parseIngredients } from '../utils/parser';
import { analyzeProduct } from '../utils/aiEngine';
import { calculateHealthScore } from '../utils/healthScore';

export default function ResultScreen({ route, navigation }) {
    const { scannedText, claim } = route.params;
    const [analysis, setAnalysis] = useState(null);
    const [score, setScore] = useState(100);

    useEffect(() => {
        const ingredients = parseIngredients(scannedText);
        const result = analyzeProduct(claim, ingredients);
        setAnalysis(result);
        setScore(calculateHealthScore(result.flagged));
    }, [scannedText, claim]);

    if (!analysis) return null;

    const getScoreColor = (s) => {
        if (s >= 80) return '#2ecc71'; // Green
        if (s >= 50) return '#f1c40f'; // Yellow
        return '#e74c3c'; // Red
    };

    return (
        <ScrollView style={styles.container}>
            <View style={[styles.scoreCard, { backgroundColor: getScoreColor(score) }]}>
                <Text style={styles.scoreTitle}>Health Score</Text>
                <Text style={styles.scoreValue}>{score}/100</Text>
            </View>

            {analysis.deceptionAlert && (
                <View style={styles.alertBox}>
                    <Text style={styles.alertTitle}>⚠️ Deception Alert</Text>
                    <Text style={styles.alertText}>{analysis.deceptionReason}</Text>
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>AI Analysis (English)</Text>
                <Text style={styles.text}>{analysis.explanationEn}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>AI Analysis (Hindi)</Text>
                <Text style={styles.text}>{analysis.explanationHi}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Flagged Ingredients</Text>
                {analysis.flagged.length === 0 ? (
                    <Text style={styles.text}>None detected.</Text>
                ) : (
                    analysis.flagged.map((item, index) => (
                        <View key={index} style={styles.ingredientItem}>
                            <Text style={styles.ingredientName}>{item.name}</Text>
                            <Text style={styles.ingredientDetail}>Risk: {item.data.risk}</Text>
                            <Text style={styles.ingredientDetail}>Reason: {item.data.reason}</Text>
                        </View>
                    ))
                )}
            </View>

            {score < 60 && (
                <View style={styles.suggestionBox}>
                    <Text style={styles.suggestionTitle}>💡 Suggestion</Text>
                    <Text style={styles.text}>Try "Organic Oat Cookies" instead.</Text>
                </View>
            )}

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Home')}
            >
                <Text style={styles.buttonText}>Scan Another</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    scoreCard: {
        padding: 30,
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 20,
        elevation: 3,
    },
    scoreTitle: {
        fontSize: 20,
        color: 'white',
        fontWeight: 'bold',
    },
    scoreValue: {
        fontSize: 48,
        color: 'white',
        fontWeight: 'bold',
    },
    alertBox: {
        backgroundColor: '#fab1a0',
        padding: 15,
        borderRadius: 10,
        borderColor: '#e74c3c',
        borderWidth: 1,
        marginBottom: 20,
    },
    alertTitle: {
        color: '#c0392b',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    alertText: {
        color: '#c0392b',
    },
    section: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 10,
    },
    text: {
        fontSize: 14,
        color: '#34495e',
        lineHeight: 20,
    },
    ingredientItem: {
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ecf0f1',
        paddingBottom: 5,
    },
    ingredientName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#e74c3c',
    },
    ingredientDetail: {
        fontSize: 12,
        color: '#7f8c8d',
    },
    suggestionBox: {
        backgroundColor: '#dff9fb',
        padding: 15,
        borderRadius: 10,
        borderColor: '#22a6b3',
        borderWidth: 1,
        marginBottom: 20,
    },
    suggestionTitle: {
        color: '#130f40',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    button: {
        backgroundColor: '#34495e',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 40,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
