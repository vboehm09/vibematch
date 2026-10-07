import { Platform } from 'react-native';

// No navegador (Expo Web) o servidor está em localhost.
// No celular, troque pelo IP do seu PC (veja abaixo).
const HOST = Platform.OS === 'web' ? 'localhost' : '192.168.86.26';

export const API_URL = `http://${HOST}:3000`;

export async function fetchMusic(vibeId) {
  const res = await fetch(`${API_URL}/api/music?vibe=${vibeId}`);
  if (!res.ok) throw new Error(`Servidor respondeu ${res.status}`);
  return res.json();
}