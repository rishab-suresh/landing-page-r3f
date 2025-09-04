import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { createNoise4D } from 'simplex-noise';
import organismSwarmVertex from '../shaders/organismSwarmVertex.glsl';
import organismSwarmFragment from '../shaders/organismSwarmFragment.glsl';

interface OrganismSwarmProps {
  opacity: number;
}

const OrganismSwarm = ({ opacity }: OrganismSwarmProps) => {
  const pointsRef = useRef<THREE.Points>(null!);
  const noise4D = useMemo(() => createNoise4D(), []);
  
  const particles = useMemo(() => {
    const count = 5000;
    const positions = new Float32Array(count * 3);
    const particleData = [];
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const pos = new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * 2.5);
      positions[i3] = pos.x;
      positions[i3 + 1] = pos.y;
      positions[i3 + 2] = pos.z;
      particleData.push({ originalPos: pos, velocity: new THREE.Vector3() });
    }
    return { positions, particleData };
  }, []);

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { u_size: { value: 15.0 } },
    vertexShader: organismSwarmVertex,
    fragmentShader: organismSwarmFragment,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), []);

  // Set opacity directly on the material
  if (material) {
    material.opacity = opacity;
  }

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < particles.particleData.length; i++) {
      const i3 = i * 3;
      const p = particles.particleData[i];
      const noise = noise4D(p.originalPos.x + t * 0.1, p.originalPos.y + t * 0.1, p.originalPos.z + t * 0.1, t * 0.1);
      p.velocity.set(noise, noise, noise).normalize().multiplyScalar(0.01);
      positions[i3] += p.velocity.x;
      positions[i3 + 1] += p.velocity.y;
      positions[i3 + 2] += p.velocity.z;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <primitive object={material} attach="material" />
    </points>
  );
};

export default OrganismSwarm;
