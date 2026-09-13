import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent } from "react";
import { X } from "lucide-react";
import type { Airport } from "../../types/airport";
import "./AirportAutocomplete.css";

function airportLabel(airport: Airport): string {
  return `${airport.city} (${airport.iataCode})`;
}

function matchesQuery(airport: Airport, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return (
    airport.iataCode.toLowerCase().includes(normalized) ||
    airport.city.toLowerCase().includes(normalized) ||
    airport.name.toLowerCase().includes(normalized)
  );
}

interface AirportAutocompleteProps {
  label: string;
  airports: Airport[];
  value: Airport | null;
  onChange: (airport: Airport | null) => void;
  placeholder?: string;
  errorMessage?: string;
  excludeCode?: string;
}

/**
 * Accessible combobox (ARIA 1.2 "combobox with listbox popup" pattern):
 * arrow-key navigation, selection with Enter, closes with Escape,
 * highlighted option announced via aria-activedescendant.
 */
export function AirportAutocomplete({
  label,
  airports,
  value,
  onChange,
  placeholder,
  errorMessage,
  excludeCode,
}: AirportAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value ? airportLabel(value) : "");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const errorId = `${baseId}-error`;
  const optionId = (index: number) => `${baseId}-option-${index}`;

  useEffect(() => {
    if (value) {
      setInputValue(airportLabel(value));
    }
  }, [value]);

  const filteredAirports = useMemo(() => {
    const candidates = excludeCode ? airports.filter((a) => a.iataCode !== excludeCode) : airports;
    return candidates.filter((a) => matchesQuery(a, inputValue)).slice(0, 8);
  }, [airports, inputValue, excludeCode]);

  function openWithQuery(query: string) {
    setInputValue(query);
    setIsOpen(true);
    setHighlightedIndex(0);
    if (value) onChange(null);
  }

  function clearSelection() {
    onChange(null);
    setInputValue("");
    setIsOpen(true);
    setHighlightedIndex(0);
    inputRef.current?.focus();
  }

  function selectAirport(airport: Airport) {
    onChange(airport);
    setInputValue(airportLabel(airport));
    setIsOpen(false);
  }

  function handleFocus(event: FocusEvent<HTMLInputElement>) {
    setIsOpen(true);
    if (event.currentTarget.value) {
      event.currentTarget.select();
    }
  }

  function handleBlur() {
    window.setTimeout(() => {
      setIsOpen(false);
      if (value) {
        setInputValue(airportLabel(value));
        return;
      }
      setInputValue("");
    }, 100);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setIsOpen(true);
      return;
    }
    if (!isOpen) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, filteredAirports.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        event.preventDefault();
        if (filteredAirports[highlightedIndex]) {
          selectAirport(filteredAirports[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  }

  const showListbox = isOpen && filteredAirports.length > 0;

  return (
    <div className="airport-autocomplete">
      <label className="airport-autocomplete__label" htmlFor={baseId}>
        {label}
      </label>
      <div className="airport-autocomplete__control">
        <input
          ref={inputRef}
          id={baseId}
          type="text"
          role="combobox"
          aria-expanded={showListbox}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={showListbox ? optionId(highlightedIndex) : undefined}
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={errorMessage ? errorId : undefined}
          className="airport-autocomplete__input mono"
          autoComplete="off"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => openWithQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
        {(value || inputValue.trim()) && (
          <button
            type="button"
            className="airport-autocomplete__clear"
            aria-label={`Clear ${label.toLowerCase()}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={clearSelection}
          >
            <X size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        )}
      </div>
      {showListbox && (
        <ul className="airport-autocomplete__listbox" id={listboxId} role="listbox" aria-label={`${label} suggestions`}>
          {filteredAirports.map((airport, index) => (
            <li
              key={airport.iataCode}
              id={optionId(index)}
              role="option"
              aria-selected={index === highlightedIndex}
              className={`airport-autocomplete__option${index === highlightedIndex ? " airport-autocomplete__option--highlighted" : ""}`}
              onMouseDown={(e) => {
                e.preventDefault();
                selectAirport(airport);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <span className="mono airport-autocomplete__code">{airport.iataCode}</span>
              <span>
                {airport.city}
                <span className="airport-autocomplete__country"> · {airport.country}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
      {errorMessage && (
        <p className="airport-autocomplete__error" id={errorId} role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
