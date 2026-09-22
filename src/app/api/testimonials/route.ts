import {
  ROLES,
  SUBJECTS,
  StoreNotConfigured,
  addPending,
  allowSubmission,
} from "@/lib/store";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "The form data couldn't be read." }, { status: 400 });
  }

  // Honeypot: real people never see this field, bots fill it in.
  if (clean(body.website)) return Response.json({ ok: true });

  const name = clean(body.name);
  const role = clean(body.role);
  const subject = clean(body.subject);
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (name.length < 2 || name.length > 60)
    return Response.json({ error: "Enter a name between 2 and 60 characters." }, { status: 400 });
  if (!(ROLES as readonly string[]).includes(role))
    return Response.json({ error: "Choose who you are." }, { status: 400 });
  if (!(SUBJECTS as readonly string[]).includes(subject))
    return Response.json({ error: "Choose a subject." }, { status: 400 });
  if (message.length < 20 || message.length > 1000)
    return Response.json(
      { error: "Write between 20 and 1,000 characters." },
      { status: 400 },
    );

  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    if (!(await allowSubmission(ip)))
      return Response.json(
        { error: "Too many submissions from this network. Try again in an hour." },
        { status: 429 },
      );

    await addPending({
      name,
      role: role as (typeof ROLES)[number],
      subject: subject as (typeof SUBJECTS)[number],
      message,
    });
    return Response.json({ ok: true });
  } catch (e) {
    if (e instanceof StoreNotConfigured)
      return Response.json({ error: "Testimonials aren't open yet." }, { status: 503 });
    console.error(e);
    return Response.json({ error: "Something went wrong saving it. Try again." }, { status: 500 });
  }
}
