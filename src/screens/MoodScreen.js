import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { vibes } from '../data/vibes';
import { theme } from '../theme';

export default function MoodScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How are you feeling?</Text>

      <View style={styles.grid}>
        {vibes.map((v) => (
          <Pressable
            key={v.id}
            style={styles.card}
            onPress={() => navigation.navigate('Analyzing', { vibeId: v.id })}
          >
            <Ionicons name={v.icon} size={32} color={theme.colors.primary} />
            <Text style={styles.cardText}>{v.nome}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    paddingTop: 80,
  },
  title: {
    color: theme.colors.text,
    fontSize: 30,
    fontWeight: '800',
    marginBottom: theme.spacing.lg,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
  card: {
    width: '47%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  cardText: { color: theme.colors.text, fontWeight: '600' },
});