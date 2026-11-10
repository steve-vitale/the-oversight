# Journey leg ESTABLISHMENT — r128 pre-registration (2026-11-10, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84–r118 precedent).
Death-aware: stop after 10 consecutive all-dead daily checks; never tick a
dead village to fill the leg.

## Run
Run id `playtest-loop-a-20261110T2045Z` (scheduled Tue 2026-11-10 14:45 CST).
Rotation read `1` (establishment); write `1→2` at closeout.
**Base:** local master `febe01d6b` (sim-counterclose-a GO + evidence).
Pre-flight deviations (LOUD, standing state): `git pull --ff-only` FAILED —
local master diverged from origin/master (ahead 472, behind 156; same
standing state as r120–r123/r127/r167; ship loop owns reconciliation).
Proceed on local master. Main tree clean; disk 32%.
**Lock:** created 20:46:34Z, run_id `2026-11-10T20:46:34Z`. Heartbeat loop
`/tmp/hbloop-r128.sh` (every 10 min); registration took ~3 min (slow
checkout, no flap).
**Adoption first:** none — no dead Lane A run to close out (registry shows
no stale journey-establishment entry; r127 landed 2026-11-10 as
`586ef734a`). This run starts clean.

## Leg question (named by r127's metric review + open items)
r127's full 16-seed panel judged the flat halving dial NO-GO (moves 6/16,
racers removed but marginal moves lost) and named the next dial: **halve
only above the first 5 XP — the first rung at full rate**. This run IS
that dial.

**Q1 — GRANT-RATE DIAL (a), BEFORE/AFTER ON THE SAME FRESH BAND.** The
fix credits routine-work grants at full rate up to the first rung (5 XP),
then 1 XP per 2 units above it, with the odd unit carried so no work is
lost:
- preserver (rack resolution, game.js): `foodXp.preserver += n` becomes
  `grantFoodXp(person, 'preserver', n)` — first 5 XP at 1 XP/batch, above
  5 XP at 1 XP per 2 batches, odd batch carried on the person record
  (`foodXpRemainder.preserver`).
- butcher (hunt kill, game.js): `foodXp.butcher += 1` per kill becomes
  `grantFoodXp(_hp, 'butcher', 1)` — same rule; a kill at 5+ XP credits
  1 XP per 2 kills, odd kill carried (`foodXpRemainder.butcher`).
- askSpecialist (food.js, +1 per use) UNCHANGED — direct teaching, not
  routine work.
- The rung (5/15/30, r116) UNCHANGED. No threshold, bar, price, or gate
  changes (gating freeze 2026-10-27 stands).
Shape check (r127 band arithmetic, NOT the judge): Lisa 57→31 (still a
racer, pace03 ≈ 1), Melissa 31→18, Ananya 44→24; marginal movers kept —
Amelia 9→7 (spec 1), Sarah butcher 6→5 / preserver 8→6 (spec 1 both) —
predicted moves 8/16 on the r127 band. The fresh band is the judge, not
the prediction.
**Q2 — INVITATIONS (standing).** r127 PASS both halves (20/20 menus,
18/20 = 90% answered). Re-measured with the driver answer rule and the
analyzer denominator fix in place.
**Q3 (standing) — NULL THEM LINES.** r116 FIXED (0), r117–r127 held (0).
Regression check on the full panel's convo files.

## Bars (binding, §14 — no mid-run re-scoring)
- Q1 PACE (16 seeds, AFTER panel): GO iff (a) moves (seeds with a
  specialist 0→positive move, d1→dEnd) ≥8/16 AND (b) pace03 (villager,
  spec-task cells 0 at d1 → 3 at dEnd) ≤4/16. pace03 ≥5 on AFTER is a
  NO-GO: the dial is insufficient; the next dial is named in metric
  review (per-day cap, or a lower above-rung rate), never re-scored here.
- BEFORE-VALIDITY (binding, REVISED per r127 metric review): the BEFORE
  panel must show pace03 ≥3 on this band, else the run is UNTESTED on
  the dial (no regression to fix here) — the fix stays unproven and the
  panel is reported, not GO. (Revision: the ≥5 bar was designed for the
  "no regression at all" case; r127 reproduced at 3. This run adopts
  ≥3; the revision is recorded here before the run, not mid-run.)
- Q2 INVITATIONS: (a) GAME OFFER — every invitation-owned menu on the
  panel offers betrayal:accept + betrayal:decline (any menu missing
  either is a game defect, fix in run). (b) DRIVER ANSWER — ≥80% of
  offered invitations answered (accept or decline; silence is the miss).
  Accept rate reported, not barred. If 0 invitations are offered, Q2 is
  no-data — report, do not pass or fail.
- Q3 NULL LINES: 0 literal THEM: (null) lines across the panel convo
  files.
- M3 survival-42 ≥12/16; M4 0 starvation deaths ≥12/16 (r116 bars 12/16
  carried at full scale).

