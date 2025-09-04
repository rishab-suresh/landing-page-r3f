import { useFrame } from '@react-three/fiber';
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import vertexShader from '../shaders/vertexShader.glsl';
import fragmentShader from '../shaders/fragmentShader.glsl';

interface OrganismProps {
  opacity: number;
}

const Organism = ({ opacity }: OrganismProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
    });
  }, []);

  // Set opacity directly on the material
  if (material) {
    material.opacity = opacity;
  }

  useFrame(({ clock }) => {
    if (materialRef.current) {
        materialRef.current.uniforms.u_time.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh>
      <icosahedronGeometry args={[2, 20]} />
      <primitive object={material} ref={materialRef} attach="material" />
    </mesh>
  );
};

export default Organism;
