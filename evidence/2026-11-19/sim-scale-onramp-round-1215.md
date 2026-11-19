# sim-scale-onramp-round-1215 — bow supply chain, two DIAG arms

Run fleshout-20261119T1215Z, Loop A, axis scale-onramp. Base master
ebea87dfb (social r238 adoption); master moved once mid-run to
e1f002065 (journey-establishment r243 closeout) — both arm branches
rebased onto it before merging. No live Loop B run at start; no live
claims; main tree clean; disk 43%. Reaper ran at pre-flight (8/16
trees active, no dead trees removed; LOUD lines were other owners'
uncommitted trees, untouched). Worktree registration was slow
(~11 min for 2 trees, both `git worktree add` calls stalling under
load — same signature as the 0830Z run's 18-min registration, no
EPERM flap observed this run).

Arms taken from the 1115Z round's named next blank: the bow SOURCE
question (stash/armory 0 both legs on the speargate band).

## Arm 1 — sim-bowsource-a: DIAG-GO, MERGED

Commit f201ef2ee (rebased from cd427d770; proofs re-run green on the
rebased tip: test-bowsource-a 38/38, analyzer selftest 25/25).
Finding #2592 ANSWERED: bow supply is starting gear + arrivals;
craft never fires.

Fresh band 107001–107008, 150d, competent policy, SENSEEXPED
substrate (the bowopen band's LAUNCHPARTY sense is HELD-only, never
landed; the worker recorded the substrate switch as a dated prereg
addendum before any judged sim — no HELD cherry-pick ported).

- Bow sources (43 bows ever held): starting gear 28 (sling 10,
  crude_bow 7, bow 7, crossbow 4), crafted 0, looted 1 (alien),
  new arrivals holding one 11, unexplained 3 (non-earth).
  Attribution completeness 0.930 (bar ≥ 0.90).
- Bowless departures 128/161 (79.5%); wave-4 115/145. 0 of 128 had
  a bow source available — no own-stash bow, no armory bow, no
  craftable bow. 48 carried a spear (not volley-capable).
- Stash/armory: 0 bows on all 1,055 census rows; 0 deposited ever.
  40 bows disappeared, all 40 died with their holders. Village bow
  totals fall 28 → 2 by day 150.
- Craft: 0 events in 90 eligible-villager-days. Knowledge is
  misplaced — 1,138 of 1,228 knows-bow days sit on armed villagers
  the duty skips; materials are plentiful (pile branch on 86% of
  days). A crude_bow was pile-craftable on 39 of the 90 eligible
  days; still 0 attempts.
- Loot can't supply earth bows (alien table only): 373 drops,
  3 bows, all alien.
- Wall: national 0/8, wins 0/8, wave 4 8/8, wave 5 0/8, median
  survival 143d, community lost 6/8.
- Panel: null compare, review_required (zero deltas by
  construction).

The lever, named precisely: the home craft duty
(`villagerWeaponCraftDay`) has a double gate — weaponless-only (a
spear-armed fighter can never use it) + knowledge seeded only by
handling a finished bow (a villager who never held one can never
attempt one; the prereg's "blind attempt" was wrong, the code
requires level ≥ 1). Next arm: sim-bowcraft-a — serve ranged-less
(spear-armed) villagers and seed bow knowledge from seeing/being
taught, measured before/after on identical seeds 107001–107008.

Evidence: evidence/2026-11-19/sim-bowsource-a.md (+ prereg,
bowsource-a-analysis.json, panel files, 8 perseed corpora).

## Arm 2 — sim-arrowsupply-a: DIAG-NO-GO, MERGED

Commit 8ed9730a8 (rebased from d86510a55 via f0dae83b0 — the first
rebase landed before the bowsource merge, so a second rebase onto
f201ef2ee was needed; proofs re-run green after each rebase:
test-arrowsupply-a 52/52, analyzer selftest 28/28). Finding #2594
ANSWERED in the narrowed sense.

