# sim-contactrec-a — evade-row HP-capture recorder fix, contact-break share re-estimated (GO)

Run: Loop A worker, axis scale-onramp (converging, NOT converged).
Arm type: INSTRUMENT-ONLY precursor to any future contact-finish
rule. NO contact-finish game rule is built here, NO game-behavior
change: the only src/js change is a pure logging emission (two
new keys on the fieldFight return record), proven non-perturbative
by det-gate D2 below. Everything else is recorder/analyzer/scripts
only. Pre-registration: evidence/2026-10-31/sim-contactrec-a-prereg.md
(committed BEFORE any measurement sims, commit 2282c5880).
Recorder: scripts/policies/contactrec-diag.js. Sweep/splitter:
scripts/contactrec-sweep-20261031.js, scripts/contactrec-split-20261031.js
(rebuilt from the fieldkill recipe, recorder module + env name
swapped, after the fieldfinish2 instrument loss). Analyzer:
scripts/contactrec-analyze-20261031.js (contactbreak classifier
imported unchanged). Proof test: scripts/test-contactrec-20261031.js
(33 passed, 0 failed). Quick check: `node scripts/check.js --quick`
green (290 scripts, exit 0).

## Question (from sim-contactbreak-a)

Evade rows systematically lacked mHpStart/mMaxHp in the landed
fieldfinish2 corpus, and evades are exactly where contact-shaped
rows concentrate, so the judged contact-break share 27/104
(26.0%) was a floor, not a point estimate. This arm fixes the
recorder and re-estimates the share with corrected fields.

## Root cause (proven, not assumed)

The old recorder captured HP pre-call from the world-entity
argument `m` (`m.hp`, `m.maxHp`). The expedition channel
(villager-agency.js expeditionMonster) calls `fieldFight(vid,
mdef, null, {awareness: true, ...})` — `m` is null for ephemeral
meetings, so pre-call capture is null. In the landed corpus ALL
22 missing-HP wave-3 rows are caller=expedition (baseline 15,
lever 7); all present-HP rows are caller=wild/aid (world entity
present). The gap is channel-shaped, and evades concentrate in
it (baseline 9/15, lever 4/7 missing rows are evades).

## The fix (two layers, both exact)

1. src/js/fieldFights.js — pure logging emission ONLY: right
   after the members construction, `rec.mHpStart =
   members[0].hp; rec.mMaxHp = members[0].maxHp;`. No existing
   field touched, no RNG draw, no state write, no engine code
   reads the new keys (verified by grep over src/js). Every
   return path (alreadyDead, evade, final) carries them.
2. scripts/policies/contactrec-diag.js — capture preference
   order: (a) pre-call world-entity HP; (b) post-call emission
   rec.mHpStart/rec.mMaxHp; (c) evade-only exact fill (opening
   HP = rec.mHpLeft, because the awareness evade return precedes
   ambush, volley, and all rounds, so no damage has landed) and
   m=null band-top max (members[0].maxHp = max(rolled HP,
   mdef.hp[1]) = hp[1] for a roll inside [lo, hi]). Rule (c)
   NEVER fills a fought row's mHpStart (unrecoverable post-hoc)
   and never invents a max outside the m=null case. A new audit
   field mHpAtContact = rec.mHpLeft rides every row.

## Det-gates (both pass, seeds 87104/87127)

- D1 recorder ON vs OFF (emission ON in both): dayHash arrays
  BYTE-IDENTICAL (159/159, 127/127) and end fields identical.
- D2 emission ON vs OFF (recorder OFF in both, HEAD copy of
  fieldFights.js swapped in and hash-verified restored):
  dayHash arrays BYTE-IDENTICAL and end fields identical.
The recorder and the emission move no trajectory. The prereg
fallback (revert emission, judge recorder-only) was NOT needed.

## Fresh corpus (judged leg, 8 pilot seeds, no game lever)

Policy stack identical to the fieldfinish2 baseline leg
(withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))),
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1) plus CONTACTREC=1. Horizon 200 loop-days,
death-aware. Seeds: 87104, 87109, 87119, 87124, 87140, 87115,
87123, 87127. Corpus: evidence/2026-10-31/contactrec-fresh.jsonl
+ perseed-contactrec-fresh/leadfeast/ (+ analysis JSON).

