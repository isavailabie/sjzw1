import { create } from 'zustand';
import { ShapeType } from './types';

interface AppState {
  currentShape: ShapeType;
  setShape: (shape: ShapeType) => void;
  nextShape: () => void;
  handFactor: number;
  setHandFactor: (factor: number) => void;
  showUI: boolean;
  toggleUI: () => void;
}

// Order: Text -> Heart -> Snow -> Fireworks -> Rabbit -> Rose -> (Loop)
const SHAPE_ORDER = [
  ShapeType.TEXT,
  ShapeType.HEART,
  ShapeType.SNOW,
  ShapeType.FIREWORKS,
  ShapeType.RABBIT,
  ShapeType.ROSE
];

export const useStore = create<AppState>((set) => ({
  currentShape: ShapeType.TEXT,
  setShape: (shape) => set({ currentShape: shape }),
  nextShape: () => set((state) => {
    const currentIndex = SHAPE_ORDER.indexOf(state.currentShape);
    const nextIndex = (currentIndex + 1) % SHAPE_ORDER.length;
    return { currentShape: SHAPE_ORDER[nextIndex] };
  }),
  handFactor: 1,
  setHandFactor: (factor) => set({ handFactor: factor }),
  showUI: true,
  toggleUI: () => set((state) => ({ showUI: !state.showUI })),
}));