Fresh band 107021–107028, 150d, competent policy, SENSEEXPED
substrate (same prereg correction as arm 1, recorded before any
judged sim). Consequence: this band (32 launched meetings / 9
pair-inclusive) is not directly comparable to bowopen's (82 / 27).

- Zero-ammo departures: 1/31 (3.2%) — the only one: Aki Tanaka,
  107028 d83, crude_bow, blind departure craft failed with
  materials present. By weapon: sling 0/16, phase_sling 0/6,
  bow 0/4, crude_bow 1/4, crossbow 0/1. Spear departures 98/129
  (76% of ranged-holder departures; spears can never volley).
- pocketAmmo attempts/success/failures: departure craft 3 attempts
  (1 ok, 2 failed — only 1 failure produced a zero-ammo
  departure); 55 stones pocketed from the pile; 0 units ever drawn
  from a personal stash. Home duty: 92 attempts, 44 successes
  (48%); reasons: already-stocked 717, away 310, cooldown 86,
  craft-failed 48, no-materials 24, not-attempted-unknown 3. Tele
  cross-check exact (95 = 3 + 92).
- Ammo stock: bow-family carriers stocked ~85% of days (mean ~5);
  slings at zero 93.5% of days (mean 0.33); searcaster 100% zero —
  chen_wei, 97 census-days, 0 fusion cells ever, 0 acquisition
  events of any kind. Starting stock: 11 archers, all at zero.
- Volley-loss cost: unmeasurable — no population. 0/9
  pair-inclusive engaged meetings have an ammo-bearing fighter
  (spear 3, nothing 6); volley fired 0/9; the 2 armed expedition
  meetings (slings) both evaded. Damage/round 28.1, 0 kills.
- Wall: national 0/8, wins 0/8, wave-5 2/8, median survival 143.5d.
- Panel: review_required with zero deltas by construction.

Instrument note (disclosed by the worker): after the first sweep a
home-duty reason misclassification was repaired (938
not-attempted-unknown → already-stocked 717 / away 310 / cooldown
86, residual 3), the corpus deleted, and all 8 seeds re-run;
determinism verified — all 8 seeds reproduce identically, so the
repair changed labels only.

Lena's case is real but rare — the departure is not where the gap
lives (the home duty arms bow-holders first). The binding gaps are
sideways: fusion cells (no source at all) and slings living empty,
plus the launched-party fighter never being an archer. Next arms,
in order: (1) sim-fusioncell-a (DIAG: quantify fusion-cell supply;
if zero supply is confirmed, the fix arm adds a source — loot-table
weight vs ruin salvage is a design call, cells are alien tech);
(2) sim-slingstone-a (trace what drains carried stones between
departures). #2593 (misnamed "no arrows" line) was not re-observed;
still open from bowopen-a.

Evidence: evidence/2026-11-19/sim-arrowsupply-a.md (+ prereg,
arrowsupply-a-analysis.json, panel files, 8 perseed corpora).

## Findings filed this run

- #2592 ANSWERED (stays open) — spare-bow finding confirmed on a
  second band; lever is the craft duty's double gate.
- #2594 ANSWERED, narrowed — zero-ammo departure is rare (1/31);
  arrow supply is NOT the binding gap.
- NEW #2597 — the bow-craft verb never fires (0 attempts in 90
  eligible days).
- NEW #2598 — loot cannot supply earth bows (alien table only).
- NEW #2599 — a searcaster that can never fire (0 fusion cells,
  0 acquisition events); next arm sim-fusioncell-a.
- NEW #2600 — slings live empty (93.5% of days at zero stones).
- NEW #2601 — the launched-party fighter is never an archer
  (0/9 pair-inclusive meetings).
- NEW #2602 — the departure craft is vestigial (3 attempts in
  8 seeds; home duty out-produces it 44:1).

