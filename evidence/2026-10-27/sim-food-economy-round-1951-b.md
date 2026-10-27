# sim-food-economy-round-1951-b — coordinator evidence (loop B, axis food-economy)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261027T1951Z.
Axis: food-economy (converging, second non-converged axis — loop A live
on scale-onramp for the whole run, claim fleshout-20261027T1940Z, NOT
touched). Base at arm start 7d3e367d6; final master 62bafd437.
Both arms DIAG/measurement only, zero src/js, no default flips.
Both merged locally, pending ship. No push, no bump, no live check.

## Arms taken, in order (the 1845Z run's next blanks 1 and 2)

Arm 1 — sim-spandraw-census-b (prereg e04b7673f, results 62bafd437
after one clean rebase onto the callertag merge; proof 20/20 in
worktree, post-rebase, and on merged master): NARROWED, no new class.
Census on the competent surface: only 2 useAbility keys ever fire —
green_thumb.cultivate (274 spans) and green_whisper.cultivate
(82 spans) — 356 spans total, 0 day-crossing, 0 span-internal draws,
0 exclusions. LEG 1 distinct-keys gate FAILED as written (2 vs
floor 5), so the full-band extension was not spent and LEG 3's
confirm band was not triggered. The floor's assumption was wrong,
not the detector: in node sims app.js is excluded, so the UI-button
abilities (scream/shove/bind/goad) never fire; the only game-code
useAbility caller is cultivateGarden, and the competent policy
never taps data-driven ability actions. The zero is measured, not
missing instrumentation — the same detector re-proves cultivate
PROVEN at 3,820 kcal excluded on the 9954 belongseek replay.
Cultivate on this band is NO-DAY-CROSSING (competent routine
cultivates early; tickAction(16) is ~3% of the 512-tick day, so a
crossing needs a start inside the last 16 ticks). NOT-FIRED split
owned: 35 owned-but-unfired, 105 never-owned on this band.
Disclosed proof correction: the proof first re-asserted the
prereg's ≥5 floor and went red (19/1); it now asserts keys are
reported (≥1) and prints the gate outcome separately. Analyzer
numbers never changed; LEG 1 still judges FAILED.

Arm 2 — sim-callertag-resweep-b (prereg 2c9f11cbe, results
f230f6505; proof test-callertag-resweep-b.js 15/15 and
test-callertag-b.js 30/30 in worktree and on merged master):
NO-GO on the determinism leg only, as written — and the mover
measurement itself passed every bar. Re-sweep of band 9760–9767
with scripts/caller-tag-capture.js installed verbatim (byte-
unchanged): 234 records / 931,330 kcal vs the prereg's stale
276 / 1,310,710 baseline, so the determinism leg fails and is
NOT re-scored. The unwrapped-vs-wrapped control run after the
sweep is decisive: identical on all 8 seeds including drifted
9761 and 9764, while unwrapped-on-current-master diverges from
the 2026-10-26 corpus on 9761/9764/9765/9766/9767. The wrapper
perturbs nothing; master moved under the band. Mover split,
234/234 classified, 0 unclassified, join balanced both ways:
donateToPantry 186 / 644,830 kcal; returnToVillage homecoming
48 / 286,500 kcal; returnToOldVillage exile amends COUNTED 0
(all destVillage = Haven, all pastVillages empty) — the old
0..276 exile bound is closed on this band as a counted zero.
Assisted/ordinary from full gardenShares objects: 232 assisted /
2 ordinary — the 2 ordinary are real (day-62 Cattail donations
on 9761 from a day-61 harvest with no coax since day 27), so the
old "all assisted" closure is corpus-specific, not universal.
Sense-check (9762 day 20): one day's harvest through both doors
in sequence (2,700 kcal homecoming, then 300 + 3,000 donate) —
exactly why the old corpus could not separate the callers.

## Wall numbers (judged corpora only, competent pre-seat substrate)

