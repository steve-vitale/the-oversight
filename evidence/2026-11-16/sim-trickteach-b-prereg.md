# sim-trickteach-b — PREREG (binding)

Loop B run `fleshout-loop-b-20261116T1530Z`, axis winnability chain,
arm sim-trickteach-b — LEVER FORM of the killfail finding: one
survived observation teaches a wave-4 trick (learning threshold
2 → 1). Branch `sim-trickteach-b`, base master tip `47477d874`
(coordinator evidence commit for round 1321: haventarget DIAG-GO
landed, seasoning G1 ruling owed, trickteach flap-held). Binding
prereg: THIS file — frozen here, judged in
`evidence/2026-11-16/sim-trickteach-b.md` without alteration. The
instrument (driver, analyzer, proof test) is built AFTER this
commit; no judged numbers exist yet. The game code (the lever)
is built AFTER this commit.

## The question, in plain words

Villagers reach wave-4 fights without knowing the beast's trick,
and the gate demands a known trick before it will say "go".
Killfail measured it: trick-unknown on 9 of 9 launched wave-4
fights, 0 kills. Gatelever measured the same wall from the
gate's side: 0 of 37 null rows had a known trick. A survived
encounter teaches nothing by itself — one observation is half a
lesson, and the second meeting often never comes, or comes as a
death. This lever asks: if one survived sighting is enough to
piece the trick together, do launched parties start killing
wave-4 beasts?

## Prior art (read first)

- `evidence/2026-11-16/sim-killfail-a.md` + prereg — the DIAG
  this lever answers. Baseline: 9 launched wave-4 fights, 0
  kills, trick-unknown 9/9, trickAfter false on all nine (one
  survived encounter records one observation; two are needed).
  Wild comparison: 38 wild wave-4 fights, also 0 kills. The
  prereg's lever candidate names exactly this arm, with the
  (degenerate, 2× of 0) GO bar this prereg re-freezes as
  armed launched kills ≥ 2. Its instrument (driver, analyzer,
  panel builder) is copied here, not rebuilt.
- `evidence/2026-11-16/sim-gatelever-b.md` + prereg — the gate
  lever pilot (NO-GO): 1 SEEK, 2 launched-party wave-4 kills,
  kill:death 0.67, faced-not-killed 0.67. Its part 2 (wait for
  the trick) only ever expired — the wait never opened a hunt
  on a learned trick, because learning itself is the slow step.
  This arm attacks the learning step directly. Its GO bar
  shape (launched kills + starvation/median-survival cost bar)
  is reused here. Do NOT rebuild gatelever's parts.
- Loop A (1515Z, LIVE) is running the trick-learning-rate DIAG
  on band 102141–102148. Do NOT touch its trees or band. This
  arm is the LEVER FORM on a different fresh band; the DIAG
  measures the rate, this arm moves it.
- Canon: `docs/CANON.md` (read first), `docs/MONSTER-WAVES.md`
  §Monster counters — the 2-observation rule IS canon-covered:
  "a villager who survives an encounter with a signature
  mechanic brings home an observation, and two observations
  teach the village the trick (`state.villagerTricks`)".
  No canon doc covers trick *learning speed* as a lever — this
  prereg says so rather than inventing canon. The lever changes
  a number, not the canon: the observation channel, the
  "COUNTER LEARNED" beat, and the narration stay exactly as
  canon describes them.

## Code facts the lever is built on (read from src, frozen)

Verified on this tree before this prereg:

