# sim-chainclose-a — CHAIN-CLOSE TARGET, WILD WAVE-4 ONLY

Run: flesh-out loop, run fleshout-20261030T0533Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-chainclose-a.
Ranked next #1 by run fleshout-20261030T0420Z (sim-chainfinish-a).
DIAG arm, MEASUREMENT ONLY — zero src/js game changes, no default
flip, no gate change, no deed-bar move. This arm PRICES the target;
building to it is a later arm's job. No damage buff or gate move is
proposed here as a verdict.
Preregistration (binding, committed BEFORE any judged analysis):
evidence/2026-10-30/sim-chainclose-a-prereg.md (commit 20d867c4c).
Instruments: commits 3e1d50dc0 + be61f8f6d (sweep + analyzer + fixtures;
be61f8f6d is a pre-evidence instrument fix, disclosed below).
VERDICT: DIAG-GO — all five legs pass (see "Header vs result"). The
measurement is complete; the game verdict is that chain-close is priced,
not achieved.

## Plain words first

A wild wave-4 chain closes only if each future meeting deals enough
damage to eat the beast's remaining HP inside the village's remaining
lifetime. On this band's own corpus (16 seeds), that price is now
measured, and the headline is a split, not a single number. Only 2 of
10 chains ever meet twice, so only 2 chains even HAVE a re-meeting
pace. Of those two, one closes at 41 damage per meeting — the number
chainfinish illustrated — and the other needs 120, a number no pace
fix can reach because even meeting every single remaining day still
needs 64 per meeting. The other 8 chains are single meetings: no pace
exists to price, and their seed-pace targets run from 20 to 395. The
binding constraint is therefore not one thing: for the one recurring
chain that can close, damage scale is the question (observed best
meeting: 24, target: 41); for the other recurring chain, lifetime and
HP bind outright (15 days of runway left, 959 HP to eat); and for
most chains, recurrence itself binds — the beast is met once and
never seen again before the village's time runs out. No chain on this
band is finished (0 kills in 16 wild meetings), and no threshold
between 41 and 60 closes a single additional chain: the distribution
has a gap there, so "a bit more damage" is not a strategy — the next
arm must move recurrence, or move damage past 60, or accept that most
chains never recur at all.

## Header (pre-registered) vs result

- COMPLETENESS: 16/16 valid seeds AND all six recorders errs 0 with
  overflow empty AND joins 100% AND breakline==w4dpr at every row AND
  shoutrec prefix-consistency at every row (the corrected leg).
  RESULT: 16/16 rows valid; all six recorders errs 0, overflow empty;
  joins 2257/2257, 0 errors; breakline-vs-w4dpr mDealt agreement
  2257/2257 (0 wild wave-4 mismatches); shoutrec prefix-consistency
  751/751 checked, 0 violations (roundTotals non-decreasing, each <=
  final total) → PASS.
- CLOSE-TARGET COMPUTABILITY (primary metric): a close target (finite
  value or explicit Infinity with its M < 1 reason) for EVERY chain
  present, at seed pace for all chains and at chain pace for every
  n >= 2 chain; lifetime distribution complete for every contact seed.
  RESULT: 10/10 chains have a seed-pace target; 2/2 n >= 2 chains have
  a chain-pace target; 8/8 n = 1 chains have an explicitly UNDEFINED
  chain pace (not zero, not missing) plus a finite seed-pace target;
  0 Infinity targets (every chain has at least one meeting fitting its
  runway at seed pace); lifetime distribution complete for 5/5 contact
  seeds; no NaN, no dropped chain → PASS.
- DETERMINISM GATE: one seed re-run into a scratch EVID dir; row JSON
  byte-identical.
  RESULT: seed 75102 re-ran byte-identical in full; scratch dir
  removed after the diff → PASS.
- SENSE BAR: all fought wild wave-4 transcripts read end to end when
  wild count <= 40 (stratified rule for > 40, unused).
  RESULT: all 16 fought wild wave-4 logs read end to end (16/16, all
  outcome classes present: vFlee 11, vDie 5; at least one log per
  chain) → PASS.
- FIXTURE BAR: close-target arithmetic (ceil, floor on meetings,
  Infinity at M < 1, undefined chain pace at n = 1, censored carry),
  chain splitting on an HP break, pace variants, threshold fractions,
  lifetime-after-first-contact.
  RESULT: FIXTURES-PASS (46 checks, 0 fails, including the two
  pre-evidence fix fixtures: cross-seed chain separation and
  censored=survived-only) → PASS.
