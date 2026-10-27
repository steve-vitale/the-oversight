# sim-raidday100-b — find a day-100 raid seed and exercise the post-snapshot raid adjustment

Run: oversight-flesh-out-loop-b, axis food-economy. Arm: sim-raidday100-b.
DIAG/measurement only: ZERO src/js changes, no default flips, no game-code
lever. This arm does NOT re-judge the raiddor GO or any earlier verdict —
their verdicts stand in their own evidence. Its verdict is ONLY whether
the raiddor post-snapshot raid adjustment is EXERCISED by a day-100 raid
seed on the current base. Judged ONLY against
evidence/2026-10-27/sim-raidday100-b-prereg.md (committed as c961965b0
BEFORE any judged sweep — and, as it turned out, no judged sweep ever
ran, because the screen found no day-100 raid to judge).

## Verdict against the pre-registered GO: DIAG-NO-GO

GO required ALL of: (a) a surviving day-100 raid seed in the screened
range; (b) the day-100 raid touches a focal family-seed row; (c) touched
rows close WITH the adjustment (within 1%); (d) WITHOUT the adjustment
the same rows are off by exactly the day-100 raid amount; (e) pooled
focal channels close WITH the adjustment under the raiddor bars; (f)
proof GREEN on the judged corpus.

- (a) FAILS on the full pre-registered screen: 40 seeds (10100-10139),
  52 raid-unanswered records, 51,484 kcal — and ZERO raids dated ==
  the closing-snapshot day. Latest raid day in the whole screen is 99
  (seed 10109), then 97, 96, 96, 93, 91. No day-100 raid seed exists in
  this range, so clauses (b)-(f) have no judged corpus to judge.
- Death-day partial exercise: NONE either. The two early-ending seeds
  had no closing-day raid: 10110 died day 24 (lastSnapDay 24, zero
  raids); 10139 ran to daysAlive 100 with endReason village-lost but
  its last spoilDays snapshot is day 99 (lastSnapDay 99, zero raids).
- Per the prereg, the verdict is therefore DIAG-NO-GO: the adjustment
  stays defense-in-depth, with the full screen census reported —
  never a pass on silence. The screen seeds (10100-10139) are now
  spent-but-unjudged; a later arm must not re-spend them blind.
- NOT a verdict on the adjustment's correctness: the with/without
  identity (noAdj - with == raid100 per focal row) holds on the screen
  corpus, but with raid100 == 0 everywhere that identity is vacuous
  for the day-100 leg — it proves the code path computes, not that
  the leg was exercised. The adjustment remains implemented but
  unexercised after 60 seeds combined (raiddor's 20 + this screen's
  40), with 0 day-100 raids observed.

## Prereg header (MEASUREMENT.md §§11, 14)

- Primary metric: day-100 raid exercise — a surviving seed
  (daysAlive == 100, lastSnapDay == 100) with a raid-unanswered
  record dated == 100, whose touched focal rows close WITH the
  post-snapshot adjustment and are off by exactly the raid amount
  WITHOUT it.
- GO threshold: verbatim from the prereg (see "Verdict" above).
- Horizon + why: 100 days, death-aware — the raiddor/ledgerbound
  horizon, and the horizon the boundary question lives on. Seed
  10110 died at day 24 (village-lost) and ends honestly; seed 10139
  ran to daysAlive 100 but was lost during day 100 before the
  day-100 snapshot (lastSnapDay 99).
