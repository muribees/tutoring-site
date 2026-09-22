"use client";

import { useRef, useState } from "react";

const ROLES = ["Student", "Parent", "Teacher", "Other"];
const SUBJECTS = ["Math", "Spanish", "Computer Science", "Other"];

export default function TestimonialButton() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  function open() {
    setState("idle");
    setError("");
    dialog.current?.showModal();
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setError("");
    setState("sending");
    const data = Object.fromEntries(new FormData(form));
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Something went wrong. Try again.");
      form.reset();
      setState("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setState("idle");
    }
  }

  return (
    <>
      <button type="button" className="btn btn-primary" onClick={open}>
        Write a testimonial
      </button>

      <dialog ref={dialog} className="sheet" aria-labelledby="t-title">
        {state === "sent" ? (
          <div className="sheet-inner">
            <h2 id="t-title">Thank you!</h2>
            <p style={{ margin: 0 }}>
              Your testimonial was sent. It will show up on the site once I&rsquo;ve read it.
            </p>
            <div className="sheet-actions">
              <button type="button" className="btn btn-primary" onClick={() => dialog.current?.close()}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <form className="sheet-inner" onSubmit={submit}>
            <h2 id="t-title">Write a testimonial</h2>

            <div className="field">
              <label htmlFor="t-name">Your name</label>
              <input id="t-name" name="name" required minLength={2} maxLength={60} autoComplete="name" />
              <span className="hint">First name and last initial is fine, like &ldquo;Sofia R.&rdquo;</span>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="t-role">I am a</label>
                <select id="t-role" name="role" required defaultValue="Student">
                  {ROLES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="t-subject">Subject</label>
                <select id="t-subject" name="subject" required defaultValue="Math">
                  {SUBJECTS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field">
              <label htmlFor="t-message">Your testimonial</label>
              <textarea id="t-message" name="message" required minLength={20} maxLength={1000} />
              <span className="hint">How did tutoring help? 20 to 1,000 characters.</span>
            </div>

            <div className="hp" aria-hidden="true">
              <label htmlFor="t-website">Website</label>
              <input id="t-website" name="website" tabIndex={-1} autoComplete="off" />
            </div>

            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}

            <div className="sheet-actions">
              <button type="button" className="btn" onClick={() => dialog.current?.close()}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={state === "sending"}>
                {state === "sending" ? "Sending…" : "Send testimonial"}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
