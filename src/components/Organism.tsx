import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import vertexShader from '../shaders/organismVertex.glsl';
import fragmentShader from '../shaders/organismFragment.glsl';

interface OrganismRef {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  uniforms: { [key: string]: { value: any } };
  tumble: { amplitude: number };
  object3D: THREE.Object3D;
}

export const Organism = forwardRef<OrganismRef>((_props, ref) => {
  const groupRef = useRef<THREE.Group>(null!);
  const tumbleGroupRef = useRef<THREE.Group>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const tumbleRef = useRef<{ amplitude: number }>({ amplitude: 0.05 });

  useImperativeHandle(ref, () => ({
    position: groupRef.current?.position || { x: 0, y: 0, z: 0 },
    rotation: groupRef.current?.rotation || { x: 0, y: 0, z: 0 },
    scale: groupRef.current?.scale || { x: 1, y: 1, z: 1 },
    uniforms: (materialRef.current?.uniforms as unknown as { [key: string]: { value: any } }) || {},
    tumble: tumbleRef.current,
    object3D: groupRef.current as unknown as THREE.Object3D,
  }));

  const uniforms = useMemo(() => ({
    u_time: { value: 0 },
    u_intensity: { value: 0.4 },
  }), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value = t;
    }
    if (tumbleGroupRef.current) {
      const amp = tumbleRef.current.amplitude;
      // Organic tumble using simple trigs with different frequencies
      tumbleGroupRef.current.rotation.x = amp * Math.sin(t * 0.9);
      tumbleGroupRef.current.rotation.y = amp * Math.cos(t * 0.7);
      tumbleGroupRef.current.rotation.z = amp * Math.sin(t * 1.1 + 1.57);
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={tumbleGroupRef}>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[2, 25]} />
          <shaderMaterial
            ref={materialRef}
            uniforms={uniforms}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
          />
        </mesh>
      </group>
    </group>
  );
});
