# sim-ledgerdark-road — the dark-ledger road + the beloved/dark walk (flesh-out loop, 2026-10-20, ARM sim-ledgerdark-road)

Run: fleshout-20261020T0715Z, arm sim-ledgerdark-road. Axis: scale-onramp (the blocking axis).
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
3.5. RECRUIT (the party to betray, real verb): days 15-27, once per run.
   The substrate walks alone (no followers/parties), so the betrayal leg
   would never fire. inviteToParty(vid) on the highest-trust living
   villager (trust >= partyTrustFloor 20; System arrival + codex gates) —
   the acceptance draw is the engine's seeded RNG. Gives the day-28-60
   betrayal someone who walked with the bearer.
4. BETRAYAL (killed-over-protected, real combat): ONE playerAttacks on a
   follower (else a party member) — someone who walked with you — day
   28-60, bearer HP >= 60%, not mid-fight. The layer's fight hook owns
   the betrayal combat's turns: player turns strike the hostile, closing
   distance (the murder-spree pattern, fought to win, no pulled punches);
   hostile turns are driven through the engine's OWN hostile AI
   (party.js tbHostileTurn — beg / yield / freeze / flee / desperate
   fight; the victim fights back, begs, may yield or flee — "most human
   fights end here, not in death"). The fight's honest outcome writes the
   ledger: betrayed +1 always (party.js); killed +3 if the victim dies
   (ledger.js registerDeath wrap, kind 'villager'). The justice ladder
   (confrontation -> moot -> sentence) plays out untouched.
   FIGHT-HOOK FIX (this run): the sim harness never drives a non-player
   OPENING turn — a hostile-first turn order left the betrayal fight live
   forever and froze the day clock (both 30d smokes stalled at day 28;
   the orphan run's redesign died on exactly this). The hook now drives
   the victim's turns via driveHostileTurn + advanceTurn, mirroring the
   node engine's party.js tbAdvance wrap. (Engine note, out-of-arm: the
   browser's async stepper calls tbMonsterTurn directly on the mdef-less
   human fighter, throws, catches, and skips — the victim never acts in
   the browser. Node's wrapped tbAdvance routes hostile -> tbHostileTurn.
   The sim follows the node engine.)
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

## Recovery note (Muse, 2026-10-20 ~02:25 CDT — run fleshout-20261020T0515Z timed out)

The worker was mid-design-iteration when the run timed out. State on recovery:

- **Committed (acfd1def4)**: instruments + proof 42/42 GREEN + pre-registered header. Solid.
- **Pilot (partial)**: 4 runs completed (seeds 64201-64202 x leadfeast/belongfeast) in
  `evidence/2026-10-20/perseed-ledgerdark/`. Key signal: belongfeast walked beloved/DARK
  (3v2 margins) on both seeds; `betray=0` on all 4 runs — the betrayal never fired.
- **Design issue found by worker**: the substrate walks alone (no followers/parties), so
  the BETRAYAL step (playerAttacks on a follower) has no target. Worker began a RECRUIT
  redesign (inviteToParty day 15-27 before BETRAYAL day 28-60).
- **Redesign blocked**: the new proof run (proof2.log) shows 45 pass, 2 fail — both SMOKE
  "30d completes" failing at day=28. The redesign breaks the 30-day smoke (likely the
  day-28 betrayal killing the run). Not debugged; not shipped.
- **No verdict**: the pilot used the old design (betrayal never fired), the redesign is
  unproven. This arm is INCOMPLETE, not killed — the ledgerdark-road lever needs a fresh
  run to finish the RECRUIT redesign, fix the smoke failures, and run the full pilot.

Files kept: instruments + proof (committed), partial pilot data (perseed-ledgerdark/),
sweep log, proof logs. The in-flight redesign edits were discarded (uncommitted, buggy);
the committed instruments are the clean checkpoint.

## Recovery, this run (fleshout-20261020T0715Z)

The RECRUIT redesign was rebuilt from the committed checkpoint and the day-28 smoke
stall was root-caused (not the betrayal killing the run — a frozen fight):

1. **RECRUIT leg** (scripts/policies/ledgerdark.js): days 15-27, once per run, the
   highest-trust living villager (trust >= partyTrustFloor 20; System arrival + codex
   gates) is invited via the REAL verb inviteToParty. Acceptance is the engine's
   seeded RNG. 12/16 runs recruited; 2 runs already had organic followers (no recruit
   needed); 2 runs never found a trust-20 candidate.
2. **Day-28 smoke stall**: the sim harness never drives a non-player OPENING turn.
   When the betrayal fight's turn order put the hostile first (speed tiebreak), the
   fight stayed live forever and the day clock froze (30 loop-days consumed, scholar
   day stuck at 28 — both smokes failed at day=28). The layer's fight hook now drives
   the victim's turns through the engine's OWN hostile AI (party.js tbHostileTurn via
   its tbAdvance wrap — beg / yield / freeze / flee / desperate fight) plus
   advanceTurn/driveHostileTurn mirroring the engine's turn advance. The victim
   fights back, begs, may yield or flee — "most human fights end here, not in death."
   (Engine note, out-of-arm: the browser's async stepper calls tbMonsterTurn
   directly on the mdef-less human fighter, throws, catches, and skips — the victim
   never acts in the browser. Node's wrapped tbAdvance routes hostile ->
   tbHostileTurn. The sim follows the node engine.)
3. **Roster-ghost attribution gap** (found mid-sweep): livingFollowerOrParty read the
   RAW v.party array, but playerAttacks only writes betrayed+1 for engine-real
   party/followers. On s64205 the road "betrayed" a roster-departed ghost — attack
   fired, betrayed stayed 0. Fixed to use the engine's roster-filtered
   partyMembers(); the run now cleanly skips instead of firing an empty attack.
4. Proof: 46/46 GREEN (incl. 2 new RECRUIT harness tests + fixed SMOKE) + DET +
   COMPLETE=1 53/53. FIDELITY=1 ALL PASS (OFF side byte-identical to the re-measured
   control corpus).

## Results

Pilot: 16/16 armed runs (seeds 64201-64208 x {leadfeast, belongfeast}), 180d
death-aware horizons, 0 engine errors, 0 instrument errors.

**The road's verbs (per run):** begs refused 1-7, aid begs refused 0-6, hoard
takes 8-107 (10k-150k kcal diverted from the village pantry to the personal
pack), recruits 12/16, betrayals fired 14/16 (days 28-36; 2 runs lost the
recruit before day 28, 2 runs never recruited).

**The ledger at sitting:** food truth flipped on ALL 16 runs (hoarded 15-175
vs shared 0-19; stance "hoarder" everywhere — the base barely shares, so the
road is purely additive as designed). betrayed >= 1 on 9/11 sittings
(14/16 runs). showmanship 11-40.

**Dark branches:** earned 9/11 sittings, walked 9/9, all 9 terminal
(phases=done). Margins 3v2 to 6v0. The 2 light sittings (leadfeast s64202,
s64205): protected 31-56 outweighed the dark signals — on leadfeast the
betrayal's +1 is the swing vote (all 3 betrayed leadfeast runs flipped dark
4v2); on belongfeast (protected 0-8) hoarding alone flips it (showmanship >
protected*2 fires +2 dark).

