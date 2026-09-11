import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  STANDARD_ANGLES,
  angleLabel,
  cofunctionMatchAngles,
  exactValue,
  formatDecimal,
  learningObservation,
  nearestStandardAngle,
  normalizeDegrees,
  quadrantFor,
  trigValue,
  type TrigFunction
} from "./trigonometry";

type Mode = "circle" | "graph" | "learn";
type Unit = "degrees" | "pi";
type GraphKind = "waves" | "tan";

const COLORS = {
  sin: "#55c7d9",
  cos: "#edae49",
  tan: "#b895e8"
};

const modes: { id: Mode; label: string }[] = [
  { id: "circle", label: "Окружность" },
  { id: "graph", label: "Графики" },
  { id: "learn", label: "Объяснение" }
];

function polarPoint(cx: number, cy: number, radius: number, degrees: number) {
  const radians = (degrees * Math.PI) / 180;
  return { x: cx + radius * Math.cos(radians), y: cy - radius * Math.sin(radians) };
}

function arcPath(cx: number, cy: number, radius: number, start: number, end: number) {
  const from = polarPoint(cx, cy, radius, start);
  const to = polarPoint(cx, cy, radius, end);
  const sweep = normalizeDegrees(end - start);
  return `M ${from.x} ${from.y} A ${radius} ${radius} 0 ${sweep > 180 ? 1 : 0} 0 ${to.x} ${to.y}`;
}

function sectorPath(cx: number, cy: number, radius: number, start: number, end: number) {
  const from = polarPoint(cx, cy, radius, start);
  const to = polarPoint(cx, cy, radius, end);
  return `M ${cx} ${cy} L ${from.x} ${from.y} A ${radius} ${radius} 0 0 0 ${to.x} ${to.y} Z`;
}

interface MiniGraphProps {
  angle: number;
  kind: GraphKind;
  unit: Unit;
  onKindChange: (kind: GraphKind) => void;
}

