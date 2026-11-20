# sim-laterage-rerun-b — FROZEN prereg (Loop B 0030Z run, arm sim-laterage-rerun-b)

**Frozen:** 2026-11-20 01:09 UTC, BEFORE any judged sim. Base master
`1cb6ce2e1` (batch ship version bump on journey-establishment r244
`8bd330f22`; the bump touches only index.html / build.js / sw.js /
version.json — no game logic). Branch `sim-laterage-rerun-b`, rebased
onto local master `1cb6ce2e1` at run start (task instruction: rebase if
master moves before the judged sims; it moved from the registration
base `8bd330f22` to `1cb6ce2e1`).
**Diagnostic:** instrument-only — ZERO `src/js` game-code changes.
Reuses the laterage-b instrument on master
(`scripts/laterage-driver-b.js`, `scripts/analyze-laterage-b.js`,
`scripts/test-laterage-b.js` — proof test 11/11 green on this tip
after the rebase, analyzer selftest 16/16 inside it). No game-code
fix is built by this arm; if the diagnostic names a lever, that is
the next arm's work.

**Base-difference note (task):** the registration base was
`8bd330f22` (journey-establishment r244, which carries a
monsterCounterLabel game-code fix — counter-label comma-clause fix,
38/72 defs). The re-run base `1cb6ce2e1` is that commit plus a
version bump only. The laterage-b base was `1927a245e`
(winnability-round-1230 adoption closeout) — the re-run therefore
runs on a newer master than laterage-b, with the r244 counter-label
fix in the tree. The Rage mechanism itself is unchanged (driver
presence assertions pass on this tip).

## The question

Same question as laterage-b, on a holder-rich band: how often does
Rage fire late, and what does the wait cost — (a) WHEN Rage fires
(the fire-round distribution, R1 vs late, R2+), and (b) the delay
AFTER firing — rounds from Rage firing to the first doubled strike
landing, what fills those rounds, and the damage foregone.

Laterage-b answered it as NO-GO METRIC-BROKEN on a holder-dry band
(1 observable Rage fight in 127 wave-4+ encounters, band
106111–106118). The rageholder survey then designated this band
for exactly this re-run (see below). The taxonomy instrument is
unchanged and already validated; the re-run tests whether a
holder-rich population carries the distribution.

## Seed band + freshness (local_seed_band_freshness)

**Seeds: 106151, 106152, 106153, 106154, 106155, 106156, 106157,
106158 (8, pilot gate).** Deliberate re-use, not a fresh band.
Freshness check, run before freezing: exact-seed greps
`106151`–`106158` over all `evidence/*/sim-*-prereg.md` — hits ONLY
in `evidence/2026-11-19/sim-rageholder-survey-b-prereg.md` (the
survey that screened the band, naming 106151/106155/106158
explicitly as screened seeds); over all `evidence/**/*.md` — hits
ONLY in the survey prereg, `evidence/2026-11-19/sim-rageholder-survey-b.md`,
and `evidence/2026-11-19/sim-winnability-round-2130.md` (the round
record designating the band); over the goal
`hidden_files/sim-findings.md` — one hit, finding #2616's ANSWERED
annotation naming the designated band `106151–106158`; no other
prereg, evidence file, or findings entry names any of the eight
seeds as a judged band. A `perseed-rageholder-survey-b-106151-106158/`
corpus directory exists (the survey's own corpus — a different
OUTDIR; no file collision with this arm's
`perseed-laterage-rerun-b*` dirs).

**Release authorizing re-use (explicit designation):** the
rageholder survey (`sim-rageholder-survey-b`, GO, run
fleshout-loop-b-20261119T2130Z) designated band 106151–106158 as
the band for this exact re-run — "Designated band for the laterage
re-run: seeds 106151–106158. 33 holder-fights, 19 contact, 12 Rage
fires per 8 seeds" (`sim-rageholder-survey-b.md`, Findings notes;
repeated in `sim-winnability-round-2130.md` next-blank (1):
"Laterage re-run on designated band 106151–106158 (price the pool
floor from the 19 contact holder-fights, not 33)"). The survey
prereg + round record ARE the release named by the
seed-band-freshness skill ("Reuse a band only after its reservation
is explicitly released in a prereg, and record the release beside
the original naming") — the release is recorded here, beside the
naming. No other band is a candidate; do not re-pick.

## Survey (BEFORE freezing — pool size only, dmgshape lesson)

A survey leg ran on this band under the current tip/substrate
before the prereg froze (`perseed-laterage-rerun-b-survey/`,
driver log `laterage-rerun-b-survey.log`, exit 0, 0 instrument
errors). ONLY the pool size was counted from it — no fire-round
or delay numbers were computed before freezing. Survey result:
**136 wave-4+ encounters, 33 holder-fights, 19 contact
holder-fights, 12 Rage fires, 0 instrument errors** — an EXACT
reproduction of the designation survey's band totals (136 / 33 /
19 / 12 on base `5e38f3f7b`, policy sha `150229eda010`; this leg
runs on `1cb6ce2e1` with the same policy sha `150229eda010`).
Per-seed: 106151: 22 enc / 15 holders / 6 contact / 5 fires;
106158: 33 / 16 / 12 / 7; 106154: 15 / 1 / 0 / 0; 106156: 17 / 1 /
1 / 0 (a contact holder who never fires — the Farid shape);
106152: 22 / 0; 106153: 4 / 0; 106155: 0 / 0; 106157: 23 / 0.
The two engine seeds' encounter counts (22, 33) match the survey
table exactly, and the band totals match exactly — the
designation SURVIVES the base move (finding #2616 EXTENDS, base
form: NOT triggered here). The holder rate did NOT collapse.
The survey corpus is retained until the judged leg reproduces its
pool count, then deleted; the judged corpus is the record.
The survey does not change the frozen bars below: the pool floor
is priced against the survey's CONTACT pool (see below), and a
floor failure is NO-GO METRIC-BROKEN, never a re-score or a band
re-pick. If the survey shows the holder rate collapsed (cf.
finding #2616 EXTENDS: designation does not survive a policy
move), STOP and report to the coordinator — do not silently
re-pick a band; the verdict is whatever the frozen bars say.

