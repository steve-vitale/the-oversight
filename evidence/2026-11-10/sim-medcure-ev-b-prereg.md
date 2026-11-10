# sim-medcure-ev-b — prereg (MEDCURE RE-MEASURE WITH EVENT CAPTURE)

**Arm:** sim-medcure-ev-b (measurement, instrument fix) · **Run:**
fleshout-loop-b-20261110T2046Z (Loop B) · **Axis:** winnability chain /
scale-onramp (converging, NOT converged) · **Branch:** sim-medcure-ev-b ·
**Prereg committed BEFORE any judged computation.**

**Base note (recorded, not assumed).** The spawn brief named base master tip
`586ef734a`. At spawn, `git rev-parse master` in BOTH the main tree
(`~/workspace/the-scattering`) and this worktree returns
`febe01d6b43fdab8abb7c661c74ebf304c8a2f37` (tip: "sim-counterclose-a: pilot
corpus (16 cells) + evidence"). `586ef734a` is not the master tip in either
tree. This arm proceeds on the verified tip `febe01d6b`; if master moves
mid-run, rebase onto the explicit SHA read immediately before rebasing
(never `git rebase master`) and re-run proof after every rebase.

## The question

Finding #2095
(`hidden_files/sim-findings.md`, 2026-11-10): the 1930Z arm sim-medcure-b
went instrument NO-GO on G2 — 79/82 duty-cure events had no episode to
join, 0/14 wound-fever cures joined — because `villageSicknessTick()`
runs inside `endDay()` ← `sleep()`, *after* the day's `policy.daily`
snapshot, and onset then `villagerCareTick` → `medicDutyCureAttempt`
happen in the same tick. A villager who contracts wound fever and is cured
in the same tick never appears in any daily snapshot, so the
snapshot-built episode builder has no episode for the cure to join. Its
M1 (0/2 vs 2/3 on 5 episodes) is a selection artifact, not a census
re-measure. This arm re-measures with EVENT CAPTURE: capture sick-record
create/delete events (tick-phase snapshots inside `villageSicknessTick` /
`villagerCareTick`) so wound-fever episodes have real outcomes. Do NOT
re-run band 160209–160216 with the same instrument. Instrument only —
zero `src/js` expected.

## Canon read

- `docs/CANON.md` read first. Area canon: `docs/DISEASES.md` — two pools,
  never mix; mundane pool (gutrot, trichinosis, Fever `disease`, lockjaw,
  wound_fever, trembles, radiation_sickness); alien pool never diagnosed,
  eased, or cured by mundane medicine. Wound fever is a mundane infected
  wound (dirty wounds, botched tick removal). Cure tiers: folk remedies →
  occupation medicine → specific ruin medicine → earned healer deepenings
  → the Fever's End synergy. No canon doc covers how many medics a village
  should have — that gap is a finding, not an invention.
- Code facts verified BEFORE this prereg (read at base `febe01d6b`, not
  assumed):
  - `villageSicknessTick()` (game.js ~32837) runs once per `endDay()`
    (game.js ~33626) and does, IN ORDER: (1) progress existing sick
    records — `daysLeft -= 1`, `hurtVillager` damage (may kill →
    record deleted; `daysLeft <= 0` → record deleted = recovery),
    stale-cleanup for non-roster/dead vids; (2) onset new cases from
    vectors (wound fever / gut rot / tick fever) — `v.sick[vid] = {...}`;
    (3) `villagerCareTick(nm)`; (4) diagnosis / treat / tick-teach ticks.
    Consequence: same-tick onset+death via sickness damage is
    IMPOSSIBLE (progression precedes onset), and same-tick onset+recovery
    is impossible (`daysLeft` starts 3–6, decremented only in
    progression). The only same-tick invisibility is onset+cure.
  - `villagerCareTick()` (game.js ~33237) is called ONLY from
    `villageSicknessTick()`; the ONLY record deletion inside it is
    `medicDutyCureAttempt` (game.js ~33169, deletes `v.sick[pid]` on a
    cure); tending only decrements `daysLeft` by 1. A pre-care snapshot
    therefore sees EVERY record alive at cure time — including same-tick
    onsets — and a post-care diff isolates exactly the duty cures.
  - `medicDutyCureAttempt` is called ONLY from `villagerCareTick`
    (game.js ~33290). It never calls `cureStatus`, so a duty cure leaves
    no cureEvent in a feveranat corpus (same as medcure-b).
  - Daytime onset paths: `villagerFoodPoisoning` (game.js ~32732, called
    from village meals, game.js ~32332) and pellet radiation
    (`feastBuff.js` ~397). Both run during the day, BEFORE the
    `policy.daily` snapshot (`sim-harness.js` runDays: `policy.daily`
    runs after the 3 day-part loops and before `Game.sleep()`), so a
    daytime onset IS in that day's snapshot — unless cured in the same
    evening's care tick, in which case the pre-care snapshot still sees
    it. No daytime path needs a separate wrapper.
  - Other record deletions: `treatVillager` (scholar, daytime,
    game.js ~14398 — `eff === 'cure'` deletes); `resolveAidInbound`
    medicine (safetynets-adjacent aid delivery — deletes the sickest
    record); `betrayal.js` ~1146 (roster removal cleanup). All act on
    records that existed in a prior snapshot or tick-phase snapshot, so
    the episode EXISTS; only its outcome label can need the event
    stream (a scholar/aid cure closing an episode is recorded as
    `cured-other`, not `recovered` — see analyzer).
  - `safetynets.js` ~1441 wraps `villageSicknessTick` (relief-raising
    only, post-call, pure read of `v.sick` count). This arm's wrapper
    wraps the already-wrapped function and calls through; neutrality
    (G3) covers the composition.
  - NPC sickness rides `v.sick[vid] = { name, daysLeft, severity }`;
    `villagerDiseaseId(rec)` maps `'wound fever'` → `wound_fever`
    (game.js ~14354) and returns null for food-poisoning names. A
    wound-fever death routes through `hurtVillager` with cause
    `wound_fever` when the village knows the disease, else `sickness`
    (game.js ~32890).
- `docs/MEASUREMENT.md` §§9–12, 14–15 read: staged seeds, death-aware
  horizons, pre-registration, metric binding, balanced panels. This is a
  FIRST-NUMBERS re-measure, not a lever: the §9 pilot staging governs it
  as an 8-seed pilot. No panel (§15): a measurement-only arm with no
  before/after has nothing to compare; the wall numbers are reported
  instead. No confirm spend is pre-authorized: a confirm needs a separate
  prereg amendment with a fresh band.

## Seed-band freshness — 160501–160508 (8 seeds, pilot)

Checked 2026-11-10, BEFORE this prereg was committed, per the
seed-band freshness skill (all dated preregs + tracker/findings, not just
today):
- All dated preregs (`evidence/*/sim-*-prereg.md`,
  `evidence/*/journey-*-prereg.md`, word-boundary grep for `16050[1-8]`):
  0 files name any of them.
- Goal tracker + findings (`hidden_files/convergence-tracker.md`,
  `hidden_files/sim-findings.md`, word-boundary grep): 0 hits.
- Forbidden-band list
  (`hidden_files/sim-heraldband-pilot-prereg-2018.md`, grep for `1605`):
  0 hits.
- "1605" hits elsewhere are interior digits of larger numbers (kcal
  counts, float tails, ledger strings) — verified by context scan: 0
  seed-pattern hits.
- Contaminated prefixes NOT reused: 1603, 1604 (journey r112–r116
  matched reuse, named in journey-establishment-r127-prereg.md); 1605
  is not among them.
- Must NOT reuse 160209–160216 (medcure-b, same-instrument ban),
  160201–160208, 96301–96308 (medicdiag/medicduty/feveranat band),
  99101–99108 (sibling secondlink), 58201–58208 (sicknessdiag),
  95205–95208 (medchannel-seed-a), 99201–99208 (standacc-b list).

## Precondition (verified at base, before prereg)

`node scripts/godpath/test-measurement-proof-update.js` at base
`febe01d6b` — **RED at base, and the red is pre-existing on master, not
caused by this arm** (the identical failure reproduces in the main tree
`~/workspace/the-scattering` at the same tip, before this arm wrote
anything beyond the prereg file). The validate step throws "Proof source
inputs are not current": the recorded neutral proof
(`evidence/2026-11-10/neutral-r127scholar.json.gz`) no longer matches
`B.manifest(root)` on **2 of 521 inputs** — `src/js/convo-beats.js` and
`scripts/policies/competent.js` changed since the proof was recorded.

**Scoping correction (amended before commit, before any judged
computation — no sim has run).** The medcure-b prereg's precondition
("green = proceed; red = STOP") was copied into this prereg's draft, but
it is mis-scoped for this arm: the balance-proof freshness gates
before/after PANEL comparisons, and this is a measurement-only arm with
no before/after and no panel use (same as medcure-b). This arm's
neutrality is judged by its own driver-internal G3 (recorded vs bare
fingerprints), not by the panel proof. Stopping the re-measure the
coordinator explicitly tasked over an unrelated stale proof would waste
the run; refreshing the proof is shared-infrastructure work owned by
whoever changed the inputs (AGENTS.md: a changed input requires a fresh
real observer-neutral maintenance proof via
`scripts/balance-proof-update.js`), not a measurement arm, and this
prereg forbids regenerating a panel. So: the RED precondition is
RECORDED here as a finding (balance proof stale on master, 2 drifted
inputs, filed in `sim-findings.md` for the panel owner) and the arm
PROCEEDS. The drift is also noted for comparability: the competent
policy has changed since the neutral proof — this arm uses the CURRENT
competent policy unmodified, and M1 is compared to the 2026-11-08 census
descriptively, as preregistered.

## Legs (one judged leg — measurement, not a before/after lever)

- **Main leg — competent** (`scripts/policies/competent.js`, UNMODIFIED),
  env `PLENTYDEPRI=1 DEPOSITGATE=1`, horizon 150d death-aware (dead
  villages stop simulating, +10d tail max per the harness). 8 seeds
  160501–160508. One shared sweep; no variants.
- **Horizon why:** 150d matches the medicdiag/medicduty census horizon
  and the medcure-b horizon, so the re-measured wound-fever rates are
  comparable to the 2026-11-08 census (2.4% present vs 24.0% absent) and
  to medcure-b's partial numbers; death-aware cap keeps dead villages
  from padding the denominator with post-death days.
- **Instrument** (new, scripts only): `scripts/medcure-ev-driver-20261110.js`
  (medcure-b driver + tick-phase event capture — see below) and
  `scripts/medcure-ev-analyze-20261110.js` (episode builder v2 over the
  snapshot streams + event joins). Corpora under
  `evidence/2026-11-10/medcure-ev-b-corpus/`.
- **Proof** `scripts/test-medcure-ev-b.js` (episode-builder-v2 fixtures
  including the same-tick onset+cure case, cure-split reconciliation,
  pharmacy-series fixture, determinism + neutrality legs). Must FAIL on
  broken fixtures (swapped healer labels, dropped cure events, a
  same-tick cure with the pre-care snapshot removed).

## Instrument design (event capture — the fix for #2095)

The driver keeps everything medcure-b recorded (daily snapshot +
death capture via `registerDeath` call-through + duty-cure events via a
`medicDutyCureAttempt` call-through + `Game.say` sample + BARE
neutrality pass) and ADDS two call-through wrappers, same documented
exception as the existing ones (pure reads + external appends only, no
Game-state writes, no RNG):

- `villageSicknessTick` wrapper: snapshots `v.sick` (vid → { name,
  diseaseId via `villagerDiseaseId`, daysLeft, severity, diagnosed })
  at tick ENTRY (`preTick`) and tick EXIT (`postTick`), each with the
  tick's `dayOf()`, `healerPresent` (`campHealerId('haven')` non-null),
  `healerVid`, `medicCount`, and the roster vid list. The preTick →
  preCare diff yields progression deaths/recoveries; the preTick
  snapshot is the first sighting of any record whose onset the daily
  snapshot missed (diagnostic — expected ~0; counted separately as
  `pretickSightings`).
- `villagerCareTick` wrapper: snapshots `v.sick` at care ENTRY
  (`preCare`) and care EXIT (`postCare`) with the same fields. The
  preCare snapshot sees every record alive at cure time, including
  same-tick vector onsets; the preCare → postCare diff isolates the
  duty cures (the only deletion in the care tick) and the tends
  (`daysLeft` −1 without deletion).

Episode builder v2 (analyzer, from the snapshot streams + event joins —
no onset/end wrappers needed beyond the two above): an NPC wound_fever
episode opens the first time a (vid, diseaseKey) record is seen in ANY
snapshot (daily, preTick, preCare, postCare, postTick), with onsetDay =
that snapshot's day, healerPresent = that snapshot's healerPresent, and
`onsetSource` = the snapshot kind (`snapshot` | `preCare` |
`preTick` | `postCare` | `postTick`). It stays open while seen in any
later snapshot. Outcome, in priority order: `died` if a death row for
that vid has day in [onsetDay, lastSeenDay+1]; `cured-duty-<channel>` if
a duty-cure event names (vid, wound_fever) in the same window;
`cured-other` if the record disappears with no death or duty cure AND
a scholar/aid cure is the known closer (currently: disappearance with
no duty cure and no death is `recovered` unless a `treatVillager` /
aid cure event exists — this arm records no such wrapper, so the label
stays `recovered` and the count of such disappearances is reported;
a follow-up arm may wrap those two closers); `recovered` if the record
disappears with no death or cure; `left` if the vid is no longer on the
roster when the record disappears (excluded from M1 — neither died nor
recovered); `open` if present on the final day. `healerPresent` at onset
is the onset snapshot's value. Reconciliation counts (deaths joined vs
unlinked, cures joined vs unrecorded, preTick sightings, tend counts)
are printed, never hidden.

