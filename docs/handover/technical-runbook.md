# Technical runbook

The app is one Node package. The staff page and the admin page are served by `npm run dashboard` on `127.0.0.1:8787`. The worker command is not part of normal operation and stays stopped.

Environment names used by the dashboard are `APP_ENV`, `DATABASE_URL`, `META_PAGE_ID`, `META_PAGE_ACCESS_TOKEN`, `META_INSTAGRAM_ACCOUNT_ID`, `GA4_PROPERTY_ID`, `DASHBOARD_SESSION_SECRET`, and `ALERT_RECIPIENT`. Values stay in the process environment. `GA4_PROPERTY_ID`, `DASHBOARD_SESSION_SECRET`, and `ALERT_RECIPIENT` stay empty. An empty alert recipient means an alert is shown on the admin page and is not emailed.

The hosted database is Supabase project `frisxbknytwpgaqizthl`. Backups are that project's backups. Restoring one is an owner action. Do not reset the database from the app.

A log line `community store query failed 28P01` means the database rejected the password. Correct the URL in the environment and restart the dashboard. Do not copy the URL into a log, a guide, or a chat.

A failed publish, a failed inbox load, and a month with no saved figures each leave one admin alert. The staff page does not show those alerts. Customer message text stays on the staff enquiry section and is not copied into the alert.

Publishing and community replies stay off until a person changes the matching switch outside this page. The Page token stays in the engine environment. It is not in the marketing profile, a guide, or the page HTML.
