# sim-detgate-order-a — PREREG (frozen)

**Arm:** sim-detgate-order-a · **Loop A run:** fleshout-20261123T0815Z
**Axis:** scale-onramp (converging, NOT converged) · **Blank:** make the
det-gate bound ORDER-INSENSITIVE and re-judge dawnchoke
**Type:** INSTRUMENT (one analyzer change + replay re-judge of the same
lever on the same band) — the lever stays killed either way
**Base master:** `80e7da0bcf29d0b5017384ead04cbad652114c5c` (worktree
`~/workspace/worktrees/sim-detgate-order-a`, branch
`sim-detgate-order-a`)
**Frozen:** 2026-11-23 ~08:40 UTC, before any judged run. No judged run
has run under this prereg.

## 1. The question

The dawnchoke re-judge (evidence/2026-11-22/sim-dawnchoke-rejudge-a.md)
reproduced the 2115Z numbers exactly and judged the lever NO-GO on two
independent frozen bars: bar 8 (total deaths +10.75/run over the +5 bar)
and bar 2 (the corrected det-gate), which failed on 2/8 seeds (107423
d99, 107429 d146). The bar-2 failure was root-caused as a recording-
order artifact: the lever's first observable effect on those seeds is
re-ordering a departure that happens on BOTH legs — same departure,
same members, different order — because widening the companion pool
changes `findCompanion`'s candidate ordering. The frozen attribution
rule (first divergence day must EQUAL the first extra depart call day)
cannot see it, so the gate fails on an order permutation rather than on
non-comparability. The legs ARE comparable (pre-bound streams
identical; only order permutations differ).

This arm fixes the instrument — an order-insensitive comparison of
party arrays — and re-judges dawnchoke under the corrected bound. The
lever stays reverted either way: it is killed; this arm judges the
instrument + the verdict, it does not resurrect the lever.

## 2. The mechanism (why the order permutation reaches scalar fields)

Read from the code before freezing, not assumed. The d99 (107423)
differences across streams are ALL consequences of one cause: the
party array order `[app, thabo]` vs `[thabo, app]` for yara_haddad's
departure vs the herald (same day, same three companions, same
target, same fight outcomes — the d99 fights have identical outcomes
on both legs; the `deaths` stream first differs on d101, the bound
day).

- `src/js/villager-brain.js`, `vbrainExecuteDepart` (~line 1307):
  the FIRST companion's plan (`cplan`) gets `stage='hunt'`, `party`,
  and `needWave` — but NOT `target`. The second and third
  companions' plans (`cplan2`, `cplan3`, ~lines 1311/1327) DO get
  `target = plan.target`. So which villager keeps a null target and
  which carries the leader's target is a deterministic function of
  party position: companion 1 keeps its pre-departure target,
  companions 2–3 get the leader's. On the control leg app is
  companion 1 (target null) and thabo companion 2 (target herald);
  on the armed leg thabo is companion 1 (null) and app companion 2
  (herald). The party's plan-target MULTISET is identical on both
  legs ({null, herald, herald} + leader herald); only the attachment
  to individual members permutes. This is an order artifact, not a
  state divergence — but it lives in scalar `target` fields, so
  sorting party arrays alone does NOT fix it. Any fix that does not
  handle the target multiset will still fail bar 2 on 107423.
- The remaining d99 differences are pure array/text order: `v4departs`
  `party`/`members` order + `companion`/`companion2`/`companion3`
  order; `departBeats` `launched` order; `v4fights` `planParty`/
  `allyVids`/`lead.plan.party` order; `planCensus` `attrs.plan.party`
  order; `beatLines` name order in "Yara sets out with Ofelia,
  Thabo and Vasyl" vs "Yara sets out with Thabo, Ofelia and Vasyl".
- Seed 107429 d146 is the pure form: only `v4departs` differs, and
  only in the `companion`/`companion2` order (party `[]` on both,
  result `hold` on both). All other streams first differ on d150,
  the first extra depart call day.

Canon: docs/CANON.md read. **No canon doc covers the det-gate, the
analyzer, or departure recording** — said here rather than inventing
canon. The rule below is code-derived (§2 above).

## 3. Band freshness (deliberate replay — NOT a fresh band)

