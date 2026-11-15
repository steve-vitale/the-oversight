# sim-succpolity-b — SUCCPOLITY / SUCCGRACE against the hold

Run: fleshout-loop-b-20261114T2345Z, arm sim-succpolity-b, branch `sim-succpolity-b`.
Prereg: `evidence/2026-11-14/sim-succpolity-b-prereg.md` (commit 8e9379a01, binding).
Status: **STOPPED at the REPRO GATE — 5 of 6 baseline cells reproduce; 1 does not.
No judged leg was run.** This file records the gate outcome, the diff, and the
diagnosis, so the coordinator can decide the next step (re-baseline the one
cell on current HEAD, or another route). Nothing below is a leg verdict.

## What was supposed to happen

The hold: realms dissolve after the court — 7 dissolutions in the
answercourt-confirm band (seeds 100201–100216, 150d), 2 never re-climbed
(100203, 100212). The levers (both already in `src/js/hierarchy.js`, default
OFF, env-gated, zero src/js changes for this arm):

- `SUCCPOLITY=1` — a 14-day proving window that reads inherited standing
  instead of the funeral hour's shaken trust.
- `SUCCGRACE=1` — an answerable renegotiation beat for sub-bar links at
  succession instead of the silent verdict (answered by the succpolity policy
  with a gift; the baseline answercourt policy does not answer renegotiation
  beats).

Baseline: the committed answercourt-confirm corpus
(`evidence/2026-11-14/perseed-answercourt-confirm-b/`, anchor
`b3de4e512cf003e4004d7254431146ead1195039`, 2026-11-14 20:58:35Z), armed leg.

## REPRO GATE (binding, prereg §"REPRO GATE")

Re-ran baseline seeds 100201, 100203, 100208 × both policies (6 cells),
env defaults, driver `scripts/succpolity-driver-20261114.js`, RUN=`repro`,
OUTDIR `perseed-succpolity-b-repro`, compared with
`scripts/compare-succpolity-repro.js` (field-for-field modulo `anchorCommit`,
`run`, `arm`, `env`, additive `dissolutionLines`, additive `prSg`).

Result: **5 PASS, 1 FAIL — gate FAILS.**

| seed | policy | result |
|------|--------|--------|
| 100201 | competent-scaleclimb-b | **FAIL — days 124 (corpus) vs 143 (repro)** |
| 100201 | competent-answercourt-b | PASS |
| 100203 | competent-scaleclimb-b | PASS |
| 100203 | competent-answercourt-b | PASS |
| 100208 | competent-scaleclimb-b | PASS |
| 100208 | competent-answercourt-b | PASS |

Per the prereg: **STOP, report the diff to the coordinator, do not
re-baseline, do not run judged legs.** That is what happened. No pilot leg
(a), (b), or (c) was run. No leg verdict exists.

## The diff (seed 100201, competent-scaleclimb-b)

Both runs end `village-lost`, scale `regional`, maxWave 4, standing 199.
The series is **identical through day 96** (scale, wave kills, pantry,
population, deaths, link roll, policy events).

First divergence — series day 97:

- wave kills: corpus `{"1":30,"2":13,"3":4}` vs repro `{"1":30,"2":14,"3":4}`
  — the repro party killed **one more wave-2 monster** in a wild fight.
- pantry: corpus 6,871 kcal vs repro 6,750 kcal (121 kcal more spent).
- deaths: corpus has Yuki Mori dying day 97 ("a stranger"); repro has Yuki
  Mori dying day 98 ("a stranger"), plus a paparazzo kill day 97 and an
  alien-tick kill day 98.
- downstream: corpus village-lost day 124 (68 deaths, 1 starvation); repro
  village-lost day 143 (75 deaths). The village survives 19 days longer
  because that one day-97 fight went the other way.

Policy behaviour is **byte-identical** in both files: same 3 proposes
(accepted), same 3 accord-answers (gift), same 17 tends, same tend kcal
(25,500). The capSummary differences (`proposeBlockedPending` 63 vs 81,
`nationalPendingDays` 63 vs 81, `tendsBlockedPantry` 35 vs 29) are
consequences of the longer run, not causes. The divergence is in **fight
outcomes only**, not in policy, diplomacy, or succession handling.

