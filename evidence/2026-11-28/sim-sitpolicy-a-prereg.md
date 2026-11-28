# sim-sitpolicy-a — prereg (teach the competent policy to SIT)

**Arm:** sim-sitpolicy-a · **Loop A run:**
fleshout-20261128T0815Z · **Axis:** scale-onramp (the scale wall)
**Type:** POLICY-ONLY mechanism arm (one new policy file;
zero src/js changes — every verb called already exists in the
engine and is called through it, never re-implemented)
**Prereg frozen:** 2026-11-28 ~09:04 UTC, before any judged sim
**Branch:** `sim-sitpolicy-a` (worktree
`~/workspace/worktrees/sim-sitpolicy-a`).
**Base:** master tip `aa3860792b17abfaa755b40bc893267dd40069f9`
(journey-deepening r293). The seatvoice voicing fix (GO,
2026-11-28) is IN this base: delivery lines now read "The deed
is done — the seat still waits on the deeds." when the gate is
closed — the sit policy will hear the honest lines, not the
leg-2 overclaim.
**Canon read:** docs/CANON.md, docs/TABLE.md (seat bars, seven
paths, overtime, win-day floor), docs/MONSTER-WAVES.md (wave
law; the deed gate's fought-distinct bars). **No canon doc
covers the scale-rank inputs** — sim-scalerank-a measured them
from code; nothing about scale inputs is invented here.

## §0. The question

The competent policy has no sit verb. The scalecensus
(113101–113108) measured the road TO the seat — lesser seat
8/8, days 44–67 — and then watched the bot wait 58–108 days
for a better seat that never comes: seated 0/8, wins 0/8.
Capstoneready leg 1 + leg 2 proved the delivery verb
(delivered 2/8 on 113301–113308, day-exact on the predicted
seeds) and showed that on both delivery seeds scale is the
ONLY unmet full-seat bar. Scalerank proved national 0/8 is a
game wall on the link road (one link per village, no polity
ever qualifies, no court beat ever stages). The 0515Z round
record names this arm explicitly: "Sitting policy + national
road — the seat, at last: on both delivery seeds scale is the
only unmet bar; the sibling scalerank-a arm is the live
attempt at the road, the sitting policy is the missing half."

This arm supplies the missing half: a policy that sits when
the lesser seat is offered, waits through the wait, delivers
the capstone when it reads deliverable, answers court beats
when staged, and keeps feast-bundle contributions going —
and then PLAYS the table it sat at, through whatever doors
the run actually earned. The full seat is NOT expected on
this band (national is a game wall; scalerank). The question
is whether a lesser seat, sat and played, wins — or what the
played lesser paths do instead.

## §1. Frozen bars — GO / NO-GO

Primary metric: the scholar sits at the table, and the
capstone gets delivered, on a fresh 8-seed band.

| Bar | Threshold |
|---|---|
| (a) Seated | scholar sits (pg.tableDone, seat taken) on **≥4/8** seeds |
| (b) Capstone delivered | a capstone delivered on **≥2/8** seeds (the capstoneready bar) |
| (c) Instrument errors | 0 |
| (d) Snapshot coverage | ≥ 0.95 (complete gate/seat/readiness block per snapshot) |
| (e) Reconciliation | 0 mismatches (stored vs recomputed bars) |
| (f) Determinism | one full-150d seed re-run byte-identical to its pilot file |
| Pool floor | ≥6/8 alive day 80 |

**GO** requires (a) AND (b) AND (c)–(f) AND the pool floor.
A miss on any frozen bar is NO-GO — never re-scored against
a friendlier metric mid-run (§14).

**CORRECTION to the task's suggested threshold, from code:**
"seated by ~day 70" is impossible — `tablePreview()` returns
null before day 90 (`winDayFloorOk()`, src/js/table.js:940,
1253). The seat can first be taken on day 90, the day the
table is announced. Bar (a) is therefore "seated on ≥4/8
seeds by day 150", with the sit attempted on the first ready
dawn on/after day 90. The lesser seat itself is earned
earlier (days 44–67 on the census band); the wait to day 90
is the floor, not the policy's choice.

**Wins are the headline secondary, NOT a GO bar.** A win
rides on the path challenge's ledger-priced strength, which
the policy does not control; requiring a win would judge the
sitting mechanism by the run's build. Wins (any win via a
lesser path, and on which path/branch) are reported in full
— a first competent-band win via sitting is the result the
axis is waiting for — but they do not move GO/NO-GO.

Secondary metrics (reported, never judged): national/table/
wins, wave reach 1–5, median survival, sitting count + seat
day + seat kind + path walked + branch per seed, capstone
deliveries per kind, feast-bundle buy-outs, court answers
per shape, feast-bundle progress, death-cause shares
(instrumented on this band — the scalerank death recorder
is reused in shape: named causes from the roster record,
reported null if the recorder cannot name them, never
faked).

## §2. THE ADDITION — frozen policy rules (do not tune)

