# R3F Aesthetic Website

Seamless, scroll-driven experience built with React Three Fiber, GSAP, AOS, and custom GLSL shaders. The visuals evolve across four phases: The Void → The Spark → Emergence → Symbiosis. A single `<Canvas>` renders a procedural organism (the “sun”) and a particle swarm that reacts to scroll.

## How it works (high level)

- One fixed `<Canvas>` behind the page renders:
  - `Organism`: a displaced icosahedron using noise in a vertex shader and a fiery fragment shader.
  - `SparkSwarm`: a GPU-animated particle system rendered as `THREE.Points` with a custom shader.
- A GSAP timeline maps scroll progress (0→1 across the document) to organism+swarm states for phase transitions.
- Text sections are plain React components with Tailwind styling and AOS for reveal animations. Each section has an anchor id and an arrow that smooth-scrolls to the next.

## Files to read first

- `src/App.tsx`: Canvas, GSAP timeline, scroll-progress mapping, sections.
- `src/components/Organism.tsx`: Mesh, shader uniforms, noise tumble wrapper.
- `src/components/SparkSwarm.tsx`: Particle geometry + shader uniforms.
- `src/components/Section.tsx`: Reusable section with AOS and a next-section arrow.
- `src/shaders/organismVertex.glsl` and `src/shaders/organismFragment.glsl`: Organism shaders.

---

## Organism shaders explained

### `organismVertex.glsl`
Key uniforms and varyings:
- `uniform float u_time;`: animated time (seconds).
- `uniform float u_intensity;`: displacement strength; increases in “Spark”, decreases in “Emergence”.
- `varying float v_noise;`: passed to fragment for color blending.

Noise and displacement flow:
1. A simplex noise implementation (`snoise`) generates coherent noise in 3D.
2. For each vertex, we compute `displacement = snoise(position + u_time) * u_intensity`.
3. We offset the vertex along its normal: `newPosition = position + normal * displacement`.
4. We store the displacement in `v_noise` and output clip-space position.

Effect: The mesh “breathes” and ripples organically. Changing `u_intensity` morphs the perceived energy/state across sections.

### `organismFragment.glsl`
Key varying:
- `varying float v_noise;`: from vertex stage.

Coloring flow:
1. Define a warm palette: base `color1` (deep red/orange), `color2` (bright orange), `highlight` (hot highlight).
2. Blend based on `v_noise` using `smoothstep` to avoid hard edges.
3. Mix a highlight band where noise exceeds a threshold.
4. Output `gl_FragColor = vec4(final_color, 1.0)`.

Effect: A fiery, emissive look that intensifies with larger `v_noise` (driven by `u_intensity`).

---

## SparkSwarm (particles) explained

Built as a single `THREE.Points` with custom attributes and shaders.

Geometry attributes:
- `position`: current positions (derived on GPU, buffer still required).
- `a_initialPosition`: compact sphere spawn positions near the origin.
- `a_offsetDir`: per-particle direction unit vector.

Uniforms:
- `u_time`: animation time.
- `u_spread`: how far particles move from their initial positions along `a_offsetDir`.
- `u_opacity`: overall alpha (multiplies radial falloff in fragment shader).
- `u_size`: point size in pixels (perspective-scaled).
- `u_orbitStrength`: blends in a simple orbit around Y (swirl) in the vertex shader.
- `u_color`: particle color (THREE.Color), matched to organism.

Vertex shader flow (pseudo):
```
vec3 p = a_initialPosition;
float wobble = sin(u_time * 1.3 + hash(a_offsetDir)) * 0.5 + 0.5;
float spread = u_spread * mix(0.7, 1.0, wobble);
p += a_offsetDir * spread;
// Optional orbit
float angle = u_time * speed * u_orbitStrength;
rotate p.xz by angle;
project and set gl_PointSize with perspective scaling
```

Fragment shader flow:
```
vec2 uv = gl_PointCoord * 2.0 - 1.0;
float alpha = smoothstep(1.0, 0.0, dot(uv, uv));
gl_FragColor = vec4(u_color, alpha * u_opacity);
```

Effect: A controllable spark halo that can subtly appear (Spark), burst (Emergence), then orbit a smaller core (Symbiosis).

---

## React Three Fiber components

### `Organism.tsx`
- Wraps the mesh in two groups: a root group and a `tumbleGroup` that applies a mild, organic rotation driven by `useFrame`.
- Exposes a ref with:
  - `position`, `rotation`, `scale`: mapped to the root group for GSAP.
  - `uniforms`: access to `u_time` and `u_intensity` for timeline control.
  - `tumble`: `{ amplitude }` reference to control tumble strength.
  - `object3D`: the root `THREE.Object3D` so other components (swarm) can follow it.
- `useFrame` updates `u_time` and applies the low-frequency tumble.

### `SparkSwarm.tsx`
- Generates attributes in a `useMemo` for performance.
- Keeps uniforms in a `ref`-accessible shader material so the GSAP timeline can tween values directly.
- Follows the organism by copying `origin.position` into a top-level `group` each frame.
- Performance tweaks: `frustumCulled={false}` and additive blending; point size is perspective scaled.

---

## Timeline and scroll mapping

Located in `src/App.tsx`:
- We create a GSAP timeline (`paused: true`) with four labeled segments mapping to The Void, The Spark, Emergence, and Symbiosis.
- On mount, we attach `scroll` and `resize` listeners that compute progress `p` across the full document height and set `timeline.progress(p)`.
- Each phase animates a subset of:
  - `organism.scale`, `organism.uniforms.u_intensity`, `organism.rotation`, `organism.tumble.amplitude`
  - `swarm.uniforms.u_spread`, `u_opacity`, `u_size`, `u_orbitStrength`, `u_color`

Why manual mapping? It avoids edge cases with nested scroll containers and ensures deterministic scrubbing.

---

## Sections and AOS

`Section.tsx` renders:
- A gradient overlay, heading, subtitle, optional description.
- Alignment via `align` prop: `left | center | right`.
- An optional arrow that smooth-scrolls to `nextId`.
- AOS attributes (`data-aos`, `data-aos-delay`) decorate title/subtitle/description/arrow.

---

## Performance notes

- Lowered DPR upper bound and disabled MSAA; rely on additive blending and tone mapping for smoothness.
- Reduced organism subdivisions to keep vertex shader work in check.
- Avoids unnecessary re-renders: uniforms are updated imperatively via refs.

---

## Extending the visuals

- Add postprocessing (bloom, vignette) with `@react-three/postprocessing` for glow.
- Feed organism normals into swarm color or size for tighter coupling.
- Reintroduce fluid sim as a framebuffer and sample it in the fragment shader for reflections.

---

## Development

```bash
npm install
npm run dev
```

Vite dev server will start; open the printed URL.

