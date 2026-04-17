// screens/LoginScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
  StatusBar, Animated, Dimensions, Image, Easing
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Backend API functions
import { loginUser, registerUser } from '../src/api/client'; 
import logo from '../assets/newlogo.png';

const { width } = Dimensions.get('window');

// 🌟 Data arrays for the animated gradient text 🌟
const APP_NAME = "Truthify".split('');
const GRADIENT_COLORS = [
  '#0b2414', // Darkest green
  '#0e311a', 
  '#123e20', 
  '#164c27', 
  '#1a5a2e', 
  '#1f6935', 
  '#24783d', 
  '#2ab55c'  // Lightest vibrant green
];

export default function LoginScreen({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(20)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current; 
  const scaleAnim = useRef(new Animated.Value(1)).current; 
  const errorToastAnim = useRef(new Animated.Value(-150)).current; 
  
  // The engine for our breathing effect
  const flagAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Startup animations
    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 6, tension: 40, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(cardSlide, { toValue: 0, friction: 7, tension: 50, useNativeDriver: true }),
      ]),
    ]).start();

    // 🌟 Start the Emerald Breathing Loop 🌟
    Animated.loop(
      Animated.sequence([
        Animated.timing(flagAnim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(flagAnim, { toValue: 0, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
      ])
    ).start();

  }, []);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  const showErrorToast = (msg) => {
    setErrorMsg(msg);
    triggerShake(); 
    
    Animated.spring(errorToastAnim, {
      toValue: 60, 
      useNativeDriver: true,
      friction: 8,
      tension: 40
    }).start();

    setTimeout(() => {
      Animated.timing(errorToastAnim, {
        toValue: -150,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 3000);
  };

  const switchMode = () => {
    Animated.timing(cardAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setIsRegister(r => !r);
      setPin('');
      setConfirmPin('');
      Animated.timing(cardAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    });
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || pin.length < 4) {
      showErrorToast('Please enter your name and a 4-digit PIN.');
      return;
    }
    
    setLoading(true);
    
    try {
      const { saveAuth, saveSession } = await import('../utils/storage');

      if (isRegister) {
        if (pin !== confirmPin) {
          showErrorToast('Your PINs do not match. Please try again.');
          setLoading(false); 
          return;
        }
        const result = await registerUser(trimmedName, pin);
        if (result.success) {
          await saveAuth(result.user); 
          await saveSession();
          onLogin(result.user.name);
        } else {
          showErrorToast(result.message); 
        }
      } else {
        const result = await loginUser(trimmedName, pin);
        if (result.success) {
          await saveAuth(result.user); 
          await saveSession();
          onLogin(result.user.name);
        } else {
          showErrorToast(result.message); 
        }
      }
    } catch (e) { 
      showErrorToast(e.message || 'Something went wrong on the network.'); 
    }
    
    setLoading(false);
  };

  const animateButton = (inOut) => {
    Animated.spring(scaleAnim, {
      toValue: inOut === 'in' ? 0.95 : 1,
      useNativeDriver: true,
      speed: 20
    }).start();
  };

  const PinDots = ({ value }) => (
    <View style={s.pinDots}>
      {[0,1,2,3].map(i => (
        <View key={i} style={[s.pinDot, value.length > i && s.pinDotFilled]} />
      ))}
    </View>
  );

  return (
    <LinearGradient colors={['#eafbf1', '#fdfdfd']} style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <Animated.View style={[s.errorToastContainer, { transform: [{ translateY: errorToastAnim }] }]}>
        <LinearGradient colors={['#EF4444', '#DC2626']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.errorToastGradient}>
          <Ionicons name="warning" size={28} color="#fff" />
          <View style={s.errorToastTextWrap}>
            <Text style={s.errorToastTitle}>Authentication Error</Text>
            <Text style={s.errorToastSub}>{errorMsg}</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* LOGO HERO */}
          <Animated.View style={[s.logoWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={s.logoGlow}>
              <Image source={logo} style={s.logoHero} resizeMode="contain" />
            </View>
            
            {/* 🌟 Emerald Breathing Gradient Text 🌟 */}
            <Animated.View style={[s.appNameRow, {
                transform: [{ 
                  scale: flagAnim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.04] }) 
                }],
                opacity: flagAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] })
            }]}>
              {APP_NAME.map((char, i) => (
                <Text key={i} style={[s.appNameChar, { color: GRADIENT_COLORS[i] }]}>
                  {char}
                </Text>
              ))}
            </Animated.View>

            <Text style={s.tagline}>Verify news. Trust facts.</Text>
          </Animated.View>

          {/* TAB ROW */}
          <View style={s.tabRow}>
            <TouchableOpacity style={[s.tabBtn, !isRegister && s.tabActive]} onPress={() => !isRegister || switchMode()}>
              <Text style={[s.tabText, !isRegister && s.tabTextActive]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.tabBtn, isRegister && s.tabActive]} onPress={() => isRegister || switchMode()}>
              <Text style={[s.tabText, isRegister && s.tabTextActive]}>Register</Text>
            </TouchableOpacity>
          </View>

          {/* MAIN CARD WITH SHAKE ANIMATION */}
          <Animated.View style={[s.card, { opacity: cardAnim, transform: [{ translateY: cardSlide }, { translateX: shakeAnim }] }]}>
            <Text style={s.cardTitle}>{isRegister ? 'Create Account' : 'Welcome Back'}</Text>

            <View style={s.inputWrap}>
              <Ionicons name="person-outline" size={18} color="#5ba87b"/>
              <TextInput 
                style={s.input} 
                placeholder="Name" 
                placeholderTextColor="#a0c2af"
                value={name} 
                onChangeText={setName}
                autoCorrect={false}
              />
            </View>

            <View style={s.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color="#5ba87b"/>
              <TextInput
                style={s.input}
                placeholder="4-digit PIN"
                placeholderTextColor="#a0c2af"
                value={pin}
                secureTextEntry
                keyboardType="numeric"
                onChangeText={v => setPin(v.replace(/\D/g,'').slice(0,4))}
              />
              <PinDots value={pin}/>
            </View>

            {isRegister && (
              <View style={s.inputWrap}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#5ba87b"/>
                <TextInput
                  style={s.input}
                  placeholder="Confirm PIN"
                  placeholderTextColor="#a0c2af"
                  value={confirmPin}
                  secureTextEntry
                  keyboardType="numeric"
                  onChangeText={v => setConfirmPin(v.replace(/\D/g,'').slice(0,4))}
                />
                <PinDots value={confirmPin}/>
              </View>
            )}

            {/* ANIMATED SUBMIT BUTTON */}
            <TouchableOpacity 
              onPress={handleSubmit} 
              disabled={loading}
              activeOpacity={0.9}
              onPressIn={() => animateButton('in')}
              onPressOut={() => animateButton('out')}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <LinearGradient colors={['#20964a','#2ab55c']} style={s.btn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={s.btnText}>
                    {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
                  </Text>
                  {!loading && <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />}
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
          </Animated.View>

          {/* FOOTER LINK */}
          <TouchableOpacity onPress={switchMode} style={s.footerTouch}>
            <Text style={s.switchText}>
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
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
  scroll:{ flexGrow:1, justifyContent:'center', padding:24 },
  
  errorToastContainer: { position: 'absolute', top: 0, left: 20, right: 20, zIndex: 999 },
  errorToastGradient: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 10 },
  errorToastTextWrap: { marginLeft: 14, flex: 1 },
  errorToastTitle: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  errorToastSub: { color: 'rgba(255, 255, 255, 0.9)', fontSize: 13, marginTop: 2 },

  logoHero: { width: 110, height: 110 },
  logoGlow: { backgroundColor: '#ffffff', padding: 15, borderRadius: 35, shadowColor: '#20964a', shadowOpacity: 0.15, shadowRadius: 25, elevation: 10, marginBottom: 16 },
  logoWrap:{ alignItems:'center', marginBottom:35, marginTop: 40 },
  
  // Container for the animated letters
  appNameRow: { flexDirection: 'row', marginBottom: 6, height: 45, alignItems: 'center' },
  appNameChar: { fontSize: 36, fontWeight: '900', letterSpacing: 1.5 },
  
  tagline:{ color:'#4d8565', fontSize:14, fontWeight: '600', letterSpacing: 0.5 },

  tabRow:{ flexDirection:'row', backgroundColor:'#dcf5e6', borderRadius:14, padding:5, marginBottom:24 },
  tabBtn:{ flex:1, padding:12, alignItems:'center', borderRadius:10 },
  tabActive:{ backgroundColor:'#fff', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  tabText:{ color:'#78b594', fontWeight:'700', fontSize: 15 },
  tabTextActive:{ color:'#1a6b34' },

  card:{ backgroundColor:'#fff', padding:26, borderRadius:28, marginBottom:20, shadowColor:'#125c2b', shadowOpacity:0.08, shadowRadius:30, elevation:8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)' },
  cardTitle:{ fontSize:24, fontWeight:'800', marginBottom:24, color:'#0b2414', letterSpacing: -0.5 },

  inputWrap:{ flexDirection:'row', alignItems:'center', backgroundColor:'#f4fcf7', borderWidth: 1, borderColor: '#e2f5ea', borderRadius:18, paddingHorizontal:16, marginBottom:16, height: 60 },
  input:{ flex:1, padding:14, fontSize:16, color: '#1a4026', fontWeight: '500' },

  pinDots:{ flexDirection:'row', gap:8 },
  pinDot:{ width:10, height:10, borderRadius:5, borderWidth:1.5, borderColor:'#c1e0cd', backgroundColor: '#fff' },
  pinDotFilled:{ backgroundColor:'#20964a', borderColor: '#20964a' },

  btn:{ height:60, borderRadius:18, flexDirection: 'row', justifyContent:'center', alignItems:'center', marginTop: 10, shadowColor:'#20964a', shadowOpacity:0.3, shadowRadius:15, elevation:6 },
  btnText:{ color:'#fff', fontWeight:'800', fontSize:17, letterSpacing: 0.5 },

  footerTouch: { padding: 10 },
  switchText:{ textAlign:'center', color:'#5f8c72', fontSize:14 },
  switchLink:{ color:'#20964a', fontWeight:'800' }
});