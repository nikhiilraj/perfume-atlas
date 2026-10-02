"use client";
import { useState } from "react";
import type { Fragrance } from "@/lib/catalog/types";
import { ScentArt } from "../scent-art";
const phases = ["Opening", "Character", "Drydown"] as const;
export function ScentStage({ fragrance: f }: { fragrance: Fragrance }) {
  const [phase, setPhase] = useState(0);
  return (
    <section className="scent-stage">
      <div className={"phase-art phase-" + phase}>
        <ScentArt color={f.profile.color} />
        <span>AN ABSTRACT SCENT STUDY</span>
      </div>
      <div className="phase-copy">
        <p className="eyebrow">IMAGINE THE COMPOSITION</p>
        <h2>A scent in three acts.</h2>
        <div className="phase-tabs" aria-label="Scent phase">
          {phases.map((p, i) => (
            <button
              key={p}
              onClick={() => setPhase(i)}
              aria-pressed={phase === i}
            >
              {String(i + 1).padStart(2, "0")} {p}
            </button>
          ))}
        </div>
        <div aria-live="polite" className="phase-description">
          <h3>{phases[phase]}</h3>
          <p>{f.profile.phases[phase]}</p>
        </div>
        <p className="caption">
          An editorial interpretation of advertised notes. These phases aren’t a
          measured wear timeline.
        </p>
      </div>
    </section>
  );
}
