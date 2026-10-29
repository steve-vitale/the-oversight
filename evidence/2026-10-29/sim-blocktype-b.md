# sim-blocktype-b — fresh-band refused-evening census: INSUFFICIENT-DATA (blind band too thin; instrument PROOF-GREEN)

Run: oversight-flesh-out-loop-b, arm sim-blocktype-b, axis
food-economy. Worktree sim-blocktype-b. POLICY-SIDE DIAG
ONLY: scripts/policies/blocktype-diag.js recorder (default
OFF) + trace/analyzer/proof instruments. Zero src/js
changes, zero default flips, no driver adopts the
recorder. This worker does NOT merge to master —
coordinator merges. Prereg (committed BEFORE any judged
leg): evidence/2026-10-29/sim-blocktype-b-prereg.md,
commit f3faa901c.

## Verdict: INSUFFICIENT-DATA (not a census, not a kill)

The pre-registered pilot band could not be formed: the
fresh blind band yielded 2 refused-prone seeds with 4
refused evenings total, against a pilot requirement of
8 refused-prone seeds and a census bar of refused n >= 8
with unclassified = 0. Per the prereg, that is
INSUFFICIENT-DATA — not CENSUS-COMPLETE and not a
failure of the instrument. NO census verdict is claimed
from n = 4: the per-type numbers below are instrument
validation context only, never quoted as the census.

What IS proven (validation, not census): the recorder
classifies live refused evenings and does not perturb
play — scripts/test-blocktype-b.js T1–T8 PROOF-GREEN on
the 2-seed validation pair (4/4 classified, probe
agreement 4/4, route paths structurally valid 4/4,
OFF-vs-ON deep-equal with zero diffs, partition sums
hold, recorder errors 0). The next run can reuse this
instrument unchanged; what it needs is a different
screen (see "Metric review").

## The blind band, as measured (selection data, not judged census)

Scan (plain nighttravel gate-OFF legs, 30 loop-days,
substrate COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
DEPOSITGATE=1): fresh band 12000–12079, 80 seeds, 2383
evenings. The bank scanned 11000–11447 and the detour
confirm scan used 11500–11519, so 12000+ is fresh; no
eveningdetour/blockedpath corpus seed is reused as
judged data (the 115 decomposition was read only as
design source).

| Scan block | Seeds | Evenings | Refused | Qualifiers (>= 1 refused evening) |
|---|---|---|---|---|
| 12000–12039 | 40 | 1193 | 1 | 12027 (1) |
| 12040–12079 | 40 | 1190 | 3 | 12041 (3) |
| Pooled blind band | 80 | 2383 | 4 | 2/80 seeds = 2.5% |

