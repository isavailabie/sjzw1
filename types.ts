export enum ShapeType {
  TEXT = 'TEXT',
  HEART = 'HEART',
  FIREWORKS = 'FIREWORKS',
  RABBIT = 'RABBIT',
  SNOW = 'SNOW',
  ROSE = 'ROSE'
}

export interface ParticleData {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
}

export interface HandState {
  isDetected: boolean;
  gestureScale: number; // 1.0 is neutral, <1 pinch/close, >1 spread/open
  handCentroid: [number, number, number];
}
