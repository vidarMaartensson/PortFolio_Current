import { useEffect, useRef } from "react";
import { ParticleField } from "./components/field/ParticleField";
import { fieldState } from "./components/field/fieldState";
import { Cursor, Header, Hud, Preloader } from "./components/ui/Chrome";
import { Hero } from "./components/scenes/Hero";
import { About } from "./components/scenes/About";
import { HaloDeck } from "./components/scenes/HaloDeck";
import { Arcguard } from "./components/scenes/Arcguard";
import { VeloqOs } from "./components/scenes/VeloqOs";
import { Work } from "./components/scenes/Work";
import { Contact } from "./components/scenes/Contact";
import { MOTION_OK, ScrollTrigger, gsap, startSmoothScroll, useGSAP } from "./lib/motion";

// Which section carries the particle field into each next shape. Sections overlap, so
// each morph straddles the moment one scene hands over to the next.
const MORPHS: { trigger: string; start: string; end: string }[] = [
  { trigger: "#hero", start: "top top", end: "+=55%" }, // portrait → galaxy
  { trigger: "#halodeck", start: "top 30%", end: "top -15%" }, // → wheel
  { trigger: "#arcguard", start: "top 30%", end: "top -15%" }, // → planet
  { trigger: "#veloqos", start: "top 30%", end: "top -15%" }, // → voice portal
  { trigger: "#work", start: "top 30%", end: "top -15%" }, // → terrain
  { trigger: "#contact", start: "top 30%", end: "top -15%" }, // → V mark
];

export default function App() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => startSmoothScroll(), []);

  // Runs after every scene has created its pins, so these positions account for them.
  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        MORPHS.forEach((morph, i) => {
          ScrollTrigger.create({
            ...morph,
            onUpdate: (self) => { fieldState.stages[i] = self.progress; },
            onRefresh: (self) => { fieldState.stages[i] = self.progress; },
          });
        });
        document.fonts?.ready.then(() => ScrollTrigger.refresh());
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="app">
      <div className="backdrop" aria-hidden="true" />
      <ParticleField portraitSelector="#portrait" />
      <Preloader />
      <Header />
      <Cursor />
      <main>
        <Hero />
        <About />
        <HaloDeck />
        <Arcguard />
        <VeloqOs />
        <Work />
        <Contact />
      </main>
      {/* After the scenes: its triggers need their pin spacers to exist first. */}
      <Hud />
    </div>
  );
}
