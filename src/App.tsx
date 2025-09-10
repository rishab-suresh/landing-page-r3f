import { Canvas } from '@react-three/fiber';
import { Section } from './components/Section';
import { Organism } from './components/Organism';
import { SparkSwarm } from './components/SparkSwarm';
import { useEffect, useRef, useState } from 'react';
import AOS from 'aos';
import gsap from 'gsap';
import 'aos/dist/aos.css';
import * as THREE from 'three';



interface OrganismRef {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  uniforms: { [key: string]: { value: any } };
  tumble: { amplitude: number };
  object3D: THREE.Object3D;
}

interface SparkSwarmRef {
  uniforms: { [key: string]: { value: any } };
}

function App() {
  // Single site mode (modes removed)
  const organismRef = useRef<OrganismRef>(null);
  const swarmRef = useRef<SparkSwarmRef>(null);
  const [organismObj, setOrganismObj] = useState<THREE.Object3D | null>(null);
  const masterTlRef = useRef<gsap.core.Timeline | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    AOS.init({
      duration: 1200,
      once: true,
      easing: 'ease-out-cubic',
    });

    // Build unified GSAP timeline once refs are ready because the damn ref was not working seperately for some reason god only knows
    {
      // Cleanup existing
      if (masterTlRef.current) {
        masterTlRef.current.kill();
        masterTlRef.current = null;
      }
      const buildWhenReady = () => {
        if (!organismRef.current) { requestAnimationFrame(buildWhenReady); return; }
        const hasUniforms = !!(organismRef.current as any).uniforms?.u_intensity;
        if (!hasUniforms) { requestAnimationFrame(buildWhenReady); return; }

        // Provide stable object3D to swarm
        setOrganismObj(organismRef.current.object3D);

        // Initial state (Void)
        gsap.set(organismRef.current.scale, { x: 0.2, y: 0.2, z: 0.2 });
        if (organismRef.current.uniforms?.u_intensity) {
          gsap.set(organismRef.current.uniforms.u_intensity, { value: 0.05 });
        }
        if (swarmRef.current?.uniforms) {
          gsap.set(swarmRef.current.uniforms.u_spread, { value: 0.0 });
          gsap.set(swarmRef.current.uniforms.u_opacity, { value: 0.0 });
        }
        gsap.set(organismRef.current.tumble, { amplitude: 0.03 });

        // Master timeline with 4 segments across scroll
        const tl = gsap.timeline({ defaults: { ease: 'none' }, paused: true });

        // Void (0 -> 0.25)
        tl.to(organismRef.current.scale, { x: 0.3, y: 0.3, z: 0.3, duration: 1 }, 0);
        tl.to(organismRef.current.uniforms.u_intensity, { value: 0.12, duration: 1 }, 0);

        // Spark (0.25 -> 0.5)
        tl.to(organismRef.current.uniforms.u_intensity, { value: 0.7, duration: 1 }, 1);
        tl.to(organismRef.current.scale, { x: 1.6, y: 1.6, z: 1.6, duration: 1 }, 1);
        if (swarmRef.current?.uniforms) {
          tl.to(swarmRef.current.uniforms.u_opacity, { value: 0.6, duration: 1 }, 1);
          tl.to(swarmRef.current.uniforms.u_spread, { value: 0.4, duration: 1 }, 1);
        }

        // Emergence (0.5 -> 0.75): big burst and prep for orbit
        tl.to(organismRef.current.uniforms.u_intensity, { value: 0.4, duration: 1 }, 2);
        if (swarmRef.current?.uniforms) {
          tl.to(swarmRef.current.uniforms.u_spread, { value: 3.0, duration: 1 }, 2);
          tl.to(swarmRef.current.uniforms.u_opacity, { value: 1.0, duration: 1 }, 2);
          tl.to(swarmRef.current.uniforms.u_orbitStrength, { value: 0.0, duration: 0 }, 2);
        }

        // Symbiosis (0.75 -> 1): your tuned settings
        tl.to(organismRef.current.scale, { x: 0.2, y: 0.2, z: 0.2, duration: 1 }, 3);
        tl.to(organismRef.current.uniforms.u_intensity, { value: 0.43, duration: 1 }, 3);
        tl.to(organismRef.current.rotation, { x: '+=' + Math.PI, y: '+=' + Math.PI, duration: 1 }, 3);
        tl.to(organismRef.current.tumble, { amplitude: 0.18, duration: 1 }, 3);
        if (swarmRef.current?.uniforms) {
          tl.to(swarmRef.current.uniforms.u_spread, { value: 5.0, duration: 1 }, 3);
          tl.to(swarmRef.current.uniforms.u_opacity, { value: 0.5, duration: 1 }, 3);
          tl.to(swarmRef.current.uniforms.u_size, { value: 1.0, duration: 1 }, 3);
          tl.to(swarmRef.current.uniforms.u_orbitStrength, { value: 0.48, duration: 1 }, 3);
          // keep fiery color
          tl.to(swarmRef.current.uniforms.u_color, { value: new THREE.Color(1.0, 0.55, 0.2), duration: 0 }, 3);
        }

        masterTlRef.current = tl;

        // Manual scroll mapping to timeline progress for reliability
        const updateProgress = () => {
          if (!masterTlRef.current) return;
          const doc = document.documentElement;
          const scrollTop = window.scrollY || window.pageYOffset || doc.scrollTop || 0;
          const scrollMax = Math.max(1, (doc.scrollHeight || document.body.scrollHeight) - window.innerHeight);
          const p = Math.min(1, Math.max(0, scrollTop / scrollMax));
          masterTlRef.current.progress(p);
        };
        const onScroll = () => requestAnimationFrame(updateProgress);
        const onResize = () => requestAnimationFrame(updateProgress);
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onResize);
        // Initial sync
        requestAnimationFrame(updateProgress);

        // Store cleanup on the timeline for convenience
        (tl as any)._cleanupHandlers = () => {
          window.removeEventListener('scroll', onScroll as EventListener);
          window.removeEventListener('resize', onResize as EventListener);
        };
      };

      buildWhenReady();
    }

    // Kill master timeline on unmount
    return () => {
      if (masterTlRef.current) {
        // Remove listeners
        const anyTl: any = masterTlRef.current;
        if (anyTl._cleanupHandlers) anyTl._cleanupHandlers();
        masterTlRef.current.kill();
        masterTlRef.current = null;
      }
    };
  }, []);

  return (
    <>
      
      <div className="fixed top-0 left-0 w-full h-screen -z-10 bg-black">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <pointLight position={[-10, -10, 5]} intensity={0.4} color="#ff6b35" />
          <Organism ref={organismRef} />
          {/* Swarm follows organism */}
          <SparkSwarm ref={swarmRef} origin={organismObj} />
        </Canvas>
      </div>
      
      <main ref={mainRef} className="relative z-10">
        <Section 
          id="section-void"
          nextId="section-spark"
          align="left"
          title="The Void" 
          subtitle="An interactive journey into procedural life."
          description="In the beginning, there was only darkness. A single point of consciousness floating in the infinite expanse of digital space."
        />
        <Section 
          id="section-spark"
          nextId="section-emergence"
          align="center"
          title="The Spark" 
          subtitle="A single organism comes into being."
          description="From nothingness emerges form. The first flicker of artificial life takes shape, pulsing with primitive awareness."
        />
        <Section 
          id="section-emergence"
          nextId="section-symbiosis"
          align="right"
          title="Emergence" 
          subtitle="From a single point, a swarm of life emerges."
          description="One becomes many. The organism multiplies, creating a symphony of motion and purpose in the digital realm."
        />
        <Section 
          id="section-symbiosis"
          align="left"
          title="Symbiosis" 
          subtitle="The system becomes one with its environment."
          description="The boundary between life and environment dissolves. The organism and its world become a single, breathing entity."
        />
      </main>
    </>
  );
}

export default App;
