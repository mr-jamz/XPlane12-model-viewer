import { describe, expect, it } from "vitest";
import { interpolation } from "./Viewer";

describe("OBJ8 animation interpolation", () => {
  const keys = [
    { value: 0.999, position: 10 },
    { value: 1, position: 20 },
  ];

  it("clamps values below the first key instead of extrapolating", () => {
    const [left, right, amount] = interpolation(keys, 0);
    expect(left).toBe(keys[0]);
    expect(right).toBe(keys[0]);
    expect(amount).toBe(0);
  });

  it("clamps values above the last key instead of extrapolating", () => {
    const [left, right, amount] = interpolation(keys, 2);
    expect(left).toBe(keys[1]);
    expect(right).toBe(keys[1]);
    expect(amount).toBe(0);
  });

  it("interpolates values within the authored range", () => {
    const [left, right, amount] = interpolation(keys, 0.9995);
    expect(left).toBe(keys[0]);
    expect(right).toBe(keys[1]);
    expect(amount).toBeCloseTo(0.5);
  });
});