function MiniGraph({ angle, kind, unit, onKindChange }: MiniGraphProps) {
  const width = 720;
  const height = 124;
  const left = 12;
  const right = width - 12;
  const middle = 65;
  const amplitude = 43;
  const xFor = (degrees: number) => left + (degrees / 360) * (right - left);
  const wavePath = (fn: "sin" | "cos") => {
    const points = Array.from({ length: 181 }, (_, index) => {
      const degrees = index * 2;
      const value = fn === "sin" ? Math.sin((degrees * Math.PI) / 180) : Math.cos((degrees * Math.PI) / 180);
      return `${index === 0 ? "M" : "L"} ${xFor(degrees).toFixed(1)} ${(middle - value * amplitude).toFixed(1)}`;
    });
    return points.join(" ");
  };
  const tanPaths: string[] = [];
  let segment = "";
  for (let degrees = 0; degrees <= 360; degrees += 1) {
    const value = Math.tan((degrees * Math.PI) / 180);
    if (Math.abs(value) > 2.6) {
      if (segment) tanPaths.push(segment);
      segment = "";
      continue;
    }
    segment += `${segment ? " L" : "M"} ${xFor(degrees).toFixed(1)} ${(middle - value * 17).toFixed(1)}`;
  }
  if (segment) tanPaths.push(segment);

  const normalized = normalizeDegrees(angle);
  const markerX = xFor(normalized);
  const sinY = middle - Math.sin((normalized * Math.PI) / 180) * amplitude;
  const cosY = middle - Math.cos((normalized * Math.PI) / 180) * amplitude;
  const graphAngles = (angles: number[]) => angles.flatMap((match) => match === 0 ? [0, 360] : [match]);
  const isCurrentAngle = (match: number) => Math.abs(match - normalized) < 0.0001;
  const matchingCosAngles = graphAngles(cofunctionMatchAngles("sin", normalized)).filter((match) => !isCurrentAngle(match));
  const matchingSinAngles = graphAngles(cofunctionMatchAngles("cos", normalized)).filter((match) => !isCurrentAngle(match));
  const tan = trigValue("tan", normalized);
  const tanY = tan === null ? null : middle - tan * 17;

  return (
    <section className="graph-panel" aria-label="График функций">
      <div className="graph-toolbar">
        <span>{kind === "waves" ? "● текущие · ◇ равные" : "Один оборот"}</span>
        <div className="mini-switch" aria-label="Выбор графика">
          <button aria-pressed={kind === "waves"} className={kind === "waves" ? "active" : ""} onClick={() => onKindChange("waves")}>sin · cos</button>
          <button aria-pressed={kind === "tan"} className={kind === "tan" ? "active" : ""} onClick={() => onKindChange("tan")}>tan</button>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`График при угле ${Math.round(angle)} градусов`}>
        <line x1={left} y1={middle} x2={right} y2={middle} className="graph-axis" />
        {[0, 90, 180, 270, 360].map((tick) => (
          <g key={tick}>
            <line x1={xFor(tick)} y1="27" x2={xFor(tick)} y2="112" className="graph-grid" />
            <text x={xFor(tick)} y="21" textAnchor={tick === 0 ? "start" : tick === 360 ? "end" : "middle"} className="graph-label">
              {unit === "degrees"
                ? `${tick}°`
                : tick === 0 ? "0" : tick === 180 ? "π" : tick === 360 ? "2π" : tick === 90 ? "π/2" : "3π/2"}
            </text>
          </g>
        ))}
        {kind === "waves" ? (
          <>
            <line x1={left} y1={sinY} x2={right} y2={sinY} className="equal-value-guide equal-value-guide-sin" />
            <line x1={left} y1={cosY} x2={right} y2={cosY} className="equal-value-guide equal-value-guide-cos" />
            <path d={wavePath("sin")} className="wave wave-sin" />
            <path d={wavePath("cos")} className="wave wave-cos" />
            <circle cx={markerX} cy={sinY} r="5" fill={COLORS.sin} />
            <circle cx={markerX} cy={cosY} r="5" fill={COLORS.cos} />
            {matchingCosAngles.map((match) => (
              <rect
                key={`cos-${match}`}
                x={xFor(match) - 4}
                y={sinY - 4}
                width="8"
                height="8"
                className="equal-value-point equal-value-point-cos"
                transform={`rotate(45 ${xFor(match)} ${sinY})`}
              />
            ))}
            {matchingSinAngles.map((match) => (
              <rect
                key={`sin-${match}`}
                x={xFor(match) - 4}
                y={cosY - 4}
                width="8"
                height="8"
                className="equal-value-point equal-value-point-sin"
                transform={`rotate(45 ${xFor(match)} ${cosY})`}
              />
            ))}
          </>
        ) : (
          <>
            {[90, 270].map((tick) => <line key={tick} x1={xFor(tick)} y1="16" x2={xFor(tick)} y2="116" className="asymptote" />)}
            {tanPaths.map((path, index) => <path key={index} d={path} className="wave wave-tan" />)}
            {tanY !== null && tanY > 14 && tanY < 118 && <circle cx={markerX} cy={tanY} r="5" fill={COLORS.tan} />}
          </>
        )}
        <line x1={markerX} y1="14" x2={markerX} y2="118" className="graph-marker" />
      </svg>
    </section>
  );
}

interface CircleProps {
  angle: number;
  unit: Unit;
  mode: Mode;
  onAngleChange: (angle: number) => void;
}

