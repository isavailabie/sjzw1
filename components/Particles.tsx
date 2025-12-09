import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';
import { getPointsForShape, getColorsForShape } from '../utils/geometry';

// Shader Material
const ParticleMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uSize: { value: 1.8 }, // Reduced slightly for sharper lines
  },
  vertexShader: `
    uniform float uTime;
    uniform float uPixelRatio;
    uniform float uSize;
    attribute float aSize;
    attribute vec3 aColor;
    varying vec3 vColor;

    void main() {
      vColor = aColor;
      vec3 pos = position;
      
      // Subtle organic movement
      pos.x += sin(uTime * 0.5 + pos.y * 0.2) * 0.03;
      pos.y += cos(uTime * 0.3 + pos.x * 0.2) * 0.03;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Size attenuation
      gl_PointSize = uSize * aSize * uPixelRatio * (80.0 / -mvPosition.z);
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    
    void main() {
      vec2 xy = gl_PointCoord.xy - vec2(0.5);
      float ll = length(xy);
      if(ll > 0.5) discard;
      
      // Sharper dot for "line drawing" feel
      float strength = smoothstep(0.5, 0.3, ll);
      gl_FragColor = vec4(vColor, strength);
    }
  `,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending
});

const Particles: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const currentShape = useStore((state) => state.currentShape);
  const handFactor = useStore((state) => state.handFactor);

  // Buffer geometries
  const { positions, colors, randomSizes, geometry } = useMemo(() => {
    // Initialize with Text
    const initialPos = getPointsForShape(currentShape);
    const initialCol = getColorsForShape(currentShape);
    const count = initialPos.length / 3;
    
    const sizes = new Float32Array(count);
    // Less size variation for consistent line width
    for(let i=0; i<count; i++) sizes[i] = 0.5 + Math.random() * 0.5;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(initialPos, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(initialCol, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    
    geo.userData = {
      currentPos: Float32Array.from(initialPos),
      targetPos: Float32Array.from(initialPos),
      currentCol: Float32Array.from(initialCol),
      targetCol: Float32Array.from(initialCol),
    };

    return { 
      positions: initialPos, 
      colors: initialCol,
      randomSizes: sizes,
      geometry: geo
    };
  }, []); 

  // Update targets when shape changes
  useEffect(() => {
    if (!pointsRef.current) return;
    
    const targetPos = getPointsForShape(currentShape);
    const targetCol = getColorsForShape(currentShape);
    
    pointsRef.current.geometry.userData.targetPos = targetPos;
    pointsRef.current.geometry.userData.targetCol = targetCol;
  }, [currentShape]);

  useFrame((state) => {
    const { clock } = state;
    if (!pointsRef.current) return;

    const geo = pointsRef.current.geometry;
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const colAttr = geo.attributes.aColor as THREE.BufferAttribute;
    
    const currentPos = geo.userData.currentPos;
    const targetPos = geo.userData.targetPos;
    const currentCol = geo.userData.currentCol;
    const targetCol = geo.userData.targetCol;

    const lerpSpeed = 0.08; // Snappy
    
    const smoothedHandFactor = THREE.MathUtils.lerp(pointsRef.current.scale.x, handFactor, 0.1);
    pointsRef.current.scale.setScalar(smoothedHandFactor);

    for (let i = 0; i < currentPos.length; i++) {
      currentPos[i] += (targetPos[i] - currentPos[i]) * lerpSpeed;
      currentCol[i] += (targetCol[i] - currentCol[i]) * lerpSpeed;
    }
    
    posAttr.set(currentPos);
    colAttr.set(currentCol);
    
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    
    (pointsRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <points ref={pointsRef} geometry={geometry} material={ParticleMaterial} />
  );
};

export default Particles;