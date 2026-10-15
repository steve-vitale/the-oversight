# sim-w5reach2 — the landed wave5reach policy on the PRE-SEAT stack (flesh-out loop, 2026-10-15, ARM 1)

Worktree: `~/workspace/worktrees/sim-w5reach2`. POLICY-SIDE measurement — ZERO src/js changes; the wave5reach layer is LANDED (58131bb1) and stays untouched. Branch: sim-w5reach2, based on current master.

Axis: scale-onramp (standing scale directive). The tracker's named next: "future wave-5 arms need a non-win substrate (pre-seat stack)" — the win-side stack wins 40/48, and win truncation (wins end ~d90; wave-5 unlocks land d112–176) made wave-5 unmeasurable there (sim-wave5reach: PRIMARY NO-COVERAGE, 32/32 won).

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law — the lever touches it), docs/TABLE.md (read first). Canon facts the lever is built on:
- Wave-5 gate (standing.js): villageStandingTotal() >= t5(200) AND waveUnlockReady(5).ready = waveEngaged(4) >= 2 distinct wave-4 types faced blow-by-blow (FLEEING COUNTS — "you stood on the grid"); bread counts at most 100 toward t5; the rungs sit on top of the wave-3 rung.
- Standing: war +25 per wave-3+ ledger kill point (per-type cap 2), diplomacy +34 per seasoned regional+ link, plenty +20 per major feast (quality>=1).
- Waves 3–5 are deliberately counter-less: wave-5 counterplay IS engine-real (sigW5.js) but has no engine knowledge channel. The "trick knowledge" the lever pursues is the readiness gate's own currency: FACED wave-4 types (waveEngaged) + ledger kill points (war standing) — the engine's honest knowledge channels, never free knowledge.
- Sanctity of the table (TABLE.md): "when the table sits, the world holds its breath" — the finale's own stakes only. The engine's predicate is Game.tableActive() (table.js:359).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep)

**Question:** does the landed wave5reach policy (counter-learning expeditions after wave-4 unlock) move wave-5 UNLOCKS on the pre-seat stack — the wincensus-diagnostic substrate (0/16 wins, 15/16 table invites, 0 sittings) where runs live long enough for wave-5 to be measurable?

