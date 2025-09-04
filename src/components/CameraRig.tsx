import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

interface CameraRigProps {
  onIntroFinish: () => void;
}

function CameraRig({ onIntroFinish }: CameraRigProps) {
  const { camera } = useThree();
  const scroll = useScroll();

  const cameraPath = useMemo(
    () => [
      new THREE.Vector3(0, 0, 5),    // Section 1: Spark
      new THREE.Vector3(2, 0, 4),    // Section 2: Emergence
      new THREE.Vector3(-2, 1, 4),   // Section 3: Outliers
      new THREE.Vector3(0, -1, 3.5), // Section 4: Symbiosis
    ],
    []
  );

  useEffect(() => {
    gsap.to(camera.position, {
      x: cameraPath[0].x,
      y: cameraPath[0].y,
      z: cameraPath[0].z,
      duration: 2.5,
      ease: 'power3.inOut',
      onComplete: onIntroFinish,
    });
  }, [camera, onIntroFinish, cameraPath]);

  useFrame((state) => {
    const t = scroll.offset;
    const numPages = 4;
    const segmentDuration = 1 / (numPages - 1);
    const currentSegment = Math.min(Math.floor(t / segmentDuration), numPages - 2);
    const segmentProgress = (t % segmentDuration) / segmentDuration;
    const startPos = cameraPath[currentSegment];
    const endPos = cameraPath[currentSegment + 1];

    if (startPos && endPos) {
      state.camera.position.lerpVectors(startPos, endPos, segmentProgress);
    }
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

export default CameraRig;
