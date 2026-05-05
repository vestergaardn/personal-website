# Smooth Time-of-Day Sky Gradient — Implementation Guide

A continuous, real-time-synced background that smoothly animates through a six-stage day cycle (Night, First light, Sunrise, Soft haze, Early day, Open sky), with non-uniform timing tuned to keep Night and afternoon Soft haze stable for long stretches. Uses CSS-native color interpolation with no per-frame JavaScript work.

---

## 1. Goal

Produce a single full-bleed gradient background (5 vertical color stops) that:

1. Smoothly transitions through 13 keyframes per day at non-uniform intervals — Night holds from midnight to 04:30, Soft haze holds from 15:30 to 17:00, and the morning and evening transitions are tuned to feel naturalistic.
2. Stays in sync with the real local time of day, so at 06:30 the user sees the Sunrise keyframe; at noon they see Open sky; at 20:30 they see the sunset (reused Sunrise) keyframe; etc.
3. Looks coherent at every intermediate moment — no muddy "two gradients overlaid" frames.
4. Costs effectively zero JS/CPU once started (no per-frame work).
5. Respects `prefers-reduced-motion`.
6. Pauses while the tab is hidden, and resyncs to wall-clock time when it becomes visible again.

---

## 2. Core technique

CSS `transition` and `animation` cannot interpolate `linear-gradient(...)` values directly — `background-image` is a discrete property, so naive transitions just snap.

The trick: register custom properties as `<color>` (and optionally `<percentage>`) types using `@property`. Once registered, CSS *can* interpolate them. Build the gradient as `linear-gradient(var(--c1), var(--c2), ...)`, then animate the variables. Every intermediate frame is a real, valid gradient — not two overlaid bitmaps.

A daily cycle is then a `@keyframes` rule with non-uniform timing — long stretches where the sky should look static (Night, afternoon Soft haze) get two adjacent keyframes with identical colors (a "hold"), while transitions get tightly spaced keyframes. The whole thing runs as an infinite animation with a 24-hour duration. Real-time sync is achieved with a negative `animation-delay` equal to the elapsed seconds since midnight.

This is preferred over JS `requestAnimationFrame` interpolation because:
- Browser handles timing on the compositor — no JS work per frame.
- Keeps running correctly across system sleep / clock changes (within a daily cycle).
- Trivially extends to more keyframes (24, 48, 96) without code changes.

---

## 3. Browser support

Required APIs:
- `@property` rule with `<color>` syntax — Chromium 85+, Safari 16.4+, Firefox 128+.
- Animation of registered custom properties — same support matrix.
- Web Animations API (only if you implement scrubbing) — universal.

Coverage as of mid-2025 is roughly 95% of global traffic. For older browsers, the animation will simply not interpolate (colors will snap between keyframes); the page remains functional. If a graceful fallback is required, see §10.

---

## 4. Implementation steps

### Step 4.1 — Register the color custom properties

These declarations live at the top level of a stylesheet (not inside a selector). They tell the CSS engine "these variables are colors and should be interpolated as colors." Without `@property` registration, the variables would be treated as opaque strings and would snap.

```css
@property --sky-1 { syntax: '<color>'; inherits: false; initial-value: #222222; }
@property --sky-2 { syntax: '<color>'; inherits: false; initial-value: #222222; }
@property --sky-3 { syntax: '<color>'; inherits: false; initial-value: #222222; }
@property --sky-4 { syntax: '<color>'; inherits: false; initial-value: #222222; }
@property --sky-5 { syntax: '<color>'; inherits: false; initial-value: #222222; }
```

Notes:
- `inherits: false` is recommended for performance — the variable is read on a single element.
- `initial-value` is required and must match the syntax. Use the Night keyframe colors (`#222222`) so the page renders sensibly before any JS runs.
- Five stops is a balance between expressiveness and simplicity. You can use 3 (top/mid/bottom) for simpler skies or 7+ for more nuance.

### Step 4.2 — Apply the gradient to the sky element

```css
.sky {
  background: linear-gradient(
    to bottom,
    var(--sky-1) 0%,
    var(--sky-2) 40%,
    var(--sky-3) 70%,
    var(--sky-4) 85%,
    var(--sky-5) 100%
  );
}
```

The stop positions (`0%`, `40%`, `70%`, `85%`, `100%`) are tuned to match the structure of the named sky stages: most of the vertical space is the upper sky (handled by stops 1 and 2), the mid-sky transition sits at 70%, and the "horizon band" — where the most dramatic sunrise/sunset color lives — is concentrated between 85% and 100%. These positions are fixed across all keyframes; only the *colors* at each stop change over the day. Adjust to taste, or animate the positions too (see §7.2).

