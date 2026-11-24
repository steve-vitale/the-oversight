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

## Amendment #1 (2026-11-24 — pilot verdict; FROZEN before the judged leg)

**Pilot verdict: the premise was wrong.** Pilot = first 8 seeds
(109310–109317), 150d, RUN `tbrefuse-b`, exit 0. The instrument
recorded **0 true guard-refusals** (0 unclassified, 0
caller-unknown, 0 instrument errors) — no `startCombat` call on
the pilot band was ever made while a fight was live. The base
(bloodcluster) wrap on the same pilot seeds recorded **27
rebuilt-false `tbStarts` rows**, and **all 27 have `fightId:
null`** — `tbfight` was null BOTH before and after the call.
`rebuilt === false` does NOT distinguish a guard refusal from a
start that builds nothing for another reason. The bloodcluster
"92 refused TB starts" conflates the two. (Count clarification:
the 92 is the WAVE-4+ count; the all-wave total in the
bloodcluster corpus is 101. Per-seed rebuilt-false all-wave /
w4+: 109310: 3/3, 109311: 2/1, 109312: 32/29, 109313: 0/0,
109314: 1/1, 109315: 0/0, 109316: 0/0, 109317: 20/20, 109318:
4/2, 109319: 16/15, 109320: 7/7, 109321: 10/9, 109322: 0/0,
109323: 0/0, 109324: 1/1, 109325: 5/4.)

**Pilot no-op rows, classified by mechanism (debug + corpus
cross-check, not by the v1 instrument — v1 recorded none of
them):**
- **Titan-refusal (19 rows, all `herald`, seed 109317, days 83,
  90, 99–110, 112).** Proven by an innermost wrapper around the
  game chain (script `scripts/tbrefuse-debug-109317.js`, log
  `tbrefuse-debug-109317.log`): the call returns `null`, no
  throw, no fight built, and NO `tbEnd` fires during the call.
  Mechanism read in code: `titans.js` `titanWrapCombat` hard
  gate ("no solo titans", titans.js:43) — `startCombat` on a
  titan without a complete muster is HARD-REFUSED, returning
  `null` after saying the line once per titan per day ("does
  not notice you the way prey notices a hunter… You cannot
  face this alone — sound the call, muster N allied blades (you
  have M)"). `titanDefs()` = `titans.json` keys minus `_`:
  `{finale, nielsen, herald, the_network}` — of the pilot
  no-op mids, ONLY `herald` is titan-gated. The herald
  persisted in the world through 19 refusals and was killed on
  day 130 by villagers in the field (`aid-crisis`,
  `inTbFight: false`) — delayed/redirected, not lost.
- **Instant-resolve (7 rows).** The fight IS built and ends
  inside the `startCombat` call, during the opening-turns
  block (`game.js:36668–36675`: `tbBeginTurn()` then a
  synchronous `tbAdvance()` in node), so the post-call read
  finds `tbfight` null. `suburb` day 100 (109311): ended `won`,
  kill proven in `tbKillCtx` (fight `fmgpspk64_c2rba2`,
  killed by `mara_vasquez` via companion, `tbResult: won`) —
  the monster died in the opening round. `audit` day 73
  (109317) and day 111 (109314), `landlord` day 58,
  `cliffhanger` day 60, `cancellation` day 81, `strike` day
  98 (all 109312): each matches the seed's ONLY unmatched
  same-day `tbEnd` (`routed`, no kill context) — the monster
  fled/routed in the opening turns (`tbEndCheck`,
  game.js:47504: no monsters fighting but monsters alive →
  `routed`). The `audit` of 109314 was later killed day 137
  in the field (`aid-crisis`) — a routed monster (or its kind)
  is met again later.
- **Ambiguous (1 row: `glasswing` day 121, 109311, from
  `faceFeastDraw`).** Two unmatched `tbEnd`s that day
  (`routed` + `lost`); the corpus cannot tell which, if
  either, is the glasswing fight. A pure no-op with no fight
  and no end is IMPOSSIBLE from `startCombat`'s own body (the
  only top-level early return is the guard; the final return
  is `return this.tbfight`) — the only null-return paths are
  the finale/network/titan wrappers, none of which gates
  `glasswing` — so the glasswing is almost certainly an
  instant-resolve `routed` whose fight id the v1 instrument
  never recorded. The v2 instrument settles it by linking
  `tbEnd`s fired DURING the call to the call itself.

**Consequence for the judged band.** The judged phenomenon is
now ALL non-building `startCombat` calls (`rebuilt === false`
in the base wrap), split by call kind (frozen set):
- `guard-refusal` — a fight was live before the call
  (`tbfight && !tbfight.over`), the guard fired, no new fight.
  Distinguished by the GUARD line firing during the call (the
  guard always says its line).
- `titan-refusal` — no fight built; the titan hard gate
  returned `null` (mid is a titan, the titan line fired during
  the call, or the line was deduped and the mid is a titan).
  No `tbEnd` during the call. The titan wrapper sits OUTSIDE
  the guard, so a titan call during a live fight hits the titan
  gate first — the LINE fired during the call is the
  distinguisher, not whether a fight was live.
- `instant-resolve` — no fight live; a fight WAS built and a
  `tbEnd` fired during the call (opening turns). The row
  carries the ended fight's id, result, and monster ids.
