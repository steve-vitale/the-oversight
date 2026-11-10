# Journey leg ESTABLISHMENT — r127 pre-registration (2026-11-10, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84–r118 precedent).
Death-aware: stop after 10 consecutive all-dead daily checks; never tick a
dead village to fill the leg.

## Run
Run id `playtest-loop-a-20261110T1145Z` (scheduled Tue 2026-11-10 05:45 CST).
Rotation read `1` (establishment); write `1→2` at closeout.
**Base:** local master `5db4f6fef` (sim-answermail-a ADOPT + LAND).
Pre-flight deviations (LOUD, standing state): `git pull --ff-only` FAILED —
local master diverged from origin/master (ahead 401, behind 156; same
standing state as r120–r123/r167; ship loop owns reconciliation). Proceeded
on local master. Main tree clean; disk 30%.
**Lock:** created 11:43:39Z, run_id `2026-11-10T11:43:39Z`. Heartbeat loop
`/tmp/hbloop-r127.sh` (PID 54006, every 10 min); registration took ~7 min
(slow checkout, no flap).
**Adoption first:** none — no dead Lane A run to close out (registry shows
no stale journey-establishment entry; r118 landed 2026-11-09 as
`cc0726591`). This run starts clean.

## Leg question (named by r118's metric review + open items)
r118's full 16-seed panel on fresh seeds CONFIRMED the pace regression:
**pace03 7/16** (Priya 1901, Nolan 1904, Benoit 1907, Brendan 1908, Gina
1911, Alex 1916, Francesca 1916 — preserver 6, butcher 1), rate 0.44/seed
vs r116's 0.25/seed. Per the binding prereg the verdict is final: **the
next dial is the grant rate** (how much credit a rack batch or a hunt kill
awards). Do not re-run the rung. This run IS that dial.

**Q1 — GRANT-RATE DIAL, BEFORE/AFTER ON THE SAME FRESH BAND.** The fix
halves the routine-work grant rate for the two racing sites, with an
odd-unit carry so no work is lost:
- preserver (rack resolution, game.js): `foodXp.preserver += n` (n =
  stacks preserved in the resolution) becomes credit-n, 1 XP per 2
  batches; the odd batch carries on the person record
  (`foodXpRemainder.preserver`).
- butcher (hunt kill, game.js): `foodXp.butcher += 1` per kill becomes
  1 XP per 2 kills, same carry (`foodXpRemainder.butcher`).
- askSpecialist (food.js, +1 per use) UNCHANGED — direct teaching, not
  routine work, and the review names only the rack batch + hunt kill.
- The rung (5/15/30, r116) UNCHANGED. No threshold, bar, price, or gate
  changes (gating freeze 2026-10-27 stands).
Shape check (r118 racers, halved): Brendan 72→36, Benoit 68→34 (still 3),
Francesca 55→27, Priya 37→18, Gina 41→20, Nolan 30→15 — predicted
pace03 ≈ 2/16 on the r118 band. The fresh band is the judge, not the
prediction.
**Q2 — INVITATIONS (standing).** r118 PASS both halves (17/17 menus,
12/13 spoken lines). Re-measured with the driver answer rule in place
and the analyzer denominator fix (count menus presented, not spoken
lines — r118 metric review owed item).
**Q3 (standing) — NULL THEM LINES.** r116 FIXED (0), r117 held (0),
r118 held (0). Regression check on the full panel's convo files.

## Bars (binding, §14 — no mid-run re-scoring)
- Q1 PACE (16 seeds, AFTER panel): GO iff (a) moves (seeds with a
  specialist 0→positive move, d1→dEnd) ≥8/16 AND (b) pace03 (villager,
  spec-task cells 0 at d1 → 3 at dEnd) ≤4/16. pace03 ≥5 on AFTER is a
  NO-GO: the dial is insufficient; the next dial is named in metric
  review (3:1 rate or a per-day cap), never re-scored here.
- BEFORE-VALIDITY (binding): the BEFORE panel must show pace03 ≥5 on
  this band, else the run is UNTESTED on the dial (no regression to fix
  here) — the fix stays unproven and the panel is reported, not GO.
- Q2 INVITATIONS: (a) GAME OFFER — every invitation-owned menu on the
  panel offers betrayal:accept + betrayal:decline (proof-tested by the
  r118 proof test; any menu missing either is a game defect, fix in
  run). (b) DRIVER ANSWER — ≥80% of offered invitations answered
  (accept or decline; silence is the miss). Accept rate reported, not
  barred. If 0 invitations are offered, Q2 is no-data — report, do not
  pass or fail.
