import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import firebaseService, { ChatHistory } from '../services/firebaseService';

type Role = 'user' | 'model';
type Message = { id: string; role: Role; parts: string; timestamp: Date };

export default function GeminiChatScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ChatHistory[]>([]);
  const flatRef = useRef<FlatList<Message>>(null);

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: String(Date.now()),
      role: 'user',
      parts: text,
      timestamp: new Date(),
    };

    setMessages(prev => [userMsg, ...prev]); // inverted
    setInputText('');
    setLoading(true);

    try {
      const replyText = await firebaseService.chatWithHistory(text, history);

      setHistory(prev => [
        ...prev,
        { role: 'user', parts: [{ text }] },
        { role: 'model', parts: [{ text: replyText }] },
      ]);

      const botMsg: Message = {
        id: String(Date.now() + 1),
        role: 'model',
        parts: replyText,
        timestamp: new Date(),
      };
      setMessages(prev => [botMsg, ...prev]);
      requestAnimationFrame(() =>
        flatRef.current?.scrollToOffset({ offset: 0, animated: true })
      );
    } catch {
      const errMsg: Message = {
        id: String(Date.now() + 1),
        role: 'model',
        parts: 'Desculpe, ocorreu um erro ao processar sua mensagem.',
        timestamp: new Date(),
      };
      setMessages(prev => [errMsg, ...prev]);
    } finally {
      setLoading(false);
    }
  };


  const colors = isDark
    ? {
        bg: '#0C0F14',
        card: '#151A22',
        user: '#1E2B45',
        text: '#E8EDF7',
        muted: '#98A2B3',
        border: 'rgba(255,255,255,0.06)',
        accent: '#5CA0FF',
      }
    : {
        bg: '#F7F7F8',
        card: '#FFFFFF',
        user: '#DCEBFF',
        text: '#0B0F19',
        muted: '#5B667A',
        border: 'rgba(12,16,27,0.08)',
        accent: '#4285F4',
      };

  const renderItem = ({ item }: { item: Message }) => {
    const me = item.role === 'user';
    return (
      <View style={[styles.row, me ? styles.end : styles.start]}>
        <View
          style={[
            styles.bubble,
            { backgroundColor: me ? colors.user : colors.card },
          ]}
        >
          <Text style={[styles.msg, { color: colors.text }]}>{item.parts}</Text>
          <Text style={[styles.time, { color: colors.muted }]}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  const disabled = !inputText.trim() || loading;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header simples */}
      <View
        style={[
          styles.header,
          { borderBottomColor: colors.border, backgroundColor: colors.card },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>Arnaldo AppChat</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Exemplo de chat integrado ao Firebase AI Logic
        </Text>
      </View>

      {/* Lista */}
      <FlatList
        ref={flatRef}
        data={messages}
        inverted
        keyExtractor={(m) => m.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Comece a conversa
            </Text>
            <Text style={[styles.emptyTxt, { color: colors.muted }]}>
              Ex.: “Explique como funciona…”, “Me ajude a criar…” ou “O que é…”
            </Text>
          </View>
        }
        keyboardShouldPersistTaps="handled"
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <View
          style={[
            styles.inputBar,
            { borderTopColor: colors.border, backgroundColor: colors.bg },
          ]}
        >
          <View
            style={[
              styles.inputRow,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Digite sua mensagem…"
              placeholderTextColor={colors.muted}
              style={[styles.input, { color: colors.text }]}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              onPress={sendMessage}
              disabled={disabled}
              style={[
                styles.send,
                { backgroundColor: disabled ? colors.muted : colors.accent },
              ]}
            >
              <Text style={styles.sendTxt}>Enviar</Text>
            </TouchableOpacity>
          </View>
          {loading && (
            <View style={styles.loading}>
              <ActivityIndicator />
              <Text style={[styles.loadingTxt, { color: colors.muted }]}>
                pensando…
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 18, fontWeight: '700' },
  subtitle: { fontSize: 12, marginTop: 2 },

  list: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8 },
  empty: { alignItems: 'center', marginTop: 32 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  emptyTxt: { fontSize: 13 },

  row: { width: '100%', marginVertical: 4 },
  start: { alignItems: 'flex-start' },
  end: { alignItems: 'flex-end' },

  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
  },
  msg: { fontSize: 16, lineHeight: 22 },
  time: { fontSize: 11, marginTop: 4 },

  inputBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 8 : 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 140,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 10,
    fontSize: 16,
  },
  send: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  sendTxt: { color: '#fff', fontWeight: '700' },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  loadingTxt: { fontSize: 12 },
});
