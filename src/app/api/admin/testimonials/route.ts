import { createHash, timingSafeEqual } from "node:crypto";
import { StoreNotConfigured, listAll, remove, setStatus } from "@/lib/store";

function digest(s: string) {
  return createHash("sha256").update(s).digest();
}

function authorize(request: Request): Response | null {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected)
    return Response.json(
      { error: "ADMIN_PASSWORD isn't set in the environment variables." },
      { status: 503 },
    );
  const given = request.headers.get("x-admin-password") ?? "";
  if (!timingSafeEqual(digest(given), digest(expected)))
    return Response.json({ error: "Wrong password." }, { status: 401 });
  return null;
}

function failure(e: unknown) {
  if (e instanceof StoreNotConfigured)
    return Response.json({ error: e.message }, { status: 503 });
  console.error(e);
  return Response.json({ error: "Something went wrong. Try again." }, { status: 500 });
}

export async function GET(request: Request) {
  const denied = authorize(request);
  if (denied) return denied;
  try {
    return Response.json({ testimonials: await listAll() });
  } catch (e) {
    return failure(e);
  }
}

export async function PATCH(request: Request) {
  const denied = authorize(request);
  if (denied) return denied;
  try {
    const { id, action } = (await request.json()) as { id?: string; action?: string };
    if (!id) return Response.json({ error: "Missing id." }, { status: 400 });

    if (action === "delete") await remove(id);
    else if (action === "approve" || action === "hide") {
      const found = await setStatus(id, action === "approve" ? "approved" : "pending");
      if (!found) return Response.json({ error: "That testimonial no longer exists." }, { status: 404 });
    } else return Response.json({ error: "Unknown action." }, { status: 400 });

    return Response.json({ testimonials: await listAll() });
  } catch (e) {
    return failure(e);
  }
}