## Diagnosis: the known src/js delta since the corpus anchor

The brief's "zero src/js behavior changes since that corpus" is **false**
(established in the prereg): `git diff b3de4e512..HEAD -- src/js/` is
`build.js` (version stamp only) + `game.js` (17 lines) + `partyTactics.js`
(73 lines) — the **Reunion ARENA balance** (Steve-ordered 2026-11-14: arena
Reunion HP ×0.4, damage ×0.6 via per-fight clone; arena mirror cap 1),
gated on `state.arenaContest` at `startCombat` entry. Field fights and wild
Reunion keep the full def. Corpus anchor `b3de4e512` is **not an ancestor**
of HEAD `910bff7f4`.

The day-97 divergence sits **two days after a day-95 arena fight** in this
seed: the deaths list records a villager (gen_wyi1ppj) dying "the arena" on
day 95 in both runs, wave kills tick wave-1 29→30 and wave-2 12→13 that day,
and day 95 is also a succession day (Simone dies; the mantle passes to
Yuki — "Simone is dead — and the dead hold no treaties. Every link Haven
has shakes."). The day-95 arena deaths are identical in both runs, but the
survivors' wounds are not in the series snapshot — a weaker arena Reunion
under the new balance leaves the party in a different state, and the next
wild fight (day 97) plays out differently. That is the consistent
explanation; it is **not proven at the code level** (the arena fight's
composition is not recorded in the per-seed file — the 600-line episode ring
holds only the tail, and the Reunion mentions in both files are identical
wild-lingering "gorges at the treeline" lines on days 47–52, not an arena
fight).

What rules out a harness/determinism fault: 5 of 6 cells reproduce
field-for-field over 122–150 days each, including both policies on 100203
and 100208 and the armed policy on 100201. A flaky RNG or a driver
transcription error would scramble cells broadly, not one fight on one day
in one cell. The driver and policies are byte-identical recoveries (hashes
verified in the prereg).

## Analyzer validation (independent of the gate)

`scripts/analyze-succpolity-b.js` run against the corpus as its own
baseline reproduces the holdrealm numbers exactly (baseline wall):
national ever 13/16, at end 8/16, table 0, wins 0, wave 4 16/16, wave 5
8/16, median survival 121.5d, dissolutions 7, reclimbs 2, starvation 6,
total deaths 1225. Dissolutions found: 100203 d90 (speaker-death),
100204 d139, 100206 d134, 100208 d101 (reclimb), 100211 d107 (reclimb),
100212 d142, 100216 d97 — matching holdrealm. The analyzer is trustworthy;
the gate failure is in the game, not the instrument.
Output: `evidence/2026-11-14/succpolity-b-analysis.json` (baseline section;
its "leg" section is the corpus compared against itself and is not a leg
verdict — ignore it).

## Proof tests

`scripts/test-succpolity-b-20261114.js`: §1 static **67/67 green**;
§2 game **16/16 green** (60d smoke on seed 100201, both policies, env flags
on; 59 series days each, dip=102, 0 instrument errors). Re-run after the
analyzer main-block edit (summary-first, flap-tolerant write) — still green.

## What is committed (branch sim-succpolity-b)

- `evidence/2026-11-14/sim-succpolity-b-prereg.md` (8e9379a01)
- Instrument (069610bba): recovered policies byte-identical, succpolity
  policy, driver, analyzer, panel builder, proof test.
- This stage (to commit): repro corpus
  `evidence/2026-11-14/perseed-succpolity-b-repro/` (6 files),
  `scripts/compare-succpolity-repro.js`, analyzer main-block fix, analysis
  JSON, this evidence file.

## Infrastructure notes

- The host write flap was active through the repro runs: one cell's file
  write fell back to stdout twice (100201 scaleclimb in the first sweep —
  lost to a truncated pipe, re-run clean; 100203 answercourt in the second
  sweep — re-run clean). All 6 repro files are now on disk, verified valid
  JSON. The driver/analyzer write-robust fallback (tmp file + rename, 480
  retries, stdout fallback) worked as designed; the 0-byte `.tmp` files are
  the flap's signature (write() refused, not rename).
- safe-commit.sh's mass-deletion guard refused the instrument commit once
  (458 files, 288,921 deleted lines in src/) on a flap-damaged private
  index; the guard computation verified clean (0 deleted lines) when re-run
  directly, and the retry landed (069610bba). The guard did its job; no
  `--force-delete` was used. Index clobber struck after that commit
  (repaired with the documented `ls-tree -r | update-index --add
  --index-info` pipe).

## Metric review

No metric revision is proposed. The gate did what it was for: it caught a
real baseline drift (one cell's fight outcomes moved with the Reunion
arena balance) before any judged leg spent the corpus's authority. The
dissolution metric itself was not exercised — no leg ran. If the coordinator
re-baselines, the natural unit is the single drifted cell (100201
scaleclimb on current HEAD), not a fresh corpus: 5 of 6 cells are already
proven stable, and the drift is confined to fight outcomes downstream of
an arena fight, not to the succession/diplomacy machinery the levers touch.

## Open question for the coordinator

1. Re-baseline the one drifted cell (100201 scaleclimb) on current HEAD and
   proceed with the pilot legs against the mixed baseline (5 corpus cells +
   1 fresh cell), or re-run the whole confirm band on HEAD, or hold the arm
   until the Reunion arena balance settles? Awaiting the call — **no judged
   leg will run until it comes.**


## Coordinator decision (Loop B coordinator, 2026-11-15, binding — recorded verbatim)

RE-BASELINE the single drifted cell (100201 scaleclimb) on current master and proceed with pilot legs (a)/(b)/(c) against the armed corpus leg. Rationale: the ARMED leg — the actual judge's baseline for G2 — reproduced 3/3 on the sampled cells; the drifted cell is a baseline-policy cell used for wall numbers only; the drift is a landed, Steve-ordered game change, not an instrument fault; re-running the full 16-seed band for a one-cell divergence would waste a band. GUARD: after rebasing the branch onto current master tip 3321c6546, re-run ALL 6 repro cells on the new tip first. If any ARMED cell now diverges, STOP and report (gate re-arms) — do not run judged legs. The fresh 100201-scaleclimb cell becomes the wall-number baseline for that cell only, labeled re-baselined in the evidence.


---

## Adoption + guard re-run (Loop B run fleshout-loop-b-20261115T0155Z, 2026-11-15)

Adopted from the dead run fleshout-loop-b-20261114T2345Z. Committed stage
first (repro corpus + compare script + analyzer fix + analysis JSON +
evidence file, incl. the coordinator decision above): `40426e4bc`
(rebased: `a9b7f537d`). Rebased onto current master tip `3321c6546`
(Lane B social-life r206, `src/js/betrayal.js` only); rebase clean, 3/3
commits replayed. Proof test re-run green on the rebased tip: §1 static
67/67, §2 game 16/16.

GUARD (per the coordinator decision): all 6 repro cells re-run on the new
tip into `perseed-succpolity-b-repro-tip/` (RUN=`repro-tip`, anchor
`a9b7f537d` — the branch tip containing `3321c6546`), compared with the
compare script's own normalize/firstDiff against the corpus:

| seed | policy | new tip vs corpus |
|------|--------|-------------------|
| 100201 | competent-scaleclimb-b | FAIL — days 124 vs 143 (same drift) |
| 100201 | competent-answercourt-b | PASS field-for-field |
| 100203 | competent-scaleclimb-b | PASS field-for-field |
| 100203 | competent-answercourt-b | PASS field-for-field |
| 100208 | competent-scaleclimb-b | PASS field-for-field |
| 100208 | competent-answercourt-b | PASS field-for-field |

Guard outcome: **all 3 ARMED cells reproduce field-for-field on the new
tip — the gate does NOT re-arm.** The drifted cell's new-tip run matches
the OLD repro run field-for-field (143d, 75 deaths) — the drift is stable,
not flaky, and is the landed Reunion arena balance. Committed as
`834a49dd2` (repro-tip dir + the labeled re-baselined cell below).

RE-BASELINED CELL (wall numbers only, this cell only):
`perseed-succpolity-b-repro/succpolity-b-s100201-competent-scaleclimb-b-repro-tip-3321c6546.json`
— fresh run on the rebased tip: days 143, `village-lost`, regional,
maxWave 4, standing 199, deaths 75. The corpus's 124-day figure for this
cell is retired; every other wall-number cell still reads from the corpus.

## Pilot legs — verdicts (all three KILLED AT PILOT, no confirm ran)

Pilot: seeds 100201–100208, 150d, env defaults, driver
`scripts/succpolity-driver-20261114.js`. (a) `SUCCPOLITY=1` + policy
competent-answercourt-b, RUN=`succpolity-a`; (b) `SUCCGRACE=1` + policy
competent-succpolity-b, RUN=`succpolity-b`; (c) both on + policy
competent-succpolity-b, RUN=`succpolity-c`. 24 files in
`perseed-succpolity-b/`. Analyzer: `succpolity-b-analysis.json`
(final run covers all three legs). Panels (pilot-only, 8 seeds — the
builder's 16-seed list was patched in a /tmp copy, committed builder
untouched): `succpolity-panel-{a,b,c}-pilot.{json,md,-before.json.gz,-after.json.gz}`.

| leg | pilot dissolutions (events / seeds of 4) | pilot gate (≤2 of 4) | G1 | cost bar | verdict |
|-----|------------------------------------------|----------------------|----|----------|---------|
| (a) SUCCPOLITY=1 | 4 events / 3 seeds (100203 d105, 100206 d135, 100208 d106+d142) | FAIL | GO (0 errors, 0 beats, 0 young answers) | clean (starv 2, median 138.5d) | **KILLED AT PILOT** |
| (b) SUCCGRACE=1 | 4 events / 4 seeds (100203 d95, 100204 d140, 100206 d140, 100208 d105) | FAIL | analyzer GO=false — **proven false positive, see instrument note** | clean (starv 5, median 140.5d) | **KILLED AT PILOT** |
| (c) both on | 4 events / 3 seeds — identical to (a) | FAIL | GO (0 errors, 0 beats staged) | clean (starv 2, median 138.5d) | **KILLED AT PILOT** |

Per the prereg the pilot gate binds: no confirm spend for any leg. The
G2 read on the pilot alone is consistent with the kill (dissolutions
already 4 events on the 4 pilot seeds; neither 100203 nor 100212
re-climbed in any leg — 100212 was outside the pilot band, 100203 never
re-climbed in any leg).

### What the levers actually did (dissolution day, corpus → leg)

- (a) SUCCPOLITY=1: 100203 d90→d105 (+15d); 100204 d139→held (village
  died d140 still national — the window outlived the village); 100206
  d134→d135 (+1d); 100208 d101→d106 (+5d, then re-dissolved d142 after a
  re-climb). The 14-day proving window delays the verdict; it does not
  repair the links, so the same erosion kills the realm days after the
  window closes.
- (b) SUCCGRACE=1: 100203 d90→d95 (+5d); 100204 d139→d140 (+1d);
  100206 d134→d140 (+6d, and the village survived to d150);
  100208 d101→d105 (+4d, then re-climbed and HELD national to d150,
  standing 527 — the best end-state of any leg). Each gift buys days,
  not a hold.
- (c) both on: **behaviorally identical to (a) on all 8 seeds** — zero
  diffs on days, endReason, per-day scale series, deaths, verbEvents,
  waveKills, standing (checked field-by-field; only policy-label /
  capSummary-stats fields differ). Zero succgrace beats staged in the
  whole leg (`succgraceBeatsSeen` 0 on every seed): while SUCCPOLITY's
  window holds the polity, the beat's staging condition
  (`nationalLive && !_havenPolity()`) never holds, so SUCCGRACE has
  nothing to answer. The two levers do not stack — on this band (c) IS
  (a), and the gift machinery never fires.

### Per-seed table (pilot band; corpus = armed leg)

Columns: days / end / scale-at-end / maxWave / standing / deaths / starv
/ dissolutions. Corpus pilot-band totals: median 134.5d, starv 3, deaths
608, national ever 7/8, at end 4/8, wave 5 4/8.

| seed | corpus armed | (a) SUCCPOLITY | (b) SUCCGRACE | (c) both |
|------|--------------|----------------|---------------|----------|
| 100201 | 150 surv national 4/199/50/0/— | 150 surv national 4/199/50/0/— | 150 surv national 4/199/50/0/— | = (a) |
| 100202 | 120 lost regional 5/395/116/0/— | 120 lost regional 5/395/116/0/— | 120 lost regional 5/395/116/0/— | = (a) |
| 100203 | 150 surv regional 5/350/76/1/d90 | 150 surv regional 5/420/83/0/d105 | 141 lost regional 5/250/82/3/d95 | = (a) |
| 100204 | 140 lost regional 4/199/99/1/d139 | 140 lost national 4/199/99/1/— | 140 lost regional 4/199/99/1/d140 | = (a) |
| 100205 | 68 lost national 4/199/56/0/— | 68 lost national 4/199/56/0/— | 68 lost national 4/199/56/0/— | = (a) |
| 100206 | 137 lost regional 5/395/75/0/d134 | 137 lost regional 5/395/75/0/d135 | 150 surv regional 5/395/76/0/d140 | = (a) |
| 100207 | 103 lost national 4/199/67/1/— | 103 lost national 4/199/67/1/— | 103 lost national 4/199/67/1/— | = (a) |
| 100208 | 132 lost national 5/452/69/0/d101 (+reclimb d113) | 150 surv regional 5/300/62/0/d106+d142 (+reclimb) | 150 surv national 5/527/82/0/d105 (+reclimb) | = (a) |

Notes: (a) and the corpus agree seed-for-seed on days/end/scale on 6 of
8 seeds; the differences are all in the dissolution column. Leg (b)
changed 100203's ending (survived→lost d141: the village lived 9 days
shorter than the corpus while dissolving 5 days later — the gift cost
3,000 kcal from a thin pantry and the village starved 3, vs 1 in the
corpus). Guardrail (§14c): no seed's leg deaths exceed the corpus-armed
deaths by >50% on any leg (worst: 100203 (a) 83 vs 76, +9%).

