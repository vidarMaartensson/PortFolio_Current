import { useRef } from "react";
import { Button, VMark } from "../ui/Button";
import { DESKTOP, MOTION_OK, gsap, scrollToTarget, useGSAP } from "../../lib/motion";
import { EMAIL } from "../../data/projects";
import avatar from "../../assets/avatar.webp";

const NAME = "VIDAR".split("");
// Where each letter of the name is thrown when the scroll takes over.
const THROWS = [
  { x: -150, y: -70, r: -38, rx: 70 },
  { x: -70, y: 130, r: 24, rx: -80 },
  { x: 0, y: -160, r: -8, rx: 110 },
  { x: 80, y: 140, r: -26, rx: -70 },
  { x: 170, y: -60, r: 42, rx: 80 },
];

export function Hero() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const letters = gsap.utils.toArray<HTMLElement>(".hero__char");

        // Entrance, once the preloader's curtain has started lifting
        gsap
          .timeline({ delay: 1.3 })
          .from(letters, { yPercent: 118, rotate: 9, duration: 1.3, ease: "expo.out", stagger: 0.06 }, 0)
          .from(".hero__portrait", { y: 160, scale: 0.86, opacity: 0, duration: 1.5, ease: "expo.out" }, 0.2)
          .from(".hero__ghost", { scale: 0.7, autoAlpha: 0, duration: 2, ease: "power3.out" }, 0)
          .from(".hero__rise", { y: 34, autoAlpha: 0, duration: 1, ease: "power3.out", stagger: 0.09 }, 0.55);

        // The scroll: the name flies apart while the portrait rises away with the text
        const scroll = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: ref.current, start: "top top", end: "+=60%", pin: true, scrub: 0.6, anticipatePin: 1 },
        });
        scroll
          .to(".hero__intro, .hero__side", { y: -50, autoAlpha: 0, duration: 0.09, stagger: 0.008 }, 0)
          .to(".hero__portrait-wrap", { yPercent: -45, autoAlpha: 0, duration: 0.2, ease: "power1.in" }, 0)
          .to(".hero__ghost", { scale: 3.4, rotate: 14, autoAlpha: 0, duration: 0.5, ease: "power1.in" }, 0.02);
        gsap.utils.toArray<HTMLElement>(".hero__throw").forEach((letter, i) => {
          const t = THROWS[i];
          scroll.to(
            letter,
            {
              xPercent: t.x,
              yPercent: t.y,
              rotate: t.r,
              rotationX: t.rx,
              scale: 2.1,
              autoAlpha: 0,
              duration: 0.42,
              ease: "power2.in",
            },
            0.03 + Math.abs(i - 2) * 0.025,
          );
        });

        // Pointer: the letters thicken like the Veloq wordmark, the portrait leans
        mm.add(DESKTOP, () => {
          const portraitX = gsap.quickTo(".hero__portrait-wrap", "x", { duration: 1.1, ease: "power3" });
          const portraitY = gsap.quickTo(".hero__portrait-wrap", "y", { duration: 1.1, ease: "power3" });
          const ghostX = gsap.quickTo(".hero__ghost", "x", { duration: 1.6, ease: "power3" });
          const centers = letters.map((_, i) => (i + 0.5) / letters.length);
          const onMove = (e: PointerEvent) => {
            if (window.scrollY > window.innerHeight) return;
            const px = e.clientX / window.innerWidth;
            const py = e.clientY / window.innerHeight;
            portraitX((px - 0.5) * 12);
            portraitY((py - 0.5) * 7);
            ghostX((px - 0.5) * -22);
            letters.forEach((letter, i) => {
              const d = px - centers[i];
              const f = Math.exp(-(d * d) / 0.012);
              gsap.to(letter, { fontWeight: Math.round(300 + 400 * f), color: f > 0.55 ? "#3DF2C6" : "#F2F4F8", duration: 0.5, overwrite: "auto" });
            });
          };
          const onLeave = () => gsap.to(letters, { fontWeight: 600, color: "#F2F4F8", duration: 0.6, overwrite: "auto" });
          // On the window, since sections let pointer events through to the scene below.
          window.addEventListener("pointermove", onMove, { passive: true });
          document.documentElement.addEventListener("pointerleave", onLeave);
          return () => {
            window.removeEventListener("pointermove", onMove);
            document.documentElement.removeEventListener("pointerleave", onLeave);
          };
        });
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="hero" className="hero">
      <div className="hero__ghost" aria-hidden="true"><VMark size={900} /></div>

      <h1 className="hero__word" aria-label="Vidar Martensson, full-stack developer">
        <span className="hero__letters" aria-hidden="true">
          {NAME.map((c, i) => (
            <span key={i} className="hero__throw">
              <span className="hero__mask">
                <span className="hero__char">{c}</span>
              </span>
            </span>
          ))}
        </span>
      </h1>

      <div className="hero__portrait-wrap">
        <img id="portrait" className="hero__portrait" src={avatar} width={880} height={1100} alt="Illustrated portrait of Vidar Martensson" />
      </div>

      <div className="hero__footer">
        <div className="hero__intro">
          <p className="hero__lockup hero__rise" aria-hidden="true"><i />Martensson<i /></p>
          <p className="mono-tag hero__rise">Full-stack developer · 3 years of experience</p>
        </div>
        <div className="hero__side">
          <p className="hero__lede hero__rise">I build apps that scale and feel alive – from .NET back ends to wheels you spin with your thumb.</p>
          <div className="hero__cta hero__rise">
            <Button href="#halodeck" arrow onClick={(e) => { e.preventDefault(); scrollToTarget("#halodeck"); }}>See my projects</Button>
            <Button variant="ghost" href={`mailto:${EMAIL}`}>Get in touch</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
