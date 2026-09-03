import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSuggest } from "../api/client";
import { useAuth } from "../store/auth";
import {
  clearHistory,
  getHistory,
  pushHistory,
  type HistoryEntry,
} from "../store/persist";
import type { PublicListing } from "../types";

export function HeaderSearch({
  initial = "",
  onSubmitQuery,
}: {
  initial?: string;
  onSubmitQuery?: (q: string) => void;
}) {
  const nav = useNavigate();
  const { user } = useAuth();
  const [q, setQ] = useState(initial);
  const [open, setOpen] = useState(false);
  const [suggest, setSuggest] = useState<PublicListing[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => setQ(initial), [initial]);
  useEffect(() => setHistory(getHistory(user?.uid)), [open, user?.uid]);

  useEffect(() => {
    if (!q.trim()) {
      setSuggest([]);
      return;
    }
    const t = window.setTimeout(() => {
      void fetchSuggest(q).then(setSuggest);
    }, 160);
    return () => window.clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const go = (query: string, photoUrl?: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    pushHistory({ q: trimmed, photoUrl, at: Date.now() }, user?.uid);
    setHistory(getHistory(user?.uid));
    setOpen(false);
    if (onSubmitQuery) onSubmitQuery(trimmed);
    else nav(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="search-bar" ref={box}>
      <div className="search-wrap">
        <span className="search-icon" aria-hidden>
          🔍
        </span>
        <input
          className="search-input"
          placeholder="Search products in Kariakoo"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") go(q, suggest[0]?.photoUrl);
          }}
          aria-label="Search"
        />
        <button
          type="button"
          className="search-btn"
          onClick={() => go(q, suggest[0]?.photoUrl)}
        >
          Search
        </button>
      </div>
      {open && (
        <div className="search-panel">
          {suggest.length > 0 && (
            <>
              <h4>Suggestions</h4>
              {suggest.map((s) => (
                <button
                  type="button"
                  className="suggest-row"
                  key={s.id}
                  onClick={() => {
                    pushHistory(
                      {
                        q: s.title,
                        photoUrl: s.photoUrl,
                        at: Date.now(),
                      },
                      user?.uid,
                    );
                    setOpen(false);
                    nav(`/product/${s.id}`);
                  }}
                >
                  <img src={s.photoUrl} alt="" />
                  <span>{s.title}</span>
                </button>
              ))}
            </>
          )}
          {history.length > 0 && (
            <>
              <h4>Recent</h4>
              {history.map((h) => (
                <button
                  type="button"
                  className="history-row"
                  key={h.q + h.at}
                  onClick={() => go(h.q, h.photoUrl)}
                >
                  {h.photoUrl ? (
                    <img src={h.photoUrl} alt="" />
                  ) : (
                    <img src="/brand/logo4_submark.svg" alt="" />
                  )}
                  <span>{h.q}</span>
                </button>
              ))}
              <button
                type="button"
                className="suggest-row muted"
                onClick={() => {
                  clearHistory(user?.uid);
                  setHistory([]);
                }}
              >
                Clear recent
              </button>
            </>
          )}
          {!suggest.length && !history.length && q.trim() === "" && (
            <p className="hint" style={{ padding: "8px 16px" }}>
              Try kitenge, sneakers, earbuds
            </p>
          )}
        </div>
      )}
    </div>
  );
}
