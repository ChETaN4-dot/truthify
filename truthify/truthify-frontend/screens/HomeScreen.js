import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { scanProduct } from '../utils/parser';

export default function HomeScreen({ navigation }) {
  const [claim, setClaim] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);

  const pickImage = async () => {
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
      alert('Camera permission required!');
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
    const text = await scanProduct(base64);
    setLoading(false);

    if (text) {
      navigation.navigate('Result', {
        scannedText: text,
        claim: claim,
      });
    }
  };

  return (
    <LinearGradient
      colors={['#e9fff2', '#c8f5dc', '#9ee6c0']}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Truthify</Text>
        <Text style={styles.subtitle}>AI-Powered Food Scanner</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Front Label Claim (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder='e.g., "100% Natural"'
            placeholderTextColor="#8fbfa3"
            value={claim}
            onChangeText={setClaim}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.buttonWrap}
            onPress={pickImage}
            disabled={loading}
          >
            <LinearGradient
              colors={['#1E8A44', '#27A050', '#2DB55D']}
              style={styles.scanButton}
            >
              <Text style={styles.buttonText}>Upload Image</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buttonWrap}
            onPress={takePhoto}
            disabled={loading}
          >
            <LinearGradient
              colors={['#145C2E', '#1E8A44']}
              style={styles.scanButton}
            >
              <Text style={styles.buttonText}>Take Photo</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {loading && (
          <ActivityIndicator
            size="large"
            color="#1E8A44"
            style={{ marginTop: 20 }}
          />
        )}

        {image && (
          <Image
            source={{ uri: image }}
            style={styles.previewImage}
          />
        )}

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.secondaryButtonText}>
            View Dashboard
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },

  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#145C2E',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 2,
  },

  subtitle: {
    fontSize: 15,
    color: '#2f6f4e',
    textAlign: 'center',
    marginBottom: 40,
  },

  card: {
    backgroundColor: '#f4fff8',
    padding: 20,
    borderRadius: 20,
    marginBottom: 25,
    shadowColor: '#1E8A44',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },

  label: {
    fontSize: 13,
    color: '#1E8A44',
    marginBottom: 8,
    fontWeight: '700',
    letterSpacing: 1,
  },

  input: {
    borderWidth: 1,
    borderColor: '#b7e4c7',
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    backgroundColor: '#ffffff',
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  buttonWrap: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
  },

  scanButton: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 16,
  },

  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },

  secondaryButton: {
    padding: 15,
    alignItems: 'center',
    marginTop: 30,
  },

  secondaryButtonText: {
    color: '#145C2E',
    fontSize: 16,
    fontWeight: '700',
  },

  previewImage: {
    width: 220,
    height: 220,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 25,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#1E8A44',
  },
});