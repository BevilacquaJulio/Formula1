import { useEffect, useRef, useState, type RefObject } from 'react';
import { siteConfig } from '../../config/siteConfig';
import './SiteHeader.module.css';

interface SiteHeaderProps {
  siteRef: RefObject<HTMLDivElement | null>;
  siteVisible: boolean;
  exitHintRef: RefObject<HTMLDivElement | null>;
  exitHintFillRef: RefObject<SVGCircleElement | null>;
  onAnchorClick: (hash: string) => void;
}

const NAV_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#video', label: 'Highlights' },
  { href: '#contact', label: 'Contact' },
] as const;

export function SiteHeader({
  siteRef,
  siteVisible,
  exitHintRef,
  exitHintFillRef,
  onAnchorClick,
}: SiteHeaderProps) {
  const headerRef = useRef<HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const site = siteRef.current;
    const header = headerRef.current;
    const hero = document.getElementById('home');
    const sectionInner = hero?.querySelector('.section-inner');
    if (!site || !header || !hero || !sectionInner) return;

    const updateHeaderVisibility = () => {
      if (!siteVisible) return;
      const main = hero.closest('main');
      const innerBottom =
        (main ? main.offsetTop : 0) +
        hero.offsetTop +
        (sectionInner as HTMLElement).offsetTop +
        (sectionInner as HTMLElement).offsetHeight;
      if (site.scrollTop > innerBottom - 50) {
        header.classList.add('header-hidden');
      } else {
        header.classList.remove('header-hidden');
      }
    };

    site.addEventListener('scroll', updateHeaderVisibility, { passive: true });
    window.addEventListener('resize', updateHeaderVisibility);
    if (siteVisible) setTimeout(updateHeaderVisibility, 100);

    return () => {
      site.removeEventListener('scroll', updateHeaderVisibility);
      window.removeEventListener('resize', updateHeaderVisibility);
    };
  }, [siteRef, siteVisible]);

  const handleNavClick = (hash: string) => {
    setMobileOpen(false);
    onAnchorClick(hash);
  };

  return (
    <header id="site-header" ref={headerRef}>
      <div className="header-inner">
        <a
          href="#home"
          className="header-brand"
          aria-label="Home"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('#home');
          }}
        >
          <img src="/logo/logo.png" alt={siteConfig.personName} className="header-logo" />
        </a>

        <div id="exit-hint" ref={exitHintRef} className="exit-hint" aria-hidden="true">
          <div className="exit-hint__icon">
            <svg className="exit-hint__progress" viewBox="0 0 48 48" aria-hidden="true">
              <circle className="exit-hint__track" cx="24" cy="24" r="20" fill="none" strokeWidth="2" />
              <circle
                ref={exitHintFillRef}
                id="exit-hint-fill"
                className="exit-hint__fill"
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
            <svg className="exit-hint__arrow" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 5v14M7 10l5-5 5 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
          <span className="exit-hint__label">Scroll up to go back</span>
        </div>

        <nav aria-label="Main navigation">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(href);
              }}
            >
              {label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className="hamburger-btn"
          id="hamburgerBtn"
          aria-label="Open navigation"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div
        className={`mobile-nav${mobileOpen ? ' is-open' : ''}`}
        id="mobileNav"
        aria-hidden={!mobileOpen}
      >
        {NAV_LINKS.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick(href);
            }}
          >
            {label}
          </a>
        ))}
      </div>
    </header>
  );
}
