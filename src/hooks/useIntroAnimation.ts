import { useEffect, useRef, useState, type RefObject } from 'react';

export const DEV_SKIP_ANIMATION = false;

const FRAME_START = 0;
const FRAME_END = 48;
const FRAME_PAD = 3;
const FRAME_PREFIX = '/frames/frame_';
const FRAME_SUFFIX = '.jpg';
const TOTAL_FRAMES = FRAME_END - FRAME_START + 1;

const WHEEL_SENSITIVITY = 0.0008;
const LERP_FACTOR = 0.10;
const OVERLAY_INTRO_END = 0.30;
const OVERLAY_START = 0.90;
const SITE_FADE_MS = 780;
const EXIT_COOLDOWN_MS = 1200;
const SCROLL_EXIT_THRESHOLD = 1800;
const SCROLL_ENTER_THRESHOLD = 1800;
const EXIT_CIRCLE_CIRCUMFERENCE = 125.6;

function frameURL(n: number): string {
  const padded = String(n).padStart(FRAME_PAD, '0');
  return `${FRAME_PREFIX}${padded}${FRAME_SUFFIX}`;
}

function progressToFrameIndex(p: number): number {
  const c = Math.max(0, Math.min(1, p));
  return Math.round(c * (TOTAL_FRAMES - 1));
}

export interface IntroAnimationRefs {
  canvas: RefObject<HTMLCanvasElement | null>;
  stage: RefObject<HTMLDivElement | null>;
  overlayIntro: RefObject<HTMLDivElement | null>;
  overlayEnd: RefObject<HTMLDivElement | null>;
  enterHint: RefObject<HTMLDivElement | null>;
  enterHintFill: RefObject<SVGCircleElement | null>;
  exitHint: RefObject<HTMLDivElement | null>;
  exitHintFill: RefObject<SVGCircleElement | null>;
}

export interface UseIntroAnimationOptions {
  siteRef: RefObject<HTMLDivElement | null>;
  skipAnimation: boolean;
}

