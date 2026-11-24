# What happens to a refused TB start? — Loop B, run fleshout-loop-b-20261124T1430Z, arm sim-tbrefuse-b (DIAG)

Axis: winnability chain (re-point 2026-11-03). DIAG-ONLY arm: zero
src/js changes. This arm answers bloodcluster
(evidence/2026-11-24/sim-bloodcluster-b.md) §Next blanks #4: on the
16-seed band 109310–109325 (150d, competent verbatim) the
bloodcluster instrument's refused-start flag counted **92
`startCombat` refusals** — a second fight is refused while one is
already live. The refusals were counted as rebuilt-only starts by
the fixed instrument, so no kill is lost in the counting, but the
refusal itself is common enough to be a behavior question: what
does the player (or the villager brain) see when the second fight
refuses, and does the refused fight's monster wait, wander, or
vanish?

Anchor: HEAD `003f86c9f` (branch sim-tbrefuse-b) at prereg time.
Instrument: the bloodcluster instrument
(`scripts/bloodcluster-b-instrument-20261124.js`) reused VERBATIM
as the base (daily snapshots, killEvents, deathEvents, fieldFights,
tbStarts with the rebuilt flag, tbKillCtx) plus a NEW thin
instrument (`scripts/tbrefuse-b-instrument-20261124.js`) that traces
refusals to their fate — both call-through, RNG-neutral, zero
src/js. Driver (`scripts/tbrefuse-b-driver-20261124.js`, run
`tbrefuse-b`) and analyzer (`scripts/tbrefuse-b-analyze-20261124.js`)
are new. Proof: `scripts/test-tbrefuse-b-20261124.js` (analyzer
fixtures + live harness refusal smoke + determinism replay leg),
green BEFORE the judged leg. The bloodcluster corpus CANNOT answer
this question: it carries refusals only as `tbStarts` rows with
`rebuilt === false` (day, mid, wave, stale fightId) — no caller,
no refused-monster identity, no fate, no say-line capture — so the
band is REPLAYED with the new instrument. The bloodcluster corpus
is NOT pooled with this arm's numbers and NOT re-judged; its
refusal count (92) is the expected-count cross-check (secondary,
not a bar — the anchor moved since bloodcluster).

Policy: `scripts/policies/competent.js` `{competent}` VERBATIM,
default env. Horizon: 150 days, death-aware (the judged 150d
corpus). Seeds: 109310–109325 (16) — a DELIBERATE REPLAY of the
bloodcluster / vetpair / standingconfirm band for comparability.
Band freshness in the "unused band" sense does NOT apply: this is
a replay measurement, not a fresh confirm. New per-seed files
carry `-tbrefuse-b` in the RUN slot, under
`evidence/2026-11-24/perseed-tbrefuse-b/`; the driver refuses to
overwrite. Balanced panel (§15): INAPPLICABLE for the
decomposition itself (a census, no before/after change); the
analysis JSONs are attached instead. No comparison is fabricated.

## Substrate check (§14b — before the pilot leg)

The phenomenon IS staged on this substrate: the bloodcluster
corpus (same band/policy/horizon) counts 92 refused TB starts on
16 seeds — about 6 per seed, frequent enough to classify every
refusal and contrast fates. Horizon: refusals on this band fall
wherever TB fights overlap, inside 150d. Staging: pilot = first 8
seeds (109310–109317) as the smoke leg (recorder fires, refusals
classified, caller taxonomy populated); confirm = remaining 8
seeds (109318–109325). Both legs judged against the SAME frozen
bars below; the verdict is on the full 16. If the pilot forces an
instrument change, the judged band restarts with the fixed
instrument and the pilot becomes smoke-only (stated here, not
decided mid-run).

## Refusal site (read, not guessed — src/js/game.js)

