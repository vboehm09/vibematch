import { vibes } from './vibes.js';

export async function analyzePhoto(imageBase64, mimeType = 'image/jpeg') {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  if (!apiKey) throw new Error('GEMINI_API_KEY ausente no .env');

  // remove o prefixo "data:image/...;base64," se vier
  const data = imageBase64.replace(/^data:.*?;base64,/, '');

  const lista = Object.entries(vibes)
    .map(([id, v]) => `- ${id}: ${v.descricao}`)
    .join('\n');

  const prompt = `You are the "vibe reader" of a music app. Look at the photo and choose the ONE vibe that fits it best.

Valid vibes (use the id exactly as written):
${lista}

Consider lighting, colors, time of day, setting and general mood.
Do not identify any person in the photo.

Reply ONLY with JSON in this exact shape:
{"vibe": "<one of the ids above>", "match": <integer from 70 to 99>, "frase": "<one poetic sentence in English, max 14 words, starting with 'This feels like'>"}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data } },
            ],
          },
        ],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.6 },
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini respondeu ${res.status}: ${body.slice(0, 200)}`);
  }

  const json = await res.json();
  const text =
    json.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') ?? '';

  return parseResult(text);
}

// A IA às vezes erra o formato, então validamos tudo
function parseResult(text) {
  const clean = text.replace(/```json|```/g, '').trim();

  let obj;
  try {
    obj = JSON.parse(clean);
  } catch {
    throw new Error('A IA não devolveu um JSON válido');
  }

  if (!vibes[obj.vibe]) throw new Error(`Vibe desconhecida: ${obj.vibe}`);

  const match = Math.min(99, Math.max(60, Math.round(Number(obj.match)) || 85));
  const frase =
    typeof obj.frase === 'string' && obj.frase.trim() ? obj.frase.trim() : null;

  return { vibe: obj.vibe, match, frase };
}