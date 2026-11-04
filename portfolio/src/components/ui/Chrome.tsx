import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, lockScroll, prefersMotion, scrollToTarget, useGSAP, MOTION_OK } from "../../lib/motion";
import { VMark } from "./Button";
import { EMAIL } from "../../data/projects";

const chapters = [
  { id: "hero", label: "Hello" },
  { id: "about", label: "About" },
  { id: "halodeck", label: "HaloDeck" },
  { id: "arcguard", label: "Arcguard" },
  { id: "veloqos", label: "Veloq OS" },
  { id: "work", label: "Shipped" },
  { id: "contact", label: "Contact" },
];

const anchor = (id: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  scrollToTarget(`#${id}`);
};

export function Header() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.matchMedia().add(MOTION_OK, () => {
      const show = gsap.quickTo(ref.current, "yPercent", { duration: 0.5, ease: "power3.out" });
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => show(self.direction > 0 && self.scroll() > 120 ? -130 : 0),
      });
    });
  });

  return (
    <header ref={ref} className="header">
      <a className="header__brand" href="#hero" onClick={anchor("hero")} aria-label="Vidar Martensson, back to top">
        <VMark />
        <span className="header__tag">Vidar Martensson</span>
      </a>
      <nav className="header__nav" aria-label="Main">
        <a href="#about" onClick={anchor("about")}>About</a>
        <a href="#halodeck" onClick={anchor("halodeck")}>Work</a>
        <a href="#contact" onClick={anchor("contact")}>Contact</a>
      </nav>
    </header>
  );
}

/** A thin progress line, the current chapter, and a ring that follows the cursor. */
export function Hud() {
  const lineRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(() => {
    gsap.matchMedia().add(MOTION_OK, () => {
      gsap.to(lineRef.current, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
      // Measured from the page, since scenes overlap and start before their neighbours end.
      const update = () => {
        const reach = window.scrollY + window.innerHeight * 0.1;
        let current = 0;
        chapters.forEach((chapter, i) => {
          const el = document.getElementById(chapter.id);
          const box = el?.closest(".pin-spacer") ?? el;
          if (box && box.getBoundingClientRect().top + window.scrollY <= reach) current = i;
        });
        setActive(current);
      };
      ScrollTrigger.create({ start: 0, end: "max", onUpdate: update, onRefresh: update });
    });
  });

  return (
    <>
      <div ref={lineRef} className="hud-line" aria-hidden="true" />
      <div className="hud" aria-hidden="true">
        <span className="hud__index">{String(active + 1).padStart(2, "0")}</span>
        <span className="hud__rule" />
        <span className="hud__label">{chapters[active].label}</span>
      </div>
    </>
  );
}

export function Cursor() {
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring || !prefersMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    gsap.set(ring, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
    const x = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3" });
    const y = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3" });
    let hovering: Element | null = null;
    let magnet: HTMLElement | null = null;

    const onMove = (e: PointerEvent) => {
      gsap.to(ring, { autoAlpha: 1, duration: 0.2, overwrite: "auto" });
      x(e.clientX);
      y(e.clientY);

      const target = e.target instanceof Element ? e.target.closest("a, button, [data-grab]") : null;
      if (target !== hovering) {
        hovering = target;
        gsap.to(ring, { scale: target ? 2.3 : 1, duration: 0.5, ease: "back.out(2.4)" });
        ring.classList.toggle("is-active", Boolean(target));
      }

      const nextMagnet = e.target instanceof Element ? e.target.closest<HTMLElement>("[data-magnet]") : null;
      if (magnet && magnet !== nextMagnet) gsap.to(magnet, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" });
      magnet = nextMagnet;
      if (magnet) {
        const rect = magnet.getBoundingClientRect();
        gsap.to(magnet, {
          x: (e.clientX - rect.left - rect.width / 2) * 0.32,
          y: (e.clientY - rect.top - rect.height / 2) * 0.32,
          duration: 0.4,
          ease: "power3.out",
          overwrite: "auto",
        });
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return <div ref={ringRef} className="cursor" aria-hidden="true" />;
}

/** The mark draws itself while a counter runs, then the curtain lifts into the hero. */
export function Preloader() {
  const ref = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(() => !prefersMotion());

  useGSAP(
    () => {
      if (done) return;
      lockScroll(true);
      window.scrollTo(0, 0);
      const counter = { value: 0 };
      gsap
        .timeline({
          onComplete: () => {
            lockScroll(false);
            setDone(true);
          },
        })
        .fromTo(".pre__stroke", { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 0.9, ease: "power3.inOut", stagger: 0.14 })
        .fromTo(".pre__dot", { scale: 0, transformOrigin: "center" }, { scale: 1, duration: 0.5, ease: "back.out(3)" }, 0.8)
        .to(counter, { value: 100, duration: 1.15, ease: "power2.inOut", onUpdate: () => { if (countRef.current) countRef.current.textContent = String(Math.round(counter.value)).padStart(3, "0"); } }, 0)
        .to(".pre__mark", { scale: 0.7, autoAlpha: 0, duration: 0.35, ease: "power2.in" }, 1.2)
        .to(".pre__count", { autoAlpha: 0, duration: 0.25 }, 1.2)
        .to(ref.current, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.7, ease: "expo.inOut" }, 1.25);
    },
    { scope: ref },
  );

  if (done) return null;
  return (
    <div ref={ref} className="pre" aria-hidden="true">
      <svg className="pre__mark" width="110" height="110" viewBox="0 0 120 120" fill="none">
        <line className="pre__stroke" pathLength={100} strokeDasharray="100" x1="18" y1="40" x2="50" y2="104" stroke="#F2F4F8" strokeWidth="14" strokeLinecap="round" />
        <line className="pre__stroke" pathLength={100} strokeDasharray="100" x1="50" y1="104" x2="90" y2="33" stroke="#3DF2C6" strokeWidth="14" strokeLinecap="round" />
        <circle className="pre__dot" cx="102" cy="13" r="8" fill="#3DF2C6" />
      </svg>
      <span ref={countRef} className="pre__count">000</span>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <span>© {new Date().getFullYear()} Vidar Martensson</span>
      <span>Built with React, GSAP and WebGL</span>
      <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
    </footer>
  );
}
