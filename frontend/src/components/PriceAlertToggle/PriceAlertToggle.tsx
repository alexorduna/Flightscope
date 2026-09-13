import { useId, useState } from "react";
import { Bell, X } from "lucide-react";
import type { PriceAlert } from "../../types/priceAlert";
import { Button } from "../ui/Button";
import { Switch } from "../ui/Switch";
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

export function PriceAlertToggle({ alert, defaultTargetPrice, currency, onCreate, onToggleActive, onRemove }: PriceAlertToggleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftPrice, setDraftPrice] = useState(defaultTargetPrice);
  const inputId = useId();

  if (isEditing) {
    return (
      <form
        className="price-alert price-alert--editing"
        onSubmit={(e) => {
          e.preventDefault();
          onCreate(draftPrice);
          setIsEditing(false);
        }}
      >
        <label className="price-alert__label" htmlFor={inputId}>
          Notify when price drops below
        </label>
        <div className="price-alert__row">
          <input
            id={inputId}
            type="number"
            className="price-alert__input mono"
            min={0}
            step={50}
            value={draftPrice}
            onChange={(e) => setDraftPrice(Number(e.target.value))}
          />
          <Button type="submit" variant="secondary">
            Save
          </Button>
          <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  if (!alert) {
    return (
      <Button type="button" variant="secondary" className="price-alert__create" onClick={() => setIsEditing(true)}>
        <Bell size={16} strokeWidth={2} aria-hidden="true" />
        Price alert
      </Button>
    );
  }

  const switchLabel = alert.active
    ? `Active — notify below ${formatCurrency(alert.targetPrice, currency)}`
    : `Paused — notify below ${formatCurrency(alert.targetPrice, currency)}`;

  return (
    <div className="price-alert price-alert--active">
      <Switch checked={alert.active} onChange={onToggleActive} label={switchLabel} />
      <button type="button" className="price-alert__remove" onClick={onRemove} aria-label="Remove price alert">
        <X size={18} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
}