### Wall numbers (pilot 8 seeds per leg; corpus full band 16 for reference)

| leg | national ever | national at end | table | wins | wave 4 | wave 5 | median surv. | starv | total deaths |
|-----|--------------|-----------------|-------|------|--------|--------|--------------|-------|--------------|
| corpus armed (16) | 13/16 | 8/16 | 0 | 0 | 16/16 | 8/16 | 121.5d | 6 | 1225 |
| corpus armed pilot band (8) | 7/8 | 4/8 | 0 | 0 | 8/8 | 4/8 | 134.5d | 3 | 608 |
| (a) SUCCPOLITY=1 | 7/8 | 4/8 | 0 | 0 | 8/8 | 4/8 | 138.5d | 2 | 608 |
| (b) SUCCGRACE=1 | 7/8 | 4/8 | 0 | 0 | 8/8 | 4/8 | 140.5d | 5 | 628 |
| (c) both on | 7/8 | 4/8 | 0 | 0 | 8/8 | 4/8 | 138.5d | 2 | 608 |

The scale wall did not move: no leg reaches the table, no wins, national
reach unchanged (7/8 ever, 4/8 at end — the same four seeds hold at the
end in every leg). The pseudo-panels agree (decision `review_required`
on all three; leg (a): village deaths per run 76→76, no material signal;
community loss 0.75→0.625, no material signal). The panel is the
instrument; the pre-registered pilot gate is the judge.

