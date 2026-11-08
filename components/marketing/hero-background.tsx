"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Cinematic hero backdrop: a single fullscreen shader quad (one WebGL
 * context, ~zero geometry) drifting navy→teal aurora noise in the style of
 * premium dark heroes. Static single frame under prefers-reduced-motion.
 * Pauses rendering when the tab is hidden or the canvas scrolls away.
 */
const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uRes;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(17.3, 9.1);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  vec2 p = uv * vec2(uRes.x / uRes.y, 1.0) * 2.6;

  // Slow-drifting aurora layers
  float t = uTime * 0.045;
  float n1 = fbm(p + vec2(t, -t * 0.6));
  float n2 = fbm(p * 1.7 + vec2(-t * 0.8, t * 0.5) + n1 * 1.4);
  float aurora = smoothstep(0.25, 0.95, n1 * 0.7 + n2 * 0.5);

  // Stitch palette: deep navy base, teal/cyan aurora
  vec3 base = vec3(0.027, 0.055, 0.094);        // #070d18
  vec3 navy = vec3(0.078, 0.169, 0.271);        // #142b45
  vec3 teal = vec3(0.078, 0.722, 0.651);        // #14b8a6
  vec3 cyan = vec3(0.024, 0.714, 0.831);        // #06b6d4

  vec3 col = base;
  col = mix(col, navy, smoothstep(0.1, 0.7, n2) * 0.85);
  float glow = aurora * (0.35 + 0.35 * sin(uv.y * 3.0 + t * 2.0));
  col += teal * glow * 0.34;
  col += cyan * pow(aurora, 3.0) * 0.22;

  // Vignette keeps the center readable behind text
  float vig = smoothstep(1.25, 0.25, distance(uv, vec2(0.62, 0.45)));
  col *= mix(0.55, 1.0, vig);

  // Gentle top darkening so the nav and headline hold contrast
  col *= 0.82 + 0.18 * smoothstep(0.0, 0.55, uv.y);

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function HeroBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "low-power" });
    } catch {
      return; // no WebGL: parent's CSS gradient fallback stays visible
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uTime: { value: reduced ? 40 : 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
    };
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms }),
    );
    scene.add(mesh);

    let width = 0;
    let height = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      renderer.setSize(width, height, false);
      uniforms.uRes.value.set(width, height);
    };
    resize();
    window.addEventListener("resize", resize);

    let visible = true;
    const io = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting);
    });
    io.observe(canvas);

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = now - last;
      last = now;
      if (!visible || document.hidden) return; // render nothing offscreen/hidden
      if (!reduced) uniforms.uTime.value += dt / 1000;
      renderer.render(scene, camera);
    };
    // Initial frame always (reduced motion included)
    renderer.render(scene, camera);
    if (!reduced) raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={`block h-full w-full ${className ?? ""}`} />;
}
