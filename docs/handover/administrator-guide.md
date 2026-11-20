# Administrator guide

The staff page is `http://127.0.0.1:8787/`. The admin page is `http://127.0.0.1:8787/admin`. The staff page does not link to it.

Roles are READ, WRITE, PUBLISH, and ADMIN. A missing role is READ. READ cannot save a review, a visibility check, or a metric. WRITE, PUBLISH, and ADMIN can record those. Sending a post or a customer reply still stays closed while the switches are off.

The admin page lists each switch as on or off. It also lists alert names. It does not show a control that turns a switch on. Changing a switch is a separate database change during a supervised test, not a staff action.

Channels are Facebook and Instagram. Google and website analytics stay manual until an account is connected. Blank metric fields stay zero and are labelled manual only after they are saved.

Do not paste a token, a database URL, or a customer message into either page.