### Succgrace beat accounting — leg (b) (the only leg where beats staged)

6 beats staged, 6 answered with the gift, 0 lapsed, 0 pending at end
(policy `capSummary.succpolity` stats — the authoritative record; the
analyzer's prSg-series read shows staged 0/0/0/0 on every seed because a
same-day answer never reaches the snapshot roll — see instrument note):

| seed | day | link | gift paid | trust | outcome |
|------|-----|------|-----------|-------|---------|
| 100203 | 90 | Emberhold | 1,500 kcal | +8 | dissolved d95 (+5d) |
| 100203 | 90 | Thornfield | 1,500 kcal | +8 | dissolved d95 (+5d) |
| 100204 | 139 | (link_mgpspiwv206) | 0 kcal — pantry empty | +0 | dissolved d140 (+1d) |
| 100206 | 133 | (link_mgpsphuy12) | 1,500 kcal | +8 | dissolved d140 (+6d) |
| 100206 | 133 | (link_mgpspiae716) | 1,500 kcal | +8 | dissolved d140 (+6d) |
| 100208 | 100 | Stonebridge | 1,500 kcal | +8 | dissolved d105 (+4d), re-climbed, held |

Young-link beats were seen and correctly LEFT alone: 100203 one link
seen 15 days (d121–136), 100204 one link 8 days, 100208 two links 14
sightings (d24–30) — zero `answerRenegotiation` events on any of them.
Notably the same Stonebridge link on 100208 carried a young beat at
d23–30 (left to lapse) and a succgrace beat at d100 (answered) — the
policy distinguished the two kinds on the same link, weeks apart.

