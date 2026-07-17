import './Hero.module.css';

export function Hero() {
  return (
    <section id="home" className="section section--hero">
      <div className="hero-bg" />
      <div className="section-inner hero-inner">
        <p className="hero-tag">Motor Racing Performance</p>
        <h2 className="hero-title">
          Driven by
          <br />
          Precision.
        </h2>
        <a href="#contact" className="btn-cta btn-cta--hero">
          Work With Me
        </a>
      </div>
    </section>
  );
}
