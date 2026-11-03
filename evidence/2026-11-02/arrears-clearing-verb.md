# Arrears-clearing verb — gap-arrears (2026-11-02)

## The gap, as diagnosed

On a Haven-primary link (another village bows to Haven), tribute arrears
never cleared. The weekly tick (`linkTick`, Haven-primary branch) only ever
settled the *current* week's tribute: a fat-pantry subordinate paid the
week, and the old debt sat untouched on the ledger forever. No verb
existed to pay it back, forgive it, or renegotiate it — renegotiateLink
and bidForPrimacy are subordinate-Haven verbs and only change the future
rate, never the old debt. Worse, re-linking inherits the debt (debts
survive the break, by design), so the dead ledger followed the pair
across breaks. The one existing "clear" — bidForPrimacy's flip burning
the books — only fires when Haven itself flips from subordinate to
primary, which is a different road entirely.

Scope note: this arm covers Haven-**primary** arrears only. The mirror
direction (Haven as subordinate) already clears on a full week's
payTribute — and does so *for free*, wiping old arrears without
back-paying them. That is a separate honesty hole; it is NOT changed
here, and is held for a separate arm (see Held, below).

## The verb picked: back-payment call + forgiveness (combination)

Standing intent, not invention:

- **Back-payment first, because tribute is real food.** Canon law in
  hierarchy.js: "tribute is real food" and "their fields pay" — a
  subordinate's tribute is debited from *their* pantry, never minted.
  So the call-in verb collects real food from the subordinate's own
  pantry, after that week's tribute, week by week, until clean. No new
  numbers: the weekly rate is untouched, and the national ×1.25 routing
  applies exactly as it does to weekly tribute (the ledger counts what
  they *sent*, pre-route, matching how shortfalls accrue).
