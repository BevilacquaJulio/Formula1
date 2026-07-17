import { services } from '../../data/services';
import './Services.module.css';

export function Services() {
  return (
    <section id="services" className="section section--services">
      <div className="section-inner section-inner--services">
        {services.map((service) => (
          <div key={service.title} className="service-card">
            <h3 className="service-title">{service.title}</h3>
            <p className="service-desc">{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
