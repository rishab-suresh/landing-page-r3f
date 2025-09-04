import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { useState } from 'react';
import Organism from './Organism';
import OrganismSwarm from './OrganismSwarm';
import OrganismMural from './OrganismMural';
import OrganismField from './OrganismField';

function OrganismManager() {
  const scroll = useScroll();
  const [opacities, setOpacities] = useState({ o1: 1, o2: 0, o3: 0, o4: 0 });

  useFrame(() => {
    const t = scroll.offset;

    const calculateOpacity = (sectionStart: number, sectionEnd: number) => {
      const sectionLength = sectionEnd - sectionStart;
      const fadeMargin = sectionLength * 0.25;
      const fadeInEnd = sectionStart + fadeMargin;
      const fadeOutStart = sectionEnd - fadeMargin;

      if (t < sectionStart || t > sectionEnd) return 0;
      if (t >= fadeInEnd && t <= fadeOutStart) return 1;
      if (t < fadeInEnd) return (t - sectionStart) / fadeMargin;
      if (t > fadeOutStart) return (sectionEnd - t) / fadeMargin;
      return 0;
    };
    
    setOpacities({
      o1: calculateOpacity(0, 1/4),
      o2: calculateOpacity(1/4, 2/4),
      o3: calculateOpacity(2/4, 3/4),
      o4: calculateOpacity(3/4, 1.0)
    });
  });

  return (
    <group>
      <Organism opacity={opacities.o1} />
      <OrganismSwarm opacity={opacities.o2} />
      <OrganismMural opacity={opacities.o3} />
      <OrganismField opacity={opacities.o4} />
    </group>
  );
}

export default OrganismManager;