## Metrics (binding — definitions the analyzer implements exactly)

Per-seed daily snapshot: unchanged from medcure-b (day, pop,
healerPresent, healerVid, medicCount, sickMap, dutyVid, dutyCures
cumulative, pharmacy direct read). Per-tick phase snapshots: as above.

- **M1 — wound-fever death rate by healer presence (PRIMARY):** NPC
  wound_fever episodes (builder v2), split by healerPresent at onset;
  mortality each side (died / episodes, `left` episodes excluded from
  both numerator and denominator and reported separately). Re-measure
  of the 2026-11-08 census (2.4% present vs 24.0% absent). Reported
  alongside: all-disease NPC episode mortality by healer presence,
  wound_fever episodes' treated share (duty-cure or tended) each side,
  and the onset-source split (how many wound-fever episodes were
  snapshot-visible vs preCare-only — the size of the blind spot
  medcure-b missed).
- **M2 — cure channel split:** duty cures total, by channel (ability vs
  medicine), per seed and pooled; cure events listed (seed, day, holder,
  patient, disease, channel); reconciliation vs the game's own
  `v.medicDutyCures` counters (must match exactly — a mismatch is an
  instrument failure, not a finding). Scholar-side cures
  (`treatVillager` cured) reported separately if any.
- **M3 — pharmacy stock over time:** total medicine doses per village-day
  (pooled mean, max, days with ≥1 dose, days with 0); per-type split;
  stock-change events (finds/deposits vs duty-cure spends) counted;
  seeds that ever hold medicine vs never.
