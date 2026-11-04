// Point clouds the particle field morphs between. Every shape has the same number of
// points, in unit space (-1..1, y up), with one colour per point.

export interface Shape {
  pos: Float32Array;
  col: Float32Array;
}

type Rgb = readonly [number, number, number];

const hex = (h: number): Rgb => [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255];
const MINT = hex(0x3df2c6);
const INK = hex(0xf2f4f8);
const MUTED = hex(0x8a93a3);
const DIM = hex(0x4a5262);
const DANGER = hex(0xff8a7a);
const TAU = Math.PI * 2;

function build(n: number, write: (i: number, put: (x: number, y: number, z: number, c: Rgb) => void) => void): Shape {
  const pos = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    write(i, (x, y, z, c) => {
      pos.set([x, y, z], i * 3);
      col.set(c, i * 3);
    });
  }
  return { pos, col };
}

const rand = (a = 1, b = 0) => b + Math.random() * (a - b);

export function galaxy(n: number): Shape {
  return build(n, (i, put) => {
    const r = Math.pow(Math.random(), 0.62);
    const angle = (i % 4) * (TAU / 4) + r * 5.2 + (Math.random() - 0.5) * (0.65 - r * 0.3);
    const lift = (Math.random() - 0.5) * 0.18 * (1 - r);
    const c = r < 0.13 || Math.random() < 0.08 ? MINT : Math.random() < 0.5 ? INK : MUTED;
    put(Math.cos(angle) * r, Math.sin(angle) * r, lift, c);
  });
}

export function wheel(n: number): Shape {
  return build(n, (i, put) => {
    const roll = i / n;
    if (roll < 0.42) {
      // Rim
      const a = Math.random() * TAU;
      const r = rand(1, 0.93);
      put(Math.cos(a) * r, Math.sin(a) * r, 0, a < 1.2 ? MINT : INK);
    } else if (roll < 0.58) {
      // Clock ticks
      const tick = Math.floor(Math.random() * 72);
      const a = (tick / 72) * TAU + (Math.random() - 0.5) * 0.006;
      const r = rand(0.88, tick % 6 === 0 ? 0.74 : 0.82);
      put(Math.cos(a) * r, Math.sin(a) * r, 0, tick % 6 === 0 ? INK : MUTED);
    } else if (roll < 0.9) {
      // App icons, as rings around the wheel
      const slot = Math.floor(Math.random() * 12);
      const a = (slot / 12) * TAU;
      const b = Math.random() * TAU;
      const r = 0.075 * rand(1, 0.82);
      put(
        Math.cos(a) * 0.56 + Math.cos(b) * r,
        Math.sin(a) * 0.56 + Math.sin(b) * r,
        0,
        slot === 1 ? MINT : INK,
      );
    } else {
      const a = Math.random() * TAU;
      const r = rand(0.26, 0.2);
      put(Math.cos(a) * r, Math.sin(a) * r, 0, MUTED);
    }
  });
}

export function planet(n: number): Shape {
  const enemies = Array.from({ length: 9 }, (_, k) => ({
    a: rand(TAU),
    r: rand(1.3, 0.72),
    size: k % 3 === 0 ? 0.034 : 0.022,
  }));
  return build(n, (i, put) => {
    const roll = i / n;
    if (roll < 0.56) {
      // Planet surface, even over the sphere
      const y = 1 - (i / (n * 0.56)) * 2;
      const ring = Math.sqrt(Math.max(0, 1 - y * y));
      const a = i * 2.399963;
      put(Math.cos(a) * ring * 0.36, y * 0.36, Math.sin(a) * ring * 0.36, MINT);
    } else if (roll < 0.74) {
      // Shield arc
      const a = rand(0.8, -0.8) + 0.8;
      const r = 0.62 + (Math.random() - 0.5) * 0.024;
      put(Math.cos(a) * r, Math.sin(a) * r, 0, MINT);
    } else if (roll < 0.8) {
      const a = Math.random() * TAU;
      put(Math.cos(a) * 0.62, Math.sin(a) * 0.62, 0, DIM);
    } else if (roll < 0.9) {
      // The dashed orbit
      const dash = Math.floor(Math.random() * 56);
      const a = ((dash + rand(0.5)) / 56) * TAU;
      put(Math.cos(a) * 1.02, Math.sin(a) * 1.02, 0, MUTED);
    } else {
      const e = enemies[i % enemies.length];
      const b = Math.random() * TAU;
      const r = e.size * Math.sqrt(Math.random());
      put(Math.cos(e.a) * e.r + Math.cos(b) * r, Math.sin(e.a) * e.r + Math.sin(b) * r, 0, DANGER);
    }
  });
}

