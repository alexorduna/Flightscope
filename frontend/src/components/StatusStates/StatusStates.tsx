import { Loader2, AlertCircle, SearchX } from "lucide-react";
import { Button } from "../ui/Button";
import "./StatusStates.css";

interface LoadingStateProps {
  label: string;
  compact?: boolean;
}

export function LoadingState({ label, compact = false }: LoadingStateProps) {
  return (
    <div
      className={`status-state status-state--loading${compact ? " status-state--compact" : ""}`}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="status-state__spinner" size={28} strokeWidth={2} aria-hidden="true" />
      <p className="status-state__message">{label}</p>
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function ErrorState({ message, onRetry, compact = false }: ErrorStateProps) {
  return (
    <div className={`status-state status-state--error${compact ? " status-state--compact" : ""}`} role="alert">
      <AlertCircle className="status-state__icon" size={28} strokeWidth={1.75} aria-hidden="true" />
      <p className="status-state__message">{message}</p>
      {onRetry && (
        <Button variant="danger" className="status-state__retry" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  embedded?: boolean;
}

export function EmptyState({ title, description, embedded = false }: EmptyStateProps) {
  return (
    <div className={`status-state status-state--empty${embedded ? " status-state--embedded" : ""}`} role="status">
      <SearchX className="status-state__icon" size={32} strokeWidth={1.5} aria-hidden="true" />
      <p className="status-state__title">{title}</p>
      {description && <p className="status-state__description">{description}</p>}
    </div>
  );
}