All in hidden_files/sim-findings.md (verified in place, 2603 lines).

## Gate

`node scripts/check.js --quick` on the merged tip 8ed9730a8 (full
log hidden_files/evidence/2026-11-19/check-quick-round-1215.log):
**337 passed, 7 failed in 1130s, 0 attributable.** The 7:
measurement-proof staleness pair + phone-frame stale receipt
(pre-existing master debt, same as the bowsource worker's base run
339/5) + four 120s timeouts (living-garden, one-person-army,
trust-observer, capable-bot — load artifacts). Solo-verified green
this run: capable-bot 40/40, trust-observer 6/6. The two
deed-attainment timeouts carry the same signature as the bowsource
worker's base run and sibling solo-verifications within the last
day; not re-proven this round. Ladder-bundle control: does not fire
(no "ladder" mentions in the gate log — the ladderbase-cause-a fix
holds). This run changed zero src/js, so no failure can be
arm-caused.

## Telemetry deviation check

REFUSED by the tool (recorder corpora carry anchorCommit — not
comparable against the run baseline), same documented refusal as
bowopen/1415Z/1515Z and the 1115Z round. Command run on the
bowsource corpus:
`node scripts/telemetry-check.js --baseline …/telemetry-baselines/scale-wall.json --current 'evidence/2026-11-19/perseed-bowsource-a-obs/*.json' --metrics national,table,wins,exiled`
→ "refusing recorder-corpus input: all 8 --current rows carry
top-level anchorCommit". No LOUD lines; baseline NOT rolled.

## Wall (this run's judged corpora, 32 configs)

National 0/16, table/wins 0/16, wave-4 unlock 8/8 both arms,
wave-5 0/8 bowsource / 2/8 arrowsupply, medians 143d / 143.5d.
The ranged opening is still untested as a fight lever — there is
nothing to stage with and, on the arrowsupply band, no archer in
the launched fights at all.

## Infrastructure

- Safe-commit index clobber struck both worker commits (repaired
  via the ls-tree -r | update-index --add --index-info pipe,
  hash-verified; commits correct).
- Rebase stop-at-pick quirk did NOT strike this run (both rebases
  1/1 clean; arrowsupply needed a second rebase only because the
  bowsource merge landed between its rebase and its merge).
- No EPERM flap this run. Registration slow (~11 min, load).
- No push, no bump, no live verification — merged locally,
  pending ship.

## Metric review

- Both arms pre-registered before any judged sim; both judged
  against their frozen bars. Bowsource DIAG-GO on its frozen bars
  (attribution completeness 0.930 ≥ 0.90); arrowsupply DIAG-NO-GO
  on its frozen bars (departure pool 31 < 50; encounter read 0 < 8;
  decisive-answer passed via the rare-rate path). Neither verdict
  was re-scored.
- Substrate correction (both arms): the prereg's LAUNCHPARTY line
  was wrong for this base — the sense fix is HELD-only; the live
  substrate is SENSEEXPED (landed 97e78670d). Amended before any
  judged sim in both preregs. Consequence recorded: neither band
  is directly comparable to bowopen's band.
- The per-100-lived-days cost-bar question (#2585) was NOT
  re-litigated here: both arms are DIAGs with frozen bars, and the
  cost bars passed on totals in both cases.

Scale-onramp stays converging (NOT converged): the bow supply chain
is now fully decomposed — starting gear + arrivals only, craft
never fires, loot is alien-only, arrows are a non-gap — but no
national, no table, no wins on either band, and the ranged opening
remains untested as a fight lever. The directive stands. Next
blanks, in order: (1) sim-bowcraft-a (craft duty double gate,
#2597); (2) sim-fusioncell-a (#2599); (3) sim-slingstone-a (#2600);
(4) the launched-party fighter composition question (#2601, party/
fightcap line). food-economy stays converging (untouched; sibling
B loop). Claim deleted; lock deleted.
