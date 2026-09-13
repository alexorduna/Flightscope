import { FlightScopeLogo } from "../../brand/FlightScopeLogo/FlightScopeLogo";
import "./AppHeader.css";

export function AppHeader() {
  return (
    <header className="app-header">
      <div className="container app-header__inner">
        <a className="app-header__brand" href="/" aria-label="FlightScope home">
          <FlightScopeLogo size="md" />
        </a>

        <div className="app-header__meta">
          <p className="app-header__scope">Mexico ↔ United States</p>
          <p className="app-header__course">IS312 · Web Design &amp; Programming</p>
        </div>
      </div>
    </header>
  );
}