The 100204 gift is the poverty trap in miniature: the beat was answered
on the day the realm dissolved, the pantry held 0 kcal to give, the gift
cost 0 and moved trust 0 — an answered beat that changes nothing. The
same trap blocks 100203's re-climb in the corpus (trust 21/39/22 at
d150, zero tends in 60 days).

## Sense-testing (SENSE-TESTING LAW)

The renegotiation beat READS as a played negotiation, not a silent
meter. Seed 100203, leg (b), d89 — the new speaker's word arrives named,
priced, and deadlined:

> "Emberhold's new speaker sends word: the bond is fraying — trust 36,
> below the 40 the realm stands on. The realm will come apart unless the
> new bearer [redacted]: send grain (1,500 kcal), send a speaker
> (2 days), or let the silence answer. Grief delays the verdict — seven
> days. (Trust -8.)"

Same day for Thornfield (trust 33). The answer is voiced the next morning,
d90:

> "🕊️ Haven sends 1,500 kcal to Emberhold's fire — grief met with grain.
> The new speaker eats with Haven's people and the tribute stays where it
> was. (Trust +8.)"

And the failure is voiced too, d94:

> "📡 The world feed goes quiet — the summons dies with the realm that
> earned it. The galaxy watched a fire that is out."
> "◈ The realm came apart — no polity answers to Haven now, and Haven is
> a free fire again. National no longer describes this village. The climb
> starts over."

