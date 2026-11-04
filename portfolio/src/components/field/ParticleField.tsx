import { useEffect, useRef } from "react";
import { gsap, prefersMotion } from "../../lib/motion";
import avatar from "../../assets/avatar.webp";
import { fieldState } from "./fieldState";
import { galaxy, planet, portal, portrait, terrain, vMark, wheel } from "./shapes";

const VERTEX = /* glsl */ `
  attribute vec3 aA, aB, aCA, aCB;
  attribute vec4 aS;
  uniform vec2 uRes;
  uniform float uMix, uTime, uDpr;
  uniform mat3 uRA, uRB;
  uniform vec4 uXA, uXB;
  uniform vec2 uWave, uSize;
  uniform vec3 uPtr;
  varying vec4 vC;

  vec3 place(vec3 p, mat3 r, vec4 x, float wave) {
    p.y += wave * sin(p.x * 3.4 + uTime * 0.7) * cos(p.z * 4.6 + uTime * 0.5);
    vec3 q = r * p;
    return vec3(q.xy * x.z + x.xy, q.z * x.z);
  }

  void main() {
    float f = smoothstep(aS.w * 0.42, 0.58 + aS.w * 0.42, uMix);
    vec3 pos = mix(place(aA, uRA, uXA, uWave.x), place(aB, uRB, uXB, uWave.y), f);

    // Mid-morph every point is thrown outward and swirled, so shapes burst instead of slide.
    float burst = sin(f * 3.14159);
    float swirl = burst * (aS.w - 0.5) * 2.6;
    float cs = cos(swirl), sn = sin(swirl);
    pos.xy = mat2(cs, sn, -sn, cs) * pos.xy;
    pos += aS.xyz * burst * min(uRes.x, uRes.y) * 0.55;

    pos.xy += vec2(sin(uTime * 0.6 + aS.x * 9.0), cos(uTime * 0.5 + aS.y * 9.0)) * 1.1;

    vec2 away = pos.xy - uPtr.xy;
    float dist = length(away);
    pos.xy += away / max(dist, 1.0) * uPtr.z * 34.0 * exp(-dist * dist / 19000.0);

    float persp = 1200.0 / max(1200.0 - pos.z, 120.0);
    gl_Position = vec4(pos.xy * persp / (uRes * 0.5), 0.0, 1.0);
    gl_PointSize = mix(uSize.x, uSize.y, f) * (0.72 + aS.w * 0.56) * persp * uDpr;
    vC = vec4(mix(aCA, aCB, f), mix(uXA.w, uXB.w, f) * clamp(persp, 0.35, 1.0));
  }
`;

const FRAGMENT = /* glsl */ `
  precision mediump float;
  varying vec4 vC;
  void main() {
    float a = smoothstep(0.5, 0.28, length(gl_PointCoord - 0.5)) * vC.a;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vC.rgb * a, a);
  }
`;

interface Layout {
  x: number;
  y: number;
  scale: number;
  alpha: number;
  tilt: [number, number];
  spin: [number, number];
  scrollSpin: number;
  rock: number;
  wave: number;
  size: number;
}

