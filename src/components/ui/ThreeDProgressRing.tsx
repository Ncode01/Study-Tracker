// src/components/ui/ThreeDProgressRing.tsx
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import type { MoodType } from '../../styles/emotionalDesign';
import { moodPalettes } from '../../styles/emotionalDesign';
import * as THREE from 'three';

// Base ring geometry
const Ring = ({ 
  progress = 0, 
  radius = 1, 
  thickness = 0.2, 
  mood = 'focus' as MoodType,
  segments = 64
}) => {
  const ringRef = useRef<THREE.Group>(null);
  
  const palette = moodPalettes[mood];
  
  const primaryColor = palette.primary;
  const secondaryColor = palette.secondary;
  const accentColor = palette.accent;
  
  // Animation for rotation
  useFrame(() => {
    if (ringRef.current) {
      ringRef.current.rotation.z -= 0.002;
    }
  });
  
  // Spring animation for progress
  const { progressAnimation } = useSpring({
    progressAnimation: progress,
    config: { mass: 1, tension: 120, friction: 14 }
  });
  
  // Create segments for the progress ring
  return (
    <group ref={ringRef}>
      {/* Base ring (incomplete part) */}
      <mesh>
        <torusGeometry args={[radius, thickness, 16, segments]} />
        <meshStandardMaterial 
          color={secondaryColor} 
          opacity={0.6} 
          transparent
          roughness={0.6}
          metalness={0.4}
        />
      </mesh>
      
      {/* Progress ring (filled part) */}
      <animated.mesh rotation-z={progressAnimation.to(p => -Math.PI * 2 * (1 - p))}>
        <torusGeometry args={[radius, thickness, 16, segments]} />
        <meshStandardMaterial 
          color={primaryColor} 
          roughness={0.3}
          metalness={0.7}
          emissive={accentColor}
          emissiveIntensity={0.3}
        />
      </animated.mesh>
      
      {/* Animated glow particles around the ring */}
      <animated.group rotation-z={progressAnimation.to(p => Math.PI * 2 * p)}>
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh 
            key={i}
            position={[
              Math.cos(i / 12 * Math.PI * 2) * radius,
              Math.sin(i / 12 * Math.PI * 2) * radius,
              0
            ]}
            scale={[0.05, 0.05, 0.05]}
          >
            <sphereGeometry />
            <meshStandardMaterial 
              color={accentColor} 
              emissive={accentColor}
              emissiveIntensity={0.8}
            />
          </mesh>
        ))}
      </animated.group>
    </group>
  );
};

// Main component that includes Canvas
interface ThreeDProgressRingProps {
  progress: number;
  mood?: MoodType;
  size?: number;
  interactive?: boolean;
  className?: string;
  showControls?: boolean;
}

const ThreeDProgressRing: React.FC<ThreeDProgressRingProps> = ({ 
  progress, 
  mood = 'focus',
  size = 300,
  interactive = true,
  className = '',
  showControls = true
}) => {
  return (
    <div style={{ width: size, height: size }} className={className}>
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight 
          position={[10, 10, 10]} 
          angle={0.15} 
          penumbra={1} 
          intensity={0.7} 
        />
        <Ring 
          progress={progress} 
          mood={mood}
        />
        {showControls && interactive && (
          <OrbitControls 
            enableZoom={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI * 3/4}
            minAzimuthAngle={-Math.PI / 4}
            maxAzimuthAngle={Math.PI / 4}
          />
        )}
      </Canvas>
    </div>
  );
};

export default ThreeDProgressRing;