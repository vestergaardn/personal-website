"use client";

import { useId } from "react";

type AquaRadioOption<T extends string> = {
  value: T;
  label: string;
};

type AquaRadioGroupProps<T extends string> = {
  name?: string;
  value: T;
  onChange: (value: T) => void;
  options: AquaRadioOption<T>[];
  /** Diameter of the orb in pixels. Defaults to 22. */
  size?: number;
};

export function AquaRadioGroup<T extends string>({
  name,
  value,
  onChange,
  options,
  size = 22,
}: AquaRadioGroupProps<T>) {
  const generatedName = useId();
  const groupName = name ?? generatedName;

  return (
    <div className="aqua-radio-group" role="radiogroup">
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <label key={option.value} className="aqua-radio">
            <input
              type="radio"
              name={groupName}
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
              className="aqua-radio-input"
            />
            <AquaOrb size={size} active={checked} />
            <span className="aqua-radio-label">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}

type AquaOrbProps = {
  size?: number;
  active?: boolean;
};

/**
 * Glassy Aqua-style orb. Recreates Figma node 351:139 from the
 * "Artwork challenge" file. Coordinates are expressed in the natural
 * 12-unit Figma viewBox so the orb scales cleanly at any pixel size.
 */
export function AquaOrb({ size = 22, active = true }: AquaOrbProps) {
  return (
    <span
      className="aqua-orb"
      style={{ width: size, height: size, fontSize: size }}
      aria-hidden
    >
      <svg
        viewBox="0 0 12 12"
        className="aqua-orb-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="aqua-base-gradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0" stopColor="#8dcaff" stopOpacity="1" />
            <stop offset="1" stopColor="#8dcaff" stopOpacity="0.7" />
          </linearGradient>
          <clipPath id="aqua-orb-clip">
            <circle cx="6" cy="6" r="6" />
          </clipPath>
        </defs>

        <g clipPath="url(#aqua-orb-clip)">
          <circle cx="6" cy="6" r="6" fill="url(#aqua-base-gradient)" />

          {/* Top Shadow */}
          <image
            href="/aqua-orb/top-shadow.svg"
            x="-3.980"
            y="-4.580"
            width="31.527"
            height="28.211"
          />

          {/* Inner Glow (cyan), rotated 180° around wrapper center */}
          <g transform="translate(4.305 10.890) rotate(180)">
            <image
              href="/aqua-orb/inner-glow.svg"
              x="-18.515"
              y="-19.600"
              width="37.030"
              height="39.201"
            />
          </g>

          {/* Right Shadow 1 */}
          <g transform="translate(9.669 13.652) scale(1 -1) rotate(-133.36)">
            <image
              href="/aqua-orb/right-shadow.svg"
              x="-11.964"
              y="-14.404"
              width="23.928"
              height="28.808"
            />
          </g>

          {/* Right Shadow 2 */}
          <g transform="translate(9.749 13.737) scale(1 -1) rotate(-136.09)">
            <image
              href="/aqua-orb/right-shadow-1.svg"
              x="-11.964"
              y="-14.404"
              width="23.928"
              height="28.808"
            />
          </g>

          {/* Left Shadow */}
          <g transform="translate(2.467 15.110) rotate(-37.3)">
            <image
              href="/aqua-orb/left-shadow.svg"
              x="-11.964"
              y="-14.404"
              width="23.928"
              height="28.808"
            />
          </g>
        </g>

        {/* 0.5px border */}
        <circle
          cx="6"
          cy="6"
          r="5.75"
          fill="none"
          stroke="#193eca"
          strokeWidth="0.5"
        />
      </svg>

      {/* Inset cyan glow stack — sibling so it overlays the SVG */}
      <span className="aqua-orb-glow" aria-hidden />

      {/* Top gloss highlight (Vector) + center dot (Ellipse 1) */}
      <svg
        viewBox="0 0 12 12"
        className="aqua-orb-svg aqua-orb-top"
        xmlns="http://www.w3.org/2000/svg"
      >
        <image
          href="/aqua-orb/vector.svg"
          x="1.169"
          y="0.033"
          width="9.663"
          height="5.559"
        />
        {active && <circle cx="6" cy="6" r="1.7145" fill="black" />}
      </svg>
    </span>
  );
}