- **Wall numbers (reported every run):** national / table / wins, wave
  reach 1–5, median + max survival, death-cause shares.

## Primary metric (binding)

**Complete first-numbers capture on every pilot seed, with a valid
instrument — the episode-join rate is the judged quantity.** This is a
re-measure: there is no lever to pass or fail on an effect size, so the
GO bar is on the measurement itself.

**GO requires ALL of G1–G4:**
1. **G1 capture complete, 8/8 seeds:** every pilot seed exits 0; every
   per-seed corpus parses; daily rows span first→last day; end snapshot
   present; death rows consistent with the fallen list; every tick
   carries all four phase snapshots (preTick/preCare/postCare/postTick
   counts equal within each seed); 0 instrument errors.
2. **G2 episode join clean:** every NPC wound_fever episode has a
   non-null healerPresent at onset (0 UNCLASSIFIED); every wound-fever
   death row joins to an open episode (0 unlinked wound-fever deaths);
   duty-cure events reconcile exactly with `v.medicDutyCures` counters
   (0 counter mismatch); **episode-join rate ≥ 80%** — at most 20% of
   duty-cure events may lack an episode to join (the bar the spawn
   brief sets; the design expects ~100% since the pre-care snapshot
   sees every record alive at cure time — a join below 100% is
   reported with its mechanism, and any unrecorded cure is listed).
