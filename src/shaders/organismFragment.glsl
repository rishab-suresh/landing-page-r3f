varying float v_noise;

void main() {
    vec3 color1 = vec3(0.6, 0.1, 0.0);
    vec3 color2 = vec3(1.0, 0.5, 0.0);
    vec3 highlight = vec3(1.0, 0.9, 0.5);

    float mix_val = smoothstep(0.0, 0.3, v_noise);
    vec3 final_color = mix(color1, color2, mix_val);

    float highlight_val = smoothstep(0.25, 0.3, v_noise);
    final_color = mix(final_color, highlight, highlight_val);

    gl_FragColor = vec4(final_color, 1.0);
}
