import React from 'react';

interface OrganismMuralProps {
  opacity: number;
}

const OrganismMural = ({ opacity }: OrganismMuralProps) => {
  return (
    <mesh>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial color="red" opacity={opacity} transparent />
    </mesh>
  );
};

export default OrganismMural;
