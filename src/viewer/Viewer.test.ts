import { describe, expect, it } from "vitest";
import { animationMatrix } from "./Viewer";
import type { AnimationTransform } from "../core/types";

describe("animationMatrix", () => {
  it("keeps plugin-driven aircraft parts at their authored coordinates until a dataref is explicit", () => {
    const rotorFold: AnimationTransform[] = [{
      type: "rotate",
      axis: [0, 1, 0],
      keys: [
        { value: 0, angle: 0 },
        { value: 1, angle: 148 },
      ],
      dataref: "uh60m/rotor/sweep",
    }];

    expect(animationMatrix(rotorFold, {}).equals(animationMatrix([], {}))).toBe(true);
    expect(animationMatrix(rotorFold, { "uh60m/rotor/sweep": 1 }).equals(animationMatrix([], {}))).toBe(false);
  });

  it("still applies OBJ8 constant pivot translations", () => {
    const pivot: AnimationTransform[] = [{
      type: "translate",
      keys: [
        { value: 0, position: [0, 2.5, 4.5] },
        { value: 0, position: [0, 2.5, 4.5] },
      ],
      dataref: "none",
    }];

    const elements = animationMatrix(pivot, {}).elements;
    expect(elements[12]).toBeCloseTo(0);
    expect(elements[13]).toBeCloseTo(2.5);
    expect(elements[14]).toBeCloseTo(4.5);
  });
});
