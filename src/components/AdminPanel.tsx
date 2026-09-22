"use client";

import { useEffect, useState } from "react";
import type { Testimonial } from "@/lib/store";

const SAVED_KEY = "tutoring-admin-password";

export default function AdminPanel() {
  const [password, setPassword] = useState("");
  const [items, setItems] = useState<Testimonial[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function call(method: "GET" | "PATCH", pw: string, body?: object) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/testimonials", {
        method,
        headers: { "Content-Type": "application/json", "x-admin-password": pw },
        body: body ? JSON.stringify(body) : undefined,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Something went wrong.");
      setItems(json.testimonials);
      try {
        sessionStorage.setItem(SAVED_KEY, pw);
      } catch {}
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      if (method === "GET") setItems(null);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    let saved = "";
    try {
      saved = sessionStorage.getItem(SAVED_KEY) ?? "";
    } catch {}
    if (saved) {
      setPassword(saved);
      call("GET", saved);
    }
  }, []);

  const pending = items?.filter((t) => t.status === "pending") ?? [];
  const approved = items?.filter((t) => t.status === "approved") ?? [];

  const act = (id: string, action: "approve" | "hide" | "delete") =>
    call("PATCH", password, { id, action });

  function row(t: Testimonial) {
    return (
      <article key={t.id} className="admin-item">
        <p>{t.message}</p>
        <div className="admin-meta">
          {t.name} · {t.role} · {t.subject} · {new Date(t.createdAt).toLocaleDateString()}
        </div>
        <div className="admin-buttons">
          {t.status === "pending" ? (
            <button className="btn btn-primary" disabled={busy} onClick={() => act(t.id, "approve")}>
              Approve
            </button>
          ) : (
            <button className="btn" disabled={busy} onClick={() => act(t.id, "hide")}>
              Hide from site
            </button>
          )}
          <button className="btn btn-danger" disabled={busy} onClick={() => act(t.id, "delete")}>
            Delete
          </button>
        </div>
      </article>
    );
  }

  return (
    <main className="wrap admin">
      <div>
        <h1>Review testimonials</h1>
        <p className="section-sub">
          New testimonials wait here until you approve them. <a href="/">Back to the site</a>
        </p>
      </div>

      {!items ? (
        <form
          className="admin-login"
          onSubmit={(e) => {
            e.preventDefault();
            call("GET", password);
          }}
        >
          <div className="field">
            <label htmlFor="admin-password">Admin password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Checking…" : "Open"}
          </button>
        </form>
      ) : (
        <>
          <section>
            <h2>Waiting for approval ({pending.length})</h2>
            <div className="admin-list">
              {pending.length ? pending.map(row) : <div className="empty">Nothing new right now.</div>}
            </div>
          </section>
          <section>
            <h2>On the site ({approved.length})</h2>
            <div className="admin-list">
              {approved.length ? approved.map(row) : <div className="empty">None approved yet.</div>}
            </div>
          </section>
        </>
      )}

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </main>
  );
}
