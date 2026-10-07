import { useState, useCallback } from 'react';
import { View, Text, FlatList, Image, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getFavorites, removeFavorite } from '../services/favorites';
import { getVibeById } from '../data/vibes';
import { theme } from '../theme';

export default function FavoritesScreen({ navigation }) {
  const [items, setItems] = useState([]);

  // recarrega toda vez que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      getFavorites().then(setItems);
    }, [])
  );

  const remove = async (id) => {
    await removeFavorite(id);
    setItems((prev) => prev.filter((t) => t.id !== id));
  };

  const open = (item) =>
    navigation.navigate('Result', { vibeId: item.vibeId, track: item });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.title}>Favoritos</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: theme.spacing.sm, paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={48} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>Nenhuma música favoritada ainda</Text>
          </View>
        }
        renderItem={({ item }) => {
          const vibe = getVibeById(item.vibeId);
          return (
            <Pressable style={styles.row} onPress={() => open(item)}>
              {item.cover ? (
                <Image source={{ uri: item.cover }} style={styles.cover} />
              ) : (
                <View style={[styles.cover, styles.coverEmpty]}>
                  <Ionicons name="musical-notes" size={24} color={theme.colors.primary} />
                </View>
              )}

              <View style={{ flex: 1 }}>
                <Text style={styles.track} numberOfLines={1}>{item.track}</Text>
                <Text style={styles.artist} numberOfLines={1}>{item.artist}</Text>
                {vibe && (
                  <View style={styles.vibeTag}>
                    <Ionicons name={vibe.icon} size={12} color={vibe.accent} />
                    <Text style={[styles.vibeText, { color: vibe.accent }]}>{vibe.nome}</Text>
                  </View>
                )}
              </View>

              <Pressable onPress={() => remove(item.id)} hitSlop={12}>
                <Ionicons name="heart" size={24} color={vibe?.accent ?? theme.colors.primary} />
              </Pressable>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 64,
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  title: { color: theme.colors.text, fontSize: 30, fontWeight: '800' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  cover: { width: 64, height: 64, borderRadius: 12 },
  coverEmpty: { alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background },
  track: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  artist: { color: theme.colors.textMuted, fontSize: 14 },
  vibeTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  vibeText: { fontSize: 12, fontWeight: '600' },
  empty: { alignItems: 'center', gap: theme.spacing.sm, marginTop: 80 },
  emptyText: { color: theme.colors.textMuted },
});