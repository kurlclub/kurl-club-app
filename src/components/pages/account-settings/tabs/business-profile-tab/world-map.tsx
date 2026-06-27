'use client';

import { useMemo } from 'react';

import { geoNaturalEarth1, geoPath } from 'd3-geo';
import type { FeatureCollection } from 'geojson';
import { feature } from 'topojson-client';
import worldAtlas from 'world-atlas/countries-110m.json';

const VIEWBOX_WIDTH = 632;
const VIEWBOX_HEIGHT = 417;
const ANTARCTICA_NUMERIC_CODE = '10';

// Brand colors (raw hex is fine for an SVG visualization).
const BASE_FILL = '#474a51'; // muted gray landmass
const BASE_STROKE = '#23262c'; // dark ocean-toned borders
const SELECTED_FILL = '#d3f702'; // primary-green-500
const SELECTED_STROKE = '#e7ff87';

type CountryPath = {
  numericCode: string;
  path: string;
  centroidX: number;
  centroidY: number;
  bboxCenterX: number;
  bboxCenterY: number;
  bboxWidth: number;
  bboxHeight: number;
};

type Camera = { scale: number; translateX: number; translateY: number };

const WORLD_CAMERA: Camera = { scale: 1, translateX: 0, translateY: 0 };

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const normalizeNumericCountryCode = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  const parsed = Number.parseInt(String(value), 10);
  if (Number.isNaN(parsed)) return null;
  return String(parsed);
};

/**
 * Projects the world-atlas TopoJSON into screen-space SVG paths once at module
 * load. Mirrors the mobile `buildCountryPaths`: natural-earth projection fitted
 * to the viewbox, with per-country centroid + bbox for camera framing.
 */
const buildCountryPaths = (): CountryPath[] => {
  const atlas = worldAtlas as unknown as {
    objects: { countries: unknown };
  };

  const collection = feature(
    atlas as never,
    atlas.objects.countries as never
  ) as unknown as FeatureCollection;

  const features = collection.features.filter((f) => {
    const code = normalizeNumericCountryCode(f.id);
    return Boolean(code) && code !== ANTARCTICA_NUMERIC_CODE;
  });

  const projection = geoNaturalEarth1().fitExtent(
    [
      [0, 0],
      [VIEWBOX_WIDTH, VIEWBOX_HEIGHT],
    ],
    { type: 'FeatureCollection', features } as never
  );

  const pathGen = geoPath(projection);

  return features
    .map((f): CountryPath | null => {
      const numericCode = normalizeNumericCountryCode(f.id);
      const path = pathGen(f as never);
      const centroid = pathGen.centroid(f as never);
      const bounds = pathGen.bounds(f as never);

      if (!numericCode || !path) return null;
      if (!Number.isFinite(centroid[0]) || !Number.isFinite(centroid[1]))
        return null;

      const [[bx0, by0], [bx1, by1]] = bounds;
      if (![bx0, by0, bx1, by1].every(Number.isFinite)) return null;

      return {
        numericCode,
        path,
        centroidX: centroid[0],
        centroidY: centroid[1],
        bboxCenterX: (bx0 + bx1) / 2,
        bboxCenterY: (by0 + by1) / 2,
        bboxWidth: bx1 - bx0,
        bboxHeight: by1 - by0,
      };
    })
    .filter((c): c is CountryPath => Boolean(c));
};

const WORLD_COUNTRY_PATHS = buildCountryPaths();

/**
 * Frames the selected country so its centroid sits at a target anchor (as a
 * fraction of the viewbox) with a gentle zoom. No coverage clamp is needed: the
 * map is gray country shapes on a uniform dark background, so panning a country
 * to the anchor only ever reveals more of that same dark backdrop (it reads as
 * ocean), letting any country — even far-western ones — frame on the right.
 */
const computeCamera = (
  country: CountryPath | null,
  framePadding: number,
  maxZoom: number,
  anchorXFrac = 0.5,
  anchorYFrac = 0.5
): Camera => {
  if (!country) return WORLD_CAMERA;

  const safeWidth = Math.max(country.bboxWidth, 1);
  const safeHeight = Math.max(country.bboxHeight, 1);
  const fitScale = Math.min(
    VIEWBOX_WIDTH / safeWidth,
    VIEWBOX_HEIGHT / safeHeight
  );
  const scale = clamp(fitScale * framePadding, 1.4, maxZoom);

  return {
    scale,
    translateX: anchorXFrac * VIEWBOX_WIDTH - scale * country.centroidX,
    translateY: anchorYFrac * VIEWBOX_HEIGHT - scale * country.centroidY,
  };
};

interface WorldMapProps {
  selectedCcn3?: string | null;
  /** How tightly the camera frames the selected country (lower = more breathing room). */
  framePadding?: number;
  /** Clamp for how far the camera zooms into a country. */
  maxZoom?: number;
  /** When false the camera stays at the full-world view and only highlights the country. */
  frameSelected?: boolean;
  /** Horizontal anchor (0–1) where the framed country sits — 0.5 centers it, 0.7 pushes it right. */
  anchorX?: number;
  /** Vertical anchor (0–1) where the framed country sits. */
  anchorY?: number;
}

/**
 * Animated world map that frames and highlights the selected country. Web port
 * of the mobile `WorldMap`: the camera `<g>` (translate + scale) animates via a
 * CSS transition, the highlight fades in on change, and a pin + radar ping mark
 * the country centroid.
 */
export default function WorldMap({
  selectedCcn3,
  framePadding = 0.4,
  maxZoom = 2.2,
  frameSelected = true,
  anchorX = 0.5,
  anchorY = 0.5,
}: WorldMapProps) {
  const selectedCode = useMemo(
    () => normalizeNumericCountryCode(selectedCcn3),
    [selectedCcn3]
  );

  const selectedCountry = useMemo(
    () =>
      WORLD_COUNTRY_PATHS.find((c) => c.numericCode === selectedCode) ?? null,
    [selectedCode]
  );

  const camera = useMemo(
    () =>
      frameSelected
        ? computeCamera(
            selectedCountry,
            framePadding,
            maxZoom,
            anchorX,
            anchorY
          )
        : WORLD_CAMERA,
    [selectedCountry, framePadding, maxZoom, frameSelected, anchorX, anchorY]
  );

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden="true"
    >
      {/* Camera: translate + scale, animated via CSS transition. */}
      <g
        style={{
          transform: `translate(${camera.translateX}px, ${camera.translateY}px) scale(${camera.scale})`,
          transition: 'transform 900ms cubic-bezier(0.65, 0, 0.35, 1)',
        }}
      >
        {WORLD_COUNTRY_PATHS.map((country) => (
          <path
            key={country.numericCode}
            d={country.path}
            fill={BASE_FILL}
            stroke={BASE_STROKE}
            strokeWidth={0.7}
          />
        ))}

        {selectedCountry && (
          <path
            // Remount on change so the fade-in replays.
            key={selectedCountry.numericCode}
            d={selectedCountry.path}
            fill={SELECTED_FILL}
            stroke={SELECTED_STROKE}
            strokeWidth={1.1 / camera.scale}
            strokeLinejoin="round"
            className="animate-in fade-in duration-500"
          />
        )}
      </g>
    </svg>
  );
}
