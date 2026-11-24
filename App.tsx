import React, { useState } from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraStudioScreen } from './src/screens/CameraStudioScreen';
import { MessagesScreen } from './src/screens/MessagesScreen';
import { RoomsScreen } from './src/screens/RoomsScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import authProviderState from './src/providers/AuthProvider';

const { AuthProvider, useAuth } = authProviderState;

type Tab = 'camera' | 'messages' | 'rooms';

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

function AppShell() {
  const { configured, loading, user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('camera');

  if (configured && loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loading}><Text style={styles.loadingText}>Connecting to LDC...</Text></View>
      </SafeAreaView>
    );
  }

  if (configured && !user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <AuthScreen />
      </SafeAreaView>
    );
  }

  const screen = activeTab === 'camera'
    ? <CameraStudioScreen />
    : activeTab === 'messages'
      ? <MessagesScreen />
      : <RoomsScreen />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>{screen}</View>
      <View style={styles.tabBar}>
        <TabButton label="Camera" icon="◉" active={activeTab === 'camera'} onPress={() => setActiveTab('camera')} />
        <TabButton label="Messages" icon="✉" active={activeTab === 'messages'} onPress={() => setActiveTab('messages')} />
        <TabButton label="Rooms" icon="✦" active={activeTab === 'rooms'} onPress={() => setActiveTab('rooms')} />
      </View>
    </SafeAreaView>
  );
}

function TabButton({ label, icon, active, onPress }: {
  label: string;
  icon: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.tab} onPress={onPress} accessibilityRole="tab" accessibilityState={{ selected: active }}>
      <Text style={[styles.tabIcon, active && styles.activeText]}>{icon}</Text>
      <Text style={[styles.tabLabel, active && styles.activeText]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#10131a' },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#10131a' },
  loadingText: { color: '#aeb6c5' },
  content: { flex: 1 },
  tabBar: { height: 68, flexDirection: 'row', backgroundColor: '#151a23', borderTopWidth: 1, borderTopColor: '#27303d', paddingBottom: 6 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  tabIcon: { color: '#7d8494', fontSize: 20 },
  tabLabel: { color: '#7d8494', fontSize: 11, fontWeight: '600' },
  activeText: { color: '#00ffcc' },
});
