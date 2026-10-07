import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { vibes } from './vibes.js';
import { analyzePhoto } from './ai.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // fotos em base64 são grandes

// ---------- Token do Spotify (com cache) ----------
let cachedToken = null;
let tokenExpiresAt = 0;

async function getSpotifyToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

  const basic = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) throw new Error(`Erro ao pegar token: ${res.status}`);

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000; // 60s de folga
  return cachedToken;
}

// ---------- Prévia de 30s (iTunes) ----------
async function getPreview(track, artist) {
  try {
    const mainArtist = artist.split(',')[0].trim().toLowerCase();
    const term = encodeURIComponent(`${track} ${mainArtist}`);
    const r = await fetch(
      `https://itunes.apple.com/search?term=${term}&media=music&entity=song&limit=5`
    );
    if (!r.ok) return null;
    const data = await r.json();

    // tira "(feat. ...)" e "[...]" pra comparar só o nome
    const clean = (s) => s.toLowerCase().replace(/\(.*?\)|\[.*?\]/g, '').trim();

    const match = data.results.find(
      (x) =>
        clean(x.trackName) === clean(track) &&
        x.artistName.toLowerCase().includes(mainArtist)
    );
    return match?.previewUrl ?? null;
  } catch {
    return null;
  }
}

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ---------- Rota: música por vibe ----------
app.get('/api/music', async (req, res) => {
  try {
    const vibe = vibes[req.query.vibe];
    if (!vibe) return res.status(400).json({ error: 'Vibe inválida' });

    const token = await getSpotifyToken();
    const query = random(vibe.buscas);
    const offset = Math.floor(Math.random() * 30); // variedade

    const url =
      'https://api.spotify.com/v1/search' +
      `?q=${encodeURIComponent(query)}&type=track&limit=10&offset=${offset}`;

    const spotifyRes = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!spotifyRes.ok) {
      console.log('Spotify respondeu:', spotifyRes.status, await spotifyRes.text());
      return res.status(502).json({ error: `Spotify respondeu ${spotifyRes.status}` });
    }

    const data = await spotifyRes.json();
    const items = data.tracks?.items ?? [];
    if (items.length === 0) return res.status(404).json({ error: 'Nenhuma música' });

    // embaralha e pega a primeira que tenha prévia (testa no máximo 4)
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    let chosen = null;

    for (const t of shuffled.slice(0, 4)) {
      const artist = t.artists.map((a) => a.name).join(', ');
      const previewUrl = await getPreview(t.name, artist);
      if (previewUrl) {
        chosen = { t, artist, previewUrl };
        break;
      }
    }

    // se nenhuma tiver prévia, devolve a primeira mesmo assim
    if (!chosen) {
      const t = shuffled[0];
      chosen = {
        t,
        artist: t.artists.map((a) => a.name).join(', '),
        previewUrl: null,
      };
    }

    const { t, artist, previewUrl } = chosen;
    res.json({
      id: t.id,
      track: t.name,
      artist,
      cover: t.album.images?.[0]?.url ?? null,
      spotifyUrl: t.external_urls.spotify,
      previewUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ---------- Rota: análise da foto (IA) ----------
app.post('/api/analyze-photo', async (req, res) => {
  try {
    const { image, mimeType } = req.body;
    if (!image) return res.status(400).json({ error: 'Sem imagem' });

    const result = await analyzePhoto(image, mimeType || 'image/jpeg');
    res.json(result);
  } catch (err) {
    console.error('Erro na análise:', err.message);
    res.status(502).json({ error: 'Falha na análise' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor em http://localhost:${PORT}`));