`startCombat(monsterId, options)` (game.js:36039): NO SILENT
CLOBBER (break-it combat 2026-10-09) — if `this.tbfight &&
!this.tbfight.over`, it says `Already in a fight — finish this one
first. (startCombat refused: a fight is live.)` and returns
without touching the world monster, the pending encounter, or the
live fight. The refused monster therefore stays wherever it was;
the open question is what happens to it next. The callers that can
reach the guard while a fight is live (read from the call sites):
`monsterTurn` (game.js:24871/24888/24913/24997/25035/25068/25085/
25130 — a world monster steps onto the player tile mid-fight),
the trap trigger (game.js:24721), the waiting-monsters claim
(game.js:12847), `faceFeastDraw` (feastBuff.js:763), the contest
arena (`_contestArena`, contests.js:4824/4848), and the player
pressing Fight (app.js — not reachable in sims; the competent
policy guards `inCombat()` before encounters). The instrument
names the caller from the live stack, never from this list — the
list is the hypothesis, the stack is the verdict.

## Definitions (frozen — no mid-run taxonomy drift)

- **Refusal** = one `startCombat` call made while a TB fight is
  live (`tbfight && !tbfight.over` before the call) whose call
  returns without building a new fight (`tbfight.id` unchanged
  after the call). A `startCombat` that throws (unknown id) is an
  instrument error, never a refusal. A call while `tbfight.over`
  is true builds a new fight and is not a refusal.
- **Refused monster** = the monster the refused call was for:
  `monsterId || pendingMonsterId` at entry, plus the player-tile
  world monster object (`playerMonster()`) when one matches that
  id. The instrument TAGS the world monster object at refusal
  (`__tbrefuse` list of refusal seqs — a diagnostic-only marker
  on the object, read by no game code, consuming no RNG) so its
  later fate is tracked by object identity, not by species id.
  A refusal with no matching world monster (pending / contest /
  trap / arena instantiation) is a **pending-refusal**: its fate
  is tracked by pending id + later successful start, not by
  object identity.
- **Live fight at refusal** = the `tbfight` blocking the start:
  its id, its monster id (first monster fighter), its result when
  it later ends (`tbEnd` wrap). The refusal row records the live
  fight's id so refusals cluster into episodes per live fight.
- **Caller class** (from the live stack's first game frame,
  frozen set + an honest `other-<fn>` bucket): `monsterTurn`,
  `trap`, `waiting-monsters`, `feast-draw`, `contest-arena`,
  `policy`, `other-<fn>`. A refusal whose stack names no game
  frame is `caller-unknown` — that is an UNCLASSIFIED-equivalent
  and fails bar 2.
- **Fate class of a refusal** (exactly one per refusal):
  `re-engaged-tb` (the tagged monster is later lifted into a
  successful TB start — detected in the `removeWorldMonster`
  call inside a successful `startCombat`, object identity; or,
  for pending-refusals, a later successful start consumes the
  same pending id); `killed-field` (the tagged monster object is
  passed to `fieldFight` and killed there); `removed-vanished`
  (a `removeWorldMonster` call on the tagged object outside any
  `startCombat` — sub-reason from the object at removal:
  `lostSight` when `lostSight > 6`, `fearful-gave-up` when
  `fearTurns >= 4` without a fledMonsters entry, `other` with the
  stack recorded); `removed-fled-across` (fearful branch: the
  monster fled across the boundary into `state.fledMonsters` —
  detected by a fledMonsters entry with the same id at removal
  time); `still-waiting-at-end` (the tagged monster is still in
  `worldMonsters()` at end of run); `pending-resolved` (a
  pending-refusal whose pending is later consumed by a
  successful start or cleared without a fight — the how is
  recorded); `pending-unresolved-at-end` (a pending-refusal
  still live or vanished without a recorded resolution at end of
  run); `gone-untracked` (the tagged monster left
  `worldMonsters()` with no recorded removal, kill, or lift —
  an instrument gap, counts as UNCLASSIFIED and fails bar 1).
- **Episode** = all refusals blocked by one live fight id (same
  seed). Refusals per episode and the refusal line's firing count
  per episode are reported (the refusal `say` is a plain `say`,
  not `sayOncePerFight` — it can fire every tick while the
  monster sits on the player tile).
- **Player-visible verdict** (per refusal): `line-fired` (the
  `Already in a fight` line fired during the refused call —
  captured by the say wrap) or `silent` (no such line fired
  during the call). The ring buffer keeps the 6 say lines around
  each refusal for the sense-test read.
