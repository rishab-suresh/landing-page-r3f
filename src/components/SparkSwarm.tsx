import { useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SparkSwarmRef {
  uniforms: { [key: string]: { value: any } };
}

interface SparkSwarmProps {
  origin?: THREE.Object3D | null;
  count?: number;
}

export const SparkSwarm = forwardRef<SparkSwarmRef, SparkSwarmProps>(({ origin, count = 2000 }, ref) => {
  const groupRef = useRef<THREE.Group>(null!);
  const pointsRef = useRef<THREE.Points>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  useImperativeHandle(ref, () => ({
    uniforms: (materialRef.current?.uniforms as unknown as { [key: string]: { value: any } }) || {},
  }));

  const { geometry, uniforms } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const offsetDirs = new Float32Array(count * 3);
    const initialPositions = new Float32Array(count * 3);

    // Spawn near origin in a tight sphere
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Uniform random on unit sphere for initial direction
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const dx = Math.sin(phi) * Math.cos(theta);
      const dy = Math.sin(phi) * Math.sin(theta);
      const dz = Math.cos(phi);

      // Initial radius
      const r = 0.1 * Math.cbrt(Math.random());
      initialPositions[i3 + 0] = dx * r;
      initialPositions[i3 + 1] = dy * r;
      initialPositions[i3 + 2] = dz * r;

      // Base positions start at initial positions
      positions[i3 + 0] = initialPositions[i3 + 0];
      positions[i3 + 1] = initialPositions[i3 + 1];
      positions[i3 + 2] = initialPositions[i3 + 2];

      // Random offset direction (unit length)
      const ox = (Math.random() * 2 - 1);
      const oy = (Math.random() * 2 - 1);
      const oz = (Math.random() * 2 - 1);
      const ol = Math.max(1e-6, Math.hypot(ox, oy, oz));
      offsetDirs[i3 + 0] = ox / ol;
      offsetDirs[i3 + 1] = oy / ol;
      offsetDirs[i3 + 2] = oz / ol;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('a_initialPosition', new THREE.Float32BufferAttribute(initialPositions, 3));
    geometry.setAttribute('a_offsetDir', new THREE.Float32BufferAttribute(offsetDirs, 3));

    const uniforms = {
      u_time: { value: 0 },
      u_spread: { value: 0.0 },
      u_opacity: { value: 0.0 },
      u_size: { value: 6.0 },
      u_orbitStrength: { value: 0.0 },
      u_color: { value: new THREE.Color(1.0, 0.55, 0.2) },
    } as const;

    return { geometry, uniforms: uniforms as unknown as { [key: string]: { value: any } } };
  }, [count]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value = t;
    }
    // Follow origin if provided
    if (groupRef.current && origin && origin.position) {
      groupRef.current.position.copy(origin.position);
    }
  });

  const vertexShader = /* glsl */`
    uniform float u_time;
    uniform float u_spread;
    uniform float u_size;
    uniform float u_orbitStrength;
    attribute vec3 a_initialPosition;
    attribute vec3 a_offsetDir;
    void main() {
      // Base position
      vec3 p = a_initialPosition;
      // Organic wobble along offset direction
      float wobble = sin(u_time * 1.3 + dot(a_offsetDir, vec3(12.9898,78.233,45.164))) * 0.5 + 0.5;
      float spread = u_spread * (0.7 + 0.3 * wobble);
      p += a_offsetDir * spread;
      // Simple orbital swirl around Y-axis with per-particle phase
      float phase = dot(a_offsetDir, vec3(12.9898,78.233,45.164));
      float speed = 0.5 + 0.5 * fract(sin(phase) * 43758.5453);
      float angle = u_time * speed * u_orbitStrength;
      mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
      vec2 xz = rot * vec2(p.x, p.z);
      p.x = xz.x;
      p.z = xz.y;
      vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      gl_PointSize = u_size * (300.0 / -mvPosition.z);
    }
  `;

  const fragmentShader = /* glsl */`
    precision mediump float;
    uniform float u_opacity;
    uniform vec3 u_color;
    void main() {
      // radial soft circle
      vec2 uv = gl_PointCoord.xy * 2.0 - 1.0;
      float d = dot(uv, uv);
      float alpha = smoothstep(1.0, 0.0, d);
      // bright, warm spark color controlled by uniform
      vec3 color = u_color;
      gl_FragColor = vec4(color, alpha * u_opacity);
    }
  `;

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
        <shaderMaterial
          ref={materialRef}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
        />
      </points>
    </group>
  );
});