### Step 4.3 — Define the day cycle

The cycle uses **six unique sky stages** — Night, First light, Sunrise, Soft haze, Early day, Open sky — placed at 13 keyframes with non-uniform spacing across the 24-hour day. Three of the stages appear twice (First light, Sunrise, Soft haze on both the morning and evening sides). Open sky appears once at midday; Night appears at the start, end, and as a held block through the deep night.

**Two stages "hold" with duplicate keyframes.** To make Night look stable from midnight until 04:30, two consecutive keyframes (`0%` and `18.75%`) carry identical Night colors — interpolation between two equal colors produces no visible change. The same technique holds afternoon Soft haze stable from 15:30 to 17:00.

| Time   | % of day  | Sky stage       | Notes |
|--------|-----------|-----------------|-------|
| 00:00  | 0%        | Night           | Start of cycle |
| 04:30  | 18.75%    | Night (hold)    | Same colors as 00:00 — Night holds for the first 4.5 hours |
| 05:30  | 22.92%    | First light     | Morning twilight, sky lightening |
| 06:30  | 27.08%    | Sunrise         | Sunrise peak — golden glow phase |
| 08:00  | 33.33%    | Soft haze       | Morning haze, warm tones softening |
| 10:00  | 41.67%    | Early day       | Cool blue, no warm tones |
| 12:00  | 50%       | Open sky        | Midday peak brightness |
| 14:00  | 58.33%    | Early day       | Mirror of morning |
| 15:30  | 64.58%    | Soft haze       | Afternoon haze peak |
| 17:00  | 70.83%    | Soft haze (hold)| Same colors as 15:30 — Soft haze holds through late afternoon |
| 20:30  | 85.42%    | Sunrise         | Sunset peak — same gradient as morning Sunrise |
| 22:00  | 91.67%    | First light     | Evening twilight |
| 23:30  | 97.92%    | Night           | Returning to night for the loop point |
| 24:00  | 100%      | Night           | Loop point, identical to 00:00 |

The Sunrise, First light, Soft haze, and Early day gradients are **intentionally reused** in the evening. Sunset uses the same gradient as sunrise (a warm horizon band on a cool slate sky reads as either, given the right time-of-day context). The full color palette is in §6.

```css
@keyframes sky-day-cycle {
  /* Night, 00:00 — start of cycle */
  0%      { --sky-1: #222222; --sky-2: #222222; --sky-3: #222222; --sky-4: #222222; --sky-5: #222222; }
  /* Night, 04:30 — hold (same colors) */
  18.75%  { --sky-1: #222222; --sky-2: #222222; --sky-3: #222222; --sky-4: #222222; --sky-5: #222222; }
  /* First light, 05:30 */
  22.92%  { --sky-1: #011D2D; --sky-2: #062335; --sky-3: #15364C; --sky-4: #1D3F58; --sky-5: #21445E; }
  /* Sunrise, 06:30 */
  27.08%  { --sky-1: #50708B; --sky-2: #778699; --sky-3: #D19C45; --sky-4: #FFA71B; --sky-5: #FF7816; }
  /* Soft haze, 08:00 */
  33.33%  { --sky-1: #50708B; --sky-2: #778699; --sky-3: #B39379; --sky-4: #D29A69; --sky-5: #D29A69; }
  /* Early day, 10:00 */
  41.67%  { --sky-1: #476C98; --sky-2: #4D77A4; --sky-3: #568BB8; --sky-4: #5A92BF; --sky-5: #5A92BF; }
  /* Open sky, 12:00 */
  50%     { --sky-1: #3772C7; --sky-2: #3E87D8; --sky-3: #4BAAF4; --sky-4: #50B7FF; --sky-5: #50B7FF; }
  /* Early day, 14:00 */
  58.33%  { --sky-1: #476C98; --sky-2: #4D77A4; --sky-3: #568BB8; --sky-4: #5A92BF; --sky-5: #5A92BF; }
  /* Soft haze, 15:30 — peak */
  64.58%  { --sky-1: #50708B; --sky-2: #778699; --sky-3: #B39379; --sky-4: #D29A69; --sky-5: #D29A69; }
  /* Soft haze, 17:00 — hold (same colors) */
  70.83%  { --sky-1: #50708B; --sky-2: #778699; --sky-3: #B39379; --sky-4: #D29A69; --sky-5: #D29A69; }
  /* Sunrise / sunset, 20:30 */
  85.42%  { --sky-1: #50708B; --sky-2: #778699; --sky-3: #D19C45; --sky-4: #FFA71B; --sky-5: #FF7816; }
  /* First light, 22:00 — evening twilight */
  91.67%  { --sky-1: #011D2D; --sky-2: #062335; --sky-3: #15364C; --sky-4: #1D3F58; --sky-5: #21445E; }
  /* Night, 23:30 — returning to loop point */
  97.92%  { --sky-1: #222222; --sky-2: #222222; --sky-3: #222222; --sky-4: #222222; --sky-5: #222222; }
  /* Night, 24:00 — loop point, identical to 0% */
  100%    { --sky-1: #222222; --sky-2: #222222; --sky-3: #222222; --sky-4: #222222; --sky-5: #222222; }
}
```

