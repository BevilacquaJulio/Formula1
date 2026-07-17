import { achievements } from '../../data/services';
import './Achievements.module.css';

export function Achievements() {
  return (
    <section id="achievements" className="section section--achievements">
      <div className="achievements-bg" />
      <div className="section-inner section-inner--achievements">
        <h2 className="achievements-title">Racing Achievements</h2>
        <div className="achievement-list">
          {achievements.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
