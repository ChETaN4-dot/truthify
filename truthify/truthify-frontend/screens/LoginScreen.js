// screens/LoginScreen.js
// Truthify · Light Theme · Powerful Design · Same Logic

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
  StatusBar, Alert, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { saveAuth, saveSession } from '../utils/storage';

const { width } = Dimensions.get('window');

export default function LoginScreen({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName]             = useState('');
  const [pin, setPin]               = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading]       = useState(false);

  // Animations
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const cardAnim  = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Staggered entrance animation
    Animated.stagger(120, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1, duration: 600, useNativeDriver: true
        }),
        Animated.spring(slideAnim, {
          toValue: 0, friction: 8, tension: 60,
          useNativeDriver: true
        }),
      ]),
      Animated.parallel([
        Animated.timing(cardAnim, {
          toValue: 1, duration: 500, useNativeDriver: true
        }),
        Animated.spring(cardSlide, {
          toValue: 0, friction: 8, tension: 60,
          useNativeDriver: true
        }),
      ]),
    ]).start();
  }, []);

  // Switch between login / register with animation
  const switchMode = () => {
    Animated.sequence([
      Animated.timing(cardAnim, {
        toValue: 0, duration: 150, useNativeDriver: true
      }),
    ]).start(() => {
      setIsRegister(r => !r);
      setPin(''); setConfirmPin('');
      Animated.timing(cardAnim, {
        toValue: 1, duration: 300, useNativeDriver: true
      }).start();
    });
  };

  const handleSubmit = async () => {
    if (!name.trim() || pin.length < 4) {
      Alert.alert('Invalid', 'Enter your name and a 4-digit PIN.'); return;
    }
    setLoading(true);
    try {
      const { getAuth } = await import('../utils/storage');
      if (isRegister) {
        if (pin !== confirmPin) {
          Alert.alert('Mismatch', 'PINs do not match.');
          setLoading(false); return;
        }
        await saveAuth({ name: name.trim(), pin });
        await saveSession();
        onLogin(name.trim());
      } else {
        const user = await getAuth();
        if (!user) {
          Alert.alert('No account', 'Please register first.');
          setIsRegister(true); setLoading(false); return;
        }
        if (user.name.toLowerCase() !== name.trim().toLowerCase() || user.pin !== pin) {
          Alert.alert('Wrong credentials', 'Name or PIN is incorrect.');
          setLoading(false); return;
        }
        await saveSession();
        onLogin(user.name);
      }
    } catch (e) { Alert.alert('Error', e.message); }
    setLoading(false);
  };

  // 4 PIN dot indicators
  const PinDots = ({ value }) => (
    <View style={s.pinDots}>
      {[0,1,2,3].map(i => (
        <View
          key={i}
          style={[s.pinDot, value.length > i && s.pinDotFilled]}
        />
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F5F3EC" />

      {/* Decorative dot pattern top */}
      <View style={s.dotPattern} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* ── LOGO ── */}
        <Animated.View
          style={[s.logoWrap, {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }]}
        >
          {/* TF circle — exact logo */}
          <View style={s.tfCircleOuter}>
            <View style={s.tfCircle}>
              <Text style={s.tfLabel}>TF</Text>
            </View>
          </View>
          <Text style={s.appName}>TRUTHIFY</Text>
          <Text style={s.tagline}>Know what's really inside</Text>
        </Animated.View>

        {/* ── TAB ROW ── */}
        <View style={s.tabRow}>
          <TouchableOpacity
            style={[s.tabBtn, !isRegister && s.tabBtnActive]}
            onPress={() => !isRegister || switchMode()}
          >
            <Text style={[s.tabText, !isRegister && s.tabTextActive]}>
              Sign In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.tabBtn, isRegister && s.tabBtnActive]}
            onPress={() => isRegister || switchMode()}
          >
            <Text style={[s.tabText, isRegister && s.tabTextActive]}>
              Register
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── CARD ── */}
        <Animated.View
          style={[s.card, {
            opacity: cardAnim,
            transform: [{ translateY: cardSlide }]
          }]}
        >
          {/* Green accent line top */}
          <View style={s.cardAccent} />

          <Text style={s.cardTitle}>
            {isRegister ? 'Create Account' : 'Welcome Back 👋'}
          </Text>

          {/* Name */}
          <Text style={s.label}>NAME</Text>
          <View style={s.inputWrap}>
            <Ionicons name="person-outline" size={17}
              color="#9AAD9E" style={s.inputIcon} />
            <TextInput
              style={s.input}
              placeholder="Your name"
              placeholderTextColor="#B8B5AC"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          {/* PIN */}
          <Text style={s.label}>PIN</Text>
          <View style={s.inputWrap}>
            <Ionicons name="lock-closed-outline" size={17}
              color="#9AAD9E" style={s.inputIcon} />
            <TextInput
              style={[s.input, { flex: 1 }]}
              placeholder="4-digit PIN"
              placeholderTextColor="#B8B5AC"
              value={pin}
              onChangeText={v => setPin(v.replace(/\D/g, '').slice(0, 4))}
              keyboardType="numeric"
              secureTextEntry
            />
            <PinDots value={pin} />
          </View>

          {/* Confirm PIN (register only) */}
          {isRegister && (
            <>
              <Text style={s.label}>CONFIRM PIN</Text>
              <View style={s.inputWrap}>
                <Ionicons name="shield-checkmark-outline" size={17}
                  color="#9AAD9E" style={s.inputIcon} />
                <TextInput
                  style={[s.input, { flex: 1 }]}
                  placeholder="Repeat PIN"
                  placeholderTextColor="#B8B5AC"
                  value={confirmPin}
                  onChangeText={v => setConfirmPin(v.replace(/\D/g, '').slice(0, 4))}
                  keyboardType="numeric"
                  secureTextEntry
                />
                <PinDots value={confirmPin} />
              </View>
            </>
          )}

          {/* Submit button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.88}
            style={s.btnWrap}
          >
            <LinearGradient
              colors={['#1E8A44', '#27A050', '#2DB55D']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.btn}
            >
              <Text style={s.btnText}>
                {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
              </Text>
              {!loading && (
                <View style={s.btnArrow}>
                  <Ionicons name="arrow-forward" size={14} color="#fff" />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Switch link */}
        <TouchableOpacity onPress={switchMode} style={s.switchRow}>
          <Text style={s.switchText}>
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <Text style={s.switchLink}>
              {isRegister ? 'Sign In' : 'Register'}
            </Text>
          </Text>
        </TouchableOpacity>

        {/* Security badge */}
        <View style={s.securityBadge}>
          <Ionicons name="shield-checkmark" size={13} color="#1E8A44" />
          <Text style={s.securityText}>Secured with local PIN encryption</Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#F5F3EC' },
  dotPattern: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 200,
    opacity: 0.6,
    // Note: dot pattern via SVG background not supported in RN natively,
    // use a light SVG image or just omit this for a clean look
  },
  scroll:       { flexGrow: 1, justifyContent: 'center', padding: 24 },

  /* Logo */
  logoWrap:     { alignItems: 'center', marginBottom: 32 },
  tfCircleOuter: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(30,138,68,0.1)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  tfCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#1E8A44',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#1E8A44',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4, shadowRadius: 20, elevation: 12,
  },
  tfLabel: {
    fontFamily: 'Montserrat-Black', fontSize: 30,
    color: '#fff', fontWeight: '900', letterSpacing: -1,
  },
  appName: {
    fontFamily: 'Montserrat-Black', fontSize: 26,
    fontWeight: '900', color: '#145C2E', letterSpacing: 4,
    marginBottom: 5,
  },
  tagline:      { fontSize: 12, fontWeight: '500', color: '#7A8C7E', letterSpacing: 0.3 },

  /* Tab row */
  tabRow: {
    flexDirection: 'row', backgroundColor: '#EDEAE0',
    borderRadius: 16, padding: 4, marginBottom: 18,
    borderWidth: 1, borderColor: 'rgba(30,138,68,0.12)',
  },
  tabBtn:       { flex: 1, padding: 11, borderRadius: 12, alignItems: 'center' },
  tabBtnActive: {
    backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  tabText:      { fontSize: 13, fontWeight: '700', color: '#9AAD9E' },
  tabTextActive: { color: '#145C2E' },

  /* Card */
  card: {
    backgroundColor: '#fff', borderRadius: 28, padding: 24,
    marginBottom: 16, borderWidth: 1,
    borderColor: 'rgba(30,138,68,0.1)',
    shadowColor: '#0F1F14', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 20, elevation: 6,
  },
  cardAccent: {
    height: 3, borderRadius: 3, marginBottom: 20,
    backgroundColor: '#1E8A44', opacity: 0.5,
    marginHorizontal: 20,
    // For gradient, wrap in LinearGradient instead
  },
  cardTitle:    { fontSize: 20, fontWeight: '800', color: '#0F1F14', marginBottom: 22 },

  /* Inputs */
  label:        { fontSize: 10, fontWeight: '700', color: '#9AAD9E', letterSpacing: 1.8, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9F8F4', borderRadius: 16,
    marginBottom: 18, borderWidth: 1.5,
    borderColor: 'rgba(30,138,68,0.1)',
  },
  inputIcon:    { paddingLeft: 14, paddingRight: 4 },
  input:        { flex: 1, padding: 15, color: '#0F1F14', fontSize: 15, fontWeight: '500' },

  /* PIN dots */
  pinDots:      { flexDirection: 'row', gap: 6, paddingRight: 14, alignItems: 'center' },
  pinDot: {
    width: 9, height: 9, borderRadius: 5,
    borderWidth: 2, borderColor: '#C8D4CA',
  },
  pinDotFilled: { backgroundColor: '#1E8A44', borderColor: '#1E8A44' },

  /* Button */
  btnWrap:      { borderRadius: 18, overflow: 'hidden', marginTop: 4 },
  btn: {
    height: 56, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', gap: 10,
    shadowColor: '#1E8A44', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
  btnText:      { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.3 },
  btnArrow: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },

  /* Switch */
  switchRow:    { alignItems: 'center', marginBottom: 16 },
  switchText:   { textAlign: 'center', color: '#7A8C7E', fontSize: 13, fontWeight: '500' },
  switchLink:   { color: '#1E8A44', fontWeight: '800' },

  /* Security badge */
  securityBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(30,138,68,0.06)', borderRadius: 20,
    paddingVertical: 8, paddingHorizontal: 16,
    borderWidth: 1, borderColor: 'rgba(30,138,68,0.1)',
    alignSelf: 'center',
  },
  securityText: { fontSize: 11, fontWeight: '600', color: '#1E8A44', letterSpacing: 0.2 },
});