function layout(k: number, w: number, h: number): Layout {
  const min = Math.min(w, h);
  const wide = w > 760;
  const base = { tilt: [0, 0] as [number, number], spin: [0, 0] as [number, number], scrollSpin: 0, rock: 0, wave: 0, size: 1.7 };
  switch (k) {
    case 1: // Galaxy, behind the manifesto
      return { ...base, x: 0, y: 0, scale: Math.max(w, h) * 0.62, alpha: wide ? 0.42 : 0.3, tilt: [1.05, 0], spin: [0, 0.05], scrollSpin: 0.0006 };
    case 2: // HaloDeck wheel, rising out of the corner
      return wide
        ? { ...base, x: w * 0.4, y: -h * 0.38, scale: Math.max(w * 0.36, h * 0.62), alpha: 0.5, scrollSpin: 0.0016, size: 1.8 }
        : { ...base, x: w * 0.46, y: -h * 0.42, scale: h * 0.56, alpha: 0.32, scrollSpin: 0.0016 };
    case 3: // Arcguard planet
      return { ...base, x: 0, y: wide ? -h * 0.02 : h * 0.02, scale: wide ? min * 0.52 : min * 0.62, alpha: 0.95, tilt: [0.32, 0], spin: [0, 0.07], scrollSpin: 0.0011, size: 1.6 };
    case 4: // Veloq OS voice portal
      return { ...base, x: 0, y: 0, scale: Math.max(w, h) * 0.46, alpha: 0.5, tilt: [0.86, 0], spin: [0, 0.09], scrollSpin: 0.0005 };
    case 5: // Terrain, under the shipped work
      return { ...base, x: 0, y: -h * 0.3, scale: Math.max(w, h) * 0.56, alpha: 0.85, tilt: [1.2, 0], wave: 0.17, size: 1.9 };
    case 6: // V mark, closing the page
      return wide
        ? { ...base, x: w * 0.32, y: 0, scale: min * 0.32, alpha: 1, rock: 0.45, size: 1.7 }
        : h < 720
          ? { ...base, x: w * 0.26, y: h * 0.24, scale: min * 0.3, alpha: 0.25, rock: 0.45, size: 1.5 } // Behind the heading on short phones
          : { ...base, x: 0, y: h * 0.27, scale: min * 0.3, alpha: 1, rock: 0.45, size: 1.5 };
    default:
      return { ...base, x: 0, y: 0, scale: 100, alpha: 1, size: wide ? 3.3 : 2.1 };
  }
}

function rotation(rx: number, rz: number, ry: number) {
  const [cx, sx, cy, sy, cz, sz] = [Math.cos(rx), Math.sin(rx), Math.cos(ry), Math.sin(ry), Math.cos(rz), Math.sin(rz)];
  // Column-major Rx * Ry * Rz: spin in the shape's own plane, then tilt toward the camera.
  return new Float32Array([
    cy * cz, cx * sz + sx * sy * cz, sx * sz - cx * sy * cz,
    -cy * sz, cx * cz - sx * sy * sz, sx * cz + cx * sy * sz,
    sy, -sx * cy, cx * cy,
  ]);
}