- `noop-unexplained` — no fight built, no `tbEnd` during the
  call, neither line fired, not a titan mid. This class is an
  INSTRUMENT/CLASSIFICATION FAILURE: any row in it fails bar
  1. It is kept as a fail-closed bucket, not assumed away —
  the pilot says it should be 0, and if the judged band
  produces one, the verdict is NO-GO on bar 1 and the
  mechanism hunt is the next blank (the v2 row carries the
  verbatim lines fired during the call, so the mechanism is
  namable from the row itself).

**Fate taxonomy, amended.** The v1 fate classes apply
unchanged to `guard-refusal` and `titan-refusal` rows (tagged
monster tracked by object identity; pending variants as
before). `instant-resolve` rows get their fate AT the call,
from the ended fight (no tagging — the monster was already
lifted out of the world by the start):
- `killed-in-opening` — ended `won` (or any result) with a
  kill for the ended fight id in `tbKillCtx`.
- `fled-in-opening` — ended `routed` / `fled` / `calmed` with
  no kill for the ended fight id.
- `lost-in-opening` — ended `lost` (the player went down in
  the opening turns).
- `instant-other` — any other ended result; a defined class
  (passes bar 1) but flagged for review in the evidence.
`noop-unexplained` rows are fate-tracked exactly like
guard-refusals (tagged, swept, finalized) — their fate is
reported, but the row still fails bar 1 on call kind.

**Player-visible verdict, amended.** Per row: `line-fired` /
`silent` is replaced by the verbatim lines fired DURING the
call (`linesDuringCall`, capped at 6, from the say/sysSay
wraps): the guard line for guard-refusals, the titan line
(once per titan per day) for titan-refusals, whatever the
opening turns said for instant-resolves (possibly nothing).
Bar 3 becomes: every row carries its `linesDuringCall`
(possibly empty — an empty list IS the verdict, `silent`,
and is reported as such, never as missing data).

**Bars, amended (frozen — judged band `tbrefuse-b-v2`):**
1. **Classification completeness** — every non-building start
   on every seed carries exactly one call kind from the frozen
   set and exactly one fate class; 0 `noop-unexplained`, 0
   `gone-untracked`, 0 rows without a fate. Expected ~27
   no-op rows on the pilot's 8 seeds scaled to the band
   (bloodcluster all-wave 101 on 16 seeds; pilot saw 27 on 8
   seeds — the anchor moved, so the count is a cross-check,
   not a bar).
2. **Caller taxonomy complete** — unchanged (0
   `caller-unknown`); applies to all four call kinds.
3. **Player-visible evidence** — every row carries
   `linesDuringCall` (empty = silent, stated); the titan
   line's firing count per titan per day is reported
   (dedup rule: once/day — the instrument counts firings,
   the game dedups speech).
4. **Kill accounting** — unchanged in shape: every no-op
   monster later killed is attributed to its channel
   (killed-in-opening vs field kill vs re-engaged-tb kill);
   not-killed-in-window is reported by fate class, with the
   delayed-vs-not-killed distinction stated, never collapsed.
   New: instant-resolve kills are NOT "delayed by a refusal"
   — they died in the opening round, and are reported as
   such.
5. **Instrument health** — unchanged (0 instrument errors;
   determinism: seed 109312 run twice yields identical no-op
   rows — seq, day, mid, caller, callKind, fate — and
   identical line counts).

**Pilot becomes smoke-only** (per the prereg's own rule: the
pilot forced an instrument change, so the judged band restarts
with the fixed instrument, RUN `tbrefuse-b-v2`, 16 seeds
109310–109325, 150d). The pilot corpus
(`tbrefuse-b-s10931{0..7}-tbrefuse-b.json`) is retained as the
smoke record and is NOT pooled with the judged numbers. The
determinism replay is seed 109312 under RUN
`tbrefuse-b-v2-replay`. Driver refuses to overwrite; per-seed
files carry `-tbrefuse-b-v2` in the RUN slot.

**Instrument changes (v2, `scripts/tbrefuse-b-instrument-20261124.js`):**
row creation on ANY non-building start (`!rebuilt`, not only
`beforeLive`); `callKind` assigned from (in order) tbEnd
fired during the call → instant-resolve, guard line fired →
guard-refusal, titan line fired → titan-refusal, titan mid →
titan-refusal (silent deduped gate), live fight before →
guard-refusal (defensive), else noop-unexplained;
`linesDuringCall` captured for every row; `tbEnd` wrap
records monster ids + result and stashes ends fired during a
startCombat call (with `duringStartCombat` on the tbEnd row);
instant-resolve fates assigned at row creation from the ended
fight + `tbKillCtx` join; `returnValue` recorded. The v1
refusal machinery (tagging, removeWorldMonster, fieldFight,
sweep, finalize) is untouched for guard/titan rows.

**Analyzer + proof test** are updated for the amended
taxonomy (new fixture cases: titan-refusal, instant-resolve
won/routed, noop-unexplained as a bar failure; the existing
guard-refusal fixtures are kept). Proof test re-run green
BEFORE the judged leg.

**Fix note (DIAG only — not landed).** The titan gate
refusing WILD herald fights is by design ("no solo titans"),
but it fires on every wild herald encounter with no muster —
19 refusals of one monster on one seed — and the feast-draw
path (`faceFeastDraw`) reports `{ok: true}` and consumes the
draw even when the start no-ops. Whether either is a defect
is a follow-up arm's question, preregistered separately; this
arm lands no fix.

