import { useRef } from "react";
import { Button, GitHubIcon } from "../ui/Button";
import { MOTION_OK, gsap, useGSAP } from "../../lib/motion";
import { VELOQ_OS_GITHUB } from "../../data/projects";
import overview from "../../assets/veloqos/overview.jpg";
import inbox from "../../assets/veloqos/inbox.jpg";
import linear from "../../assets/veloqos/linear.jpg";
import routines from "../../assets/veloqos/routines.jpg";
import skills from "../../assets/veloqos/skills.jpg";

const SCREENS = [
  { src: overview, label: "Overview", alt: "Veloq OS dashboard with calendar, inbox, disk and the voice assistant in the middle" },
  { src: inbox, label: "Inbox", alt: "Veloq OS inbox, sorted by what needs an answer" },
  { src: linear, label: "Linear", alt: "Veloq OS Linear view with open stories" },
  { src: routines, label: "Routines", alt: "Veloq OS routines that run on a schedule" },
  { src: skills, label: "Skills", alt: "Veloq OS skills and chores that Claude Code runs" },
];

// Parts of the overview screenshot (x, y, w, h, as fractions) lifted into layers in 3D.
// Listed in the order they fall, and together they make up the whole board.
const LAYERS = [
  { x: 0, y: 0, w: 0.06, h: 1, z: 120 },
  { x: 0.08, y: 0.015, w: 0.9, h: 0.075, z: 260 },
  { x: 0.08, y: 0.102, w: 0.9, h: 0.097, z: 170 },
  { x: 0.08, y: 0.218, w: 0.269, h: 0.484, z: 230 },
  { x: 0.08, y: 0.722, w: 0.269, h: 0.278, z: 140 },
  { x: 0.362, y: 0.218, w: 0.336, h: 0.782, z: 300 },
  { x: 0.711, y: 0.218, w: 0.269, h: 0.484, z: 190 },
  { x: 0.711, y: 0.722, w: 0.269, h: 0.278, z: 120 },
];

const STACK = ["React + GSAP", ".NET 10 API", "Kotlin + Compose", "Tauri 2", "Claude Code"];

export function VeloqOs() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        const layers = gsap.utils.toArray<HTMLElement>(".os__layer");
        const shots = gsap.utils.toArray<HTMLElement>(".os__shot");
        const tabs = gsap.utils.toArray<HTMLElement>(".os__tab");

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: ref.current, start: "top top", end: "+=180%", pin: true, scrub: 0.6, anticipatePin: 1 },
        });

        // On the stage, not the window: opacity on the window would flatten its 3D layers.
        tl.from(".os__stage", { autoAlpha: 0, duration: 0.05 }, 0);
        tl.from(".os__head .eyebrow", { autoAlpha: 0, duration: 0.05 }, 0);
        // The loose pieces hang over an empty dotted frame, land together and form the board.
        tl.fromTo(".os__window", { rotationX: 58, rotationZ: -24, scale: 0.62, yPercent: 16 }, { rotationX: 0, rotationZ: 0, scale: 1, yPercent: 0, duration: 0.46, ease: "power2.inOut" }, 0);
        layers.forEach((layer, i) => {
          tl.fromTo(layer, { z: Number(layer.dataset.z) * 1.5 }, { z: 0, duration: 0.3, ease: "power2.inOut" }, 0.1 + i * 0.008);
        });
        tl.fromTo(shots[0], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 0.46);
        tl.to(".os__frame", { autoAlpha: 0, duration: 0.03 }, 0.44);
        tl.to(".os__window", { borderColor: "#2A303C", duration: 0.03 }, 0.44);
        tl.to(layers, { autoAlpha: 0, duration: 0.01 }, 0.47);
        tl.from(".os__title .line > span", { yPercent: 110, duration: 0.08, stagger: 0.02, ease: "power3.out" }, 0);
        tl.to(".os__head", { y: -60, autoAlpha: 0, duration: 0.08 }, 0.26);
        tl.from(".os__foot", { y: 60, autoAlpha: 0, duration: 0.07 }, 0.4);

        // Then each view wipes in over the last one.
        shots.forEach((shot, i) => {
          if (i === 0) return;
          const at = 0.5 + (i - 1) * 0.1;
          tl.fromTo(shot, { clipPath: "inset(0% 0% 0% 100%)", scale: 1.06 }, { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 0.09, ease: "power2.inOut" }, at);
          tl.to(tabs[i - 1], { color: "#9AA3B2", duration: 0.01 }, at);
          tl.to(tabs[i], { color: "#3DF2C6", duration: 0.01 }, at);
          tl.to(".os__marker", { xPercent: i * 100, duration: 0.09, ease: "power2.inOut" }, at);
        });
        tl.to(".os__stage, .os__foot", { autoAlpha: 0, duration: 0.09 }, 0.91);
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="veloqos" className="scene os">
      <div className="wrap os__head">
        <p className="eyebrow">03 · Veloq OS · Personal operating system</p>
        <h2 className="feature-title os__title">
          <span className="line"><span>Everything around the build,</span></span>
          <span className="line"><span className="accent">one voice away.</span></span>
        </h2>
      </div>

      <div className="os__stage">
        <div className="os__window">
          <div className="os__frame" aria-hidden="true" />
          {SCREENS.map((s, i) => <img key={s.label} className="os__shot" src={s.src} alt={s.alt} width={2400} height={1500} loading={i === 0 ? "eager" : "lazy"} />)}
          {LAYERS.map((l, i) => (
            <div
              key={i}
              className="os__layer"
              data-z={l.z}
              aria-hidden="true"
              style={{
                left: `${l.x * 100}%`,
                top: `${l.y * 100}%`,
                width: `${l.w * 100}%`,
                height: `${l.h * 100}%`,
                backgroundImage: `url(${overview})`,
                backgroundSize: `${100 / l.w}% ${100 / l.h}%`,
                backgroundPosition: `${l.w < 1 ? (l.x / (1 - l.w)) * 100 : 0}% ${l.h < 1 ? (l.y / (1 - l.h)) * 100 : 0}%`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="wrap os__foot">
        <div className="os__tabs" aria-hidden="true">
          <i className="os__marker" style={{ width: `${100 / SCREENS.length}%` }} />
          {SCREENS.map((s, i) => <span key={s.label} className="os__tab" style={i === 0 ? { color: "#3DF2C6" } : undefined}>{s.label}</span>)}
        </div>
        <p className="os__copy">A voice assistant in the middle, with mail, calendar, Linear, CI and routines around it. An API on my own machine, a Mac app and an Android app on top of it.</p>
        <div className="os__end">
          <ul className="os__stack">{STACK.map((s) => <li key={s} className="pill">{s}</li>)}</ul>
          <Button href={VELOQ_OS_GITHUB} external icon={<GitHubIcon />}>View on GitHub</Button>
        </div>
      </div>
    </section>
  );
}
