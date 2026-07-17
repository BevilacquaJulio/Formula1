import { useCallback, useEffect, useRef } from 'react';
import { IntroStage, useIntroStageRefs } from './components/IntroStage/IntroStage';
import { SiteHeader } from './components/SiteHeader/SiteHeader';
import { Hero } from './components/Hero/Hero';
import { Services } from './components/Services/Services';
import { Achievements } from './components/Achievements/Achievements';
import { About } from './components/About/About';
import { Contact } from './components/Contact/Contact';
import { SiteFooter } from './components/SiteFooter/SiteFooter';
import { DEV_SKIP_ANIMATION, useIntroAnimation } from './hooks/useIntroAnimation';
import { useMediaQuery } from './hooks/useMediaQuery';
import './App.module.css';

const HEADER_OFFSET = 72;

export default function App() {
  const siteRef = useRef<HTMLDivElement>(null);
  const exitHintRef = useRef<HTMLDivElement>(null);
  const exitHintFillRef = useRef<SVGCircleElement>(null);
  const introRefs = useIntroStageRefs();

  const isMobile = useMediaQuery('(max-width: 768px)');
  const skipAnimation = DEV_SKIP_ANIMATION || isMobile;

  const { siteVisible } = useIntroAnimation(
    {
      canvas: introRefs.canvas,
      stage: introRefs.stage,
      overlayIntro: introRefs.overlayIntro,
      overlayEnd: introRefs.overlayEnd,
      enterHint: introRefs.enterHint,
      enterHintFill: introRefs.enterHintFill,
      exitHint: exitHintRef,
      exitHintFill: exitHintFillRef,
    },
    { siteRef, skipAnimation },
  );

  const handleAnchorClick = useCallback((hash: string) => {
    const site = siteRef.current;
    if (!site) return;
    const target = document.querySelector(hash);
    if (target instanceof HTMLElement) {
      site.scrollTo({ top: target.offsetTop - HEADER_OFFSET, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const site = siteRef.current;
    if (!site) return;

    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element).closest('#site a[href^="#"]');
      if (!link || !(link instanceof HTMLAnchorElement)) return;
      e.preventDefault();
      handleAnchorClick(link.getAttribute('href') ?? '');
    };

    site.addEventListener('click', onClick);
    return () => site.removeEventListener('click', onClick);
  }, [handleAnchorClick]);

  return (
    <>
      <IntroStage introRefs={introRefs} hidden={skipAnimation} />

      <div
        id="site"
        ref={siteRef}
        className={siteVisible ? 'is-visible' : undefined}
        aria-hidden={siteVisible ? 'false' : 'true'}
      >
        <SiteHeader
          siteRef={siteRef}
          siteVisible={siteVisible}
          exitHintRef={exitHintRef}
          exitHintFillRef={exitHintFillRef}
          onAnchorClick={handleAnchorClick}
        />

        <main>
          <Hero />
          <Services />
          <Achievements />
          <About />
          <Contact />
        </main>

        <SiteFooter />
      </div>
    </>
  );
}