- INSUFFICIENT-DATA: not triggered for wild (n=16, 10 chains). Raid
  (n=4) and other (n=1) are INSUFFICIENT-DATA, counts only, no lever
  judgment.
- VERDICT: DIAG-GO. Nothing failed. The pre-evidence instrument fix
  (below) corrected the analyzer to the prereg before any judged
  number was written into evidence; it changed no target value (the
  two chain-pace targets are identical before and after the fix).

## Instrument fix before evidence (disclosed, not hidden)

The first analyzer run grouped chains by mid ALONE, ignoring seed —
so audit chains on seeds 75113/75114/75116 carried bogus "break"
reasons pointing at seed 75102's audit. The prereg defines a chain as
same-mid on the SAME seed, so the code was wrong, not the prereg.
Fixed in be61f8f6d (group by seed+mid; 46 fixtures green, including a
cross-seed separation fixture), analyzer re-run, targets unchanged
(chain-pace 41 and 120 before and after; single-meeting chains were
already numerically correct by luck, since each held one meeting).
Two more pre-evidence corrections in the same commit: censored now
means horizon-survived ONLY (the first code flagged won runs ending
'over-other' as censored — a won run's runway is run-end-exact, not a
lower bound), and n = 1 chains now report binding PACE-UNKNOWN-N1
instead of a misleading PACE-BOUND (their pace is undefined, not
slow). Chainfinish's analyzer carries the same by-mid grouping bug;
it was numerically harmless there (one contact seed) but any future
multi-seed arm reusing it must take this fix. Reported to the
coordinator as a finding; this worker does not edit another arm's
files.

## Q1 — lifetimes, meetings-per-lifetime, close targets

Formula (prereg, binding): runway T_rem = run days - chain's last
meeting day; chain pace p_chain = n / inclusive span (n >= 2 only);
meetings available M_chain = floor(p_chain * T_rem); close target
C_chain = ceil(remaining HP / M_chain), or Infinity if M_chain < 1.
Seed pace p_seed = seed's wild meetings / seed's wild window (inclusive);
M_seed, C_seed likewise. Daily bound C_daily = ceil(remaining / T_rem).

Lifetime after first wild wave-4 contact, per contact seed (5/16 seeds
ever make contact):

| Seed | Run days | End | First wild | Last wild | L_first | nWild | Censored |
|---:|---:|---|---:|---:|---:|---:|---|
| 75102 | 86 | village-lost | d55 | d79 | 31 | 11 | no |
| 75110 | 118 | over-other (won) | d57 | d57 | 61 | 1 | no |
| 75113 | 150 | village-lost | d145 | d145 | 5 | 1 | no |
| 75114 | 160 | village-lost | d115 | d115 | 45 | 1 | no |
| 75116 | 180 | survived (horizon) | d139 | d140 | 41* | 2 | yes |
| 11 seeds | — | — | no contact | — | — | 0 | — |

\* 75116 is horizon-censored: its true lifetime is >= 180, so L_first
>= 41 and its targets are UPPER bounds (the true targets can only be
lower). All other contact seeds ran to an ending, so their targets
are run-end-exact. Median L_first over contact seeds: 41 days (sorted
[5, 31, 41, 45, 61]); the contact window itself is late and short —
first contact lands on days 55-145, and one seed (75113) meets its
only wave-4 beast 5 days before dying.

Per-chain close targets (wild universe; R = remaining HP):

| Chain | n | Span | p_chain | T_rem | M_chain | C_chain | p_seed | M_seed | C_seed | C_daily | Binding |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| s75102 eulogy | 4 | 5 | 0.80 | 27 | 21 | 41 | 0.44 | 11 | 78 | 32 | DAMAGE-SCALE-QUESTION |
| s75102 algorithm | 4 | 7 | 0.57 | 15 | 8 | 120 | 0.44 | 6 | 160 | 64 | LIFETIME-HP-BOUND |
| s75102 audit | 1 | 1 | — | 12 | — | — | 0.44 | 5 | 202 | 84 | PACE-UNKNOWN-N1 |
| s75102 herald | 1 | 1 | — | 12 | — | — | 0.44 | 5 | 136 | 57 | PACE-UNKNOWN-N1 |
| s75102 reunion | 1 | 1 | — | 7 | — | — | 0.44 | 3 | 395 | 170 | PACE-UNKNOWN-N1 |
| s75110 reunion | 1 | 1 | — | 61 | — | — | 1.00 | 61 | 20 | 20 | PACE-UNKNOWN-N1 |
| s75113 audit | 1 | 1 | — | 5 | — | — | 1.00 | 5 | 218 | 218 | PACE-UNKNOWN-N1 |
| s75114 audit | 1 | 1 | — | 45 | — | — | 1.00 | 45 | 24 | 24 | PACE-UNKNOWN-N1 |
| s75116 audit | 1 | 1 | — | 41 | — | — | 1.00 | 41 | 20 | 20 | PACE-UNKNOWN-N1 |
| s75116 suburb | 1 | 1 | — | 40 | — | — | 1.00 | 40 | 33 | 33 | PACE-UNKNOWN-N1 |

