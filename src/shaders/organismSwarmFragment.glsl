void main() {
  float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
  if (distanceToCenter > 0.5) {
    discard;
  }
  gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0); // Cyan
}