Trajectory check (reported, and it matters): the fresh leg's
dayHash arrays are BYTE-IDENTICAL to the old baseline corpus
on all 8 seeds, and end fields identical. The substrate moved
(old anchor f554d59a9, fresh anchor c8b7fe1c4) but these eight
trajectories did not — so the fresh leg is a true re-measurement
of the SAME meetings with corrected fields, not a new trajectory.
Per-leg reporting is still honored: nothing below is pooled with
the diverged lever leg.

## Headline numbers (per leg, never pooled)

| Metric | Old baseline (floor) | Old baseline, evade-backfilled | FRESH leg (fixed recorder) | Old lever (diverged) |
| --- | ---: | ---: | ---: | ---: |
| Total wave-3 field meetings | 104 | 104 | 104 | 71 |
| CONTACT n (share) | 27 (26.0%) | 27 (26.0%) | 27 (26.0%) | 0 (0.0%) |
| FOUGHT n (share) | 62 (59.6%) | 71 (68.3%) | 77 (74.0%) | 64 (90.1%) |
| UNCLASSIFIED n (share) | 15 (14.4%) | 6 (5.8%) | 0 (0.0%) | 7 (9.9%) |
| Evade-row HP capture | 0/9 (0%) | — | 9/9 (100%) | 0/4 (0%) |
| Missing-HP rows (any outcome) | 15 | 6 | 0 | 7 |
| Reconciliation | 27+62+15 = 104 ✓ | 27+71+6 = 104 ✓ | 27+77+0 = 104 ✓ | 0+64+7 = 71 ✓ |

## The corrected estimate, stated plainly

The corrected contact-break share on the baseline trajectory is
27/104 = 26.0% — numerically the same as the old floor, but now
a POINT estimate with ZERO unclassified remainder, not a floor
with a 27–36 range. The range collapses from both sides:

- The 9 contact-shaped evade rows (the "dark matter") are all
  healthy beasts seen in time, not wounded beasts: their
  corrected fractions run 0.83–0.98 of max (314/340, 268/320,
  348/380, 341/360, 350/420, 314/340, 372/380, 301/320, 317/340),
  so all 9 classify FOUGHT. The old sensitivity bound (36/104)
  is refuted, not just narrowed: contact-shaped on visible
  fields is not contact once HP is known.
- The 6 remaining old-baseline unclassified rows (fought
  ephemeral vFlee/mFlee rows with damage dealt) are filled by
  the src emission on the fresh leg and classify FOUGHT.
- The fresh contact set is IDENTICAL to the old contact set
  (same seed/day/monster keys, same distribution: median 4 HP,
  Q1 1, Q3 28.5, sorted 1×13, 4, 16×3, 28×3, 29×4, 33, 36×2;
  by monster callback 10, chorus_line 7, spool 7, redactor 3;
  by intent engage 26, learn 1; by seed 87123: 12, 87140: 7,
  87124: 4, 87104: 2, 87115: 2). The fix changed no classification
  the old data already supported — it only resolved the rows the
  old data could not classify.
- The old lever leg (diverged trajectory) is NOT re-run: its
  backfilled cross-check stands at 0/68/3 (4 evades filled, all
  FOUGHT; contact still 0). A future BUILD arm must still
  pre-register its baseline on the leg it will be judged against
  and must not pool legs.

## Sense-testing (SENSE-TESTING LAW — logs read in full)

Three contact-break logs from the fresh corpus (trajectories
identical, so these are the same meetings contactbreak read,
re-confirmed with corrected fields):

1. Seed 87104, day 148, Callback at 1 HP of 260: "Weronika
   drove The Callback off with the bow — it broke before it
   ever closed." Reads believably: a dying thing shown a drawn
   bow goes. Thin but coherent.
2. Seed 87115, day 84, Callback at 36 HP of 260 (the
   no-arrows-yet-bow-drive-off class, 10/27 fresh contact
   logs): "Dmitri has Crude bow but no arrows — the string
   stays drawn, useless." / "Dmitri drove The Callback off
   with the bow — it broke before it ever closed." The
   contradiction is STILL present, unchanged by the recorder
   fix (it is a narration bug, not a recording bug): the beast
   flees from an empty threat and the narration does not
   notice. A future BUILD arm must still not let a no-arrows
   bow count as the instrument of a finish.