Critical: the `0%` and `100%` keyframes must be identical, otherwise the animation will jump at midnight. (Here both are explicit Night for clarity, since several intermediate keyframes also carry Night colors.)

> **Why these specific times?** The schedule reflects perceptual weight rather than even spacing. Night is held flat until 04:30 because that's when sleep is happening and a slow drift toward morning would feel wrong. The 17:00 Soft haze hold reflects that late afternoon is visually quite stable in real life — the sky doesn't really start "turning toward sunset" until well after solar elevation begins dropping. Sunset peaks at 20:30 to suit a long-summer-day feel; in winter or at lower latitudes, you'd shift it earlier. See §7.1 for tuning notes.

### Step 4.4 — Apply the animation with a 24-hour duration

```css
.sky {
  animation: sky-day-cycle 86400s linear infinite;
}
```

`86400s` is exactly 24 hours. `linear` is correct here because the keyframe positions themselves encode the timeline — the browser interpolates each variable continuously between adjacent keyframes.

### Step 4.5 — Sync to real local time of day

A fresh page load would otherwise start the animation at 0% (midnight). To start it at the user's actual time of day, set a negative `animation-delay` equal to the elapsed seconds since local midnight.

```js
function syncSkyToTimeOfDay(el) {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const secondsSinceMidnight = (now - midnight) / 1000;
  el.style.animationDelay = `-${secondsSinceMidnight}s`;
}

document.querySelectorAll('.sky').forEach(syncSkyToTimeOfDay);
```

A negative delay shifts the animation forward in time — the browser treats it as already having been running for that long. Once set, the browser keeps accurate time on its own; no further JS is needed during normal playback.

### Step 4.6 — Pause and resync when the tab is hidden

While `document.hidden` is true, the animation should pause to save battery, but on visibility return it must resync to wall-clock time (otherwise it will be behind by however long the tab was hidden).

```js
document.addEventListener('visibilitychange', () => {
  document.querySelectorAll('.sky').forEach(el => {
    if (document.hidden) {
      el.style.animationPlayState = 'paused';
    } else {
      syncSkyToTimeOfDay(el); // re-set the negative delay
      el.style.animationPlayState = 'running';
    }
  });
});
```

### Step 4.7 — Handle `prefers-reduced-motion`

For users who have requested reduced motion, do not animate continuously. Instead, set the gradient to the colors appropriate for the current time and refresh every few minutes.

```css
@media (prefers-reduced-motion: reduce) {
  .sky {
    animation: none;
  }
}
```

```js
function setStaticSkyColors(el) {
  // Find the nearest keyframe by time (works for any spacing, uniform or not).
  const now = new Date();
  const minutesOfDay = now.getHours() * 60 + now.getMinutes();
  const nearest = SKY_KEYFRAMES.reduce((best, kf) =>
    Math.abs(kf.time - minutesOfDay) < Math.abs(best.time - minutesOfDay) ? kf : best
  );
  Object.entries(nearest.colors).forEach(([k, v]) => el.style.setProperty(k, v));
}

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.sky').forEach(setStaticSkyColors);
  setInterval(() => {
    document.querySelectorAll('.sky').forEach(setStaticSkyColors);
  }, 5 * 60 * 1000); // refresh every 5 minutes
}
```

`SKY_KEYFRAMES` is a JS-side mirror of the CSS keyframe colors with `time` (minutes of day) and `colors` fields — see the reference implementation in §5. Looking up by time (not by index) is important because the keyframes are non-uniformly spaced.

---

## 5. Complete reference implementation