- **Band: 107423–107430 (8 seeds).** This is a DELIBERATE REPLAY of
  the dawnchoke re-judge band (same seeds, corrected bound) — not a
  fresh assignment; do NOT consume a fresh band. Reuse is the point:
  identical seeds make the replay comparable to the re-judge numbers.
  (Band provenance: 2115Z prereg §3 verified it fresh before that
  run; re-judge prereg §3 records the deliberate reuse.)
- Corpora live in NEW directories so the re-judge corpora are
  untouched: `evidence/2026-11-23/perseed-detgate-order-a-ctl` and
  `evidence/2026-11-23/perseed-detgate-order-a-arm`. The driver
  filename shape is unchanged
  (`dawnchoke-a-s<seed>-dawnchoke-a-<mode>.json`, RUN=dawnchoke-a —
  the analyzer and panel builder hardcode it).

## 4. Instrument (frozen design)

- `scripts/dawnchoke-driver-a.js`, `scripts/build-dawnchoke-panels-a.js`:
  reused from master UNCHANGED.
- `scripts/test-dawnchoke-a.js`: brought into this tree from the held
  branch (`git show sim-dawnchoke-a:scripts/test-dawnchoke-a.js`) —
  lever-specific proof test, required before the armed leg; it MUST
  fail on old code (no depart call) and pass on new code. It stays on
  the held branch afterwards: it asserts a depart call on new code
  and none on old code, so it would fail on the reverted master — it
  is lever-specific, not landable without the lever.
- `scripts/analyze-dawnchoke-a.js`: CORRECTED in this arm (instrument
  change, lands with the evidence either way). The det-gate's
  divergence comparison becomes order-insensitive; NOTHING else in
  the analyzer changes (attempt/launch/choke/death counting still
  reads the raw rows, so the judged numbers must reproduce the
  re-judge exactly — §6). The canonicalization, applied ONLY to the
  det-gate's divergence comparison (`firstDivergenceDay` and the
  pre-bound check in `detGateForSeed`):
  - **(a) Deep-sort all arrays.** Every array in a compared row is
    sorted recursively. Arrays of primitives sort lexicographically
    (nulls last, deterministically). Arrays of objects sort by the
    canonical JSON of the normalized element. This covers `party`,
    `members` (by vid after sorting), `launched`, `planParty`,
    `allyVids`, `allies`, `skills`, and any other member list.
  - **(b) Companion triple as a set.** A row's `companion` /
    `companion2` / `companion3` fields are sorted in place
    (companion = smallest, companion2 = middle, companion3 =
    largest, nulls last). The triple is the same set in a different
    order on both legs (107429 d146); sorting canonicalizes it
    without dropping the fields.
  - **(c) Beat-text name order.** A `beatLines` `text` matching
    `sets out with <names> after` has its name list canonicalized:
    the clause is split on `", "` and `" and "`, the fragments are
    sorted, and the clause is rejoined. The split is deterministic,
    so a companion named by a generated physical description (which
    contains commas — the open finding, seed 107423 d7) still
    canonicalizes: the fragment multiset is identical on both legs.
    Text not matching the pattern is compared as-is.
  - **(d) Party-level plan-target multiset.** For a departure on
    day D (from the canonicalized `v4departs` rows: leader vid,
    target, member set = leader + party), the plan targets of the
    party's members are compared as a MULTISET, not per-vid: the
    per-member targets are collected from that day's plan snapshots
    (planCensus first, then v4departs `members[].plan`, then
    v4fights `lead`/`allies[].plan`, then planSeeds `after`), sorted
    (nulls first, then alphabetical), and assigned to the members
    sorted by vid. The assignment is then applied to every plan
    occurrence for those members that day (planCensus
    `attrs.plan.target`, planSeeds `before.target`/`after.target`,
    v4fights `lead.plan.target` / `allies[].plan.target`,
    v4departs `members[].plan.target`). Gated to plans whose stage
    is `'hunt'` (post-departure state — the departure sets stage
    hunt for every party member) and to members of a departure that
    day. This is the (d) that §2 requires: the companion-1 target
    asymmetry makes the target a function of party position, so the
    order-free fact is the multiset.
  - **Boundaries (frozen):** a target difference that CHANGES the
    party's target multiset still diverges (a real state difference,
    not an order artifact — e.g. one leg carrying 'eulogy' where the
    other carries null). A plan-target difference for a villager who
    is NOT a member of a departure that day still diverges (the
    redistribution does not apply). A difference in any other field
    still diverges. The canonicalization never touches the metric
    counting paths.
