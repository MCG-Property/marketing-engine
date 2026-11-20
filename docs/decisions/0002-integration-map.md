# 0002 — Integration map

Date: 2026-11-20
Status: phase 1 baseline

Source of truth in code: `src/baseline/access.ts`. Nothing in this list is connected.

| System | Status | Note |
|---|---|---|
| Facebook | manual | Not connected. |
| Instagram | manual | Not connected. |
| Buffer | missing | Not selected. |
| Meta direct publishing | missing | Fallback only. Not connected. |
| Google Business Profile | manual | Manual until access exists. |
| GA4 | missing | Not connected. |
| model provider | missing | Not connected. |
| listing source | manual | Manual records only. |
| approval transport | unassigned | Channel not chosen. |
| database host | unassigned | No hosted database. |
| dashboard host | manual | Local process only. Not deployed. |

Nothing in the table is connected. The local send path now does both conditions, and it still does not call a network:

- S0-1: reserve `publication.idempotency_key` before an adapter call.
- S0-2: load `kill_switch` through `killSwitchesFromRows` on that path.

The publish switch stays off. The dashboard listens on `127.0.0.1` only.