New policy file `scripts/policies/competent-sit.js`.
Base: competent verbatim. The sit policy wraps competent
and adds exactly the dawn verbs below, in this order, at
the START of daily() — dawn, at Haven, before
competent.daily() runs the day's trips (the capstonedeliver
placement, proven by leg 2) — plus the wait leg after
competent.daily(). No other change to competent's day.

1. **Court beats.** If `state.pendingNational` is staged,
   answer it with the frozen per-shape mapping, copied
   verbatim from sim-answercourt-b / leadcourt.js: lead →
   'feast', conquest → 'mercy', belong → 'swear',
   covenant → 'pact', trade → 'sign'. Unknown shape → do
   NOT answer (count an instrument error). 'refuse' and
   'walk' are NEVER chosen. `pendingGlobal` beats are NOT
   answered (same isolation as answercourt-b: a global beat
   can only stage after national is live, which cannot
   happen on this band per scalerank; if one ever stages
   it is recorded as a finding).
2. **Feast bundle.** If the feast_embassy reads not-ready
   with reason 'no-bundle-feast' (bundle false) AND the
   pantry holds ≥ 16,000 kcal (`pantryKcalLive`, i.e. the
   8,000-kcal buy-out cost plus a full buy-out's worth in
   reserve — the village is never bought into famine) AND
   the scholar is at Haven, call `feastBundleBuyOut()`
   once. Log every attempt (day, ok, why, spent,
   bundleStage). A refusal from the engine is logged, not
   retried the same dawn.
3. **Capstone delivery.** Deliver the FIRST kind that
   reads deliverable, in fixed order military_tribute →
   trade_charter → feast_embassy, at most one delivery
   attempt per dawn. Deliverable = ready AND, for the
   tribute, payable ≥ 2 (the scholar-veteran split:
   ready with payable < 2 stays undelivered — the
   2026-11-10 ruling, working as designed). Charter/feast
   deliver on ready alone (the delivery takes no payment).
   Log every attempt (day, kind, ok, reason, veterans,
   names). Never deliver twice (a delivered capstone
   reads not-ready with reason 'delivered').
4. **Sit.** If `!pg.tableDone`: read `tablePreview()`.
   If it is ready, call `tableTakeSeat()` (as the player
   character — no sitter choice; the seat-taker sheet is a
   player decision, not a bot verb) and, on ok, drain the
   table modal (rule 5). If the preview exists but is not
   ready, record the why and retry next dawn. If the
   preview is null (before day 90, or no seat priced),
   nothing is attempted. The sit is attempted on the
   FIRST ready dawn — the policy never waits for a better
   seat once the preview is ready.
5. **Table drain (the played table).** While
   `scholar.tableChoices` has options: pick ONE option
   per iteration, cap 30 answers per dawn, stall guard
   (same modal signature twice running → stop), break on
   Game.over and on a live `tbfight`. Pick rule, frozen:
   the FIRST presented option — EXCEPT (a) a
   'conscript:*' option is never accepted: pick
   'conscript:no'; (b) a trial opt-in ('beat:trial') is
   never taken: pick the first NON-trial option instead
   (trial-by-combat is the one opt-in existential risk;
   the proven win track never needs it); (c) a 'seat:*'
   option picks the player character's own id
   (`Game.villagerId`) when present, else the first
   option. Branches stay ledger-earned — the drain NEVER
   overrides `tableBranch`. Every answer is logged (day,
   phase, path, branch, beat, optionId, label); the path
   walked is recorded. The drain also runs at dawn when a
   modal is pending from a previous dawn (e.g. a drain
   broken by a live fight), even though `tableDone` is
   already true — a pending modal is never left unplayed.
6. **Wait leg (after competent.daily()).** While
   `tableWaiting && !tableDone`, end the day at Haven
   (4,4): walk there if needed (competent's `walkTo`,
   the tableseat pattern). This positions the scholar to
   sit at the next dawn. Record wait days / at-Haven /
   stranded counts.

What the policy does NOT do: no link verbs (the sibling
linkdrive arm owns the national road), no proposeCovenant /
proposeTrade / raidVillage, no banking, no tend-gate or
tend-predicate change, no tribute change beyond rule 3,
no godhood, no Math.random of its own (the only new RNG
draws are the engine's own, inside the called verbs).
A GO verdict here means GO CANDIDATE as an instrument —
landing this as competent play is a coordinator/Steve call,
NOT made by this arm. No default flips.

## §3. Design — before/after on identical seeds

- **BEFORE:** competent verbatim on seeds 113601–113608
  (leg-1 capstoneready driver, OUTDIR
  `perseed-sitpolicy-a-before-arm`).
- **AFTER:** competent-sit on the SAME 8 seeds
  (sitpolicy driver, OUTDIR
  `perseed-sitpolicy-a-arm`).
- **Panel:** before/after comparisons run through
  `scripts/balance-panel.js` (§15) — panel mode for each
  policy on the same 8 seeds / 150d, then `compare
  --before <before-panel.json.gz> --after
  <after-panel.json.gz> --out
  evidence/2026-11-28/sitpolicy-panel`. The panel is the
  instrument; the frozen bars in §1 are the judge. The
  compare `.md` is attached to the evidence file.
- **Confirm:** 12–16 seeds only if the 8-seed pilot
  passes GO. A pilot miss is a NO-GO, not a confirm.

## §4. Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the census /
  capstoneready / scalerank bands, for comparability; the
  scale window is 80–140d, the table floor is day 90, and
  a 150d horizon gives ~60 days of post-sit play).
  Dead villages stop simulating (+10d tail max).
