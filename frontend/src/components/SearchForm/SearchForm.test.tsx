import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchForm } from "./SearchForm";
import type { Airport } from "../../types/airport";

const AIRPORTS: Airport[] = [
  { iataCode: "MTY", name: "Monterrey Airport", city: "Monterrey", country: "Mexico" },
  { iataCode: "TIJ", name: "Tijuana Airport", city: "Tijuana", country: "Mexico" },
];

async function pickAirport(user: ReturnType<typeof userEvent.setup>, label: string, query: string) {
  const input = screen.getByLabelText(label, { exact: true });
  await user.type(input, query);
  const listbox = await screen.findByRole("listbox", { name: `${label} suggestions` });
  await user.click(within(listbox).getByRole("option"));
}

async function completeWizardToSearch(user: ReturnType<typeof userEvent.setup>) {
  await pickAirport(user, "Origin", "mon");
  await pickAirport(user, "Destination", "tij");
  await user.click(screen.getByRole("button", { name: /^continue$/i }));
  await user.click(screen.getByRole("button", { name: /^continue$/i }));
}

describe("SearchForm", () => {
  it("shows validation errors on the route step", async () => {
    const user = userEvent.setup();
    render(<SearchForm airports={AIRPORTS} isLoading={false} onSearch={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /^continue$/i }));

    expect(await screen.findByText(/choose an origin airport/i)).toBeInTheDocument();
    expect(screen.getByText(/choose a destination airport/i)).toBeInTheDocument();
  });

  it("calls onSearch after completing all wizard steps", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<SearchForm airports={AIRPORTS} isLoading={false} onSearch={onSearch} />);

    await completeWizardToSearch(user);
    await user.click(screen.getByRole("button", { name: /search flights/i }));

    expect(onSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        origin: expect.objectContaining({ iataCode: "MTY" }),
        destination: expect.objectContaining({ iataCode: "TIJ" }),
      })
    );
  });

  it("disables the search button while isLoading is true", async () => {
    const user = userEvent.setup();
    render(<SearchForm airports={AIRPORTS} isLoading={true} onSearch={vi.fn()} />);

    await completeWizardToSearch(user);
    expect(screen.getByRole("button", { name: /searching/i })).toBeDisabled();
  });
});
