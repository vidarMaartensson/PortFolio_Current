import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { gsap } from "../../lib/motion";

export type Face = "clock" | "neon" | "vinyl" | "radar";

export interface HaloWheelHandle {
  setFace: (face: Face) => void;
  /** Extra rotation from the outside, in degrees. Used to spin the wheel with the page. */
  setScrollAngle: (deg: number) => void;
}

const APPS = [
  { name: "Camera", d: "M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" },
  { name: "Messages", d: "M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4v-4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" },
  { name: "Music", d: "M9 18V6l11-2v12M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" },
  { name: "Maps", d: "M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.500 7 12 7 12zM12 11.500a2.500 2.500 0 1 0 0-5 2.500 2.500 0 0 0 0 5z" },
  { name: "Phone", d: "M5 4h4l2 5-2.500 1.500a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1C10.700 20 4 13.300 4 5a1 1 0 0 1 1-1z" },
  { name: "Calendar", d: "M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM4 10h16M8 3v4M16 3v4" },
  { name: "Clock", d: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.500 2" },
  { name: "Settings", d: "M4 7h9M17 7h3M4 17h3M11 17h9M15 9.500a2.500 2.500 0 1 0 0-5 2.500 2.500 0 0 0 0 5zM9 19.500a2.500 2.500 0 1 0 0-5 2.500 2.500 0 0 0 0 5z" },
  { name: "Mail", d: "M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM3 7l9 6 9-6" },
  { name: "Browser", d: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.500 2.500 3.500 5.500 3.500 9s-1 6.500-3.500 9c-2.500-2.500-3.500-5.500-3.500-9s1-6.500 3.500-9z" },
  { name: "Photos", d: "M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM4 16l5-5 4 4 2.500-2.500L20 17M15.500 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" },
  { name: "Notes", d: "M6 3h9l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM9 12h6M9 16h6" },
];
const SLOT = 360 / APPS.length;
const SIZE = 400;
const RADIUS = 340;
const ICON_RADIUS = 240;
const POINTER_DEG = 225; // Up and to the left, where the thumb points from the corner

// Same feel as the app: exponential friction and a spring into the slot (HaloDeck's SnapLogic).
const FRICTION = 4;
const STIFFNESS = 200;
const DAMPING = 2 * 0.9 * Math.sqrt(STIFFNESS);

const polar = (deg: number, r: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [SIZE + Math.cos(a) * r, SIZE + Math.sin(a) * r];
};

const ticks = Array.from({ length: 60 }, (_, i) => {
  const deg = i * 6;
  const [x1, y1] = polar(deg, RADIUS - 8);
  const [x2, y2] = polar(deg, RADIUS - (i % 5 === 0 ? 34 : 20));
  return { x1, y1, x2, y2, major: i % 5 === 0 };
});

interface Props {
  face?: Face;
  /** Show the face switcher, for the full-size demo. */
  controls?: boolean;
}

export const HaloWheel = forwardRef<HaloWheelHandle, Props>(function HaloWheel({ face: initial = "clock", controls }, ref) {
  const rootRef = useRef<HTMLDivElement>(null);
  const rotRef = useRef<SVGGElement>(null);
  const sweepRef = useRef<SVGGElement>(null);
  const iconRefs = useRef<(SVGGElement | null)[]>([]);
  const labelRef = useRef<HTMLSpanElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);
  const state = useRef({ theta: 0, velocity: 0, dragging: false, lastAngle: 0, lastTime: 0, scroll: 0, selected: -1, downX: 0, downY: 0, moved: false });
  const [face, setFaceState] = useState<Face>(initial);
  const [time] = useState(() => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));

  const setFace = (next: Face) => {
    rootRef.current?.setAttribute("data-face", next);
    setFaceState(next);
  };

  useImperativeHandle(ref, () => ({
    setFace: (next) => rootRef.current?.setAttribute("data-face", next),
    setScrollAngle: (deg) => { state.current.scroll = deg; },
  }));

  useEffect(() => {
    const s = state.current;
    const tick = (t: number, deltaMs: number) => {
      const dt = Math.min(deltaMs / 1000, 1 / 30);
      if (!s.dragging) {
        const speed = Math.abs(s.velocity);
        if (speed > 70) {
          s.velocity *= Math.exp(-FRICTION * dt);
        } else {
          const target = Math.round(s.theta / SLOT) * SLOT;
          s.velocity += (STIFFNESS * (target - s.theta) - DAMPING * s.velocity) * dt;
        }
        s.theta += s.velocity * dt;
      }
      const total = s.theta + s.scroll;
      rotRef.current?.setAttribute("transform", `rotate(${total} ${SIZE} ${SIZE})`);
      iconRefs.current.forEach((g, i) => {
        if (!g) return;
        const [x, y] = polar(i * SLOT + POINTER_DEG, ICON_RADIUS);
        g.setAttribute("transform", `rotate(${-total} ${x} ${y})`);
      });
      sweepRef.current?.setAttribute("transform", `rotate(${(t * 70) % 360} ${SIZE} ${SIZE})`);

      const selected = ((Math.round(-total / SLOT) % APPS.length) + APPS.length) % APPS.length;
      if (selected !== s.selected) {
        s.selected = selected;
        if (labelRef.current) labelRef.current.textContent = APPS[selected].name;
        iconRefs.current.forEach((g, i) => g?.classList.toggle("is-selected", i === selected));
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  const angleAt = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // The wheel's centre is the bottom-right corner of the svg.
    return (Math.atan2(e.clientY - rect.bottom, e.clientX - rect.right) * 180) / Math.PI;
  };

  const open = () => {
    const s = state.current;
    if (Math.abs(s.velocity) > 40) return;
    if (toastRef.current) {
      toastRef.current.textContent = `Opening ${APPS[s.selected].name}`;
      gsap.fromTo(toastRef.current, { autoAlpha: 0, y: 14, scale: 0.92 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(2.4)" });
      gsap.to(toastRef.current, { autoAlpha: 0, y: -10, duration: 0.3, delay: 1.1 });
    }
    gsap.fromTo(".wheel-pulse", { attr: { r: 40 }, opacity: 0.7 }, { attr: { r: RADIUS }, opacity: 0, duration: 0.8, ease: "power2.out" });
  };

  const onDown = (e: React.PointerEvent) => {
    const s = state.current;
    e.currentTarget.setPointerCapture(e.pointerId);
    s.dragging = true;
    s.velocity = 0;
    s.lastAngle = angleAt(e);
    s.lastTime = performance.now();
    s.downX = e.clientX;
    s.downY = e.clientY;
    s.moved = false;
  };
  const onMove = (e: React.PointerEvent) => {
    const s = state.current;
    if (!s.dragging) return;
    if (Math.hypot(e.clientX - s.downX, e.clientY - s.downY) > 8) s.moved = true;
    const angle = angleAt(e);
    let delta = angle - s.lastAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const now = performance.now();
    const dt = Math.max((now - s.lastTime) / 1000, 1 / 240);
    s.theta += delta;
    s.velocity = s.velocity * 0.6 + (delta / dt) * 0.4;
    s.lastAngle = angle;
    s.lastTime = now;
  };
  const onUp = (e: React.PointerEvent) => {
    const s = state.current;
    s.dragging = false;
    // Double-tapping isn't reliable on phones, so a plain tap opens the app there.
    if (e.type === "pointerup" && e.pointerType === "touch" && !s.moved) open();
  };

  const onKey = (e: React.KeyboardEvent) => {
    const s = state.current;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") s.theta = Math.round(s.theta / SLOT) * SLOT + SLOT;
    else if (e.key === "ArrowRight" || e.key === "ArrowDown") s.theta = Math.round(s.theta / SLOT) * SLOT - SLOT;
    else if (e.key === "Enter" || e.key === " ") open();
    else return;
    e.preventDefault();
  };

  const [px, py] = polar(POINTER_DEG, RADIUS + 18);

  return (
    <div className="deck">
      <div ref={rootRef} className="phone" data-face={initial}>
        <div className="phone__screen">
          <div className="phone__status"><span>{time}</span><i /></div>
          <div className="phone__clock" aria-hidden="true">{time}</div>
          <div className="phone__label"><small>Selected</small><span ref={labelRef} aria-live="polite">Camera</span></div>
          <div ref={toastRef} className="phone__toast" />
          <svg
            className="wheel"
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            role="slider"
            tabIndex={0}
            aria-label="HaloDeck wheel. Use the arrow keys to spin, Enter to open."
            aria-valuemin={0}
            aria-valuemax={APPS.length - 1}
            aria-valuenow={0}
            data-grab
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onKeyDown={onKey}
            onDoubleClick={open}
          >
            <defs>
              <radialGradient id="radar-fade" cx="100%" cy="100%" r="100%">
                <stop offset="0" stopColor="#3DF2C6" stopOpacity="0" />
                <stop offset="1" stopColor="#3DF2C6" stopOpacity=".3" />
              </radialGradient>
            </defs>
            <circle cx={SIZE} cy={SIZE} r={RADIUS} className="wheel__disc" />
            <circle className="wheel-pulse" cx={SIZE} cy={SIZE} r={40} fill="none" stroke="#3DF2C6" strokeWidth="3" opacity="0" />
            <g className="face face--radar">
              <g ref={sweepRef}>
                <path d={`M${SIZE} ${SIZE}L${polar(-44, RADIUS).join(" ")}A${RADIUS} ${RADIUS} 0 0 1 ${polar(0, RADIUS).join(" ")}Z`} fill="#3DF2C6" opacity=".24" />
              </g>
              {[110, 190, 270].map((r) => <circle key={r} cx={SIZE} cy={SIZE} r={r} className="face__line" />)}
            </g>
            <g ref={rotRef}>
              <g className="face face--clock">
                {ticks.map((t, i) => <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} className={t.major ? "tick tick--major" : "tick"} />)}
              </g>
              <g className="face face--vinyl">
                {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={SIZE} cy={SIZE} r={90 + i * 18} className="face__groove" />)}
              </g>
              {APPS.map((app, i) => {
                const [x, y] = polar(i * SLOT + POINTER_DEG, ICON_RADIUS);
                return (
                  <g key={app.name} ref={(el) => { iconRefs.current[i] = el; }} className="wheel__app">
                    <circle cx={x} cy={y} r="46" className="wheel__tile" />
                    <g transform={`translate(${x - 24} ${y - 24}) scale(2)`}>
                      <path d={app.d} className="wheel__icon" />
                    </g>
                  </g>
                );
              })}
            </g>
            <circle cx={SIZE} cy={SIZE} r={RADIUS} className="wheel__rim" />
            <circle cx={SIZE} cy={SIZE} r={RADIUS} className="wheel__glow" />
            <circle cx={SIZE} cy={SIZE} r={100} className="wheel__hub" />
            <path d={`M${px} ${py}l26 -8l-8 26z`} className="wheel__pointer" />
          </svg>
        </div>
      </div>
      {controls && (
        <div className="deck__controls" role="group" aria-label="Wheel face">
          {(["clock", "neon", "vinyl", "radar"] as Face[]).map((f) => (
            <button key={f} type="button" className={f === face ? "chip is-on" : "chip"} onClick={() => setFace(f)}>{f}</button>
          ))}
        </div>
      )}
    </div>
  );
});
