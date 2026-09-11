import { describe, expect, it } from "vitest";
import {
  angleLabel,
  cofunctionMatchAngles,
  exactValue,
  learningObservation,
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

  it("finds every matching cofunction angle within one turn", () => {
    expect(cofunctionMatchAngles("sin", 30)).toEqual([60, 300]);
    expect(cofunctionMatchAngles("cos", 30)).toEqual([60, 120]);
    expect(cofunctionMatchAngles("sin", 90)).toEqual([0]);
  });
});

describe("trigonometric values", () => {
  it("matches sine and cosine at the marked cofunction angles", () => {
    const angle = 137;
    const sine = trigValue("sin", angle);
    const cosine = trigValue("cos", angle);
    cofunctionMatchAngles("sin", angle).forEach((match) => {
      expect(trigValue("cos", match)).toBeCloseTo(sine ?? 0);
    });
    cofunctionMatchAngles("cos", angle).forEach((match) => {
      expect(trigValue("sin", match)).toBeCloseTo(cosine ?? 0);
    });
  });

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

describe("learning observations", () => {
  it("connects common angles to real-world examples", () => {
    expect(learningObservation(30)).toContain("скатов крыш");
    expect(learningObservation(45)).toContain("Диагональ квадрата");
    expect(learningObservation(120)).toContain("трёхфазного тока");
  });

  it("uses general information when there is no useful angle-specific fact", () => {
    expect(learningObservation(150)).toContain("таблицу стандартных углов");
    expect(learningObservation(137)).toContain("навигации, геодезии");
  });
});
