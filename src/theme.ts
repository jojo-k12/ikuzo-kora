export const FPS = 60;

// Scene start frames (60fps).
export const T = {
  cold: 0, // 0.0s  cold open
  clash: 90, // 1.5s  split-screen clash
  jojo: 210, // 3.5s  boss card: Jojo
  sevas: 330, // 5.5s  boss card: Sevas
  heat: 450, // 7.5s  heat mode finale
  logo: 600, // 10.0s logo slam
  end: 720, // 12.0s
};

export const C = {
  teal: '#22d7ea',
  tealMid: '#118aa3',
  tealDeep: '#06303d',
  magenta: '#ff3fae',
  crimson: '#c2185b',
  pinkDeep: '#2c0718',
  silver: '#cfd3d8',
  white: '#f6f6f2',
  ink: '#050505',
  red: '#d4142f',
};

export type Side = 'blue' | 'pink';
export const sideColor = (s: Side) => (s === 'blue' ? C.teal : C.magenta);
export const sideDeep = (s: Side) => (s === 'blue' ? C.tealDeep : C.pinkDeep);