3. Seed 87123, day 82, Chorus Line at 1 HP of 300: "Gabriela
   has Bow but no arrows — the string stays drawn, useless."
   / "Gabriela drove Chorus Line off with the bow — it broke
   before it ever closed." Same contradiction, plus a second
   wording slip the first read missed: the villager holds a
   SLING ("has Sling but no arrows") but the drive-off line
   says "with the bow". The no-arrows line names the held
   weapon; the drive-off line always says bow. That mismatch
   is pre-existing narration, flagged here for a future
   narration pass, not fixed in this instrument arm.

Evade sense (all 9 fresh evade logs): each is one line of the
form "<Name> saw <Monster> in time and gave it room." At
0.83–0.98 of max HP these read coherently — a healthy beast
spotted early is given room, and no fight follows. Evades are
not contact meetings and never were: the villager avoids a
whole beast, while contact meetings are drive-offs of a beast
already broken on sight. The classifier's outcome restriction
(mFlee/evade) admits both shapes, but the HP field is what
separates them — which is exactly why the recorder gap mattered.

## Verdict: GO

All four prereg bars hold: (1) evade-row HP capture 9/9 =
100% ≥ 90% on the fresh corpus; (2) reconciliation 100%
(27+77+0 = 104, zero unclassified, zero missing-HP rows);
(3) corrected estimate reported as a point (27/104 = 26.0%)
with the unclassified remainder explicitly reconciled to zero
— no contact-shaped remainder survives correction; (4) det-gates
D1 and D2 both pass. No fallback was invoked.

## Metric review (mandatory, §14)

- The prereg's worry — that the fresh leg would be a new
  trajectory requiring separate-leg reporting — resolved in the
  best way: trajectories are byte-identical to the old baseline
  leg, so the fresh number is a direct correction of the old
  floor on the same meetings. Legs are still reported separately
  (the lever leg is diverged and is not re-run here).
- The backfill cross-check predicted the fresh result exactly
  on contact (27) and on evades (all FOUGHT); it understated
  fought only by the 6 fought ephemeral rows the backfill
  deliberately does not fill. Backfill is a sound triage tool
  for evade rows, not a substitute for the emission on fought
  rows — future recorders should keep the emission, not rely
  on backfill.
- The classifier's rounds <= 1 bound remains untested by real
  rows (all 27 contact rows are rounds-0 mFlee; no rounds-1 or
  evade-outcome contact row occurs even with full capture —
  the 9 corrected evades are all healthy-beast FOUGHT). A
  future arm wanting rounds-1 or evade-outcome contact rows
  must find them first; they do not occur here.
- The no-arrows contradiction (10/27) and the sling/bow wording
  slip are narration gaps, not measurement gaps: they do not
  move any count, but they bound how a contact-finish rule may
  be narrated (no-arrows bow must not count as the instrument).
- Index-clobber note (infrastructure, not measurement):
  safe-commit.sh left staged-deletion entries for committed
  files on three consecutive commits in this worktree (the
  known 2026-10-22/23 clobber class). Each commit was verified
  correct (git show + blob hashes) and the index repaired with
  `git update-index --add --cacheinfo` before continuing.
  The final tree state below is verified clean after repair.

## Wall numbers (fresh leg; identical trajectories, unchanged)

National 7/8, table 7/8, wins 7/8, wave-4 4/8, wave-5 0/8,
full seat 0, wave 5 reached 0. (87109 village-lost day 146;
all other seeds won.) This arm judges no lever; the wall
numbers stand as reported in sim-fieldfinish2-a.md. Arc reach,
four-realm formation, trap acquisition by source, counter
discovery rates, and young-link succession survival are NOT in
this corpus — reported as unmeasured, not as zero.

## Blanks filled or documented

- FILLED (measured): the evade-row HP-capture gap is closed —
  evade capture 0% → 100%, missing-HP rows 15 → 0 on the
  baseline trajectory, and the contact-break share is now a
  point estimate (27/104 = 26.0%) with zero unclassified
  remainder. The 27–36 "dark matter" range is resolved to 27.
- DOCUMENTED (for a future BUILD arm, not built here): the
  contact-finish candidate shape from sim-contactbreak-a.md
  stands unchanged (27 meetings, 13 at 1 HP, 14 at <= 15 HP,
  24 at <= 30 HP), with two narration constraints added: a
  no-arrows bow must not count as the finish instrument, and
  the drive-off line must name the held weapon (sling/bow
  mismatch). The break line itself is untouched.
- NOT re-opened: the committed-finish NO-GO, the break line,
  any gate threshold, or the diverged lever leg's zero.
