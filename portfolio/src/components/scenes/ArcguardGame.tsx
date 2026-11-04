import { useEffect, useRef, useState } from "react";
import { prefersMotion } from "../../lib/motion";

// A browser cut of Arcguard: the same two wheels, enemies, Perfect blocks and combo as the
// Android game (see its plan's enemy table), on a fixed 60 Hz step like game-core.

const ACCENT = "#3DF2C6";
const INK = "#F2F4F8";
const DANGER = "#FF8A7A";
const MUTED = "#8A93A3";
const LINE = "#1E232D";
const STEP = 1 / 60;
const TAU = Math.PI * 2;
const SHIELD_SNAP = (15 * Math.PI) / 180;
const WHEEL_GAIN = 4;
const FRICTION = 4;
const SPRING = 200;
const DAMP = 2 * 0.9 * Math.sqrt(SPRING);
const COMBO_MAX = 8;
const BEST_KEY = "arcguard-demo-best";

type Kind = "meteor" | "comet" | "drone" | "splitter" | "nova";

interface Enemy {
  kind: Kind;
  a: number;
  r: number;
  speed: number;
  charger: boolean;
  warn: number;
  coveredFor: number;
  orbit: number;
  dead: boolean;
}
interface Shot { a: number; r: number; dead: boolean }
interface Spark { x: number; y: number; vx: number; vy: number; life: number; c: string }
interface Pop { x: number; y: number; life: number; text: string }

const COST: Record<Kind, number> = { meteor: 15, comet: 25, drone: 10, splitter: 30, nova: 0 };
const angleDiff = (a: number, b: number) => Math.abs(((a - b + Math.PI * 3) % TAU) - Math.PI);
const readBest = () => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};

function newWorld() {
  return {
    t: 0, score: 0, hits: 0, lives: 3, hp: 100, wave: 1, spawn: 1.2, novaIn: 18, fire: 0, shake: 0, flash: 0,
    shield: { a: -Math.PI / 2, v: 0 },
    cannon: { a: -Math.PI / 2 - 1, v: 0 },
    enemies: [] as Enemy[], shots: [] as Shot[], sparks: [] as Spark[], pops: [] as Pop[],
  };
}

