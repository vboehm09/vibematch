import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  Linking,
  Share,
  ActivityIndicator,
  Animated,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
} from 'expo-audio';
import MatchMeter from '../components/MatchMeter';
import { getVibeById } from '../data/vibes';
import { fetchMusic } from '../services/api';
import { isFavorite, toggleFavorite } from '../services/favorites';
import { theme } from '../theme';

export default function ResultScreen({ navigation, route }) {
  const { vibeId, photoUri } = route.params;
  const vibe = getVibeById(vibeId);
  const { width } = useWindowDimensions();
  const coverSize = Math.min(width - 96, 280);

  const [track, setTrack] = useState(route.params.track);
  const [match] = useState(() => 80 + Math.floor(Math.random() * 20));
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ---------- áudio ----------
  // precisa vir ANTES do efeito que dá play
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
  }, []);

  const player = useAudioPlayer(track.previewUrl ?? null);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    if (track.previewUrl) player.play();
  }, [player]);

  const progress = status.duration > 0 ? status.currentTime / status.duration : 0;
  const hasPreview = !!track.previewUrl;

  const togglePlay = () => {
    if (status.playing) {
      player.pause();
    } else {
      if (status.duration > 0 && status.currentTime >= status.duration - 0.2) {
        player.seekTo(0);
      }
      player.play();
    }
  };

  // ---------- favoritos ----------
  // checa se a música atual já é favorita (ao abrir e a cada troca)
  useEffect(() => {
    isFavorite(track.id).then(setLiked);
  }, [track.id]);

  const onLike = async () => {
    const nowLiked = await toggleFavorite(track, vibeId);
    setLiked(nowLiked);
  };

  // ---------- animação da capa ----------
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, [track.id]);

  // ---------- ações ----------
  const openSpotify = () => {
    if (hasPreview) player.pause();
    Linking.openURL(track.spotifyUrl);
  };

  const share = () =>
    Share.share({
      message: `Minha vibe é ${vibe.nome} (${match}% match): ${track.track} - ${track.artist}\n${track.spotifyUrl}`,
    });

  const nextTrack = async () => {
    setLoading(true);
    setError('');
    if (hasPreview) player.pause();
    try {
      let next = await fetchMusic(vibeId);
      for (let i = 0; i < 3 && next.id === track.id; i++) {
        next = await fetchMusic(vibeId);
      }
      setTrack(next); // o efeito de favoritos atualiza o coração sozinho
    } catch (err) {
      setError('Não consegui buscar outra música.');
    } finally {
      setLoading(false);
    }
  };

  const actions = [
    {
      icon: hasPreview ? (status.playing ? 'pause' : 'play') : 'open-outline',
      label: hasPreview ? (status.playing ? 'Pausar' : 'Tocar') : 'Spotify',
      onPress: hasPreview ? togglePlay : openSpotify,
    },
    {
      icon: liked ? 'heart' : 'heart-outline',
      label: 'Favoritar',
      onPress: onLike,
      color: liked ? vibe.accent : theme.colors.text,
    },
    { icon: 'refresh', label: 'Outra', onPress: nextTrack },
    { icon: 'share-social-outline', label: 'Enviar', onPress: share },
  ];

  return (
    <LinearGradient
      colors={[vibe.cores[0], vibe.cores[1], theme.colors.background]}
      locations={[0, 0.45, 1]}
      style={styles.container}
    >
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.vibeLabel}>YOUR VIBE</Text>
          <Text style={styles.vibe}>{vibe.nome}</Text>
          <MatchMeter value={match} style={[styles.match, { color: vibe.accent }]} />
        </View>
        {photoUri && <Image source={{ uri: photoUri }} style={styles.photo} />}
      </View>

      <Text style={styles.phrase}>{vibe.frase}</Text>

      {/* Capa grande */}
      <View style={styles.center}>
        {loading ? (
          <View style={[styles.coverWrap, { width: coverSize, height: coverSize }]}>
            <ActivityIndicator size="large" color={vibe.accent} />
          </View>
        ) : (
          <Animated.View
            style={[
              styles.coverWrap,
              {
                width: coverSize,
                height: coverSize,
                opacity: fade,
                transform: [
                  { scale: fade.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) },
                ],
              },
            ]}
          >
            {track.cover ? (
              <Image source={{ uri: track.cover }} style={styles.cover} />
            ) : (
              <Ionicons name="musical-notes" size={64} color={vibe.accent} />
            )}
          </Animated.View>
        )}

        {!loading && (
          <>
            <Text style={styles.track} numberOfLines={2}>{track.track}</Text>
            <Text style={styles.artist} numberOfLines={1}>{track.artist}</Text>

            {hasPreview && (
              <View style={[styles.progressTrack, { width: coverSize }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progress * 100}%`, backgroundColor: vibe.accent },
                  ]}
                />
              </View>
            )}

            {hasPreview && (
              <Pressable style={styles.spotifyLink} onPress={openSpotify}>
                <Ionicons name="open-outline" size={14} color={theme.colors.textMuted} />
                <Text style={styles.spotifyText}>Abrir no Spotify</Text>
              </Pressable>
            )}
          </>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      {/* Barra de ações com blur */}
      <BlurView intensity={40} tint="dark" style={styles.actionsBar}>
        {actions.map((a) => (
          <Pressable key={a.label} style={styles.action} onPress={a.onPress}>
            <Ionicons name={a.icon} size={26} color={a.color ?? theme.colors.text} />
            <Text style={styles.actionText}>{a.label}</Text>
          </Pressable>
        ))}
      </BlurView>

      <Pressable onPress={() => navigation.popToTop()}>
        <Text style={styles.back}>Voltar ao início</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 64,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  vibeLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    letterSpacing: 2,
  },
  vibe: { color: theme.colors.text, fontSize: 32, fontWeight: '800' },
  match: { fontSize: 18, fontWeight: '800', letterSpacing: 1 },
  photo: { width: 56, height: 56, borderRadius: 28 },
  phrase: {
    color: theme.colors.textMuted,
    fontStyle: 'italic',
    marginTop: theme.spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  coverWrap: {
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 16,
  },
  cover: { width: '100%', height: '100%', borderRadius: theme.radius.lg },
  track: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  artist: { color: theme.colors.textMuted, fontSize: 16 },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: theme.spacing.sm,
    overflow: 'hidden',
  },
  progressFill: { height: '100%' },
  spotifyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  spotifyText: { color: theme.colors.textMuted, fontSize: 12 },
  error: { color: '#F87171', textAlign: 'center' },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  action: { alignItems: 'center', gap: 4, flex: 1 },
  actionText: { color: theme.colors.text, fontSize: 11 },
  back: {
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
});