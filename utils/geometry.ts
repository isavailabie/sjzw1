import * as THREE from 'three';
import { ShapeType } from '../types';

const COUNT = 15000;
const CANVAS_SIZE = 1024;

// --- Constants for Counts ---
const FW_BURST_1 = 4000;
const FW_BURST_2 = 2500;
const FW_BURST_3 = 2500;
// Remaining ~6000 for background

const ROSE_MAIN = 11000; 

// --- Helper Functions ---

const randomOnSphere = (radius: number) => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.sin(phi) * Math.sin(theta);
  const z = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

// --- Geometry Generators ---

// 1. Text Generation
const generateTextPoints = (text: string): THREE.Vector3[] => {
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  
  ctx.font = 'bold 180px "Noto Serif SC", "SimSun", serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, CANVAS_SIZE / 2, CANVAS_SIZE / 2);

  const imageData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  const data = imageData.data;
  const points: THREE.Vector3[] = [];

  const step = 4;
  for(let y = 0; y < CANVAS_SIZE; y+=step) {
    for(let x = 0; x < CANVAS_SIZE; x+=step) {
      const index = (y * CANVAS_SIZE + x) * 4;
      if (data[index] > 128) {
         points.push(new THREE.Vector3(
           (x - CANVAS_SIZE / 2) * 0.05,
           -(y - CANVAS_SIZE / 2) * 0.05, 
           0
         ));
      }
    }
  }

  const finalPoints: THREE.Vector3[] = [];
  for (let i = 0; i < COUNT; i++) {
    if (i < points.length) finalPoints.push(points[i]);
    else finalPoints.push(points[i % points.length]);
  }
  return finalPoints;
};

// 2. Heart
const generateHeartPoints = (): THREE.Vector3[] => {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < COUNT; i++) {
    const t = (i / COUNT) * Math.PI * 2 * 10;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    const layer = Math.floor(Math.random() * 3);
    const scale = 1.0 - (layer * 0.1);
    const z = (Math.random() - 0.5) * 2; 
    points.push(new THREE.Vector3(x * scale * 0.8, y * scale * 0.8, z));
  }
  return points;
};

// 3. Fireworks
const generateFireworksPoints = (): THREE.Vector3[] => {
  const points: THREE.Vector3[] = [];
  
  const createBurst = (cx: number, cy: number, cz: number, count: number, scale: number) => {
    const numTrails = 40;
    const ptsPerTrail = Math.floor(count / numTrails);
    
    for (let t = 0; t < numTrails; t++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const len = (12 + Math.random() * 8) * scale;
      
      const dir = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.sin(phi) * Math.sin(theta),
        Math.cos(phi)
      );

      for (let i = 0; i < ptsPerTrail; i++) {
        const progress = i / ptsPerTrail;
        const dist = Math.pow(progress, 0.8) * len; 
        const p = dir.clone().multiplyScalar(dist);
        p.y -= Math.pow(progress, 2) * (8 * scale); 
        p.add(new THREE.Vector3(cx, cy, cz));
        points.push(p);
      }
    }
  };

  // 1. Main Burst
  createBurst(0, 10, 0, FW_BURST_1, 1.2);
  // 2. Sub Burst
  createBurst(-20, -5, -5, FW_BURST_2, 0.8);
  // 3. Sub Burst
  createBurst(20, -2, 5, FW_BURST_3, 0.7);

  // 4. Background Particles
  while(points.length < COUNT) {
     points.push(new THREE.Vector3(
       (Math.random() - 0.5) * 120,
       (Math.random() - 0.5) * 120,
       (Math.random() - 0.5) * 80
     ));
  }
  
  return points.slice(0, COUNT);
};

