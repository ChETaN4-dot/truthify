// screens/LoginScreen.js
// Truthify · Light Green Theme · Same Logic (Enhanced UI)

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
  StatusBar, Alert, Animated, Dimensions, Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { saveAuth, saveSession } from '../utils/storage';

import logo from '../assets/newlogo.png';

const { width } = Dimensions.get('window');

export default function LoginScreen({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(cardSlide, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const switchMode = () => {
    Animated.timing(cardAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setIsRegister(r => !r);
      setPin('');
      setConfirmPin('');
      Animated.timing(cardAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
  };

  const handleSubmit = async () => {
    if (!name.trim() || pin.length < 4) {
      Alert.alert('Invalid', 'Enter name and 4-digit PIN');
      return;
    }
    setLoading(true);
    try {
      const { getAuth } = await import('../utils/storage');

      if (isRegister) {
        if (pin !== confirmPin) {
          Alert.alert('Mismatch', 'PINs do not match');
          setLoading(false); return;
        }
        await saveAuth({ name: name.trim(), pin });
        await saveSession();
        onLogin(name.trim());
      } else {
        const user = await getAuth();
        if (!user || user.pin !== pin) {
          Alert.alert('Wrong credentials');
          setLoading(false); return;
        }
        await saveSession();
        onLogin(user.name);
      }
    } catch (e) { Alert.alert('Error', e.message); }
    setLoading(false);
  };

  const PinDots = ({ value }) => (
    <View style={s.pinDots}>
      {[0,1,2,3].map(i => (
        <View key={i} style={[s.pinDot, value.length > i && s.pinDotFilled]} />
      ))}
    </View>
  );

  return (
    <LinearGradient
      colors={['#e9fdf1', '#ffffff']}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        style={s.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* LOGO */}
          <Animated.View style={[s.logoWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Image source={logo} style={s.logoHero} resizeMode="contain" />
            <Text style={s.tagline}>Verify news. Trust facts.</Text>
          </Animated.View>

          {/* TAB */}
          <View style={s.tabRow}>
            <TouchableOpacity style={[s.tabBtn, !isRegister && s.tabActive]} onPress={() => !isRegister || switchMode()}>
              <Text style={[s.tabText, !isRegister && s.tabTextActive]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.tabBtn, isRegister && s.tabActive]} onPress={() => isRegister || switchMode()}>
              <Text style={[s.tabText, isRegister && s.tabTextActive]}>Register</Text>
            </TouchableOpacity>
          </View>

          {/* CARD */}
          <Animated.View style={[s.card, { opacity: cardAnim, transform: [{ translateY: cardSlide }] }]}>
            <Text style={s.cardTitle}>{isRegister ? 'Create Account' : 'Welcome Back! '}</Text>

            <View style={s.inputWrap}>
              <Ionicons name="person-outline" size={16} color="#7fbf9a"/>
              <TextInput style={s.input} placeholder="Name" value={name} onChangeText={setName}/>
            </View>

            <View style={s.inputWrap}>
              <Ionicons name="lock-closed-outline" size={16} color="#7fbf9a"/>
              <TextInput
                style={s.input}
                placeholder="4-digit PIN"
                value={pin}
                secureTextEntry
                keyboardType="numeric"
                onChangeText={v => setPin(v.replace(/\D/g,'').slice(0,4))}
              />
              <PinDots value={pin}/>
            </View>

            {isRegister && (
              <View style={s.inputWrap}>
                <Ionicons name="shield-checkmark-outline" size={16} color="#7fbf9a"/>
                <TextInput
                  style={s.input}
                  placeholder="Confirm PIN"
                  value={confirmPin}
                  secureTextEntry
                  keyboardType="numeric"
                  onChangeText={v => setConfirmPin(v.replace(/\D/g,'').slice(0,4))}
                />
                <PinDots value={confirmPin}/>
              </View>
            )}

            <TouchableOpacity onPress={handleSubmit} disabled={loading}>
              <LinearGradient colors={['#1E8A44','#2DB55D']} style={s.btn}>
                <Text style={s.btnText}>
                  {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity onPress={switchMode}>
            <Text style={s.switchText}>
              {isRegister ? 'Already have account? ' : "Don't have account? "}
              <Text style={s.switchLink}>{isRegister ? 'Sign In' : 'Register'}</Text>
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container:{ flex:1 },
  scroll:{ flexGrow:1, justifyContent:'center', padding:26 },
  logoHero: {width: 140,height: 140,marginBottom: 18},
  logoWrap:{ alignItems:'center', marginBottom:28 },
  logo:{ width:140, height:140, marginBottom:10 },
  tagline:{ color:'#5f8f74', fontSize:13 },

  tabRow:{
    flexDirection:'row',
    backgroundColor:'#e6f6ee',
    borderRadius:16,
    padding:4,
    marginBottom:18
  },
  tabBtn:{ flex:1, padding:12, alignItems:'center', borderRadius:12 },
  tabActive:{ backgroundColor:'#fff', elevation:2 },
  tabText:{ color:'#7fbf9a', fontWeight:'700' },
  tabTextActive:{ color:'#145C2E' },

  card:{
    backgroundColor:'#fff',
    padding:24,
    borderRadius:26,
    marginBottom:18,
    shadowColor:'#1E8A44',
    shadowOpacity:0.12,
    shadowRadius:20,
    elevation:6
  },
  cardTitle:{ fontSize:20, fontWeight:'800', marginBottom:18, color:'#0F1F14' },

  inputWrap:{
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:'#f3fbf7',
    borderRadius:16,
    paddingHorizontal:14,
    marginBottom:16
  },
  input:{ flex:1, padding:14, fontSize:15 },

  pinDots:{ flexDirection:'row', gap:6 },
  pinDot:{ width:8,height:8,borderRadius:4,borderWidth:1,borderColor:'#bcdccc' },
  pinDotFilled:{ backgroundColor:'#1E8A44' },

  btn:{
    height:56,
    borderRadius:18,
    justifyContent:'center',
    alignItems:'center',
    marginTop:6
  },
  btnText:{ color:'#fff', fontWeight:'800', fontSize:16 },

  switchText:{ textAlign:'center', color:'#6d9b82', fontSize:13 },
  switchLink:{ color:'#1E8A44', fontWeight:'800' }
});