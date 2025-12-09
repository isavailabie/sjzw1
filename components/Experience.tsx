import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import Particles from './Particles';

const Experience: React.FC = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 45], fov: 35 }}
      gl={{ antialias: false, alpha: false }}
      dpr={[1, 2]} 
    >
      <color attach="background" args={['#020202']} />
      
      <Suspense fallback={null}>
        <Particles />
        <Environment preset="city" />
      </Suspense>

      {/* Post Processing - Tuned for Sharpness */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.4} // Only brightest parts bloom
          mipmapBlur 
          intensity={0.8} // Reduced intensity
          radius={0.4} // Smaller radius
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>

      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        minDistance={20}
        maxDistance={100}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
};

export default Experience;