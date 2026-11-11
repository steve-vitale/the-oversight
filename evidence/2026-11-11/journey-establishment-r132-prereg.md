# Journey leg ESTABLISHMENT — r132 pre-registration (2026-11-11, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84–r118/r128/r131
precedent). Death-aware: stop after 10 consecutive all-dead daily checks;
never tick a dead village to fill the leg.

## Run
Run id `playtest-loop-a-20261111T1245Z` (scheduled Wed 2026-11-11 12:45 CST).
Rotation read `1` (establishment); write `1→2` at closeout.
**Base:** local master `3b4aa8123` (Loop B vetphantom evidence landing).
Pre-flight deviations (LOUD):
- **Write-flap episode 18:46–19:01Z.** The pre-flight reaper's registry
  write failed with `PermissionError: [Errno 1] Operation not permitted`
  (atomic_write_json); worktree registration then failed 8× on
  `couldn't write '.../.git/refs/heads/journey-establishment.lock'`
  (probe writes to the same path succeed — the flap denies git's writes
  intermittently, windows seconds-long, ~1 success in ~150 probes).
  One failed git attempt left a 0-byte stale lock file behind (removed by
  hand after verifying no git process held it). Probe-gated per the
  flap-response skill (unique filename per attempt, unlink on every
  outcome): FLAP_CLEAR at 19:01:52Z on two consecutive 60s-apart passes
  (plain write + `git hash-object -w`); registration then succeeded
  first try. Lane B's r182 run hit the same flap at the same time (its own
  probe loops running). The reaper DID complete (exit 0) and removed one
  dead tree (`sim-proofrefresh-b`, at master HEAD, nothing lost) — see
  measurement-proof note below.
- `git pull --ff-only` at run start: "Already up to date" — the standing
  local/origin divergence r120–r131 reported is gone (ship loop
  reconciled since, or origin moved to match). Main tree clean; disk 32%.
**Lock:** created 18:43:35Z, run_id `2026-11-11T18:43:35Z`. Heartbeat loop
every 10 min once registered (first beat 19:06:04Z).
**Adoption first:** none — no dead Lane A run to close out (no stale
journey-establishment registry entry; r131 landed 2026-11-11).

## Leg question (named by r131's metric review)
r131 judged the cook/builder cap GO (cook moves 14/16, builder 3/16,
pace03 cook+builder 0) and left the standing question: **does the
preserver grant want the same first-of-the-day cap?** Ladder-wide pace03
on the r131 AFTER panel is 1 — Ayan the baker (seed 2312) went preserver
0→3 on 33 XP in 42 days — and racks pay per-batch with no cap. This run
IS that question: cap the preserver grant the same way and see whether
the race stops without braking the entry rung.

## Diagnosis (code + r131 panel data, verified pre-run — not invented)
- Grant sites (game.js): `butcher` 1 unit per hunt kill (6847);
  `preserver` n units per rack resolution (7406, n = batches preserved);
  `cook` 1 unit per cook resolution, capped first-of-day (7506);
  `builder` 1 unit per mend resolution, capped first-of-day (7564).
  All through `grantFoodXpCredit` (6700: first 5 XP 1:1, then 1 XP per
  2 units, odd unit carried).
- **Preserver races, butcher does not** (recomputed from the r131 AFTER
  panel files, 16 seeds): preserver pace03 = 1 (Ayan 0→33 XP, skill 3);
  butcher pace03 = 0 on BOTH panels (moves 18/17 cells, foodXp 194/196
  total — kills are rare enough that the 2:1 dial above rung 5 suffices).
  Per-seed moves on r131 AFTER: preserver 8/16, butcher 13/16.
- **Why the call-level cap is the right first dial for preserver:**
  Ayan's 33 XP came from 13 granting days / 18 granting resolutions
  (8 days × 1, 3 days × 2, 2 days × 3) — she preserves in bursts, and
  the 2nd/3rd resolutions of a day carry real units (fx delta per
  resolution 1–5). Panel-wide, 251 granting villager-days: 206 with
  exactly 1 granting resolution, 45 with 2–4. The cap removes only the
  2nd+ resolutions — the bursty days — and leaves single-resolution
  days untouched. The top preservers by XP (Owen 51, Clara 41, August
  35) all started with preserver skill > 0, so they don't count toward
  pace03; the cap slows their climb too, but it brakes the 0→3 race,
  not the entry rung.
- **Honest uncertainty (pilot decides):** a hypothetical daily
  preserver starting at 0 with ~3 batches every single day would still
  race under a call-level cap (units, not resolutions, are the fuel).
  No such villager exists on the r131 panel, but if the full panel
  shows one, the metric review names the next dial (a per-day UNIT
  cap), and this run's fix is NO-GO. The fix lands ONLY if Q1a passes.
