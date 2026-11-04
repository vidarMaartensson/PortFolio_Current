import { useRef, useState } from "react";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { PausableGif } from "../demoModal/PausableGif";
import { DESKTOP, MOBILE, MOTION_OK, ScrollTrigger, gsap, useGSAP } from "../../lib/motion";
import { shippedProjects } from "../../data/projects";
import type { Project } from "../../types";

function WorkCard({ project, index, onDemo }: { project: Project; index: number; onDemo: (p: Project) => void }) {
  const [hovered, setHovered] = useState(false);
  const opensModal = Boolean(project.demoInModal && project.gifUrl);
  // Touch screens can't hover to see the GIF, so those cards get a Preview button instead.
  const hasTouchPreview = Boolean(project.gifUrl && !project.demoInModal);

  return (
    <article className="card" onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)} onPointerLeave={() => setHovered(false)}>
      <div className="card__media">
        <img className="card__img" src={project.imageUrl} alt={`${project.title} screenshot`} loading="lazy" />
        {/* Only mount the GIF on hover so it isn't downloaded up front and restarts each time */}
        {project.gifUrl && hovered && <img className="card__gif" src={project.gifUrl} alt="" aria-hidden="true" />}
        <span className="card__num" aria-hidden="true">{String(index + 4).padStart(2, "0")}</span>
      </div>
      <div className="card__body">
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <ul className="card__tags">{project.tags.map((tag) => <li key={tag} className="pill">{tag}</li>)}</ul>
        <div className="card__actions">
          {opensModal && <Button arrow onClick={() => onDemo(project)}>Watch demo</Button>}
          {project.liveUrl && <Button href={project.liveUrl} external arrow>Live demo</Button>}
          {hasTouchPreview && <span className="touch-only"><Button variant="ghost" onClick={() => onDemo(project)}>Preview</Button></span>}
          {project.githubUrl && <Button variant="ghost" href={project.githubUrl} external>GitHub</Button>}
        </div>
      </div>
    </article>
  );
}

export function Work() {
  const ref = useRef<HTMLElement>(null);
  const [demo, setDemo] = useState<Project | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        mm.add(DESKTOP, () => {
          const track = ref.current!.querySelector<HTMLElement>(".work__track")!;
          const distance = () => track.scrollWidth - window.innerWidth;
          const lean = gsap.quickTo(".card", "skewX", { duration: 0.5, ease: "power3" });

          // The cards slide past, the last one holds fully in view, then the section fades away.
          const slideLength = () => distance() * 1.1;
          const hold = () => window.innerHeight * 0.45;
          const fadeOut = () => window.innerHeight * 0.2;

          // Faded by hand from the pin's own position, so the way in and out can't fight.
          const paintFade = (self: ScrollTrigger) => {
            const entered = (self.scroll() - self.start) / (window.innerHeight * 0.15);
            const remaining = (self.end - self.scroll()) / fadeOut();
            gsap.set(track, { autoAlpha: gsap.utils.clamp(0, 1, Math.min(entered, remaining)) });
          };
          ScrollTrigger.create({
            trigger: ref.current,
            start: "top top",
            end: () => `+=${slideLength() + hold() + fadeOut()}`,
            pin: true,
            anticipatePin: 1,
            onUpdate: paintFade,
            onRefresh: paintFade,
          });

          const slide = gsap.to(track, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: ref.current,
              start: "top top",
              end: () => `+=${slideLength()}`,
              scrub: 0.7,
              invalidateOnRefresh: true,
              onUpdate: (self) => lean(gsap.utils.clamp(-7, 7, self.getVelocity() / -260)),
              onScrubComplete: () => lean(0),
            },
          });

          gsap.from(".work__intro .line > span", { yPercent: 110, stagger: 0.08, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ref.current, start: "top top" } });

          gsap.utils.toArray<HTMLElement>(".card").forEach((card) => {
            // Each card rises out of the terrain and its image drifts inside the frame.
            gsap.from(card, { yPercent: 26, rotation: 3.5, opacity: 0.2, ease: "power2.out", scrollTrigger: { trigger: card, containerAnimation: slide, start: "left 96%", end: "left 48%", scrub: true } });
            gsap.fromTo(card.querySelector(".card__img"), { xPercent: -6, scale: 1.16, transformOrigin: "50% 0%" }, { xPercent: 6, scale: 1.16, ease: "none", scrollTrigger: { trigger: card, containerAnimation: slide, start: "left right", end: "right left", scrub: true } });
            gsap.from(card.querySelector(".card__media"), { clipPath: "inset(0% 100% 0% 0% round 28px)", ease: "power2.inOut", scrollTrigger: { trigger: card, containerAnimation: slide, start: "left 100%", end: "left 58%", scrub: true } });
          });
          ScrollTrigger.refresh();
        });

        mm.add(MOBILE, () => {
          gsap.from(".work__intro .line > span", { yPercent: 110, stagger: 0.08, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".work__intro", start: "top 80%" } });
          gsap.utils.toArray<HTMLElement>(".card").forEach((card) => {
            gsap.from(card, { y: 90, rotation: 2, opacity: 0, ease: "power2.out", scrollTrigger: { trigger: card, start: "top 96%", end: "top 62%", scrub: 0.4 } });
            gsap.from(card.querySelector(".card__media"), { clipPath: "inset(0% 0% 100% 0% round 28px)", ease: "power2.out", scrollTrigger: { trigger: card, start: "top 92%", end: "top 50%", scrub: 0.4 } });
          });
        });
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="work" className="work">
      <div className="work__track">
        <div className="work__intro">
          <p className="eyebrow">04 · Shipped work</p>
          <h2 className="feature-title">
            <span className="line"><span>Live, public</span></span>
            <span className="line"><span>and open to</span></span>
            <span className="line"><span className="accent">poke at.</span></span>
          </h2>
        </div>
        {shippedProjects.map((project, i) => (
          <WorkCard key={project.id} project={project} index={i} onDemo={setDemo} />
        ))}
      </div>

      <Modal isOpen={demo !== null} onClose={() => setDemo(null)} label={`${demo?.title ?? "Project"} demo`}>
        {demo?.gifUrl && (
          <div className="gif-demo">
            <h3>{demo.title} – demo</h3>
            <PausableGif src={demo.gifUrl} alt={`${demo.title} demo`} className="gif-demo__media" />
            <p className="meta">Tap the demo to pause or play</p>
          </div>
        )}
      </Modal>
    </section>
  );
}
