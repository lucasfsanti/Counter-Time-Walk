export const colorPalettes = [
  { border: 'var(--color-yellow-energy)', text: 'var(--color-yellow-energy)', accent: 'var(--color-yellow-energy)' }, // default: yellow energy
  { border: '#0f766e', text: '#134e4a', accent: '#5eead4' }, // teal
  { border: '#9d174d', text: '#831843', accent: '#f472b6' }, // rose
  { border: '#166534', text: '#14532d', accent: '#86efac' }, // green
  { border: '#9a3412', text: '#7c2d12', accent: '#fdba74' }, // orange
  { border: '#3730a3', text: '#312e81', accent: '#a5b4fc' }, // indigo
];

export function getColorPalette(index) {
  return colorPalettes[index % colorPalettes.length];
}
