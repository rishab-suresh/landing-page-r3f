varying float v_noise;

void main() {
    // A fiery, solar color palette
    vec3 color1 = vec3(0.6, 0.1, 0.0);  // Deep Red / "Surface"
    vec3 color2 = vec3(1.0, 0.5, 0.0);  // Fiery Orange
    vec3 highlight = vec3(1.0, 0.9, 0.5); // Bright Yellow / "Corona"

    // Blend from deep red to orange based on the noise displacement
    float mix_val = smoothstep(0.0, 0.3, v_noise);
    vec3 final_color = mix(color1, color2, mix_val);

    // Add the bright yellow highlight to the very peaks of the displacement
    float highlight_val = smoothstep(0.25, 0.3, v_noise);
    final_color = mix(final_color, highlight, highlight_val);

    gl_FragColor = vec4(final_color, 1.0);
}
