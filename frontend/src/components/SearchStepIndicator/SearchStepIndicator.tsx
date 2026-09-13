import { Check } from "lucide-react";
import "./SearchStepIndicator.css";

export type SearchStepId = "route" | "dates" | "travelers";

interface StepDefinition {
  id: SearchStepId;
  label: string;
  number: number;
}

const STEPS: StepDefinition[] = [
  { id: "route", label: "Route", number: 1 },
  { id: "dates", label: "Dates", number: 2 },
  { id: "travelers", label: "Travelers", number: 3 },
];

interface SearchStepIndicatorProps {
  currentStep: SearchStepId;
}

function stepIndex(step: SearchStepId): number {
  return STEPS.findIndex((entry) => entry.id === step);
}

export function SearchStepIndicator({ currentStep }: SearchStepIndicatorProps) {
  const activeIndex = stepIndex(currentStep);

  return (
    <nav className="search-steps" aria-label="Search progress">
      {STEPS.map((step, index) => {
        const isActive = step.id === currentStep;
        const isComplete = index < activeIndex;

        return (
          <div key={step.id} className="search-steps__group" style={{ display: "contents" }}>
            <div
              className={[
                "search-steps__item",
                isActive ? "search-steps__item--active" : "",
                isComplete ? "search-steps__item--complete" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-current={isActive ? "step" : undefined}
            >
              <span className="search-steps__marker" aria-hidden="true">
                {isComplete ? <Check size={14} strokeWidth={2.5} /> : step.number}
              </span>
              <span className="search-steps__label">{step.label}</span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`search-steps__connector${index < activeIndex ? " search-steps__connector--complete" : ""}`}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
