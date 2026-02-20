import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../constants/colors';

import ScanScreen from '../screens/ScanScreen';
import ProcessingScreen from '../screens/ProcessingScreen';
import ResultsScreen from '../screens/ResultsScreen';
import ChatScreen from '../screens/ChatScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DashboardScreen from '../screens/DashboardScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS = {
    Scan: 'scan-outline',
    History: 'time-outline',
    Dashboard: 'bar-chart-outline',
    Profile: 'person-outline',
};

function ScanStack({ route }) {
    const { userName } = route.params || {};
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="ScanMain" component={ScanScreen} initialParams={{ userName }} />
            <Stack.Screen name="Processing" component={ProcessingScreen} />
            <Stack.Screen name="Results" component={ResultsScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Navigator>
    );
}

export default function AppNavigator({ userName, onLogout }) {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: C.cyan,
                tabBarInactiveTintColor: C.textMuted,
                tabBarLabelStyle: styles.tabLabel,
                tabBarIcon: ({ focused, color, size }) => (
                    <View style={focused ? styles.activeIconWrap : null}>
                        {focused && (
                            <LinearGradient colors={[C.cyan + '33', C.purple + '22']} style={StyleSheet.absoluteFill} />
                        )}
                        <Ionicons name={TAB_ICONS[route.name]} size={22} color={color} />
                    </View>
                ),
            })}
        >
            <Tab.Screen name="Scan" initialParams={{ userName }}>
                {(props) => <ScanStack {...props} route={{ ...props.route, params: { userName } }} />}
            </Tab.Screen>
            <Tab.Screen name="History" component={HistoryScreen} />
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Profile">
                {(props) => <ProfileScreen {...props} userName={userName} onLogout={onLogout} />}
            </Tab.Screen>
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: C.surface,
        borderTopColor: C.border,
        borderTopWidth: 1,
        height: 64,
        paddingBottom: 10,
        paddingTop: 6,
    },
    tabLabel: { fontSize: 11, fontWeight: '700' },
    activeIconWrap: {
        width: 44, height: 36, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
    },
});
