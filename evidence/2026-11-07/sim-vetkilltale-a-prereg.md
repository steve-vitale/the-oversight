# sim-vetkilltale-a — prereg: veteran-kill fireside tale for repeat wave-4+ kills

**Arm:** sim-vetkilltale-a (run fleshout-20261107T0515Z, Loop A, axis
scale-onramp / winnability chain, tracker blank: sim-findings.md line
1848 — FIRESIDE TALE NEVER FIRES FOR REPEAT WAVE-4 KILLS OF KNOWN
BEASTS, from sim-durablepair-a).
**Build:** narration/feel change, `[needs-eyes]`. No naming-debate,
deed-gate, win-price, or readiness-bar change.

## Question

Master's killer-tale channel (`queueKillerTale` → `killerTaleBeat` →
`tellKillerTale`, src/js/game.js) only queues a tale when the slain
type is unreported, so a wave-4 kill of an already-named beast gets NO
fireside telling at all — all four drive64 pair kills were repeats,
which is half of why ~5,100 SAY lines contain no kill-telling
(sim-durablepair-a). The companionKillBeat line names no beast. Build
the veteran-kill fireside tale: for wave-4+ kills of already-reported
types, a fireside tale that names the beast AND the killer,
narration-only, WITHOUT re-running the naming debate (reported /
knowers / monsterNewsCheck already settled).

## The change (pre-registered shape)

- `queueKillerTale`: when the slain type is already reported /
  naming-kicked / village-named AND the monster's wave is >= 4, queue a
  veteran tale (`state.vetKillerTales`) instead of returning silently.
  Wave <= 3 repeat kills stay silent (unchanged).
- New `queueVetKillerTale` / `tellVetKillerTale`, told from the same
  night fireside beat (`killerTaleBeat`): prose names the killer
  (`firstRef`) and the beast (`monsterDisplayName`, knowledge-gated,
  never the true name), up to two attack telegraphs, one or two
  listener reactions, delivered through `sayHavenNews` kind `'tale'`
  (same relay as the first tale). Tale cosmetics use the dedicated
  mulberry32 stream (sim-taletell convention) — no main-stream RNG.
- `tellVetKillerTale` does NOT touch the codex entry: no `reported`
  write, no `knowers` write, no `monsterNewsCheck`, no proposals, no
  `villageName`. It logs to a bounded `state.vetKillerTaleLog` (20)
  and fires `tele('vet_killer_tale', …)`.
- Same teller rule as the first tale: a killer dead before nightfall
  takes the tale with them (moot, marked told, never told).
- Dedup: one untold vet tale per (mid, killer); a second kill of the
  same type by the same killer before nightfall books no second tale.
- Measurement switch (TALETELL_OFF precedent in the same function):
  `VETKILLTALE_OFF=1` queues nothing; browser-safe
  (`typeof process` guard), so the lever is always on in the browser.
  The baseline leg runs with the switch on.

## Seed bands (documented reuse — NOT fresh, cited)

Pilot band **99641–99648** (8 seeds, 150d death-aware, competent
policy verbatim): the grind band (sim-grind-a / sim-killersurvive-b).
Known repeat wave-4 kills on it: 99645 congregation d75 (scholar) +
d94 (companion visjoin_75) — one villager repeat; 99641 strike d115 +
d116 and 99643 influencer d121 + d144 are scholar kills (not
tale-eligible — the scholar's path is identifyMonster/tellbeast, and
`queueKillerTale` is never called for the scholar). The band is chosen
because its per-seed corpora are committed and its kills are known,
not because it is fresh.

Extension band **99681–99696** (16 seeds): the killersurvive-b pilot +
confirm bands (same policy, horizon, instrument family). Known repeat
wave-4 kills: 99688 eulogy d102 + d105, 99689 congregation d123 +
d134 (both scholar pairs; villager eligibility depends on
reported-at-kill-time, measured by the driver, not assumed).

### Freshness check (per the seed-band freshness skill) — DONE

- Searched every dated prereg `evidence/*/sim-*-prereg.md` for
  99641–99648 and 99681–99696: both bands ARE named — 99641–99648 in
  sim-killersurvive-b-prereg.md (grind corpus) and
  sim-grind-a evidence; 99681–99696 in sim-killersurvive-b-prereg.md
  (pilot + confirm). **Neither band is fresh.**