export function portal(n: number): Shape {
  const radii = [1, 0.86, 0.72, 0.58, 0.44];
  return build(n, (i, put) => {
    const roll = i / n;
    if (roll < 0.86) {
      const k = i % radii.length;
      const a = Math.random() * TAU;
      const wobble = 1 + Math.sin(a * 3 + k) * 0.022 + Math.sin(a * 5 - k * 2) * 0.012;
      const r = radii[k] * wobble * 0.72 + (Math.random() - 0.5) * 0.006;
      put(Math.cos(a) * r, Math.sin(a) * r, 0, k === 0 ? MINT : k === 1 ? MINT : k === 2 ? INK : MUTED);
    } else if (roll < 0.97) {
      const a = Math.floor(Math.random() * 120) * (TAU / 120);
      const r = 0.84 + Math.floor(Math.random() * 3) * 0.075;
      put(Math.cos(a) * r, Math.sin(a) * r, 0, DIM);
    } else {
      const a = Math.random() * TAU;
      const r = 0.035 * Math.sqrt(Math.random());
      put(Math.cos(a) * r, Math.sin(a) * r, 0, MINT);
    }
  });
}

export function terrain(n: number): Shape {
  const columns = Math.ceil(Math.sqrt(n * 2.4));
  const rows = Math.ceil(n / columns);
  return build(n, (i, put) => {
    const x = ((i % columns) / columns) * 3.2 - 1.6;
    const z = (Math.floor(i / columns) / rows) * 2 - 1;
    const c = Math.random() < 0.05 ? MINT : Math.random() < 0.5 ? MUTED : DIM;
    put(x, 0, z, c);
  });
}

/** The V mark, in the same coordinates as the logo's 120×120 box. */
export function vMark(n: number): Shape {
  const capsule = (x1: number, y1: number, x2: number, y2: number, w: number) => {
    const t = Math.random();
    const a = Math.random() * TAU;
    const r = (w / 2) * Math.sqrt(Math.random());
    return [x1 + (x2 - x1) * t + Math.cos(a) * r, y1 + (y2 - y1) * t + Math.sin(a) * r] as const;
  };
  return build(n, (i, put) => {
    const roll = i / n;
    let p: readonly [number, number];
    let c: Rgb;
    if (roll < 0.44) {
      p = capsule(18, 40, 50, 104, 14);
      c = INK;
    } else if (roll < 0.92) {
      p = capsule(50, 104, 90, 33, 14);
      c = MINT;
    } else {
      p = capsule(102, 13, 102, 13, 16);
      c = MINT;
    }
    put((p[0] - 60) / 60, (60 - p[1]) / 60, (Math.random() - 0.5) * 0.06, c);
  });
}

/** Stipples an image into points, weighted by opacity. x spans ±(aspect), y spans ±1. */
export async function portrait(n: number, src: string): Promise<Shape> {
  const img = new Image();
  img.src = src;
  await img.decode();
  const w = 440;
  const h = Math.round((w * img.height) / img.width);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  const aspect = w / h;
  return build(n, (_, put) => {
    for (let tries = 0; tries < 60; tries++) {
      const px = Math.floor(Math.random() * w);
      const py = Math.floor(Math.random() * h);
      const k = (py * w + px) * 4;
      if (data[k + 3] < 140) continue;
      put(
        ((px + Math.random()) / w - 0.5) * 2 * aspect,
        (0.5 - (py + Math.random()) / h) * 2,
        0,
        [data[k] / 255, data[k + 1] / 255, data[k + 2] / 255],
      );
      return;
    }
    put(0, -1, 0, DIM);
  });
}