3. **G3 neutrality PASS:** recorded vs bare trajectory identical
   (fingerprint: daysAlive, endReason, death keys + causes, final pop)
   on all 8 seeds, same code, same master.
4. **G4 proof PASS:** `scripts/test-medcure-ev-b.js` green on all legs
   (determinism + recorder-validity fixtures + broken-fixture
   sensitivity, including a fixture that FAILS if the pre-care snapshot
   is removed).
A miss on any gate is NO-GO for the measurement (never re-scored against
a friendlier metric); the evidence then says which gate failed and what
the partial numbers are worth.

**M1 validity condition (binding):** M1 may be cited as the census
re-measure ONLY if G2 passes. If G2 fails, M1 is reported for the record
with the same selection-artifact warning medcure-b carried, and the
evidence says which join leg failed.

**Secondary (report, not judged):** M1/M2/M3 values themselves (they are
the first numbers — reported, not gated against the 2026-11-08 census; a
divergence from 2.4%/24.0% is a finding, never a failure); healer-days
share; duty-days share; per-seed village assessment; the onset-source
split (snapshot vs preCare-only episodes).

## Sense-testing (SENSE-TESTING LAW)

Read the transcripts (say-lines around the event days) of 2–3 wound-fever
episodes — a wound-fever death with no healer present, a same-tick
onset+cure (the case medcure-b could not see), a recovery — and judge
meaning, coherence, consequences, never just counts. Include a short
village assessment in plain words: what the villages looked like, who
died of wound fever and why, what the pharmacy held.