// 4. Rabbit - Cartoon Simple Line Drawing
const generateRabbitPoints = (): THREE.Vector3[] => {
  const points: THREE.Vector3[] = [];
  
  // Helper for drawing lines
  const drawLine = (
    pathFunc: (t: number) => {x:number, y:number}, 
    startT: number, 
    endT: number, 
    density: number
  ) => {
    const num = density;
    for(let i=0; i<num; i++) {
      const t = startT + (i/num) * (endT - startT);
      const pos = pathFunc(t);
      // Very slight jitter for hand-drawn look
      const jitter = 0.05;
      points.push(new THREE.Vector3(
        pos.x + (Math.random()-0.5)*jitter, 
        pos.y + (Math.random()-0.5)*jitter, 
        0
      ));
    }
  };

  // 1. Head (Simple Circle)
  // Center approx (-2, 4)
  drawLine((t) => ({
    x: -3 + 2.5 * Math.cos(t),
    y: 3 + 2.5 * Math.sin(t)
  }), 0, Math.PI * 2, 2500);

  // 2. Ear (Long Drooping Loop)
  // Starts high on head, drops down long
  drawLine((t) => ({
    x: -3.5 + 1.2 * Math.cos(t), 
    y: 2.0 + 3.5 * Math.sin(t)
  }), Math.PI * 0.1, Math.PI * 2.9, 2500);

  // 3. Body (Round Bean Shape)
  // Back curve
  drawLine((t) => ({
    x: -2 + t * 7, 
    y: 1 + Math.sin(t * Math.PI) * 1.5
  }), 0, 1, 2000);
  
  // Belly curve
  drawLine((t) => ({
    x: -2 + t * 7, 
    y: 1 - Math.sin(t * Math.PI) * 1.0 - 2
  }), 0.1, 0.9, 1500);

  // 4. Tail (Small puff)
  drawLine((t) => ({
    x: 5.5 + 0.8 * Math.cos(t),
    y: 0 + 0.8 * Math.sin(t)
  }), 0, Math.PI * 2, 800);

  // 5. Front Paw (Stick)
  drawLine((t) => ({
    x: -2,
    y: -1 - t
  }), 0, 1.5, 600);

  // 6. Back Paw (Stick)
  drawLine((t) => ({
    x: 4,
    y: -1 - t
  }), 0, 1.5, 600);

  // 7. Eye (Small filled circle)
  for(let i=0; i<200; i++) {
     const r = Math.random() * 0.3;
     const ang = Math.random() * Math.PI * 2;
     points.push(new THREE.Vector3(-2.2 + Math.cos(ang)*r, 4 + Math.sin(ang)*r, 0));
  }

  // Aura Particles (Yellow/Orange/White)
  while(points.length < COUNT) {
     const r = 8 + Math.random() * 20;
     const theta = Math.random() * Math.PI * 2;
     const x = Math.cos(theta) * r;
     const y = Math.sin(theta) * r;
     points.push(new THREE.Vector3(x, y, (Math.random()-0.5) * 20));
  }

  return points.slice(0, COUNT);
};

// 5. Snow
const generateSnowPoints = (): THREE.Vector3[] => {
  const points: THREE.Vector3[] = [];
  
  // 1. Medium Flakes (Crystal shapes)
  const numFlakes = 15;
  const ptsPerFlake = 200;
  
  for (let f=0; f<numFlakes; f++) {
     const cx = (Math.random() - 0.5) * 90;
     const cy = (Math.random() - 0.5) * 70;
     const cz = (Math.random() - 0.5) * 50;
     const scale = 2 + Math.random() * 2;
     
     for(let i=0; i<ptsPerFlake; i++) {
        const branchIdx = Math.floor(Math.random() * 6);
        const angle = (branchIdx / 6) * Math.PI * 2;
        const dist = Math.random() * scale;
        
        let px = Math.cos(angle) * dist;
        let py = Math.sin(angle) * dist;
        
        // Add distinct crystal shape details
        if (Math.random() > 0.6) {
           const featherLen = (scale - dist) * 0.6;
           const featherAngle = angle + Math.PI/3; 
           px += Math.cos(featherAngle) * (Math.random() * featherLen);
           py += Math.sin(featherAngle) * (Math.random() * featherLen);
        }
        points.push(new THREE.Vector3(cx + px, cy + py, cz));
     }
  }

  // 2. Ambient Snow Dust
  while(points.length < COUNT) {
    points.push(new THREE.Vector3(
      (Math.random() - 0.5) * 150,
      (Math.random() - 0.5) * 150,
      (Math.random() - 0.5) * 80
    ));
  }
  return points.slice(0, COUNT);
};