1. `_trickObservation(vid, mid, firstPerson)`
   (`src/js/game.js`, ~line 36444) is the shared observation
   core. It increments `state.villageCounterObs[mid]` and
   teaches when the count reaches the threshold — hardcoded
   `obs[mid] < 2` in TWO places (the first-person "one more
   survived encounter" narration guard, and the learn gate).
   Both call paths feed it: `noteVillagerTrickObservation`
   (villagers) and `noteScholarTrickObservation` (the scholar,
   same shared bar). A kill also teaches through this same
   core via `discoverMonsterCounter` (waves 1–2 `counter`
   field) or the `villagerTricks` set (waves 3–5 signatures).
2. `noteNodeWitnessKill(vid, mid, witnesses)`
   (`src/js/game.js`, ~line 36483) is the second channel onto
   the SAME bar: a witnessed kill credits one observation.
   It carries its own hardcoded `obs[mid] < 2` learn gate
   and its own "(obs/2)" narration. The lever flips the
   threshold in both channels, because the bar is one bar —
   flipping only the survived-encounter channel would leave
   the witness channel teaching on the old count.
3. `villageKnowsTrick(mid)` (`src/js/game.js:36386`) is the
   unified read: waves 1–2 via the ledger convention
   (`monsterCounterKnown`), waves 3–5 via `villagerTricks`.
   The gate (`src/js/win-plan.js:537`) and the field-fight
   AI (`src/js/fieldFights.js:561`, learn-vs-fight judgment;
   `:112` counter execution) both read it. The lever changes
   no reader — only how soon the read turns true.
4. The threshold is a single shared bar for ALL trick-bearing
   species (waves 1–5). The lever therefore also teaches
   wave-1/2 counters after one observation. That is inherent
   to the lever form, not a second lever: the judged
   population is wave-4+ kills; wave-1/2 trick-known rates
   are reported as a secondary so the scope is visible.
5. Env-gate pattern (VETSHAPE precedent,
   `src/js/standing.js:238`): `((typeof process !==
   'undefined' && process.env && process.env.X) === '1')`.
   The lever reads `TRICKTEACH=1`; unset (including in the
   browser, where `process.env` never exists) the code takes
   the exact old path. Zero src/js behavior change when
   unset — proven by the proof test's static off-mode check.
6. Narration is never silent on this channel (canon: "the
   COUNTER LEARNED beat"). With threshold 1 the learned
   narration must not say "twice": the learned strings are
   made threshold-aware ("one sighting was enough" at 1,
   "lived to tell it, twice" at 2). The first-person
   "(n/2 — one more…)" line only fires below threshold, so
   at threshold 1 it never fires — but it is parametrized
   with the threshold anyway, so no stale "/2" can print.

## The lever — one change, nothing else (frozen design)

- `TRICKTEACH=1` → `trickLearnThreshold()` returns 1,
  else 2. The helper is the ONLY place the flag is read.
- `_trickObservation`: both `obs[mid] < 2` checks become
  `obs[mid] < threshold`; narration parametrized (see §6
  above). No other line in the function changes.
- `noteNodeWitnessKill`: its `obs[mid] < 2` learn gate
  and its "(obs/2)" narration become threshold-aware in
  the same way. No other line changes.
- No gate change, no party change, no damage change, no
  seed call. The gate still demands party 3 + armed +
  armored + known trick; the lever only moves how soon
  "known" becomes true.

## Frozen definitions

- **Wave-4 monster ids** (from `src/data/monsters.json`,
  wave 4; 10, re-read live by the driver):
  `algorithm`, `audit`, `congregation`, `eater`, `eulogy`,
  `herald`, `influencer`, `reunion`, `strike`, `suburb`.
- **Wave-5 monster ids** (10, re-read live):
  `cancellation`, `editor`, `finale`, `finale_crew`,
  `finale_opening`, `network_note`, `nielsen`, `rerun`,
  `spoiler`, `timeslot`.
- **A launched wave-4+ party fight (the population)** =
  the killfail frozen definition verbatim: a `fieldFight`
  row vs a wave-4/5 monster whose fighter or any ally at
  contact has an active trip window for a BROAD wave-4+
  launch event covering the fight day (trip window
  [launch day, first census day after launch on which
  the holder is no longer on expedition, capped at
  launch day + 14]).
- **A launched wave-4+ party kill** = a population fight
  with outcome `vKill`, counted as DISTINCT meetings
  (seed+vid+day+mid) — the gatelever bar-2 definition.
- **Trick-known at contact** = `trickBefore` on the
  fight row (`villageKnowsTrick(mid)` pre-fight).
- **Tricks learned** (mechanism) = distinct wave-4/5
  species per leg with a fight row showing `trickBefore`
  false and `trickAfter` true (first such transition per
  species per seed), plus the count of such transitions.
- **Starvation** = death-log starvation/hunger deaths
  (gatelever bar-5 definition). **Median survival** =
  median `days` across all 8 seeds per leg.
- **Instrument error:** any non-empty
  `instrumentErrors`, any per-seed file failing to parse,
  any fight whose launch join is ambiguous (analyzer
  names it, counts once, first event wins, flagged).

## Primary metric + GO bar (frozen, from the 1130Z brief)

GO iff ALL hold:

1. **Armed launched wave-4+ party kills ≥ 2** (distinct
   meetings, armed leg). The brief's bar: "armed wave-4
   kills >= 2 vs baseline 0". The control leg's own
   launched-kill count is stated alongside (killfail's
   baseline on its band was 0/9 launched fights; this
   run's control leg is the binding comparator, on
   identical seeds under the same policy).
2. **Cost bar (scalemetric precedent): starvation
   (armed) ≤ starvation (control) + 2 AND median
   survival (armed) ≥ 0.8 × median survival (control).**
   Total villager deaths are diagnostic (reported per
   leg + in the §15 panel), not a bar — the deaths price
   of wave-4 fighting is the gatelever lesson, and the
   panel carries it.
3. **Instrument clean:** 0 instrument errors on both
   legs, 8/8 per-seed files parse per leg, proof test
   green on the lever tip and green post-revert (off
   mode), D1 + D2 green (below).

A miss is NO-GO, never re-scored mid-run (§14). If the
pilot NO-GOs, the lever is KILLED (revert game code on
the branch, land evidence-only) — no 12–16 seed confirm
on an invisible effect. If launched fights are 0 on both
legs, bar 1 cannot pass and the review says the
population never formed (with the launch-event
denominator); the all-origins kill count is reported as
a secondary and the review may propose a revised
primary for the NEXT run, not this one.

## Secondary (reported, not judged)

- Outcome table for launched fights (vKill / mFlee /
  vFlee / vDie / evade) + flag prevalence (killfail
  taxonomy verbatim, incl. trick-unknown share).
- Wild comparison: wave-4+ wild fights, kills, trick
  known/after — launched vs wild on identical seeds.
- All-origins wave-4 kills and wave-5 kills per leg.
- Trick mechanism: tricks learned per leg (distinct
  species + transitions), trick-known share among
  launched fights per leg, trick-known share among
  wild fights per leg, wave-1/2 trick-known share
  (scope visibility for the shared bar).
- Per-seed table: launched events, launched fights,
  kills, median damage dealt per fight, median rounds.
- Per-fight table (every launched fight, one row).
- Gate rows joined to launched fights (seek / avoid /
  outmatched / not-consulted).
- Wall numbers (BOTH legs, BOTH national definitions):
  national by scaleRank ≥ 2 and by standing ≥ 200,
  table (seat taken), wins, wave-4/5 unlocks, median
  survival, starvation, total deaths.
- Sense check: quote ONE launched fight end to end from
  the armed leg (`killfailFights[].log[]` + launch rows)
  — what the party planned, what they met, how the
  fight read — and judge whether the trick, once
  learned, is VOICED (the "COUNTER LEARNED" beat) or
  arrives silently. Quote the learn beat itself when
  one fires on the armed leg.

## Seed band (verified fresh per the seed-band-freshness skill)

- **102211–102218** (8 seeds), 150d death-aware.
- Freshness check (this arm, before this commit — scope
  and result): zero whole-token hits for `102211`,
  `102221`, `102231` (the three candidate bands; the
  first was taken, the other two are recorded here as
  checked-fresh for the next arm, NOT reserved) in
  (a) all `evidence/*/sim-*-prereg.md` (rg rc=1),
  (b) all `evidence/2026-11-16/*.md` (rg rc=1),
  (c) `scripts/*.js` (rg rc=1),
  (d) the goal `hidden_files/convergence-tracker.md`
  and `sim-findings.md` (rg rc=1),
  (e) per-seed filenames under `evidence/` (no
  `10221*` / `10222*` / `10223*` file).
  Neighbouring used bands avoided: 102201–102208
  (seasoning, forbidden), 102141–102148 (Loop A live
  DIAG — do not touch), 102101–102108 (gatelever-b),
  102041–102048 (killfail-a), 102011–102018
  (launchdef/rumorplan), 102001–102008 (gatereach2).
  NEVER use: 100621–100636, 100861–100868,
  100821–100828, 100721–100728, 100761–100768,
  10100–10139, 190391–190398, 190621–190628,
  190631–190638, 190541–190548, 190561–190568.

## Horizon, policy, legs, panel applicability

- Horizon 150 days, death-aware (dead villages stop
  simulating; runs end early on win or village loss).
- Policy competent verbatim (`scripts/policies/competent.js`,
  sha256
  `74a890f0844ebc19fce2ac24da360f114b1f366fdb33a185a122f891dc2f0456`
  — verified by this arm with sha256sum before this
  commit; the same sha gatelever-b / dawnbid / gatereach2
  recorded). No env flags on the policy (competent is
  the default env). The driver's own-policy record
  carries the sha it ran under.
- Leg 1 (control): competent + recorder, `TRICKTEACH`
  unset, seeds 102211–102218.
- Leg 2 (armed): competent + recorder, `TRICKTEACH=1`,
  IDENTICAL seeds. The ONLY difference between the
  legs is the env flag.
- **§15 balanced panel:**
  `scripts/build-trickteach-panels-20261116.js` (copied
  from `scripts/build-killfail-panels-20261116.js`,
  panel-building logic UNCHANGED; only leg dirs, file
  names, seeds, pseudo-policy change) builds panels in
  the `scripts/balance-panel.js` schema from the two
  legs: before=control, after=armed, PAIRED seeds,
  pseudo-policy `trickteach-b` in both panels. The
  panel is the instrument; the prereg bars are the
  judge. The `compare` `.md` is attached to the
  evidence file.
- Pilot 8 seeds before any confirm spend. If the pilot
  NO-GOs, the lever is KILLED — no 12–16 seed confirm
  on an invisible effect.

## Determinism legs (frozen — neutrality proof)

- **D1 (repeatability):** armed tip, seed 102211,
  **150d**, recorder ON, run twice → identical per-seed
  JSON (deaths/days/endReason/vet5 + all killfail rows
  identical).
- **D2 (wrap neutrality):** armed tip, seed 102211,
  150d, recorder ON vs recorder OFF
  (`TRICKTEACH_RECORDER=off`) → identical trajectories
  (deaths/days/endReason/standing/vet5 + daily
  fingerprints). The recorder wraps are the only
  difference between the legs — D2 isolates them.
  `TRICKTEACH=1` stays ON in both D2 legs: the lever
  is the game under test, the recorder is the
  instrument.
- **D3 (drift smoke):** `scripts/trickteach-drift-check.js`
  (copy of `scripts/gatelever-drift-check.js`, same
  verdict logic over the series fingerprint) with
  first-lever-day = the earliest armed-leg day a
  wave-4/5 trick is first recorded known (first
  `killfailFights` row with `trickAfter` true for a
  species with no earlier `trickAfter`-true row, per
  seed; earliest across seeds). The lever can only
  change behavior once a trick becomes known on one
  observation instead of two, so any divergence before
  that day is DRIFT. If no trick is ever learned on the
  armed leg, first-lever-day is null and any divergence
  is DRIFT. Expected verdict: CLEAN or IDENTICAL on
  all 8 seeds (the legs share seed call, policy, and
  data; only the threshold differs).

## The instrument (frozen)

- Driver: `scripts/trickteach-driver-20261116.js` (new —
  copy of `scripts/killfail-driver-20261116.js`, EXTENDED
  only by renames, not rebuilt: same harness, snapshot,
  cascade, w5 recorder, gate rows, launches, killfail
  rows, ammo classifier — unchanged). RUN/OUTDIR
  defaults renamed (`trickteach-b`,
  `perseed-trickteach-b-control` / `-lever`); per-seed
  filename prefix `trickteach-b-s`; `LEG=competent`
  default; `TRICKTEACH_RECORDER=off` skips the recorder
  wraps (D2). Recorder wraps are pure reads plus writes
  to driver-local arrays — no game-state writes, no RNG.
  The driver refuses to overwrite an existing per-seed
  file. Errors are REPORTED into `instrumentErrors`
  (named, not swallowed). The driver ALSO records the
  first trick-learned day per species per seed
  (`trickLearnedDays`, from `killfailFights` trickAfter
  transitions) for the D3 check.
- Analyzer: `scripts/analyze-trickteach-b.js` (new —
  requires `scripts/analyze-killfail-a.js` and adds the
  trickteach judgment on top of its `analyzeFiles`
  output; the killfail analyzer itself is NOT modified).
  It reports, per leg: launched fights + kills
  (distinct), trick-known shares, tricks learned,
  all-origins wave-4/5 kills, starvation + median
  survival, the wall numbers, and the three-bar
  judgment. It exits non-zero on any bar failure or any
  `unknown` consultation path or arrival.
- Drift check: `scripts/trickteach-drift-check.js` (new —
  copy of `scripts/gatelever-drift-check.js`, same verdict
  logic, first-lever-day as frozen in D3 above).
- Proof: `scripts/test-trickteach-b.js` (new; see below).
  GREEN on the lever tip before the armed leg runs;
  GREEN again post-revert.
- Balanced panel (MEASUREMENT.md §15): as above; the
  panel builder is copied from the killfail one.

## Proof test

`scripts/test-trickteach-b.js` proves, on synthetic fixtures
and live in-memory runs (no corpus numbers):

- Static: the lever is env-gated (the flag is read in
  exactly one place, `trickLearnThreshold()`; `TRICKTEACH`
  appears nowhere else in src/); off mode = zero src
  behavior change (`git diff <BASE>...HEAD -- src/` empty
  with the flag unset — the static check diffs the
  committed lever against the branch base and asserts
  the lever files' off-mode behavior via a fresh
  loadGame with the flag unset); the threshold helper
  returns 2 unset / 1 set; the two `obs[mid] < 2`
  sites in `_trickObservation` and the one in
  `noteNodeWitnessKill` are the only threshold sites
  (grep census: no other `obs[mid] <` in game.js).
- Unit (threshold, synthetic fixtures via live
  loadGame): with `TRICKTEACH=1`, one survived
  observation teaches (villager channel AND scholar
  channel AND witness channel — a witnessed kill
  teaches on the first observation); with the flag
  unset, one observation does NOT teach and the
  second does (control still needs 2). Narration:
  armed learn beat carries no "twice"; control learn
  beat carries "twice"; the first-person "(n/2…)"
  line never prints a stale denominator.
- Unit (gate/fight readers): `villageKnowsTrick` false
  before / true after the single armed observation;
  the gate's trickHolds branch releases on the armed
  leg for the same party that held on control.
- Recorder: synthetic fixtures for the trickteach row
  shape (`trickLearnedDays`); a live in-memory run
  proves the fieldFight wrap records BEFORE-state
  (trickBefore) and AFTER-state (trickAfter, outcome,
  log).
- Determinism: D1 + D2 as frozen above (seed 102211,
  150d).
- GREEN on the lever tip before the armed leg runs.

## Sense-testing

Quote ONE launched fight end to end from the armed leg:
what the party planned (launch rows: target, party,
stage), what they met, how the fight read
(`killfailFights[].log[]`) — with seed, day, fighter,
monster named. Judge whether the fight reads like a
party that went out to kill a named beast and failed,
or a party that wandered into something it could not
hurt. Quote the "COUNTER LEARNED" beat when one fires
on the armed leg and judge whether the village voices
the learning or the knowledge arrives silently. Do not
invent fight narrative from kill counts.

## Canon grounding (read before building)

- `docs/CANON.md` — read first.
- `docs/MONSTER-WAVES.md` §Monster counters — the
  2-observation rule is canon; no canon doc covers
  trick-learning speed as a lever, and this prereg says
  so rather than inventing canon. The lever changes a
  threshold, not the canon channel.
- No canon doc covers plan-target attachment or the
  win-plan lifecycle beyond `src/js/win-plan.js`
  (ontology header) and the dated evidence — carried
  forward from the killfail prereg, unchanged here.

## Metric review (to be filled in the evidence file)

Pre-registered here: if launched fights are 0 on both
legs, the review will say the population never formed,
with the launch-event denominator, and will NOT claim
a 0% kill rate as a lever verdict. If the armed leg
moves all-origins wave-4 kills but not launched kills,
the review will say the lever moved kills but not
through launches, and propose the revised primary for
the NEXT run. If the cost bar passes but total deaths
rise materially on the panel, the review will name the
deaths price. No re-scoring mid-run: the bars above
are the judge.
