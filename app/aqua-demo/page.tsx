"use client";

import { useState } from "react";
import { AquaRadioGroup } from "../components/AquaRadio";

export default function AquaDemoPage() {
  const [value, setValue] = useState<"work" | "heroes">("work");

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#a9a9b8",
      }}
    >
      <AquaRadioGroup
        value={value}
        onChange={setValue}
        options={[
          { value: "work", label: "Work" },
          { value: "heroes", label: "Heroes" },
        ]}
      />
    </div>
  );
}
