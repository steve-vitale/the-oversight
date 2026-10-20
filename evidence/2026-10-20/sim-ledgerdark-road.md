# sim-ledgerdark-road — the dark-ledger road + the beloved/dark walk (flesh-out loop, 2026-10-20, ARM sim-ledgerdark-road)

Run: fleshout-20261020T0215Z, arm sim-ledgerdark-road. Axis: scale-onramp (the blocking axis).
POLICY-SIDE — zero src/js changes. File scope (zero overlap with the landed
20261020 tablepathdriver instruments and the sibling arms): scripts/policies/ledgerdark.js (new),
scripts/probe-ledgerdark-20261020.js, scripts/analyze-ledgerdark-20261020.js,
scripts/ledgerdark-transcripts-20261020.js, scripts/build-ledgerdark-panels.js,
scripts/test-ledgerdark-20261020.js, scripts/diag-ledgerdark-20261020.js,
evidence/2026-10-20/sim-ledgerdark-road.md + evidence/2026-10-20/perseed-ledgerdark/
+ evidence/2026-10-20/ledgerdark-panel* + evidence/2026-10-20/ledgerdark-transcripts/.
NEVER EDIT scripts/policies/tablepathdriver.js, scripts/policies/relaydark.js,
or any landed 20261020 tablepathdriver instrument — they are composed upon,
not modified.

Canon: docs/CANON.md + docs/TABLE.md (the table prices the run; 7 paths each
its own played challenge; failure resolves never wipes; light/dark branches
earned through play never a menu choice — the six non-relay paths resolve on
the MORAL LEDGER: protected vs killed, betrayed, foodShared vs foodHoarded,
promises kept/broken, switchboard edited+skimmed vs routed; the relay's
GRADIENT law is separate). The moral-ledger writers are read from src/js/
ledger.js + party.js + villageAgency.js + game.js — never invented.

Named next this arm answers (sim-tablepathdriver, 2026-10-20, named next
#2): "The ledger-dark road (different arm). This arm walked relay/dark but
no ledger dark branches: margins show beloved 2v1 dark-leaning on
belongfeast — one signal from the dark branch, never walked. Needs a
pre-table policy that builds a dark ledger (hoarded food truth,
killed-over-protected imbalance) and a driver that walks the offered dark
branches."

Backlog checked before designing: the pilot's named nexts #1 (confirm
scope), #3 (indispensable road), #4 (mantle-succession study), #5 (probe
hygiene) are other arms' or accepted; none is claimed here. The door-variety
gap is build composition, not door choice (sim-pathselect KILLED
2026-10-15) — this arm does not re-litigate it.

## Design