## Judged population (frozen)

Wave-4+ field fights (`v4encounters`, SEEDLAND semantics) whose
FULL log (uncapped) contains a Rage line ("eyes go red ...
(Rage)"). The fire round is the round of the first Rage line.
Late fire = fire round ≥ 2 (the dmgshape ≥ 4 cut is reported
beside for comparability). Out of scope, stated plainly: Rage
fires in wave < 4 fights are NOT measured here — the corpus
records wave ≥ 4 only — and no claim is made about them.

## Primary metric (BINDING, §14)

**Late-fire share + post-fire delay** — same definitions as
laterage-b (see its prereg; the analyzer is unchanged):

- `lateShare` = Rage fights with fire round ≥ 2 / all classified
  Rage fights.
- `meanDelay` = mean rounds from firing to the first doubled
  strike landing, over Rage fights where a doubled strike lands
  (`firstDoubledRound − fireRound`). Fights where no doubled
  strike ever lands report `delay = null` with `delayToEnd`
  beside the mean, never folded into it.
- Delay-cause rollup: every delay round classified (trick by type,
  field-chain verb, godpath turn verb, silent, free_verb_only,
  strike_undoubled). Coarse grouping folds trick types into
  `trick`; the dominant cause is the top coarse category with its
  count over all delay rounds.
- **GO bar: taxonomy complete (0 unclassified Rage fights, 0
  anomalies) AND pool floor ≥ 8 observable (classified) Rage
  fights AND a named dominant delay cause with counts.**
  Justification: 8 is the smallest pool that can carry a
  distribution + a dominant-cause call; the taxonomy bar is the
  instrument proving the numbers, not a sample of them.
- **Pool floor priced from the CONTACT rate — 19 contact
  holder-fights on the designated band per the survey — NOT the
  headline 33.** The designation survey measured 33 holder-fights
  of which 19 reached contact (rounds > 0) and 12 fired; the
  floor of 8 observable Rage fights is priced against the 19
  contact fights (the pool the taxonomy actually fights from),
  with the 12-fire sub-count as the expected fires. A floor
  failure is NO-GO kind METRIC-BROKEN (same kind as laterage-b /
  dmgshape-b). A miss is NO-GO, never re-scored against a
  friendlier metric (no smaller floor, no re-cut of "late", no
  pooling with the survey corpus — different base/policy).
- **Taxonomy-completeness bar:** 0 unclassified Rage fights, 0
  anomalies across the classified pool.
- **Dominant-delay-cause bar:** a named dominant cause with
  counts over all delay rounds of all classified fights.
- **Fire-round distribution reporting:** full distribution (R1 vs
  late ≥ 2) plus the dmgshape cut (≥ 4) beside it.
- **Foregone-damage fallback chain (frozen):** per fight,
  (3 − doubledLanded) × unit, where unit is the fight's own mean
  doubled-strike damage when any landed, else 2 × the fight's mean
  pre-fire normal strike, else the corpus mean doubled-strike
  damage, else NO BASIS — a fight with no basis is a missing
  value, not a zero (laterage-b metric review §3; the analyzer
  returns 0 for that fight with an empty `foregoneRows` entry —
  report it as no-basis, never as "nothing was lost").

GO requires pool floor + taxonomy complete + dominant cause
named. The analyzer's verdict is DIAG-GO iff all three hold.

## Secondary (REPORTED, not binding)

- Damage/round in late-fire (≥ 2) vs R1-fire fights (mean of
  per-fight `mDealt/rounds`).
- 0-damage Rage-fight share (`mDealt == 0`; dmgshape measured
  3/8, laterage-b 1/1).
- Doubled-strikes-landed distribution (0/1/2/3 per fight).
- Fire-round distribution (full) + the dmgshape ≥ 4 late cut.
- Foregone damage ESTIMATE (labeled estimate everywhere it
  appears), with per-fight basis.
- Damage per holder-fight (the survey's damage-wall note: best
  holder fights dealt 155–588 and still ended in flight; carry a
  damage-per-holder-fight number, not just a fire count).
- Never-fire contact holders kept visible (survey: Farid vs the
  Rerun, d142, 4 rounds, 197 dealt, no fire) — report the count,
  do not drop them.
- Wall numbers every run (national / table / wins, wave 4–5
  unlocks, median survival, community loss, standing-199 count).

## Cost bars (REPORTED — single diagnostic leg, no lever)

No lever is judged, so there are no cost bars to breach. The wall
numbers are reported per the scale-wall directive and compared
against the laterage-b leg and the designation survey as the
reproducibility references (same substrate family; different base
— r244 counter-label fix in the tree — and the survey's policy sha
`150229eda010` vs this leg's, recorded in the corpus).

## Design

- Horizon: 150d, death-aware (dead villages stop, +10d tail max).
  150d because it matches laterage-b and the designation survey —
  the holder pool must be measured over the same window, not a
  shorter one.
- Policies: competent verbatim only.
- Leg: ONE diagnostic leg (MODE=laterage), substrate flags
  SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1
  FIGHTALLY2=1 — all five are landed code on this master
  (grep-verified by the driver, which asserts flags AND code
  presence and stops loudly on mismatch). The RAGEFREE/FIELDCAPDMG
  carrier is NOT used, the FREESTRIKE ordering is NOT ported, and
  the ALLYSLOT3 slot is NOT ported — this arm measures real Rage
  on master substrate, exactly as laterage-b did. NO game-code
  change of any kind.
- Driver: `scripts/laterage-driver-b.js` (unchanged from master).
  Analyzer: `scripts/analyze-laterage-b.js` (unchanged). Proof
  test `scripts/test-laterage-b.js` 11/11 on this tip after the
  rebase.
- Panel: single diagnostic leg, no before/after — no panel
  compare is promised (a cross-band compare is structurally
  invalid; laterage-b §4). Wall numbers are the reproducibility
  reference.
- Telemetry: `node scripts/telemetry-check.js --baseline
  .../telemetry-baselines/scale-wall.json --current
  'evidence/2026-11-19/perseed-laterage-rerun-b/*.json' --metrics
  national,table,wins,exiled`; if it refuses recorder corpora,
  record the refusal verbatim and report wall numbers directly
  (as laterage-b / dmgshape-b did).

## Fixture (encounter-gear rule, Steve 2026-11-13)

No staged fixture: the corpus is live wave-4+ fights from the
competent policy on the designated band. The analyzer's synthetic
selftest stages its own rows, not live fights.

## Metric review (pre-registered reasoning, not a verdict)

- The pool floor is priced from the contact rate (19), not the
  headline (33): 14 of the designated band's 33 holder-fights
  evade before contact, and only 12 of the 19 contact fights
  fired on the designation survey. If the judged leg reproduces
  the survey, the observable pool is ~12 — above the floor of 8,
  but not by a margin that survives a bad seed. The floor is
  honest about that: a judged pool of 8–12 carries a distribution
  and a dominant-cause call, barely.
- The taxonomy is validated on n=1 in the wild (laterage-b) plus
  the 16-check synthetic selftest. A pool-rich corpus re-proves
  it at scale; if a new delay cause appears that the frozen
  taxonomy cannot classify, that is an unclassified bar failure
  (instrument NO-GO), not a reason to extend the taxonomy
  mid-run.
- The foregone estimate's no-basis case is now a missing value,
  not a zero (laterage-b §2/§6.3). Report the per-fight basis
  beside every foregone number.
- "Silent" delay rounds conflate stunned / fled / died / ended.
  The outcome + rounds beside each silent round disambiguate the
  common cases; if silent dominates the rollup, the next arm
  splits it with a stun recorder rather than re-scoring this one.
- The fire-round ≥ 2 definition of "late" is the brief's, and it
  is deliberately strict: on master substrate the Rage round is
  usually a fresh round 1, so ≥ 2 is where the phenomenon begins.
  The ≥ 4 cut stays beside it so the dmgshape sighting (R4)
  remains comparable.
- Base drift: this leg runs on `1cb6ce2e1` (r244 + version bump)
  while the designation survey ran on `5e38f3f7b` (1815Z adoption
  closeout). The survey-first leg on this tip is what tests
  whether the designation survives the base move; if the holder
  rate collapsed, the verdict follows the frozen bars and the
  collapse is reported to the coordinator (finding #2616 EXTENDS,
  policy/base-move form).
