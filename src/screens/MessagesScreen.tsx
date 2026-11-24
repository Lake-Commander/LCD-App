import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type Message = { id: string; author: 'me' | 'them'; text: string };
const initialMessages: Message[] = [
  { id: '1', author: 'them', text: 'Ready to try the shared scene?' },
  { id: '2', author: 'me', text: 'Yes, send me an invite.' },
];

export function MessagesScreen() {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState('');
  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((current) => [...current, { id: String(Date.now()), author: 'me', text }]);
    setDraft('');
  };
  const lastMessage = useMemo(() => messages[messages.length - 1]?.text ?? 'Start a conversation', [messages]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>LDC MESSENGER</Text>
          <Text style={styles.title}>Messages</Text>
        </View>
        <Pressable style={styles.newButton} onPress={() => setMessages([])}>
          <Text style={styles.newButtonText}>New</Text>
        </Pressable>
      </View>
      <View style={styles.conversationCard}>
        <View style={styles.avatar}><Text style={styles.avatarText}>T</Text></View>
        <View style={styles.conversationInfo}>
          <Text style={styles.name}>Tha Great</Text>
          <Text style={styles.preview} numberOfLines={1}>{lastMessage}</Text>
        </View>
        <Text style={styles.online}>●</Text>
      </View>
      <Text style={styles.sectionTitle}>Conversation</Text>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.author === 'me' ? styles.myBubble : styles.theirBubble]}>
            <Text style={item.author === 'me' ? styles.myText : styles.theirText}>{item.text}</Text>
          </View>
        )}
      />
      <View style={styles.composer}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Write a message..."
          placeholderTextColor="#7d8494"
          style={styles.input}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <Pressable style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#10131a', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  eyebrow: { color: '#00ffcc', fontSize: 11, letterSpacing: 1.5, fontWeight: '700' },
  title: { color: '#fff', fontSize: 30, fontWeight: '800', marginTop: 4 },
  newButton: { borderWidth: 1, borderColor: '#00ffcc', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 9 },
  newButtonText: { color: '#00ffcc', fontWeight: '700' },
  conversationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1b222d', padding: 14, borderRadius: 16 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#775cff', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  conversationInfo: { flex: 1, marginLeft: 12 },
  name: { color: '#fff', fontWeight: '700', fontSize: 16 },
  preview: { color: '#aeb6c5', marginTop: 4 },
  online: { color: '#00ffcc', fontSize: 16 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 26, marginBottom: 8 },
  messageList: { gap: 10, paddingVertical: 8 },
  bubble: { maxWidth: '82%', paddingHorizontal: 14, paddingVertical: 11, borderRadius: 16 },
  myBubble: { alignSelf: 'flex-end', backgroundColor: '#00c9a7', borderBottomRightRadius: 4 },
  theirBubble: { alignSelf: 'flex-start', backgroundColor: '#252d3a', borderBottomLeftRadius: 4 },
  myText: { color: '#071a18' },
  theirText: { color: '#fff' },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 10 },
  input: { flex: 1, backgroundColor: '#1b222d', color: '#fff', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 11 },
  sendButton: { backgroundColor: '#00ffcc', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 12 },
  sendText: { color: '#06110f', fontWeight: '800' },
});
