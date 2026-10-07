export const vibes = [
  {
    id: 'midnight',
    nome: 'Midnight',
    icon: 'moon',
    frase: 'This feels like a 1:37 AM drive through the city.',
    cores: ['#312E81', '#1E1B4B'],
    accent: '#818CF8',
  },
  {
    id: 'nostalgic',
    nome: 'Nostalgic',
    icon: 'heart-dislike',
    frase: 'This feels like an old memory you keep replaying.',
    cores: ['#9D174D', '#4C1D3D'],
    accent: '#F472B6',
  },
  {
    id: 'summer',
    nome: 'Summer',
    icon: 'sunny',
    frase: 'This feels like golden hour with the windows down.',
    cores: ['#F97316', '#9A3412'],
    accent: '#FDBA74',
  },
  {
    id: 'dark',
    nome: 'Dark',
    icon: 'skull',
    frase: 'This feels like walking alone after midnight.',
    cores: ['#3F3F46', '#18181B'],
    accent: '#A1A1AA',
  },
  {
    id: 'drive',
    nome: 'Late Night Drive',
    icon: 'car-sport',
    frase: 'This feels like empty roads and neon lights.',
    cores: ['#0E7490', '#164E63'],
    accent: '#22D3EE',
  },
];

export const getVibeById = (id) => vibes.find((v) => v.id === id);
export const getRandomVibe = () => vibes[Math.floor(Math.random() * vibes.length)];