export function ParticleField({ portraitSelector }: { portraitSelector: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !prefersMotion()) return;
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: "high-performance" });
    if (!gl) return;

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const uni = {
      res: u("uRes"), mix: u("uMix"), time: u("uTime"), dpr: u("uDpr"), ra: u("uRA"), rb: u("uRB"),
      xa: u("uXA"), xb: u("uXB"), wave: u("uWave"), size: u("uSize"), ptr: u("uPtr"),
    };
    const attr = {
      a: gl.getAttribLocation(program, "aA"), b: gl.getAttribLocation(program, "aB"),
      ca: gl.getAttribLocation(program, "aCA"), cb: gl.getAttribLocation(program, "aCB"), s: gl.getAttribLocation(program, "aS"),
    };

    const count = window.innerWidth > 760 ? 22000 : 9000;
    const upload = (data: Float32Array) => {
      const buffer = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      return buffer;
    };

    const seeds = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      // A random direction, biased flat so bursts spread across the screen.
      const a = Math.random() * Math.PI * 2;
      const r = Math.pow(Math.random(), 0.5);
      seeds.set([Math.cos(a) * r, Math.sin(a) * r, (Math.random() - 0.5) * 0.9, Math.random()], i * 4);
    }
    const seedBuffer = upload(seeds);
    gl.enableVertexAttribArray(attr.s);
    gl.bindBuffer(gl.ARRAY_BUFFER, seedBuffer);
    gl.vertexAttribPointer(attr.s, 4, gl.FLOAT, false, 0, 0);
    [attr.a, attr.b, attr.ca, attr.cb].forEach((loc) => gl.enableVertexAttribArray(loc));

    let shapes: { pos: WebGLBuffer; col: WebGLBuffer }[] = [];
    let cancelled = false;
    portrait(count, avatar).then((face) => {
      if (cancelled) return;
      shapes = [face, galaxy(count), wheel(count), planet(count), portal(count), terrain(count), vMark(count)].map((shape) => ({
        pos: upload(shape.pos),
        col: upload(shape.col),
      }));
    });

    let width = 0;
    let height = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const nextWidth = window.innerWidth;
      // On phones the canvas keeps one height whatever the address bar is doing.
      const nextHeight = nextWidth <= 760 ? canvas.clientHeight : window.innerHeight;
      if (nextWidth === width && nextHeight === height) return;
      width = nextWidth;
      height = nextHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const pointer = { x: 0, y: 0, z: 0, tz: 0 };
    const onMove = (e: PointerEvent) => {
      // A finger leaves no event when it lets go, so its dent would stay in the field.
      if (e.pointerType === "touch") return;
      pointer.x = e.clientX - width / 2;
      pointer.y = height / 2 - e.clientY;
      pointer.tz = 1;
    };
    const onLeave = () => { pointer.tz = 0; };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    const portraitEl = document.querySelector<HTMLElement>(portraitSelector);
    let smooth = 0;
    let boundA = -1;
    let boundB = -1;
    const bind = (loc: number, colour: number, buffer: { pos: WebGLBuffer; col: WebGLBuffer }) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer.pos);
      gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer.col);
      gl.vertexAttribPointer(colour, 3, gl.FLOAT, false, 0, 0);
    };

    const render = (time: number, delta: number) => {
      if (!shapes.length || document.hidden) return;
      const target = fieldState.stages.reduce((sum, v) => sum + v, 0);
      smooth += (target - smooth) * Math.min(1, delta * 0.006);
      pointer.z += (pointer.tz - pointer.z) * Math.min(1, delta * 0.005);

      const last = shapes.length - 1;
      const a = Math.min(Math.floor(smooth), last);
      const b = Math.min(a + 1, last);
      let mixValue = smooth - a;
      // The field stays empty for the first moment, while the portrait rises away.
      if (a === 0) mixValue = gsap.utils.clamp(0, 1, (mixValue - 0.12) / 0.88);
      if (a !== boundA) { bind(attr.a, attr.ca, shapes[a]); boundA = a; }
      if (b !== boundB) { bind(attr.b, attr.cb, shapes[b]); boundB = b; }

      const scroll = window.scrollY + fieldState.spin;
      const prepare = (k: number, rot: WebGLUniformLocation | null, x: WebGLUniformLocation | null) => {
        const l = layout(k, width, height);
        if (k === 0 && portraitEl) {
          const rect = portraitEl.getBoundingClientRect();
          l.x = rect.left + rect.width / 2 - width / 2;
          l.y = height / 2 - rect.top - rect.height / 2;
          l.scale = rect.height / 2;
          l.alpha = 0; // The portrait is only where the particles start; they fade in from it.
        }
        gl.uniformMatrix3fv(rot, false, rotation(l.tilt[0], l.spin[1] * time + scroll * l.scrollSpin, l.spin[0] * time + Math.sin(time * 0.6) * l.rock));
        gl.uniform4f(x, l.x, l.y, l.scale, l.alpha);
        return l;
      };
      const la = prepare(a, uni.ra, uni.xa);
      const lb = prepare(b, uni.rb, uni.xb);

      gl.uniform2f(uni.res, width, height);
      gl.uniform1f(uni.mix, mixValue);
      gl.uniform1f(uni.time, time);
      gl.uniform1f(uni.dpr, dpr);
      gl.uniform2f(uni.wave, la.wave, lb.wave);
      gl.uniform2f(uni.size, la.size, lb.size);
      gl.uniform3f(uni.ptr, pointer.x, pointer.y, pointer.z);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (a === 0 && mixValue === 0) return;
      gl.drawArrays(gl.POINTS, 0, count);
    };
    gsap.ticker.add(render);

    return () => {
      cancelled = true;
      gsap.ticker.remove(render);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [portraitSelector]);

  return <canvas ref={canvasRef} className="field" aria-hidden="true" />;
}
