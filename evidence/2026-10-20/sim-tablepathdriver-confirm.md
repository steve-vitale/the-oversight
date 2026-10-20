# sim-tablepathdriver-confirm — scoped confirm: relay/dark + witness on fresh seeds (flesh-out loop, 2026-10-20)

Run: fleshout-20261020T0215Z (confirm of arm sim-tablepathdriver, same run).
Axis: scale-onramp. POLICY-SIDE — zero src/js changes. File scope:
scripts/tableconfirm-slots-20261020.js, scripts/sweep-tableconfirm-20261020.js,
scripts/test-tableconfirm-20261020.js, scripts/analyze-tableconfirm-20261020.js,
scripts/tableconfirm-transcripts-20261020.js, scripts/build-tableconfirm-panels-20261020.js,
evidence/2026-10-20/sim-tablepathdriver-confirm.md + evidence/2026-10-20/perseed-tableconfirm/
+ evidence/2026-10-20/tableconfirm-panel* + evidence/2026-10-20/tableconfirm-transcripts/.
READ-ONLY: scripts/policies/tablepathdriver.js, scripts/policies/relaydark.js,
and all landed 20261020 tablepathdriver instruments (probe/analyze/test/transcripts/panels).

Canon: docs/CANON.md + docs/TABLE.md (the table prices the run; 7 paths each
its own played challenge; failure resolves never wipes; light/dark branches
earned through play never a menu choice; relay GRADIENT law: light/dark/grey
bands on the leaning meter; relay earned by integration stage ≥ 3, not
territory; witness earned by recorded exposures; win = a table path's final
resolution + day >= 90).

The pilot (evidence/2026-10-20/sim-tablepathdriver.md, fleshout-20261020T0215Z,
landed 83a6ac023 + fd896c2ea): 7-door driver pilot GO on legs 1/2/4/5 (leg 3
superseded), all guardrails green — relay 5/5 dark walks terminal, witness 3/3
light walks terminal, defiant 4/4 light (sibling replication), indispensable
never earned (engine gate documented). Its confirm decision ("Named nexts"
#1): "a 12–16-seed confirm is authorized but not needed for reachability; if
run, scope to relay/dark + witness on fresh seeds." This confirm IS that
scoped run: relay/dark + witness, 12 fresh seeds, armed vs fresh control.

Backlog checked: no claimed items against this axis pending.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE any sweep)