**The lever (as landed, unmodified):** scripts/policies/wave5reach.js — env-gated WAVE5REACH=1, default OFF. Wraps SD.leadseat / SD.belongseat (same ids leadfeast-windefer/belongfeast-windefer). After wave-4 unlock and before wave-5 unlock (and never during the table sequence):
1. Counter-learning expeditions (hunt legs): every 3rd day, healthy (hp>=60%) and fed (kcal>=200), travel to thicket/ruin/forest/grove nodes, engage visible wave-3/4+ monsters (facing fills waveEngaged — fleeing counts), come home. The courtship/win verbs run FIRST and fully — the hunt is additive, never preempting.
2. Fight commitment: wave-3 in fight → ctx._huntCommit (courtkill's proven mechanism, holds to 12%); wave-4+ in fight + scholar >=50% HP → ctx._w5Commit, honored by the extended legacy flee block in scripts/policies/competent.js (start-of-fight walk-away overridden ONLY; the mid-fight 35% eject is UNCHANGED).
3. No free knowledge, no combat cheats, no deed-bar reimplementation: reads Game state, issues player verbs — never writes engine state.

**Arms:** control = pre-seat stack (FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1 + RAIDDENSITY=1 + WINPURSUIT=1 + WINDEFER=1, SEATDRIVE NEVER set — the seat layer gate-offs to pure delegation) with WAVE5REACH unset; armed = the same + WAVE5REACH=1. Identical seeds both sides, 180d death-aware (dead villages stop simulating, +10d tail max), own control in the same sweep.

Seeds: 8 FRESH [151,262,373,484,595,706,817,928] (verified: zero matches in evidence/2026-10-*/ as seed values) x {leadfeast, belongfeast} x {control, armed} = 32 runs.

**Horizon + why:** 180d death-aware. Wave-5 unlocks land d112–176 on measured sets; the pre-seat stack's runs live long (wincensus: median well past d100), so the full horizon is the honest surface.

**Proof:** scripts/test-w5reach2-20261015.js — (a) det-gate: gate-off trajectory byte-identical to plain seatdrive composition on fixed seeds; (b) gate-on: the mechanism is LIVE when its gate opens (hunts fire on live-gate days); unit checks on huntLive gating + commit-flag marking; SMOKE both sides with seat marker false (pre-seat). Never concurrent jest; --cacheDirectory only for jest (this proof is node-direct).

**PRIMARY:** wave-5 unlocks armed >= control + 2 (n=16/side).

**GUARDRAILS (binding):** national >= control - 2; no new death mode at n>=3; wins expected 0 — ANY armed win is reported LOUD (it changes the interpretation).

**Secondaries:** full wall numbers both sides (national/table/wins/wave-4/5 unlocks/median survival/exiled); wave-5 unlock days via DAILY unlockedWave() sampling (finding #360 — no telemetry event fires on wave unlock); hunt-liveness per armed run (liveDays vs busyDays — the proof's gate-on diagnostic showed the layer's tableBusy strands the hunt while an invitation pends); per-seed JSONs in evidence/2026-10-15/perseed-w5reach2/ with EXACT numeric keys national, table, wins, exiled, wave5, wave5Day; beat captures in evidence/2026-10-15/w5reach2-beats/.

**SENSE-TESTING LAW:** read a transcript from a run that engaged wave-4 monsters — do the counter-learning hunts read as sensible villager behavior or robotic farming? Judge meaning, coherence, consequences.

## Metric review

(per §14 — pre-registered metrics bind; doubts go here, revisions apply
to the NEXT run)

1. **PRIMARY is NO-GO (binding).** Wave-5 unlocks: armed 10/16 vs control
   11/16. The bar was armed >= control + 2. This is a clean miss, not a
   coverage problem — the pre-seat stack produced a measurable surface
   (21/32 runs unlocked wave-5, unlock days d69–d120 via the new daily
   sampling). The lever as-landed does not move the wave-5 COUNT on this
   substrate. Per §14 this is NO-GO, never re-scored mid-run.
2. **The acceleration signal is real but belongs to the NEXT run's
   header.** On the 3 runs where a hunt ENGAGED (all lead road: s151,
   s262, s595), wave-5 unlocked exactly 9 days earlier than the
   identical-seed control (d98 vs d107, d111 vs d120, d76 vs d85).
   3/3 engagements → −9d. When the hunt fires but doesn't engage, the
   deltas are noise (+7, +3, +10, 0, 0). The honest next primary is
   "wave-5 unlock day on engaged runs" or "paired unlock-day delta",
   not the count — the count is dominated by the base's own verbs
   (controls unlock 11/16 without any hunts).
3. **The stranding dominates the lever's opportunity.** Across 16 armed
   runs: 14 hunts fired on 13 live-gate days vs 419 wave-4 days spent
   tableBusy (invitation pending, unsat). The landed layer's
   `tableBusy = pg.tableDone || pg.tableWaiting` treats a PENDING
   INVITATION as "the table sequence" — but on the pre-seat stack the
   invitation pends for the entire wave-4 window (wincensus: 15/16
   invites, 0 sittings; the sit is inert without the seat driver), while
   daily life — fights, travel, deaths — continues around it. The
   engine's own sanctity predicate is `Game.tableActive()` (table.js:359:
   the finale actually playing). The layer's gate is over-broad for
   this substrate. This is the arm's key mechanism finding (filed to
   sim-findings): a follow-up arm should refine the gate to
   `tableActive()` and re-measure. The layer itself stays untouched
   this run per the brief.
4. **Proof-instrument bug caught and fixed (withEnv).** The pre-sweep
   proof's `withEnv` helper restored env vars the moment the async
   function returned its promise — before the run resolved — so the
   first gate-on attempt silently ran gate-off (and "passed" vacuously).
   Caught because the gate-on trajectory (d131) matched the naked
   trajectory instead of the genuinely-armed diag (d152). Fixed by
   awaiting fn() inside the try; re-run green (31/31). The det-gate was
   unaffected (gate-off either way); the sweep sets env directly and
   was never at risk. Lesson for future proofs: assert the env is live
   INSIDE the run (the sweep's per-run layer-live marker check does
   this; the proof now does too via the gate-on counters).
5. **Same-seed reproducibility holds at 180d.** diag-w5reach2-repro.js:
   naked-vs-naked s151 180d IDENTICAL; wrapped(gate-off)-vs-naked
   IDENTICAL. The earlier diag-vs-proof divergence was the withEnv bug,
   not the timestamp-ID contest issue (contestEngine was fixed in r26
   to order by roster-index). The "identical seeds both sides" design
   is sound on this horizon.

## Results

32 runs (8 fresh seeds x {leadfeast, belongfeast} x {control, armed}),
180d death-aware, pre-seat substrate, own in-sweep control. Per-seed
JSONs: evidence/2026-10-15/perseed-w5reach2/ (32/32 present).
Beat captures: evidence/2026-10-15/w5reach2-beats/.