- **Butcher is NOT capped in this run:** pace03 0 on both r131 panels
  is the evidence it doesn't race; capping it would brake the marginal
  movers for no measured gain (r127's flat-halving lesson).

## Fix (in the worktree, game.js preserver grant site only)
- **Preserver:** the rack-batch grant fires only on the FIRST
  preserver-granting resolution per villager per day, tracked as
  `foodXpDay.preserver` on the person record (same field/shape as the
  cook/builder caps). Later resolutions that day still preserve food
  (pantry, deeds, practice/competence all unchanged) — only the
  specialist XP is capped. Fiction: the first rack session of the day
  teaches; the rest is routine. Keyed to the GRANT event (inside
  `if (n > 0)`), not the cook resolution: a first resolution that
  preserves nothing leaves the day's grant open for a later resolution
  that does.
- **Butcher, cook, builder:** untouched. The rung (5/15/30) and
  askSpecialist (+1) UNCHANGED. No threshold, bar, price, or gate change
  (gating freeze 2026-10-27 stands).

## Bars (binding, §14 — no mid-run re-scoring)
- Q1a PRESERVER PACE03 (AFTER): GO iff preserver spec 0 at d1 → 3 at
  dEnd = 0 seeds (BEFORE: 1 — Ayan). pace03 ≥ 1 on AFTER is a NO-GO:
  the call-level cap doesn't stop the race; the next dial (per-day unit
  cap) is named in metric review, never re-scored here.
- Q1b PRESERVER MOVES (AFTER): ≥6/16 seeds with a preserver spec
  0→positive move (r131: 8/16 — the cap brakes the top, not the entry).
- Q1c BUTCHER UNTOUCHED (AFTER): butcher moves ≥10/16 seeds (r131:
  13/16) AND butcher pace03 = 0. Guards the panel/driver, not the fix.
- Q1d COOK/BUILDER NO REGRESSION (AFTER): cook moves ≥10/16 seeds
  (r131: 14/16), builder moves ≥2/16 (r131: 3/16), cook+builder
  pace03 = 0.
- Q1e SPOTTER GUARD: foodXp['spotter'] total = 0 on the AFTER panel.
- BEFORE-VALIDITY (binding): the BEFORE panel must show preserver
  pace03 ≥ 1 — the race reproduces on this band+driver. If BEFORE
  shows 0, the question is UNTESTED on this band (fix stays unproven;
  panel reported, not GO).
- Q2 INVITATIONS: (a) GAME OFFER — every invitation-owned menu offers
  betrayal:accept + betrayal:decline. (b) DRIVER ANSWER — ≥80% of
  offered invitations answered. Accept rate reported, not barred.
  0 invitations offered = no-data, report, do not pass or fail.
- Q3 NULL LINES: 0 literal THEM: (null) lines across the panel convo
  files.
- M3 survival-42 ≥12/16; M4 0 starvation deaths ≥12/16 (r116 bars
  carried at full scale).

## Seeds, policy, horizon
Seeds: **fresh band 2401–2416** (see freshness below). Policy:
competent + withDelegate + HUNTSTAFF=2. Horizon 42d. BEFORE/AFTER pair on
the SAME band (§15 balanced panel): BEFORE driver on current master (fix
off), AFTER driver on the fixed tree (fix on).
Driver: `scripts/journey-establishment-r132-20261111.js` (r131 driver
clone — tag rename + seed band; the dEnd foodXp fallback stays; cookLog
already records fxPreserverBefore/After per cook resolution, which is
the cap check's raw material).
Analyzer: `scripts/analyze-journey-establishment-r132-20261111.py`
(r131 analyzer clone + preserver pace03 verdicts + cap check from
cookLog: max granting resolutions per villager-day ≤ 1 on AFTER).
Proof test: `scripts/test-journey-establishment-r132-preserver-cap.js`
(proves the cap end to end on the live game: two rack resolutions same
day → second grants 0 preserver XP; next day grants again; cook grant
unaffected; butcher grant unaffected; det-gate: same driver fix-off vs
fix-on, 5d seed 2401 — funnel keys and practice snapshots identical
except foodXp preserver deltas).

## Seed-band freshness (skill: local_seed_band_freshness)
- **Chosen band 2401–2416**, verified fresh across ALL dated preregs:
  word-boundary grep (`240[1-9]`, `241[0-6]`) over `evidence/` + `docs/`
  returns only data values (kcal counts 2405/2415/2410/2407 in Oct 13–14
  JSONs — pantry/food quantities, never seeds); seed-context grep
  (`seed…24xx`, `SEEDS=24xx`) over `evidence/` + `scripts/` returns
  **0 hits**; filename hits are substring collisions only (`12401–
  12412` blockscreen corpora, `s3702413` compound-feast files, a case
  hash containing `2410…` — none is seed 2401–2416); no corpus files
  for these seeds exist.
- Contaminated bands NOT reused: 1502, 1504, 1603, 1604, 17101–17112
  (r112–r116 matched reuse); 1142–1151 (r121 landing); 1801–1804 (r117
  pilot); 1901–1916 (r118 panel); 2001–2010 (landing r107–r115 bands);
  2101–2116 (r127 panel); 2201–2216 (r128 panel); 2301–2316 (r131 panel);
  100001–100008 (r129 deepening).

## Canon
docs/CANON.md + docs/PRESERVATION.md read at run start (this run).
PRESERVATION.md covers the smoking ladder (16 ticks, 0.95x known /
0.80x blind, 30d shelf) and the no-creation rules — the fix touches
only the PRACTICE CREDIT a rack resolution awards, not yields, shelf,
or time, so no canon rule is moved. No canon doc covers the specialist
ladder's grant rate — Q1 rests on code (`src/js/food.js` SPECIALTIES +
rung 5/15/30; `src/js/game.js` resolveOneAssignment grant sites) +
panel, not invented canon. docs/DIRECTIVES.md re-read (hard rule). No
gate/price/threshold change.

