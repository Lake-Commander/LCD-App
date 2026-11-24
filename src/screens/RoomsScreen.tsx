import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function RoomsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>LDC ROOMS</Text>
      <Text style={styles.title}>Be together, anywhere.</Text>
      <Text style={styles.subtitle}>Start a shared camera scene or join a private room from a message invite.</Text>
      <View style={styles.hero}>
        <Text style={styles.heroIcon}>◉</Text>
        <Text style={styles.heroTitle}>Shared Scene Call</Text>
        <Text style={styles.heroText}>Bring two cameras into one virtual space.</Text>
        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryText}>Create room</Text>
        </Pressable>
      </View>
      <View style={styles.row}>
        <Feature title="Private" text="Invite-only rooms" />
        <Feature title="Live" text="Low-latency video" />
      </View>
    </View>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return <View style={styles.feature}><Text style={styles.featureTitle}>{title}</Text><Text style={styles.featureText}>{text}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#10131a', padding: 20 },
  eyebrow: { color: '#00ffcc', fontSize: 11, letterSpacing: 1.5, fontWeight: '700', marginTop: 8 },
  title: { color: '#fff', fontSize: 30, fontWeight: '800', marginTop: 8, maxWidth: 300 },
  subtitle: { color: '#aeb6c5', fontSize: 15, lineHeight: 22, marginTop: 10, maxWidth: 340 },
  hero: { backgroundColor: '#1b222d', borderRadius: 22, padding: 22, marginTop: 28, borderWidth: 1, borderColor: '#2c3747' },
  heroIcon: { color: '#00ffcc', fontSize: 34 },
  heroTitle: { color: '#fff', fontSize: 21, fontWeight: '800', marginTop: 18 },
  heroText: { color: '#aeb6c5', marginTop: 7, lineHeight: 20 },
  primaryButton: { alignSelf: 'flex-start', backgroundColor: '#00ffcc', borderRadius: 22, paddingHorizontal: 18, paddingVertical: 12, marginTop: 22 },
  primaryText: { color: '#06110f', fontWeight: '800' },
  row: { flexDirection: 'row', gap: 12, marginTop: 14 },
  feature: { flex: 1, backgroundColor: '#1b222d', borderRadius: 16, padding: 16 },
  featureTitle: { color: '#fff', fontWeight: '700' },
  featureText: { color: '#aeb6c5', marginTop: 6, fontSize: 12 },
});