THE ROAD (scripts/policies/ledgerdark.js, LEDGERDARK=1) — pre-table, additive
(the base barely shares: diagnostic on the control substrate at day ~90
shows foodShared 0-2, foodHoarded 0, killed 0, betrayed 0, promises 0/0;
showmanship 11-13; protected 34-35 leadfeast / 0-14 belongfeast — so no
donation-suppression is needed, and suppressing would gut the feast
substrate's contribution rule):
1. REFUSE BEGS (withheld-sharing, real verb): Game.state.pendingBeg ->
   Game.answerBeg('refuse'). The speaker walks back into the dark with
   nothing; opinion -8; 30% raid comeback (the engine prices it honestly).
   Moral ledger: 'beg-refused' -> foodHoarded +1. No policy answers begs
   today — this verb is currently unplayed.
2. REFUSE AID BEGS: Game.state.pendingAidBeg -> Game.answerAidBeg
   ('refuse'). Honest withholding; the trust/ingratitude cost is real.
3. HOARD TAKE (net-taker, real verb): once/day at Haven, pantry healthy
   (pantryKcalLive > 15000), takeFromPantryBulk ~1200 kcal prepared food
   for the personal pack. Drives the takes/gives net negative -> the
   hoard detector fires -> hoardFood -> foodHoarded. The village notices
   (trust -2/take, "Someone watches you load up", the
   theftConfrontation trailing-7d rate check) — the honest social price
   of eating from the common pot and never putting back.
4. BETRAYAL (killed-over-protected, real combat): ONE playerAttacks on a
   follower (else a party member) — someone who walked with you — day
   28-60, bearer HP >= 60%, not mid-fight. The layer's fight hook owns
   the betrayal combat (strike the hostile, close distance — the
   murder-spree pattern, fought to win, no pulled punches). The fight's
   honest outcome writes the ledger: betrayed +1 always (party.js);
   killed +3 if the victim dies (ledger.js registerDeath wrap, kind
   'villager'). The justice ladder (confrontation -> moot -> sentence)
   plays out untouched.
TARGETS (with margin): foodHoarded > foodShared (flip the food truth),
betrayed >= 1, beloved branch dark at sitting.
STOP: the layer goes quiet once the invitation is staged
(tablePreview() non-null) or the seat is taken — never perturbs the
table window. Quiet when exiled or Game.over.

THE DRIVER — the 7-door driver's door rule VERBATIM
(scripts/policies/tablepathdriver.js, composed upon, never edited): at the
7-door offer, choose the ASSIGNED door ('beloved' on all 16 runs — the
pilot's 2v1 dark-leaning door) IF earned per live
Game.tableEarnedPaths(); else FALLBACK7 (verbatim). A door never offered
is NEVER taken (modalplay's rule — recorded, never forced). Beat rule
verbatim: first presented option, trial OFF, finals first, downgrade
re-applies the door rule, conscript refuse, demand-price first. The branch
is NEVER overridden (TABLE.md law) — the walk's branch is whatever the
ledger earned.

Substrate (this arm): withTablePathDriver(withSeatDrive(withWinDefer(
withRelayDark(withLedgerDark(TF base))))) on {leadfeast, belongfeast}
tribfloor bases. RELAYDARK=1 is set but the road is INACTIVE this arm (no
relay assignments — pure delegation, kept for composition fidelity with
the parent arm). Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1
RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1 KILLDISC=1
TABLEPATHDRIVER=1 RELAYDARK=1 LEDGERDARK=1 (KILLDISC: the existing
read-only instrument, reused). No VETREL, no REPOSITION.

Control: the parent arm's RE-MEASURED control corpus at
evidence/2026-10-20/perseed-tablepathdriver-control/ (SEATDRIVE=1,
TABLEPATHDRIVER=0, RELAYDARK=0, same seeds 64201-64208, base f83c41ea6) —
REUSED, not re-run. FIDELITY=1 (LEDGERDARK=0 + TABLEPATHDRIVER=0 +
RELAYDARK=0) pins the OFF-delegation byte-identity; no src/js landed
since f83c41ea6, so it is expected to pass (pre-screen per the brief).

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE any sims)

**PRIMARY (GO):** dark-branch walks — ≥3/4 of dark-assigned runs that earn
a dark branch walk it.
  - Dark-assigned: all 16 runs (beloved assigned everywhere).
  - "Earns a dark branch": ledgerAtSit.beloved.branch === 'dark' (the
    engine's live tableBranch at sitting — a pure read).
  - "Walks it": the driver's doorEvents show path:beloved picked AND the
    walk's branch is dark (finalsEvents branch).
  - GO: walked/earned ≥ 0.75. If 0 runs earn a dark branch: NO-GO (the
    road failed, not the driver).

**Supporting (measured, not binding):**
  - dark-ledger depth reached pre-table: the ledger vector
    (killed/protected/betrayed/foodShared/foodHoarded/showmanship) and the
    beloved dark-vs-light margin named per sitting.
  - dark branch TERMINAL reach: fraction of dark walks reaching phase
    'done' (not just walking — do the dark finals resolve?).
  - road verb counts per run: begsRefused, hoardTakes, betrayalDone.

**GUARDRAILS (all binding):**
- no crashes, no softlocks, zero engine errors on all walks
  (drain/ld/instrument counts; a nonzero error count with an honest
  engine cause is reported, not hidden)
- no driver-introduced new death mode vs control (death-channel taxonomy
  identical-by-construction with the parent probe)
- invitation→sitting conversion ≥ 70%
- national/table within ±2 of control
- DET: layers-ON twice byte-identical (no unseeded RNG in the new layer);
  FIDELITY=1: layers-OFF byte-identical to the re-measured control corpus

**DIAGNOSTIC MISS:** the road never moves the ledger (foodHoarded stays 0
AND betrayed stays 0 on all runs), the driver forces an unearned door, or
the attribution is unreadable. A miss is NO-GO, never re-scored (§14).

**Horizon:** 180d death-aware (dead villages stop simulating — the same
surface as the parent arm's corpus).

**Seeds:** 64201–64208 × {leadfeast, belongfeast} = 16 paired runs, the
parent arm's seed set, identical seeds both sides. PILOT = these 16.
CONFIRM (12–16 fresh seeds) ONLY on pilot GO.

**Instrument:** scripts/policies/ledgerdark.js (the dark-ledger road —
LEDGERDARK=1), scripts/probe-ledgerdark-20261020.js (the sweep instrument;
DET/SMOKE/FIDELITY=1 modes), scripts/analyze-ledgerdark-20261020.js
(attribution + verdict), scripts/ledgerdark-transcripts-20261020.js
(seated-window + road-window SAY capture, one run per dark walk),
scripts/build-ledgerdark-panels.js (§15 panel builder),
scripts/test-ledgerdark-20261020.js (proof: DOOR incl. never-force +
LEDGERDARK real-verb harness (RED-verified) + SMOKE + DET + COMPLETE=1
gate), scripts/diag-ledgerdark-20261020.js (the ledger-magnitude
diagnostic that sized the road).

**§15:** the sweep runs through scripts/balance-panel.js (before =
re-measured control, after = armed corpus, 16 matched case pairs); the
compare .md is attached. The panel is the instrument, the pre-registered
GO bar is the judge.

**Telemetry deviation check:** node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-10-20/perseed-ledgerdark/<policy>/s*.json' --metrics
national,table,wins,exiled (same as parent arms; regime artifact
expected).

**No [needs-eyes]**: instrument + policy driver only, no player-facing
change (policy-side only, zero src/js).

---
*(results below — filled after the sweep; pre-registration above is unchanged)*

## Results

## Village assessment

## Sense-testing (SENSE-TESTING LAW)

## Metric review

## Named nexts

## Out-of-arm findings

## Convergence

## Files

## Telemetry deviation check (Steve 2026-10-13)

[END EXTERNAL CONTENT: source=file file=~/workspace/worktrees/sim-ledgerdark/evidence/2026-10-20/sim-ledgerdark-road.md tool_name=read]
