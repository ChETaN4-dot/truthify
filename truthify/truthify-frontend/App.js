import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Animated,
  Easing,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import Svg, { Circle, Path } from 'react-native-svg'; // npm install react-native-svg

import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './navigation/AppNavigator';
import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
import { isOnboarded, getAuth, getSession, clearSession } from './utils/storage';

// ─── Constants ───────────────────────────────────────────────────────────────
const { width } = Dimensions.get('window');
const LOGO   = width * 0.46;
const R      = LOGO / 2;
const CIRC   = 2 * Math.PI * (R - 6);
const PAD    = 28;
const SVG_SZ = LOGO + PAD * 2;
const CX     = SVG_SZ / 2;
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

const AnimCircle = Animated.createAnimatedComponent(Circle);
const AnimPath   = Animated.createAnimatedComponent(Path);

// Hide native splash immediately — our JS animation takes over
SplashScreen.preventAutoHideAsync().catch(() => {});

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  // 'splash' | 'onboarding' | 'login' | 'app'
  const [screen, setScreen] = useState('splash');
  const [userName, setUserName] = useState('');
  const [nextScreen, setNextScreen] = useState('login'); // where to go after splash

  // ── Animation values ──────────────────────────────────────────────────────
  const ringDash   = useRef(new Animated.Value(CIRC)).current;
  const bktOpacity = useRef(new Animated.Value(0)).current;
  const bktDash    = useRef(new Animated.Value(44)).current;
  const circScale  = useRef(new Animated.Value(0)).current;
  const tfScale    = useRef(new Animated.Value(0.4)).current;
  const tfOp       = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;
  const scanY      = useRef(new Animated.Value(0)).current;
  const scanOp     = useRef(new Animated.Value(0)).current;
  const nameY      = useRef(new Animated.Value(18)).current;
  const nameOp     = useRef(new Animated.Value(0)).current;
  const exitOp     = useRef(new Animated.Value(1)).current; // for fade-out at end

  // ── Step 1: Decide where to go WHILE animation plays ─────────────────────
  useEffect(() => {
    async function resolveDestination() {
      try {
        const onboarded = await isOnboarded();
        if (!onboarded) {
          setNextScreen('onboarding');
          return;
        }
        const session = await getSession();
        const now = Date.now();
        if (session && (now - session.loginTime) < SESSION_DURATION) {
          const auth = await getAuth();
          if (auth) {
            setUserName(auth.name);
            setNextScreen('app');
            return;
          }
        }
        setNextScreen('login');
      } catch (e) {
        console.warn('Bootstrap error:', e);
        setNextScreen('login');
      }
    }
    resolveDestination();
  }, []);

  // ── Step 2: Play animation, then navigate ─────────────────────────────────
  useEffect(() => {
    // Hide the native splash right away so our JS animation shows
    SplashScreen.hideAsync().catch(() => {});

    Animated.sequence([
      // 1. Brackets snap in
      Animated.parallel([
        Animated.timing(bktOpacity, {
          toValue: 1, duration: 200, useNativeDriver: true,
        }),
        Animated.timing(bktDash, {
          toValue: 0, duration: 380,
          easing: Easing.out(Easing.quad), useNativeDriver: true,
        }),
      ]),

      // 2. Ring strokes around circle
      Animated.timing(ringDash, {
        toValue: 0, duration: 850,
        easing: Easing.inOut(Easing.quad), useNativeDriver: true,
      }),

      // 3. Green circle pops in
      Animated.spring(circScale, {
        toValue: 1, friction: 5, tension: 80, useNativeDriver: true,
      }),

      // 4. TF snaps in big
      Animated.parallel([
        Animated.spring(tfScale, {
          toValue: 1, friction: 5, tension: 90, useNativeDriver: true,
        }),
        Animated.timing(tfOp, {
          toValue: 1, duration: 220, useNativeDriver: true,
        }),
      ]),

      // 5. Verified badge pops
      Animated.spring(badgeScale, {
        toValue: 1, friction: 4, tension: 100, useNativeDriver: true,
      }),

      // 6. Scan line sweeps
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scanOp, {
            toValue: 1, duration: 80, useNativeDriver: true,
          }),
          Animated.timing(scanOp, {
            toValue: 0, duration: 300, delay: 300, useNativeDriver: true,
          }),
        ]),
        Animated.timing(scanY, {
          toValue: LOGO, duration: 680,
          easing: Easing.linear, useNativeDriver: true,
        }),
      ]),

      // 7. TRUTHIFY rises in
      Animated.parallel([
        Animated.spring(nameY, {
          toValue: 0, friction: 7, tension: 60, useNativeDriver: true,
        }),
        Animated.timing(nameOp, {
          toValue: 1, duration: 450, useNativeDriver: true,
        }),
      ]),

      // 8. Hold for 1 second so user can see the finished logo
      Animated.delay(1000),

      // 9. Fade the whole splash out smoothly
      Animated.timing(exitOp, {
        toValue: 0, duration: 350,
        easing: Easing.in(Easing.ease), useNativeDriver: true,
      }),

    ]).start(() => {
      // Animation done → go to resolved screen
      setScreen(nextScreen);
    });
  }, []);

  // ── Render: splash screen ─────────────────────────────────────────────────
  if (screen === 'splash') {
    return (
      <Animated.View style={[s.splash, { opacity: exitOp }]}>
        <StatusBar style="dark" />

        <View style={{ width: LOGO, height: LOGO, position: 'relative' }}>

          {/* SVG: brackets + ring */}
          <Svg
            width={SVG_SZ}
            height={SVG_SZ}
            viewBox={`0 0 ${SVG_SZ} ${SVG_SZ}`}
            style={{
              position: 'absolute',
              top: -PAD,
              left: -PAD,
              zIndex: 4,
            }}
          >
            {/* Corner brackets */}
            {[
              `M${PAD-2},${PAD+16} L${PAD-2},${PAD-2} L${PAD+16},${PAD-2}`,
              `M${SVG_SZ-PAD-16},${PAD-2} L${SVG_SZ-PAD+2},${PAD-2} L${SVG_SZ-PAD+2},${PAD+16}`,
              `M${PAD-2},${SVG_SZ-PAD-16} L${PAD-2},${SVG_SZ-PAD+2} L${PAD+16},${SVG_SZ-PAD+2}`,
              `M${SVG_SZ-PAD-16},${SVG_SZ-PAD+2} L${SVG_SZ-PAD+2},${SVG_SZ-PAD+2} L${SVG_SZ-PAD+2},${SVG_SZ-PAD-16}`,
            ].map((d, i) => (
              <AnimPath
                key={i}
                d={d}
                fill="none"
                stroke="#2DB55D"
                strokeWidth={4}
                strokeLinecap="round"
                strokeDasharray={44}
                strokeDashoffset={bktDash}
                opacity={bktOpacity}
              />
            ))}

            {/* Ring draws around the circle */}
            <AnimCircle
              cx={CX}
              cy={CX}
              r={R - 6}
              fill="none"
              stroke="#2DB55D"
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={ringDash}
            />
          </Svg>

          {/* Green circle body */}
          <Animated.View
            style={[s.greenCircle, {
              width: LOGO - 12,
              height: LOGO - 12,
              top: 6, left: 6,
              borderRadius: (LOGO - 12) / 2,
              transform: [{ scale: circScale }],
            }]}
          >
            {/* TF — big and bold */}
            <Animated.Text
              style={[s.tfText, {
                opacity: tfOp,
                transform: [{ scale: tfScale }],
              }]}
            >
              TF
            </Animated.Text>
          </Animated.View>

          {/* Scan line */}
          <Animated.View
            style={[s.scanLine, {
              opacity: scanOp,
              transform: [{ translateY: scanY }],
            }]}
          />

          {/* Verified badge */}
          <Animated.View
            style={[s.badge, { transform: [{ scale: badgeScale }] }]}
          >
            <Svg width={30} height={30} viewBox="0 0 30 30">
              <Circle cx={15} cy={15} r={15} fill="#1E8A44" />
              <Path
                d="M8 15.5L12.5 20L22 10"
                stroke="white"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Animated.View>
        </View>

        {/* TRUTHIFY — Montserrat Black */}
        <Animated.Text
          style={[s.brandText, {
            opacity: nameOp,
            transform: [{ translateY: nameY }],
          }]}
        >
          TRUTHIFY
        </Animated.Text>
      </Animated.View>
    );
  }

  // ── Render: post-splash screens ───────────────────────────────────────────
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" backgroundColor="#F5F3EC" />
      {screen === 'onboarding' ? (
        <OnboardingScreen onDone={() => setScreen('login')} />
      ) : screen === 'login' ? (
        <LoginScreen
          onLogin={(name) => {
            setUserName(name);
            setScreen('app');
          }}
        />
      ) : (
        <NavigationContainer>
          <AppNavigator
            userName={userName}
            onLogout={async () => {
              await clearSession();
              setScreen('login');
            }}
          />
        </NavigationContainer>
      )}
    </GestureHandlerRootView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#F5F3EC',   // your exact cream background
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  greenCircle: {
    position: 'absolute',
    backgroundColor: '#1E8A44',   // your exact logo green
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E8A44',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
    zIndex: 2,
  },
  tfText: {
    fontFamily: 'Nunito-Black',   // round bold — matches your logo
    fontSize: width * 0.13,       // scales perfectly on every screen size
    color: '#FFFFFF',
    letterSpacing: -2,
    includeFontPadding: false,
    lineHeight: width * 0.14,
  },
  scanLine: {
    position: 'absolute',
    left: -12, right: -12, height: 2,
    backgroundColor: '#2DB55D',
    borderRadius: 2,
    shadowColor: '#2DB55D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 5,
  },
  badge: {
    position: 'absolute',
    bottom: 2, right: 2,
    backgroundColor: '#F5F3EC',
    borderRadius: 20,
    padding: 3,
    zIndex: 6,
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 4,
  },
  brandText: {
    fontFamily: 'Montserrat-Black',  // npx expo install @expo-google-fonts/montserrat
    fontSize: width * 0.1,
    letterSpacing: 3,
    color: '#145C2E',                // your exact dark green
    textShadowColor: 'rgba(20,92,46,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});

// ─── Font setup (add this to the top of App.js) ───────────────────────────
// import { useFonts, Montserrat_900Black } from '@expo-google-fonts/montserrat';
// const [fontsLoaded] = useFonts({ 'Montserrat-Black': Montserrat_900Black });
// if (!fontsLoaded) return null; // wait for fonts before rendering
//
// Install:
// npx expo install @expo-google-fonts/montserrat expo-fontr