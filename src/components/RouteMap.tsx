import React from "react";
// @ts-ignore
import countries110m from "world-atlas/countries-110m.json";
import { feature } from "topojson-client";
import { geoGraticule10, geoMercator, geoPath } from "d3-geo";

const TOPO = countries110m as any;
const LAND = feature(TOPO, TOPO.objects.countries) as any;
const W = 260;
const H = 160;
const PROJECT = geoMercator().center([12, 51]).scale(280).translate([W / 2, H / 2]);
const PATH = geoPath(PROJECT);
const GRATICULE = geoGraticule10();

const EU = new Set([
  "Czechia", "Germany", "France", "Netherlands", "Austria", "Poland", "Slovakia",
  "Belgium", "Luxembourg", "Denmark", "Italy", "Spain", "Sweden", "Finland",
  "Estonia", "Latvia", "Lithuania", "Ireland", "Portugal", "Slovenia", "Croatia",
  "Hungary", "Romania", "Bulgaria", "Greece", "Cyprus", "Malta",
]);

const NODES: { ll: [number, number]; fill: string; ring?: boolean }[] = [
  { ll: [2.3522, 48.8566], fill: "#87959b" },
  { ll: [8.6821, 50.1109], fill: "#b8f6dd", ring: true },
  { ll: [14.4378, 50.0755], fill: "#f3f6f5" },
];

const project = (ll: [number, number]) => PROJECT(ll) as [number, number] | null;
const arc = (a: [number, number], b: [number, number]) => {
  const p1 = project(a);
  const p2 = project(b);
  if (!p1 || !p2) return "";
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const cx = (x1 + x2) / 2 - (dy / len) * len * 0.18;
  const cy = (y1 + y2) / 2 + (dx / len) * len * 0.18;
  return `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
};

export const RouteMap: React.FC<{ className?: string }> = ({ className = "" }) => {
  const client = project(NODES[0].ll);
  const edge = project(NODES[1].ll);
  const prague = project(NODES[2].ll);
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="GeoJSON map of the illustrative inference route from a client through an EU edge to the Prague bare-metal host"
    >
      <rect width={W} height={H} fill="#05070b" />
      <path d={PATH(GRATICULE) || ""} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={0.4} />
      {LAND.features.map((f: any, i: number) => (
        <path
          key={`c_${i}`}
          d={PATH(f) || ""}
          fill={EU.has(f.properties?.name) ? "rgba(184,246,221,0.12)" : "rgba(255,255,255,0.025)"}
          stroke="rgba(255,255,255,0.16)"
          strokeWidth={0.4}
        />
      ))}
      {client && edge && (
        <path d={arc(NODES[0].ll, NODES[1].ll)} fill="none" stroke="rgba(184,246,221,0.3)" strokeWidth={0.8} strokeDasharray="2 3" />
      )}
      {edge && prague && (
        <path d={arc(NODES[1].ll, NODES[2].ll)} fill="none" stroke="rgba(184,246,221,0.7)" strokeWidth={0.9} />
      )}
      {client && <circle cx={client[0]} cy={client[1]} r={2.2} fill="#05070b" stroke="#87959b" strokeWidth={0.8} />}
      {edge && <circle cx={edge[0]} cy={edge[1]} r={2.8} fill="#05070b" stroke="#b8f6dd" strokeWidth={0.9} />}
      {prague && <circle cx={prague[0]} cy={prague[1]} r={12} fill="rgba(184,246,221,0.06)" stroke="rgba(184,246,221,0.2)" strokeWidth={0.5} />}
      {prague && <circle cx={prague[0]} cy={prague[1]} r={3.2} fill="#b8f6dd" />}
    </svg>
  );
};
