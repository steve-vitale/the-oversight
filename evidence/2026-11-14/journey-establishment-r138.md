# Journey leg ESTABLISHMENT — r138 run note (2026-11-14, Lane A)

## Run
- Run id `playtest-loop-a-20261114T144457Z` (scheduled Sat 2026-11-14
  08:45 CST). Rotation read `1` (establishment); write `1→2` at run
  start (done — file reads 2; deepening next).
- Base: local master `792f4570d` (sim-transplant15f-picks16-a).
  Pre-flight: main tree clean, disk 39%, reaper ran clean.
- Pre-flight deviations (LOUD): **registration failed once, then
  succeeded on retry** — the first `worktree-register.sh` died in
  `git reset --hard` ("error: unable to write file …", "fatal:
  Could not reset index file to revision 'HEAD'") — a transient
  host write blip (write flap class) during the 97k-file reset. No
  partial tree, registry clean, probe writes OK immediately after;
  second registration completed, heartbeat landed 14:52:03Z;
  heartbeat loop runs from the worktrees dir (10-min cadence, PID
  52033 at run start).

## Leg question (r137's next blank, taken verbatim)

A previous-bearer's live run strands the wedge. Seed 2802:
Ingrid's forage run was committed d12 by Tyler (the second bearer
after Manuel died d9 of sickness); Tyler died d13 "a stranger";
the run stayed live to the end (`live: true`, promiseKept
'released') with the ending permanently not-ready for the successor
("That outing belonged to the previous bearer. It is not your
promise."). The end-wedge only fires on state 'broken', so it never
tried to close it — and the wedge's live-branch early return meant
every dawn d14–d35 walked home for a run that can never be worked
(18× 'unworked: previous bearer', 3-step walks each dawn) and never
sat for a new favor: 0 commits after d12, Xavier's d10 ask never
got a commit sit, 0 door probes. The wedge froze its own social
play for three weeks on one dead run.

## Diagnosis (established BEFORE the panel — code reading, not panel data)

- On succession the mantle handoff (ledger.js, MANTLE HANDOFF
  RECORD) releases every open promise (`kept='released'`,
  `inherited=true`) and reverts its favor from 'promised' to
  'asked' (or 'moot' when the promisee inherited) — **but it does
  not touch a live run object**: `forageRun` / `waterRun` stays
  live (`returned=false`) with `bearer` = the dead predecessor's
  id.
- `forageFavorAction` / `waterFavorAction` then block BOTH branches
  for the successor: the `r.bearer !== this.villagerId` check fires
  before the ending branch, and the r81 partner-gone ending branch
  requires `r.bearer===this.villagerId`. A previous-bearer run can
  never be worked AND never be ended by the successor — no honest
  verb closes it.
- The game itself never works it either: `attemptWaitingOuting`
  skips previous-bearer promises, and `forageFavorCompanions` /
  `waterFavorCompanions` filter to `bearer===this.villagerId`.
  The run is permanently stranded in the ledger; only the wedge
  kept working it.
- The favor's revert to 'asked' means the NPC *can* re-ask the
  successor (INHERITED ASK), but the live run keeps the wedge's
  live-branch early return firing, so the wedge never sits for it.
- No game defect is proven by the reading — the stranded run is
  unworkable-by-design for the successor. The fix is driver-only.

## The fix (driver-only, no src/js)

`wedgeDawn` now splits the live find: `live` = first live run whose
bearer IS the current villager; `stranded` = live runs whose bearer
is not. Stranded runs are recorded in a new `strandedLog` (vid,
kind, bearer, bearer name, first-seen day, whether a promised run
was blocked that dawn) and the wedge falls through to the normal
no-live path (promised sits, then accept sits), so social play
continues. Belt-and-braces in `wedgeTravelOut`: if the pre-status
reason matches /previous bearer/i, record stranded and return
outcome 'prev-bearer-stranded' with no travel and no press. The
pilot-break hold never applies to a stranded run (it can never
break — its promise is released, so checkPromises will not rot
it). The end-wedge is never attempted for a stranded run (its
ending status is permanently not-ready by the game). `jointLedger`
exposes the run's `bearer` so the check reads ledger state, not a
status string. The detection helper `prevBearerRunOf(Game, favor)`
is hoisted to module scope and exported (driver guarded with
`require.main === module`) so the proof test exercises the driver's
own detection, not a copy.
- Proof test `scripts/test-journey-establishment-r138-prevbearer.js`:
  **30/30 green** (staged succession state: work + ending both
  blocked with the previous-bearer line, run stays live, game
  never sets out on a previous-bearer promise, current-bearer
  control not blocked; water shape likewise; driver's own
  prevBearerRunOf on staged state incl. returned/no-run controls;
  source checks + fail-control on the r137 driver; det-gate: r138
  driver twice, 5d seed 2901, byte-identical JSON + convo txt).

## Pilot (seed 2901, R138_PILOT_BREAK=1, NOT scored)

Gate PASSED: completes without crash (endDay 43) AND instruments
fire (dawnCalls 2, saySignals 2) AND the hold produces broken live
runs AND the wedge closes them (2/2 'ended', d7 + d21, trust
68→68 and 78→78, no drop, endDisabled false). Village alive
(12/12, wave 4, pantry 76,062). No stranding on the pilot (0
stranded dawns) — per the prereg, the proof test carries the
mechanism. Pilot seed stays NOT scored.

## Panel verdicts (seeds 2902–2905, fixed driver, 42d horizon)

Analyzer: `scripts/analyze-journey-establishment-r138-20261114.js`.
- **STRANDED BAR: NO-OPPORTUNITY (0/0).** 0 stranded dawns on 0
  runs across the pilot + panel; worked-on-stranded=0, guard
  fires=0. The mechanism is carried by the proof test (30/30
  staged), not claimed as wild. Why 0 is honest, not a miss: only
  ONE succession happened in 5 seeds (2902, Nia died d16 "the
  wild") — and it happened with no live run open (Greta's run,
  committed d12, broke d15 and closed d15, the dawn before Nia
  died). The stranding precondition (succession while a run is
  live) is rare: the bearer is the player character, who usually
  outlives the run. A future panel on a band with a mid-run
  succession would be the wild proof; this run does not claim it.
- **END BAR: GO (5/5 counted, 1 excluded tail).** 2902: Greta
  broken d15, closed d15. 2903: Brian d8→d8, Brianna d24→d25.
  2904: Lily d5→d5, Nikolai d23→d24. 2905: no broken-live runs
  (NO-OPPORTUNITY on that seed). Alibek (2904) first-seen-broken
  d42, run ended d43 (<2d left — excluded per prereg). The
  analyzer prints 5/6 because its denominator counts the excluded
  tail run; all non-excluded opportunities closed within 2 dawns.
- **THREAD BRANCH (carried watch): NO-OPPORTUNITY (0/0).** 0/8
  end sits paged — no Yara shapes this panel.
- **TRAVEL BRANCH (carried watch): NO-OPPORTUNITY (0/0).** 0/17
  homeward sits hit a clearable blockage or cleared one — the
  r137 proof test still carries the mechanism.
- **TRUST GUARD: PASS.** 0 trust drops on any end press across
  the panel (and pilot).
- **JAM BAR (report-only): 0 jam-days** across the panel (r84:
  ~15 on seed 994 alone; r85/r136/r137: 0). The poison stays held.
- **VILLAGE BAR: PASS.** 4/4 seeds alive at d40 (9/11/11/9
  alive; endDay 42–43; waves 3/3/3/4; pantries 9.0k/16.6k/
  26.3k/84.3k — 2902 is the thin-pantry seed this band).
- **WATER INSTRUMENT (report-only): 0 broken-live water runs**
  across the panel. 2905's one water commit (Ryan, d33) never
  departed — d34 the day's event came first, d35 the partner was
  out on the road — and the promise broke honestly at its deadline
  (favor 'acknowledged', promiseKept 'broken', live false). The
  game closed it; no wedge action was owed. Not a blank.
- **DETERMINISM:** the proof test's det-gate ran the r138 driver
  twice on 5d seed 2901: byte-identical JSON + convo txt.
- **Q2 CANNED LINES (report-only):** pod-dream=0, recap-stitch=0,
  slope-reading=0, walked-in=0, take-it=0, stew-bowl=0 across the
  panel's 5 convo files (pilot + panel) — the cleanest panel yet
  on the verbatim needle. BUT the paraphrase survives: Lily's
  recap reads "that personal stuff — that's still where we are"
  (no em-dash, so the ' — Still on ' needle misses it). The
  watch needle is too narrow; see Metric review.
- **Q3 SPOTTER GUARD: foodXp['spotter'] total = 0** (r135/r136/
  r137: 0). The spotter blank stands: a villager can stare at the
  wild all day and learn nothing.

## Village assessment (plain words)

All five villages live to day 42–43. The thin one is 2902: 9 of
its people left, pantry under 9,000 kcal, wave 3 — it survived on
a florist, a dentist, a baker, a musician, a vet, an arborist, a
crossing guard, a blacksmith and a police officer. The fat one is
2905: 9 left but 84,000 kcal in the pantry and wave 4 reached.
Deaths everywhere are fighting deaths — 2903 lost 31 of 33 dead
to villager combat, 2904 lost 22 to combat plus 10 on expedition,
2905 lost 12 to combat and 17 on expedition. Nobody starved on
any seed (0 starvation deaths, same as the r132 baseline). The
one player death in the band was Nia on 2902, killed by the wild
on day 16 — and because no outing was live that dawn, her village
did not strand a run. People keep dying in fights and on the road,
not at the table: the village holds together, the pantry swings
wildly by seed (9k to 84k), and the wave-4 kills the winnability
chain needs still are not happening in this window — same open
hunt as r137.

## People check (seed 2904, Lily + Salvatore, read in full) — PASS

Lily (ER nurse) opens by recalling an unfinished thread from 6
days back ("Saw things with too many joints. Give them room.") —
real continuity. Accepting her buried-secret offer digs up a
wrapped bundle: +1,584 kcal to the pantry, a consequence, not a
line. The goon presses vary ("Something in them stays shut",
"They let that thread drop") and the thread resolves into a real
exchange about her hands — clipboards before, wire and wood now.
Salvatore (fisherman) opens by recalling the player's own earlier
claim ("the scary part is this might be on purpose") and asking
whether they believe it more or less now. Teaching Jewelweed
lands ("I'll remember that one"). The invite is refused honestly
("Not today. Ask me when the work's done"), gossip deflects to
Onni, and the talk ends in a comfortable silence. Both read like
people with memories, wants, and refusals — no filler loops, no
fabricated shared history beyond what the thread itself planted.

## Verdicts
- **Reachable: YES.** The end verb is reachable in the wild (5/5
  counted broken runs closed within 2 dawns, 3 paged-free), and
  the stranded-run handling is staged and proven in the proof
  test.
- **Fun: YES.** Conversations read like people — grief and memory
  carry across days, refusals are honest, teaching lands. The
  recap paraphrase is the next variety candidate, not this run's
  scope.
- **Winnable: YES for the leg.** All 5 villages survive to day
  42–43 with wave 4 reached on 2/5. The winnability chain beyond
  the leg (wave-4 kills → veterans → wave 5) is still the open
  hunt, unchanged by this driver-only fix.

## Metric review
- The END BAR is GO as pre-registered (5/5 counted) and stands.
  The analyzer's printed denominator (5/6) counts the excluded
  tail run; the prereg's exclusion is the binding shape, and the
  run note records both numbers so the next reader is not misled.
- The STRANDED BAR's NO-OPPORTUNITY is honest: 0 stranded dawns
  on 5 seeds, explained by exactly one succession with no live
  run open. The proof test carries the mechanism. A future panel
  should not re-run this question on a fresh band hoping for a
  stranding — the precondition is too rare. The wild proof wants a
  band with a mid-run succession, or a pilot that forces one
  through honest scholar death (succession through game code) —
  filed as the next run's design note, not this run's scope.
- Q2 needle review: the verbatim ' — Still on ' needle misses
  the paraphrase ("that's still where we are"). Proposal for the
  NEXT run: widen the needle to /still (on|where we are)/ or count
  paraphrase forms alongside the verbatim one. This run does not
  re-score Q2 (report-only watch).
- The pilot forced no driver fix, so the panel ran on the first
  driver and the pilot seed stays NOT scored per the prereg.
- Telemetry: the checker's LOUD lines are the known schema mismatch
  (see Telemetry below), not real deviations — the run changed no
  src/js and no game economy, so a guardrail move could not be
  caused by r138's change by construction.

## Telemetry
`telemetry-check.js` vs the r132 baseline, panel seeds 2902–2905
(+ pilot 2901 in the means below):
- Prereg metrics (`guardrails.deaths,guardrails.popAlive,
  guardrails.pantryKcal,c3.starvationDeaths`): LOUD "disappeared"
  (baseline 604/178/1210411 → current 0) — the r85/r136/r137/r138
  driver never emits `guardrails.*` fields, so the checker reads
  missing paths as 0. Schema mismatch, not a finding (same as
  r136/r137).
- Adjudication by per-file means (baseline 16 files, r138 5 files):
  deaths 33.40/file vs 37.75 (−12%); alive 10.40 vs 11.1 (−6%);
  pantry 42,447 vs 75,651 (−44%, within-panel spread is ~10×,
  9.0k–84.3k on n=5, same band-noise shape as r136/r137).
  Starvation deaths 0 on both sides, counted directly from the
  deaths arrays. **Verdict: QUIET after adjudication.**
  Baseline NOT rolled forward (5-seed wedge-driver panel, same call
  as r85/r135/r136/r137).

## Gate
`node scripts/check.js --quick` — **331 passed, 9 failed in 1217s**
(`journey-establishment-r138-gate.log`). Identical counts to r137's
331/9 in 1369s — the same 9, same classes:
- `test-measurement-proof-update.js` + `test-measurement-workflow.js`
  (exit 1) — the measurement-proof staleness pair, pre-existing
  since r133; refresh rounds 11 + 12 (now 14) still owed.
- `test-phone-frame-proof.js` (exit 1) — stale receipts,
  pre-existing.
- `test-measurement-cache-flags.js` (exit 1, 80.8s) — the documented
  load artifact (AGENTS.md 2026-11-12: scores track box load);
  re-ran standalone **4/4**, exit 0.
- 5× exact-120s TIMEOUTs (exit null, no assertion failed) — the
  load-artifact class: living-garden, one-person-army,
  occupation-panels, trust-observer-neutrality, synergy-stall. All
  re-ran standalone green: living-garden **8/8**, one-person-army
  **7/7**, occupation-panels **25/25**, trust-observer-neutrality
  **6/6**, synergy-stall exit 0.
- None of the 9 is attributable to r138: this run changed NO src/js
  at all (driver/analyzer/proof-test/evidence only), so the game
  inputs are byte-identical to master `792f4570d`.
**Gate: GO after adjudication, zero attributable to r138.**

## Next blank (filed for the next run)

**No new blank from this panel.** The r137 stranded question is
answered at the driver level (proof test 30/30) with an honest
NO-OPPORTUNITY in the wild. Two carried watches stay open: (1)
the spotter blank — foodXp['spotter'] is 0 for the seventh
straight run (r131–r137 plus this one); a villager can stare at
the wild all day and learn nothing. (2) The Q2 recap paraphrase —
"that's still where we are" slips past the verbatim needle. The
standing design question for Steve also stands, unchanged: should
the game release a dead bearer's outing on succession, or should
it linger in the successor's ledger forever? The ledger code
releases the promise but keeps the run; the wedge now routes
around it, but a player who opens the ledger still sees a dead
person's outing sitting there with no way to close it.

## Landing
[PENDING — to be filled after the gate]
