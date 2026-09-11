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

export function cofunctionMatchAngles(source: "sin" | "cos", degrees: number): number[] {
  const complementary = normalizeDegrees(90 - degrees);
  const reflected = source === "sin"
    ? normalizeDegrees(-complementary)
    : normalizeDegrees(180 - complementary);
  return [...new Set([complementary, reflected])].sort((a, b) => a - b);
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

const REAL_WORLD_ANGLE_FACTS: Partial<Record<number, string>> = {
  0: "Нулевой угол означает отсутствие поворота. Так описывают совпадающие направления в навигации и механике.",
  30: "Угол 30° часто появляется в расчётах скатов крыш и при работе с высотой равностороннего треугольника.",
  45: "Диагональ квадрата идёт под 45° к его сторонам. Это направление используют в планах, сетках и при разложении движения на равные компоненты.",
  60: "Все углы равностороннего треугольника равны 60°. Такой шаг направлений образует треугольные и шестиугольные сетки.",
  90: "Прямой угол используют для проверки перпендикулярности стен, деталей, траекторий и координатных осей.",
  120: "120° — внутренний угол правильного шестиугольника. Сдвиг на 120° также используется между фазами трёхфазного тока.",
  135: "Направления 45°, 135°, 225° и 315° задают четыре диагонали квадратной сетки относительно одной оси.",
  180: "Развёрнутый угол означает противоположное направление по той же прямой — например, полный разворот курса.",
  225: "Направления 45°, 135°, 225° и 315° задают четыре диагонали квадратной сетки относительно одной оси.",
  240: "Фазы симметричной трёхфазной системы можно представить углами 0°, 120° и 240°.",
  270: "Поворот на 270° — это три четверти полного оборота; его часто заменяют более коротким поворотом на 90° в обратную сторону.",
  300: "Угол 300° задаёт то же конечное направление, что и поворот на 60° по часовой стрелке.",
  315: "Направления 45°, 135°, 225° и 315° задают четыре диагонали квадратной сетки относительно одной оси."
};

export function learningObservation(degrees: number): string {
  const standard = standardAngleAt(degrees);
  const realWorldFact = standard && REAL_WORLD_ANGLE_FACTS[standard.degrees];
  if (realWorldFact) return realWorldFact;
  if (standard) return `${standard.degrees}° (${standard.pi}) входит в таблицу стандартных углов. Такие углы удобны в расчётах сил, скоростей и перемещений, потому что их точные значения известны без округления.`;
  return "Произвольные углы обычно приходят из измерений. В навигации, геодезии, физике и компьютерной графике тригонометрия связывает длину и направление с координатами.";
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
