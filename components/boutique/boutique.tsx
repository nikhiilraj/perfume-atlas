"use client";
import { useEffect, useRef, useState } from "react";
import { useHydrated } from "@/hooks/use-hydrated";
import type { Fragrance } from "@/lib/catalog/types";
export type BoutiqueProps = {
  items: Fragrance[];
  selectedId: string;
  onSelect: (id: string) => void;
  reducedMotion?: boolean;
};
export function Boutique({
  items,
  selectedId,
  onSelect,
  reducedMotion = false,
}: BoutiqueProps) {
  const hydrated = useHydrated();
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<{
    focus: (id: string) => void;
    dispose: () => void;
  } | null>(null);
  const selected = useRef(selectedId);
  const callback = useRef(onSelect);
  const [simple, setSimple] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    selected.current = selectedId;
    callback.current = onSelect;
  }, [selectedId, onSelect]);
  useEffect(() => {
    if (simple) return;
    let cancelled = false;
    const motion =
      reducedMotion ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    import("./scene")
      .then(({ createBoutique }) => {
        if (cancelled || !host.current) return;
        try {
          scene.current = createBoutique(
            host.current,
            items,
            (id) => callback.current(id),
            motion,
          );
          scene.current.focus(selected.current);
          setReady(true);
        } catch {
          setUnavailable(true);
        }
      })
      .catch(() => setUnavailable(true));
    return () => {
      cancelled = true;
      scene.current?.dispose();
      scene.current = null;
      setReady(false);
    };
  }, [items, simple, reducedMotion]);
  useEffect(() => {
    scene.current?.focus(selectedId);
  }, [selectedId]);
  const f = items.find((x) => x.id === selectedId) ?? items[0];
  return (
    <div className="boutique">
      <div className="scene-topline">
        <span>
          THE SCENT GALLERY <span className="live-dot" />
        </span>
        <button
          type="button"
          className="scene-toggle"
          disabled={!hydrated}
          onClick={() => setSimple(!simple)}
          aria-pressed={simple}
        >
          {simple ? "Enter 3D view" : "Simple view"}
        </button>
      </div>
      <div className="scene-host" ref={host} data-testid="boutique-canvas" />
      {(!ready || simple || unavailable) && (
        <div className="scene-fallback">
          <div
            className="scent-orb"
            style={
              {
                "--scent": f?.profile.color ?? "#9c8364",
              } as React.CSSProperties
            }
          />
          <span>
            {unavailable
              ? "Simple view · 3D unavailable"
              : simple
                ? "Simple view"
                : "Preparing the gallery…"}
          </span>
        </div>
      )}
      <div className="scene-bottomline">
        <span>Abstract scent studies · product photos pending permission</span>
        <span>SELECT A SCENT BELOW ↘</span>
      </div>
    </div>
  );
}
