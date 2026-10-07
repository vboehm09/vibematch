import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'vibematch:favorites';

export async function getFavorites() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function isFavorite(id) {
  const list = await getFavorites();
  return list.some((t) => t.id === id);
}

// adiciona se não existir, remove se existir. Devolve true se ficou favoritada
export async function toggleFavorite(track, vibeId) {
  const list = await getFavorites();
  const exists = list.some((t) => t.id === track.id);

  const next = exists
    ? list.filter((t) => t.id !== track.id)
    : [{ ...track, vibeId, savedAt: Date.now() }, ...list];

  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return !exists;
}

export async function removeFavorite(id) {
  const list = await getFavorites();
  await AsyncStorage.setItem(KEY, JSON.stringify(list.filter((t) => t.id !== id)));
}