function UnitCircle({ angle, unit, mode, onAngleChange }: CircleProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const cx = 188;
  const cy = 181;
  const radius = 132;
  const normalized = normalizeDegrees(angle);
  const point = polarPoint(cx, cy, radius, normalized);
  const radians = (normalized * Math.PI) / 180;
  const tangentY = cy - radius * Math.tan(radians);
  const tangentVisible = Math.abs(Math.cos(radians)) > 0.015;
  const tangentClamped = Math.max(24, Math.min(338, tangentY));
  const tangentOverflow = tangentVisible && tangentY !== tangentClamped;
  const tangentGuideX = tangentOverflow
    ? cx + radius * ((tangentClamped - cy) / (tangentY - cy))
    : cx + radius;
  const currentQuadrant = quadrantFor(normalized);

  const updateFromPointer = (event: ReactPointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 400;
    const y = ((event.clientY - rect.top) / rect.height) * 362;
    const dx = x - cx;
    const dy = cy - y;
    const rawAngle = normalizeDegrees((Math.atan2(dy, dx) * 180) / Math.PI);
    const distance = Math.hypot(dx, dy);
    const shouldSnap = distance < radius * 0.78;
    onAngleChange(shouldSnap ? nearestStandardAngle(rawAngle).degrees : Math.round(rawAngle));
  };

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromPointer(event);
  };

  const handleKeyDown = (event: React.KeyboardEvent<SVGSVGElement>) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "Home" || event.key === "End") {
      onAngleChange(event.key === "Home" ? 0 : 359);
      return;
    }
    const direction = event.key === "ArrowRight" || event.key === "ArrowUp" ? 1 : -1;
    if (unit === "degrees") {
      onAngleChange(normalizeDegrees(angle + direction));
      return;
    }
    const current = nearestStandardAngle(angle).degrees;
    const index = STANDARD_ANGLES.slice(0, -1).findIndex((item) => item.degrees === current);
    const next = (index + direction + STANDARD_ANGLES.length - 1) % (STANDARD_ANGLES.length - 1);
    onAngleChange(STANDARD_ANGLES[next].degrees);
  };

  return (
    <section className="circle-stage">
      <svg
        ref={svgRef}
        className="unit-circle"
        viewBox="0 0 400 362"
        onPointerDown={handlePointerDown}
        onPointerMove={(event) => event.currentTarget.hasPointerCapture(event.pointerId) && updateFromPointer(event)}
        onKeyDown={handleKeyDown}
        role="slider"
        tabIndex={0}
        aria-label="Выбор угла на единичной окружности"
        aria-valuemin={0}
        aria-valuemax={359}
        aria-valuenow={Math.round(normalized)}
        aria-valuetext={`${angleLabel(normalized, unit)}, ${angleLabel(normalized, unit === "degrees" ? "pi" : "degrees")}`}
      >
        <defs>
          <filter id="point-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <path d={sectorPath(cx, cy, radius, 0, 90)} className="quarter quarter-one" />
        <path d={sectorPath(cx, cy, radius, 90, 180)} className="quarter quarter-two" />
        <path d={sectorPath(cx, cy, radius, 180, 270)} className="quarter quarter-three" />
        <path d={sectorPath(cx, cy, radius, 270, 360)} className="quarter quarter-four" />

        <line x1="34" y1={cy} x2="342" y2={cy} className="axis" />
        <line x1={cx} y1="26" x2={cx} y2="336" className="axis" />
        <path d="M 342 181 l -9 -5 v 10 z" className="axis-arrow" />
        <path d="M 188 26 l -5 9 h 10 z" className="axis-arrow" />
        <text x="348" y="176" className="axis-name">x</text>
        <text x="196" y="29" className="axis-name">y</text>

        <circle cx={cx} cy={cy} r={radius * 0.75} className="inner-ring" />
        <circle cx={cx} cy={cy} r={radius} className="circle-outline" />
        {mode !== "learn" && (
          <g className="sign-guides" aria-hidden="true">
            <text x="116" y="54" className="sign-sin">sin +</text>
            <text x="116" y="315" className="sign-sin negative-sign">sin −</text>
            <text x="47" y="171" className="sign-cos">cos −</text>
            <text x="283" y="171" className="sign-cos">cos +</text>
          </g>
        )}

        {STANDARD_ANGLES.slice(0, -1).map((standard) => {
          const outer = polarPoint(cx, cy, radius + 4, standard.degrees);
          const inner = polarPoint(cx, cy, radius - 5, standard.degrees);
          const label = polarPoint(cx, cy, radius + 20, standard.degrees);
          const major = standard.degrees % 90 === 0;
          return (
            <g key={standard.degrees}>
              <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} className={major ? "tick major" : "tick"} />
              {(mode === "learn" || major) && (
                <text x={label.x} y={label.y + 3} textAnchor="middle" className="tick-label">
                  {unit === "pi" ? standard.pi : `${standard.degrees}°`}
                </text>
              )}
            </g>
          );
        })}

        <polygon points={`${cx},${cy} ${point.x},${cy} ${point.x},${point.y}`} className="triangle-fill" />
        <line x1={cx} y1={cy} x2={point.x} y2={point.y} className="radius-line" />
        <line x1={cx} y1={cy} x2={point.x} y2={cy} className={`cos-line ${Math.cos(radians) < 0 ? "negative" : ""}`} />
        <line x1={point.x} y1={cy} x2={point.x} y2={point.y} className={`sin-line ${Math.sin(radians) < 0 ? "negative" : ""}`} />

        {normalized !== 0 && <path d={arcPath(cx, cy, 37, 0, normalized)} className="angle-arc" />}
        <text x={cx + 47} y={cy - 13} className="angle-inside">α</text>

        <line x1={cx + radius} y1="22" x2={cx + radius} y2="340" className="tangent-axis" />
        {tangentVisible && (
          <>
            <line x1={point.x} y1={point.y} x2={tangentGuideX} y2={tangentClamped} className="tangent-guide" />
            <line x1={cx + radius} y1={cy} x2={cx + radius} y2={tangentClamped} className="tangent-value" />
            {!tangentOverflow && <circle cx={cx + radius} cy={tangentY} r="5" className="tangent-point" />}
            {tangentOverflow && (
              <path
                d={tangentY < 24 ? `M ${cx + radius - 5} 34 L ${cx + radius} 24 L ${cx + radius + 5} 34` : `M ${cx + radius - 5} 328 L ${cx + radius} 338 L ${cx + radius + 5} 328`}
                className="tangent-arrow"
              />
            )}
          </>
        )}
        {mode === "learn" && <text x={cx + radius + 8} y="52" className="tangent-label">x = 1</text>}

        <circle cx={point.x} cy={point.y} r="8" className="angle-point" filter="url(#point-glow)" />
        <circle cx={cx} cy={cy} r="4" className="origin" />
      </svg>

      <div className="angle-readout">
        <strong>{angleLabel(normalized, unit)}</strong>
        <span>{unit === "degrees" ? angleLabel(normalized, "pi") : angleLabel(normalized, "degrees")}</span>
        {currentQuadrant && <small>{currentQuadrant} четверть</small>}
      </div>
      <p className="gesture-hint">По краю — градусы · внутри — стандартные доли π</p>
    </section>
  );
}

