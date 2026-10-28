# BuildSmart (Phase 1 prototype, hardened)
```
npm install
npm run dev          # http://localhost:3000, use a phone-size viewport
npm run launch-check # fails on purpose until every blocker below is fixed
```

## Blockers (launch-check enforces these)
1. **Authentication is simulated.** Any details log in and the "user" lives in localStorage, so anyone can edit it. Replace with Supabase Auth and check the session on the server.
2. **Payments are simulated.** M-Pesa is a 3 second timer that grants a plan. Build the Daraja STK push route and callback; only the callback (service role) may write `payments` and `subscriptions`. Until then the paywall can be bypassed from the browser console.
3. **Data is sample data.** `DEMO=true` in `lib/data.js` shows a notice and disables Call and WhatsApp (the phone numbers are placeholders). Replace with verified store data, then set `DEMO=false`.
4. **Business details** in `lib/site.js` and `NEXT_PUBLIC_SITE_URL` (your https domain). LocalBusiness schema switches on once `address` is filled.
5. **Hardware portal is a prototype.** Owners can log in (simulated), edit prices, stock and delivery fee, and buyers see the change. Edits are stored in the browser (`bs_ov`), so anyone can fake them. Replace with Supabase writes: the RLS policies `price_write` and `stock_write` already allow only the verified owner of that store. Pick the store from the owner's own `hardware_stores` row, never from a dropdown.
6. **Admin portal does not exist yet.** Make your account an admin once in the Supabase SQL editor (`update profiles set role='admin' where id=...`), then build `/admin` with a server-side role check (middleware plus RLS), never in the browser.

## Before you go live
- Kenyan lawyer to review Privacy, Terms, Cookies and Refund pages (drafts).
- ODPC registration: confirm whether you must register as a data controller or processor.
- `npm audit`, then Lighthouse on the deployed URL (mobile, throttled): `npx lighthouse https://YOURDOMAIN --preset=perf --view`
- Run `supabase/schema.sql` and test RLS with a buyer, a store owner and an admin account.
- Add rate limiting when you add API routes (login, STK push, enquiries). Use your host or Supabase Auth limits.
- CSP still allows inline scripts (Next.js bootstrap). Move to nonces via middleware once there is a backend.
- Set billing alerts and spend caps in Vercel, Supabase and Safaricom dashboards. These cannot be set from code.

## Already in the code
Security headers and CSP, HTTPS enforcement (HSTS), no source maps, no X-Powered-By, `.env*` ignored, secret scan in launch-check, RLS on every table with role and status guards and input limits, legal pages with breadcrumbs, custom 404 and error pages, unique titles and descriptions, canonical tags, sitemap.xml, robots.txt, llms.txt, favicon, share image with alt text, visible form labels, AA colour contrast, no emoji, pill buttons, purple, fake reviews or metrics, and no analytics or third-party scripts.

## Changed in this version
Password show/hide, password reset flow (simulated; wire to `resetPasswordForEmail`), fluid layout from 280px to 4K, hardware owner portal. Fixed a crash in the original: the screen map referenced a `Start` component that did not exist, so the app failed on first load.
