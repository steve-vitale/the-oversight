# Journey leg ESTABLISHMENT — r117 pre-registration (2026-11-09, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84–r116 precedent).
Death-aware: stop after 10 consecutive all-dead daily checks; never tick a
dead village to fill the leg.

## Run
Run id `playtest-loop-a-20261109T1445Z` (scheduled Mon 2026-11-09 08:45 CST).
Rotation read `1` (establishment); write `1→2` at closeout.
**Rotation discrepancy (recorded, not resolved):** r116's note says it wrote
`1→2` at closeout, and r121's note says it read `0` at its start — yet the
file read `1` at this run's start. The writes evidently did not stick in
order (r116 landed after r121 started; its rung fix `507e4e8fc` is NOT in
r121's base `5e79679e4`). This run plays the leg the file names
(establishment) and writes `2` at closeout; the next run should sanity-check
the file against the last two run notes.
**Adoption first:** this run's first half closed out the dead r121 landing
run (lock `playtest-loop-a-20261109T1245Z`, heartbeat 32 min stale, no live
process) — see `evidence/2026-11-09/journey-landing-r121.md`, "Adoption
closeout" section, and master `ae7daf40c`. This run's base is that master.
**Base:** master `ae7daf40c` (r121 landed: curious first-reveal guard +
outingchain analyzer fix).

## Leg questions (named by r116's metric review + people check)
r116 landed the steeper rung (5/15/30) and went GO on pace (7→4, bar ≤4,
**on the bar's edge**) and FIXED on null THEM lines. It was played on the
SAME 16 seeds as r112–r115. This run is a **fresh-seed regression pilot**,
not a re-proof of the rung: new seeds, current master, one panel.

**Q1 — PACE REGRESSION CHECK.** Does pace03 hold at ≤4 on fresh seeds?
r116's metric review: "If pace regresses on the next panel, the next dial
is the grant rate itself (how much credit a rack batch or a hunt kill
awards)… Do not re-run the rung." The pilot judges the pace on 4 fresh
seeds at pilot scale.
**Q2 — INVITATIONS OFFERED AND NEVER ANSWERED.** r116's people check: 14
invitation lines across the panel ("Walk my trap line with me?", "Come see
what I found. You won't believe it.", "Walk with me?", "Come get air with
me") and in every case the conversation moves on without an answer — the
villager offers something real and nothing comes of it. The defect is
carried since scale r112. The pilot measures whether it recurs on fresh
seeds on current master, reads the mechanism, and fixes it if the mechanism
is visible and small; otherwise documents the cases for the next run.
**Q3 (standing) — NULL THEM LINES.** r116 FIXED (0). Regression check on
the pilot's convo files.

## Bars (binding, §14 — no mid-run re-scoring)
- Q1 PACE (pilot scale): GO iff (a) moves (seeds with a specialist
  0→positive move, d1→dEnd) ≥2/4 AND (b) pace03 (villager, spec-task cells
  0 at d1 → 3 at dEnd) ≤1 on the 4-seed panel. (r116 rates: moves 9/16,
  pace03 4/16 = 0.25/seed; 4 seeds → expect ≤1.) pace03 ≥2 is a REGRESSION
  SIGNAL: full 16-seed panel next run, next dial the grant rate.
- Q2 INVITATIONS: if ≥1 invitation line appears in the pilot convos and 0
  are answered, the defect is CONFIRMED live — investigate the mechanism
  and fix if small, else document. If an invitation IS answered, report
  the case (defect changed) and do not fix.
- Q3 NULL LINES: 0 literal THEM: (null) lines across the pilot convo files.
- M3 survival-42 ≥3/4; M4 0 starvation deaths ≥3/4 (pilot-scale carries of
  r116's M3/M4 bars 12/16).

## Seeds, policy, horizon
Seeds: **fresh band 1801–1804** (pilot; see freshness below). Policy:
competent + HUNTSTAFF=2 (same as r116). Horizon 42d. Single panel on
current master — no before/after pair (no fix is built yet; if Q2 yields
a fix, the before/after pair is that fix's proof, run on the same seeds).
Driver: `scripts/journey-establishment-r117-20261109.js` (r116 driver
clone — tag rename only; neutrality by construction, same as r116).
Analyzer: `scripts/analyze-journey-establishment-r117-20261109.py` (small
focused reader for this pilot's census + convo files: pace/moves from
practice snapshots d1→dEnd, invitation count + answer check from convo
files, M3/M4 from census fields; NOT a clone of the r116 16-seed
before/after analyzer, which is the wrong shape for a 4-seed single
panel).

## Seed-band freshness (skill: local_seed_band_freshness)
- **Chosen band 1801–1804**, verified fresh across ALL dated preregs:
  word-boundary grep for `\b180[1-4]\b` over `evidence/*/sim-*-prereg.md`
  and `evidence/*/journey-*-prereg.md` returns **2 matches, both
  incidental** ("src/js/abilityActions.js:1799-1801" in
  sim-thiefhall-b-prereg.md — a code line range, not a seed naming;
  "convo-wants.js:1802" in journey-deepening-r113-prereg.md — a code
  line reference, not a seed naming) and **0 seed namings**. No range
  "1801–1804" is named anywhere. The forbidden-band list
  (hidden_files/sim-heraldband-pilot-prereg-2018.md) names nothing in
  this band (grep for 180x/181x: 0 hits).
- No corpus files for these seeds exist (no establishment-r117-* dir yet).
- Contaminated bands NOT reused: 1502, 1504, 1603, 1604, 17101–17112
  (r112–r116 matched reuse); 1142–1151 (r121 landing); all bands named
  in the r121 prereg's contaminated list.

## Canon
docs/CANON.md read at run start (r121 adoption). No canon doc covers the
invitation answer path or the specialist ladder's grant rate — Q1 rests on
code (`src/js/food.js` specialistSkill rung 5/15/30, rack/hunt grant
sites, per the r116 prereg mechanism check) + panel, not invented canon.
Q2 rests on the conversation engine (`src/js/conversation.js`,
`src/js/convo-wants.js`) + panel transcripts.

## People check
Read the held convos from the pilot panel in full (same method as
r114–r116). Standing watch: the r115 menu-hygiene note (betrayal menu as
a standing stall option) and the scale r112 raise-talk defects — note
whether they appear; a fix is out of this run's prereg scope unless Q2's
mechanism turns out to be the same path.

## Gating freeze (2026-10-27 16:53) stands
No threshold, bar, price, or gate change in this run. Perception law
(2026-10-28) stands — all instruments read-only; pickers press offered
menu items only.

## Pilot gate
4 seeds, current master, 42d. The pilot validates (a) seeds run; (b)
practice snapshots present in census JSON (d1/d14/d28/dEnd, non-null
competence maps, specialist fields present); (c) ≥1 forage/preserve
favor observed or the leg's food work visible (racks firing, hunts);
(d) convo files written (4 held convos). If the pilot shows 0 food work,
document and stop — do not burn a full panel on a dead question.

## Metric review (filled at closeout, never mid-run)
- (to be filled)