A drop-in version combining all of the above. Place the `<style>` in your stylesheet or document head; the script can be a module or inline at the end of body.

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
  @property --sky-1 { syntax: '<color>'; inherits: false; initial-value: #222222; }
  @property --sky-2 { syntax: '<color>'; inherits: false; initial-value: #222222; }
  @property --sky-3 { syntax: '<color>'; inherits: false; initial-value: #222222; }
  @property --sky-4 { syntax: '<color>'; inherits: false; initial-value: #222222; }
  @property --sky-5 { syntax: '<color>'; inherits: false; initial-value: #222222; }

  @keyframes sky-day-cycle {
    0%      { --sky-1: #222222; --sky-2: #222222; --sky-3: #222222; --sky-4: #222222; --sky-5: #222222; } /* Night, 00:00 */
    18.75%  { --sky-1: #222222; --sky-2: #222222; --sky-3: #222222; --sky-4: #222222; --sky-5: #222222; } /* Night, 04:30 (hold) */
    22.92%  { --sky-1: #011D2D; --sky-2: #062335; --sky-3: #15364C; --sky-4: #1D3F58; --sky-5: #21445E; } /* First light, 05:30 */
    27.08%  { --sky-1: #50708B; --sky-2: #778699; --sky-3: #D19C45; --sky-4: #FFA71B; --sky-5: #FF7816; } /* Sunrise, 06:30 */
    33.33%  { --sky-1: #50708B; --sky-2: #778699; --sky-3: #B39379; --sky-4: #D29A69; --sky-5: #D29A69; } /* Soft haze, 08:00 */
    41.67%  { --sky-1: #476C98; --sky-2: #4D77A4; --sky-3: #568BB8; --sky-4: #5A92BF; --sky-5: #5A92BF; } /* Early day, 10:00 */
    50%     { --sky-1: #3772C7; --sky-2: #3E87D8; --sky-3: #4BAAF4; --sky-4: #50B7FF; --sky-5: #50B7FF; } /* Open sky, 12:00 */
    58.33%  { --sky-1: #476C98; --sky-2: #4D77A4; --sky-3: #568BB8; --sky-4: #5A92BF; --sky-5: #5A92BF; } /* Early day, 14:00 */
    64.58%  { --sky-1: #50708B; --sky-2: #778699; --sky-3: #B39379; --sky-4: #D29A69; --sky-5: #D29A69; } /* Soft haze, 15:30 */
    70.83%  { --sky-1: #50708B; --sky-2: #778699; --sky-3: #B39379; --sky-4: #D29A69; --sky-5: #D29A69; } /* Soft haze, 17:00 (hold) */
    85.42%  { --sky-1: #50708B; --sky-2: #778699; --sky-3: #D19C45; --sky-4: #FFA71B; --sky-5: #FF7816; } /* Sunrise / sunset, 20:30 */
    91.67%  { --sky-1: #011D2D; --sky-2: #062335; --sky-3: #15364C; --sky-4: #1D3F58; --sky-5: #21445E; } /* First light, 22:00 */
    97.92%  { --sky-1: #222222; --sky-2: #222222; --sky-3: #222222; --sky-4: #222222; --sky-5: #222222; } /* Night, 23:30 */
    100%    { --sky-1: #222222; --sky-2: #222222; --sky-3: #222222; --sky-4: #222222; --sky-5: #222222; } /* Night, 24:00 (loop) */
  }

  .sky {
    position: fixed;
    inset: 0;
    z-index: -1;
    background: linear-gradient(
      to bottom,
      var(--sky-1) 0%,
      var(--sky-2) 40%,
      var(--sky-3) 70%,
      var(--sky-4) 85%,
      var(--sky-5) 100%
    );
    animation: sky-day-cycle 86400s linear infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .sky { animation: none; }
  }
</style>
</head>
<body>
  <div class="sky" id="sky"></div>
  <!-- your page content -->

<script>
(() => {
  // Each entry has the time-of-day (in minutes since midnight), the stage name (for debugging),
  // and the gradient color values. Keyframes are intentionally non-uniform — see §4.3.
  const SKY_KEYFRAMES = [
    { time:    0, name: 'Night',       colors: { '--sky-1': '#222222', '--sky-2': '#222222', '--sky-3': '#222222', '--sky-4': '#222222', '--sky-5': '#222222' } }, // 00:00
    { time:  270, name: 'Night',       colors: { '--sky-1': '#222222', '--sky-2': '#222222', '--sky-3': '#222222', '--sky-4': '#222222', '--sky-5': '#222222' } }, // 04:30 hold
    { time:  330, name: 'First light', colors: { '--sky-1': '#011D2D', '--sky-2': '#062335', '--sky-3': '#15364C', '--sky-4': '#1D3F58', '--sky-5': '#21445E' } }, // 05:30
    { time:  390, name: 'Sunrise',     colors: { '--sky-1': '#50708B', '--sky-2': '#778699', '--sky-3': '#D19C45', '--sky-4': '#FFA71B', '--sky-5': '#FF7816' } }, // 06:30
    { time:  480, name: 'Soft haze',   colors: { '--sky-1': '#50708B', '--sky-2': '#778699', '--sky-3': '#B39379', '--sky-4': '#D29A69', '--sky-5': '#D29A69' } }, // 08:00
    { time:  600, name: 'Early day',   colors: { '--sky-1': '#476C98', '--sky-2': '#4D77A4', '--sky-3': '#568BB8', '--sky-4': '#5A92BF', '--sky-5': '#5A92BF' } }, // 10:00
    { time:  720, name: 'Open sky',    colors: { '--sky-1': '#3772C7', '--sky-2': '#3E87D8', '--sky-3': '#4BAAF4', '--sky-4': '#50B7FF', '--sky-5': '#50B7FF' } }, // 12:00
    { time:  840, name: 'Early day',   colors: { '--sky-1': '#476C98', '--sky-2': '#4D77A4', '--sky-3': '#568BB8', '--sky-4': '#5A92BF', '--sky-5': '#5A92BF' } }, // 14:00
    { time:  930, name: 'Soft haze',   colors: { '--sky-1': '#50708B', '--sky-2': '#778699', '--sky-3': '#B39379', '--sky-4': '#D29A69', '--sky-5': '#D29A69' } }, // 15:30
    { time: 1020, name: 'Soft haze',   colors: { '--sky-1': '#50708B', '--sky-2': '#778699', '--sky-3': '#B39379', '--sky-4': '#D29A69', '--sky-5': '#D29A69' } }, // 17:00 hold
    { time: 1230, name: 'Sunrise',     colors: { '--sky-1': '#50708B', '--sky-2': '#778699', '--sky-3': '#D19C45', '--sky-4': '#FFA71B', '--sky-5': '#FF7816' } }, // 20:30 sunset
    { time: 1320, name: 'First light', colors: { '--sky-1': '#011D2D', '--sky-2': '#062335', '--sky-3': '#15364C', '--sky-4': '#1D3F58', '--sky-5': '#21445E' } }, // 22:00
    { time: 1410, name: 'Night',       colors: { '--sky-1': '#222222', '--sky-2': '#222222', '--sky-3': '#222222', '--sky-4': '#222222', '--sky-5': '#222222' } }, // 23:30
  ];

  const sky = document.getElementById('sky');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function secondsSinceMidnight() {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return (now - midnight) / 1000;
  }

  function syncAnimation() {
    sky.style.animationDelay = `-${secondsSinceMidnight()}s`;
    sky.style.animationPlayState = 'running';
  }

  function setStaticColors() {
    const minutesOfDay = new Date().getHours() * 60 + new Date().getMinutes();
    const nearest = SKY_KEYFRAMES.reduce((best, kf) =>
      Math.abs(kf.time - minutesOfDay) < Math.abs(best.time - minutesOfDay) ? kf : best
    );
    for (const [k, v] of Object.entries(nearest.colors)) sky.style.setProperty(k, v);
  }

  let staticInterval = null;

  function applyMotionPreference() {
    if (reducedMotion.matches) {
      sky.style.animation = 'none';
      setStaticColors();
      if (!staticInterval) staticInterval = setInterval(setStaticColors, 5 * 60 * 1000);
    } else {
      sky.style.animation = '';
      syncAnimation();
      if (staticInterval) { clearInterval(staticInterval); staticInterval = null; }
    }
  }

  applyMotionPreference();
  reducedMotion.addEventListener('change', applyMotionPreference);

  document.addEventListener('visibilitychange', () => {
    if (reducedMotion.matches) {
      if (!document.hidden) setStaticColors();
      return;
    }
    if (document.hidden) {
      sky.style.animationPlayState = 'paused';
    } else {
      syncAnimation();
    }
  });
})();
</script>
</body>
</html>
```

This is feature-complete and ships as-is.

---

## 6. Color palette reference

The cycle is built from **six unique sky stages**. Each was provided as a CSS gradient with 2–5 stops at varying positions, then normalized to 5 stops at fixed positions (0%, 40%, 70%, 85%, 100%) so CSS can interpolate between them. The normalized values reproduce the original gradients with negligible visual difference.

**Source gradients** (the user-facing definitions, for reference):

| Stage       | Gradient |
|-------------|----------|
| Night       | `linear-gradient(0deg, #222 0%, #222 100%)` |
| First light | `linear-gradient(180deg, #011D2D 30.29%, #21445E 93%)` |
| Sunrise     | `linear-gradient(180deg, #50708B 0%, #778699 40.05%, #FFA71B 85.21%, #FF7816 100%)` |
| Soft haze   | `linear-gradient(180deg, #50708B 0%, #778699 40.05%, #D29A69 85.21%)` |
| Early day   | `linear-gradient(180deg, #476C98 22.47%, #5A92BF 81.16%)` |
| Open sky    | `linear-gradient(180deg, #3772C7 22.47%, #50B7FF 81.16%)` |

**Normalized 5-stop values** (what the keyframes actually use), with each stage mapped to its clock time in the cycle:

| Time  | Stage              | sky-1 (0%) | sky-2 (40%) | sky-3 (70%) | sky-4 (85%) | sky-5 (100%) |
|-------|--------------------|------------|-------------|-------------|-------------|--------------|
| 00:00 | Night              | `#222222`  | `#222222`   | `#222222`   | `#222222`   | `#222222`    |
| 04:30 | Night (hold)       | `#222222`  | `#222222`   | `#222222`   | `#222222`   | `#222222`    |
| 05:30 | First light        | `#011D2D`  | `#062335`   | `#15364C`   | `#1D3F58`   | `#21445E`    |
| 06:30 | Sunrise            | `#50708B`  | `#778699`   | `#D19C45`   | `#FFA71B`   | `#FF7816`    |
| 08:00 | Soft haze          | `#50708B`  | `#778699`   | `#B39379`   | `#D29A69`   | `#D29A69`    |
| 10:00 | Early day          | `#476C98`  | `#4D77A4`   | `#568BB8`   | `#5A92BF`   | `#5A92BF`    |
| 12:00 | Open sky           | `#3772C7`  | `#3E87D8`   | `#4BAAF4`   | `#50B7FF`   | `#50B7FF`    |
| 14:00 | Early day          | `#476C98`  | `#4D77A4`   | `#568BB8`   | `#5A92BF`   | `#5A92BF`    |
| 15:30 | Soft haze          | `#50708B`  | `#778699`   | `#B39379`   | `#D29A69`   | `#D29A69`    |
| 17:00 | Soft haze (hold)   | `#50708B`  | `#778699`   | `#B39379`   | `#D29A69`   | `#D29A69`    |
| 20:30 | Sunrise (sunset)   | `#50708B`  | `#778699`   | `#D19C45`   | `#FFA71B`   | `#FF7816`    |
| 22:00 | First light        | `#011D2D`  | `#062335`   | `#15364C`   | `#1D3F58`   | `#21445E`    |
| 23:30 | Night              | `#222222`  | `#222222`   | `#222222`   | `#222222`   | `#222222`    |

The Sunrise, First light, Soft haze, and Early day gradients are reused across the morning and evening sides of the cycle. Sunset (20:30) uses the same gradient as Sunrise — given the time-of-day context, the warm horizon band reads as either. Open sky appears only at midday; Night appears at the loop boundaries and through the held block from 00:00 to 04:30 plus the brief return at 23:30.

Editing notes:
- The horizon (sky-5) drives the most visual interest. Big shifts here read as time-of-day changes.
- The top (sky-1) should stay relatively cool/dark even at noon — pure white skies look unnatural.
- Several stages (Soft haze, Early day, Open sky) have identical sky-4 and sky-5 values because their source gradients ended before 100% — the area below the last stop is solid color in CSS. If you want a more interesting horizon for those stages, set sky-5 to a slightly different hue.
- Adjacent keyframes should differ enough to be distinguishable but not so much that interpolation produces unnatural intermediate hues. Test mid-points by setting the animation duration to 60s during development.

---

## 7. Tuning the look

### 7.1 Adjusting the timing for season or latitude

The default schedule (§4.3) is tuned for a long-summer-day feel — Sunrise peaks at 06:30, sunset at 20:30, with 11 hours of true Night and a 90-minute afternoon Soft haze hold. To adapt the cycle for different conditions, shift the relevant keyframe percentages:

**Winter / shorter day.** Push Sunrise later and sunset earlier, lengthening Night:

| Stage              | Default time | Winter time |
|--------------------|--------------|-------------|
| Night hold ends    | 04:30        | 06:30       |
| First light        | 05:30        | 07:30       |
| Sunrise            | 06:30        | 08:30       |
| Sunrise (sunset)   | 20:30        | 16:30       |
| First light (eve)  | 22:00        | 18:00       |
| Night returns      | 23:30        | 19:30       |

**Lower latitudes.** Faster transitions through twilight (the sun moves more vertically), so compress the First light → Sunrise window:

| Stage         | Default | Lower latitude |
|---------------|---------|----------------|
| First light   | 05:30   | 06:00          |
| Sunrise       | 06:30   | 06:30          |

**No real-world model** — to dial back realism and make every part of the day visually active, you can flatten the holds: change `18.75% { Night }` to `8.33% { Night }` (so the morning transition starts at 02:00) and remove the `70.83% { Soft haze hold }` keyframe so the afternoon starts moving toward sunset right after the 15:30 peak.

The percentage formula for any time is `(hours * 60 + minutes) / (24 * 60) * 100`. Update both the CSS `@keyframes` and the JS `SKY_KEYFRAMES.time` values in lockstep — they must match for time-of-day sync to stay correct.

### 7.2 Animating stop positions

To make the orange "horizon band" physically rise as the sun comes up, animate the stop positions too. Register them as `<percentage>` types:

```css
@property --pos-band { syntax: '<percentage>'; inherits: false; initial-value: 85%; }
@property --pos-mid  { syntax: '<percentage>'; inherits: false; initial-value: 70%; }

.sky {
  background: linear-gradient(
    to bottom,
    var(--sky-1) 0%,
    var(--sky-2) 40%,
    var(--sky-3) var(--pos-mid),
    var(--sky-4) var(--pos-band),
    var(--sky-5) 100%
  );
}

@keyframes sky-day-cycle {
  22.92%  { /* First light — band low, sky still dark */ --pos-band: 88%; --pos-mid: 72%; }
  27.08%  { /* Sunrise — band visible at horizon */     --pos-band: 80%; --pos-mid: 62%; }
  50%     { /* Open sky — band has risen out of view */ --pos-band: 100%; --pos-mid: 90%; }
  85.42%  { /* Sunset — band returns at horizon */      --pos-band: 80%; --pos-mid: 62%; }
  /* ... */
}
```

This is the difference between a sky that "changes color" and one that "moves the sun."

### 7.3 Color-space considerations

CSS interpolates registered `<color>` properties in sRGB by default, which can produce muddy mid-tones when transitioning between distant hues (e.g., deep blue to orange passes through gray-brown).

Modern Chromium and Safari support `color-interpolation` via the `linear-gradient(in oklch to bottom, ...)` syntax for the gradient itself, but this controls the gradient's *spatial* interpolation between adjacent stops — not how the keyframe `@property` animation interpolates between time states.

For perceptually smoother color transitions over time, two options:
1. Keep CSS-driven animation but use more closely-spaced keyframes through tricky transitions, so the muddy zone is brief.
2. Use the JavaScript / Web Animations API approach (§8), pre-interpolate keyframes in OKLCH using a library like `culori`, and feed the interpolated colors as additional keyframes.

For a sky animation specifically, sRGB interpolation between well-chosen adjacent keyframes is usually fine — the issues mainly arise if you try to interpolate from "deep night" directly to "noon" in a single step.

---

## 8. Optional: scrubbing and debug tools (Web Animations API)

For development and debugging, it's useful to scrub through the day quickly. Replace the CSS `animation` property with a Web Animations API setup:

```js
// Convert the SKY_KEYFRAMES array (with time/colors fields) into WAAPI keyframes
// with explicit offsets, since the keyframes are non-uniformly spaced.
const ONE_DAY_MS = 86_400_000;
const waapiKeyframes = SKY_KEYFRAMES
  .map(kf => ({ offset: kf.time / 1440, ...kf.colors }))
  .concat([{ offset: 1, ...SKY_KEYFRAMES[0].colors }]); // close the loop with Night

const animation = sky.animate(waapiKeyframes, {
  duration: ONE_DAY_MS,
  iterations: Infinity,
  easing: 'linear'
});
animation.currentTime = secondsSinceMidnight() * 1000;

// Scrub to any time:
function scrubToTime(hours, minutes = 0) {
  animation.currentTime = (hours * 3600 + minutes * 60) * 1000;
}

// Speed up the cycle for development (e.g., 60s = 24h):
animation.updatePlaybackRate(ONE_DAY_MS / 60_000);
```

`SKY_KEYFRAMES` is the JS array from the reference implementation. The Web Animations API will interpolate registered custom properties just like CSS does, and respects the explicit `offset` values for non-uniform timing.

For a production app, prefer the pure CSS approach in §5 — it's simpler and lets the browser optimize the animation more aggressively.

---

## 9. Common pitfalls

**The colors snap instead of interpolating.**
The `@property` registration is missing or has the wrong `syntax`. Confirm `syntax: '<color>'` (not `'<string>'` or unspecified). Also check that the variable names in the `@keyframes` rule exactly match the `@property` names.

**The animation jumps at midnight.**
The `0%` and `100%` keyframes have different colors. Use the combined `0%, 100% { ... }` syntax to enforce equality.

**The animation is the right hue but the wrong time of day.**
The negative `animation-delay` was not set, or was set in milliseconds instead of seconds. CSS `animation-delay` is in seconds.

**The animation drifts after the tab is hidden for a long time.**
The `visibilitychange` handler is missing or is not re-running `syncAnimation()` on resume. `animationPlayState: 'paused'` does not advance the clock; the animation needs its delay reset on resume.

**The page consumes high CPU.**
You're on Firefox <128 (no `@property` interpolation, animation may be falling back to per-frame work) or you've accidentally set `animation-iteration-count` to a finite number, causing the animation to complete and never get cleaned up. Check Firefox version and confirm `iteration-count` is `infinite`.

**Reduced-motion users see incorrect time-of-day colors.**
The `setStaticColors` function is not running on initial page load, only on `prefers-reduced-motion` media query change. Call it explicitly during initial setup.

**The `initial-value` of the `@property` declaration shows briefly before the animation starts.**
Set the `initial-value` to the 00:00 colors specifically, or to a neutral middle-of-the-night color. This is what's painted before any JS runs and before the first animation frame — usually invisible, but if your page is slow to load, it can flash.

---

## 10. Graceful fallback for older browsers

If a meaningful percentage of your users are on browsers without `@property` color interpolation, provide a static gradient as a fallback. Use `@supports`:

```css
.sky {
  /* Fallback: static daytime gradient (Open sky stage) */
  background: linear-gradient(180deg, #3772C7 22.47%, #50B7FF 81.16%);
}

@supports (background: linear-gradient(var(--c, red), var(--c, blue))) and (color: rgb(from red r g b)) {
  /* Modern browser path: animated gradient (requires @property + relative color) */
  .sky {
    background: linear-gradient(
      to bottom,
      var(--sky-1) 0%,
      var(--sky-2) 40%,
      var(--sky-3) 70%,
      var(--sky-4) 85%,
      var(--sky-5) 100%
    );
    animation: sky-day-cycle 86400s linear infinite;
  }
}
```

The `@supports` test above is a proxy — there's no direct feature query for `@property` color interpolation. The relative-color-syntax test (`color: rgb(from red r g b)`) ships in the same browser versions, so it's a reasonable signal.

---

## 11. Testing checklist

Before shipping, verify each of the following:

- [ ] Page load at 03:00 — sky shows solid Night (we're inside the 00:00→04:30 hold), not a transition.
- [ ] Page load at 06:30 — sky shows the Sunrise gradient.
- [ ] Page load at 12:00 — sky shows the Open sky cyan-blue.
- [ ] Page load at 16:00 — sky shows solid Soft haze (we're inside the 15:30→17:00 hold), not transitioning.
- [ ] Page load at 19:00 — sky is mid-transition between the 17:00 Soft haze hold and the 20:30 sunset Sunrise — warm tones strengthening at the horizon.
- [ ] Page load at 20:30 — sky shows the Sunrise gradient (sunset peak).
- [ ] Open DevTools, set `animation-duration: 60s` temporarily — confirm full visible cycle in 60 seconds, with visible "holds" through Night and afternoon Soft haze, and crisp transitions through First light, Sunrise, and the morning sequence.
- [ ] Hide the tab for 30 seconds, return — sky resyncs to current time without a jump.
- [ ] Toggle OS-level reduced motion — animation stops, sky still shows time-appropriate colors (snapped to nearest keyframe), refreshes every 5 minutes.
- [ ] Resize window — gradient stretches without artifacts.
- [ ] Test on Safari, Chrome, Firefox 128+ — interpolation is smooth on all three.
- [ ] Test on Firefox <128 or older Safari — sky shows fallback gradient, no errors in console.
- [ ] Run Lighthouse — no performance regressions; the animation should not cause layout/paint thrashing (it doesn't — it's a compositor-only paint update of `background`).

---

## 12. Extension points

Once this is shipping, natural next steps:

- **Sun and moon overlay** — add a `<div>` with a circular radial gradient, positioned via `transform: translateY()` driven by the same animation timeline.
- **Star field** — overlay a fixed star image at low opacity, animate the opacity from 1 (midnight) to 0 (sunrise to sunset) and back.
- **Cloud tinting** — if you have cloud SVGs, animate their `fill` color through the same time-of-day palette so they reflect the sun's color.
- **Geographic accuracy** — replace the static keyframes with values computed from solar elevation angle for the user's lat/long. Libraries like `suncalc` give exact sunrise/sunset/golden-hour times; you can then place keyframes at those moments instead of fixed clock times.
- **Seasonal variation** — the sunrise keyframe at the equinox vs. winter solstice has different colors and timing; condition the keyframe set on the date.

These are all additive — the core animation engine stays the same.