- Panel builder `scripts/build-dawnchoke-panels-a.js` with
  `--before/--after` pointing at the replay corpora and
  `--out evidence/2026-11-23/detgate-order-a-panel`; `node
  scripts/balance-panel.js compare` run and its compare `.md`
  attached to the evidence file. The panel is the instrument, the
  frozen bars below are the judge.

## 5. Definitions (frozen — unchanged from re-judge prereg §5)

- **Wave-4+ plan:** `needWave >= 4` OR a target that is a wave-4+
  species (same OR definition as leadgate-a §8 / needwave-a §5).
- **Staged plan:** stage `party`, `hunt`, `standing`, or `table`.
  A **staged-plan day** is a planCensus day-row for a living, at-Haven,
  not-on-expedition holder of a staged wave-4+ plan.
- **Departure ATTEMPT:** a `departCalls` row with source `brain`
  whose plan at call time is wave-4+. Result `launch`/`hold`/`normal`
  all count; `launch` alone is the departure.
- **Choke day / choke rate, STUCK plan, stuck plan departs,
  starvation death, median survival:** as 2115Z prereg §5 (stuck =
  ≥ 7 distinct staged census days on the CONTROL leg with ZERO
  departCalls rows for that vid across the whole control run).
- **Total village deaths:** per-seed `deaths` array length, summed
  across the 8 seeds; the guardrail compares the MEAN per run.
- **Deaths per extra launch (diagnostic):** (armed total deaths −
  control total deaths) / (armed launches − control launches);
  null when launches do not rise.
- **First-release day (old bound, kept only as the control-side
  check):** per seed, the earliest arm-leg `departCalls` row for a
  forager/homebody-profile holder with a staged wave-4+ plan and no
  `party_launch` commit today. The ctl leg must record zero such rows
  on all 8 seeds.
- **Order permutation (frozen):** two legs' rows for the same
  (stream, day) that are equal after the §4 canonicalization — same
  departure by (day, vid, target, member-set), same party plan-target
  multiset, same event multiset. A divergence is a difference that
  survives §4.