## Seeds, policy, horizon
Seeds: **fresh band 2201–2216** (see freshness below). Policy:
competent + HUNTSTAFF=2 (same as r116/r117/r118/r127). Horizon 42d.
BEFORE/AFTER pair on the SAME band (§15 balanced panel): BEFORE driver
on current master (fix off), AFTER driver on the fixed tree (fix on).
Driver: `scripts/journey-establishment-r128-20261110.js` (r127 driver
clone — tag rename + seed band only).
Analyzer: `scripts/analyze-journey-establishment-r128-20261110.py`
(r127 analyzer clone: 16 seeds; hunt-kills fix + invite denominator fix
kept).
Proof test: `scripts/test-journey-establishment-r128-grant-rate.js`
(proves dial (a) end to end on the live game: full-rate headroom to 5
XP, 2:1 above with odd-unit carry, askSpecialist still +1, rung
5/15/30 unchanged; control: no-credit paths grant 0).

## Seed-band freshness (skill: local_seed_band_freshness)
- **Chosen band 2201–2216**, verified fresh across ALL dated preregs:
  word-boundary grep for seed namings of `2201–2216` over
  `evidence/*/sim-*-prereg.md`, `evidence/*/journey-*-prereg.md` and
  `evidence/2026-11-10/*.md` returns **0 seed namings**. The only
  `2201` hits repo-wide are inside old JSON corpora
  (evidence/2026-10-13/sim-wave5-b.json, plentyb-sweep.json,
  teachC-after.json, teachC-baseline.json, sim-quiet-links-*.json;
  evidence/2026-10-14/sim-buildfund.json, sim-fourthlink-base.json,
  rotcal-a.json/.log) as data values, and no `"seed": 2201` /
  `seed: 2201` / `seed 2201` value exists anywhere under evidence/.
  The forbidden-band list
  (hidden_files/sim-heraldband-pilot-prereg-2018.md) names nothing in
  this band (grep for 220: 0 hits).
- No corpus files for these seeds exist (`ls evidence/2026-11-10/ |
  grep 220[1-9]|221[0-6]` empty).
- Contaminated bands NOT reused: 1502, 1504, 1603, 1604, 17101–17112
  (r112–r116 matched reuse); 1142–1151 (r121 landing); 1801–1804
  (r117 pilot); 1901–1916 (r118 panel); 2001–2010 (landing r107–r115
  bands); 2101–2116 (r127 panel).

## Canon
docs/CANON.md + docs/PRESERVATION.md read at run start (this run).
PRESERVATION.md covers the smoking ladder (16 ticks, 0.95x known /
0.80x blind, 30d shelf) and the no-creation rules — the dial touches
only the PRACTICE CREDIT a rack batch / hunt kill awards, not yields,
shelf, or time, so no canon rule is moved. No canon doc covers the
specialist ladder's grant rate — Q1 rests on code (`src/js/food.js`
specialistSkill rung 5/15/30; `src/js/game.js` rack/hunt grant sites,
per the r116 prereg mechanism check) + panel, not invented canon.
docs/DIRECTIVES.md re-read (hard rule). No gate/price/threshold change.

## People check
Read the held convos from the panel in full (same method as
r114–r118/r127). Standing watch: the r127 people-check items —
taken-kin pod-dream closing sentence (10× in two fixed wordings);
"Something in them almost softens — then doesn't. Not yet." (9×);
deflect pivot "Sorry — I shouldn't load that on you. What's up?" (9×);
favour-requirements line "Move next to them, on the same side of the
Haven door, to help." (7×); trust answer "I'll tell you what I tell
everyone: watch what I do when nobody's watching..." (4×, new in
r127); System party-name pool (FINAL GIRLS CLUB suggested 4×);
gossip verbatim repeat (Deepa/Moot, 2102). Note whether they recur; a
fix is out of this run's prereg scope unless the mechanism turns out to
be the grant path (it is not — the dial touches XP credit only).

## Gating freeze (2026-10-27 16:53) stands
No threshold, bar, price, or gate change in this run. Perception law
(2026-10-28) stands — all instruments read-only; pickers press offered
menu items only. The invite-answer rule reads the live trust map only.

## Pilot gate
4 seeds first (2201–2204), BOTH drivers (BEFORE on current master,
AFTER on the fixed tree), 42d. The pilot validates (a) seeds run on
both drivers; (b) practice snapshots present in census JSON (d1/d14/
d28/dEnd, non-null competence maps, specialist fields present, dEnd
foodXp fallback reading live values); (c) the BEFORE pilot shows the
pace shape (≥1 racer or high-XP preserver/butcher — else the band may
not exercise the dial; see BEFORE-validity); (d) convo files written
(4 held convos per driver); (e) the invite rule fires at least once OR
0 invitations offered (either is a valid pilot outcome — the rule is
exercised by the proof test regardless). If the pilot shows 0 food
work, document and stop — do not burn a full panel on a dead question.
On pilot GO, run seeds 2205–2216 the same way on both drivers.

## Telemetry (owed from r127)
Seed a fresh current-policy baseline (HUNTSTAFF=2, 16 seeds) from this
run's BEFORE panel — the r108 4-seed gate-off control no longer
describes the regime. Run the telemetry check at closeout; adjudicate
any LOUD line as fix effect vs real bug BEFORE rolling the baseline
forward; do not silently roll forward on LOUD lines.

## Metric review (filled at closeout, never mid-run)
- (to be filled)
