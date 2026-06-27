'use client';

import WorldMap from './world-map';

interface RegionMapProps {
  selectedCcn3?: string | null;
}

/**
 * Full-bleed world-map backdrop for the regional-settings card. The map fills
 * the whole card (clipped to its rounded corners by the parent) with the
 * selected country highlighted in place on the full world. A left-to-right
 * scrim keeps the overlaid form legible, and a soft glow sits behind the
 * highlighted region.
 */
export default function RegionMap({ selectedCcn3 }: RegionMapProps) {
  return (
    <div className="relative hidden h-full w-full bg-secondary-blue-700 xl:block">
      <div className="absolute inset-0">
        {/* Pan/zoom to frame the selected country on the right side. */}
        <WorldMap
          selectedCcn3={selectedCcn3}
          anchorX={0.7}
          framePadding={0.5}
          maxZoom={2}
        />
      </div>

      {/* Left scrim so the overlaid form stays readable over the map. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to right, rgba(40, 43, 50, 0.96) 0%, rgba(40, 43, 50, 0.8) 32%, rgba(40, 43, 50, 0.28) 60%, transparent 80%)',
        }}
      />

      {/* Subtle overall veil for contrast parity. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-secondary-blue-700/15"
      />
    </div>
  );
}
