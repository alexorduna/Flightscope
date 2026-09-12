import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchForm } from "./SearchForm";
import type { Airport } from "../../types/airport";

const AIRPORTS: Airport[] = [
  { iataCode: "MTY", name: "Monterrey Airport", city: "Monterrey", country: "Mexico" },
  { iataCode: "TIJ", name: "Tijuana Airport", city: "Tijuana", country: "Mexico" },
];

async function pickAirport(user: ReturnType<typeof userEvent.setup>, label: string, query: string) {
  const input = screen.getByLabelText(label);
  await user.type(input, query);
  await user.click(await screen.findByRole("option"));
}

describe("SearchForm", () => {
  it("shows validation errors when submitted empty", async () => {
    const user = userEvent.setup();
    render(<SearchForm airports={AIRPORTS} isLoading={false} onSearch={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /search flights/i }));

    expect(await screen.findByText(/choose an origin airport/i)).toBeInTheDocument();
    expect(screen.getByText(/choose a destination airport/i)).toBeInTheDocument();
  });

  it("calls onSearch with the chosen values", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchForm airports={AIRPORTS} isLoading={false} onSearch={onSearch} />);

    await pickAirport(user, "Origin", "mon");
    await pickAirport(user, "Destination", "tij");
    await user.click(screen.getByRole("button", { name: /search flights/i }));

    expect(onSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        origin: expect.objectContaining({ iataCode: "MTY" }),
        destination: expect.objectContaining({ iataCode: "TIJ" }),
      })
    );
  });

  it("disables the search button while isLoading is true", () => {
    render(<SearchForm airports={AIRPORTS} isLoading={true} onSearch={vi.fn()} />);
    expect(screen.getByRole("button", { name: /searching/i })).toBeDisabled();
  });
});
