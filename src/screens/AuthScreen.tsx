import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../providers/AuthProvider';

export function AuthScreen() {
  const { signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setStatus('Enter your email address.');
      return;
    }
    setSubmitting(true);
    const { error } = await signInWithMagicLink(normalizedEmail);
    setStatus(error ? error.message : 'Check your email for the sign-in link.');
    setSubmitting(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.brand}>LDC</Text>
      <Text style={styles.title}>Stay close, anywhere.</Text>
      <Text style={styles.subtitle}>Sign in to sync messages, rooms, and your camera creations.</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email address"
        placeholderTextColor="#7d8494"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />
      <Pressable style={[styles.button, submitting && styles.disabled]} onPress={submit} disabled={submitting}>
        <Text style={styles.buttonText}>{submitting ? 'Sending...' : 'Email me a sign-in link'}</Text>
      </Pressable>
      {status ? <Text style={styles.status}>{status}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#10131a', justifyContent: 'center', padding: 28 },
  brand: { color: '#00ffcc', fontSize: 16, fontWeight: '800', letterSpacing: 4 },
  title: { color: '#fff', fontSize: 32, fontWeight: '800', marginTop: 16 },
  subtitle: { color: '#aeb6c5', fontSize: 15, lineHeight: 22, marginTop: 10, marginBottom: 28 },
  input: { backgroundColor: '#1b222d', color: '#fff', borderRadius: 12, padding: 15, fontSize: 16 },
  button: { backgroundColor: '#00ffcc', borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 12 },
  disabled: { opacity: 0.6 },
  buttonText: { color: '#06110f', fontWeight: '800' },
  status: { color: '#aeb6c5', marginTop: 16, textAlign: 'center' },
});
