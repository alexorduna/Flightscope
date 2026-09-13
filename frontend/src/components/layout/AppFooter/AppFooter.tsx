import { FlightScopeLogo } from "../../brand/FlightScopeLogo/FlightScopeLogo";
import "./AppFooter.css";

const FOOTER_LINKS = [
  { label: "Search flights", href: "#search" },
  { label: "Price trends", href: "#results" },
] as const;

export function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="container app-footer__inner">
        <div className="app-footer__grid">
          <div className="app-footer__brand">
            <FlightScopeLogo size="sm" />
            <p className="app-footer__tagline">
              Compare fares between Mexico and the United States with a departure-board style search experience.
            </p>
          </div>

          <nav className="app-footer__nav" aria-label="Footer">
            <h2 className="app-footer__heading">Explore</h2>
            <ul className="app-footer__links">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <a className="app-footer__link" href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="app-footer__about">
            <h2 className="app-footer__heading">Project</h2>
            <ul className="app-footer__links">
              <li>
                <span className="app-footer__meta">City University of Seattle / CETYS</span>
              </li>
              <li>
                <span className="app-footer__meta">IS312 Web Design and Programming</span>
              </li>
              <li>
                <span className="app-footer__meta">React · Express · SerpApi (optional)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="app-footer__bar">
          <p className="app-footer__legal">© {year} FlightScope. Academic demo — not a booking service.</p>
          <p className="app-footer__legal">Prices may be live (SerpApi) or mock fallback for development.</p>
        </div>
      </div>
    </footer>
  );
}
