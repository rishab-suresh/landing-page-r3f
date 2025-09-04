uniform float u_size;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = u_size * (1.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