- **Seeds (fresh 8-seed pilot band): 113601, 113602,
  113603, 113604, 113605, 113606, 113607, 113608.**
  Freshness check (skill local_seed_band_freshness, run
  2026-11-28 ~09:00 UTC before this freeze):
  - Word-boundary grep over ALL `evidence/*/sim-*-prereg.md`
    files for `11360` names NO 11360x band: the only hits
    are the FIVE-digit seed `11360` in three 2026-10-29
    Loop B preregs (sim-clearhabit-b-prereg.md:270,
    sim-eveningdetour-b-prereg.md:151,154,
    sim-nighttravel-verdict-adopt-b-prereg.md:56,66,223)
    — a different number (11360 ≠ 113601), not this band.
  - Literal grep for `113601` over all of `evidence/`,
    `scripts/`, `docs/` returns NOTHING.
  - Grep over all 2026-11-28 preregs for `113[0-9]{3}`
    names only 113101–113108 (census), 113201–113208
    (capstoneready prereg's own freshness sentence),
    113301–113308 (scalerank + capstoneready bands).
  - No dedicated forbidden/contaminated band list exists
    in the goal hidden_files (scalecensus prereg §4
    records the same "no such list" state; re-checked
    2026-11-28 — no such file under the goal's
    hidden_files).
  - Neighbouring used bands avoided: 113301–113308
    (scalerank/capstoneready), 113201–113208, 113101–113108
    (census), 112101–112108 (partydmg), 111101–111108
    (launchfit).
- **Policies:** competent verbatim (before) vs
  competent-sit (after). **No substrate flags.**
- **Instruments:** `scripts/policies/competent-sit.js`
  (new); `scripts/sitpolicy-driver-a.js` (clone of the
  leg-2 driver harvest — daily gate/seat/readiness/
  delivered/overtime snapshots + fireside + table lines
  + markers — PLUS the sit harvest: sit attempts, drain
  log, delivery attempts, bundle attempts, court
  answers); `scripts/analyze-sitpolicy-a.js` (new;
  reads the per-seed JSONs only); proof test
  `scripts/test-sitpolicy-a.js` (staged sit / no-sit /
  delivery / bundle / court / drain rules + driver 30d
  smoke + determinism spot check). Corpus under
  `evidence/2026-11-28/perseed-sitpolicy-a-arm/` (after)
  and `perseed-sitpolicy-a-before-arm/` (before).

## §5. Expectations and confounds (read before citing)

1. **National 0/8 is expected, not a failure.** Scalerank
   proved no polity ever qualifies on a competent band
   (one link per village); the full seat's scale bar will
   read unmet on all 8 seeds in both legs. The sit arm
   measures the LESSER seat played, not the full seat
   earned.
2. **Court beats are expected to number 0.** No polity
   → no beat ever stages (scalerank §0). The court verb
   exists so the policy is complete if a beat ever does
   stage; a 0 count is the scalerank prediction holding,
   not an untested verb. (The verb itself is proof-tested
   staged, per §4.)
3. **Charter is expected never ready** (resolves at
   national scale — capstoneready leg 1 §5.1). The
   delivery rule covers it only if readiness ever appears.
4. **Tribute deliverable rate on a FRESH band is
   unknown.** Leg 2 measured 2/8 on 113301–113308; this
   band's rate is whatever the veterans do. Bar (b) is
   judged against 2/8 frozen, not against leg 2's rate.
5. **The feast bundle may never be bought.** The buy-out
   needs a 16,000-kcal pantry while the bundle is unbought
   at stage 3; if the pantry never reaches that, the
   attempt count is 0 and the feast stays undelivered —
   a finding about pantry depth at stage 3, not an
   instrument failure. The buy-out verb itself is
   proof-tested staged.
6. **Sitting changes the run.** A seated village plays a
   path the same dawn; a win ends the run (Game.over +
   Game.won), a loss downgrades through the drain, and
   the village continues. Post-sit trajectories will
   diverge from the before leg — that divergence IS the
   measurement (paired seeds diverge only where the sit
   verbs fire, as in leg 2).
7. **"Seated 0/8" in the before leg measures the bot, not
   the game** (scalecensus §5.5) — the before leg is the
   control for exactly that confound.

## §6. Metric review (filled at closeout)

- [to be filled: whether the frozen bars measured what
  they claimed, any metric that proved wrong, and the
  revision proposed for the NEXT run. A miss is NO-GO,
  never re-scored.]
