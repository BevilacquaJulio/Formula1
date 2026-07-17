import { useState, type FormEvent } from 'react';
import { isFormConfigured, siteConfig } from '../../config/siteConfig';
import { phoneCodes } from '../../data/phoneCodes';
import './Contact.module.css';

type FormStatus = 'idle' | 'sending' | 'sent' | 'error';

export function Contact() {
  const [status, setStatus] = useState<FormStatus>('idle');
  const [buttonText, setButtonText] = useState('Send Message');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isFormConfigured()) {
      alert('Configure o Formspree: defina VITE_FORMSPREE_ACTION no arquivo .env');
      return;
    }

    setStatus('sending');
    setButtonText('Enviando...');

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch(siteConfig.formspreeAction, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (data.ok) {
        form.reset();
        setStatus('sent');
        setButtonText('Mensagem enviada!');
        setTimeout(() => {
          setStatus('idle');
          setButtonText('Send Message');
        }, 3000);
      } else {
        throw new Error(data.error || 'Erro ao enviar');
      }
    } catch {
      setStatus('error');
      setButtonText('Send Message');
      alert(`Não foi possível enviar. Tente novamente ou use o e-mail direto: ${siteConfig.contactEmail}`);
    }
  };

  return (
    <section id="contact" className="section section--contact">
      <div className="contact-section">
        <div className="contact-eyebrow">Get In Touch</div>
        <h2 className="contact-title">
          Start Your <span>Journey</span>
        </h2>
        <p className="contact-subtitle">
          Ready to take your racing career to the next level? Send a message and let&apos;s talk.
        </p>

        <form
          className="contact-form"
          id="contactForm"
          action={siteConfig.formspreeAction}
          method="POST"
          onSubmit={handleSubmit}
        >
          <input type="hidden" name="_subject" value={siteConfig.formSubject} />
          <div className="contact-form-row">
            <div className="contact-field">
              <label htmlFor="contact-name">Name</label>
              <input id="contact-name" type="text" name="name" placeholder="Your name" autoComplete="name" required />
            </div>
            <div className="contact-field">
              <label htmlFor="contact-email">E-mail</label>
              <input
                id="contact-email"
                type="email"
                name="_replyto"
                placeholder="your@email.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="contact-field contact-field--full contact-field--phone">
            <label htmlFor="contact-phone">Phone</label>
            <div className="contact-phone-wrap">
              <select
                name="phone_code"
                className="contact-phone-code"
                aria-label="Código do país"
                title="Código do país"
                defaultValue="+55"
              >
                {phoneCodes.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <input id="contact-phone" type="tel" name="phone" placeholder="(00) 00000-0000" autoComplete="tel" />
            </div>
          </div>

          <div className="contact-field contact-field--full">
            <label htmlFor="contact-message">Tell me about your goals</label>
            <textarea
              id="contact-message"
              name="message"
              placeholder="Describe your racing background and what you're looking to achieve..."
              rows={4}
            />
          </div>

          <button type="submit" className="contact-btn-submit" disabled={status === 'sending'}>
            <span>{buttonText}</span>
          </button>
        </form>

        <div className="contact-divider">
          <span className="contact-divider-label">Or reach out directly</span>
        </div>

        <div className="contact-info">
          <a href={`tel:${siteConfig.contactPhoneTel}`} className="contact-item">
            <div className="contact-item-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.63 19.79 19.79 0 01.08 4.1 2 2 0 012.04 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
            </div>
            <span className="contact-item-label">Phone</span>
            <span className="contact-item-value">{siteConfig.contactPhoneDisplay}</span>
          </a>

          <a href={`mailto:${siteConfig.contactEmail}`} className="contact-item">
            <div className="contact-item-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <span className="contact-item-label">E-mail</span>
            <span className="contact-item-value">{siteConfig.contactEmail}</span>
          </a>
        </div>

        <a href={siteConfig.instagramUrl} target="_blank" rel="noopener noreferrer" className="contact-instagram-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
          <span>Follow on Instagram</span>
        </a>

        <p className="contact-footer-copy">
          {siteConfig.companyName} © {siteConfig.copyrightYear}
        </p>
      </div>
    </section>
  );
}