- **Fixture:** competent policy verbatim
  (`scripts/policies/competent.js`). Substrate:
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
  SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`;
  `LEND` unset; `PRESENCE` unset; `KILLBUNDLE` unset; `HPGATE`
  unset; `PINQUAD` unset; `HYPOFLOOR` unset. Horizon 150d,
  death-aware.

## 6. Frozen bars (judge: the corrected analyzer on the replay band)

| # | Bar | Threshold |
|---|---|---|
| 1 | **Instrument validity** — needwave proof test re-run green on this base; dawnchoke proof test 100% (fails on old code, passes on new); dawnchoke analyzer `--selftest` 100% (including the new order-insensitivity cases: party/member order, companion-triple order, launched order, beat-text name order, target-multiset swap → no divergence; multiset-changing target difference and non-party target difference → divergence); 0 instrument errors on all 16 seed files (8 ctl + 8 arm) | all must hold |
| 2 | **Det-gate (ORDER-INSENSITIVE)** — ctl leg records 0 first-release rows on all 8 seeds; every recorded event stream is identical between legs for rows with day < the shape-agnostic bound (§4 of the re-judge prereg) UNDER the §4 canonicalization; the first divergence is lever-attributable (first divergence day == first extra depart call day, or no divergence); anchor checks pass with the expected anchor/sha values actually supplied and compared | all must hold |
| 3 | **PRIMARY — wave-4+ departure attempts** — armed attempts >= control attempts + 4 on 8 seeds | must hold for GO |
| 4 | **PRIMARY (second half) — a stuck plan departs** — at least one control-STUCK (seed, vid) actually departs on the armed leg (§5) | must hold for GO |
| 5 | **SECONDARY — launches** — armed wave-4+ launches >= control (reported; a rise in attempts that never becomes a launch is a hollow win, named in the evidence, not re-scored) | reported, not judged |
| 6 | **GUARDRAIL — starvation** — total starvation deaths armed <= control total + 2, AND no single seed's armed starvation deaths exceed its control by more than 2 | must hold for GO |
| 7 | **GUARDRAIL — survival** — median survival armed >= 0.8 x control median | must hold for GO |
| 8 | **GUARDRAIL — total deaths** — armed mean total village deaths per run <= control mean + 5 | must hold for GO |
| 9 | **NO-GO rule** — any of bars 2, 3, 4, 6, 7, 8 missed → NO-GO (never re-scored against a friendlier metric mid-run, §14) | frozen |

**Zero-attempt rule (frozen, no re-scoring):** if BOTH legs see
fewer than 5 wave-4+ departure attempts, there is nothing to
attribute and the verdict is **INCONCLUSIVE** (not GO, not
NO-GO) — the evidence says so and names the next step (a wider
band, or a substrate check on why attempts are absent). A miss
is NO-GO, never re-scored against a friendlier metric mid-run
(§14).

## 7. GO shape for THIS arm (frozen)

This arm succeeds iff ALL of the following hold:

- **(G1) Bound detector passes 8/8 seeds on the replay band.**
  After the §4 canonicalization, the detector reports 0 false
  divergences from order permutations: on every seed,
  `firstDivergenceDay == firstExtraDepartDay` (or no divergence
  at all — the byte-identical seeds 107425, 107427). Bar 2 PASSES.
- **(G2) The re-judge numbers reproduce.** Attempts 12 → 57,
  launches 4 → 36, choke 0.863 → 0.792, starvation 5 → 6, median
  survival 141 → 131, total deaths 91.875 → 102.625 mean (the
  re-judge values). Exact reproduction is expected (identical seeds,
  substrate, and lever; the base moved since the re-judge, and the
  re-judge reproduced 2115Z exactly across a base move, so exact
  equality is the bar). Any deviation is investigated before
  verdict; a deviation does not change the bars — the bars are
  judged on the replay's own numbers.
- **(G3) The verdict stands: dawnchoke NO-GO, death cost judged.**
  Bar 8 fails (armed mean deaths exceeds control mean + 5; prior
  judged cost +10.75/run, 2.69 per extra launch), so the verdict is
  NO-GO and the lever stays killed. The death-cost numbers are
  reported from the replay.

**Note on the brief's parenthetical.** The assignment brief states
the GO shape as "bound detector passes 8/8 … AND the re-judge
verdict reproduces (bars 2+8 fail → dawnchoke NO-GO stands, death
cost judged)". Read literally, those two clauses contradict: if the
fix works, bar 2 PASSES by design (that is the point of this arm),
and NO-GO stands via bar 8 alone. The parenthetical "(bars 2+8
fail)" describes the PRIOR re-judge's verdict, not a frozen
expectation for this run — freezing it would require the fix to
both work and fail. Frozen here instead: bar 2 is EXPECTED TO PASS
under the corrected bound (G1); the verdict NO-GO stands via bar 8
(G3) regardless of bar 2's outcome. If bar 2 still fails after the
fix, the evidence records exactly which canonicalization gap
remains, the verdict still stands (bars 2+8), but G1 fails — the
fix was insufficient, and that is itself the finding. The
coordinator can overrule this reading.

GO = all bars pass. GO here would mean the corrected instrument
passes AND the lever would pass its bars — but bar 8 is expected to
fail, so the expected verdict is NO-GO with G1+G2+G3 all holding:
the instrument is proven, the verdict stands on the death cost
alone. NO-GO = any bar missed; the evidence says which, and the
game-code change stays reverted zero-trace per kill protocol
(instrument + evidence kept).

## 8. Run plan (frozen)

- **Pre-flight (NOT judged):** `node
  scripts/test-needwave-a.js` → green on this base;
  `node scripts/analyze-dawnchoke-a.js --selftest` → 100% (with
  the new §4 cases) — all before any judged run. The fixed analyzer
  is also run against the OLD re-judge corpora as a sanity check
  (bar 2 must pass there with the numbers identical); that check is
  diagnostic, not the judged run — the judged run is the replay.
- **Lever (unchanged from 2115Z/re-judge):** cherry-pick ONLY the
  src/js hunks from held commit `4ac23b12f` (branch
  `sim-dawnchoke-a`) — NOT the whole commit (it carries the old
  prereg/analyzer/driver/proof test). Verified with `git diff` that
  only the lever hunks are applied. The lever retires
  `PROFILEGATE4` in `findCompanion` in both `villager-brain.js`
  and `win-plan.js` (forager-profile companions may answer staged
  wave-4+ plans; homebodies stay out).
- **Leg order (frozen):** ctl leg runs BEFORE the game-code
  commit (old code on disk); the game-code change is committed
  next (proof test green first: fails on old code, passes on new);
  the arm leg runs AFTER it; the lever is then REVERTED (branch
  reset to the instrument commit — the lever commit is dropped from
  this branch, the lever stays on held branch `sim-dawnchoke-a`).
  The analyzer is run with the expected anchors/shas for both legs
  (ctl anchor = HEAD at ctl-run time, arm anchor = HEAD at arm-run
  time, i.e. the lever commit; brain/winplan shas read from the
  per-seed JSONs themselves).
- **Driver invocation (frozen, per leg, 4 seeds each half):**
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 MODE=<ctl|arm> OUTDIR=evidence/2026-11-23/perseed-detgate-order-a-<mode> SEEDS=<107423,107424,107425,107426|107427,107428,107429,107430> RUN=dawnchoke-a node scripts/dawnchoke-driver-a.js`
- **Per-seed tables** in the evidence file from the analyzer
  output (per-seed JSONs in
  `evidence/2026-11-23/perseed-detgate-order-a-ctl` and
  `evidence/2026-11-23/perseed-detgate-order-a-arm`).
