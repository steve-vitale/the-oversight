# journey-landing r71 — PRE-REGISTER (lane A, leg 0 LANDING, days 1–14 + tail)

**Run id:** laneA-landing-2026-11-01T23:45CST (scheduled 23:45 CST 2026-11-01).
Rotation read 0 → leg 0 LANDING; wrote 0→1 at run start, verified by read-back.
**Base:** master@cc6e3c5db at branch creation (local master ahead of origin/master
88feaec47 by the sim-sumconfirm-a merge, pending ship — normal).
**Driver:** scripts/journey-landing-r71-20261102.js — clone of the r42 driver
(labels/seeds/EVIDIR only) + one addition: a day-14 scholar pack + abilities
snapshot (`pack71`) in the census JSON. Diff verified by inspection: no
src/js, no src/data, no other driver logic touched.
**Gating freeze (2026-10-27 16:53) still stands** — no threshold changes.
**Perception law (2026-10-28):** instruments read-only; the driver only presses
offered menu items, never engine state.
**DELIVER OVER MEASURE (2026-11-01):** this is a stay-green + people-check run,
not a re-proof of the already-proven landing shape. A code change lands ONLY
if the fix gate below is met.

## Standing context (read before scoring)
- Last landing run: r42 (2026-10-23). Since then the loot/abilities build
  shipped (2026-10-31: every designed loot item earnable, ruins carry gear,
  villager field fights extended, weaponless villagers self-craft), plus
  armor/hide/teaching/contest-death/knowledge-ledger landings. Landing has
  not been played since those builds — a fortnight stay-green check is the
  honest reason for this run, not a new measurement campaign.
- r42 verdicts: System d8 all seeds; request/village/personal thread fizzles
  found and fixed (3 fixes, proof 5/5); 'more' continuer never offered in
  landing (vacuous gate — revised below); 0 fabricated history; pantries
  held 21k+; no starvation.

## Leg questions (binding)
1. **STAY-GREEN (report + gates):** fresh quad 601–604, r42 instrument clone,
   policy competent PINNED, FAVOR_ACCEPT default ON, horizon 14d, death-aware
   stop (+10d tail). Gates per seed:
   - System contact day ≤ 10.
   - Death liturgy exact: grief beats == villager deaths, 0 headcount codas.
   - Theft rate 0 (caughtRedHanded == 0).
   - Self-sufficiency: mean produced/expected across living villagers on the
     last series day ≥ 0.70, and 0 starvation deaths (starvAutopsies empty).
   - Plenty-voice present (plentyVoiceLines ≥ 1).
   PILOT GATE: seeds 601+602 run first; if either crashes or systemDay is
   null, STOP and report.
2. **PEOPLE CHECK (sense law — transcripts read in full):** all sittings from
   the pilot + main seeds judged on meaning, coherence, relevance,
   consequences — never just exchange counts. Gates: 0 depth fizzles
   (dry admission at depth ≤ 1 after a pursued continuer), 0 fabricated
   shared history. Depth gate REVISED per r42 metric review: gate on
   pursued continuers (dlg:more/goon) reaching depth ≥ 2 in ≥ 25% of
   sittings where a continuer was pursued (r42 observed 3/37 shallow by
   construction — the bar is descriptive, a miss is reported not fixed
   unless a fizzle is found).
3. **LOOT/ABILITIES REACH (new work, report-only unless the fix gate is
   met):** does the 2026-10-31 build reach the fortnight? From each seed's
   own census: abilityOfferLog (grants), pack71 (day-14 scholar pack),
   monsterKills, fleshArc. Report: any pack item outside the cross-seed
   common set (earned gain), any loot/gear item in a pack, any field-fight
   ability use visible in transcripts/capture. 0 gains with 0 monster
   kills = no opportunity, not a defect; 0 gains DESPITE kills/drops is
   named as an observation for the next run.

## Fix gate
Land a code change ONLY if ALL hold: (a) the finding is a senseless defect
(dead end, unfireable beat, contradictory numbers, fizzle) — not a tuned bar
or a fair loss; (b) a runnable before/after proof test exists in
scripts/test-*.js; (c) the relevant existing suite stays green. Otherwise
document and move on.

## Metric review
- (Filled at closeout. Pre-registered metrics bind this run; a miss is
  NO-GO, never re-scored against a friendlier metric mid-run.)

## Infra notes (at prereg time)
- worktree-register.sh took ~6.5 min (git worktree add checkout crawls
  through the huge evidence/ tree under heavy parallel load; a concurrent
  reap held the registry flock for ~5 min first). Register exit 0.
- Pre-flight reap was skipped after its flock wait: a sibling reap (05:38Z)
  held the flock with a git status in D-state; my reap was killed, not the
  sibling's. Active trees 13/16 at register time, so the cap was not at risk.
- Main tree was clean (0 lines) at pre-flight; HEAD moved 88feaec47 →
  cc6e3c5db during pre-flight when a sibling loop merged sim-sumconfirm-a
  locally (pending ship, not a push).