Meetings-per-lifetime per chain, stated plainly: the eulogy's runway
holds 21 more meetings at its own pace (11 at the seed's overall
wild pace); the algorithm's holds 8 (6 at seed pace). Every other
chain has no observed pace, so its "meetings per lifetime" is only
meaningful at seed pace: 3-61 meetings depending on how much runway
the seed has left (75113's audit: 5 meetings in 5 days, then death).

Worked check (the prereg's arithmetic, on this corpus): eulogy R=853,
p_chain=4/5=0.8/day, T_rem=86-59=27 → M_chain=floor(21.6)=21 →
C_chain=ceil(853/21)=ceil(40.62)=41. This reproduces chainfinish's
illustration exactly, because seed 75102's corpus row is byte-identical
to chainfinish's (see drift note) — the 41 is re-derived here, not
quoted.

## Q2 — the distribution, and what binds

Chain-pace targets (n = 2 chains only — the median of two numbers is
reported as what it is, a mean of the pair, not a robust center):

| Threshold (dmg/meeting) | Chains closable (chain pace) | Contact seeds with a closable chain | All 16 seeds |
|---:|---:|---:|---:|
| 20 | 0/2 (0%) | 0/5 (0%) | 0/16 |
| 41 | 1/2 (50%) | 1/5 (20%) | 1/16 |
| 60 | 1/2 (50%) | 1/5 (20%) | 1/16 |

Chain-pace target distribution: sorted [41, 120]; median 80.5 (mean of
the pair). At 20, nothing closes at chain pace. At 41, only the eulogy
closes. At 60, nothing new closes — the algorithm's 120 is more than
double the threshold, so the 41→60 band is empty at chain pace.

Seed-pace targets (all 10 chains; the pace a chain would need if the
seed's overall wild-meeting rate applied to it):

| Threshold | Chains closable (seed pace) |
|---:|---:|
| 20 | 2/10 (s75110 reunion 20, s75116 audit 20) |
| 41 | 4/10 (+ s75114 audit 24, s75116 suburb 33) |
| 60 | 4/10 (nothing new — next target up is 78) |

Seed-pace target distribution, sorted: [20, 20, 24, 33, 78, 136, 160,
202, 218, 395]. The gap between 33 and 78 is the story at seed pace:
moving the bar from 41 to 60 buys zero additional chains.

What binds, chain by chain:
- DAMAGE SCALE (1 chain): the eulogy. Target 41 at its own pace vs
  observed median 11.5 / best 24 per meeting. Closing it needs ~1.7x
  its best observed meeting, ~3.6x its median — a damage-scale gap,
  not a pace gap (its pace, 4 meetings per 5 days, is the fastest
  observed).
- LIFETIME/HP (1 chain): the algorithm. Target 120 at its own pace,
  and even the pace-free daily bound is 64 — above 60. No re-meeting
  frequency fixes it: 959 HP over 15 remaining days cannot close
  under 60/meeting even meeting daily. HP and runway bind, not pace.
- RECURRENCE (8 chains): every single-meeting chain. There is no
  chain pace to price because the beast is never re-met. Their
  seed-pace targets (20-395) are hypothetical: they assume the seed's
  overall wild rate applies to a beast seen once. The honest reading
  is that recurrence — a second meeting at all — is the binding
  constraint for 80% of chains, before damage or pace can even be
  discussed.
- RUNWAY (cross-cutting): 75113's audit meets on day 145 and the
  village dies day 150 — 5 days of runway. Late first contact kills
  closability regardless of damage: its seed-pace target is 218.

## Q3 — join effectiveness at wave-4 scale (UNJUDGED observation only)

Not a scored leg. Not a verdict. Recorded so the next run can decide
whether it deserves its own prereg.
- Wild wave-4 meetings: 16. Joined (calledHelp/joined ally): 5/16.
- Total damage dealt: 321. Leader: 297. Ally: 24 (7.5% of all dealt).
- Per-meeting medians: leader 15, ally 0 (most meetings unjoined).
- In joined fights only, ally share of dealt damage: median ~10.3%
  (ally dealt 6, 5, 4, 6, 3 against remaining HP of 853-1,088).
- The best joined meeting (s75114 audit, 58 dealt: leader 52 + ally
  6) still leaves the beast at 1,042/1,100 HP. At wave-4 scale, joins
  add single digits against four-digit HP; whether that deserves its
  own prereg is the next run's decision, not this one's finding.

## Q4 — sense-test (all 16 fought wild wave-4 logs read end to end)

SENSE-PASS. The chain story reads coherently, with two qualifications:
- Same beast returning, wounds persisting: the eulogy chain reads as
  one beast across d55-d59 (strikes land at 888→877, then 877→853, then
  two zero meetings at a flat 853 — no heal line, no HP reset, and the
  d56 log opens exactly at 877). The algorithm chain reads the same
  way (d65 ends 971, d70 opens at 971 and lands 12 → 959, d71 flat at
  959). Wound persistence is exact in the story, not just the numbers.
- Wild vs raid are separate stories: the wild algorithm opens at a
  fresh 1,000 on d65 even though a raid algorithm closed at 986 on d64
  on the same seed; the wild audit on d74 opens at 1,066 because a
  raid audit closed at 1,066 on d73. Chains are universe-relative, as
  chainfinish warned — a reader who pools shapes will misprice both.
- New-seed chains read as fresh beasts: s75110 reunion opens 1,200,
  s75113/s75114 audits open 1,100, s75116 suburb opens 1,300. One
  unexplained opening: s75116's audit opens at 825 with no prior raid
  audit on that seed — spawn-HP variance, or a wound from a channel
  outside this universe; reported, not explained (see findings).
- The "no arrows" line is NOT a zero predictor: it appears in 6 of 16
  logs, including three fights where the fighter strikes anyway (d56,
  d65, d74 audit — melee strikes alongside an unusable ranged weapon).
  It signals "ranged weapon unusable", not "fighter disarmed". The
  four zero meetings are the same four as chainfinish (2 narration,
  2 weapon) — this band adds no new zero cause.
- Every wild fight ends in flee (11) or death (5) within 1-3 rounds;
  0 kills, 0 drive-offs. The flee lines land legibly ("runs while
  running still works", "past holding"). No transcript reads as a
  beast disengaging purposelessly; fighters leave because they are
  losing, at 1-32 HP.

## Wall numbers (this band, own corpus, 16 seeds, 180d, report-only)

Same upper-middle median convention as chainfinish.

- Wins: 9/16, all lesser seats (full 0). National ever: 13/16.
  National final: 11/16. Table reached: 12/16. Table entered: 9/16.
- Wave reach (unlock flag): wave 1: 16/16, wave 2: 16/16, wave 3: 14/16,
  wave 4: 9/16, wave 5: 0/16. (Reach is the unlock flag — wild wave-4
  CONTACT is 5/16 seeds, so unlock still overstates contact.)
- Median survival: 118d (days sorted [31, 86, 90, 99, 102, 114, 115,
  115, 118, 128, 150, 160, 165, 180, 180, 180]; statistical median
  116.5d, noted for comparability).
- Deaths: 527 total. Starvation: 3.
- Death causes (527): villager:combat 219, villager:villager combat
  140, player:the wild 63, villager:expedition 42, villager:monster 18,
  rest small. This band does not starve; it is killed in combat.
- Drift diagnostic (not a GO leg): seed 75102's corpus row is
  BYTE-IDENTICAL to chainfinish's s75102 row (same substrate, same
  seed, same code path) — the base did not move for the one seed both
  bands share. Wall numbers are still cited ONLY as this run's own
  corpus (16 seeds vs chainfinish's 8), never as a before/after.

## Census counts only (no lever judgment)

- Raid wave-4: 4 (s75102 algorithm d64, audit d73; s75113 influencer
  d127, eulogy d136). INSUFFICIENT-DATA for raid-shape pricing beyond
  the wild/raid separation note above.
- Other wave-4: 1 (s75110 eater d51, hp null). INSUFFICIENT-DATA.
- Wild wave-4 per seed: 75102: 11; 75116: 2; 75110/75113/75114: 1 each;
  all other seeds: 0. Contact remains concentrated: one seed holds
  11/16 wild meetings.

## RANKED NEXT (with numbers — no lever built here)

1. RECURRENCE-FIRST MEASUREMENT. 8/10 chains never re-meet, so chain
   pace is undefined for 80% of chains. Price what produces a second
   meeting after first contact (encounter rate in the post-contact
   window, per seed: 75102 re-meets at 0.44 wild meetings/day overall
   but only 2 of its 5 beasts recur; the other contact seeds re-meet
   0 times). Until recurrence is measured, chain-close targets for
   single-meeting chains stay hypothetical seed-pace numbers.
2. EULOGY-SCALE PROBE (the one attainable chain-pace target). The
   eulogy closes at 41/meeting; its observed best is 24, median 11.5.
   A later arm measures what moves per-meeting damage toward 41
   (party output, gear, ability — that arm's job, not proposed here).
   Note the constraint it must respect: the algorithm's daily bound
   is 64, so no damage number under 60 closes both recurring chains.
3. JOIN EFFECTIVENESS PREREG CANDIDATE (carried, unjudged here).
   Allies deal 24/321 (7.5%) at wave-4 scale, ~10% in joined fights.
   If a party lever is ever claimed to close chains, it needs its own
   prereg with an ally-output bar — this observation alone judges
   nothing.
4. SPAWN-HP VARIANCE (small, carried). s75116's audit opens at 825
   with no prior raid audit on the seed. A future arm should check
   whether wild wave-4 spawn HP varies by instance (825 vs 1,100 for
   the same type) before any target assumes a fixed opening HP.
5. RAID-SHAPE WAVE-4 — INSUFFICIENT-DATA (n=4). Do not judge any
   raid-shape lever from 4 meetings.

## Findings-backlog items found (reported to the coordinator; NOT appended to sim-findings.md by this worker)

- F-1 (instrument, carried from this run's fix): chainfinish's
  analyzer groups chains by mid alone, mixing seeds when several
  seeds meet one type. Harmless on chainfinish's single-contact-seed
  band, wrong on any multi-seed band. Fixed here; the fix must be
  ported before any other arm reuses that analyzer.
- F-2 (instrument): the first code's censored flag (endReason !=
  'village-lost') mislabels won runs as censored. Corrected here to
  horizon-survived only; any arm quoting censored targets from the
  old flag overstates its upper bounds.
- F-3 (measurement gap): s75116 audit opens at 825 HP with no prior
  raid audit on that seed — wild spawn HP for one type is not fixed
  at 1,100. Needs a spawn-HP census before targets assume opening HP.
- F-4 (design question, steve-call candidate, carried): the eulogy's
  narration-suppressed meetings still show no successful interrupt
  dealing damage in-band (chainfinish F-3, unchanged here). Whether
  narration turns should ever deal damage remains a design ruling,
  not a measurement.
- F-5 (carried observation): wild wave-4 contact remains concentrated
  (5/16 seeds, one seed holding 11/16 meetings) while unlock is 9/16
  — the encounter-rate gap bounds every wave-4 claim to a handful of
  villages.

## Guards (reported, not judged — this arm changes nothing)

- Death causes (527 total) and wall numbers are reported above; no
  guard moves under a measurement-only arm.
- No guard can move under a measurement-only arm.

## Metric review (for the NEXT run — nothing re-scored here)

- SHOUTREC PREFIX-CONSISTENCY LEG (adopted from chainfinish's metric
  review): worked as written — 751/751 checked, 0 violations. Keep it;
  final-equality stays retired (roundTotals is a morale-entry snapshot
  series, not final totals).
- CENSORED DEFINITION (corrected pre-evidence, see instrument fix):
  as first implemented (endReason != 'village-lost') it was WRONG
  about won runs. The prereg text said "alive at the horizon"; the
  corrected code (endReason == 'survived') matches the text. Future
  preregs should state the endReason literal, not "alive", to avoid
  re-deriving this.
- BINDING CLASS FOR n = 1 (corrected pre-evidence): as first
  implemented, single-meeting chains inherited PACE-BOUND from an
  Infinity chain target — WRONG, since their pace is undefined, not
  slow. PACE-UNKNOWN-N1 is the honest label. Future chain arms should
  preregister the n = 1 binding label explicitly instead of letting
  the classifier default it.
- CHAIN GROUPING KEY (corrected pre-evidence): the prereg said
  "same mid on the same seed" but the first code grouped by mid alone.
  Future preregs should state the grouping key as (seed, mid) in one
  line, and fixtures should include a cross-seed case from the start.
- MEDIAN-OF-TWO (carried warning): with only 2 chain-pace targets,
  the "median" 80.5 is the mean of the pair. Future arms with few
  recurring chains should report the sorted list first and treat any
  median as decorative.
- MEDIAN-DAYS CONVENTION (carried): the analyzer reports the
  upper-middle row (118d); the statistical median is 116.5d. This
  evidence quotes 118d for comparability and notes 116.5d here.
- THRESHOLD SET (for the next run's consideration, not a change):
  20/41/60 left a gap (nothing between 41 and 60 at chain pace, and
  the seed-pace gap runs 33→78). A future arm pricing "a bit more
  damage" should preregister thresholds that bracket the observed
  gap (e.g. 80) rather than assuming the 41→60 band is dense.

## Convergence note

Scale-onramp stays converging, NOT converged. This arm moves no wall
number — by design, it is diagnosis — but it replaces chainfinish's
illustrative ~41/meeting with a measured distribution on its own
16-seed corpus: chain-pace targets [41, 120], seed-pace targets
[20, 20, 24, 33, 78, 136, 160, 202, 218, 395], contact 5/16 seeds,
recurrence undefined for 8/10 chains, 0 chains finished. The next arm
that claims movement on this axis must move one of those measured
quantities — a second meeting for a single-meeting chain, a
per-meeting rate near 41 for the eulogy, a daily bound under 60 for
the algorithm — not re-describe them.

## Infrastructure notes

- Sweep wall: ~4.5 min for 16 seeds under sibling load (~17s/seed
  including the full recorder stack; chainfinish's 8-seed sweep took
  13.5 min under heavier load — the difference is sibling load, not
  the harness).
- Safe-commit index clobber hit all three worker commits (prereg,
  instruments, instrument fix) — repaired via HEAD-blob cacheinfo each
  time with hash verification, never reset, never forced, commits
  verified correct. Same clobber class as the 2026-10-29 loop notes.
- Seed 75102's corpus row is byte-identical to chainfinish's, and the
  determinism re-run of 75102 is byte-identical — the base did not
  move under this run for the shared seed.
- Scratch dir (determinism re-run of s75102) removed after its diff;
  the worktree holds only committed work plus the corpus committed
  with this file.
- Analyzer exits 0 (COMPLETENESS-PASS); fixtures FIXTURES-PASS
  (46 checks, 0 fails); determinism DETERMINISM-PASS; sense read
  16/16 logs (SENSE-PASS by reading).
- Sibling loop B moved local master under this branch during the run
  (master eef5d6fa6 vs branch base 561bbbd86; the delta is one new
  policy file + evidence, zero src/js). Branch rebased onto current
  master at the end per assignment; proof re-run after rebase (see
  report). No live verification, no push, no bump: this arm reports
  "branch ready for coordinator merge, pending ship" per assignment.
  The batch ship job owns pushes.

## Files

- Corpus: evidence/2026-10-30/perseed-chainclose-a/s75101–s75116-fresh.json
  (16 rows) + summary.json (corpusOk true) + analysis.json (analyzer
  output: census, chains, close targets, wall).
- Analyzer: scripts/analyze-chainclose-a.js (wild universe, chains by
  (seed,mid), close targets at chain/seed/daily pace, wall, join
  effectiveness observation).
- Sweep: scripts/sweep-chainclose-a.js (chainfinish sweep pattern
  verbatim, seeds 75101-75116, corpus perseed-chainclose-a).
- Fixtures + determinism: scripts/test-chainclose-a.js (46 checks;
  --determinism <seed> re-runs one seed to scratch and diffs).
- Prereg: evidence/2026-10-30/sim-chainclose-a-prereg.md (20d867c4c).
- Instruments: scripts/sweep-chainclose-a.js +
  scripts/analyze-chainclose-a.js + scripts/test-chainclose-a.js
  (3e1d50dc0, fix be61f8f6d).
