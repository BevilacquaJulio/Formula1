import { siteConfig } from '../../config/siteConfig';
import './SiteFooter.module.css';

export function SiteFooter() {
  return (
    <footer id="site-footer">
      <p>
        © {siteConfig.copyrightYear} {siteConfig.personName}. All rights reserved.
      </p>
    </footer>
  );
}