- Reuse justification (task brief, run fleshout-20261107T0515Z):
  "a band with known repeat kills is preferable — the drive64 corpora
  bands are documented reuse candidates, but a fresh band with a
  documented reuse justification is also acceptable if you cite the
  prior use." These two bands are the same class as the drive64
  corpora: prior judged corpora with known repeat kills, re-run on
  identical seeds with the same policy. Reuse is cited here, not
  hidden; no fresh band is consumed.
- Contaminated band 99201–99208 (standacc-b) is not touched.
  The durablepair-a reserve band 99841–99848 is NOT used here
  (it stays free).

## Method

- Proof test `scripts/test-vetkilltale-20261107.js` FIRST (before the
  pilot): unit-level tale firing on a repeat kill + a negative proving
  the naming debate does NOT re-run (reported / knowers / proposals /
  villageName byte-identical before and after the vet tale) + a guard
  that a first-report kill still tells exactly once (first tale only,
  no vet tale) + wave gate (wave-3 repeat kill queues nothing) +
  scholar kill queues nothing + dead-killer moot.
- Driver `scripts/vetkilltale-driver-20261107.js` (modelled on
  `scripts/grind-driver-20261106.js`): competent policy verbatim,
  150d death-aware, per-seed JSON to
  `evidence/2026-11-07/perseed-vetkilltale-a/` (RUN names
  `vetkilltale-baseline` / `vetkilltale-armed`), refuses overwrites.
  Wraps `queueKillerTale` / `queueVetKillerTale` (queue events with
  day, mid, killer, wave, reported-at-queue), wraps `Game.tele`
  (`killer_tale` / `vet_killer_tale` events), captures tale SAY lines,
  snapshots end state (waveKillLog, killerTaleLog, vetKillerTaleLog,
  fallen, codex reported map, days, endReason, scaleRank, standing,
  won).
- Analyzer `scripts/vetkilltale-analyze-20261107.js`: pure function
  over the per-seed files. Eligible repeat kill = a queued vet tale
  whose killer was alive at the night beat (killer not in fallen with
  death day <= queue day). Rate = vet tales told / eligible queued.
  Also asserts trajectory identity baseline-vs-armed per seed
  (days, endReason, waveKillLog length and entries, killer_tale
  count) — the lever is narration-only, so the trajectories must
  match exactly.
- Balanced panel (§15): the before/after pair IS this run's
  baseline-vs-armed panel on identical seeds; the analyzer's
  trajectory-identity check is the compare. No separate
  `balance-panel.js` run is fabricated — the panel script runs its
  own full panel and takes no corpus input (same as killersurvive-b).
- Sense test: read every vet tale line the pilot produces and judge
  it as fireside prose (names beast + killer, no debate invitation,
  no count the fiction cannot know).

## Primary metric (pre-registered, binds the run)

**GO iff ALL of:** (a) vet tale told on >= 80% of eligible repeat
wave-4+ kills in the ARMED leg; (b) 0% in the BASELINE leg
(`VETKILLTALE_OFF=1`); (c) trajectories identical baseline-vs-armed
per seed on days / endReason / waveKillLog / killer_tale count
(narration-only proven, not asserted); (d) the unit proof passes,
including the no-debate-rerun negative and the first-tale-once guard.
**Otherwise NO-GO** — kill fast, report, do not re-score.

**Pre-registered small-n rule:** repeat wave-4+ villager kills are
rare (the grind band holds ~1 known villager repeat in 8 seeds). If
the 8-seed pilot yields eligible n < 3, extend to 99681–99696
(16 seeds) BEFORE judging and judge on the pooled eligible n. If the
pooled eligible n is still < 3, judge the rate on the pooled n as
measured and let the unit proof carry the firing verdict — reported
as such in the evidence file, not as a silent bar-lowering.

## Guards / wall numbers

Report every leg: national / table / wins, wave 4–5 unlocks and
kills, median survival, vet tales queued/told, first tales told.
No gate/price/deed change, so no regression guard beyond
instrument errors 0, the trajectory-identity check, and the
first-tale counts matching across legs.

## Telemetry

`telemetry-check.js` will be attempted on the pilot corpus and its
refusal/recorded result reported honestly (prior killer-chain arms:
refused recorder-corpus input; baseline NOT rolled on a refusal).

## Metric review (to fill at closeout)

Pre-registered metrics bind this run; a miss is NO-GO, never
re-scored against a friendlier metric. If the metric proves wrong,
write it here and propose the revision for the NEXT run.