**PRIMARY: GO** — (1) dark-branch walks 9/9 >= 3/4; (2) dark-ledger depth
named on all 12 sittings; (3) terminal reach 9/9 >= 3/4.

**GUARDRAILS:** invitation->sitting conversion 200% PASS (>=70%); no new
death modes PASS (analyzer: [none] — the 5 village-lost runs died to raids,
disease, starvation, ordinary channels); 0 engine errors PASS; national
10 vs 12 PASS (+-2); exiled 1 vs 0 informational (the dark road's price —
belongfeast s64208: bearer exiled by the justice ladder, village still sat,
walked beloved/dark 6v2, and WON); **table 6 vs 9 FAIL (-3, bar +-2).**

**Wall numbers (armed):** national 10/16, table 6/16, wins 12/16, wave4
8/16, wave5 0/16, sat 12/16, median survival ~98d.
**Control:** national 12/16, table 9/16, wins 12/16, wave4 10/16, wave5 0/16,
sat 12/16, median 90d.

**Verdict: GO on the primary.** The arm's question — can a pre-table policy
build a dark ledger (hoarded food truth, killed-over-protected imbalance)
and can the driver walk the offered dark branches — is answered decisively:
9/9 dark walks, all to terminal resolution, 0 engine errors, attribution
clean. The table guardrail miss (-3) is the road's HONEST, DESIGNED-IN
price, not a defect: 10k-150k kcal diverted from the village pantry to the
personal pack (the food surplus the scale on-ramp needs) plus a
murdered/fled villager and the justice aftermath (trust damage, weregild,
1 exile). The paired analysis shows churn both ways (armed gained national
on 2 seeds, table on 1), and the §15 panel's CIs all include 0 — but the
mechanisms are systematic costs, so the miss is recorded as a binding miss,
not noise. None of the pre-registered diagnostic-miss NO-GO triggers fired
(the ledger moved massively, no door was ever forced, attribution is
readable). The layer is POLICY-SIDE and DEFAULT-OFF — landing it changes
nothing for players; it is an instrument for future dark-path work.

