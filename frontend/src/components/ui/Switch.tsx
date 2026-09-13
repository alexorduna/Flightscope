import "./Switch.css";

interface SwitchProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  id?: string;
}

export function Switch({ checked, onChange, label, id }: SwitchProps) {
  return (
    <button
      type="button"
      id={id}
      className="switch"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
    >
      <span className="switch__track" aria-hidden="true">
        <span className="switch__thumb" />
      </span>
      <span className="switch__label">{label}</span>
    </button>
  );
}