- **Wall numbers** recorded: wins, national, table (not
  instrumented by this driver — recorded as not instrumented,
  never faked), wave 4–5 unlocks, median survival.
- **Sense-test:** read the departure lines for a converted
  launch (verbatim `beatLines` where captured): the morning must
  say something (Steve's no-silent-actions law). NOTE whether the
  departure-beat physical-description finding recurs (a companion
  named by a generated physical description instead of a name,
  seed 107423 d7 in the re-judge) — it is a separate open finding;
  note it, do not chase it.
- **Expected re-judge comparison:** the judged numbers should
  reproduce the re-judge arm (G2) — the base moved since the
  re-judge, so any deviation is investigated before verdict.

## 9. Metric review (to be filled in the evidence file)

- (filled after the run; no bar re-scored)

## Addendum (2026-11-23 ~08:50 UTC, before the judged replay — GO shape unchanged)

Diagnostic check of the fixed analyzer against the OLD re-judge
corpora (prereg §8) found the §4(d) design as written is
insufficient in one respect: it scopes the target multiset to "a
departure on day D", but a party persists across the expedition.
Seed 107423: the same party (yara + app + thabo + vasyl) that
departs d99 fights again d100 with the same swapped targets (app
null / thabo herald on ctl, reversed on arm), and there is no
departure on d100 to scope the multiset to. The first divergence
moved d99 → d100 (still ≠ first extra depart d101), so bar 2 still
failed on the old corpora under §4(d) as written. (The d99 fix
itself was verified: 107429 passed, and 107423's d99 divergence
was gone.)

Generalization (implemented in the analyzer, selftest case H
added): party groups are built per day from every source that
records party membership — v4departs (leader + party), planCensus
(a member's plan.party, non-empty), v4fights (lead + planParty +
allies) — with overlapping sets merged (a villager belongs to at
most one party a day). The target multiset is redistributed within
each per-day group; the gate is "party plan" (a party list, or the
post-departure 'hunt' stage where no list is recorded, e.g.
planSeeds snapshots). The census is taken at end of day (driver
policy.daily finally), so a census plan is the current party plan.
The frozen boundaries stand: a multiset-changing target difference
still diverges; a non-party target difference still diverges.

After this generalization, the fixed analyzer on the OLD re-judge
corpora gives: bar 2 PASSES 8/8 (firstDiv == firstExtra on every
seed), numbers identical to the re-judge (attempts 12 → 57,
launches 4 → 36, deaths 91.875 → 102.625, choke 0.863 → 0.792,
starvation 5 → 6, median 141 → 131), verdict NO-GO via bar 8
only. The selftest is 44/44. This diagnostic result is NOT the
judged run — the judged run is the replay below. No bar, threshold,
band, or substrate changes; only the §4(d) mechanism description
is extended to cover parties persisting past their departure day.
