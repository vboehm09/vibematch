import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { fetchMusic } from '../services/api';
import { theme } from '../theme';

export default function AnalyzingScreen({ navigation, route }) {
  const { vibeId, photoUri } = route.params;
  const [message, setMessage] = useState('Reading the vibe...');
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const t1 = setTimeout(() => setMessage('Finding your sound...'), 1500);
    const minWait = new Promise((resolve) => setTimeout(resolve, 3000));

    Promise.all([fetchMusic(vibeId), minWait])
      .then(([track]) => {
        if (!cancelled) navigation.replace('Result', { vibeId, photoUri, track });
      })
      .catch((err) => {
        console.log('Erro ao buscar música:', err.message);
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
      clearTimeout(t1);
    };
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Não consegui achar sua música</Text>
        <Text style={styles.sub}>Confira se o servidor está rodando.</Text>
        <Pressable style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  text: { color: theme.colors.text, fontSize: 20, fontWeight: '600', textAlign: 'center' },
  sub: { color: theme.colors.textMuted, textAlign: 'center' },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.sm,
  },
  buttonText: { color: theme.colors.text, fontWeight: '700' },
});