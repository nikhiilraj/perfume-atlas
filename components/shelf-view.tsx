"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Bookmark, Trash2 } from "lucide-react";
import type { Catalog } from "@/lib/catalog/types";
import {
  readShelf,
  writeShelf,
  resetShelf,
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
  const change = <K extends keyof ShelfEntry>(key: K, value: ShelfEntry[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
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
              value={draft.trialStatus}
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
              value={draft.reaction}
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
            checked={draft.favorite}
            onChange={(e) => change("favorite", e.target.checked)}
          />{" "}
          A favorite
        </label>
        <label className="field-label">
          My note for {f.name}
          <textarea
            maxLength={2000}
            value={draft.note}
            onChange={(e) => change("note", e.target.value)}
            placeholder="How did it feel on your skin? Where would you wear it?"
          />
        </label>
        <div className="shelf-card-actions">
          <button
            className="button"
            aria-label={"Save notes for " + f.name}
            onClick={() => {
              if (onSave({ ...draft, updatedAt: new Date().toISOString() }))
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
  const save = (next: ShelfState) => {
    try {
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
        Stored only in this browser. No account, no sync. Clearing browser data
        removes this shelf. Your notes are never sent to Jev.
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
                save({
                  version: 1,
                  entries: shelf.entries.map((e) =>
                    e.fragranceId === value.fragranceId ? value : e,
                  ),
                })
              }
              onRemove={() =>
                save({
                  version: 1,
                  entries: shelf.entries.filter(
                    (e) => e.fragranceId !== entry.fragranceId,
                  ),
                })
              }
            />
          ))}
        </div>
      )}
    </main>
  );
}
