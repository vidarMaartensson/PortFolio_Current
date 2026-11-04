import { useRef, useState } from "react";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { ArcguardGame } from "./ArcguardGame";
import { MOTION_OK, gsap, useGSAP } from "../../lib/motion";
import round from "../../assets/arcguard/01_round.jpg";
import perfect from "../../assets/arcguard/02_perfect.jpg";
import stasis from "../../assets/arcguard/03_stasis.jpg";
import nova from "../../assets/arcguard/04_nova.jpg";
import daily from "../../assets/arcguard/05_daily.jpg";
import over from "../../assets/arcguard/06_over.jpg";

const SHOTS = [
  { src: round, alt: "A round of Arcguard: the planet in the middle, a wheel in each bottom corner" },
  { src: perfect, alt: "A Perfect block, worth double points" },
  { src: stasis, alt: "Stasis, a cone of light that freezes enemies" },
  { src: nova, alt: "Nova, a shockwave that clears the screen" },
  { src: daily, alt: "The daily challenge" },
  { src: over, alt: "The game over screen with a shareable result" },
];

const ENEMIES = [
  { name: "Meteors", text: "drift in slowly. Block them or shoot them." },
  { name: "Comets", text: "come at triple speed. Shots pass right through." },
  { name: "Drones", text: "bounce off the shield and circle back." },
  { name: "Splitters", text: "break in two when you shoot them." },
];

export function Arcguard() {
  const ref = useRef<HTMLElement>(null);
  const [playing, setPlaying] = useState(false);

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        const slots = gsap.utils.toArray<HTMLElement>(".ring__slot");
        const phones = gsap.utils.toArray<HTMLElement>(".ring__phone");
        const enemies = gsap.utils.toArray<HTMLElement>(".enemy");
        const step = 360 / phones.length;
        // Wider than the screen on phones: the side cards run off the edges instead of overlapping.
        const radius = () => (window.innerWidth > 760 ? Math.min(window.innerWidth * 0.34, 440) : window.innerWidth * 0.52);

        // GSAP translates before it rotates, so the turn sits on a parent of the push outward.
        slots.forEach((slot, i) => gsap.set(slot, { rotationY: i * step }));
        gsap.set(phones, { z: radius });
        const ring = { rot: 120, fade: 0 };
        // Decode up front, so a card turning to the front for the first time can't hitch.
        gsap.utils.toArray<HTMLImageElement>(".ring__phone img").forEach((img) => img.decode?.().catch(() => {}));
        const paint = () => {
          gsap.set(".ring", { rotationY: ring.rot });
          phones.forEach((phone, i) => {
            // Dim the far side of the ring, so the planet stays visible through it.
            const facing = Math.cos(((i * step + ring.rot) * Math.PI) / 180);
            gsap.set(phone, { autoAlpha: gsap.utils.mapRange(-1, 1, 0.12, 1, facing) * ring.fade });
          });
        };

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: ref.current, start: "top top", end: "+=170%", pin: true, scrub: 0.6, anticipatePin: 1 },
        });
        tl.from(".ag__char", { yPercent: 130, rotationX: -90, opacity: 0, duration: 0.09, stagger: { each: 0.008, from: "center" }, ease: "back.out(1.8)" }, 0)
          // Fade the cards themselves: opacity on anything around the ring flattens its 3D,
          // and it snaps back into depth the moment it reaches full opacity.
          .to(ring, { fade: 1, duration: 0.06, onUpdate: paint }, 0.06)
          .fromTo(".ring-tilt", { scale: 0.4, rotationX: 50 }, { scale: 1, rotationX: -7, duration: 0.42, ease: "sine.inOut" }, 0.06)
          .to(ring, { rot: 120 - 360 * 1.15, duration: 0.84, ease: "sine.inOut", onUpdate: paint }, 0.08)
          .to(".ag__word", { yPercent: -36, scale: 0.42, duration: 0.2, ease: "power2.inOut" }, 0.1)
          .from(".ag__copy", { y: 40, autoAlpha: 0, duration: 0.07 }, 0.12)
          .from(".ag__side", { y: 40, autoAlpha: 0, duration: 0.07 }, 0.14)
          .to(".ag__word, .ag__layout", { autoAlpha: 0, duration: 0.09 }, 0.91)
          .to(ring, { fade: 0, duration: 0.09, onUpdate: paint }, 0.91);

        enemies.forEach((enemy, i) => {
          const at = 0.2 + i * 0.17;
          if (i > 0) gsap.set(enemy, { autoAlpha: 0 });
          if (i > 0) tl.fromTo(enemy, { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, duration: 0.03 }, at);
          if (i < enemies.length - 1) tl.to(enemy, { autoAlpha: 0, x: -40, duration: 0.03 }, at + 0.14);
        });
        paint();
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="arcguard" className="scene ag">
      <h2 className="ag__word" aria-label="Arcguard">
        {"ARCGUARD".split("").map((c, i) => (
          <span key={i} className={i >= 4 && i <= 6 ? "ag__char accent" : "ag__char"} aria-hidden="true">{c}</span>
        ))}
      </h2>

      <div className="ring-stage">
        <div className="ring-tilt">
          <div className="ring">
            {SHOTS.map((shot) => (
              <div key={shot.src} className="ring__slot">
                <figure className="ring__phone">
                  <img src={shot.src} alt={shot.alt} width={550} height={1100} />
                </figure>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap ag__layout">
        <div className="ag__copy">
          <p className="eyebrow">02 · Arcguard · Game · Android</p>
          <h3 className="h2-quiet">Two thumbs, two wheels, one planet.</h3>
          <p>Shield in your left thumb, cannon in your right. A minimalist arcade game about holding the line, written in Kotlin with no game engine.</p>
        </div>
        <div className="ag__side">
          <div className="enemies" aria-label="Enemies">
            {ENEMIES.map((enemy) => (
              <p key={enemy.name} className="enemy"><i /><b>{enemy.name}</b> {enemy.text}</p>
            ))}
          </div>
          <Button arrow onClick={() => setPlaying(true)}>Play the demo</Button>
        </div>
      </div>

      <Modal isOpen={playing} onClose={() => setPlaying(false)} label="Arcguard demo" size="stage">
        <ArcguardGame />
      </Modal>
    </section>
  );
}