Callertag re-sweep: national 0/8, table 0/8, wins 0/8, wave 4–5
0/8, median/max survival 100d/100d (censored); deaths 21
(arena 7, monster 4, ambush 3, sickness 3, choir toad 1,
dehydration 1, starvation 1, wound 1).
Spandraw census: national 0/8, table 0/8, wins 0/8, wave 4–5
0/8, wave 2 in 7/8, wave 3 in 4/8; median/max 100d/100d, min 26d
(9951, village-lost); deaths 32 (arena 16 = 50%, sickness 4,
ambush 3, starvation 2, dehydration 2, unclosing wound 2,
toad 1, contest 1, monster 1). The scale wall stands on both
bands, as expected for ledger/provenance work; neither arm
moves it. Arc II/III/IV, four-realm formation, trap acquisition,
counter discovery/kill, young-link succession survival are not
recorded in these corpora and are not estimated here.

## Village assessment (plain words)

Two plain villages' worth of evidence, same moral: villages that
survive do not climb on competence alone. The re-sweep villages
all stood 100 days on garden food the scholar sowed, coaxed,
harvested, and carried in — through donation most days, through
homecoming pooling on others — and never went regional. The
census villages worked their gardens almost daily (87 and 92
taps in two villages) and still never climbed; half their dead
died in the arena, not from hunger. The one fallen census
village (9951, gone by day 26) never held garden magic at all.
Food is not the binding constraint on these bands; the climb
itself — regional politics — is missing from the competent
policy, and that is the wall in its plainest form.

## Telemetry deviation check (both corpora)

3 LOUD lines each (national 12->0, table 16->0, wins 16->0),
the KNOWN regime + field-shape artifact class: competent-only
pre-seat substrate with no seat instruments vs the WINSEAT
baseline. Baseline NOT rolled, no investigation item. The
callertag arm's own lesson stands as a finding: provenance
preregs must split instrument purity (unwrapped vs wrapped on
current master) from baseline currency, not judge a fresh sweep
against a day-old corpus on a hot tree.

## Infrastructure

Worktree registration slow (~5.5 min for the second tree),
not failed. Both arms rebased clean (spandraw once, onto the
callertag merge; callertag needed none — master had not moved).
Safe-commit index clobber hit all four worker commits (repaired
via HEAD-blob cacheinfo each time, commits verified correct);
no clobber on the coordinator commit. No EPERM flap this run.
check.js --quick NOT re-run: zero src/js, arm proofs are the
attributable verification (prior precedent). Loop A's trees
(sim-w5seq-a, sim-rule3trial-a, sim-fullseatgate-a) and all
gap-* / stale trees NOT touched. Main tree clean at closeout.

## Blanks filled or documented

FILLED:
- (1) Mover identity on this band/policy, current master:
  234/234 classified, exile counted 0 (cite the re-sweep
  corpus, not the 276 corpus, for the split).
- (2) Span-draw census on the competent surface: cultivate-only
  surface, 356 spans, 0 crossings, detector proven by the 9954
  replay control.

DOCUMENTED (open, for the backlog):
- (3) Span-draw class beyond cultivate stays OPEN — it needs a
  different instrument (scripted day-end probes per ability, or
  UI-driven play through app.js buttons), designed, not rushed;
  a forced-timing probe could manufacture crossings real play
  never makes. The dedup rule already scopes by span, not by
  ability, so it would cover such a span if a span log exists.
- (4) Stale-baseline rule for provenance arms (see telemetry
  section).
- (5) "All assisted" claims must name their corpus (2 honestly
  ordinary deposits on drifted 9761).
- (6) Arena as top killer on both bands (7/21, 16/32) — food is
  not the binding constraint here; wall work's look, outside
  this axis.
- (7) Tail-tick dating quirk: one 9953 death dated day 101 on a
  100d horizon (likely a post-horizon tick in the runDays tail);
  no verdict impact, flagged for harness owners.

food-economy stays converging (NOT converged): two ledger/
provenance blanks closed on their own terms, but the span-draw
class beyond cultivate is still open, no food-economy game fix
has landed from this axis, and the scale wall is untouched by
it. scale-onramp stays converging (untouched; sibling loop A).
Claim deleted; lock deleted.

Evidence: evidence/2026-10-27/sim-callertag-resweep-b.md +
prereg, evidence/2026-10-27/sim-spandraw-census-b.md + prereg.
Merged locally, pending ship.