- **Kill lost vs delayed** (frozen reading): a refused monster
  that is later killed in ANY channel (`re-engaged-tb` then a
  kill, or `killed-field`) is DELAYED, not lost. A refused
  monster that is never killed in-window (`removed-vanished`,
  `removed-fled-across`, `still-waiting-at-end`,
  `pending-unresolved-at-end`) is NOT-KILLED-IN-WINDOW — reported
  with its fate, never re-scored as lost without the qualifier.
  No kill is counted lost on the basis of a refusal alone.

## Pre-registration (binding, §11/§14) — FROZEN BARS

DIAG-GO requires ALL of:

1. **Classification completeness** — every refusal on every seed
   carries exactly one fate class; 0 unclassified band-wide
   (`gone-untracked` = 0; every refusal row has a non-null fate).
   Expected ~92 refusals (bloodcluster count).
2. **Caller taxonomy complete** — every refusal carries a caller
   class from the frozen set; 0 `caller-unknown`, 0 refusals
   without a recorded stack frame.
3. **Player-visible evidence** — every refusal carries a
   visibility verdict (`line-fired` / `silent`); the refusal-line
   firing count per episode is reported; 0 refusals without a
   verdict.
4. **Kill accounting** — every refused monster that is later
   killed is attributed to its channel (re-engaged-tb kill vs
   field kill vs other); the count of refused monsters
   not-killed-in-window is reported by fate class, with the
   delayed-vs-not-killed distinction stated, never collapsed.
5. **Instrument health** — 0 instrument errors; determinism —
   seed 109312 run twice on this anchor yields identical refusal
   rows (seq, day, mid, caller, fate, fateDay) and identical
   refusal-line counts; every `waveKillLog` row cross-checks as
   in the bloodcluster base (0 unlinked kills).

Secondary rates (recorded, NOT judged — a move here is a
metric-review note, not a bar failure): refusals per seed and per
live-fight episode; refusal-line firings per episode (spam
check); median ticks/days from refusal to re-engagement; share of
refusals by wave (wave-4+ vs lower); scale-wall numbers
(national / table / wins, wave 4–5 unlocks, median survival).

## Instrument limits (stated up front, not discovered mid-run)

- Fate is tracked by object identity for world monsters and by
  pending id for pending-refusals. A monster that crosses a tile
  boundary via the fearful branch is tracked through the
  fledMonsters entry (id + hp), not object identity — a second
  refusal of the same fled monster on its new tile is a new
  refusal row, linked by id in the analyzer note, not merged.
- The daily snapshot sweep checks open refusals once per day;
  fate-day resolution is to the day for snapshot-resolved fates
  and exact for event-resolved fates (removal / lift / field
  kill / tbEnd) — the analyzer reports which is which.
- The say ring buffer keeps 6 lines around each refusal; it is
  not a full transcript. The sense-test reads the captured lines
  plus the bloodcluster `saySample` around refusal days.
- TB party size and kill linkage come from the bloodcluster base
  unchanged; this arm adds no new kill accounting.
- No fix is landed in this arm even if the refusal turns out to
  be a defect: a fix is preregistered separately as a follow-up
  arm (per the task brief).

## Sense-testing law

Transcripts are read: the richest refusal episode on the band is
told in plain words — what the live fight was, what walked in
while it was live, what the player saw (the line, or silence),
how long the refused monster waited, and what happened to it —
and one pending-refusal episode (feast draw / contest / trap, if
any) is told the same way. Lines are quoted, judged for meaning
and coherence, never just counts.

## Deliverables

- This prereg, committed BEFORE any judged sim.
- Per-seed JSONs under `evidence/2026-11-24/perseed-tbrefuse-b/`
  (16 files + 1 determinism replay file, `-tbrefuse-b` in the
  RUN slot).
- Evidence `evidence/2026-11-24/sim-tbrefuse-b.md`: refusal
  classification with counts, caller table, fate table,
  player-visible verdicts, kill accounting (delayed vs
  not-killed-in-window), village assessment in plain words,
  blanks filled or documented, next blank named, scale-wall
  numbers (national / table / wins, wave 4–5 unlocks, median
  survival), a "metric review" section (§14).
- New gap found outside this arm → append to
  `hidden_files/sim-findings.md` in its format; do not chase it.
- Zero src/js changes. No push, no bump, no live verification, no
  merge (coordinator merges --ff-only; ship loop owns deploys).
- No second band / no confirm-of-confirm without coordinator
  say-so.