| metric | control (n=16) | armed (n=16) | bar | verdict |
|---|---|---|---|---|
| wave-5 unlocks (PRIMARY) | 11/16 | 10/16 | armed >= control+2 | **NO-GO** |
| wins | 0/16 | 0/16 | expected 0, LOUD if any | GO |
| national | 12/16 | 13/16 | >= control−2 | GO |
| table invites | 16/16 | 16/16 | — | — |
| wave-4 unlocks | 16/16 | 16/16 | — | — |
| exiled | 0/16 | 0/16 | — | GO |
| median survival | 134.5d | 135.0d | — | — |

Wave-5 unlock days (daily unlockedWave() sampling — finding #360's fix):
- control: s151b d93, s262b d85, s373b d69, s151l d107, s262l d120, s373l d93, s484l d103, s595l d85, s706l d73, s817l d71, s928l d120
- armed: s151b d100, s373b d72, s484b d105, s595b d115, s151l d98, s262l d111, s373l d93, s484l d113, s595l d76, s706l d73

Paired unlock-day deltas (armed − control; negative = armed earlier):
- s151 belong +7, s262 belong (armed miss), s373 belong +3, s484 belong (armed-only unlock d105), s595 belong (armed-only unlock d115), s706/s817/s928 belong (both miss)
- s151 lead −9 (engaged), s262 lead −9 (engaged), s373 lead 0, s484 lead +10, s595 lead −9 (engaged), s706 lead 0, s817 lead (armed miss), s928 lead (armed miss)

Mechanism counters (armed): 14 hunts, 13 live-gate days, 419 busy days,
3 engagements, 30 bloodFights (wave-3 commits), 37 facingFights (wave-4+
commits). Control: all zero (gate off, as designed).

Death modes: both sides dominated by combat (control 444, armed 482),
villager-combat (103 both), monster (91 vs 101). Armed-only at n>=3:
"the phoenix link" x6 — the cheat-death ash-burn (doom-countdown ruling;
a known mechanism, not a new death mode — the lever's committed fights
produce more near-death triggers). No new death mode introduced by the
lever; guardrail holds.

Wall numbers on the pre-seat stack (this arm's measurement): national
12–13/16, table 16/16, wins 0/16, wave-4 16/16, wave-5 10–11/16, median
~135d, exiled 0. (For the tracker: the pre-seat substrate reaches
national and wave-5 in sims, but wins 0/16 — the seat driver is the
win-side difference.)

## Village assessment

(plain words)

Sixteen villages lived long on the pre-seat stack — median 135 days,
no wins, no exiles, every one of them invited to a table nobody sits.
They are villages in the long middle of the game: wave-4 unlocked
everywhere (d58–d108), wave-5 in two-thirds, national in three-quarters.
They die the way villages die out here: combat, combat, combat — 444
and 482 combat deaths across the two sides, villagers falling to
monsters at roughly the same rate whether the scholar hunts or not.

The scholar's counter-learning expeditions are rare things — 14 hunts
across 16 armed runs, most strangled in the cradle by the pending
invitation. When a hunt does go out and find its monster, the village
notices: three engagements, three times the Producers came nine days
sooner. The mechanism is real; its opportunity is not.

What the villages that reached wave-5 look like: they stood before the
Mirror Draft's champions the ordinary way — patrols, fights, funerals —
and the standing came from blood and bread. The d91 hold beat ("The
fifth draft stays in the wings. Stand before the Mirror Draft's
champions — more than once, more than one kind") is the village's
marching order whether or not the scholar runs a formal expedition.
The lever's hunts are a sharpened version of what villages already do,
not a new thing.

Who died and why: the Algorithm took its toll (named in the death
records), the Audit, the Moderator, the Congregation — the Mirror
Draft kills people who stand before it, which is the point. The armed
side's 6 phoenix-link ash-burns are villagers who died twice — once to
the doom, once to the fire that saved someone else. Nobody starved
(1 starvation death on control, 0 armed — the food economy holds on
this stack).

## Sense-testing

Read end to end: leadfeast-armed s151 d91–99 (wave-4 unlock → hold beat
→ engagement → wave-5 greenlight 9 days before control).

- The arc is earned. d91: the Mirror Draft opens with the System's own
  voice ("We've been watching you for a LONG time... Say hello to the
  MIRROR DRAFT") and the hold beat states the price ("The fifth draft
  stays in the wings. Stand before the Mirror Draft's champions — more
  than once, more than one kind — and the Producers will take notice").
  The hunt's engagement lands between. d97: the greenlight ("You've
  gotten too big for the story... Meet the PRODUCERS") reads as
  consequence — the System announced the price, the village paid it in
  facings, the fifth draft opened.
- The hunt itself doesn't narrate (it uses ordinary travel/encounter
  verbs — the same thing a player tapping the monster does), which is
  the honest-verb constraint working: there's no "expedition" cutscene,
  just the scholar walking out to the thickets on purpose. With 1 hunt
  per run it cannot read as farming; it reads as intent.
- The deaths around the engagement are real: "The Algorithm" x1 in
  this run's records — the Mirror Draft kills people who stand before
  it. The 35% mid-fight eject stayed honest (no scholar deaths to
  committed wave-4 fights across 37 facing fights).
- Judgment: meaning and coherence pass. The reach is played, not
  granted. The stranding, though, is a fiction problem as much as a
  mechanism one: the scholar stands down for 20–92 days because "the
  table is waiting," while the village fights and dies around the
  pending invitation. If the table's sanctity means the world holds its
  breath, a pending invitation shouldn't hold it — only the sitting
  should. That's the tableActive() refinement, filed as the named next.

## Blanks (filled / documented)

- **FILLED:** scripts/test-w5reach2-20261015.js (31/31 GREEN on the
  pre-seat substrate: layer-live markers both sides with seat=false,
  huntLive/flag-marking unit checks, gate-off det-gate 4/4 byte-identical
  at 60d + 180d reproducibility check, SMOKE, gate-on liveness) and
  scripts/sweep-w5reach2-20261015.js (the 32-run sweep with daily
  unlockedWave() sampling — finding #360's fix — hunt-liveness
  tracking, beat captures, per-seed JSONs with the exact numeric keys).
- **FILLED:** scripts/diag-w5reach2-window.js (the wave-4-window tracer
  that found the tableWaiting stranding) and
  scripts/diag-w5reach2-repro.js (the 180d reproducibility check that
  cleared the timestamp-ID suspicion).
- **FILLED:** the withEnv async fix in the proof (documented above).
- **FILLED:** the 32-run pre-seat wave-5 census —
  evidence/2026-10-15/perseed-w5reach2/*.json (32/32 present, 0
  schema-bad) + w5reach2-beats/ (32 beat captures) + w5reach2-sweep.log.
- **DOCUMENTED:** the tableWaiting stranding — the landed layer's
  `tableBusy = tableDone||tableWaiting` stands the hunt down for 419
  wave-4 days vs 13 live days on the pre-seat stack; the engine-honest
  gate is `Game.tableActive()`. Named next arm.
- **DOCUMENTED:** the engagement→acceleration pattern — 3/3 hunt
  engagements → wave-5 unlocks 9 days earlier on identical seeds.
  Proposed next primary: paired unlock-day delta.
- **DOCUMENTED:** pre-seat wall numbers for the tracker (above).
- check.js --quick: 96 passed, 2 failed — both in test-where-are-we
  (sibling's region content, commits 16581580/ec713723); pre-existing,
  unrelated to this arm (zero src/js changes here).

## Findings filed

- (this run) **NO-GO — wave5reach on the pre-seat stack does not move
  the wave-5 count: 10/16 armed vs 11/16 control (bar: >= control+2).
  All guardrails green (national 13/16, wins 0/16, no new death mode,
  median 135.0d vs 134.5d). The lever is opportunity-starved, not
  broken: 14 hunts on 13 live-gate days vs 419 tableBusy days; 3/3
  engagements → 9d-earlier unlocks. The layer stays landed and
  untouched.**
- Metric-design note: the next wave-5 arm should pre-register the
  PAIRED UNLOCK-DAY DELTA (or engagement-conditioned acceleration),
  not the count — the count is dominated by the base's own verbs.
- [open] 2026-10-15 — wave5reach tableBusy gate — the landed layer's
  tableBusy (= tableDone||tableWaiting) strands the hunt while a table
  invitation pends unsat (419 busy vs 13 live days across 16 armed
  runs on the pre-seat stack); the engine's sanctity predicate is
  Game.tableActive() (finale actually playing). A follow-up arm should
  refine the gate and re-measure. (sim-w5reach2 evidence)
- [open] 2026-10-15 — proof withEnv async hazard — the naive
  try/finally env helper restores vars before an async run resolves,
  silently running "armed" runs gate-off; fixed in
  test-w5reach2-20261015.js (await fn() inside try). Any proof using
  the old pattern should be re-checked. (sim-w5reach2 metric review 4)