export function ArcguardGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef<"intro" | "play" | "over">("intro");
  const worldRef = useRef(newWorld());
  const [phase, setPhase] = useState<"intro" | "play" | "over">("intro");
  const [result, setResult] = useState({ score: 0, best: 0, wave: 1 });

  const start = () => {
    worldRef.current = newWorld();
    phaseRef.current = "play";
    setPhase("play");
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const motion = prefersMotion();
    let w = 0, h = 0, unit = 0, cx = 0, cy = 0, wheelR = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      w = rect.width;
      h = rect.height;
      wheelR = Math.min(w * 0.3, h * 0.26, 190);
      cx = w / 2;
      cy = h > w ? h * 0.42 : h * 0.46;
      unit = Math.min(w, (h - wheelR * 0.4) * 0.8) / 2;
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const planetR = () => unit * 0.2;
    const shieldR = () => unit * 0.42;
    const arcHalf = (hp: number) => ((25 + (65 * hp) / 100) * Math.PI) / 360;
    const combo = (hits: number) => Math.min(COMBO_MAX, 1 + Math.floor(hits / 4));
    const toXY = (a: number, r: number): [number, number] => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];

    // ---- Input: one drag per wheel, plus the keyboard
    const drags = new Map<number, { wheel: "shield" | "cannon"; angle: number; time: number }>();
    const keys = new Set<string>();
    const wheelCenter = (side: "shield" | "cannon"): [number, number] => (side === "shield" ? [0, h] : [w, h]);
    const pointerAngle = (e: PointerEvent, side: "shield" | "cannon") => {
      const rect = canvas.getBoundingClientRect();
      const [wx, wy] = wheelCenter(side);
      return Math.atan2(e.clientY - rect.top - wy, e.clientX - rect.left - wx);
    };
    const onDown = (e: PointerEvent) => {
      if (phaseRef.current !== "play") return;
      const rect = canvas.getBoundingClientRect();
      const side = e.clientX - rect.left < w / 2 ? "shield" : "cannon";
      canvas.setPointerCapture(e.pointerId);
      drags.set(e.pointerId, { wheel: side, angle: pointerAngle(e, side), time: performance.now() });
      worldRef.current[side].v = 0;
    };
    const onMove = (e: PointerEvent) => {
      const drag = drags.get(e.pointerId);
      if (!drag) return;
      const body = worldRef.current[drag.wheel];
      const angle = pointerAngle(e, drag.wheel);
      let delta = angle - drag.angle;
      if (delta > Math.PI) delta -= TAU;
      if (delta < -Math.PI) delta += TAU;
      const now = performance.now();
      const dt = Math.max((now - drag.time) / 1000, 1 / 240);
      body.a += delta * WHEEL_GAIN;
      body.v = body.v * 0.6 + ((delta * WHEEL_GAIN) / dt) * 0.4;
      drag.angle = angle;
      drag.time = now;
    };
    const onUp = (e: PointerEvent) => { drags.delete(e.pointerId); };
    const onKeyDown = (e: KeyboardEvent) => {
      if (["a", "d", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        keys.add(e.key);
        e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => keys.delete(e.key);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // ---- Simulation
    const burst = (world: ReturnType<typeof newWorld>, x: number, y: number, c: string, n: number) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * TAU;
        const s = unit * (0.3 + Math.random() * 1.1);
        world.sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.35 + Math.random() * 0.35, c });
      }
    };
    const award = (world: ReturnType<typeof newWorld>, base: number, x: number, y: number, label = "") => {
      world.hits++;
      const gain = base * combo(world.hits);
      world.score += gain;
      world.pops.push({ x, y, life: 0.8, text: `${label}+${gain}` });
    };
    const spawn = (world: ReturnType<typeof newWorld>) => {
      const roll = Math.random();
      const late = world.wave;
      const kind: Kind = late >= 2 && roll < 0.2 ? "comet" : late >= 3 && roll < 0.36 ? "drone" : late >= 2 && roll < 0.5 ? "splitter" : "meteor";
      const base = 0.3 * (1 + (late - 1) * 0.09);
      world.enemies.push({
        kind,
        a: Math.random() * TAU,
        r: unit * 1.9,
        speed: unit * base * (kind === "comet" ? 3 : 1),
        charger: Math.random() < 0.15 && kind !== "comet",
        warn: kind === "comet" ? 0.6 : 0,
        coveredFor: 0,
        orbit: 0,
        dead: false,
      });
    };

    const step = () => {
      const world = worldRef.current;
      world.t += STEP;
      world.wave = 1 + Math.floor(world.t / 18);

      // Wheels: keyboard push, friction, and the shield snaps every 15° when it slows down
      const push = (body: { v: number }, dir: number) => { body.v += dir * 26 * STEP; };
      if (keys.has("a")) push(world.shield, -1);
      if (keys.has("d")) push(world.shield, 1);
      if (keys.has("ArrowLeft")) push(world.cannon, -1);
      if (keys.has("ArrowRight")) push(world.cannon, 1);
      const held = (side: "shield" | "cannon") => [...drags.values()].some((d) => d.wheel === side);
      if (!held("shield")) {
        if (Math.abs(world.shield.v) > 1.2 || keys.has("a") || keys.has("d")) world.shield.v *= Math.exp(-FRICTION * STEP);
        else {
          const target = Math.round(world.shield.a / SHIELD_SNAP) * SHIELD_SNAP;
          world.shield.v += (SPRING * (target - world.shield.a) - DAMP * world.shield.v) * STEP;
        }
        world.shield.a += world.shield.v * STEP;
      }
      if (!held("cannon")) {
        world.cannon.v *= Math.exp(-FRICTION * STEP);
        world.cannon.a += world.cannon.v * STEP;
      }

      // Cannon fires by itself
      world.fire -= STEP;
      if (world.fire <= 0) {
        world.fire = 0.26;
        world.shots.push({ a: world.cannon.a, r: planetR() + unit * 0.1, dead: false });
      }
      for (const shot of world.shots) {
        shot.r += unit * 2.6 * STEP;
        if (shot.r > unit * 2.1) shot.dead = true;
      }

      world.spawn -= STEP;
      if (world.spawn <= 0) {
        spawn(world);
        world.spawn = Math.max(0.42, 1.7 - world.wave * 0.14) * (0.75 + Math.random() * 0.5);
      }
      world.novaIn -= STEP;
      if (world.novaIn <= 0) {
        world.novaIn = 24;
        world.enemies.push({ kind: "nova", a: Math.random() * TAU, r: unit * 1.05, speed: 0, charger: false, warn: 0, coveredFor: 0, orbit: 12, dead: false });
      }

      const arc = arcHalf(world.hp);
      const added: Enemy[] = [];
      for (const e of world.enemies) {
        if (e.warn > 0) {
          e.warn -= STEP;
          continue;
        }
        if (e.kind === "nova") {
          e.a += 0.35 * STEP;
          e.orbit -= STEP;
          if (e.orbit <= 0) e.dead = true;
        } else if (e.orbit > 0) {
          e.orbit -= STEP;
          e.a += 1.5 * STEP;
          if (e.r < unit * 0.9) e.r += unit * 0.9 * STEP;
        } else {
          e.r -= e.speed * STEP;
        }
        const covered = angleDiff(e.a, world.shield.a) < arc + 0.05;
        e.coveredFor = covered ? e.coveredFor + STEP : 0;

        // Shots. Comets ignore them.
        if (e.kind !== "comet") {
          for (const shot of world.shots) {
            if (shot.dead || Math.abs(shot.r - e.r) > unit * 0.09 || angleDiff(shot.a, e.a) > (unit * 0.1) / Math.max(e.r, 1)) continue;
            shot.dead = true;
            e.dead = true;
            const [x, y] = toXY(e.a, e.r);
            if (e.kind === "nova") {
              world.enemies.forEach((o) => {
                if (o.kind !== "nova" && !o.dead) {
                  const [ox, oy] = toXY(o.a, o.r);
                  burst(world, ox, oy, DANGER, 8);
                  o.dead = true;
                  world.score += 10;
                }
              });
              world.flash = 1;
              world.pops.push({ x, y, life: 1, text: "NOVA" });
              burst(world, x, y, ACCENT, 40);
            } else {
              award(world, 10, x, y);
              burst(world, x, y, e.charger ? ACCENT : DANGER, 10);
              if (e.charger) {
                world.hp = Math.min(100, world.hp + 25);
                world.pops.push({ x, y: y - 18, life: 0.9, text: "+25 HP" });
              }
              if (e.kind === "splitter") {
                [-0.52, 0.52].forEach((d) => added.push({ ...e, kind: "meteor", a: e.a + d * 0.5, dead: false, charger: false, coveredFor: 0 }));
              }
            }
            break;
          }
          if (e.dead) continue;
        }

        // Shield
        if (e.kind !== "nova" && e.orbit <= 0 && e.r <= shieldR() + unit * 0.03 && e.r > planetR() && covered) {
          const [x, y] = toXY(e.a, shieldR());
          world.hp = Math.max(0, world.hp - COST[e.kind]);
          burst(world, x, y, ACCENT, 12);
          if (motion) world.shake = Math.max(world.shake, 0.25);
          const perfect = e.coveredFor < 0.22;
          award(world, perfect ? 20 : 10, x, y, perfect ? "PERFECT " : "");
          if (e.kind === "drone") {
            e.orbit = 2.4; // Bounces off, circles and comes back
          } else {
            e.dead = true;
          }
          continue;
        }

        // Planet
        if (e.kind !== "nova" && e.r <= planetR()) {
          e.dead = true;
          world.lives--;
          world.hits = 0;
          const [x, y] = toXY(e.a, planetR());
          burst(world, x, y, DANGER, 28);
          if (motion) world.shake = 1;
          if (world.lives <= 0) {
            const best = Math.max(readBest(), world.score);
            try {
              localStorage.setItem(BEST_KEY, String(best));
            } catch {
              // The best score is a nicety; playing without storage is fine.
            }
            phaseRef.current = "over";
            setPhase("over");
            setResult({ score: world.score, best, wave: world.wave });
          }
        }
      }
      world.enemies = world.enemies.filter((e) => !e.dead).concat(added);
      world.shots = world.shots.filter((s) => !s.dead);
      for (const p of world.sparks) {
        p.x += p.vx * STEP;
        p.y += p.vy * STEP;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.life -= STEP;
      }
      world.sparks = world.sparks.filter((p) => p.life > 0);
      for (const p of world.pops) {
        p.y -= 26 * STEP;
        p.life -= STEP;
      }
      world.pops = world.pops.filter((p) => p.life > 0);
      world.shake = Math.max(0, world.shake - STEP * 3);
      world.flash = Math.max(0, world.flash - STEP * 2);
    };

    // ---- Drawing
    const drawWheel = (side: "shield" | "cannon", angle: number, active: boolean) => {
      const [x, y] = wheelCenter(side);
      ctx.beginPath();
      ctx.arc(x, y, wheelR, 0, TAU);
      ctx.fillStyle = "#161A22";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = active ? ACCENT : "#2A303C";
      ctx.stroke();
      ctx.lineCap = "round";
      ctx.strokeStyle = active ? INK : MUTED;
      ctx.lineWidth = 2;
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * TAU + angle;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * wheelR * 0.74, y + Math.sin(a) * wheelR * 0.74);
        ctx.lineTo(x + Math.cos(a) * wheelR * 0.9, y + Math.sin(a) * wheelR * 0.9);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(x, y, wheelR * 0.5, 0, TAU);
      ctx.strokeStyle = "#2A303C";
      ctx.stroke();
      ctx.fillStyle = MUTED;
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.textAlign = side === "shield" ? "left" : "right";
      ctx.fillText(side === "shield" ? "SHIELD" : "CANNON", side === "shield" ? 12 : w - 12, h - wheelR - 12);
    };

    const draw = () => {
      const world = worldRef.current;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#0B0D12";
      ctx.fillRect(0, 0, w, h);
      ctx.save();
      if (world.shake > 0) ctx.translate((Math.random() - 0.5) * 12 * world.shake, (Math.random() - 0.5) * 12 * world.shake);

      ctx.strokeStyle = "#131720";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = (cx % 56); x < w; x += 56) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
      for (let y = (cy % 56); y < h; y += 56) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
      ctx.stroke();

      ctx.setLineDash([3, 9]);
      ctx.strokeStyle = "#2A303C";
      ctx.beginPath();
      ctx.arc(cx, cy, unit * 1.02, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = LINE;
      ctx.beginPath();
      ctx.arc(cx, cy, shieldR(), 0, TAU);
      ctx.stroke();

      // Enemies
      for (const e of world.enemies) {
        const [x, y] = toXY(e.a, e.r);
        if (e.warn > 0) {
          ctx.strokeStyle = DANGER;
          ctx.globalAlpha = 0.25 + 0.3 * Math.sin(e.warn * 26);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(...toXY(e.a, shieldR()));
          ctx.lineTo(...toXY(e.a, unit * 1.9));
          ctx.stroke();
          ctx.globalAlpha = 1;
          continue;
        }
        const s = unit * 0.05;
        if (e.kind === "nova") {
          ctx.strokeStyle = ACCENT;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, s * 1.5, 0, TAU);
          ctx.stroke();
          for (let i = 0; i < 8; i++) {
            const a = (i / 8) * TAU + world.t * 2;
            ctx.beginPath();
            ctx.moveTo(x + Math.cos(a) * s * 0.4, y + Math.sin(a) * s * 0.4);
            ctx.lineTo(x + Math.cos(a) * s, y + Math.sin(a) * s);
            ctx.stroke();
          }
          continue;
        }
        ctx.fillStyle = e.charger ? "#0B0D12" : DANGER;
        ctx.strokeStyle = e.charger ? ACCENT : DANGER;
        ctx.lineWidth = 2.5;
        if (e.kind === "comet") {
          const [tx, ty] = toXY(e.a, e.r + unit * 0.3);
          const tail = ctx.createLinearGradient(x, y, tx, ty);
          tail.addColorStop(0, DANGER);
          tail.addColorStop(1, "rgba(255,138,122,0)");
          ctx.strokeStyle = tail;
          ctx.lineWidth = s * 0.9;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(tx, ty);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x, y, s * 0.7, 0, TAU);
          ctx.fill();
        } else if (e.kind === "drone") {
          ctx.beginPath();
          ctx.arc(x, y, s, 0, TAU);
          ctx.fillStyle = "#0B0D12";
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = DANGER;
          ctx.beginPath();
          ctx.arc(x, y, s * 0.35, 0, TAU);
          ctx.fill();
        } else if (e.kind === "splitter") {
          [-1, 1].forEach((d) => {
            const px = x + Math.cos(e.a + Math.PI / 2) * s * 0.75 * d;
            const py = y + Math.sin(e.a + Math.PI / 2) * s * 0.75 * d;
            ctx.beginPath();
            ctx.arc(px, py, s * 0.8, 0, TAU);
            ctx.fill();
            ctx.stroke();
          });
        } else {
          ctx.beginPath();
          ctx.arc(x, y, s, 0, TAU);
          ctx.fill();
          ctx.stroke();
        }
      }

      // Shots
      ctx.fillStyle = INK;
      for (const shot of world.shots) {
        const [x, y] = toXY(shot.a, shot.r);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, TAU);
        ctx.fill();
      }

      // Planet, cannon, shield
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(...toXY(world.cannon.a, planetR() * 0.9));
      ctx.lineTo(...toXY(world.cannon.a, planetR() + unit * 0.1));
      ctx.stroke();
      ctx.fillStyle = ACCENT;
      ctx.beginPath();
      ctx.arc(cx, cy, planetR(), 0, TAU);
      ctx.fill();
      const arc = arcHalf(world.hp);
      ctx.strokeStyle = ACCENT;
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(cx, cy, shieldR(), world.shield.a - arc, world.shield.a + arc);
      ctx.stroke();

      for (const p of world.sparks) {
        ctx.globalAlpha = Math.min(1, p.life * 2.4);
        ctx.fillStyle = p.c;
        ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
      }
      ctx.globalAlpha = 1;
      ctx.font = "13px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      for (const p of world.pops) {
        ctx.globalAlpha = Math.min(1, p.life * 2);
        ctx.fillStyle = ACCENT;
        ctx.fillText(p.text, p.x, p.y);
      }
      ctx.globalAlpha = 1;

      const dragging = (side: "shield" | "cannon") => [...drags.values()].some((d) => d.wheel === side);
      drawWheel("shield", world.shield.a, dragging("shield") || keys.has("a") || keys.has("d"));
      drawWheel("cannon", world.cannon.a, dragging("cannon") || keys.has("ArrowLeft") || keys.has("ArrowRight"));
      ctx.restore();

      if (world.flash > 0) {
        ctx.fillStyle = `rgba(61,242,198,${world.flash * 0.35})`;
        ctx.fillRect(0, 0, w, h);
      }

      // HUD
      if (phaseRef.current !== "intro") {
        ctx.textAlign = "left";
        ctx.fillStyle = MUTED;
        ctx.font = "12px 'JetBrains Mono', monospace";
        ctx.fillText(`WAVE ${String(world.wave).padStart(2, "0")}`, 24, 34);
        ctx.fillStyle = ACCENT;
        ctx.fillText(`COMBO x${combo(world.hits)}`, 24, 54);
        ctx.fillStyle = INK;
        ctx.font = "600 38px 'Space Grotesk', sans-serif";
        ctx.fillText(String(world.score), 24, 96);
        const barW = Math.min(120, w * 0.22);
        const right = w - 72;
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = i < world.lives ? ACCENT : "#2A303C";
          ctx.beginPath();
          ctx.arc(right - i * 20, 28, 6, 0, TAU);
          ctx.fill();
        }
        ctx.fillStyle = "#2A303C";
        ctx.fillRect(right - barW + 6, 44, barW, 5);
        ctx.fillStyle = ACCENT;
        ctx.fillRect(right - barW + 6, 44, (barW * world.hp) / 100, 5);
      }
    };

    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      acc = Math.min(acc + (now - last) / 1000, 0.1);
      last = now;
      if (document.hidden) return;
      while (acc >= STEP) {
        if (phaseRef.current === "play") step();
        acc -= STEP;
      }
      draw();
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return (
    <div className="game">
      <canvas ref={canvasRef} className="game__canvas" data-grab aria-label="Arcguard game. Turn the shield with A and D, aim the cannon with the left and right arrow keys." />
      {phase !== "play" && (
        <div className="game__overlay">
          {phase === "intro" ? (
            <>
              <p className="eyebrow">Arcguard · Browser demo</p>
              <h3>Two thumbs, two wheels, one planet.</h3>
              <ul className="game__legend">
                <li><b>Left wheel</b> turns the shield. <kbd>A</kbd> <kbd>D</kbd></li>
                <li><b>Right wheel</b> aims the cannon. It fires by itself. <kbd>←</kbd> <kbd>→</kbd></li>
                <li>Comets only stop at the shield. Block in the last moment for a Perfect.</li>
              </ul>
            </>
          ) : (
            <>
              <p className="eyebrow">Planet lost · Wave {String(result.wave).padStart(2, "0")}</p>
              <h3 className="game__score">{result.score}</h3>
              <p className="meta">Your best here: {result.best}</p>
            </>
          )}
          <button type="button" className="btn" onClick={start}>{phase === "intro" ? "Start the round" : "Play again"}</button>
        </div>
      )}
    </div>
  );
}
