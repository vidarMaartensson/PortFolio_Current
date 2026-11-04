import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, useGSAP);
// Phones resize the viewport when the address bar hides; pins must not jump for that.
ScrollTrigger.config({ ignoreMobileResize: true });

export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
export const DESKTOP = "(min-width: 761px)";
export const MOBILE = "(max-width: 760px)";

export const prefersMotion = () => window.matchMedia(MOTION_OK).matches;

let lenis: Lenis | null = null;

/** Smooth wheel scrolling, driven by GSAP's ticker so pins and scrubs stay in step. */
export function startSmoothScroll() {
  if (!prefersMotion()) return () => {};
  const instance = new Lenis({ lerp: 0.1 });
  const tick = (time: number) => instance.raf(time * 1000);
  instance.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  lenis = instance;
  return () => {
    gsap.ticker.remove(tick);
    instance.destroy();
    lenis = null;
  };
}

export function scrollToTarget(target: string | HTMLElement) {
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  // A pinned section's own box moves while pinned; its spacer holds the real position.
  const spacer = el.closest<HTMLElement>(".pin-spacer");
  if (!spacer) {
    if (lenis) lenis.scrollTo(el, { duration: 1.6 });
    else el.scrollIntoView();
    return;
  }
  // Land a little into the pin, where the scene has built itself, or at its end if it asks.
  const pinLength = spacer.offsetHeight - window.innerHeight;
  const into = el.dataset.anchor === "end" ? 1 : 0.12;
  const y = spacer.getBoundingClientRect().top + window.scrollY + pinLength * into;
  if (lenis) lenis.scrollTo(y, { duration: 1.6 });
  else window.scrollTo(0, y);
}

export function lockScroll(locked: boolean) {
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  }
  document.documentElement.style.overflow = locked ? "hidden" : "";
}

export { gsap, ScrollTrigger, useGSAP };
