import { racingCareer, workExperience } from '../../data/timeline';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { Gallery } from '../Gallery/Gallery';
import { VideoPlayer } from '../VideoPlayer/VideoPlayer';
import { TimelineItem } from '../Timeline/Timeline';
import './About.module.css';

export function About() {
  const careerRef = useScrollReveal<HTMLDivElement>();
  const experienceRef = useScrollReveal<HTMLDivElement>();

  return (
    <section id="about" className="section section--about">
      <div className="about-hero">
        <div className="about-hero-bg-text">RACING</div>
        <div className="about-hero-content">
          <p className="about-hero-eyebrow">The Story</p>
          <h2 className="about-hero-title">
            About <span>Me</span>
          </h2>
        </div>
      </div>

      <div className="section-inner section-inner--about">
        <div className="about-section-header">
          <span className="about-section-label">Racing Career</span>
        </div>
        <div className="about-timeline" ref={careerRef}>
          {racingCareer.map((item) => (
            <TimelineItem key={`${item.year}-${item.title}`} item={item} />
          ))}
        </div>

        <div className="about-section-header">
          <span className="about-section-label">Motorsport Work Experience</span>
        </div>
        <div className="about-timeline" ref={experienceRef}>
          {workExperience.map((item) => (
            <TimelineItem key={`${item.year}-${item.title}`} item={item} />
          ))}
        </div>

        <Gallery />
        <VideoPlayer />
      </div>
    </section>
  );
}
