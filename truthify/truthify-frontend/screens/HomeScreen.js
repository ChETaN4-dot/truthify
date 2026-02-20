import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { scanProduct } from '../utils/parser';

export default function HomeScreen({ navigation }) {
    const [claim, setClaim] = useState('');
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            handleScan(result.assets[0].base64);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            handleScan(result.assets[0].base64);
        }
    };

    const handleScan = async (base64) => {
        setLoading(true);
        let imageBase64 = base64;

        // Web platform handling: base64 might be null, but uri is a data URL
        if (!imageBase64 && image && image.startsWith('data:image')) {
            imageBase64 = image.split(',')[1];
        }

        const text = await scanProduct(imageBase64);
        setLoading(false);

        if (text) {
            navigation.navigate('Result', {
                scannedText: text,
                claim: claim
            });
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Truthify</Text>
            <Text style={styles.subtitle}>AI-Powered Food Scanner</Text>

            <View style={styles.card}>
                <Text style={styles.label}>Front Label Claim (Optional)</Text>
                <TextInput
                    style={styles.input}
                    placeholder='e.g., "100% Natural"'
                    value={claim}
                    onChangeText={setClaim}
                />
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.scanButton} onPress={pickImage} disabled={loading}>
                    <Text style={styles.buttonText}>Upload Image</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.scanButton, { backgroundColor: '#2ecc71' }]} onPress={takePhoto} disabled={loading}>
                    <Text style={styles.buttonText}>Take Photo</Text>
                </TouchableOpacity>
            </View>

            {loading && <ActivityIndicator size="large" color="#3498db" style={{ marginTop: 20 }} />}

            {image && <Image source={{ uri: image }} style={styles.previewImage} />}

            <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('Dashboard')}
            >
                <Text style={styles.secondaryButtonText}>View Dashboard</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2c3e50',
        textAlign: 'center',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#7f8c8d',
        textAlign: 'center',
        marginBottom: 40,
    },
    card: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        elevation: 3,
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#34495e',
        marginBottom: 10,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: '#bdc3c7',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    scanButton: {
        backgroundColor: '#3498db',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 15,
        width: '48%'
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    secondaryButton: {
        padding: 15,
        alignItems: 'center',
        marginTop: 20
    },
    secondaryButtonText: {
        color: '#3498db',
        fontSize: 16,
    },
    previewImage: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
        alignSelf: 'center',
        marginTop: 20,
        borderRadius: 10
    }
});
