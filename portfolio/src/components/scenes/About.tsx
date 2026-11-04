import { useRef } from "react";
import { MOTION_OK, ScrollTrigger, gsap, useGSAP } from "../../lib/motion";

const LEAD = ["From", "a", "complex", "problem", "to", "a"];
const ACCENT = ["scalable", "reality."];
const STACK = ["React", "TypeScript", ".NET", "C#", "Kotlin", "Jetpack Compose", "GSAP", "WebGL", "Tauri", "Claude Code"];
const WORDS = ["Maintainable", "Intuitive", "Scalable", "Alive", "Deliberate", "Thumb-first", "Real-time", "Agentic"];

function Marquee({ items, reverse }: { items: string[]; reverse?: boolean }) {
  const row = items.map((item) => (
    <span key={item} className="marquee__item">{item}<i /></span>
  ));
  return (
    <div className={`marquee__row${reverse ? " marquee__row--reverse" : ""}`} data-marquee={reverse ? -1 : 1}>
      <div className="marquee__inner">{row}{row}{row}{row}</div>
    </div>
  );
}

export function About() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: ref.current, start: "top top", end: "+=90%", pin: true, scrub: 0.5, anticipatePin: 1 },
        });
        tl.fromTo(".about__word", { opacity: 0, yPercent: 18, rotateX: -50 }, { opacity: 1, yPercent: 0, rotateX: 0, duration: 0.12, stagger: 0.05 }, 0)
          .from(".about__eyebrow", { autoAlpha: 0, x: -30, duration: 0.1 }, 0)
          .from(".marquee", { autoAlpha: 0, duration: 0.1 }, 0)
          .from(".about__copy > *", { y: 50, autoAlpha: 0, duration: 0.14, stagger: 0.05 }, 0.42)
          .to(".about__stage, .marquee", { y: -60, autoAlpha: 0, duration: 0.14 }, 0.86);

        // Marquees run on their own and get kicked along by scroll velocity, with a lean.
        const rows = gsap.utils.toArray<HTMLElement>("[data-marquee]");
        const runners = rows.map((row) => {
          const inner = row.querySelector(".marquee__inner");
          const dir = Number(row.dataset.marquee);
          return gsap.fromTo(inner, { xPercent: dir > 0 ? 0 : -25 }, { xPercent: dir > 0 ? -25 : 0, duration: 38, ease: "none", repeat: -1 });
        });
        const lean = gsap.quickTo(rows, "skewX", { duration: 0.6, ease: "power3" });
        ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => {
            const v = self.getVelocity();
            lean(gsap.utils.clamp(-16, 16, v / -180));
            const speed = 1 + Math.min(Math.abs(v) / 260, 11);
            runners.forEach((r) => {
              gsap.killTweensOf(r, "timeScale");
              r.timeScale(speed * (v < 0 ? -1 : 1));
              gsap.to(r, { timeScale: 1, duration: 1.3, ease: "power2.out" });
            });
          },
        });
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="about" className="about">
      <div className="about__stage">
        <div className="wrap">
          <p className="eyebrow about__eyebrow">About · What I do</p>
          <h2 className="about__title">
            {LEAD.map((w, i) => <span key={i} className="about__word">{w}{" "}</span>)}
            {ACCENT.map((w, i) => <span key={i} className="about__word about__word--accent">{w}{" "}</span>)}
          </h2>
          <div className="about__copy">
            <p>Full-stack developer with a focus on user friendly, scalable apps. Maintainable projects with intuitive and modern solutions, and a sweet tooth for AI.</p>
            <p>Under the name Veloq Labs I also build Android apps and games, where every motion is deliberate. A few of them are next. You can play with them right here.</p>
          </div>
        </div>
      </div>
      <div className="marquee" aria-hidden="true">
        <Marquee items={STACK} />
        <Marquee items={WORDS} reverse />
      </div>
    </section>
  );
}
