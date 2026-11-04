import { useRef } from "react";
import { Button } from "../ui/Button";
import { Footer } from "../ui/Chrome";
import { MOTION_OK, gsap, useGSAP } from "../../lib/motion";
import { EMAIL, GITHUB_PROFILE } from "../../data/projects";

const LINES = [
  { text: "Let's build", accent: false },
  { text: "something that", accent: false },
  { text: "feels alive.", accent: true },
];

export function Contact() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        const chars = gsap.utils.toArray<HTMLElement>(".contact__char");
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: ref.current, start: "top top", end: "+=70%", pin: true, scrub: 0.5, anticipatePin: 1 },
        });
        // The letters rain in from all over and settle with a bounce.
        tl.from(chars, {
          y: () => gsap.utils.random(-window.innerHeight, window.innerHeight * 0.4),
          x: () => gsap.utils.random(-300, 300),
          rotation: () => gsap.utils.random(-140, 140),
          scale: () => gsap.utils.random(0.3, 2.4),
          opacity: 0,
          duration: 0.5,
          ease: "back.out(1.5)",
          stagger: { amount: 0.3, from: "random" },
        }, 0).from(".contact__rise", { y: 50, autoAlpha: 0, duration: 0.14, stagger: 0.04 }, 0.72);
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="contact" className="contact" data-anchor="end">
      <div className="wrap contact__inner">
        <p className="eyebrow contact__rise">Contact</p>
        <h2 className="display" aria-label={LINES.map((l) => l.text).join(" ")}>
          {LINES.map((line) => (
            <span key={line.text} className={line.accent ? "contact__line accent" : "contact__line"} aria-hidden="true">
              {line.text.split(" ").map((word, w) => (
                <span key={w} className="contact__wordbox">
                  {word.split("").map((c, i) => <span key={i} className="contact__char">{c}</span>)}
                </span>
              ))}
            </span>
          ))}
        </h2>
        <p className="contact__lede contact__rise">Open to full-stack roles, and to anything that has to feel really good in the hand.</p>
        <div className="contact__cta contact__rise">
          <Button href={`mailto:${EMAIL}`} arrow>Get in touch</Button>
          <Button variant="ghost" href={GITHUB_PROFILE} external>GitHub</Button>
        </div>
      </div>
      <Footer />
    </section>
  );
}
