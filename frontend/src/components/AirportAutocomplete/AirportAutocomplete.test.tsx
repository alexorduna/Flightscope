import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AirportAutocomplete } from "./AirportAutocomplete";
import type { Airport } from "../../types/airport";

const AIRPORTS: Airport[] = [
  { iataCode: "MTY", name: "Monterrey Airport", city: "Monterrey", country: "Mexico" },
  { iataCode: "TIJ", name: "Tijuana Airport", city: "Tijuana", country: "Mexico" },
  { iataCode: "MEX", name: "Mexico City Airport", city: "Mexico City", country: "Mexico" },
];

describe("AirportAutocomplete", () => {
  it("shows the filtered listbox while typing", async () => {
    const user = userEvent.setup();
    render(<AirportAutocomplete label="Origin" airports={AIRPORTS} value={null} onChange={vi.fn()} />);

    await user.type(screen.getByLabelText("Origin"), "mon");

    expect(screen.getByRole("option", { name: /Monterrey/ })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Tijuana/ })).not.toBeInTheDocument();
  });

  it("calls onChange when clicking an option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AirportAutocomplete label="Origin" airports={AIRPORTS} value={null} onChange={onChange} />);

    await user.type(screen.getByLabelText("Origin"), "tij");
    await user.click(screen.getByRole("option", { name: /Tijuana/ }));

    expect(onChange).toHaveBeenCalledWith(AIRPORTS[1]);
  });

  it("allows selecting with the keyboard (arrows + Enter)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AirportAutocomplete label="Destination" airports={AIRPORTS} value={null} onChange={onChange} />);

    const input = screen.getByLabelText("Destination");
    await user.click(input);
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");

    expect(onChange).toHaveBeenCalledWith(AIRPORTS[2]);
  });

  it("excludes the airport given in excludeCode", async () => {
    const user = userEvent.setup();
    render(<AirportAutocomplete label="Destination" airports={AIRPORTS} value={null} onChange={vi.fn()} excludeCode="MTY" />);

    await user.click(screen.getByLabelText("Destination"));

    expect(screen.queryByRole("option", { name: /Monterrey/ })).not.toBeInTheDocument();
  });
});
