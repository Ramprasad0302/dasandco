DAS & CO — UPDATED HOSTINGER FRONTEND PACKAGE

Use this ZIP in Hostinger -> Websites -> Deployments -> Settings and redeploy -> Upload new files.

Main fixes in this package:
- New Order modal now uses client + project + category + gold weight + earning % + delivery date + status + notes only.
- Order number, gross weight and stone weight are no longer shown in the form.
- Gold earned is calculated live and saved.
- Selecting a client in New Order automatically loads that client's default earning percentage.
- Add/Edit Client now includes Default earning %.
- Client cards calculate Orders, Gold Designed, Earnings and Last Order from the order data when the API does not provide precomputed stats.
- Casting entry now requires Client first, then an Order belonging to that client.
- Added CSV/JSON download actions for clients, orders, expenses/casting, gold vault, analytics, calendar, reports and dashboard all-data export.
- Added working Calendar route and compact calendar UI.
- Added working Settings route with API + local browser fallback.
- Analytics was simplified to robust calculations from orders/clients/expenses so missing advanced analytics endpoints do not blank the page.
- Gold Vault date display was cleaned up.
- Route tree includes Calendar and Settings routes.

IMPORTANT:
This is the frontend source package. It calls the Hostinger PHP API at:
https://dasandco.online/api

Upload the PHP API into public_html/api first, then upload this ZIP in
Hostinger -> Websites -> Deployments -> Upload new files and redeploy.

Do NOT upload this source ZIP to a Node.js application screen. Hostinger
should build it with: npm install && npm run build
Start command, if asked: npm start