## Non-goals

- Re-measure only: name the numbers, do NOT build a lever (a fix is the
  next arm). Zero `src/js`, no default flips.
  `git diff HEAD -- src/` must be empty at the end.
- No landing, no push, no version bump — report ready-to-merge; the
  coordinator lands it.
- Flap protocol: probe-gate EVERY git write (`git update-ref
  refs/heads/probe HEAD` before each safe-commit); if the probe fails, do
  read work and retry later — never force a write, never route around a
  denial with a manual ref edit. File writes go through the `muse.write`
  tool; git writes go through the probe.
- Safe-commit index clobber: after EVERY safe-commit, run `git status
  --short`; if files show as staged-deleted with worktree files intact,
  repair via `git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info`, then verify status empty + `git diff HEAD` empty +
  hash-object matches HEAD blob.

## Metric review (pre-registered note)

- The primary metric is instrument validity + complete capture, judged
  exactly as registered above. M1/M2/M3 values are the deliverable, not
  a second primary smuggled in: if this band's wound-fever rates differ
  from the 2026-11-08 census (2.4%/24.0%), the difference is reported as
  a finding with the mechanism named if visible (duty cures, headcount,
  horizon), never used to re-pick the question or to claim the duty
  worked or failed — this arm has no before/after.
- The episode outcome window [onsetDay, lastSeenDay+1] is a stated
  instrument choice carried from medcure-b: if the analyzer reports
  unlinked wound-fever deaths > 0, the window is revisited in the metric
  review of the evidence file, not widened silently mid-run.
- The medicine channel is expected to stay near-zero (medicduty-a: 0/8
  seeds fired it; medcure-b: 0/82 cures; medicine is ruin-found and
  rare). A 0 is a valid first number, not a failed measurement — but the
  pharmacy series must still show whether stock ever existed to spend
  (M3 answers that).
- The competent policy never sits and never wins by design; national /
  table / wins are reported as wall numbers, not judged.
- Known instrument limit, stated before the run: daytime onsets
  (food poisoning, pellet radiation) are dated to the first snapshot
  that sees them — the daily snapshot if they survive to it, else the
  pre-care/pre-tick snapshot of that evening's tick. The onset DAY is
  therefore exact for tick-vector onsets and within the same day for
  daytime onsets; the `onsetSource` field makes the distinction
  auditable. Episodes closed as `recovered` may include a small number
  of scholar/aid cures (no wrapper on those two closers this arm); the
  count is reported and the label is honest about it.
- The 80% join bar (G2) is a floor, not a target: the design expects
  ~100% because the pre-care snapshot is taken inside the same tick as
  every duty cure. If the join lands between 80% and 100%, the evidence
  must name the mechanism for every unjoined cure before M1 is cited.
