"use client";

import { useId, useState } from "react";

type AquaRadioProps = {
  /** Controlled state. Omit to use uncontrolled mode with `defaultChecked`. */
  checked?: boolean;
  /** Initial state for uncontrolled mode. Ignored if `checked` is provided. */
  defaultChecked?: boolean;
  /** Fired whenever the checked state changes (controlled or uncontrolled). */
  onChange?: (checked: boolean) => void;
  /** Diameter of the orb in pixels. Defaults to the real radio size, 18px. */
  size?: number;
  /** Disables interaction and dims the orb slightly. */
  disabled?: boolean;
  /** Optional accessible label. */
  "aria-label"?: string;
  /** Optional aria-labelledby reference (e.g. an associated <label> id). */
  "aria-labelledby"?: string;
};

/**
 * Single Aqua-style radio button that can be checked and unchecked.
 *
 * Usage (uncontrolled):
 *   <AquaRadio defaultChecked onChange={(c) => console.log(c)} />
 *
 * Usage (controlled):
 *   const [on, setOn] = useState(false);
 *   <AquaRadio checked={on} onChange={setOn} />
 */
export function AquaRadio({
  checked,
  defaultChecked = false,
  onChange,
  size = 18,
  disabled = false,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: AquaRadioProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const active = isControlled ? checked : internalChecked;

  const handleToggle = () => {
    if (disabled) return;
    if (!isControlled) setInternalChecked((v) => !v);
    onChange?.(!active);
  };

  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={handleToggle}
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "inline-block",
        lineHeight: 0,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <AquaOrb size={size} active={active} />
    </button>
  );
}

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
  /**
   * How the darker shading on the sides is created.
   * - `rotated`: the original Figma side-shadow shapes, rotated ±15° around the
   *   orb center so the darks sit just below the top corners (closer to the
   *   sides without spilling into the bottom).
   * - `gradient`: replaces the side-shadow shapes with a horizontal 3-stop
   *   linear gradient — dark at left and right edges, transparent in the
   *   middle. No blurred shapes, no rotation maths.
   */
  sideShading?: "rotated" | "gradient";
  /** Debug flags — set true to keep a layer, false to omit it. Defaults true. */
  showBase?: boolean;
  showTopShadow?: boolean;
  showInnerGlow?: boolean;
  showSideShadows?: boolean;
  showGloss?: boolean;
};

/**
 * Glassy Aqua-style orb. Recreates Figma node 351:139 from the
 * "Artwork challenge" file. Coordinates are expressed in the natural
 * 12-unit Figma viewBox so the orb scales cleanly at any pixel size.
 */