- Q3 NULL LINES: 0 literal THEM: (null) lines across the panel convo
  files.
- M3 survival-42 ≥12/16; M4 0 starvation deaths ≥12/16 (r116 bars 12/16
  carried at full scale).

## Seeds, policy, horizon
Seeds: **fresh band 2101–2116** (see freshness below). Policy:
competent + HUNTSTAFF=2 (same as r116/r117/r118). Horizon 42d.
BEFORE/AFTER pair on the SAME band (§15 balanced panel): BEFORE driver
on current master (fix off), AFTER driver on the fixed tree (fix on).
Driver: `scripts/journey-establishment-r127-20261110.js` (r118 driver
clone — tag rename + the owed dEnd foodXp fallback: snapshot reads
`p.foodXp` (live getPerson record) first, `vp._src.foodXp` second; the
r118 dEnd misread is an instrument defect, not game state).
Analyzer: `scripts/analyze-journey-establishment-r127-20261110.py`
(r118 analyzer clone: 16 seeds; hunt-kills fix kept; invite denominator
fix — count invitation-owned menus presented, not spoken lines alone).
Proof test: `scripts/test-journey-establishment-r127-grant-rate.js`
(proves the halved grant + carry end to end on the live game: preserver
credit converts 2 batches → 1 XP with the odd batch carried; butcher
credit converts 2 kills → 1 XP with the odd kill carried; askSpecialist
still +1; rung 5/15/30 unchanged; control: no-credit paths grant 0).

## Seed-band freshness (skill: local_seed_band_freshness)
- **Chosen band 2101–2116**, verified fresh across ALL dated preregs:
  word-boundary grep for `210[1-9]|211[0-6]` over
  `evidence/*/sim-*-prereg.md` and `evidence/*/journey-*-prereg.md`
  returns **0 seed namings**: the only `2103` hits are timestamps
  ("2103Z") and counts ("totals ROSE (2103 vs 2095)") in
  sim-awaynaming-rereg-a-prereg.md and sim-roleform-a-prereg.md. No
  range "2101–2116" is named anywhere. The forbidden-band list
  (hidden_files/sim-heraldband-pilot-prereg-2018.md) names nothing in
  this band (grep for 210x: 0 hits).
- No corpus files for these seeds exist (`ls evidence/2026-11-10/ |
  grep 210[0-9]|211[0-6]` empty).
- Contaminated bands NOT reused: 1502, 1504, 1603, 1604, 17101–17112
  (r112–r116 matched reuse); 1142–1151 (r121 landing); 1801–1804
  (r117 pilot); 1901–1916 (r118 panel); 2001–2010 (landing r107–r115
  bands, named in their preregs — the 2001–2016 range is NOT fresh as
  a whole, which is why this run takes 2101–2116).

## Canon
docs/CANON.md + docs/PRESERVATION.md read at run start (this run).
PRESERVATION.md covers the smoking ladder (16 ticks, 0.95x known /
0.80x blind, 30d shelf) and the no-creation rules — the dial touches
only the PRACTICE CREDIT a rack batch awards, not yields, shelf, or
time, so no canon rule is moved. No canon doc covers the specialist
ladder's grant rate — Q1 rests on code (`src/js/food.js`
specialistSkill rung 5/15/30; `src/js/game.js` rack/hunt grant sites,
per the r116 prereg mechanism check) + panel, not invented canon.
docs/DIRECTIVES.md re-read (hard rule). No gate/price/threshold change.

## People check
Read the held convos from the panel in full (same method as
r114–r118). Standing watch: the r118 people-check items — taken-kin
template repeating verbatim across villagers; the favour-requirements
line reading like a system instruction ("Move next to them, on the same
side of the Haven door, to help."); "Something in them almost softens —
then doesn't. Not yet."; deflect pivot "Sorry — I shouldn't load that
on you. What's up?"; water-haul favour numbers repeating in one seed;
accept-then-bail variant (same line twice). Note whether they recur; a
fix is out of this run's prereg scope unless the mechanism turns out to
be the grant path (it is not — the dial touches XP credit only).

## Gating freeze (2026-10-27 16:53) stands
No threshold, bar, price, or gate change in this run. Perception law
(2026-10-28) stands — all instruments read-only; pickers press offered
menu items only. The invite-answer rule reads the live trust map only.

## Pilot gate
4 seeds first (2101–2104), BOTH drivers (BEFORE on current master,
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
On pilot GO, run seeds 2105–2116 the same way on both drivers.

## Metric review (filled at closeout, never mid-run)
- (to be filled)