interface ValueCardProps {
  fn: TrigFunction;
  angle: number;
  onSelect?: () => void;
}

function ValueCard({ fn, angle, onSelect }: ValueCardProps) {
  const exact = exactValue(fn, angle);
  const decimal = formatDecimal(trigValue(fn, angle));
  const style = fn === "ctg" ? undefined : { "--accent": COLORS[fn] } as React.CSSProperties;
  const content = (
    <>
      <span className="function-name">{fn}</span>
      <strong>{exact ?? decimal}</strong>
      {exact && exact !== decimal && exact !== "не определён" && <small>≈ {decimal}</small>}
    </>
  );

  return onSelect ? (
    <button className={`value-card value-${fn}`} style={style} onClick={onSelect}>{content}</button>
  ) : (
    <div className={`value-card value-${fn}`} style={style}>{content}</div>
  );
}

function LearningNote({ angle }: { angle: number }) {
  return <aside className="learning-note"><span>Наблюдение</span><p>{learningObservation(angle)}</p></aside>;
}

export default function App() {
  const [angle, setAngle] = useState(45);
  const [unit, setUnit] = useState<Unit>("pi");
  const [mode, setMode] = useState<Mode>("circle");
  const [graphKind, setGraphKind] = useState<GraphKind>("waves");

  const selectGraph = (kind: GraphKind) => {
    setGraphKind(kind);
    setMode("graph");
  };

  return (
    <main className={`app mode-${mode}`}>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">α</span>
          <div><small>Интерактивный</small><h1>Атлас углов</h1></div>
        </div>
        <div className="unit-switch" aria-label="Единицы угла">
          <button aria-pressed={unit === "degrees"} className={unit === "degrees" ? "active" : ""} onClick={() => setUnit("degrees")}>°</button>
          <button aria-pressed={unit === "pi"} className={unit === "pi" ? "active" : ""} onClick={() => setUnit("pi")}>π</button>
        </div>
      </header>

      <nav className="mode-switch" aria-label="Режим атласа">
        {modes.map((item) => (
          <button key={item.id} aria-pressed={mode === item.id} className={mode === item.id ? "active" : ""} onClick={() => setMode(item.id)}>{item.label}</button>
        ))}
      </nav>

      <div className="workspace">
        {mode === "graph" && <MiniGraph angle={angle} kind={graphKind} unit={unit} onKindChange={setGraphKind} />}
        <UnitCircle angle={angle} unit={unit} mode={mode} onAngleChange={setAngle} />
        {mode === "learn" && <LearningNote angle={angle} />}
      </div>

      <section className="values" aria-label="Значения функций">
        <ValueCard fn="sin" angle={angle} onSelect={() => selectGraph("waves")} />
        <ValueCard fn="cos" angle={angle} onSelect={() => selectGraph("waves")} />
        <ValueCard fn="tan" angle={angle} onSelect={() => selectGraph("tan")} />
        <ValueCard fn="ctg" angle={angle} />
      </section>

      <footer>Проведите по окружности, чтобы изменить угол</footer>
    </main>
  );
}
