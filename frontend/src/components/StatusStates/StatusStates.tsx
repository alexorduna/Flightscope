import "./StatusStates.css";

interface LoadingStateProps {
  label: string;
}

/** Announced to screen readers via aria-live without stealing focus. */
export function LoadingState({ label }: LoadingStateProps) {
  return (
    <div className="status-state status-state--loading" role="status" aria-live="polite">
      <span className="status-state__spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="status-state status-state--error" role="alert">
      <span className="status-state__icon" aria-hidden="true">
        ▲
      </span>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="status-state__retry" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="status-state status-state--empty" role="status">
      <span className="status-state__icon" aria-hidden="true">
        ✈
      </span>
      <p className="status-state__title">{title}</p>
      {description && <p className="status-state__description">{description}</p>}
    </div>
  );
}