- Seeds: screen 10100-10139 (cap 40, chunks of 8, no early stop);
  judged sweep: NONE (no day-100 seed found). Collision check
  before screening: no corpus JSON filenames for 10100-10139 in
  evidence/2026-10-27/ corpus dirs; no word-boundary seed mentions
  for 10100-10139 in dated evidence 2026-10-27/*.md files; distinct
  from spent bands 9820-9827, 9870-9881, 9768-9779, and from the
  ledgerbound confirm band 9850-9861.
- Policies: competent-nofeast (COMPETENT_FEAST=0, SEATDRIVE=0,
  PLENTYDEPRI=0, DEPOSITGATE=1, FEASTSCALE_R13 off).
- Base: NO pin. Current master HEAD at prereg time:
  6ae5049d88d6c22192489dca51a5160d90606daf, unchanged between
  screen, prereg commit, and evidence. Raiddor's trajectories are
  pre-c04d4e0cb and are NOT cited as current-base trajectories;
  this screen's trajectories ARE current-base trajectories.

## Closing-snapshot day — what it means here (prereg definition, verified)

"Closing-snapshot day" = the day of the LAST spoilDays snapshot in a
seed's corpus file (analyzer lastSnapDay). On surviving seeds it is
day 100: the corpus closing is that day's spoilDays snapshot, and the
boundary closing is that closing + day-100 stockSurplus pushes -
day-100 meal draws (pantryDraw + drawSpoiled, day 100) — the day-100
position AFTER the day-100 meal draws, exactly as in raiddor/
ledgerbound. Verified on this screen: 38 surviving seeds have
lastSnapDay 100; the two exceptions are 10110 (24) and 10139 (99,
despite daysAlive 100 — see above).

The post-snapshot raid adjustment, exactly: a raid-unanswered record
dated == lastSnapDay counts as a draw in the boundary flows AND is
subtracted from the boundary closing (total + dried portion):
rBClosing = bClosing - raid100, rBClosingDried = bClosingDried -
raid100D. Without the subtraction, the residual is overstated by
exactly the raid amount — but on this screen raid100 == 0 on every
seed, so the adjustment changes nothing, and that is the finding.

## Instrument (vendored under NEW raidday100 names, zero sibling modifications)

- scripts/sweep-raidday100-b.js (vendored from raiddor's sweep;
  output dir/file prefix, mode string, staging dir, capture require
  adapted; sweep logic otherwise identical).
- scripts/analyze-raidday100-b.js (vendored from raiddor's
  analyzer; ledger math byte-identical, including the post-snapshot
  adjustment; old-boundary and ledgerbound-boundary legs reported
  alongside as controls).
- scripts/test-raidday100-b.js (proof; adapted for a single-seed
  judged corpus: corpus size 1 allowed, det-gate seed = first corpus
  seed, section 3d day-100 exercise + without-adjustment checks;
  leg-2 coverage NOT applicable to a 1-seed corpus and NOT part of
  this arm's GO).
- scripts/trace-raidday100-b.js (vendored from raiddor's trace).
- scripts/stockdoors-capture-raidday100.js (vendored from raiddor's
  capture; internal raid field names raidRecords/raiddorOn and the
  RAIDDOORS env name retained for analyzer compatibility — only
  filenames, corpus dir, file prefix, mode string, staging dir, and
  capture require changed).
- NEVER modified: any sibling capture file (inflow/mealdraw/
  spoilvol/driedpath/stockdoor-capture, ledgerbound files, raiddor
  files) or any src/js file. Screen corpus:
  evidence/2026-10-27/sim-raidday100-b-screen-corpus/ (40 files).
  Screen census:
  evidence/2026-10-27/sim-raidday100-b-screen-census.json.

## Screen census (all 40 seeds — the run's result, not a judged band)

Per seed: daysAlive / lastSnapDay / wave reach / deaths / raid days
(kcal). All raids are raid-unanswered, caller villageAgencyDaily,
asked 800 unless noted; the standard take is Canned soup 4u x 250 =
1,000 (whole-unit overshoot of the 800 ask).

- 10100: 100/100, wave 3, 7 deaths, raids [36 (1,000)]
- 10101: 100/100, wave 3, 3 deaths, raids [16, 81 (1,000 each)]
- 10102: 100/100, wave 3, 2 deaths, raids []
- 10103: 100/100, wave 2, 5 deaths, raids [84 (1,000)]
- 10104: 100/100, wave 3, 7 deaths, raids [29, 45 (1,000 each)]
- 10105: 100/100, wave 3, 5 deaths, raids [49 (820: Canned soup 2u
  x 250 + Foraged food (dried) 2u x 160)]
- 10106: 100/100, wave 3, 3 deaths, raids [62, 96 (1,000 each)]
- 10107: 100/100, wave 3, 5 deaths, raids [61 (1,000)]
- 10108: 100/100, wave 3, 5 deaths, raids []
- 10109: 100/100, wave 2, 3 deaths, raids [99 (1,000)] — nearest miss
- 10110: 24/24, wave 1, 6 deaths, raids [] — died day 24
- 10111: 100/100, wave 3, 2 deaths, raids []
- 10112: 100/100, wave 3, 9 deaths, raids [55, 83 (1,000 each)]
- 10113: 100/100, wave 3, 3 deaths, raids []
- 10114: 100/100, wave 3, 6 deaths, raids [97 (1,000)]
- 10115: 100/100, wave 2, 4 deaths, raids []
- 10116: 100/100, wave 2, 2 deaths, raids [49 (1,000)]
- 10117: 100/100, wave 3, 5 deaths, raids [55, 87 (1,000 each)]
- 10118: 100/100, wave 3, 3 deaths, raids [41, 58, 77 (1,000 each),
  87 (910)]
- 10119: 100/100, wave 3, 3 deaths, raids [55, 91 (1,000 each)]
- 10120: 100/100, wave 3, 1 death, raids []
- 10121: 100/100, wave 2, 4 deaths, raids []
- 10122: 100/100, wave 2, 4 deaths, raids [72, 78 (1,000 each)]
- 10123: 100/100, wave 2, 1 death, raids [80 (1,000)]
- 10124: 100/100, wave 3, 5 deaths, raids [50 (1,000)]
- 10125: 100/100, wave 2, 3 deaths, raids [49 (1,000), 59 (910)]
- 10126: 100/100, wave 2, 6 deaths, raids []
- 10127: 100/100, wave 3, 6 deaths, raids [55, 65 (1,000 each)]
- 10128: 100/100, wave 2, 2 deaths, raids [22, 60, 79 (1,000 each)]
- 10129: 100/100, wave 3, 6 deaths, raids [21, 68 (1,000 each),
  84 (844)]
- 10130: 100/100, wave 3, 5 deaths, raids []
- 10131: 100/100, wave 2, 5 deaths, raids []
- 10132: 100/100, wave 3, 4 deaths, raids [69, 73, 75 (1,000 each)]
- 10133: 100/100, wave 3, 4 deaths, raids [65, 69, 73 (1,000 each)]
- 10134: 100/100, wave 3, 2 deaths, raids [46, 53, 93, 96
  (1,000 each)]
- 10135: 100/100, wave 3, 3 deaths, raids [66 (1,000)]
- 10136: 100/100, wave 3, 2 deaths, raids [42, 47, 51, 58
  (1,000 each)]
- 10137: 100/100, wave 3, 3 deaths, raids []
- 10138: 100/100, wave 3, 7 deaths, raids []
- 10139: 100/99, wave 3, 16 deaths, raids [] — lost during day 100
  before the day-100 snapshot (lastSnapDay 99)

Totals: 52 raid records, 51,484 kcal, 14 seeds with zero raids.
Raid days observed (no day 100): 16, 21, 22, 29, 36, 41, 42, 45, 46,
47, 49, 50, 51, 53, 55, 58, 59, 60, 61, 62, 65, 66, 68, 69, 72, 73, 75,
77, 78, 79, 80, 81, 83, 84, 87, 91, 93, 96, 97, 99. No raid dated >
100, no raid on any closing-snapshot day (100 or death day).

## Analyzer legs on the screen corpus (OBSERVATION, not this arm's verdict)

Running the raidday100 analyzer over the 40-seed screen corpus
(log: evidence/2026-10-27/sim-raidday100-b-screen-analyzer.log)
gives: leg 2 coverage PASS (stockdoor 40/40, dried events 40/40,
linked 100.0%); OLD legs named 17/19 (89.5%), pooled 0.358%, generic
38/40 (95.0%), pooled 0.109%, dried 0.30% PASS; boundary legs named
19/19 (100.0%), pooled 0.001%, generic 38/40 (95.0%), pooled 0.027%,
dried 0.53% PASS; raid-door legs named 19/19 (100.0%), pooled
0.001%, generic 38/40 (95.0%), pooled 0.037%, dried 0.49% PASS.
The analyzer's own "RAID-DOOR VERDICT: GO" on this corpus is the
ledger-closure verdict on a band with no day-100 raid — it is NOT
this arm's GO, which requires the day-100 exercise. The raid-door
legs differ from the boundary legs only by the non-day-100 raid
draws (generic pooled 3,218 -> 4,452; dried -17,816 -> -16,582),
exactly as expected when raid100 == 0 everywhere: the post-snapshot
subtraction moves nothing on this band, and that non-movement is
itself the evidence that the leg is unexercised here.

## Proof (scripts/test-raidday100-b.js on the SCREEN corpus — observation)

There is NO judged corpus, so the proof cannot be GREEN on a judged
corpus, and it is not claimed to be. Run against the screen corpus
(log: evidence/2026-10-27/sim-raidday100-b-screen-proof.log), it
reports PROOF FAILED with exactly 4 failures, all expected:
(1) corpus size 40 (a screen corpus is not a 1/8/12 judged corpus);
(2)-(4) the three section-3d day-100 exercise checks (no day-100
seed, no touched focal row, no touched-row closure) — those
failures ARE the DIAG-NO-GO, not instrument failures. Everything
else PASSES: corpus validity on all 40 files; det-gate leg 1 PASS
(instrument on vs off byte-identical on non-raid fields; det-gate
reproduces corpus seed 10100 counts exactly, 148/1171/7/89, on the
current base); independent recomputation matches the analyzer on
all nine pooled figures (old, boundary, and raiddor named/generic/
dried); the without-adjustment identity holds on every focal row
(with raid100 == 0, so the identity is vacuous for the day-100
leg — stated, not oversold); raid integrity (0 retMismatches) and
disjointness PASS; hygiene PASS (zero src/js modified, zero sibling
files modified — including raiddor files — no modified tracked file
outside this run's own files; git status clean at proof time).
The instrument is proven sound on the current base; the leg it was
built to exercise simply did not occur in 40 seeds.

## Reachability verdict (screen band, competent-nofeast, 100d)

Waves 1-3 reached (wave 3 on 28/40 seeds, wave 2 on 11, wave 1 on
10110 alone); waves 4-5 on 0/40 seeds. Regional, national, table,
wins: 0/40. Rank stayed village on all 40 seeds. Median survival
100d (39 seeds at daysAlive 100; 10110 lost at day 24). Deaths 177
(arena 78, ambush 20, monster 18, sickness 15, wound-that-wouldn't-
close 12, starvation 10, contest 8, dehydration 3, choir toad 2,
combat 2, and 9 singletons (mosquito, hushpuppy, monitor lizard,
big ugly, lockjaw, heckler, grief counselor, loud beast,
expedition — 1 death each, 177 total).

The scale wall stands on this band; this arm measures a ledger leg,
it does not move the wall numbers. Arc II/III/IV, four-realm
formation, trap acquisition by source, counter discovery/
counter-kill rate, and young-link succession survival are not
recorded in this corpus and are not estimated here.

## Wall numbers (screen band, competent-nofeast)

National / table / wins: 0/40. Wave-4/5 unlocks: 0/40. Wave reach:
wave 3 on 28 seeds, wave 2 on 11, wave 1 on 1 (10110). Median
survival 100d. Death-cause shares: arena 44.1% (78/177), ambush
11.3% (20/177), monster 10.2% (18/177), sickness 8.5% (15/177),
wound 6.8% (12/177), starvation 5.6% (10/177), contest 4.5%
(8/177), dehydration 1.7% (3/177), choir toad 1.1% (2/177),
combat 1.1% (2/177), and 9 singletons at 1 death each (5.1%
combined — see census deathCauses for the full list).

## Village assessment (plain words)

Forty villages, thirty-eight surviving the full 100 days around
pantries that are now watched down to the unit — and the two that
didn't are the honest exceptions that prove the horizon is
death-aware, not padded. The food story on this band was never
hunger: villages cook for the haven and work the smoke racks by
name ("James cooked for the haven — meals stretched. James worked
the smoke racks too — 2 batches preserved"), eat from the pantry by
name, and share surplus back into the stores — and on 26 of the 40
villages, a night raid at the treeline that nobody answered, so
raiders walked off with the usual fixed share (Canned soup 4u x 250
= 1,000, the whole-unit overshoot of an 800 ask; the mixed takes on
10105, 10118, 10125, 10129 show the same arithmetic reaching into
dried stores when soup runs short). What the villages looked like,
up close: working pantry economies where the losses that mattered
were not raids at all — a raid costs about 1,000 kcal against
pantries holding hundreds of thousands, a tax, not a famine — but
arenas (78 deaths, nearly half of all deaths), ambushes, and
monsters. Who thrived and who died and why: the surviving villages
thrived on the same pantry competence; the dead (10110, lost at day
24 with 6 deaths: sickness 2, arena 1, starvation 3, its first death
day 7) and the heavy-loss village (10139, 16 deaths, 10 in the
arena, lost during day 100 itself) lost people to violence and
sickness, not to the raids — and 10139's loss during the final day
is itself a finding about the closing snapshot (see above). What
was missing was never food — it was a day-100 raid, and after 40
more villages it still hasn't shown up: the adjustment that would
catch it is built, tested for identity, and waiting. Blanks filled:
(1) the screen census (40 seeds, 52 raids, full raid-day
distribution) is now the measured base rate for day-100 raids on
the current base: 0/40 here, 0/60 combined with raiddor; (2) the
instrument is proven sound on the current base (det-gate +
independent recomputation + hygiene all PASS on the screen corpus).
Documented, not fixed: no game-code change was made (DIAG only);
whether a day-100 raid is rare, or structurally impossible at the
horizon edge, is a question for the next prereg — this run does
not answer it, and does not pretend to.

## Sense transcript (SENSE-TESTING LAW — meaning, not just counts)

There is NO day-100 raid narration to quote, because there is no
day-100 raid — that absence is the verdict, not a gap in the
transcript. The nearest raids read exactly like raiddor's, with
numbers that ARE the ledger's numbers. Seed 10109, day 99: "🌙 You
weren't at the treeline. Dmitri of The Bloodied didn't wait — they
hit the stores and melted back into the dark with 1,000 kcal. The
village will talk about this for a long time." Ledger: day 99,
Canned soup 4u x 250 = 1,000, asked 800. Seed 10114, day 97: "🌙 You
weren't at the treeline. Jesse of The Red Table didn't wait — they
hit the stores and melted back into the dark with 1,000 kcal. The
village will talk about this for a long time." Ledger: day 97, same
1,000. Seed 10106, day 96 (Andre of Stonebridge) and 10134, day 96
(Omar of Stonebridge) read identically with their own champions.
The narration is generated from the situation (different champions
and villages, same honest mechanism), the "talk about this for a
long time" tail is a social consequence (opinion -5, journal
entry), not flavor, and nothing robotic, static, or repeated was
found in the sampled dialogue beyond the mechanism's own honest
whole-unit arithmetic (the 800-ask/1,000-take shape on Canned soup).
The one sense note that matters for the next arm: a raid demand
arrives a day before its take (10103: demand day 83, take day 84),
so a day-100 take would need a demand on day 99 — the screen's day-
99 take (10109) shows demands do occur that late, but no demand on
day 99 was followed by a day-100 take in this range.

## Metric review (MEASUREMENT.md section 14)

- The pre-registered metric worked as written and the verdict
  follows from it: clause (a) fails on the full 40-seed screen, so
  no judged sweep was run and no clause was re-scored. The screen
  cap (40) was honored exactly — the run did not extend the screen
  to chase a hit, and did not claim a pass on silence.
- Bar lesson: the GO bar's clause (a) is the whole gate here, and
  it is a rare-event gate. With 0/40 (0/60 combined with raiddor),
  a future prereg that wants this leg exercised should either
  screen substantially more seeds (at ~1.5% per seed if raid days
  were uniform over days 16-99, 40 seeds gives only ~45% power for
  at least one hit — an estimate, not a measurement) or, better,
  first establish by code reading whether a day-100 take is even
  reachable (does villageAgencyDaily run its raid branch on day
  100, and does the horizon include the day-100 endDay take?) before
  spending more seeds. That code-reading question is proposed for
  the NEXT run's prereg, not answered here.
- Instrument lesson: the proof's section 3d correctly fails when
  the leg is unexercised — the proof is a faithful instrument, not
  a rubber stamp. The without-adjustment identity check passes
  vacuously with raid100 == 0; a future proof run on a real
  day-100 seed must show it passing NON-vacuously (touched rows
  with raid100 > 0), or the proof has not actually checked the leg.
- Screen lesson: the day-100 closing snapshot has an edge case the
  prereg did not name: a village lost DURING day 100 (10139) has
  daysAlive 100 but lastSnapDay 99. The prereg's clause (a)
  requires lastSnapDay == 100, so 10139 correctly does not count
  even if it had a day-99 raid (it had none) — but a future prereg
  should state the 10139 edge case explicitly: a raid dated == 99
  on a 10139-like seed is a death-day snapshot raid only if the
  seed's lastSnapDay is 99 AND the village is lost, which is a
  partial exercise under the prereg's death-day rule, not a
  day-100 exercise.
- Balanced panel (MEASUREMENT.md §15): NO comparison exists — this
  arm changes no lever and no game code, so there is no before/
  after to panel, exactly as raiddor stated. The det-gate
  (instrument on vs off, byte-identical on non-raid fields) plus
  the with/without-adjustment recomputation is the instrument
  before/after. Not forced, not faked.
- Infrastructure notes (loud): (1) After the prereg commit
  c961965b0, the safe-commit index-clobber variant hit again
  (committed files staged-as-deleted in the main index) — repaired
  per the documented recipe (update-index --add --cacheinfo from
  HEAD blobs), verified git status clean + git diff HEAD empty +
  hash-object matches HEAD blobs, before proceeding. The commit
  itself was correct. (2) Chunk 3's first sweep process (seeds
  10116-10123) died after seed 10116 with no crash output when its
  exec session was lost on an aborted poll; seed 10116's file was
  verified intact (parses, raid day 49) and only seeds 10117-10123
  were re-run — no seed was double-run, no file overwritten.
  (3) Wall time was load-bound, not compute-bound: per-seed sim
  compute is ~1.4-2.0s, but the 2-core box ran at load ~9-14 from
  sibling work, so 40 seeds took ~2 hours of wall time. No EPERM
  write flap blocked this run's writes; the sweep's in-memory
  pending-flush path was never needed. (4) The /tmp log redirect
  used for chunk 3b's re-run held only console summaries; all sim
  outputs live under evidence/2026-10-27/sim-raidday100-b-screen-
  corpus/, never /tmp.

## Reproduction check (this run)

- Prereg committed BEFORE any judged sweep (c961965b0); no judged
  sweep ran (no day-100 seed found), so the prereg-before-judgment
  ordering holds vacuously and honestly.
- Proof scripts/test-raidday100-b.js run on the screen corpus:
  4 expected failures (corpus size + 3 day-100 exercise checks),
  all other checks PASS (see "Proof" above). No jest was run
  (nothing to test in jest — the proof is node, not jest). No
  [needs-eyes]: this lands a measurement, not a player-visible
  change.
- No game-code change: zero src/js files committed. Files in this
  arm's commits: prereg commit c961965b0 (prereg + screen census +
  screen corpus + 5 scripts) and the evidence commit (this file +
  screen analyzer log + screen proof log).
- Backlog: sim-findings.md line for the post-snapshot adjustment
  item is left for the coordinator to mark [claimed]/[fixed-or-
  still-open] — this arm's verdict is DIAG-NO-GO, so the item is
  NOT fixed by this run; the coordinator should record it as
  still open with this evidence attached, not as fixed.

## Convergence line

not converged — for the day-100 exercise blank specifically. The
post-snapshot raid adjustment remains implemented but unexercised
after 60 seeds combined (raiddor 20 + this screen 40), 0 day-100
raids, 0 death-day closing-snapshot raids. The ledger itself closes
on the screen band (raid-door legs 19/19 named, 38/40 generic,
dried 0.49%), so the open work is reachability of the leg (is a
day-100 take reachable at the horizon edge, and how many seeds
would it take to see one?), not investigation of the ledger.

## Verdict (judged against the pre-registered bar, not re-scored): DIAG-NO-GO

No day-100 raid was found in the full pre-registered 40-seed
screen (10100-10139; 52 raids, latest day 99), and no death-day
closing-snapshot raid occurred either, so no judged sweep could be
run and the post-snapshot raid adjustment stays defense-in-depth.
The instrument is proven sound on the current base (det-gate,
independent recomputation, integrity, disjointness, hygiene all
PASS on the screen corpus), the screen census is the measured base
rate, and the wall stands unchanged (national/table/wins 0/40,
waves 4-5 0/40, median survival 100d).
