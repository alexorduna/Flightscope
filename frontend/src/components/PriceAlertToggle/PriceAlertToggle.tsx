import { useId, useState } from "react";
import type { PriceAlert } from "../../types/priceAlert";
import { formatCurrency } from "../../utils/formatters";
import "./PriceAlertToggle.css";

interface PriceAlertToggleProps {
  alert: PriceAlert | null;
  defaultTargetPrice: number;
  currency: string;
  onCreate: (targetPrice: number) => void;
  onToggleActive: () => void;
  onRemove: () => void;
}

/**
 * UI simulation: the alert only lives in the parent's React state (see
 * hooks/usePriceAlerts.ts). No real notifications are sent and nothing is
 * persisted anywhere - it's lost on page refresh.
 */
export function PriceAlertToggle({ alert, defaultTargetPrice, currency, onCreate, onToggleActive, onRemove }: PriceAlertToggleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftPrice, setDraftPrice] = useState(defaultTargetPrice);
  const inputId = useId();

  if (isEditing) {
    return (
      <form
        className="price-alert-toggle price-alert-toggle--editing"
        onSubmit={(e) => {
          e.preventDefault();
          onCreate(draftPrice);
          setIsEditing(false);
        }}
      >
        <label htmlFor={inputId}>Notify me if it drops below</label>
        <input
          id={inputId}
          type="number"
          className="mono"
          min={0}
          step={50}
          value={draftPrice}
          onChange={(e) => setDraftPrice(Number(e.target.value))}
        />
        <button type="submit" className="price-alert-toggle__save">
          Save
        </button>
        <button type="button" className="price-alert-toggle__cancel" onClick={() => setIsEditing(false)}>
          Cancel
        </button>
      </form>
    );
  }

  if (!alert) {
    return (
      <button type="button" className="price-alert-toggle price-alert-toggle__create" onClick={() => setIsEditing(true)}>
        <span aria-hidden="true">🔔</span> Create price alert
      </button>
    );
  }

  return (
    <div className="price-alert-toggle price-alert-toggle--active">
      <button
        type="button"
        className="price-alert-toggle__switch"
        role="switch"
        aria-checked={alert.active}
        onClick={onToggleActive}
      >
        <span className="price-alert-toggle__switch-track" aria-hidden="true" />
        <span>
          {alert.active ? "Alert active" : "Alert paused"}: notify me if it drops below{" "}
          <strong className="mono">{formatCurrency(alert.targetPrice, currency)}</strong>
        </span>
      </button>
      <button type="button" className="price-alert-toggle__remove" onClick={onRemove} aria-label="Remove price alert">
        ✕
      </button>
    </div>
  );
}
