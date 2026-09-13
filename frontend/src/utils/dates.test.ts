import { describe, it, expect } from "vitest";
import { addDaysIso, daysBetweenIso, isDateInWindow } from "./dates";

describe("isDateInWindow", () => {
  it("returns true for dates inside the +/- window", () => {
    expect(isDateInWindow("2030-06-12", "2030-06-15", 3)).toBe(true);
    expect(isDateInWindow("2030-06-18", "2030-06-15", 3)).toBe(true);
  });

  it("returns false for dates outside the window", () => {
    expect(isDateInWindow("2030-06-11", "2030-06-15", 3)).toBe(false);
    expect(isDateInWindow("2030-06-19", "2030-06-15", 3)).toBe(false);
  });
});

describe("daysBetweenIso", () => {
  it("measures whole-day differences", () => {
    expect(daysBetweenIso("2030-06-15", "2030-06-18")).toBe(3);
    expect(daysBetweenIso("2030-06-18", "2030-06-15")).toBe(-3);
    expect(daysBetweenIso("2030-06-15", addDaysIso("2030-06-15", 0))).toBe(0);
  });
});
