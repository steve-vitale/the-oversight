# sim-w5gate — the tableActive gate refinement re-measured on the NEW readiness bar (flesh-out loop, 2026-10-18, ARM sim-w5gate-a)

Worktree: `~/workspace/worktrees/w5gate-a`. POLICY-SIDE refinement — ZERO src/js changes. Branch: w5gate-a, based on current master (NEW readiness bar, Steve's 2026-10-18 recalibration landed).

Axis: scale-onramp (standing scale directive). The brief's named next comes from sim-w5reach2 (finding #369): refine the landed layer's `tableBusy = tableDone||tableWaiting` gate to the engine-honest `Game.tableActive()`. Context the brief predates: **sim-w5reach3 (2026-10-15, ARM 3) already built and proved this exact refinement (22/22 RED→GREEN) and measured it on the OLD-bar substrate — PRIMARY NO-GO (mean paired delta +3.5d vs ≤ −4d bar; road split belong 0/8→4/8, lead 8/8→5/8; kill protocol: REVERTED, "must not be re-landed as-is").** This arm is NOT a re-landing: it re-measures the refinement on the NEW-bar substrate (Steve's readiness recalibration rebuilt the wave-4 window: pristine pre-seat wave-4 0/16→9/16, wave-5 0/16 both arms — sim-readconfirm evidence). The question "does the engine-honest gate move wave-5 on the NEW bar" was never measured. If this run misses, the refinement is reverted in-tree (killed arms leave no trace).

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law + design call #4 combat-readiness), docs/TABLE.md (sanctity). Canon facts:
- Wave-5 gate (standing.js, NEW bar): villageStandingTotal() >= t5(200) AND waveCombatReadiness(5) = {armored 4@P15, armed 6, tricks 3, veterans 2 (living, wave-4+ kills)}; bread counts at most 100 toward t5; monotonic peak ratchet.
- Sanctity of the table (TABLE.md): "when the table sits, the world holds its breath" — ambient monster pressure suspends; all stakes come from the table itself. Engine predicate: Game.tableActive() (table.js:359 — the finale actually playing; the win-deferral window counts as sitting).
- If sanctity means the world holds its breath, a PENDING invitation shouldn't hold it — only the sitting should. That is the whole refinement (same `Game.tableActive && Game.tableActive()` guard pattern as game.js's two call sites and gorgedrive.js — convention, not invention).

## The refinement (the only change — scripts/policies/wave5reach.js)

`huntLive`'s standdown predicate: `tableBusy = pg.tableDone || pg.tableWaiting` → `tableStandingDown = Game.tableActive && Game.tableActive()`. Fail-open (matches the old exception path): unreadable engine state → hunt stays live. Everything else untouched: 35% mid-fight retreat, `_w5Commit`/`_huntCommit` fight-commit logic, hunt cadence (every 3rd day, hp>=60%, kcal>=200), node selection, 12-step engage bound, WAVE5REACH=1 env gate (default OFF; gate-off = pure delegation, unchanged).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14–15 — BINDING, written BEFORE any sweep)

**Question:** does the engine-honest gate let the wave-4 counter-learning hunts convert recovered opportunity into EARLIER wave-5 unlocks on the NEW-bar pre-seat stack?

**The lever:** scripts/policies/wave5reach.js — env-gated WAVE5REACH=1, default OFF. Wraps SD.leadseat / SD.belongseat (same ids leadfeast-windefer/belongfeast-windefer). After wave-4 unlock and before wave-5 unlock (never while the table actually sits):
1. Counter-learning expeditions: every 3rd day, healthy and fed, travel to thicket/ruin/forest/grove nodes, engage visible wave-3/4+ monsters (engagements feed facings/fleeing-counts knowledge; kills feed the war ledger), come home. Base verbs run FIRST and fully — the hunt is additive, never preempting.
2. Fight commitment: wave-3 → ctx._huntCommit (courtkill's mechanism, holds to 12%); wave-4+ + scholar>=50% HP → ctx._w5Commit (start-of-fight walk-away overridden ONLY; 35% mid-fight eject UNCHANGED).
3. No free knowledge, no combat cheats, no deed-bar reimplementation.

**Substrate (exact readconfirm pattern):** FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1. SEATDRIVE=0 explicit is required (post-c004b9dd the seat default is ON — finding #380; "unset" now means the win-side stack).

**Arms:** control = W5R.leadseat/belongseat with WAVE5REACH unset; armed = the same + WAVE5REACH=1. Identical seeds both sides, 180d death-aware (dead villages stop simulating, +10d tail max), own control in the same sweep.

**Seeds:** 8 FRESH [54201,54202,54203,54204,54205,54206,54207,54208] (verified: zero per-seed files in evidence/2026-10-*/perseed-*; the only "54207" hits in evidence are foraged-food kcal counts, not seeds) x {leadfeast, belongfeast} x {control, armed} = 32 runs.

**Horizon + why:** 180d death-aware. On the NEW bar, wave-4 unlocks land d50–115 (sim-readconfirm); wave-5 was 0/16 — the full horizon is the honest surface for a wave-5 question.

**Proof:** scripts/test-w5gate-20261018.js — (a) RED: the old over-broad gate reproduces the #369 stranding (wave-4 + tableWaiting pending + table NOT active → old predicate strands, refined gate live); GREEN: refined gate live in the stranding state, false while the table sits, false in the win-deferral window (winDeferred counts as sitting); fail-open on throw/missing tableActive; (b) det-gate: gate-off trajectory byte-identical to plain seatdrive composition (fixed seeds, 60d, SEATDRIVE=0); (c) SMOKE both sides with seat=false. The w5reach2 withEnv async hazard is avoided (env set directly; the proof's helper awaits fn() inside try). Never concurrent jest.

**PRIMARY (engagement-conditioned, binding):** on ENGAGED pairs (armed run has ≥1 hunt engagement, ctx.w5HuntEngaged ≥ 1):
- GO condition A: ≥4 engaged pairs with armed-earlier wave-5 unlock (armed wave5Day < control wave5Day; armed-only unlock counts as armed-earlier; control-only counts as armed-later; both-miss excluded), OR
- GO condition B: median paired unlock-day delta (armed − control) ≤ −5d over engaged pairs where BOTH sides unlocked.
Either condition GOes the arm.

**SECONDARY (report, don't judge):** wave-5 count ≥ control + 3 on fresh seeds; full wall numbers (national/table/wins/wave-4/5 unlocks/median survival/exiled); gate-liveness (liveDays / recoveredDays / sanctityDays per w5reach3's instrument); wave4Day/wave5Day via daily unlockedWave() sampling + a run-end sample (finding #376's edge — a final-day unlock is recorded at gameDays); per-seed JSONs in evidence/2026-10-18/perseed-w5gate/ with EXACT numeric keys national, table, wins, exiled, wave5, wave5Day; beat captures in evidence/2026-10-18/w5gate-beats/.

**GUARDRAILS (binding):** no new death mode at n≥3; national ≥ control − 2; median survival ≥ control − 25d.

**ENGAGEMENT GATE (kill fast, binding):** if <3 engagements across the 16 armed runs → NO-CONTACT: kill the arm, revert the refinement in-tree, no confirm spend.

**SENSE-TESTING LAW:** read a transcript from an engaged run — do the hunts read as sensible villager behavior or robotic farming? Judge meaning, coherence, consequences.

## Metric review

(per §14 — pre-registered metrics bind; doubts go here, revisions apply
to the NEXT run)

1. **PRIMARY is NO-COVERAGE (binding) — the arm is KILLED.** Wave-5
   unlocks: 0/32 across both sides (control 0/16, armed 0/16). Engaged
   pairs n=9 — every one both-miss. Condition A: 0 armed-earlier pairs
   (bar ≥4). Condition B: no both-unlocked engaged pairs — the median is
   undefined, so ≤ −5d cannot be met. This is not a null (the engagement
   gate is MET: 27 engagements ≥ 3 — genuine contact) and not a w5reach2
   no-coverage (there, wins truncated the surface; here the substrate
   itself never unlocks wave-5). Per §14 this is NO-GO, never re-scored
   mid-run. Per kill protocol the refinement is REVERTED in-tree (the
   landed layer stays landed and untouched); the w5reach3 kill protocol's
   "must not be re-landed as-is" stands.
2. **The mechanism's opportunity is real but the gate it feeds is no
   longer the bind.** 268 recovered days (the old heuristic's stranding,
   now live), 0 sanctity days (tableActive() never fired — 0 sittings on
   the pre-seat stack, as expected), 114 hunts, 27 engagements — and
   wave-4 unlocks IDENTICAL per seed both sides (9/16, same seeds, same
   days). The lever feeds facings + war standing (the OLD facing-based
   readiness currency). The NEW bar's bind is veteran PRODUCTION: 2 living
   veterans with wave-4+ kills + standing 200. Facing opportunities don't
   manufacture veterans — villagers who kill wave-4 monsters keep dying
   before the second veteran bloods. A future wave-5 arm on the new bar
   must move veteran survival/production, not facing opportunity; and any
   paired-unlock-day primary needs a substrate where wave-5 actually
   unlocks (win-side, or a veteran-rich stack).
3. **Telemetry LOUD investigated: regime artifact.** telemetry-check
   against the scale-wall baseline fired "wins disappeared: baseline 16
   -> current 0" — the baseline is the winseat (win-side) regime; this
   sweep is pre-seat (SEATDRIVE=0), where wins are structurally 0. The
   baseline's own _regime label documents exactly this (same artifact
   noted in sim-readconfirm). No investigation item; baseline NOT rolled
   forward (rolling a pre-seat census into a winseat baseline would
   corrupt it).

## Results

32 runs (8 fresh seeds 54201–54208 x {leadfeast, belongfeast} x {control,
armed}), 180d death-aware, NEW-bar pre-seat substrate (SEATDRIVE=0
explicit), own in-sweep control. Per-seed JSONs:
evidence/2026-10-18/perseed-w5gate/{control,armed}/ (32/32 present).
Beat captures: evidence/2026-10-18/w5gate-beats/ (32/32).
Sweep log: /tmp/w5gate-sweep.log (ephemeral; numbers below are the
record).

| metric | control (n=16) | armed (n=16) | bar | verdict |
|---|---|---|---|---|
| wave-5 unlocks (PRIMARY) | 0/16 | 0/16 | cond A ≥4 armed-earlier engaged pairs / cond B median delta ≤ −5d | **NO-COVERAGE** (9 engaged pairs, all both-miss) |
| wave-4 unlocks | 9/16 | 9/16 (same seeds, same days) | — | — |
| wins | 0/16 | 0/16 | expected 0, LOUD if any | GO |
| national | 11/16 | 12/16 | ≥ control−2 | GO |
| table invites | 12/16 | 13/16 | — | — |
| exiled | 0/16 | 0/16 | — | GO |
| median survival | 142d | 139d | ≥ control−25d | GO |

Wave-4 unlock days (identical both sides): s54201b d60, s54203b d112,
s54204b d89, s54207b d78, s54208b d160, s54202l d121, s54203l d68,
s54204l d57, s54207l d101.

Mechanism counters (armed): 114 hunts (209 hunt legs), 344 liveDays,
268 recoveredDays, 0 sanctityDays, 27 engagements, 116 bloodFights
(wave-3 commits), 114 facingFights (wave-4+ commits). Control: all zero
(gate off, as designed). Engaged runs: 9/16 armed runs (belong
01/03/04/07/08, lead 02/03/04/07) with 1–6 engagements each.

Death modes: both sides dominated by combat (control 411, armed 409),
villager-combat (119 both), monster (67 vs 59), expedition (23 both),
sickness (14 both), starvation (12 both), contest (10 vs 9), wounds
(8 both), alien (3 vs 4), the night (2 both). No new death mode at
n≥3 — guardrail holds. Total deaths: 674 vs 665.

Wall numbers on the NEW-bar pre-seat stack (this arm's measurement):
national 11–12/16, table 12–13/16, wins 0/16, wave-4 9/16, wave-5 0/16,
median ~139–142d, exiled 0. (The new bar opened the wave-4 door —
0/16→9/16 vs the old bar — but the wave-5 door never opened: standing
200 + 2 living veterans with wave-4 kills is unreachable on pre-seat
in sims.)

## Village assessment

(plain words)

Thirty-two villages lived on the new-bar pre-seat stack — invited, most
of them, to a table nobody sits. Wave-4 opened for nine of sixteen on
each side, on the same seeds at the same days whether or not the
scholar hunted: the Mirror Draft's champions arrived the ordinary way —
patrols, fights, funerals — and the scholar's counter-learning
expeditions (114 of them, the gate now opened for 344 days) changed
nothing about who reached the gate.

What changed is what the gate asks. The hold beat on d69 in
belongfeast-armed s54201 says it plain: "The fifth draft stays in the
wings. The Producers want a village that can fight them — armor the
village (3 of 4 fighters armored); blood your fighters (0 of 2
veterans)." The scholar walked out to the thickets nine times, stood
before the Mirror Draft's champions six times — and the veteran count
stayed zero. The village died on d86 with Leo, Tom, Ursula, and Vasyl
in the ground, never having blooded a single veteran. The hunts fed the
facing ledger and the war ledger; the readiness gate counts neither.
It counts living killers.

Who died and why: the Mirror Draft kills people who stand before it —
combat 409–411 across the two sides, villagers falling at the same rate
whether the scholar hunts or not. Nobody starved more than the base
rate (12 both — the food economy holds on this stack). No exiles. No
wins. The table stays empty; the villages die rich in standing and
short of veterans.

The blank this run fills is negative but load-bearing: on the NEW bar,
the wave-5 pursuit line's mechanism (facing opportunities + war
standing) is aimed at the wrong bar. The facing ledger was the old
readiness currency; the new currency is veteran production. Any future
wave-5 arm must manufacture or protect wave-4 killers — or measure on a
substrate where the veterans already exist.

## Sense-testing

Read end to end: belongfeast-armed s54201 d60–86 (Mirror Draft opens d60
→ hold beat d69 → village lost d86; 9 hunts, 6 engagements).

- The arc is earned and the hold beat is the fiction's honesty: the
  System announces the price ("armor the village (3 of 4 fighters
  armored); blood your fighters (0 of 2 veterans)") and the scholar's
  hunts are that order, executed deliberately — ordinary travel and
  encounter verbs, no expedition cutscene, just the scholar walking out
  to monster country on purpose every third day, gated on health and
  food. It reads as a scholar working a problem the System named, not
  as farming.
- The cost is visible and honest. The scholar survives every committed
  fight (the 35% eject holds — no anomaly in the death causes) while
  the village bleeds behind them: raids from the Red Table (~1350 and
  ~800 kcal), four villager deaths in eight days. The d73 System beat
  ("You are not at the table yet. But the table has your name now")
  lands while the pantry thins — the invitation pends, the world does
  NOT hold its breath (the refinement's fiction), and daily life
  continues around it.
- The failure is legible: 0 of 2 veterans at the end. The hunts faced
  champions; they never blooded one. The lever's limit is written into
  the run's own text.
- Judgment: meaning and coherence pass. The mechanism is sensible
  villager behavior with honest consequences — it just doesn't move
  the new bar.

## Blanks (filled / documented)

- **FILLED:** scripts/test-w5gate-20261018.js (18/18 GREEN pre-kill on
  the new-bar pre-seat substrate: RED on the old heuristic reproduces
  the #369 stranding; GREEN on the refined gate in the stranding state;
  sanctity + win-deferral + fail-open pins; det-gate 4/4 byte-identical
  gate-off; SMOKE both sides with seat=false. Post-kill: INFO-SKIPs
  with W5GATE_KILLED=1 — set by the coordinator after a killed arm —
  following the belonghunt precedent; pre-kill GREEN logged here).
- **FILLED:** scripts/sweep-w5gate-20261018.js (the 32-run sweep on the
  exact readconfirm instrument: SEATDRIVE=0-required substrate,
  #369 gate-liveness tracking, #376 run-end unlock sample, per-seed
  JSONs with the exact numeric keys, beat captures).
- **FILLED:** the 32-run new-bar gate-refinement census —
  evidence/2026-10-18/perseed-w5gate/{control,armed}/ (32/32 present, 0
  schema-bad) + w5gate-beats/ (32/32 beat captures).
- **FILLED:** the telemetry regime-artifact check — wins LOUD on the
  winseat baseline is the documented pre-seat artifact; baseline not
  rolled.
- **DOCUMENTED:** PRIMARY NO-COVERAGE — wave-5 0/32 on the new-bar
  pre-seat stack; the engagement-conditioned primary needs a substrate
  where wave-5 unlocks. The refinement was reverted in-tree per kill
  protocol; the landed layer stays landed and untouched.
- **DOCUMENTED:** the veteran-production bind — the w5reach line's
  mechanism (facings + war standing) aims at the old facing-based
  readiness currency; the new bar counts living veterans with wave-4+
  kills. Named next: veteran-manufacturing levers, or a veteran-rich
  substrate for any wave-5 measurement.
- check.js was not run (zero src/js changes this run; the only game
  file touched was reverted byte-identical to HEAD). The proof's
  det-gate + SMOKE covered the policy surface.

## Findings filed

- (this run) **KILLED — sim-w5gate PRIMARY NO-COVERAGE: the tableActive
  gate refinement re-measured on the NEW bar.** Mechanism live and
  contacted (114 hunts, 27 engagements, 268 recovered days, 0 sanctity
  days — the #369 stranding fix is mechanically correct on the new
  bar too) but wave-5 unlocks 0/16 both sides: the NEW wave-5 bar
  (standing 200 + 2 living veterans with wave-4+ kills) is unreachable
  on the pre-seat stack in sims. All guardrails green (national 12/16,
  median 139d vs 142d, no new death mode). Engagement gate met (contact,
  not no-contact). The refinement is REVERTED in-tree per kill
  protocol — it must not be re-landed as-is (w5reach3's kill protocol
  stands, now confirmed on a second substrate).
- Metric-design note: the engagement-conditioned paired-unlock-day
  primary needs a substrate where wave-5 unlocks — pre-seat on the new
  bar is 0/32. Next wave-5 arms belong on the win-side stack or a
  veteran-rich substrate.
- [open] 2026-10-18 — wave-5/policy — VETERAN PRODUCTION IS THE WAVE-5
  BIND ON THE NEW BAR (flesh-out loop sim-w5gate, run
  fleshout-20261018T1515Z ARM sim-w5gate-a,
  evidence/2026-10-18/sim-w5gate.md): the w5reach line's mechanism
  (facing opportunities + war standing) aims at the OLD facing-based
  readiness currency; the new bar counts living veterans with wave-4+
  kills — hunts feed facings and the war ledger, neither of which the
  gate reads. 114 hunts / 27 engagements changed nothing about wave-4
  reach (identical per-seed) or wave-5 (0/32). Named next: levers that
  manufacture or protect wave-4 killers (veteran survival through the
  wave-4 window, or kill-attribution channels), measured where wave-5
  can unlock.

## Results

(pending)

## Village assessment

(pending)

## Sense-testing

(pending)

## Blanks (filled / documented)

(pending)

## Findings filed

(pending)
