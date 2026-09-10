import { describe, expect, it } from "vitest";
import {
  angleLabel,
  exactValue,
  nearestStandardAngle,
  normalizeDegrees,
  quadrantFor,
  trigValue
} from "./trigonometry";

describe("angle helpers", () => {
  it("normalizes angles to one turn", () => {
    expect(normalizeDegrees(-30)).toBe(330);
    expect(normalizeDegrees(390)).toBe(30);
  });

  it("snaps to the nearest standard angle across zero", () => {
    expect(nearestStandardAngle(43).degrees).toBe(45);
    expect(nearestStandardAngle(358).degrees).toBe(0);
  });

  it("formats standard angle labels", () => {
    expect(angleLabel(150, "pi")).toBe("5π/6");
    expect(angleLabel(150, "degrees")).toBe("150°");
  });
});

describe("trigonometric values", () => {
  it("returns exact labels for standard sine and cosine", () => {
    expect(exactValue("sin", 30)).toBe("1/2");
    expect(exactValue("cos", 135)).toBe("−√2/2");
  });

  it("returns exact labels for standard tangent and cotangent", () => {
    expect(exactValue("tan", 30)).toBe("√3/3");
    expect(exactValue("ctg", 60)).toBe("√3/3");
    expect(exactValue("tan", 90)).toBe("не определён");
  });

  it("marks functions at their singularities", () => {
    expect(trigValue("tan", 90)).toBeNull();
    expect(trigValue("ctg", 180)).toBeNull();
  });

  it("identifies quadrants but not axes", () => {
    expect(quadrantFor(225)).toBe(3);
    expect(quadrantFor(270)).toBeNull();
  });
});
