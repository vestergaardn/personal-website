"use client";

import { useState } from "react";
import { AquaOrb, AquaRadio } from "../components/AquaRadio";

function Column({ size, label }: { size: number; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: Math.max(24, size * 0.6),
      }}
    >
      <span style={{ color: "#fff", fontSize: 12, lineHeight: 1 }}>{label}</span>
      <AquaRadio size={size} />
      <div style={{ display: "flex", gap: Math.max(20, size * 0.5), alignItems: "center" }}>
        <AquaOrb size={size} active={true} />
        <AquaOrb size={size} active={false} />
      </div>
    </div>
  );
}

export default function AquaDemoPage() {
  // Example of using AquaRadio in controlled mode.
  const [controlled, setControlled] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 64,
        background: "#a9a9b8",
      }}
    >
      <div style={{ display: "flex", gap: 96, alignItems: "center" }}>
        <Column size={96} label="96px (design)" />
        <Column size={18} label="18px (real radio)" />
      </div>

      <label
        style={{
          color: "#fff",
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        <AquaRadio checked={controlled} onChange={setControlled} />
        Click me — AquaRadio in a label
      </label>
    </div>
  );
}
