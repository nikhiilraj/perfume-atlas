"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "@/components/site-link";
import { ArrowUpRight, Bookmark, Trash2 } from "lucide-react";
import type { Catalog } from "@/lib/catalog/types";
import {
  readShelf,
  writeShelf,
  resetShelf,
  SHELF_KEY,
  type ShelfState,
  type ShelfEntry,
} from "@/lib/shelf/storage";
import { ScentArt } from "./scent-art";
function ShelfCard({
  entry,
  catalog,
  onSave,
  onRemove,
}: {
  entry: ShelfEntry;
  catalog: Catalog;
  onSave: (entry: ShelfEntry) => boolean;
  onRemove: () => void;
}) {
  const f = catalog.fragrances.find((f) => f.id === entry.fragranceId)!;
  const [draft, setDraft] = useState(entry);
  const [dirty, setDirty] = useState(false);
  const value = dirty ? draft : entry;
  const change = <K extends keyof ShelfEntry>(key: K, value: ShelfEntry[K]) => {
    setDraft((d) => ({ ...(dirty ? d : entry), [key]: value }));
    setDirty(true);
  };
  return (
    <article className="shelf-card">
      <div className="shelf-art">
        <ScentArt color={f.profile.color} />
      </div>
      <div className="shelf-copy">
        <div className="shelf-card-heading">
          <div>
            <p className="eyebrow">{f.brand}</p>
            <h2>{f.name}</h2>
          </div>
          <button
            className="remove-button"
            aria-label={"Remove " + f.name + " from shelf"}
            onClick={onRemove}
          >
            <Trash2 size={17} />
          </button>
        </div>
        <p className="family-label">{f.profile.family}</p>
        <div className="form-grid">
          <label className="field-label">
            Trial status
            <select
              value={value.trialStatus}
              onChange={(e) =>
                change(
                  "trialStatus",
                  e.target.value as ShelfEntry["trialStatus"],
                )
              }
            >
              <option value="not-tried">Want to try</option>
              <option value="tried">Tried on skin</option>
            </select>
          </label>
          <label className="field-label">
            Reaction to {f.name}
            <select
              value={value.reaction}
              onChange={(e) =>
                change("reaction", e.target.value as ShelfEntry["reaction"])
              }
            >
              <option value="unsure">Still deciding</option>
              <option value="love">Love it</option>
              <option value="like">Like it</option>
              <option value="pass">Not for me</option>
            </select>
          </label>
        </div>
        <label className="favorite-field">
          <input
            type="checkbox"
            checked={value.favorite}
            onChange={(e) => change("favorite", e.target.checked)}
          />{" "}
          A favorite
        </label>
        <label className="field-label">
          My note for {f.name}
          <textarea
            maxLength={2000}
            value={value.note}
            onChange={(e) => change("note", e.target.value)}
            placeholder="Which traits did you like or dislike? How did it wear on your skin?"
          />
        </label>
        <div className="shelf-card-actions">
          <button
            className="button"
            aria-label={"Save notes for " + f.name}
            onClick={() => {
              if (onSave({ ...value, updatedAt: new Date().toISOString() }))
                setDirty(false);
            }}
          >
            Save notes
          </button>
          <Link className="text-link" href={"/perfumes/" + f.slug}>
            Explore profile <ArrowUpRight size={16} />
          </Link>
        </div>
        {dirty && <p className="caption">Unsaved changes</p>}
      </div>
    </article>
  );
}
export function ShelfView({
  catalog,
  addId,
}: {
  catalog: Catalog;
  addId?: string;
}) {
  const router = useRouter();
  const [shelf, setShelf] = useState<ShelfState>({ version: 1, entries: [] });
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [overlapId, setOverlapId] = useState("");
  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;
      let state: ShelfState;
      try {
        state = readShelf(
          window.localStorage,
          new Set(catalog.fragrances.map((f) => f.id)),
        );
        if (
          addId &&
          catalog.fragrances.some((f) => f.id === addId) &&
          !state.entries.some((e) => e.fragranceId === addId)
        ) {
          const next: ShelfState = {
            version: 1,
            entries: [
              ...state.entries,
              {
                fragranceId: addId,
                favorite: false,
                trialStatus: "not-tried",
                reaction: "unsure",
                note: "",
                updatedAt: new Date().toISOString(),
              },
            ],
          };
          writeShelf(window.localStorage, next);
          state = next;
          setMessage("Saved in this browser.");
        }
        setShelf(state);
        if (state.warning) setError(state.warning);
      } catch {
        setError("Could not save. Browser storage is blocked or full.");
      }
      setLoaded(true);
      if (addId) router.replace("/shelf");
    });
    return () => {
      cancelled = true;
    };
  }, [catalog, addId, router]);
  useEffect(() => {
    const refresh = (event: StorageEvent) => {
      if (event.key !== SHELF_KEY && event.key !== null) return;
      const next = readShelf(
        window.localStorage,
        new Set(catalog.fragrances.map((f) => f.id)),
      );
      setShelf(next);
      setError(next.warning ?? "");
    };
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, [catalog]);
  const save = (mutate: (entries: ShelfEntry[]) => ShelfEntry[]) => {
    try {
      // Merge against storage at the moment of the action, not a stale tab snapshot.
      const latest = readShelf(
        window.localStorage,
        new Set(catalog.fragrances.map((f) => f.id)),
      );
      const next: ShelfState = { version: 1, entries: mutate(latest.entries) };
      writeShelf(window.localStorage, next);
      setShelf(next);
      setError("");
      setMessage("Saved in this browser.");
      return true;
    } catch {
      setError(
        "Could not save. Browser storage is blocked or full. Your changes have not been stored.",
      );
      setMessage("");
      return false;
    }
  };
  return (
    <main id="main" className="page">
      <div className="page-title">
        <p className="eyebrow">THE BEGINNING OF A PERSONAL COLLECTION</p>
        <h1>Your scent shelf.</h1>
        <p>
          Save discoveries, record your reactions, remember what felt like you.
        </p>
      </div>
      <div className="shelf-toolbar">
        <span>
          <Bookmark size={16} /> {shelf.entries.length} scents ·{" "}
          {shelf.entries.filter((e) => e.favorite).length} favorites
        </span>
        <button
          className="button secondary"
          disabled={!loaded || !shelf.entries.length}
          onClick={() => {
            try {
              resetShelf(window.localStorage);
              setShelf({ version: 1, entries: [] });
              setError("");
              setMessage("Shelf cleared in this browser.");
            } catch {
              setError("Could not clear browser storage.");
            }
          }}
        >
          <Trash2 size={16} /> Clear my shelf
        </button>
      </div>
      <p className="shelf-privacy">
        Stored only in this browser. No account or sync across devices. Clearing
        browser data removes this shelf. Your notes are never sent to Jev.
      </p>
      <div role="status" className="save-status">
        {message}
      </div>
      {error && (
        <p role="alert" className="storage-error">
          {error}
        </p>
      )}
      {!loaded ? (
        <p>Opening your shelf…</p>
      ) : !shelf.entries.length ? (
        <div className="empty-state">
          <h2>Your shelf is waiting.</h2>
          <p>
            Open a perfume profile and select “Save to my shelf” to keep it
            here.
          </p>
          <Link className="button" href="/">
            Explore the collection <ArrowUpRight size={17} />
          </Link>
        </div>
      ) : (
        <div className="shelf-grid">
          {shelf.entries.map((entry) => (
            <ShelfCard
              key={entry.fragranceId}
              entry={entry}
              catalog={catalog}
              onSave={(value) =>
                save((entries) => {
                  if (!entries.some((e) => e.fragranceId === value.fragranceId))
                    throw Error("Removed in another tab");
                  return entries.map((e) =>
                    e.fragranceId === value.fragranceId ? value : e,
                  );
                })
              }
              onRemove={() =>
                save((entries) =>
                  entries.filter((e) => e.fragranceId !== entry.fragranceId),
                )
              }
            />
          ))}
        </div>
      )}
      {loaded && shelf.entries.length > 0 && (
        <section
          className="guide-callout shelf-overlap"
          data-testid="shelf-overlap"
        >
          <div>
            <p className="eyebrow">WHAT WOULD THIS ADD?</p>
            <h2>A new direction for your shelf.</h2>
            <label className="field-label">
              Compare a scent with my shelf
              <select
                value={overlapId}
                onChange={(e) => setOverlapId(e.target.value)}
              >
                <option value="">Choose a scent to explore</option>
                {catalog.fragrances
                  .filter(
                    (f) => !shelf.entries.some((e) => e.fragranceId === f.id),
                  )
                  .map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
              </select>
            </label>
            <p className="caption">
              Editorial inference from advertised notes and scent directions.
              Shared traits do not establish a clone or predict how either
              perfume wears.
            </p>
            {(() => {
              const candidate = catalog.fragrances.find(
                (f) => f.id === overlapId,
              );
              if (!candidate) return null;
              return (
                <ul>
                  {shelf.entries.map((entry) => {
                    const saved = catalog.fragrances.find(
                      (f) => f.id === entry.fragranceId,
                    )!;
                    const shared = Object.entries(candidate.profile.traits)
                      .filter(
                        ([trait, level]) =>
                          level >= 3 &&
                          (saved.profile.traits[
                            trait as keyof typeof saved.profile.traits
                          ] ?? 0) >= 3,
                      )
                      .map(([trait]) => trait);
                    return (
                      <li key={saved.id}>
                        <strong>{saved.name}</strong>:{" "}
                        {shared.length
                          ? `shares a ${shared.join(", ")} direction`
                          : "no prominent shared traits in this catalog"}
                        .{" "}
                        {saved.profile.family === candidate.profile.family
                          ? "Same editorial scent family."
                          : "Different editorial scent families."}
                      </li>
                    );
                  })}
                </ul>
              );
            })()}
          </div>
        </section>
      )}
    </main>
  );
}
