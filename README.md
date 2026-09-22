# Maria's tutoring site

## Editing the text
Everything written on the site is in `src/content.ts`. Add your email to `contactEmail` to show the "Book a session" section.

## Running it locally
```
npm run dev
```
Locally, testimonials are kept in memory (they disappear when you restart). The admin password is in `.env.local`.

## Putting it online (Vercel)
1. Push this folder to a new GitHub repo and import it at vercel.com/new.
2. In the Vercel project, go to **Storage → Create → Upstash (Redis)**, pick the free plan, and connect it to the project. This adds the `KV_REST_API_URL` and `KV_REST_API_TOKEN` variables automatically.
3. In **Settings → Environment Variables**, add `ADMIN_PASSWORD` with a strong password only you know.
4. Redeploy.

## Approving testimonials
Go to `/admin` on your site (for example `your-site.vercel.app/admin`) and enter your admin password. New testimonials wait there until you click **Approve**. You can also hide or delete ones already on the site.
