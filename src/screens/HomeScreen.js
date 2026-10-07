import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getRandomVibe } from '../data/vibes';
import { theme } from '../theme';

export default function HomeScreen({ navigation }) {
  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permissão negada', 'Precisamos da galeria para escolher a foto.');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.5,
    });
    if (res.canceled) return;

    // por enquanto a vibe é sorteada; a IA entra depois
    navigation.navigate('Analyzing', {
      photoUri: res.assets[0].uri,
      vibeId: getRandomVibe().id,
    });
  };

  const goToMood = () => navigation.navigate('Mood');

  const goLucky = () =>
    navigation.navigate('Analyzing', { vibeId: getRandomVibe().id });

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>VibeMatch</Text>
      <Text style={styles.title}>What's your vibe?</Text>

      <Pressable style={styles.button} onPress={pickPhoto}>
        <Ionicons name="camera" size={22} color={theme.colors.text} />
        <Text style={styles.buttonText}>Escolher uma foto</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={goToMood}>
        <Ionicons name="happy" size={22} color={theme.colors.text} />
        <Text style={styles.buttonText}>Escolher um mood</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={goLucky}>
        <Ionicons name="dice" size={22} color={theme.colors.text} />
        <Text style={styles.buttonText}>I'm feeling lucky</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => navigation.navigate('Favorites')}>
        <Ionicons name="heart" size={22} color={theme.colors.text} />
        <Text style={styles.buttonText}>Meus favoritos</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  logo: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.text,
    fontSize: 36,
    fontWeight: '800',
    marginBottom: theme.spacing.lg,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});