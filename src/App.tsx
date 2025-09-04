import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll, Loader } from '@react-three/drei';
import OrganismManager from './components/OrganismManager';
import CameraRig from './components/CameraRig';
import LandingPage from './components/LandingPage';
import './App.css';

function App() {
  const [isLandingVisible, setIsLandingVisible] = useState(false);

  return (
    <>
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 1], fov: 75 }}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
        >
          <color attach="background" args={['#000000']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <ScrollControls pages={4} damping={0.3}>
            <OrganismManager />
            <CameraRig onIntroFinish={() => setIsLandingVisible(true)} />

            <Scroll html>
              <LandingPage isVisible={isLandingVisible} />
            </Scroll>
          </ScrollControls>
        </Canvas>
      </Suspense>
      <Loader />
    </>
  );
}

export default App;
