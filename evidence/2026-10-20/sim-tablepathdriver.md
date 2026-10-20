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

---
*(results below — filled after the sweep; pre-registration above is unchanged)*

## Results

PENDING — pilot sweep not yet run.

## Village assessment

PENDING.

## Sense-testing (SENSE-TESTING LAW)

PENDING — full transcripts read for each walked path (relay/dark first if
it walks).

## Metric review

PENDING — every evidence file carries this section (§14). Pre-registered
honest doubts for the NEXT run (not this one): none yet; the five primary
legs and guardrails above are judged as written.

## Named nexts

PENDING.

## Out-of-arm findings

(none yet — appended to
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-findings.md`
as they surface; not chased mid-run.)

## Convergence

PENDING.

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

PENDING.