- **Forgiveness second, because a starving fire can never back-pay.**
  A call-in alone leaves the loop open for exactly the villages most
  likely to owe: empty fields mean the debt waits forever. Mercy is
  already a played choice in canon (the Iron Court's MERCY, the
  feast-court's generosity), so forgiving the ledger is in-fiction —
  and its cost is honest: the food forgone, said aloud with the amount.
- **Renegotiation alone was rejected:** it changes next week's rate,
  not last year's debt, so it cannot close this loop.

No gate or amount was retuned. The BELONG bar (trust 50, arrears 0,
14 days) is unchanged — this only supplies a path to reach arrears 0.
Weekly tribute rates, the ×1.25 routing, and the seasoned bars are
untouched.

## What a player does (plain words)

On the Haven panel, under a village that bows to Haven, an old debt now
shows as a line — "Old debt: 3,000 kcal" — with two buttons:

- **Call in the old debt.** Haven sends word that the old debt is due.
  Nothing moves that day. In the following weeks, after that week's
  tribute is paid, the subordinate's wagons carry whatever their fields
  can spare against the old debt, until the books are clean. If their
  fields are empty, the debt simply waits — no extra punishment, because
  hunger isn't defiance (the weekly shortfall already charged).
- **Forgive the old debt.** Haven wipes the ledger as mercy. That grain
  will never arrive — that is the cost, said aloud with the amount —
  and the village trusts Haven more for it (+6 trust).

Trust effects, all named (no silent moves):

| Event | Trust | Said as |
|---|---|---|
| Old debt fully back-paid | +3 (the payTribute full-week number) | "the ledger is clean" |
| Partial back-payment | no change (they tried) | "all their fields could spare" |
| Empty fields on a called-in debt | no extra change (weekly shortfall already charged) | "hunger isn't defiance" |
| Forgiveness | +6 | "mercy costs what it costs", with the kcal forgone |
| Either verb during mourning | gain choked (grief is not bought off); the ledger action still stands | "the trust waits" |

Both verbs are blocked for exiled / joined-away answerers, like
tendLink — Haven's ledger can't be pledged from the road. A staged
call-in dies with a broken link; a re-formed link inherits the debt
but not the call, so the new table must call it in fresh. A
deposit-gate waived week (shelves full, wagons waved home) defers
collection exactly like it defers tribute.

## Proof: scripts/test-arrears-clearing.js (node, not jest)

Identical fixture in both runs: one Haven-primary link, weekly tribute
2,000 kcal, trust 30, subordinate pantry as stated; the subordinate's
own week sim is stubbed so the pantry numbers the collection reads are
exact (the collection itself is the real engine path, driven by the real
linkTick).

BEFORE (unmodified tree, /tmp check, same fixture):
- `typeof Game.callInArrears` = undefined, `typeof Game.forgiveArrears`
  = undefined — no verb existed.
- Fat-pantry week (subordinate pantry 9,000): weekly tribute arrived
  (Haven pantry +2,000, trust 30→31, subordinate pantry 9,000→7,000)
  but arrears stayed **3,000 → 3,000**. Confirmed: never clears.

AFTER (this branch, 33 passed, 0 failed):
- Guards: no-arrears / unknown-link / subordinate-direction links all
  refuse without changing state.
- No-verb control: arrears 3,000 → 3,000 across a fat-pantry week —
  the verb is the mechanism, not an auto-clear.
- Call-in, fat pantry (9,000): weekly 2,000 + back-payment 3,000;
  arrears 3,000 → 0, call flag clears, subordinate pantry 9,000 → 4,000,
  Haven pantry 5,000, trust 30 → 34 (+1 weekly, +3 settlement).
- Call-in, thin pantry (2,500): back-payment 500; arrears 3,000 →
  2,500, call stays out, Haven pantry 2,500, trust 30 → 31.
- Call-in, empty pantry (0): weekly shortfall accrues as before
  (3,000 → 5,000), call stays out, no double penalty.
- Forgive (4,000 owed): returns 4,000, arrears → 0, trust 30 → 36.
- Forgive during mourning: arrears → 0, trust stays 30 (gain choked).
- UI: both Haven-panel buttons render and are wired (static check on
  app.js; the panel itself was not clicked in a live browser — see
  Held).

## Files changed

- `src/js/hierarchy.js` — `callInArrears`, `forgiveArrears`, the
  linkTick collection block, ontology `provides:` entries, two rules
  (`arrears_can_be_called_in`, `arrears_can_be_forgiven`), and
  `_blockIfNotHaven` entries for both verbs.
- `src/js/app.js` — Haven-panel "Old debt" line with Call in /
  Forgive buttons (Haven-primary links with arrears > 0 only) + click
  wiring, same pattern as tendLink.
- `scripts/test-arrears-clearing.js` — the proof above.
- This evidence file.

## Held, with reason

1. **Haven-subordinate arrears wipe (payTribute zeroes arrears on one
   full week, without back-payment).** Real, but the mirror direction
   and a different fix (charge back-payment before wiping, or keep the
   wipe as designed generosity). Changing it here would alter live
   BELONG-road behavior beyond this arm's brief; flagged for a
   separate arm, not silently fixed.
2. **Live-browser click proof of the new panel buttons.** This
   subagent cannot operate a live browser; wiring is verified
   statically (button + onclick present in app.js) and the engine
   verbs are proven. If the coordinator wants a clicked-button
   receipt, it needs a browser-capable pass.
3. **`check.js --quick` not run**, per the task (coordinator runs it
   serialized at merge). `node --check` passed on both edited files
   and the proof script; the proof itself ran green (33/0).

## Infrastructure notes for the coordinator

- Worktree registration took ~25 minutes: the registry lock was held
  by a queue of sibling gap-round registrations, then by a slow reap.
  Base is current master at registration time (29d3366ad; the task's
  a63ffc8c9 is an ancestor of it).
- EPERM flap, twice: (a) the first `cp` of the proof script created a
  0-byte file then failed; a retry after a short wait succeeded
  byte-complete (8,242 bytes, `node --check` clean). (b) Two
  worktree-heartbeat attempts failed writing the registry temp file
  (PermissionError); the registry entry itself is intact
  (heartbeat_at = creation, 2026-11-03T03:55:43Z) and the tree is
  minutes old, far inside the 4h stale threshold — but the heartbeat
  should be re-verified before the tree is left to sit.
- Main tree untouched for edits; no live/held trees touched.