export function AquaOrb({
  size = 22,
  active = true,
  sideShading = "rotated",
  showBase = true,
  showTopShadow = true,
  showInnerGlow = true,
  showSideShadows = true,
  showGloss = true,
}: AquaOrbProps) {
  const shadow = `drop-shadow(0 max(1px, ${0.86 / 12}em) max(0.5px, ${0.12 / 12}em) rgba(0,0,0,0.3))`;
  const filter = active
    ? shadow
    : `grayscale(1) brightness(1.45) ${shadow}`;
  return (
    <span
      className={`aqua-orb${active ? "" : " aqua-orb--unchecked"}`}
      style={{
        width: size,
        height: size,
        fontSize: size,
        filter,
      }}
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
            <stop offset="1" stopColor="#8dcaff" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient
            id="aqua-side-gradient"
            x1="0"
            y1="0"
            x2="1"
            y2="0"
          >
            <stop offset="0" stopColor="#003A6D" stopOpacity="0.55" />
            <stop offset="0.35" stopColor="#003A6D" stopOpacity="0" />
            <stop offset="0.65" stopColor="#003A6D" stopOpacity="0" />
            <stop offset="1" stopColor="#003A6D" stopOpacity="0.55" />
          </linearGradient>
          {/* Mask that keeps the side-shadows visible in the upper-side region
              of the orb but fades them to transparent before they reach the
              bottom — so the blur of the side-shadow shapes can't darken the
              bottom of the orb. */}
          <linearGradient
            id="aqua-side-mask-gradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.45" stopColor="#ffffff" />
            <stop offset="0.7" stopColor="#000000" />
            <stop offset="1" stopColor="#000000" />
          </linearGradient>
          <mask
            id="aqua-side-mask"
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="12"
            height="12"
          >
            <rect
              x="0"
              y="0"
              width="12"
              height="12"
              fill="url(#aqua-side-mask-gradient)"
            />
          </mask>
          <clipPath id="aqua-orb-clip">
            <circle cx="6" cy="6" r="6" />
          </clipPath>
          {/* Gradient stroke around the orb perimeter. */}
          <linearGradient
            id="aqua-stroke-gradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0" stopColor="#193ECA" />
            <stop offset="1" stopColor="#6A6A6A" />
          </linearGradient>
        </defs>

        <g clipPath="url(#aqua-orb-clip)">
          {showBase && (
            <circle cx="6" cy="6" r="6" fill="url(#aqua-base-gradient)" />
          )}

          {/* Top Shadow — centered horizontally */}
          {showTopShadow && (
            <image
              href="/aqua-orb/top-shadow.svg"
              x="-9.764"
              y="-4.580"
              width="31.527"
              height="28.211"
            />
          )}

          {/* Inner Glow (cyan) — natural orientation; wide cyan band lands
              at the orb bottom to create a bright crescent reflection. */}
          {showInnerGlow && (
            <g transform="translate(6 10.890)">
              <image
                href="/aqua-orb/inner-glow.svg"
                x="-18.515"
                y="-19.600"
                width="37.030"
                height="39.201"
              />
            </g>
          )}

          {/* Uniform cyan saturation overlay — same color across the whole
              orb so there's no spatial contrast that could read as a ring. */}
          {showBase && (
            <circle cx="6" cy="6" r="6" fill="#0a82d6" fillOpacity="0.4" />
          )}

          {showSideShadows && sideShading === "rotated" && (
            <g mask="url(#aqua-side-mask)">
              {/* Right Shadow — rotated ±15° so it sits just under the top corner */}
              <g transform="rotate(15 6 6)">
                <g transform="translate(9.669 13.652) scale(1 -1) rotate(-133.36)">
                  <image
                    href="/aqua-orb/right-shadow.svg"
                    x="-11.964"
                    y="-14.404"
                    width="23.928"
                    height="28.808"
                  />
                </g>
              </g>
              {/* Left Shadow — mirror of right across orb's vertical axis */}
              <g transform="rotate(-15 6 6)">
                <g transform="translate(2.331 13.652) scale(-1 -1) rotate(-133.36)">
                  <image
                    href="/aqua-orb/right-shadow.svg"
                    x="-11.964"
                    y="-14.404"
                    width="23.928"
                    height="28.808"
                  />
                </g>
              </g>
            </g>
          )}

          {showSideShadows && sideShading === "gradient" && (
            <rect
              x="0"
              y="0"
              width="12"
              height="12"
              fill="url(#aqua-side-gradient)"
            />
          )}
        </g>

        {/* Gradient stroke around the orb perimeter — drawn on top and outside
            the clipPath so the full stroke shows. */}
        <circle
          cx="6"
          cy="6"
          r="5.85"
          fill="none"
          stroke="url(#aqua-stroke-gradient)"
          strokeWidth="0.3"
        />
      </svg>

      {/* Top gloss highlight (Vector) + center dot (Ellipse 1) */}
      <svg
        viewBox="0 0 12 12"
        className="aqua-orb-svg aqua-orb-top"
        xmlns="http://www.w3.org/2000/svg"
      >
        {showGloss && (
          <image
            href="/aqua-orb/vector.svg"
            x="1.169"
            y="0.033"
            width="9.663"
            height="5.559"
            opacity={active ? 1 : 0.55}
          />
        )}
        {active && <circle cx="6" cy="6" r="1.7145" fill="black" />}
      </svg>
    </span>
  );
}