Pooled blind-band partition: already-inside 246,
completed 2089, out-of-reach 38, blocked-combat 5,
travel-refused 4, walk-no-path 1. Partitions are sane
(the villages play normally; the player simply ends
most days inside) — the thin yield is a population
fact, not a driver miscount: the single 12027 refusal
reproduces as a genuine creek refusal (hopReturnKind
block:creek, arrival == departure, 0 kcal hop cost),
and the 12041 refusals reproduce as genuine
fallen_tree refusals. At 2.5% qualifiers, the
pre-registered 24-qualifier target would need ~960
blind seeds (~4.5 hours of legs) — the band is
declared exhausted for this run per the prereg's
fallback ("until 24 qualify or the band is exhausted
(reported)"), and no further blind blocks were burned.

## Instrument validation (2 seeds, recorder OFF vs ON)

Validation pair (NOT a pilot band): 12027 + 12041,
recorder OFF legs = the scan legs themselves (byte
copies, md5-verified, into sim-blocktype-b-corpus-off/;
no fresh OFF run was spent, by determinism) and
recorder ON legs fresh into
sim-blocktype-b-corpus-on/.

| Type | Refused | Covered (BFS route exists) | Uncovered (no route) | Route lengths | Blocked tiles |
|---|---|---|---|---|---|
| creek | 1 | 1 | 0 | 3 | (3,3) |
| fallen_tree | 3 | 3 | 0 | 2, 2, 2 | (4,3) |
| Total (validation only) | 4 | 4 | 0 | — | — |

All 4 classified (unclassified = 0 on the validation
pair); probe type == hop type on 4/4; route paths
check structurally (path[0] == departure, consecutive
steps Manhattan 1, last step == haven, length matches).
The 12041 episode is one 3-evening fallen_tree
episode: departure creek (3,3), blocked tile (4,3),
2-step route via (3,4) on all three evenings. The
12027 refusal is a single creek evening: departure
creek (2,3), blocked tile (3,3), 3-step route via
(2,4)–(3,4). These 4 are CONSISTENT with the prior
115 decomposition (all route-around-able) but prove
nothing about type shares at n = 4 — washed_out and
rubble simply did not occur in this sliver, and no
uncovered case occurred either. The genuinely-uncovered
question is still open, not answered.

Proof: node scripts/test-blocktype-b.js --on
evidence/2026-10-29/sim-blocktype-b-corpus-on --off
evidence/2026-10-29/sim-blocktype-b-corpus-off →
PROOF-GREEN (T1 gate-default-OFF unit, T2
unclassified == 0, T3 records + probe agreement, T4
route-path structure, T5 OFF-vs-ON deep-equal zero
diffs, T6 partition sums, T7 recorder errs == 0,
T8 leg identity flags). T5 is the load-bearing leg
for the next run: the recorder demonstrably does not
change play, so a re-screened census can trust its
ON legs against OFF controls without re-proving
perturbation.

## Reachability verdict (waves 1–5, regional → national, table, win flag)

NOT OBSERVABLE in 30-day position traces — reported,
not claimed. What IS in the files: maxWaveUnlocked per
scan seed — wave 3 on 1/80 seeds (12019), wave 2 on
most, wave 1 on the rest; wave 4–5 unlocks 0/80.
No national/table/win movement is claimed from this
run; the census is a nightly-position instrument, and
a 30-day trace cannot move a scale-wall number.

## Wall numbers (every run)

- National: not observable in 30d traces (no field).
- Table: not observable in 30d traces (no field).
- Wins: not observable in 30d traces (no field); 0 win
  flags present.
- Wave 4–5 unlocks: 0/80 blind scan, 0/2 validation
  both legs.
- Median survival: 30 days (78/80 scan villages
  survived 30 days; 12022 village-lost day 23, 12064
  village-lost day 20, both on scan legs with 0 refused
  evenings — losses unrelated to refusals).

## Village assessment (plain words)

Eighty blind villages, thirty days in: alive and thin
in the familiar way, and — unlike the enriched
verdict-bank villages — mostly ending their days
inside already (2089 completed evenings vs 4 refused).
The refused villager is the exception, not the rule:
on 12041, one villager spends three evenings camped
on a creek bank one tile from a fallen tree across
the path home, learning a Nightlight counter from
Lena by the fire on day 15, trailed by a Drum-Belly
on day 16 ("It followed you. The Drum-Belly is
here."), and home again by the morning of day 17.
On 12027, one creek refusal on day 9, still camped
on the creek bank the next morning. What was missing
on those nights was the same walk the detour lever
already measured — and on this sliver the walk
existed (2–3 steps) every time. The blank this run
fills is the instrument that can now type every such
night on a proper band, plus the measured fact that
blind seeds almost never produce them. The blank it
documents but does not fill is the census itself —
type shares and the uncovered set on current master —
which needs the re-screened run in "Metric review".

## Sense-testing (read transcripts, judged for meaning)

- REFUSED, creek (12027 day 9, creek (2,3) → blocked
  (3,3)): the tail ends "The creek runs fast here — no
  crossing without a bridge or a swim." twice, position
  unchanged, kcal 113 → 113. Honest about the block;
  silent about the 3-step way around via (2,4)–(3,4)
  and silent about bedding down away — the same two
  omissions the blockedpath diag named, live on a
  fresh seed.
- REFUSED, fallen_tree episode (12041 days 14–16,
  creek (3,3) → blocked (4,3)): day 14 ends on a
  bullfrog note and "A fallen tree blocks the path.";
  day 15 ends on a learned Nightlight counter and the
  same refusal; day 16 ends refusal, "Travel 1 tile to
  creek.", "It followed you. The Drum-Belly is here.",
  refusal again. Nothing robotic: the days forage,
  learn, and meet monsters, and the refusal is the
  honest last line each night. The morning after the
  episode (day 17) wakes inside at haven — the
  episode ends, though the trace does not say whether
  the tree was cleared, the villager walked around in
  daytime, or something else moved them home. That
  un-narrated exit is a small wrinkle, not a guard
  issue (no morning criterion exists for this census).
- No transcript read robotic in the judged sample; the
  robotic-feeling beat, where it exists, is again the
  absence — no line ever names the way around, and no
  line marks the night away.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

NO balance-panel compare .md is produced, as
pre-registered before judging: this leg is a 30-day
position census of a POLICY-SIDE recorder — zero
src/js changes, so there is no game-root delta for a
panel to compare, and the panel's registry policies do
not include the trace policies this arm measures. The
OFF-vs-ON legs are an instrument-perturbation check
(G-deep-equal, proven on the validation pair), not a
game comparison, and the pre-registered census bar is
the judge. If a future lever becomes a game change, a
panel compare is run at that point.

## Metric review (mandatory — doubts for the NEXT run, never a re-score)

- The blind-band screen was the wrong screen for this
  question, and the prereg's extension rule
  underestimated how wrong: refused evenings are a
  rare event on blind seeds (4 in 2383 evenings), so
  a blind band cannot power a type census in a run.
  The prior 115 decomposition's population was
  away-prone-enriched by construction (the bank's
  screen: near-home away evenings, d <= 3), and its
  type shares describe THAT population. The NEXT
  run's prereg should pre-register a two-stage
  screen on a fresh band: stage 1 = the bank's
  away-prone screen (or an equivalent near-home-away
  screen, stated exactly), stage 2 = refused-prone
  among stage-1 qualifiers — with the census quoted
  as "among refused evenings on refused-prone seeds
  from an away-prone screen", never as a blind-band
  rate. This revision is proposed here, NOT applied
  retroactively to this run: no stage-1 screen was
  run, no pilot band was formed, and no census
  verdict is claimed.
- The minimum-n rule (n >= 8 refused evenings) held
  as written: with n = 4 the run correctly reports
  INSUFFICIENT-DATA rather than stretching 4 evenings
  into a census. Keep the rule; fix the screen.
- The recorder's BFS judge did not bite on the
  validation pair (all routes orthogonal, lengths
  2–3, matching the detour lever's walked lengths).
  The diagonal-only curiosity from the diag's metric
  review remains unobserved — a re-screened census
  should keep the BFS-as-judge statement verbatim.
- Scan legs double as OFF legs by determinism (byte
  copies, md5-verified) for the validation pair only.
  A re-screened pilot must still run FRESH OFF legs
  for its pilot seeds (the prereg's pilot rule says
  both legs per seed), not reuse scan legs — the
  copy shortcut was used here solely for instrument
  validation, stated openly, and must not become a
  pilot precedent.

## Evidence files

- Prereg: evidence/2026-10-29/sim-blocktype-b-prereg.md
  (commit f3faa901c, before any judged leg)
- This file: evidence/2026-10-29/sim-blocktype-b.md
- Scan (selection only, 80 seeds):
  evidence/2026-10-29/sim-blocktype-b-scan/ (40 files),
  evidence/2026-10-29/sim-blocktype-b-scan2/ (40 files),
  sim-blocktype-b-scan-analysis.json,
  sim-blocktype-b-scan2-analysis.json
- Validation corpora: evidence/2026-10-29/
  sim-blocktype-b-corpus-on/ (2 files, recorder ON),
  sim-blocktype-b-corpus-off/ (2 files, byte copies
  of the scan legs, md5-verified),
  sim-blocktype-b-validation-analysis.json
- Instruments: scripts/policies/blocktype-diag.js,
  scripts/blocktype-trace-b.js,
  scripts/analyze-blocktype-b.js
- Proof: scripts/test-blocktype-b.js (T1–T8
  PROOF-GREEN on the validation pair; the census bar
  itself is unmet at n = 4 — proof-green validates
  the instrument, it does not complete the census)

## Landing note for the coordinator

HELD, not landed as a lever: the census is
INSUFFICIENT-DATA, so no census verdict lands and no
lever is built. What the branch holds for the next
run: the PROOF-GREEN default-OFF recorder instrument
(blocktype-diag.js + trace/analyzer/proof), the 80-seed
blind-band scan (selection data + blind-band rate),
and the 2-seed validation pair. The next run's job is
a re-screened census under a two-stage prereg (see
"Metric review") — it should NOT re-run blind blocks.
This worker does NOT merge to master — coordinator
merges. NOTE ON BASE: this branch sits on loop A's
unmerged departhold commits above c3c8a2718; this
arm's commits touch only its own files (prereg,
instruments, scan/validation corpora, analyses,
evidence). Worktree contains only committed work at
handoff (verified before reporting).
