import React from 'react';

interface OrganismFieldProps {
  opacity: number;
}

const OrganismField = ({ opacity }: OrganismFieldProps) => {
  return (
    <mesh>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial color="blue" opacity={opacity} transparent />
    </mesh>
  );
};

export default OrganismField;