The young-beat voice is distinct and also played (100208, d23):

> "Stonebridge watches to see if Haven holds without its dead. The bond
> is young — they're still deciding what Haven is, and grief delays the
> verdict. They'll test the link — count on it, unless Haven answers
> first: send grain (1,500 kcal), send a speaker (2 days), or let the
> silence answer. (Trust -8.)"

Judgment: the negotiation itself is good writing and a real choice with a
real deadline. What is NOT played is the rest of the stool: the gift
repairs ONE link, the realm needs THREE seasoned links, and nothing in
the lines says which link is the weak one or that the other two are
sliding. On 100203 the two gifts land (+8 each), the third link
(Stonebridge) is never named in a beat, and the realm still comes apart
five days later when Emberhold's link slides 44→39 (series roll, d94)
— the player did everything the game asked and the realm died anyway,
with no line explaining why. A held realm's villagers say nothing
different from a dissolving one's: the only difference is the absence of
the dissolution lines. The proving window (leg (a)) is entirely silent —
no line marks the 14 days, no line says the realm is being held on
inherited standing; the delay is visible only in the numbers.

## Instrument note — the analyzer's G1 "youngAnswers=6" is a false positive (leg (b))

The analyzer reports leg (b) G1 `GO=false` with `youngAnswers=6`: six
`answerRenegotiation` events joined to link-days with `prSg=0`. That join
is blind to same-day answers. The policy answers at the START of daily,
before the snapshot roll records the link roll — a beat staged and
answered the same day never appears as `prSg=1` in the series, so the
join mislabels every genuine succgrace answer as young. The policy's own
stats settle it: `succgraceAnswers` == `succgraceBeatsSeen` on every seed
(2/2, 1/1, 2/2, 1/1 = 6), the policy's event log records each as
`succgrace-answer` with the `succgrace` flag seen true at answer time,
and zero `answerRenegotiation` events name a link on a day the policy
logged it young. The 6 are genuine succgrace answers, not young-link
answers. Related: the snapshot roll's trust never reflects the gift's +8
(100203 Emberhold reads 44 before, on, and after the d90 gift; the beat
text prints the funeral-hour figure, 36, i.e. snapshot − 8). The series
roll is not a reliable trust read on succession days; dissolutions are
read from `scaleRank` transitions, never from the roll, so no verdict
moves. Leg (b) is killed at pilot on dissolutions regardless — the G1
dispute changes nothing about the kill, but the NEXT run must fix the
join (count staged beats from the policy stats + verbEvents, not from
prSg alone) before judging any SUCCGRACE leg's G1.

