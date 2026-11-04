import { useRef, useState } from "react";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { HaloWheel, type Face, type HaloWheelHandle } from "./HaloWheel";
import { DESKTOP, MOBILE, MOTION_OK, gsap, useGSAP } from "../../lib/motion";

const FEATURES: { face: Face; title: string; body: string }[] = [
  { face: "clock", title: "Reach everything with your thumb.", body: "Pull a wheel out from the corner of the screen and spin. Momentum, friction and a soft snap, tuned until it feels physical." },
  { face: "neon", title: "A wheel that looks like yours.", body: "Clock, Neon, Vinyl, Aurora or Radar. Theme presets, icon packs, and an accent taken from your wallpaper." },
  { face: "radar", title: "It knows what you want next.", body: "A smart slot puts the recent or suggested app first. Profiles swap the whole wheel for certain hours, or when your headphones connect." },
];

export function HaloDeck() {
  const ref = useRef<HTMLElement>(null);
  const wheel = useRef<HaloWheelHandle>(null);
  const [demoOpen, setDemoOpen] = useState(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const panels = gsap.utils.toArray<HTMLElement>(".feat");
        const marks = gsap.utils.toArray<HTMLElement>(".feat-index i");
        const spin = { deg: 0 };
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: ref.current,
            start: "top top",
            end: "+=150%",
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
            onUpdate: (self) => {
              const k = Math.min(FEATURES.length - 1, Math.floor((self.progress / 0.9) * FEATURES.length));
              wheel.current?.setFace(FEATURES[k].face);
            },
          },
        });
        tl.fromTo(".halo__grid", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.05 }, 0)
          .to(".halo__grid", { y: -60, autoAlpha: 0, duration: 0.1 }, 0.9);
        tl.to(spin, { deg: -540, duration: 1, onUpdate: () => wheel.current?.setScrollAngle(spin.deg) }, 0);

        // The phone swings in from the corner in 3D and turns to face you.
        mm.add(DESKTOP, () => {
          gsap.set(".halo__phone", { transformPerspective: 1400 });
          tl.fromTo(".halo__phone", { xPercent: 70, yPercent: 40, rotationY: -62, rotationX: 24, rotation: 18, scale: 0.72 }, { xPercent: 0, yPercent: 0, rotationY: 0, rotationX: 0, rotation: 0, scale: 1, duration: 0.2, ease: "power2.out" }, 0)
            .to(".halo__phone", { rotationY: 9, rotationX: -3, duration: 0.8, ease: "sine.inOut" }, 0.2);
        });
        mm.add(MOBILE, () => {
          tl.fromTo(".halo__phone", { yPercent: 60, scale: 0.8 }, { yPercent: 0, scale: 1, duration: 0.18, ease: "power2.out" }, 0);
        });

        tl.from(".halo__title .line > span", { yPercent: 110, duration: 0.1, stagger: 0.03, ease: "power3.out" }, 0.01);

        panels.forEach((panel, i) => {
          const at = (i / panels.length) * 0.9;
          if (i > 0) {
            gsap.set(panel, { autoAlpha: 0 });
            tl.fromTo(panel, { autoAlpha: 0, y: 46 }, { autoAlpha: 1, y: 0, duration: 0.05 }, at)
              .to(marks[i], { scaleX: 1, duration: 0.05 }, at);
          }
          if (i < panels.length - 1) tl.to(panel, { autoAlpha: 0, y: -46, duration: 0.05 }, at + 0.9 / panels.length - 0.05);
        });
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="halodeck" className="scene halo">
      <div className="wrap halo__grid">
        <div className="halo__copy">
          <p className="eyebrow">01 · HaloDeck · Dock · Android</p>
          <h2 className="feature-title halo__title">
            <span className="line"><span>Spin up your</span></span>
            <span className="line"><span className="accent">next app.</span></span>
          </h2>
          <div className="feats">
            {FEATURES.map((f) => (
              <div key={f.face} className="feat">
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
          <div className="feat-index" aria-hidden="true"><i className="is-on" /><i /><i /></div>
          <div className="scene__actions">
            <Button arrow onClick={() => setDemoOpen(true)}>Try the demo</Button>
            <span className="meta">In development · Drag the wheel</span>
          </div>
        </div>
        <div className="halo__phone">
          <HaloWheel ref={wheel} />
        </div>
      </div>

      <Modal isOpen={demoOpen} onClose={() => setDemoOpen(false)} label="HaloDeck demo" size="stage">
        <div className="demo">
          <div className="demo__copy">
            <p className="eyebrow">HaloDeck · Browser demo</p>
            <h3>Give it a good spin.</h3>
            <p>Drag the wheel and let go. Same friction and snap values as the Android app. <span className="fine-only">Double-tap to open the selected app, or use the arrow keys.</span><span className="coarse-only">Tap the wheel to open the selected app.</span></p>
          </div>
          <HaloWheel controls />
        </div>
      </Modal>
    </section>
  );
}
