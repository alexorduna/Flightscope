import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Vitest doesn't expose `afterEach` as a global (we don't use `test.globals: true`),
// so Testing Library's auto-cleanup between tests is registered by hand.
afterEach(cleanup);
