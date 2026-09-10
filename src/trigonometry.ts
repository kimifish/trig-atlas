export type TrigFunction = "sin" | "cos" | "tan" | "ctg";

export interface StandardAngle {
  degrees: number;
  pi: string;
  sin: string;
  cos: string;
}

export const STANDARD_ANGLES: StandardAngle[] = [
  { degrees: 0, pi: "0", sin: "0", cos: "1" },
  { degrees: 30, pi: "π/6", sin: "1/2", cos: "√3/2" },
  { degrees: 45, pi: "π/4", sin: "√2/2", cos: "√2/2" },
  { degrees: 60, pi: "π/3", sin: "√3/2", cos: "1/2" },
  { degrees: 90, pi: "π/2", sin: "1", cos: "0" },
  { degrees: 120, pi: "2π/3", sin: "√3/2", cos: "−1/2" },
  { degrees: 135, pi: "3π/4", sin: "√2/2", cos: "−√2/2" },
  { degrees: 150, pi: "5π/6", sin: "1/2", cos: "−√3/2" },
  { degrees: 180, pi: "π", sin: "0", cos: "−1" },
  { degrees: 210, pi: "7π/6", sin: "−1/2", cos: "−√3/2" },
  { degrees: 225, pi: "5π/4", sin: "−√2/2", cos: "−√2/2" },
  { degrees: 240, pi: "4π/3", sin: "−√3/2", cos: "−1/2" },
  { degrees: 270, pi: "3π/2", sin: "−1", cos: "0" },
  { degrees: 300, pi: "5π/3", sin: "−√3/2", cos: "1/2" },
  { degrees: 315, pi: "7π/4", sin: "−√2/2", cos: "√2/2" },
  { degrees: 330, pi: "11π/6", sin: "−1/2", cos: "√3/2" },
  { degrees: 360, pi: "2π", sin: "0", cos: "1" }
];

const formatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 3,
  minimumFractionDigits: 0
});

const EXACT_RATIOS: Record<number, { tan: string; ctg: string }> = {
  0: { tan: "0", ctg: "не определён" },
  30: { tan: "√3/3", ctg: "√3" },
  45: { tan: "1", ctg: "1" },
  60: { tan: "√3", ctg: "√3/3" },
  90: { tan: "не определён", ctg: "0" },
  120: { tan: "−√3", ctg: "−√3/3" },
  135: { tan: "−1", ctg: "−1" },
  150: { tan: "−√3/3", ctg: "−√3" },
  180: { tan: "0", ctg: "не определён" },
  210: { tan: "√3/3", ctg: "√3" },
  225: { tan: "1", ctg: "1" },
  240: { tan: "√3", ctg: "√3/3" },
  270: { tan: "не определён", ctg: "0" },
  300: { tan: "−√3", ctg: "−√3/3" },
  315: { tan: "−1", ctg: "−1" },
  330: { tan: "−√3/3", ctg: "−√3" }
};

export function normalizeDegrees(degrees: number): number {
  return ((degrees % 360) + 360) % 360;
}

export function degreesToRadians(degrees: number): number {
  return (normalizeDegrees(degrees) * Math.PI) / 180;
}

export function nearestStandardAngle(degrees: number): StandardAngle {
  const normalized = normalizeDegrees(degrees);
  return STANDARD_ANGLES.slice(0, -1).reduce((closest, angle) => {
    const currentDistance = Math.abs(angle.degrees - normalized);
    const wrappedDistance = Math.min(currentDistance, 360 - currentDistance);
    const closestDistance = Math.abs(closest.degrees - normalized);
    const wrappedClosest = Math.min(closestDistance, 360 - closestDistance);
    return wrappedDistance < wrappedClosest ? angle : closest;
  });
}

export function standardAngleAt(degrees: number): StandardAngle | undefined {
  const normalized = normalizeDegrees(degrees);
  return STANDARD_ANGLES.slice(0, -1).find((angle) => angle.degrees === normalized);
}

export function trigValue(fn: TrigFunction, degrees: number): number | null {
  const radians = degreesToRadians(degrees);
  const sin = Math.sin(radians);
  const cos = Math.cos(radians);

  if (fn === "sin") return Math.abs(sin) < 1e-12 ? 0 : sin;
  if (fn === "cos") return Math.abs(cos) < 1e-12 ? 0 : cos;
  if (fn === "tan") return Math.abs(cos) < 1e-10 ? null : sin / cos;
  return Math.abs(sin) < 1e-10 ? null : cos / sin;
}

export function formatDecimal(value: number | null): string {
  if (value === null) return "не определён";
  return formatter.format(Math.abs(value) < 0.0005 ? 0 : value);
}

export function exactValue(fn: TrigFunction, degrees: number): string | undefined {
  const angle = standardAngleAt(degrees);
  if (!angle) return undefined;
  if (fn === "sin") return angle.sin;
  if (fn === "cos") return angle.cos;
  return EXACT_RATIOS[angle.degrees][fn];
}

export function angleLabel(degrees: number, unit: "degrees" | "pi"): string {
  if (unit === "degrees") return `${Math.round(degrees)}°`;
  const standard = standardAngleAt(degrees);
  return standard?.pi ?? `≈ ${formatter.format(degrees / 180)}π`;
}

export function quadrantFor(degrees: number): number | null {
  const normalized = normalizeDegrees(degrees);
  if (normalized % 90 === 0) return null;
  return Math.floor(normalized / 90) + 1;
}
