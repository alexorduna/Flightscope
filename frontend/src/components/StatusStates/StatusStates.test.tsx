import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoadingState, ErrorState, EmptyState } from "./StatusStates";

describe("StatusStates", () => {
  it("LoadingState is announced via role=status", () => {
    render(<LoadingState label="Searching for flights…" />);
    expect(screen.getByRole("status")).toHaveTextContent("Searching for flights…");
  });

  it("ErrorState is announced via role=alert and triggers onRetry", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState message="Something went wrong" onRetry={onRetry} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
    await user.click(screen.getByRole("button", { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("EmptyState shows a title and an optional description", () => {
    render(<EmptyState title="No results" description="Try another date" />);
    expect(screen.getByText("No results")).toBeInTheDocument();
    expect(screen.getByText("Try another date")).toBeInTheDocument();
  });
});