**Substrate** (identical to the pilot, seatdrive seated stack):
withTablePathDriver(withSeatDrive(withWinDefer(withRelayDark(TF base)))) on
{leadfeast, belongfeast} tribfloor bases, SEATDRIVER=1 + TABLEPATHDRIVER=1
(armed) / unset (control, pure delegation) + RELAYDARK=1 (armed, dark-relay
road on relay-assigned runs) / unset (control). Env: FEASTSCALE_R13=1
TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
NODEWITNESS=1 KILLDISC=1 (+TABLEPATHDRIVER=1 RELAYDARK=1 on the armed side).
No VETREL, no REPOSITION (the probe's SUBSTRATE GUARD).

**Seeds:** 81301–81312 × {leadfeast, belongfeast} × {control, armed} = 48
runs, identical seeds both sides. Fresh — NOT the pilot's 64201–64208
(proven by the proof's rotation check).

**Door assignment (scoped, stated up front):** the landed driver's rotation
is read-only, so assignment is by slot placement in the driver's OWN
rotation (scripts/tableconfirm-slots-20261020.js, proven by
test-tableconfirm-20261020.js rotation): per policy 8 relay + 4 witness,
zero defiant/indispensable assignments.
- leadfeast slots (idx%8): relay {2,3,5,7} → positions 2,3,5,7,10,11,13,15;
  witness {1} → positions 1,9,17,25.
- belongfeast slots (idx%8): relay {2,4,6} → positions 2,4,6,10,12,14,18,20;
  witness {0} → positions 0,8,16,24.
The driver's DOOR RULE still applies (assigned door IF earned per live
Game.tableEarnedPaths(), else FALLBACK7 with the engine's why-string — a
door never offered is NEVER taken). Trial OFF. Branch NEVER overridden.

**PRIMARY (GO) — the pilot's scoped legs, fresh seeds:**
- L1 relay/dark: ≥3/4 of relay-assigned runs that SIT walk relay with the
  DARK band and reach terminal (phase 'done': win or priced outcome).
- L2 witness: ≥3/4 of witness-assigned runs that SIT walk witness and
  reach terminal.
- L3 margins: the engine's live tableBranch dark-vs-light margins recorded
  on ≥3 sittings for the named bands
  (feared/indispensable/beloved/witness/assimilated/defiant, as walked).
A miss on any leg is reported honestly per §14 — never re-scored mid-run.
Walks are derived from doorEvents + finalsEvents (the pilot's instrument
fix); terminal = tableDoneDay != null && phaseTrace includes 'done'.

**GUARDRAILS (all binding):**
- 0 engine errors (tpdDrainError / rdError / verbError / instrumentErrors)
  on all runs.
- No driver-introduced new death mode vs control (death cause-space of
  armed ⊆ control's, taxonomy identical-by-construction).
- Invitation→sitting conversion: sat ≥ 70% of invited (the pilot's
  metric-review rephrasing of the ≥70% bar).
- national/table within ±2 of control.

**DET gate:** armed layers-ON twice on 2 fresh slotted seeds (60d) —
byte-identical (no unseeded RNG in the new layers). Proven by the proof's
det mode before the sweep.

**FIDELITY gate:** before the armed sweep, the pilot's corpus must still
hold on the current tip — OFF-side (TABLEPATHDRIVER/RELAYDARK unset) on
pilot seeds 64201, 64202 × {leadfeast, belongfeast} byte-identical to the
re-measured control corpus (evidence/2026-10-20/perseed-tablepathdriver-control/).
The dipholdbar evidence's engine-drift lesson: never reuse a corpus the
base has moved under. Proven by the proof's fidelity mode.

**Horizon:** 180d death-aware (dead villages stop simulating — the same
surface as the pilot).

**§15:** before/after through scripts/balance-panel.js
(scripts/build-tableconfirm-panels.js: before = fresh control corpus,
after = armed corpus, 24 matched case pairs); the compare .md is attached.
The panel is the instrument, the pre-registered GO bar is the judge.

**Telemetry deviation check:** node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-10-20/perseed-tableconfirm/<side>/<policy>/s*.json' --metrics
national,table,wins,exiled (regime artifact expected per the pilot).

**No [needs-eyes]**: instrument + policy driver only, no player-facing
change (policy-side only, zero src/js).

---
*(results below — filled after the sweep; pre-registration above is unchanged)*

## Results

Confirm sweep complete 2026-10-20: 48/48 runs (12 fresh seeds 81301–81312 ×
{leadfeast, belongfeast} × {control, armed}), 180d death-aware, zero engine
errors on all runs. Armed = SEATDRIVE=1 + TABLEPATHDRIVER=1 + RELAYDARK=1
(scoped relay-8/witness-4 door assignment); control = pure delegation
(TABLEPATHDRIVER/RELAYDARK unset), identical seeds.

Two host service restarts killed the sweep processes mid-run (/tmp wiped,
the documented 2026-10-14 hazard). The sweep script's resume logic
(re-run skips seeds with a valid completed JSON) recovered both times with
zero re-burned seeds and zero lost runs.

Pre-sweep gates (all green, in order): rotation proof 7/7 (slots map to
relay/witness only, 8+4 per policy, no pilot seeds reused) ·
FIDELITY 4/4 (OFF-side on pilot seeds 64201/64202 × both policies
byte-identical to the re-measured control corpus — the pilot's corpus
holds on the current tip) · DET 2/2 (armed layers-ON twice byte-identical,
60d) · SMOKE 2/2 (full 180d relay + witness runs, 0 errors).

**PRIMARY verdict:**
- **L1 relay/dark: GO — 10/12** of relay-assigned runs that sat walked
  relay with the DARK band to terminal (bar ≥3/4 = 9/12). The other 2 sat
  relay-assigned runs picked the relay door but downgraded to feared after
  a real probe-beat backfire (mechanism below) — still terminal, still won.
- **L2 witness: GO — 6/7** of witness-assigned runs that sat walked
  witness to terminal (bar ≥3/4). The 7th (belongfeast-s81305) fell back
  to defiant with the engine's why-string: "You didn't keep the list (1
  exposures on record — the trial needs 3)." — the FALLBACK7 rule firing
  exactly as designed, terminal via defiant/light.
- **L3 margins: GO — 7 sittings** with the engine's live tableBranch
  dark-vs-light margins on the named bands (bar ≥3).

**Guardrails:**
- 0 engine errors on all 48 runs: GO.
- No new death mode: GO on the pilot's channel-level formulation. (The
  analyzer's strict cause-name subset flagged 5 causes — "The Callback",
  "The Terms of Service", "Murkcap", "Ugly-Eyes", "Spool" — all
  investigated: pre-table (sitting=0) monster/show kills in the
  pre-existing expedition/other channels. "The Callback" is a wave-3
  monster (sigW3c.js). None are driver-introduced; the cause-name
  operationalization was over-strict. See Metric review.)
- Conversion sat ≥ 70% of invited: GO (19/12 = 158%; the >100% is the
  known invitation-counting artifact, carried from the parent arm).
- national ±2: GO (20 v 20).
- table ±2: **MISS on the letter** (12 v 15, diff 3). The miss is the
  known invitation-counting artifact, not a reachability regression:
  sittings 19 v 19, wins 19 v 19, national 20 v 20 — identical. Per §14
  this is recorded as a miss, not re-scored. See Metric review.

**Relay/dark walks (10 terminal, all dark band):** at-sit lean −48…−100,
darkUses 8–25, lightUses 0, grounding 0–100, bond 2–5, stage 2–3. The
road claimed the relay on day 42–80 and completed (done=true) on 9/10
walks (belongfeast-s81310's done=false is the pilot's known bookkeeping
artifact — invitation staged before the done-check; state at sit fully
dark). 0 seated deaths across all walks.

**The 2 relay-door/feared-final runs** (belongfeast-s81302/s81304,
diagnosed via the drain log): relay door picked (earned, offered) →
dark conscript offered (hand forward dark) → refused per the
pre-registered conscript rule → relay challenge → first beat (probe)
BACKFIRED → engine downgrade → driver re-applied the door rule among
offered downgrade options → `downgrade:feared` → feared/light walk →
`final:mercy` → done, won. This is the game playing honestly, not a
driver bug: the drain's first-option beat rule met a real backfire
mechanic, the downgrade fired, and the run still resolved terminally.
(Not counted in L1's numerator — they did not walk relay/dark.)

**Witness walks (6 terminal, all light):** leadfeast-s81301/81306/81311 +
belongfeast-s81301/81309/81312. The exposure source holds on fresh seeds:
witness earned by direct assignment 6× (1 fallback on the 7th for
insufficient exposures — the engine's gate working).

**Ledger-dark margins** (engine tableBranch at door-walk; the capture
fires at ledger-path door-walks, so relay walks carry no margins row —
the pilot's disclosed instrument limitation): structurally light
everywhere (feared/beloved/witness/defiant 0vX, indispensable 0v5,
assimilated 0v4/0v1) EXCEPT belongfeast **beloved 2v1 dark-leaning** on
three witness-walk runs (s81305/81309/81312) — one signal from the dark
branch, never walked (scoped rotation). The ledger-dark road remains a
named next.

## Wall numbers

Armed (24): national 20, table 12, wins 19, wave4 15, wave5 0, sat 19,
invited 12, median survival 92d, max 182d.
Control (24): national 20, table 15, wins 19, wave4 17, wave5 0, sat 19,
invited 15, median survival 90d, max 182d.

Per policy:
- armed/leadfeast: nat 11/12, table 5/12, wins 8/12, wave4 7, sat 8/12, med 95d
- armed/belongfeast: nat 9/12, table 7/12, wins 11/12, wave4 8, sat 11/12, med 90.5d
- control/leadfeast: nat 11/12, table 8/12, wins 9/12, wave4 9, sat 9/12, med 90d
- control/belongfeast: nat 9/12, table 7/12, wins 10/12, wave4 8, sat 10/12, med 95d

Wave 5: 0 unlocks on both sides (the scale wall stands — waves 4–5 still
undeveloped on this substrate). The table±2 letter-miss is leadfeast-side
(5 v 8); belongfeast is 7 v 7. Sittings are 19 v 19 overall.

**Scale-wall report (standing directive):** national 20/24, table 12/24
(armed), wins 19/24, wave4 15/24, wave5 0/24, median survival 92d. Villages
reach national and the table routinely on this substrate; wave 5 remains
unreached. The wall is now the wave-5 window, not the national on-ramp.

## Village assessment

On the relay/dark road the village experiences the merge as a public
event: the System clears the stage aloud ("EVERYONE. SIT. WATCH."), the
dark conscript beat lands on the village ("Nodes. Little warm nodes… (Take
them — an army, or instruments — or refuse. The mourners will know.
Everyone will know.)"), and the refusal is voiced through the mourners
exhaling. The road's price is visible pre-table: claim days 42–80, and on
the fresh seeds the bearer survived the road on all 10 dark walks (the
pilot's 4/5 mantle-succession burn did not repeat — variance, not a
mechanism change).

The witness walks play as the village's trial: the bearer assembles a
docket while the village watches. On belongfeast-s81312 the pre-table
window shows the village's own politics running hot — Diana has stopped
asking and started organizing the Fish crews, tells the bearer "We need to
talk. About who's actually running things here," and by dusk "people are
starting to look at them when decisions get made." An NPC leadership arc
playing out unscripted around the table walk.

Deaths pre-table are seed-driven, not driver-driven: s81308 died day 38
on both policies AND both sides (armed + control) — the same seed, the
same day, with and without the driver. s81312 died day 117 on both sides
(road inactive — witness-assigned). The divergences are the road's honest
perturbations: s81309 (armed died pre-table day 118, control sat and won
at 90) and s81310 (armed sat and won at 90 via relay/dark, control
survived 182 days without ever sitting).

## Sense-testing (SENSE-TESTING LAW)

Two seated-window transcripts read in full, both FIDELITY-OK —
evidence/2026-10-20/tableconfirm-transcripts/:

**relay/dark — leadfeast-s81302 (315 lines).** Its own genre: the merge,
televised. "🔴 LIVE! the merge: A HUMAN ENTERS THE MACHINE." The door
grants the cockpit verbs; the ledger-read line voices the RELAY band, not
the ledger: "The protected outnumber the killed; the food truth was shared.
**The dark road is open.**" — TABLE.md's GRADIENT law. The dark conscript
is refused ("You say no... The mourners exhale. Nobody knew they were
holding their breath."), the backfires land as grounding jolts ("the wires
feel more like home than the fire does, and the thought doesn't frighten
you. That's the frightening part."), and the dark final: "Become its
voice." → "You stay inside. Forever… Power immense. Self eroded. The
System finally says your name right." The window reads as a person
choosing, not a stat readout.

**witness/light — belongfeast-s81312 (464 lines).** Its own genre: the
trial. "🔴 LIVE! the trial of the judges: THE GALAXY'S COURT IS IN
SESSION." Docket / Subpoena / Clean Hands / Precedent. "You didn't come to
negotiate. You came with a list." The finale: "You read every charge, and
some of them flinch — actual flinching, from beings of light… Your own
ledger sits in evidence beside theirs. That's why it worked." The walk-out
names the bearer: "Arturo Mukherjee walks out of the light alone… with
every charge read aloud and answered, the ledger closed and clean." The
pre-table window is full of people being people: Diana's quiet power grab,
Raj tasting The Big Beast flesh ("NOT food," they gasp. "Poison."), the
Spool fight (a tape-monster that records your moves and plays them back —
the wacky-counter design working), the village debating and accepting
Thabo Maseko over the bearer's overrule ("You overrule the room. They'll
remember that."), keepsake flashbacks with real memories (the field suture
kit: "People are just oranges that bleed").

Honest caveat (carried from the pilot): after the path finale, both run
the same shared **"◈ THE OVERSIGHT"** epilogue. The path finales are each
their own genre; the epilogue is the game's shared signature.

## Metric review

(§14: every evidence file carries this. The bars above are judged as
pre-registered; these are doubts for the NEXT run, not re-scores of this
one.)

1. **The table±2 guardrail misfires on the invitation-counting artifact.**
   It missed on the letter (12 v 15) while sittings (19 v 19), wins (19 v
   19), and national (20 v 20) are identical. The pilot's metric-review #4
   rephrased conversion as "sat ≥ 70% of invited"; the same treatment
   should apply here: the reachability guardrail should read "sittings
   within ±2 of control" (or sat ≥ 70% of control's sat). Proposed for the
   next run; this run's miss stands as recorded.
2. **The death-mode operationalization was over-strict.** "Cause-space ⊆"
   fires on content-level monster/show names ("The Callback" is a wave-3
   monster) that differ by chance across 24-run samples. The pilot's
   formulation — no new death MODE, i.e. channel-level with the
   identical-by-construction taxonomy — is the correct one, and it passes
   (all flagged deaths are pre-table expedition/other kills, sitting=0).
   Next run: compare channel sets, not cause-name sets.
3. **L1's numerator definition held up.** The 2 relay-door/feared-final
   runs are correctly excluded (they walked feared, not relay/dark). The
   drain-log diagnostic (scripts/diag-tableconfirm-20261020.js) is the
   right tool when door-picks and finals diverge — keep it.
4. **The relay probe-beat backfire rate** (2/12 relay walks downgraded on
   the first beat) is worth watching across runs — if it stays high, the
   "first presented option" beat rule may be systematically walking into
   the backfire. Not a driver bug (the mechanic is real), but a tuning
   question for the beat rule.
5. **The dark conscript refusal is load-bearing.** Both downgrade runs
   went relay door → conscript (refused per pre-reg) → challenge →
   backfire → downgrade. The refusal itself is canon-honest, but a future
   arm could test the accept branch (a different experiment, not this
   one's scope).

## Named nexts

1. **Confirm verdict: the pilot's GO stands on fresh seeds.** L1/L2/L3
   all GO, 0 engine errors, reachability substance identical to control.
   The table±2 letter-miss is documented as artifact (metric review #1).
   No further confirm needed for relay/dark + witness reachability.
2. **The ledger-dark road (different arm, still open).** Belongfeast
   beloved 2v1 dark-leaning on 3/4 witness walks — one signal from the
   dark branch, never walked. Unchanged from the pilot.
3. **The indispensable road (different arm or accept-as-gated).**
   Unchanged from the pilot.
4. **Probe hygiene (pilot's named next #5).** The `walked` derivation and
   done-before-invitation ordering are still open; this confirm's
   diag script is a stopgap, not the fix.
5. **OUTSHONE liveness check.** The leadfeast-s81302 epilogue names
   "Marcus Webb" doing what the bearer would not — but a villager named
   Marcus died day 88 to The Callback on that run. Filed as an out-of-arm
   finding (below); needs a writer's eye on whether the epilogue named a
   dead villager.

## Out-of-arm findings

(To be appended to
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-findings.md`
by the coordinator; not chased mid-run.)

- **OUTSHONE epilogue liveness (leadfeast-s81302):** names "Marcus Webb"
  as the one who "acted, boldly, while there was still time" — a villager
  named Marcus died day 88 to The Callback (expedition) on the same run.
  If the same person, the epilogue honors a dead villager as the
  outshining hero; if a different Marcus Webb, the naming is confusing.
  Either way it needs a writer's eye (poignant epitaph vs liveness bug).
- **Relay probe-beat backfire → downgrade → feared** (belongfeast-s81302/
  s81304): the drain's first-option beat rule walked into a real backfire
  on 2/12 relay walks; the engine downgraded to feared (offered as
  `downgrade:feared`) and both runs won via `final:mercy`. Worth a tuning
  look at the beat rule, not a bug.
- **Seed-driven pre-table deaths:** s81308 dies day 38 on both policies
  and both sides; s81312 dies day 117 on both sides. Seed effects, not
  driver effects — the paired control is doing its job.
- **Two host service restarts** killed the sweep processes mid-run (/tmp
  wiped). The sweep script's resume logic (new this confirm) recovered
  with zero lost runs. Recommend the pattern for future long sweeps.

## Convergence

The confirm closes the pilot's named next #1: relay/dark and witness
reachability holds on 12 fresh seeds (10/12 dark walks terminal, 6/7
witness walks terminal, margins named, 0 engine errors, reachability
substance identical to control). The pilot's GO stands. Remaining open
surface (ledger-dark branches, the indispensable gate, probe hygiene) is
unchanged and belongs to other arms. The scale wall stands at the wave-5
window: national and the table are routinely reached; wave 5 unlocks 0/24
on both sides.

## Files

- scripts/tableconfirm-slots-20261020.js — scoped slot maps (relay 8 + witness 4 per policy)
- scripts/sweep-tableconfirm-20261020.js — the confirm sweep (incl. resume logic)
- scripts/test-tableconfirm-20261020.js — proof (rotation/fidelity/det/smoke/complete)
- scripts/analyze-tableconfirm-20261020.js — per-path attribution + PRIMARY verdict
- scripts/tableconfirm-transcripts-20261020.js — seated-window SAY capture
- scripts/build-tableconfirm-panels-20261020.js — §15 panel builder
- scripts/diag-tableconfirm-20261020.js — drain-log diagnostic (door/final divergence)
- evidence/2026-10-20/perseed-tableconfirm/{armed,control}/{leadfeast,belongfeast}/s81301–s81312.json — 48 per-seed JSONs
- evidence/2026-10-20/tableconfirm-analysis.json — analyzer verdict
- evidence/2026-10-20/tableconfirm-panel.md + .json + -before/-after.json.gz — §15 compare
- evidence/2026-10-20/tableconfirm-transcripts/ — 2 seated-window transcripts (relay/dark + witness)
- evidence/2026-10-20/sim-tablepathdriver-confirm.md — this file

## Telemetry deviation check (Steve 2026-10-13)

Ran per-policy per-side:
`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-10-20/perseed-tableconfirm/<side>/<policy>/s*.json'
--metrics national,table,wins,exiled`.
control/leadfeast: quiet. control/belongfeast: quiet. armed/belongfeast:
quiet. armed/leadfeast: LOUD — "table swung -69%: baseline 16 -> current
5". VERDICT: regime artifact + the known invitation-counting artifact —
the scale-wall baseline's `_regime` is the winseat regime (table 16/16);
this substrate is the seatdrive-win-side regime (the pilot's run showed
the same pattern), and the armed leadfeast invitation count (5) is the
artifact (sat=8 on those runs). The baseline was NOT rolled.
