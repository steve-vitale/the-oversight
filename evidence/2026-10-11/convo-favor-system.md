# Favor Obligation System — evidence 2026-10-11

**Task:** Design and implement a ROBUST favor system for The Oversight's conversation
engine — structural, not a patch. Steve's directive: "Fix structurally. Design a
system that's robust."

## The defects (from journey-landing.md sense-read)

1. `ask_favor` never concretizes: "I need an extra pair of hands tomorrow. Nothing
   dangerous" repeated VERBATIM 7× in one conversation. The favor defs were
   contentless — no actual task, time, or place.
2. FALSE ENGAGEMENT: the conversation resolved `engaged` without the player ever
   choosing "I'll do it." The resolution flag lied about a commitment that never happened.

## Root causes (verified in code + live transcript)

- `ask_favor` drew from 4-entry string pools via `convoPickCycle`, which **resets when
  exhausted** — verbatim repetition was built into the mechanism. A favor was a line,
  not an object.
- The post-turn hook in `conversation.js` engaged **whatever want was live** on any
  `ans:`/`react:`/`gq:` choice — answering an unrelated generic question "engaged" a
  favor want → `convoResolveWant` defaulted to resolution `'engaged'` with no commitment.
- `dlg:details` called `engageBeat` unconditionally and **ignored `sayLine`'s null
  return**, displaying the blocked repeat anyway (the 7× vector).
- `dlg:commit` ("I'll do it") set resolution `'promised'` but created **no tracked
  obligation** — the promise evaporated into a future dialogue line.

## The design: favors as obligation instances

Favors are now **obligation instances** with a real lifecycle:

```
need (pure scan of live state)
  → asked (stated once, lines generated per-instance and stored)
    → promised (tracked obligation w/ deadline + journal entry)
    → fulfilled | broken
    → stated (heard, no commit — plants a thread seed; the NPC remembers)
    → deflected (refused — trust cost, deflected memory, 3-day cooldown)
```

**7 favor kinds**, each grounded in live village state:
- `food_share` — hunger > 75 (severity from actual hunger value)
- `water_haul` — clean water < 15L (liters named in the ask)
- `snare_mend` — hunter occupation + low energy
- `watch_shift` — energy < 50 (exhausted watcher)
- `stay_close` — fear > 75
- `heal_help` — health < 80
- `forage_help` — pantry < 2 days (kcal named)

Each kind maps to a `promiseKeepKind` goal (`feed`/`prove`/`belong`/`heal`) so the
existing `checkPromises` fulfillment infrastructure works.

**Structural guarantees:**
- `ask_favor.pick` returns **0 when no real need exists** — contentless favors are
  structurally unselectable, not just unlikely.
- `'engaged'` is **unreachable for favors**: `defaultResolution` returns `'stated'`
  for heard-but-not-committed; only `dlg:commit` sets `'promised'`, and only when
  `convoFavorCommit` actually created the obligation.
- Obligations live in `v.promises[vid]` with `favorId`/`favorTask`/`favorDeadline`;
  one open commitment per villager (favor or formal vow).
- Favor deadlines (1–3 days) override the 7-day promise rot window in `checkPromises`;
  kept/broken narration names the concrete task.
- Follow-ups: `stated` plants `{wantId:'ask_favor', favorId}` seed; the opener generates
  "About {short} — still need hands. Are you in?" instead of resetting. The seed takes
  priority over the generic topic-ledger resume.
- Favor lines generated **once per instance** via slot composition (opener × detail ×
  anchor, keyed by `hash(vid|day|seq)`) — never pooled, never re-rendered. The
  per-conversation and run-wide no-repeat ledgers provide defense in depth.

## Proof: `scripts/test-favor-system-20261011.js`

**30/30 passing across 5 seeds** (20261011, 12345, 99999, 424242, 777).

- (a) No contentless favor: `convoFindFavorNeed` returns null with no real need
  (30 scans); `ask_favor` never selected without a real need (40 picks).
- (b) `engaged`/`promised` unreachable without `dlg:commit`: drove 5 non-commit paths
  (help+leave, details+leave, help+details+leave, help+decline, answer+leave) — none
  set engaged/promised or created an obligation. Heard-but-not-committed resolves
  `'stated'`; stated favor plants a thread seed with the favor id.
- (c) `dlg:commit` creates a tracked obligation: concrete task + deadline, correct
  keepKind mapping, journal shows it as open, repay follow-up seed planted.
- (d) No verbatim repetition: no villager repeats favor text twice running across
  a 6-day sim (slot-composed lines, hash-keyed per instance).
- (e) Honest resolution: fulfilling the keepKind keeps the obligation (trust up);
  past the favor deadline it breaks (trust down, favor marked broken); declining
  resolves `'deflected'` (trust cost on the decline itself, no re-ask seed, deflected
  memory written).
- (f) Follow-up remembers: next-day opener names the prior ask ("About the food they
  needed — still need hands. Are you in?"); menu goes straight to commit/deflect.

**Regression suites:** dialog-gating ALL GREEN, dialog-leakfix ALL GREEN,
dialog-coherence 37/37, dialog-stream 43/43.

## Before/after transcripts (same seed 20261011)

See `favor-before-transcript.md` (old code) and `favor-after-transcript.md` (new code).

**Before:** "I need an extra pair of hands tomorrow. Nothing dangerous" × 7, resolved
`engaged` with no commit.

**After (Scenario 1 — hear them out, walk away):**
> NPC: "I hate to ask, but do you have anything to eat? Anything at all? I can't keep going like this."
> YOU: "How can I help?"
> NPC: "I haven't eaten right in days. I can't pull my weight like this. Anything you can spare, I'll make it stretch."
> FINAL: resolution=stated (heard, not committed — NOT "engaged")
> seed planted: {"wantId":"ask_favor","favorId":"favor-gen_lyzzr2f-1-1"}

**After (Scenario 2 — next day follow-up):**
> NPC: "About the food they needed — still need hands. Are you in?"

**After (Scenario 3 — "I'll do it"):**
> FINAL: resolution=promised (explicit commit)
> obligation: {"favorTask":"share food with Rocco — they're past hungry","favorDeadline":3}
> journal: {"text":"share food with Rocco — they're past hungry","status":"open"}

## Files changed

- `src/js/convo-wants.js` — FAVOR_KINDS (7 kinds, slot-composed builders), favor
  lifecycle methods, rewrote `ask_favor` and `repay`, `defaultResolution` hook,
  `seedFavorId` plumbing.
- `src/js/conversation.js` — want-aware post-turn engagement hook; seed priority over
  resume; `seedFavorId` preserved in `c.want`.
- `src/js/convo-dialogue.js` — favor-aware `dlg:commit` (blocked case honestly refuses);
  new `dlg:renounce`; `dlg:details` respects `sayLine` null.
- `src/js/game.js` — favor-aware `checkPromises` (favor deadlines, task-naming).
- `src/js/journal.js` — kept/broken journal text prefers `favorTask`.
- `scripts/test-favor-system-20261011.js` — 30-assertion proof test.
- `scripts/dump-favor-transcript-20261011.js` — transcript capture.