// 6. Rose
const generateRosePoints = (): THREE.Vector3[] => {
  const points: THREE.Vector3[] = [];
  const structCount = ROSE_MAIN;
  
  const budCount = 2000;
  for(let i=0; i<budCount; i++) {
     const t = (i/budCount) * Math.PI * 10; 
     const r = 0.1 * t;
     const z = i/budCount * 5;
     points.push(new THREE.Vector3(Math.cos(t)*r, Math.sin(t)*r - 5, z));
  }
  
  const petalLayers = 8;
  const ptsPerLayer = Math.floor((structCount - budCount - 1000) / petalLayers);
  
  for(let L=0; L<petalLayers; L++) {
      const layerRadius = 3 + L * 1.5;
      const layerHeight = 5 - L * 0.8;
      const petalsInLayer = 3 + (L % 3); 
      
      for(let p=0; p<ptsPerLayer; p++) {
          const t = (p/ptsPerLayer) * Math.PI * 2;
          const r = layerRadius + 1.5 * Math.sin(petalsInLayer * t);
          const z = layerHeight + 2 * Math.cos(petalsInLayer * t);
          const x = r * Math.cos(t + L);
          const y = r * Math.sin(t + L);
          points.push(new THREE.Vector3(x, y - 5, z));
      }
  }
  
  while(points.length < structCount) {
      const t = Math.random();
      points.push(new THREE.Vector3(
          Math.sin(t * 5) * 0.5,
          -5 - (t * 20), 
          0
      ));
  }

  while(points.length < COUNT) {
     const p = randomOnSphere(12 + Math.random() * 8);
     p.y -= 5;
     points.push(p);
  }

  return points.slice(0, COUNT);
};

export const getPointsForShape = (shape: ShapeType): Float32Array => {
  let vectors: THREE.Vector3[] = [];

  switch (shape) {
    case ShapeType.TEXT: vectors = generateTextPoints('世界之外'); break;
    case ShapeType.HEART: vectors = generateHeartPoints(); break;
    case ShapeType.SNOW: vectors = generateSnowPoints(); break;
    case ShapeType.FIREWORKS: vectors = generateFireworksPoints(); break;
    case ShapeType.RABBIT: vectors = generateRabbitPoints(); break;
    case ShapeType.ROSE: vectors = generateRosePoints(); break;
    default: vectors = generateTextPoints('Error');
  }

  const positions = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    const v = vectors[i] || new THREE.Vector3();
    positions[i * 3] = v.x;
    positions[i * 3 + 1] = v.y;
    positions[i * 3 + 2] = v.z;
  }
  return positions;
};

export const getColorsForShape = (shape: ShapeType): Float32Array => {
  const colors = new Float32Array(COUNT * 3);
  const color = new THREE.Color();
  
  for (let i = 0; i < COUNT; i++) {
    const lightnessVar = (Math.random() - 0.5) * 0.2;
    
    switch (shape) {
      case ShapeType.TEXT:
        color.setHSL(0.6, 0.05, 0.9 + lightnessVar); 
        break;
      case ShapeType.HEART:
        color.setHSL(0.98, 0.9, 0.5 + lightnessVar); 
        break;
      
      case ShapeType.FIREWORKS:
        if (i < FW_BURST_1) {
            color.setHSL(0.0, 1.0, 0.6 + lightnessVar); // Red
        } else if (i < FW_BURST_1 + FW_BURST_2) {
            color.setHSL(0.5, 1.0, 0.6 + lightnessVar); // Cyan
        } else if (i < FW_BURST_1 + FW_BURST_2 + FW_BURST_3) {
            color.setHSL(0.8, 1.0, 0.6 + lightnessVar); // Purple
        } else {
            color.setHSL(Math.random(), 0.8, 0.8);
        }
        break;

      case ShapeType.RABBIT:
        // The Rabbit structure is roughly ~10700 points for the drawing, the rest is aura.
        // We use a cutoff of 11000 to be safe.
        if (i < 11000) { 
           // Simple Green Line Drawing
           color.setHex(0x55cc55); 
        } else {
           // Background Aura: Yellow, Orange, White
           const rand = Math.random();
           if (rand < 0.4) color.setHex(0xffaa00); // Orange
           else if (rand < 0.7) color.setHex(0xffff00); // Yellow
           else color.setHex(0xffffff); // White
        }
        break;

      case ShapeType.SNOW:
        color.setHSL(0.6, 0.2, 0.95 + lightnessVar); 
        break;

      case ShapeType.ROSE:
        if (i < ROSE_MAIN) {
             color.setHex(0xffffff); // White Rose
        } else {
             if (Math.random() > 0.5) color.setHex(0xffffff); 
             else color.setHex(0xaa44ff); // Purple/White aura
        }
        break;
    }
    
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  return colors;
};