export function useIntroAnimation(
  refs: IntroAnimationRefs,
  { siteRef, skipAnimation }: UseIntroAnimationOptions,
) {
  const [siteVisible, setSiteVisible] = useState(skipAnimation);

  const siteEnteredRef = useRef(skipAnimation);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const lastDrawnFrameRef = useRef(-1);
  const enterProgressAccumRef = useRef(0);
  const exitProgressAccumRef = useRef(0);
  const exitCooldownEndRef = useRef(0);
  const framesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const stageSizeRef = useRef({ w: 0, h: 0 });
  const cleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (skipAnimation) {
      siteEnteredRef.current = true;
      const { stage, overlayIntro, overlayEnd } = refs;
      const site = siteRef.current;
      if (stage.current) stage.current.style.display = 'none';
      if (overlayIntro.current) overlayIntro.current.style.display = 'none';
      if (overlayEnd.current) overlayEnd.current.style.display = 'none';
      if (site) site.setAttribute('aria-hidden', 'false');
      setSiteVisible(true);
      return;
    }

    const {
      canvas,
      stage,
      overlayIntro,
      overlayEnd,
      enterHint,
      enterHintFill,
      exitHint,
      exitHintFill,
    } = refs;
    const site = siteRef.current;

    const canvasEl = canvas.current;
    const stageEl = stage.current;
    if (!canvasEl || !stageEl || !site) return;

    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    const updateEnterHintProgress = (progress: number) => {
      const p = Math.max(0, Math.min(1, progress));
      const offset = EXIT_CIRCLE_CIRCUMFERENCE * (1 - p);
      if (enterHintFill.current) {
        enterHintFill.current.style.strokeDashoffset = String(offset);
      }
    };

    const updateExitHintProgress = (progress: number) => {
      const p = Math.max(0, Math.min(1, progress));
      const offset = EXIT_CIRCLE_CIRCUMFERENCE * (1 - p);
      if (exitHintFill.current) {
        exitHintFill.current.style.strokeDashoffset = String(offset);
      }
      if (exitHint.current) {
        if (p > 0) {
          exitHint.current.classList.add('is-active');
          exitHint.current.setAttribute('aria-hidden', 'false');
        } else {
          exitHint.current.classList.remove('is-active');
          exitHint.current.setAttribute('aria-hidden', 'true');
        }
      }
    };

    const drawFrame = (index: number) => {
      const img = framesRef.current[index];
      const { w: stageW, h: stageH } = stageSizeRef.current;
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const scale = Math.max(stageW / img.naturalWidth, stageH / img.naturalHeight);
      const dW = img.naturalWidth * scale;
      const dH = img.naturalHeight * scale;
      const offX = (stageW - dW) / 2;
      const offY = (stageH - dH) / 2;

      ctx.clearRect(0, 0, stageW, stageH);
      ctx.drawImage(img, offX, offY, dW, dH);
      lastDrawnFrameRef.current = index;
    };

    const updateOverlay = (p: number) => {
      if (overlayIntro.current) {
        const introT = Math.max(0, Math.min(1, 1 - p / OVERLAY_INTRO_END));
        overlayIntro.current.style.opacity = String(introT);
      }
      if (overlayEnd.current) {
        const endT = Math.max(0, Math.min(1, (p - OVERLAY_START) / (1 - OVERLAY_START)));
        overlayEnd.current.style.opacity = String(endT);
        overlayEnd.current.style.transform = 'translate(-50%, -50%)';
        if (enterHint.current) {
          if (endT > 0) {
            enterHint.current.classList.add('is-active');
            enterHint.current.setAttribute('aria-hidden', 'false');
          } else {
            enterHint.current.classList.remove('is-active');
            enterHint.current.setAttribute('aria-hidden', 'true');
          }
        }
      }
    };

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const stageW = stageEl.clientWidth;
      const stageH = stageEl.clientHeight;
      stageSizeRef.current = { w: stageW, h: stageH };

      canvasEl.width = Math.round(stageW * dpr);
      canvasEl.height = Math.round(stageH * dpr);
      canvasEl.style.width = `${stageW}px`;
      canvasEl.style.height = `${stageH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      drawFrame(progressToFrameIndex(currentProgressRef.current));
    };

    const enterSite = () => {
      if (siteEnteredRef.current) return;
      siteEnteredRef.current = true;

      enterProgressAccumRef.current = 0;
      updateEnterHintProgress(0);

      stageEl.removeEventListener('wheel', onWheel);

      if (overlayEnd.current) {
        overlayEnd.current.style.transition = 'opacity 0.4s ease';
        overlayEnd.current.style.opacity = '0';
      }
      if (enterHint.current) enterHint.current.classList.remove('is-active');

      site.setAttribute('aria-hidden', 'false');
      setSiteVisible(true);

      cleanupTimerRef.current = setTimeout(() => {
        cleanupTimerRef.current = null;
        stageEl.style.display = 'none';
        if (overlayIntro.current) overlayIntro.current.style.display = 'none';
        if (overlayEnd.current) overlayEnd.current.style.display = 'none';
      }, SITE_FADE_MS);
    };

    const exitSite = () => {
      if (!siteEnteredRef.current) return;
      siteEnteredRef.current = false;

      exitProgressAccumRef.current = 0;
      enterProgressAccumRef.current = 0;
      updateExitHintProgress(0);
      updateEnterHintProgress(0);
      exitCooldownEndRef.current = Date.now() + EXIT_COOLDOWN_MS;

      if (cleanupTimerRef.current) {
        clearTimeout(cleanupTimerRef.current);
        cleanupTimerRef.current = null;
      }

      stageEl.style.display = '';
      if (overlayIntro.current) overlayIntro.current.style.display = '';
      if (overlayEnd.current) {
        overlayEnd.current.style.display = '';
        overlayEnd.current.style.transition = 'opacity 0.04s linear';
      }

      resizeCanvas();

      site.style.pointerEvents = 'none';
      setSiteVisible(false);

      setTimeout(() => {
        site.style.pointerEvents = '';
        site.setAttribute('aria-hidden', 'true');
      }, SITE_FADE_MS);

      site.scrollTop = 0;

      targetProgressRef.current = 1;
      currentProgressRef.current = 1;
      lastDrawnFrameRef.current = -1;

      stageEl.addEventListener('wheel', onWheel, { passive: false });
    };

    const onWheel = (e: WheelEvent) => {
      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 20;
      if (e.deltaMode === 2) delta *= 400;

      const atEnd = currentProgressRef.current >= 0.999;

      if (atEnd) {
        const inCooldown = Date.now() < exitCooldownEndRef.current;
        if (delta > 0) {
          e.preventDefault();
          if (!inCooldown) {
            enterProgressAccumRef.current += delta / SCROLL_ENTER_THRESHOLD;
            enterProgressAccumRef.current = Math.min(1, enterProgressAccumRef.current);
            updateEnterHintProgress(enterProgressAccumRef.current);
            if (enterProgressAccumRef.current >= 1) enterSite();
          }
        } else if (enterProgressAccumRef.current > 0) {
          e.preventDefault();
          enterProgressAccumRef.current += delta / SCROLL_ENTER_THRESHOLD;
          enterProgressAccumRef.current = Math.max(0, enterProgressAccumRef.current);
          updateEnterHintProgress(enterProgressAccumRef.current);
        } else {
          e.preventDefault();
          targetProgressRef.current = Math.max(
            0,
            Math.min(1, targetProgressRef.current + delta * WHEEL_SENSITIVITY),
          );
        }
      } else {
        e.preventDefault();
        targetProgressRef.current = Math.max(
          0,
          Math.min(1, targetProgressRef.current + delta * WHEEL_SENSITIVITY),
        );
      }
    };

    const onSiteWheel = (e: WheelEvent) => {
      if (!siteEnteredRef.current) return;

      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 20;
      if (e.deltaMode === 2) delta *= 400;

      const atTop = site.scrollTop <= 0;
      if (!atTop && exitProgressAccumRef.current <= 0) return;

      if (delta < 0) {
        if (atTop) {
          e.preventDefault();
          exitProgressAccumRef.current += -delta / SCROLL_EXIT_THRESHOLD;
        }
      } else if (exitProgressAccumRef.current > 0) {
        e.preventDefault();
        exitProgressAccumRef.current -= delta / SCROLL_EXIT_THRESHOLD;
      }

      exitProgressAccumRef.current = Math.max(0, Math.min(1, exitProgressAccumRef.current));
      updateExitHintProgress(exitProgressAccumRef.current);

      if (exitProgressAccumRef.current >= 1) exitSite();
    };

    const tick = () => {
      rafIdRef.current = requestAnimationFrame(tick);

      if (!siteEnteredRef.current) {
        const diff = targetProgressRef.current - currentProgressRef.current;
        if (Math.abs(diff) > 0.00005) {
          currentProgressRef.current += diff * LERP_FACTOR;
        } else {
          currentProgressRef.current = targetProgressRef.current;
        }

        if (currentProgressRef.current < 0.999) {
          enterProgressAccumRef.current = 0;
          updateEnterHintProgress(0);
        }

        const frameIndex = progressToFrameIndex(currentProgressRef.current);
        if (frameIndex !== lastDrawnFrameRef.current) {
          let draw = frameIndex;
          while (draw >= 0) {
            const f = framesRef.current[draw];
            if (f && f.complete) break;
            draw--;
          }
          if (draw >= 0) drawFrame(draw);
        }

        updateOverlay(currentProgressRef.current);
      }
    };

    const loadFrame = (index: number): Promise<HTMLImageElement | null> =>
      new Promise((resolve) => {
        if (framesRef.current[index]) {
          resolve(framesRef.current[index]);
          return;
        }
        const img = new Image();
        img.src = frameURL(FRAME_START + index);
        img.onload = () => {
          framesRef.current[index] = img;
          resolve(img);
        };
        img.onerror = () => resolve(null);
      });

    const preloadAll = async () => {
      await loadFrame(0);
      resizeCanvas();
      drawFrame(0);

      const BATCH = 4;
      for (let i = 1; i < TOTAL_FRAMES; i += BATCH) {
        const batch: Promise<HTMLImageElement | null>[] = [];
        for (let j = i; j < Math.min(i + BATCH, TOTAL_FRAMES); j++) {
          batch.push(loadFrame(j));
        }
        await Promise.all(batch);
        await new Promise<void>((r) => {
          if (typeof requestIdleCallback !== 'undefined') {
            requestIdleCallback(() => r(), { timeout: 200 });
          } else {
            setTimeout(r, 0);
          }
        });
      }
    };

    if (!DEV_SKIP_ANIMATION) {
      stageEl.addEventListener('wheel', onWheel, { passive: false });
    }

    site.addEventListener('wheel', onSiteWheel, { passive: false });
    window.addEventListener('resize', resizeCanvas);

    resizeCanvas();
    rafIdRef.current = requestAnimationFrame(tick);
    void preloadAll();

    return () => {
      stageEl.removeEventListener('wheel', onWheel);
      site.removeEventListener('wheel', onSiteWheel);
      window.removeEventListener('resize', resizeCanvas);
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      if (cleanupTimerRef.current) clearTimeout(cleanupTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- refs são estáveis; roda uma vez por skipAnimation
  }, [skipAnimation]);

  return { siteVisible };
}