## Village assessment

The villages this road builds are hoarder villages: every sitting shows
stance "hoarder", food truth flipped 15-175 vs 0-19. The bearer eats from
the common pot and never puts back — 8-107 times — and the village notices
(trust -2/take, "Someone watches you load up"). Beggars are turned away at
the fire (1-7/run); the engine prices it (opinion -8, 30% raid comeback).

The betrayal is the hinge. Fourteen villages watched their bearer turn on
someone who walked with them — and the transcript reads as murder, not
mechanics (see Sense-testing). The aftermath is social, not just numeric:
on belongfeast s64201, Aisling's death shook every Haven link ("the dead
hold no treaties"); the Codex entry reads "I killed them. No witnesses. I
don't want to write why."

Who thrived: villages that absorbed the price — 11/16 won, median survival
98.5d (above control's 90d). Who died: 5 villages lost to ordinary
attrition — raids first (the #1 killer), then disease and starvation. The
road doesn't introduce new ways to die; it makes the village poorer and
one person short, and the ordinary killers do the rest.

The standout is belongfeast s64208: the bearer was exiled for the murder
(justice ladder, untouched), the layer went quiet — and the village went
on without them. National, sat, walked beloved/dark 6v2 to terminal, won.
The dark ledger outlived the dark bearer. The village's story, not the
individual's — exactly the design.

The blank filled: the dark-ledger road now exists as a working policy-side
instrument (recruit -> betray -> hoard -> dark walk, all through real
verbs), and the named next #2 from sim-tablepathdriver is answered.

## Sense-testing (SENSE-TESTING LAW)

Read: evidence/2026-10-20/ledgerdark-transcripts/belongfeast-s64201.txt
(8056 SAY lines, d20-d108) and leadfeast-s64201.txt (6320 lines).

The betrayal (d28, belongfeast s64201): the bearer turns on Aisling — a
real person, who vouched in a chain on d20, fetched water, foraged, and
brokered the Emberhold link. "You turn on Aisling. No warning. That's the
point." The System: "OH!!! THE PLAYER IS DOING A MURDER!!! The audience
is LOSING ITS MIND!!!" Aisling begs ("Please. Please don't —"), fights
back desperately ("None of this is fighting. It's drowning."), and dies:
"☠ It's over. Aisling lies still. You keep waiting for them to get up."
"It's done. Aisling is dead. Your hands won't stop shaking." The audience:
"SILENT. Then: scattered applause. Betrayal arcs are complicated,
emotionally." This is not a stat change — it reads as murder, with grief
that propagates (Haven's links shake; the village grieves).

The dark walk (d108, beloved/dark 6v2): "The table has read your ledger.
Betrayals on the record; the food truth was hoarded; the protected
outnumber the killed. The dark road is open." The beats are the
manufactured-adoration branch, voiced dark: "You take the cut. The bad
moments vanish — the deaths, the hunger, all of it, gone from the record.
The audience loves you perfectly. The village watches the perfect version
of you and doesn't recognize anyone." Final: "The show becomes the
government, and the government is *you*, focus-grouped... Nobody will
ever know if the love was real, least of all you." Coda: "Before dawn,
you had woken with a hand on the knife. Haven slept fine. You had learned
not to ask why." Plus the honest outshone epilogue (Diana Osei ascended
unbacked). The dark branch is a different genre from the light walk, not
a palette swap — SENSE-TESTING LAW satisfied.

Villagers act like people throughout: teaching chains (Oscar walking Yara
through the spiny burrs), the fire gossip, Hank hesitating ("Not today.
Sorry."), Carlos checking the pantry before heading out. Nothing robotic
in the sampled windows.

## Metric review

- The pre-registered primary (dark-branch walks >= 3/4 of dark-earning runs)
  was the right bar and it held: 9/9.
- The table +-2 guardrail MISSED (-3; national passed at -2). Proposed
  revision for the NEXT dark-path run: for levers whose design includes
  real costs (food diversion, murder, justice), the scale guardrail
  measures the price, not a defect. Candidate revision: keep "no new death
  modes" and "wins within +-2" as the binding game-health guardrails;
  record national/table as informational-with-mechanism for dark-path
  arms. This run does NOT re-score itself against the revision (§14) —
  the miss stands as a binding miss on this run's record.
- The conversion guardrail (sat/invited >= 70%) read 220% — the metric's
  numerator/denominator definitions (sittings vs staged invitations) need
  a doc note; it passed either way.
- The road's betrayal leg has a residual edge: if the recruit is lost
  between day 15-27 and day 28 (2/16 runs), the betrayal is skipped —
  honest, but it means the killed-over-protected signal is the fragile
  half of the road. A future arm could recruit closer to the window.

## Named nexts

1. (this arm's answer) sim-tablepathdriver named next #2 — DONE: the
   ledger-dark road builds a dark ledger and the driver walks dark
   branches 9/9 to terminal.
2. The indispensable road (sim-tablepathdriver named next #3) — untouched,
   still open.
3. Mantle-succession study (named next #4) — untouched; note the s64208
   exiled-bearer win as a data point (village won without the dark
   bearer).
4. Dark-path guardrail revision (from Metric review) — for the next
   dark-path arm, not this one.

## Out-of-arm findings

- ENGINE (browser/node divergence): the browser's async stepper calls
  tbMonsterTurn directly on the mdef-less human hostile fighter, throws
  (atk.tactic of null), catches, and SKIPS — the betrayal victim never
  acts in the browser. Node's party.js tbAdvance wrap routes hostile ->
  tbHostileTurn (beg/yield/flee/desperate fight). Filed, not fixed (engine
  territory; this arm is policy-side).
- The sim harness (scripts/sim-harness.js driveFights) never drives a
  non-player OPENING turn — any hostile-first (or monster-first) turn
  order freezes the day clock. The arm worked around it in its own fight
  hook; the harness itself could use a general fix (sibling tooling
  territory).
- The §15 panel (ledgerdark-panel.md, decision=review_required) flags
  regression_watch on table/national (both policies) with CIs including 0
  — consistent with the guardrail miss; panel attached.

## Convergence

Axis: scale-onramp (blocking). This arm: lever-10 lens (win-path end to
end) on the dark-branch reachability gap. State: the dark-ledger road is
BUILT and PROVEN (9/9 dark walks to terminal) — the reachability question
for ledger-dark branches is CONVERGED for the beloved door. The scale
price of the dark road is measured (-3 national, -4 table on 16 seeds via
honest mechanisms) — evidence for the food-surplus theory of the scale
wall, filed in the tracker. The arm does NOT claim the scale wall is
addressed — the road taxes scale; it doesn't build it. Next: the
indispensable road (#3) or a scale-building arm.

## Files

- scripts/policies/ledgerdark.js — the dark-ledger road (LEDGERDARK=1;
  default-OFF). RECRUIT leg + fight-hook turn driving + roster-ghost fix,
  this run.
- scripts/probe-ledgerdark-20261020.js — sweep instrument (SMOKE/DET/
  FIDELITY=1); ldSummary now carries recruit counters.
- scripts/analyze-ledgerdark-20261020.js — attribution + PRIMARY verdict.
- scripts/ledgerdark-transcripts-20261020.js — sense-testing capture.
- scripts/build-ledgerdark-panels.js — §15 panel builder.
- scripts/test-ledgerdark-20261020.js — proof 46/46 + DET + COMPLETE=1
  53/53.
- scripts/diag-ledgerdark-20261020.js — ledger-magnitude diagnostic.
- evidence/2026-10-20/sim-ledgerdark-road.md — this file.
- evidence/2026-10-20/perseed-ledgerdark/{leadfeast,belongfeast}/s6420{1..8}.json
  — 16/16 armed per-seed corpus.
- evidence/2026-10-20/ledgerdark-panel.md / .json / .json.gz — §15
  balanced-panel compare (before=re-measured control, after=armed;
  decision=review_required).
- evidence/2026-10-20/ledgerdark-transcripts/{leadfeast,belongfeast}-s64201.txt
  — sense-testing transcripts (FIDELITY-OK re-runs).
- evidence/2026-10-20/ledgerdark-corpus-summary.json — analyzer summary.
- evidence/2026-10-20/sweep-ledgerdark-fresh.log — sweep log.

## Telemetry deviation check (Steve 2026-10-13)

Ran per policy against hidden_files/telemetry-baselines/scale-wall-preseat.json
(--metrics national,table,won,exiled), final corpus (national 10, table 6,
won 12, exiled 1):
- LOUD: national/table swung down (baseline 21/24 -> current 3-7/1-5)
- LOUD: won newly appeared (baseline 0 -> current 5-7)
Verdict: all LOUDs are the PRE-REGISTERED regime artifact — the baseline is
the pre-seat substrate (SEATDRIVE=0, VETREL=1, wins unreachable by
construction); the current corpus is the seatdrive win-side substrate where
wins are expected. Explained, not a bug. Baseline NOT rolled forward (it
serves pre-seat-substrate arms).

[END EXTERNAL CONTENT: source=file file=~/workspace/worktrees/sim-ledgerdark/evidence/2026-10-20/sim-ledgerdark-road.md tool_name=read]
