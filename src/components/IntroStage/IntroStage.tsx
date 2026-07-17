import { useRef } from 'react';
import { siteConfig } from '../../config/siteConfig';
import './IntroStage.module.css';

export interface IntroStageHandle {
  canvas: React.RefObject<HTMLCanvasElement | null>;
  stage: React.RefObject<HTMLDivElement | null>;
  overlayIntro: React.RefObject<HTMLDivElement | null>;
  overlayEnd: React.RefObject<HTMLDivElement | null>;
  enterHint: React.RefObject<HTMLDivElement | null>;
  enterHintFill: React.RefObject<SVGCircleElement | null>;
}

interface IntroStageProps {
  introRefs: IntroStageHandle;
  hidden?: boolean;
}

export function IntroStage({ introRefs, hidden }: IntroStageProps) {
  const { canvas, stage, overlayIntro, overlayEnd, enterHint, enterHintFill } = introRefs;

  if (hidden) return null;

  return (
    <>
      <div id="stage" ref={stage}>
        <canvas id="canvas" ref={canvas} />
        <div id="vignette" />
        <div id="grain" />
      </div>

      <div id="overlay-intro" ref={overlayIntro}>
        <p className="overlay-eyebrow">Motor Racing Performance</p>
        <h1 id="overlay-title">{siteConfig.personName}</h1>
        <p id="overlay-sub2">Coaching &amp; Consulting</p>
      </div>

      <div id="overlay-end" ref={overlayEnd} aria-hidden="true">
        <p id="overlay-scroll-label">SCROLL DOWN TO VISIT MY WEBSITE</p>
        <div id="enter-hint" ref={enterHint} className="enter-hint" aria-hidden="true">
          <div className="enter-hint__icon">
            <svg className="enter-hint__progress" viewBox="0 0 48 48" aria-hidden="true">
              <circle className="enter-hint__track" cx="24" cy="24" r="20" fill="none" strokeWidth="2" />
              <circle
                ref={enterHintFill}
                id="enter-hint-fill"
                className="enter-hint__fill"
                cx="24"
                cy="24"
                r="20"
                fill="none"
                strokeWidth="2"
                strokeDasharray="125.6"
                strokeDashoffset="125.6"
                strokeLinecap="round"
              />
            </svg>
            <svg className="enter-hint__arrow" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 19V5M7 14l5 5 5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}

export function useIntroStageRefs(): IntroStageHandle {
  return {
    canvas: useRef<HTMLCanvasElement>(null),
    stage: useRef<HTMLDivElement>(null),
    overlayIntro: useRef<HTMLDivElement>(null),
    overlayEnd: useRef<HTMLDivElement>(null),
    enterHint: useRef<HTMLDivElement>(null),
    enterHintFill: useRef<SVGCircleElement>(null),
  };
}