## People check
Read the held convos from the panel in full (same method as
r114–r118/r127/r128/r131). Standing watch: the r131 people-check items —
taken-kin pod-dream closing sentence (9× in three wordings); "Something
in them almost softens — then doesn't. Not yet." (8×); "They hear the
warmth in it." (6×); deflect pivot "Sorry — I shouldn't load that on
you. What's up?" (6×); field-teaching closer "Remember the leaf, the
stem, the smell — that's the whole of it." (9×); quiet-place walk outcome
"shows you where they go to think. 'Don't tell the others. Everyone
needs one place.'" (6×); stockpile outcome "Take half. You've got the
hands for it." (2×); gossip closer "Take it for what it's worth." (8×);
**accept-then-back-out (2×: Hassan 2303, Magnus 2311 — accept "All right.
Let's go." then the outcome immediately says "Maybe not today. The
fire's got me.")**; **stitched openings (2×: Kai 2306 "Okay, but what
about Can I tell you something?"; Ablade 2316 two favours at once)**.
Note whether they recur; a fix is out of this run's prereg scope unless
the mechanism turns out to be the grant path (it is not — the fix
touches XP credit only). The accept-then-back-out and stitched openings
are conversation-flow defects to be fixed by a later run if they recur.

## Gating freeze (2026-10-27 16:53) stands
No threshold, bar, price, or gate change in this run. Perception law
(2026-10-28) stands — all instruments read-only; pickers press offered
menu items only. The invite-answer rule reads the live trust map only.

## Pilot gate
4 seeds first (2401–2404), BOTH drivers, 42d. The pilot validates (a)
seeds run on both drivers; (b) practice snapshots present in census JSON
(d1/d14/d28/dEnd, non-null competence maps, specialist fields present,
dEnd foodXp fallback reading live values); (c) the cap fires on AFTER
(max 1 granting preserver resolution per villager-day; BEFORE shows >1
on at least one villager-day — the mechanism's room); (d) the AFTER
pilot shows preserver XP > 0 on ≥2/4 seeds AND no trajectory breakage
(deaths/pantry within a few of BEFORE on matched seeds); (e) convo files
written (4 held convos per driver); (f) the invite rule fires at least
once OR 0 invitations offered (either is a valid pilot outcome — the
rule is exercised by the proof test regardless). If the pilot shows 0
preserver work, document and stop — do not burn a full panel on a dead
question. On pilot GO, run seeds 2405–2416 the same way on both drivers.

## Telemetry
The live baseline is the r131 BEFORE panel (competent + withDelegate +
HUNTSTAFF=2, seeds 2301–2316). This run's driver is the SAME regime on a
fresh band, so guardrails should stay quiet; any LOUD line is adjudicated
as band noise vs real bug BEFORE rolling the baseline forward. Run the
telemetry check at closeout.

## Measurement-proof refresh (owed)
Still owed since r129. `scripts/balance-proof-update.js` takes a
retained real observer-neutral panel as its argument — it validates and
installs one, it does not generate one — and no fresh retained panel
exists yet. The sim-proofrefresh-b4 panel was the in-flight candidate;
its tree (`sim-proofrefresh-b`) was removed by this run's pre-flight
reaper (heartbeat 4h+ stale, at master HEAD, branch kept — check the
registry for whether its panel was retained in evidence before the
removal). This run lands src/js (game.js grant site) — attempt the
refresh at closeout if a retained panel exists; if none exists, report
it as still owed with the reason, do not silently deepen the debt, and
do not run a competing panel in this lane.

## Metric review (filled at closeout, never mid-run)
- (to be filled)
