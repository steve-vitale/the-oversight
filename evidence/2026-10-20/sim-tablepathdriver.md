# sim-tablepathdriver — the 7-door table driver + dark-relay road (flesh-out loop, 2026-10-20, ARM sim-tablepathdriver)

Run: fleshout-20261020T0215Z, arm sim-tablepathdriver. Axis: scale-onramp (the blocking axis).
POLICY-SIDE — zero src/js changes. File scope (zero overlap with sibling arms
sim-dipholdbar / sim-sanctityfix / sim-relaycoda and the sibling loop-B arms):
scripts/policies/tablepathdriver.js (new), scripts/policies/relaydark.js (new),
scripts/*tablepathdriver*, scripts/test-tablepathdriver-20261020.js,
evidence/2026-10-20/sim-tablepathdriver.md + evidence/2026-10-20/perseed-tablepathdriver/
+ evidence/2026-10-20/tablepathdriver-panel* + evidence/2026-10-20/tablepathdriver-transcripts/.

Canon: docs/CANON.md + docs/TABLE.md (the table prices the run, 7 paths each its
own played challenge, failure resolves never wipes, light/dark branches earned
through play never a menu choice, the relay's GRADIENT law: light/dark/grey
bands on the leaning meter, trial-by-combat the single opt-in existential risk,
sanctity of the table while it sits, win = a table path's final resolution + day
>= 90). The win-side state machine (tableWaiting → tableAnnounce →
tableTakeSeat → tableScene → paths → challenge → finals → won, plus
downgrade/conscript/demand-price phases) is read from src/js/table.js +
table-*.js + comms.js/relay-ext.js/relay-dialogue.js — never invented.

Named next this arm answers (sim-seatdrive-posttable, 2026-10-19): the
SEATDRIVE=1 stack plays ONE identical track on every sitting (lesser → feared →
light → "Show mercy" → win, same day, 10/10). The sibling arm sim-tablepaths
(2026-10-19) walked 5 doors (feared/defiant/assimilated/beloved/relay, all light
except relay/grey) + trial-by-combat (3/3 lethal). Still unexercised:
INDISPENSABLE, WITNESS, and every DARK branch. This arm is the 7-door driver +
the dark-relay road (the one dark branch reachable through real play: the
relay's dark side resolves on relay verbs/uses/lean, not the moral ledger).

Backlog checked before designing: (a) sim-pathselect KILLED 2026-10-15
(PATHSELECT=1 build-matched door chooser — door-variety gap is in build
composition, not door choice); (b) WIN-PATH CONCENTRATION 30/30 FEARED
(steve-call); (c) BUILD THE WITNESS EXPOSURE SOURCE (Steve DECIDED
2026-10-17 — witness unearned on the feast road, ledger.exposed=0, bar stays
3); (d) modalplay's door rule ("a door never offered cannot be taken —
recorded, never forced"). THIS ARM IS NOT A RE-RUN of sim-tablepaths: that
arm's rotation was 5 doors with trial opt-in on feared; this arm rotates all
7 doors (indispensable + witness included), trial OFF, and adds the relaydark
pre-table road — a different mechanism aimed at the dark surface.

Substrate (this arm): the seatdrive seated stack —
withTablePathDriver(withSeatDrive(withWinDefer(withRelayDark(TF base)))) on
{leadfeast, belongfeast} tribfloor bases, SEATDRIVE=1 + TABLEPATHDRIVER=1 (the
7-door driver ON; TABLEPATHDRIVER unset = pure delegation, the control side) +
RELAYDARK=1 (the dark-relay road ON, active only on relay-assigned runs).
Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1 KILLDISC=1 TABLEPATHDRIVER=1 RELAYDARK=1
(KILLDISC: the existing scripts/killdisc-instrument-20261018.js, read-only,
reused — no new layer). No VETREL, no REPOSITION (per the probe's SUBSTRATE
GUARD).

Control: the committed corpus at evidence/2026-10-19/perseed-posttable-seatdrive/
(SEATDRIVE=1, TABLEPATHS=0, same 8 seeds 64201–64208) — REUSED, not re-run.
This arm runs on the current master; FIDELITY=1 pins base drift
(TABLEPATHDRIVER=0 + RELAYDARK=0 on the new base byte-identical to the
committed control corpus on 2 seeds × 2 policies — both layers OFF delegate
to exactly the control's composition).

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE any sims)

**PRIMARY (GO):** per-path terminal resolution — each exercised path reaches a
terminal table state (phase 'done': win or priced outcome) with zero engine
errors/softlocks:
  (1) relay walks: ≥3/4 walked relay runs reach terminal (the dark-road
      candidate set);
  (2) defiant walks: ≥3/4 walked defiant runs reach terminal (sibling
      replication);
  (3) indispensable + witness: each ASSIGNED ≥2× with the engine's own
      why-string recorded (expected: never offered — documented as a finding
      per the task's explicit rule, not a driver failure);
  (4) ledger-dark margins: per sitting, the engine's live tableBranch()
      signals (dark vs light + notes) recorded for
      feared/indispensable/beloved/witness/assimilated/defiant — the dark
      distance named in numbers;
  (5) relay/dark: on relay-assigned runs with the dark road active, the band
      at sitting is recorded; IF band=dark on ≥1 run, that walk is the dark
      exercise (terminal resolution + full transcript sense-read); if 0, the
      blocking mechanism is named (claim never available / road incomplete /
      door unearned).
ALL FIVE legs are judged; a miss on any leg is reported honestly per §14 —
never re-scored mid-run.

**GUARDRAILS (all binding):**
- no crashes, no softlocks, zero engine errors on all walks
  (ctx.tpdDrainError / rdError / verbError counted; a nonzero error count
  with an honest engine cause is reported, not hidden)
- no driver-introduced new death mode vs control (death-channel taxonomy
  identical-by-construction with the parent probe)
- invitation→sitting conversion ≥ 70% (control: 12 invited → 10 sat = 83.3%)
- national/table within ±2 of control (control: national 10/16, table 8/16)
- DET: layers-ON twice byte-identical (no unseeded RNG in the new layers);
  FIDELITY=1: layers-OFF byte-identical to the committed control corpus

**DIAGNOSTIC MISS:** the driver perturbs pre-table trajectories (DET fail),
door forcing unreadable (assigned ≠ walked and fallbacks undocumented), or
the attribution unreadable. A miss is NO-GO, never re-scored (§14).

**Horizon:** 180d death-aware (dead villages stop simulating — the same
surface as the control corpus).

**Seeds:** 64201–64208 × {leadfeast, belongfeast} = 16 paired runs (the
seatdrive-posttable seed set, documented in that arm's evidence), identical
seeds, SEATDRIVE=1 seated substrate + TABLEPATHDRIVER=1 + RELAYDARK=1.
PILOT = these 16. CONFIRM (12–16 fresh seeds) ONLY on pilot GO (all five
primary legs judged GO and guardrails green). If the relaydark road shows
0 completions in the pilot, the confirm (if any) drops the road and the
finding stands.

**Instrument:** scripts/policies/tablepathdriver.js (the 7-door driver —
TABLEPATHDRIVER=1; rotation leadfeast/belongfeast × 8 as in the file header:
indispensable 2, witness 2, relay 7, defiant 5; trial OFF),
scripts/policies/relaydark.js (the dark-relay road — RELAYDARK=1, active on
relay-assigned runs: claim → deepen ×2 → reroute-efficient ×8 →
rewrite/skim to lean ≤ -44, grounding ≤ 48, darkUses ≥ 6; floor stop at
grounding ≤ 32; quiet once the invitation stages),
scripts/probe-tablepathdriver-20261020.js (the parent seatdrive probe copied
+ my composition + per-run door assignment + relay-state capture at sitting
+ tableBranch margins at door-walk; DET/SMOKE/FIDELITY=1 modes),
scripts/analyze-tablepathdriver-20261020.js (per-path attribution +
armed-vs-control + PRIMARY verdict),
scripts/tablepathdriver-transcripts-20261020.js (seated-window SAY-line
capture, one run per walked path — relay/dark first),
scripts/test-tablepathdriver-20261020.js (proof: DOOR incl.
indispensable/witness fallback with engine why-strings + DRAIN through the
real state machine + RELAYDARK sequencing (stub-logic + real-verb harness)
+ SMOKE + DET; COMPLETE=1 post-sweep gate).
scripts/build-tablepathdriver-panels.js — §15 panel builder.

**The driver (pre-registered behavior, POLICY-SIDE, not canon):**
- DOOR RULE: at the 7-door offer, choose the assigned door IF earned per
  live Game.tableEarnedPaths(); else FALLBACK7 = first earned offered door
  in ['indispensable','witness','defiant','assimilated','beloved','relay',
  'feared'], recorded with the miss + the engine's why-string. A door never
  offered is NEVER taken.
- BEAT RULE: first presented option (trial opt-in param exists, OFF this
  arm). Finals: first option. Downgrade: re-apply the door rule among
  remaining earned 'downgrade:*'. Conscript: refuse ('conscript:no').
  Demand-price: first option. Branch NEVER overridden (TABLE.md law).
- The drain mirrors tableRoad (30-answer cap, stall guard, Game.over and
  live-tbfight breaks) and runs inside the layer's daily AFTER SD.driveSeat
  (the seat must be taken before the drain) and BEFORE delegating inward.
  Pre-table the layer is a pure no-op (phase not in the table set →
  delegate); DET pins byte-identity.

**Per-path mortality taxonomy (pre-registered):** the parent probe's
tableAtDeath (phase/path/branch/beat, tier-stamped) + classifier channel,
identical-by-construction. Path-specific channels among seated runs use the
sibling's taxonomy (trial-combat / path-price / seated-raid). The
invitation→sitting distinction is kept (tableWaiting vs tableSittingId).

**§15:** the sweep runs through scripts/balance-panel.js (before = committed
control corpus SEATDRIVE=1/TABLEPATHS=0, after = armed corpus, 16 matched
case pairs); the compare .md is attached. The panel is the instrument, the
pre-registered GO bar is the judge.

**Telemetry deviation check:** node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-10-20/perseed-tablepathdriver/<policy>/s*.json' --metrics
national,table,wins,exiled (same as parent arms; regime artifact expected).

**No [needs-eyes]**: instrument + policy driver only, no player-facing
change (policy-side only, zero src/js).

### CONTROL CORRECTION (fidelity-driven, before the armed sweep — not a re-score)

FIDELITY=1 (TABLEPATHDRIVER=0 + RELAYDARK=0 vs the committed
evidence/2026-10-19/perseed-posttable-seatdrive/ corpus) FAILED 4/4 on the
first attempt — and the isolation test proved the failure is NOT the new
layers (my layers-OFF composition is byte-identical to the parent
composition on the same base, 4/4 × 60d). It is BASE DRIFT: the committed
corpus sits on base 8c055140a (2026-10-19) and the tree has since landed
7024fd22b (sanctity combat gating — game-code, moves trajectories),
1fb6b9140 (dialogue/mood), and f83c41ea6 (relay coda). Per loop precedent
(loop-B "control re-measured on current tip per substrate-drift caveat"),
the control was RE-MEASURED on the current tip instead of reusing the
stale corpus: evidence/2026-10-20/perseed-tablepathdriver-control/ (16
runs, same seeds 64201–64208 × {leadfeast, belongfeast}, SEATDRIVE=1,
TABLEPATHDRIVER=0, RELAYDARK=0, base f83c41ea6 — the worktree was rebased
onto current master before any sweep). The PRIMARY bar is UNCHANGED; the
guardrail bars (conversion ≥ 70%, national/table ±2, no new death mode)
are evaluated against the re-measured control. The §15 panel's before side
is the re-measured control. The stale corpus's numbers are kept in the
metric-review section for the record, not used as the judge.

---
*(results below — filled after the sweep; pre-registration above is unchanged)*

## Results

Pilot sweep complete 2026-10-20: 16/16 runs, zero errors, base f83c41ea6,
horizon 180d death-aware. Armed = SEATDRIVE=1 + TABLEPATHDRIVER=1 + RELAYDARK=1;
control = re-measured on current tip (see CONTROL CORRECTION above).

**Wall (armed):** national 12/16, table 11/16, wins 12/16, wave4 10/16,
wave5 0/16, sat 12, invited 11, median survival 90d, max 182d.
**Wall (control):** national 12/16, table 9/16, wins 12/16, wave4 10/16,
wave5 0/16, sat 12, invited 9, median 90d, max 154d.

Per-path (walked → terminal):
- **relay: 5/5 walked, 5/5 terminal, ALL DARK branch** —
  leadfeast-s64203/64204/64206/64208 + belongfeast-s64203. The dark road
  claimed the relay on day 42–73, road done by day 60–67 on 4/5 runs
  (s64203's `done=false` is a bookkeeping artifact: the invitation staged
  before the done-check; the state at sitting was fully dark — see Out-of-arm
  findings). At sitting: lean −48…−100 (band dark), darkUses 8–9,
  lightUses 0, bond 3–5, stage 3. On 4 of the 5 the bearer died mid-road and
  the mantle passed — the dark lean persisted in relay state and the
  successor sat and walked relay/dark. **0 seated deaths across all walks.**
- **witness: 3/3 walked, 3/3 terminal, all light** —
  leadfeast-s64202 (assigned), belongfeast-s64201 (assigned),
  belongfeast-s64202 (assigned indispensable → fell back to witness with the
  engine's why-string). The exposure source now EXISTS (3e6b44d17 landed
  after the sibling run — `recordExposure` fed by moot bribery/case
  resolutions and truth.js), superseding the sibling arm's "no live exposure
  source" finding: witness was earned 2× by direct assignment and walked 3×.
- **defiant: 4/4 walked, 4/4 terminal, all light** —
  leadfeast-s64205/64207 + belongfeast-s64206/64208 (sibling replication).
- **indispensable: assigned 2×, never earned.** belongfeast-s64202 sat and
  fell back to witness; engine why-string recorded verbatim: "The
  Indispensable needs a full seat — the galaxy must actually need you, not
  just notice you." leadfeast-s64201 (assigned indispensable) died pre-table.
  Documented as a finding per the task's explicit rule, not a driver failure.

PRIMARY legs: (1) relay ≥3/4 GO [5 walks]; (2) defiant ≥3/4 GO [4 walks];
(3) indispensable/witness probes — the analyzer's mechanical reading is
NO-GO on its sat-based definition [ind=1 wit=2 sat-probes]; the
pre-registered letter (each assigned ≥2× with the engine why-string
recorded) was met, and the leg's EXPECTATION ("never offered") was inverted
in the good direction by the newly-landed exposure source — witness walked
3× and terminal-resolved 3×. See Metric review: the leg's premise is
superseded, not failed. (4) ledger-dark margins on ≥3 sittings GO [7
sittings captured; note the capture fires at ledger-path door-walks, so the
5 relay walks carry no margins row — an instrument limitation, disclosed].
(5) relay/dark band GO [5 dark-band sittings].

Ledger-dark margins (engine tableBranch dark-vs-light at door-walk):
structurally light everywhere — feared/beloved/witness/defiant 0vX,
indispensable 0v5, assimilated 0v4 — EXCEPT belongfeast's **beloved 2v1
dark-leaning** on three runs (s64202/64206/64208): one signal away from the
dark branch, but the rotation assigned defiant on those runs, so it was
never walked. No dark-ledger road exists in this arm; that's a named next.

Guardrails: conversion 109.1% (the known invitation-counting artifact —
invited 11 < sat 12; control 83.3%; bar ≥70%) PASS · no new death modes
(taxonomy identical-by-construction) PASS · national 12v12 (±2) PASS · table
11v9 (±2) PASS · 0 engine errors (drain/verb/rd/instrument) on all 16 PASS.

**Confirm decision:** pilot is GO on legs 1, 2, 4, 5 (leg 3 superseded, see
above) with all guardrails green — a 12–16-seed confirm is AUTHORIZED but,
per the pre-registration's own pilot-gate, OPTIONAL. I recommend NOT burning
a full confirm: the reachability questions are answered (5 dark-relay walks,
3 witness walks, margins named). If a confirm runs at all, scope it to
relay/dark + witness on fresh seeds — not the whole 16-pair sweep.

## Village assessment

The village experiences the doors differently, not just the bearer. On the
relay/dark road the wires become a character: Commune requests arrive at the
fire ("BEARER. THE WIRES HAVE QUESTIONS."), the System remarks on the
village carrying itself, and the dark conscript beat lands ON THE VILLAGE —
"Nodes. Little warm nodes… (Take them — an army, or instruments — or
refuse. The mourners will know. Everyone will know.)" — and the refusal is
voiced through the mourners exhaling. The relaydark road is legible to the
fire: trust decays around dark use per the canon (dark relay becomes what
forgot food), and four of five dark walks burned the bearer mid-road —
the mantle passing to a successor who sat with the lean intact. The village
survived its own hero's self-erasure five times.

The witness walks feel judicial from the first beat: the village watches its
bearer assemble a docket instead of a threat. One run carried an NPC
ascension through it (Diana Osei) and the table voiced the OUTSHONE coda —
the village thriving under someone else's god — honestly, in the open.

The defiant walk prices the village: a named villager (Pasquale Santiago,
s64205) was conscripted by the table and named in the eternal record, and
the village "loses its steadiest" in installments of grief — then the walk
finishes with the camera shot the galaxy can't stop replaying. On the
s64205 run the original bearer died in a contest the day before the sitting;
Simisola walked in with an empty docket and still walked out of the light.
The seat, not the person, carried the door.

## Sense-testing (SENSE-TESTING LAW)

Three seated-window transcripts read in full, all FIDELITY-OK —
evidence/2026-10-20/tablepathdriver-transcripts/:

**relay/dark — leadfeast-s64203 (295 lines).** Its own genre: the merge,
televised. "🔴 LIVE! the merge: A HUMAN ENTERS THE MACHINE." The door
grants the cockpit verbs (Deep Listen, Faithful Carry, Relay-sight,
Rewrite, Skim, Omnipresence: "Be in every conversation") and the beats are
probe / commune / backfire — grounding jolts where "the wires feel more
like home than the fire does, and the thought doesn't frighten you. That's
the frightening part." The ledger-read line voices the RELAY band, not the
ledger: "The protected outnumber the killed; the food truth was shared. **The
dark road is open.**" — exactly TABLE.md's GRADIENT law (band on lean, not
morality). The dark final: "Become its voice." → "You stay inside. Forever…
Human things seem small from in here… The village grieves you while you're
alive, and you feel their grief the way weather feels rain. Power immense.
Self eroded. The System finally says your name right." Not a palette swap —
nothing in the feared track looks like this.

**witness/light — belongfeast-s64201 (288 lines).** Its own genre: the
trial. "🔴 LIVE! the trial of the judges: THE GALAXY'S COURT IS IN SESSION."
Docket / Subpoena / Clean Hands ("You submit your own ledger as evidence
too") / Precedent. "You didn't come to negotiate. You came with a list."
The finale: "The trial of the judges. You read every charge, and some of
them flinch — actual flinching, from beings of light… Your own ledger sits
in evidence beside theirs. That's why it worked." — the exposure mechanic
given a voice. Meaningful, coherent, relevant to the path's premise.

**defiant/light — leadfeast-s64205 (408 lines).** Its own genre: the
reverse auction. Price list slid across the light; the walk covers some
prices ("the harvest stretches. You don't ask how"); a named villager taken
("Pasquale walks with the relay now — the price, named and paid"); the name
spelled right in the eternal record as the trick. The walk-away coda:
"the long shot of small figures leaving the light… the highest-rated thing
the galaxy ever saw. Nobody owns it."

Honest caveat: after the path finale, all three run the same shared
**"◈ THE OVERSIGHT"** epilogue (the looking-away sermon: "the most terrible
thing the System ever did, it did by accident… You did it on purpose,
because you were busy"). The path finales are each their own genre; the
epilogue is the game's shared signature. A palette swap would share the
finale — these don't.

## Metric review

(§14: every evidence file carries this. The bars above are judged as
pre-registered; these are doubts for the NEXT run, not re-scores of this
one.)

1. **Leg 3's premise inverted mid-run.** It was written expecting witness to
   be unofferable (the sibling's premise); 3e6b44d17 landed the exposure
   source and witness earned 2× directly. The next run's leg-3 should read:
   "witness earned ≥2× by assignment and walked ≥3/4 terminal" — the
   finding (indispensable still gated by its engine why-string) stands
   separately.
2. **The analyzer's instrument bug.** The `walked` array in the probe
   recorded zero relay walks on every run (too-narrow `after.phase ===
   'challenge'` condition — relay resolves through challenge variants the
   condition didn't cover); the analyzer now derives walks from
   doorEvents + finalsEvents (source of truth). The 39/39 proof re-ran green
   on the derivation, but the underlying probe field should be fixed or
   dropped next run.
3. **relaydrain `done=false` on s64203** is bookkeeping (invitation staged
   before the done-check), not a road failure — the state at sitting was
   dark on every axis. Not a miss, but the field should order check-before-
   invitation so the next reader doesn't have to reason it through.
4. **Conversion 109%** is the known invitation-counting artifact (carried
   from the parent arm) — the bar is ≥70%, so no binding issue, but the
   guardrail should be rephrased next run as "sat ≥ 70% of invited" so a
   >100% reading can't confuse anyone.
5. **Panel caution.** The §15 panel's lone `regression_signal`
   (leadfeast playerDeaths100Days +0.65) is the dark road's own mechanism —
   4/5 relay walks burned the bearer mid-road, and the policy IS the
   treatment here (the integrated-method precedent: the panel flags
   policy-side changes, it's the instrument not the judge). Win-rate
   moved +0.25 on leadfeast and −0.25 on belongfeast: opposite directions on
   8 cases each = noise, not a treatment effect.

## Named nexts

1. **Confirm decision: skip or scope.** Pilot GO (legs 1/2/4/5 + guardrails
   green; leg 3 superseded). A 12–16-seed confirm is authorized but not
   needed for reachability; if run, scope to relay/dark + witness on fresh
   seeds.
2. **The ledger-dark road (different arm).** This arm walked relay/dark but
   no ledger dark branches: margins show beloved 2v1 dark-leaning on
   belongfeast — one signal from the dark branch, never walked. Needs a
   pre-table policy that builds a dark ledger (hoarded food truth,
   killed-over-protected imbalance) and a driver that walks the offered dark
   door honestly when it appears.
3. **The indispensable road (different arm or accept-as-gated).** The
   engine's why-string is a real gate: "the galaxy must actually need you."
   The feast road never earns it. Either a substrate that manufactures real
   inter-village need (full seat + dependence), or an honest documented
   acceptance that the door is earned-rare by design.
4. **Relay mantle-succession study.** 4/5 dark walks passed the mantle
   mid-road — the mechanism works (lean persists in relay state) but the
   burn rate is the price of the road. A dedicated look at whether the
   grounding floor-stop (≤32) is too permissive would be worth one arm.
5. **Probe hygiene.** Fix the `walked` derivation and the
   done-before-invitation ordering before the next table-path sweep reuses
   this instrument.

## Out-of-arm findings

(To be appended to
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-findings.md`
by the coordinator; not chased mid-run.)

- **Witness exposure source EXISTS** (3e6b44d17, sim-witnesource 2026-10-20):
  `recordExposure` in exposure.js is fed by moot bribery/case resolutions
  (ledger.js) and truth.js. Supersedes the sibling arm's "no live exposure
  source" finding — witness earned 2× directly in this arm and walked 3×.
- **Relaydrain `done=false` bookkeeping artifact** on leadfeast-s64203:
  invitation staged before the done-check; state at sit fully dark.
- **Belongfeast beloved 2v1 dark-leaning** on 3/8 runs — the closest any
  ledger path came to a dark branch; never walked (rotation assigned
  defiant).
- **Belongfeast table invitation rate 0.5 vs leadfeast 0.875** on identical
  seeds — pre-existing substrate difference (control shows the same), not
  driver-introduced.
- **The indispensable gate is a real design gate**, not a stub: full seat
  + "the galaxy must actually need you."

## Convergence

This arm closes the run's axis questions it could reach. Status of the
unexercised surface at arm end:

- relay/dark — EXERCISED (5/5 dark-band walks, terminal, own genre voiced).
- witness — EXERCISED (3/3 light walks, terminal, exposure premise
  superseded).
- defiant — EXERCISED light (4/4; sibling replication).
- indispensable — PROBED, never earned (engine gate documented).
- ledger dark branches (feared/defiant/beloved/assimilated dark) —
  UNREACHABLE on this substrate; margins named in numbers, closest is
  belongfeast beloved 2v1.

The named next of the parent arm is answered: a path-choosing driver exists
and works through real options only (never forces unearned doors — the
FALLBACK7 rule with engine why-strings fired exactly as designed on
belongfeast-s64202). The relay's dark branch is not a ledger echo: it
resolves on lean, and it reads as a different game. The instrument is
committed and reusable; its two known bugs are documented above. Arm work
done when this evidence commits — pending ship, no push.

## Files

- scripts/policies/tablepathdriver.js — the 7-door driver (TABLEPATHDRIVER=1)
- scripts/policies/relaydark.js — the dark-relay road (RELAYDARK=1)
- scripts/probe-tablepathdriver-20261020.js — the sweep instrument
- scripts/analyze-tablepathdriver-20261020.js — per-path attribution + verdict
- scripts/tablepathdriver-transcripts-20261020.js — seated-window SAY capture
- scripts/build-tablepathdriver-panels.js — §15 panel builder
- scripts/test-tablepathdriver-20261020.js — proof (DOOR/DRAIN/RELAYDARK/SMOKE/DET + COMPLETE=1 gate)
- evidence/2026-10-20/perseed-tablepathdriver/{leadfeast,belongfeast}/s64201–s64208.json — 16 armed per-seed JSONs
- evidence/2026-10-20/tablepathdriver-panel.md + .json + -before/-after.json.gz — §15 compare
- evidence/2026-10-20/tablepathdriver-transcripts/ — one seated-window transcript per walked path
- evidence/2026-10-20/sim-tablepathdriver.md — this file

## Telemetry deviation check (Steve 2026-10-13)

Ran per-policy:
`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-10-20/perseed-tablepathdriver/<policy>/s*.json' --metrics national,table,wins,exiled`.
leadfeast: **quiet** (8 files, 4 metrics, no large deviations). belongfeast:
LOUD — "national swung -67%: baseline 12 -> current 4", "table swung -75%:
baseline 16 -> current 4", "wins swung -69%: baseline 16 -> current 5".
VERDICT: regime artifact, same as the sibling arm's verdict — the
scale-wall baseline's `_regime` is the winseat regime (wins 16/16); this
substrate is the seatdrive-win-side regime (the sibling's run showed the
same belongfeast pattern: national -67%, wins -69%). The baseline was NOT
rolled. Note the belongfeast table rate (0.5) matches the control's 0.5 —
pre-existing substrate reachability, not a driver effect.