## Metric review

- The pilot gate did its job: all three legs failed it cleanly on the
  pilot band, and no confirm spend followed. The gate's dissolution
  counting is robust to the events-vs-seeds reading — (a)/(c) fail both
  ways (3 of 4 seeds, 4 events), (b) fails both ways (4 of 4 seeds,
  4 events).
- G2's reclimb clause (100203 or 100212 re-climbs) was never reachable
  from the pilot: 100203 dissolved in every leg and never re-climbed;
  100212 sits outside the pilot band. A future run that wants the
  reclimb clause judged needs the confirm band, not a pilot re-read.
- G1 as implemented (prSg join) is WRONG for answered beats — see the
  instrument note. Proposed revision for the next run: stage/answer
  accounting from `capSummary.succpolity` (`succgraceBeatsSeen`,
  `succgraceAnswers`, `youngBeatsSeen`) cross-checked against
  verbEvents, with prSg as a secondary read for LAPSED beats only.
  Do not re-score this run under the revision (§14): the verdicts stand
  as the pilot gate judged them.
- The cost bar's pilot reading (starvation pooled vs the pilot-band
  baseline) is informational only; the binding bar is the full-band
  ≤8, which no leg approached (max 5 on the pilot band).
- No metric revision is proposed for G2/G3. G3 holds: zero `src/js`
  changes in the branch diff, proof test green on the rebased tip.

## Convergence state

Winnability chain — this arm is DONE, all three legs killed at pilot.
SUCCPOLITY buys days (up to +15d) and SUCCGRACE buys days (up to +6d
per gift), but neither holds a realm: the hold is a THREE-link problem
and both levers repair at most one link per funeral while the other two
keep eroding. Leg (c) adds nothing to (a) — the levers do not stack on
this band. The next hold attack needs a lever that tends ALL marginal
links at a succession (or stops the erosion itself), not a wider window
or a single gift. No landing from this arm: env-gated levers stay OFF
by default, and no default flip is proposed. A `steve-call` is NOT
raised — the numbers kill the legs under the pre-registered bars, and
the finding (three-link erosion) is documented above for the next arm
to build on.

## What is committed (branch sim-succpolity-b)

- `6cf406e07` prereg (rebased)
- `18a8fb983` instrument (rebased)
- `a9b7f537d` repro gate stage + coordinator decision (rebased)
- `834a49dd2` guard re-run on tip 3321c6546 + re-baselined 100201-scaleclimb cell
- `3eadd2cf0` pilot leg (a) — 8 seeds
- `ebef2ed55` pilot legs (b)+(c) — 16 seeds, final analyzer, pilot panels
- This file (to commit): adoption + pilot results above.

## Infrastructure notes

- Index clobber struck after the first two safe-commit.sh commits in
  this adoption (committed files showing staged-deleted, worktree files
  intact); repaired both times with the documented
  `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`
  pipe, verified `git status` empty + `git diff HEAD` empty. The third
  commit landed clean. The commits were always correct; only the index
  lied.
- The write flap was quiet during this adoption (all probes OK, no
  truncated writes, no stdout fallbacks needed). Heartbeat landed on
  each attempt.
- Panel builder needed a /tmp patched copy (8 pilot seeds vs its
  hardcoded 16; `__dirname`-relative requires re-pointed). The committed
  builder is untouched; the patched copy lives only in /tmp.
