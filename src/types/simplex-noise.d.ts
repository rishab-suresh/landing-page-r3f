declare module 'simplex-noise' {
  export function createNoise2D(): (x: number, y: number) => number;
  export function createNoise3D(): (x: number, y: number, z: number) => number;
  export function createNoise4D(): (x: number, y: number, z: number, w: number) => number;
}
