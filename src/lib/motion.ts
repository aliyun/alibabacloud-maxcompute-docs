import {
  useEffect,
  useLayoutEffect,
  useRef,
  type DependencyList,
  type RefObject,
} from 'react';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

const canUseDOM = typeof window !== 'undefined';

// useEffect on the server, useLayoutEffect on the client so entrance tweens can
// set their start state before the first paint (no flash of unstyled content).
export const useIsomorphicLayoutEffect = canUseDOM
  ? useLayoutEffect
  : useEffect;

export const EASE_OUT = 'power3.out';

let isRegistered = false;

export type GsapApi = {
  gsap: typeof gsap;
  ScrollTrigger: typeof ScrollTrigger;
};

export function ensureGsap(): GsapApi {
  if (canUseDOM && !isRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    // Recalculate trigger positions once late assets (SVG frames, fonts) settle.
    window.addEventListener('load', () => ScrollTrigger.refresh(), {
      once: true,
    });
    isRegistered = true;
  }
  return {gsap, ScrollTrigger};
}

export function prefersReducedMotion(): boolean {
  return (
    canUseDOM && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export type GsapOptions = {
  deps?: DependencyList;
  scope?: RefObject<HTMLElement | null>;
};

// Runs `callback` inside a gsap.context (scoped to `scope` when provided) and
// reverts every animation it created on cleanup.
export function useGsap(
  callback: (api: GsapApi) => void,
  {deps = [], scope}: GsapOptions = {},
): void {
  useIsomorphicLayoutEffect(() => {
    if (!canUseDOM) return undefined;
    const api = ensureGsap();
    const ctx = gsap.context(() => callback(api), scope?.current ?? undefined);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export type RevealOptions = {
  y?: number;
  x?: number;
  stagger?: number;
  duration?: number;
  start?: string;
};

// Staggered scroll reveal for the descendants matched by `selector` inside the
// returned ref. Honours prefers-reduced-motion by leaving content untouched.
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  selector = ':scope > *',
  options: RevealOptions = {},
): RefObject<T | null> {
  const scope = useRef<T>(null);
  const {
    y = 26,
    x = 0,
    stagger = 0.09,
    duration = 0.65,
    start = 'top 85%',
  } = options;

  useIsomorphicLayoutEffect(() => {
    const root = scope.current;
    if (!root || prefersReducedMotion()) return undefined;

    const {gsap} = ensureGsap();
    const targets = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(selector),
    );
    if (!targets.length) return undefined;

    const ctx = gsap.context(() => {
      gsap.from(targets, {
        y,
        x,
        autoAlpha: 0,
        duration,
        ease: EASE_OUT,
        stagger,
        clearProps: 'opacity,visibility,transform',
        scrollTrigger: {trigger: root, start, once: true},
      });
    }, root);

    return () => ctx.revert();
  }, [selector, y, x, stagger, duration, start]);

  return scope;
}
