# Journey leg: DEEPENING (days 40–80) R87 — "SHIP ITEMS IN THE WILD" — 2026-11-02

## Pre-registration (written BEFORE any run)

Rotation read 2 (deepening) at run start; r87 plays deepening, writes 2->3
at closeout. Base: master@61e019a85. Policy: competent (pinned, r40 driver
lineage). Seeds: fresh 93001–93004 (no journey-deepening file mentions
93001–93004; checked 2026-11-02). Horizon: DAYCAP=100, death-aware stop.
Smoke seed 93000 (outside the main band) × DAYCAP=45 proves instruments
before the main run; smoke outputs deleted after the check.

Context: the 2026-11-02 ship (build 17138a184) carried monster commitment
(monsters do not flee without an explicit flee component), the loot taper
(wave 2+ kills: up 5/10/15/20%, down 5%), at-home archer arrow-craft, dead
-villager exclusion (no re-apply, no succession pick, not counted alive),
and the skill-lesson repeat-ledger unblock. The underlying builds were
already proof-tested in isolation (npcdeadfilter, deadid, arrow-make,
lesson-repeat r61); this run is a WILD check — do the items show up under
natural competent play in the deepening window? — not a re-proof.

## Leg question

Under natural competent play in the deepening window, do the 2026-11-02
ship items show up in the wild?

## Binding metrics (NO-GO never re-scored; revisions go to "metric review")

- SH1 commitment — GO iff 0 mFlee outcomes on monsters WITHOUT a flee
  component across all seeds. mFlee on flee-kind monsters (mdef.flee) and
  the offer_food lure case are reported separately, not violations.
  Instrument: fieldFight wrap records outcome + mdef.flee + (Committed)
  lines per call; only calls with a non-null outcome count.
- SH2 taper — REPORT + ENGAGEMENT: every rollAlienLoot call recorded
  (monster wave, loot-table base tier, granted item tier, rewardSource,
  apex). GO iff >=1 wave>=2 kill-path roll occurred AND 0 wave-1 cap
  violations (non-apex wave-1 grant above tier 2). Up/down shifts reported
  as counts; with 5–20% up rates, a small kill-loot n cannot prove the
  rate — do not over-claim from counts alone.
- SH3 arrows — GO iff >=1 villagerAmmoCraftDay batch with ok=true on >=1
  seed. If 0, report the opportunity denominator (villagerAmmoCraftDay
  calls) before calling it a miss: no bow-carrier at home short of ammo
  means no opportunity, not a broken craft.
- SH4 dead-exclusion — GO iff 0 dead ids in any npcIds checkpoint snapshot,
  0 dead genApplicant ids, 0 dead arrivalTick ids, across all seeds.
- SH5 lessons — GO iff >=1 repeat lesson (same teacher+learner+skill
  taught ok twice) on >=1 seed. If 0, report total lessons + repeat
  opportunities before calling it a miss.
- M4 people — >=10 transcripts sense-read (days 45/60/80), 0 senseless.
  Bar: the NPC wants something, options engage or deflect it, endings
  resolve/plant/owe; no fabricated shared history, no filler loops.
- M5 winnable — >=2/4 villages alive at end; death-aware stop.
- STAY-GREEN: death-honesty mislabels == 0.

## What would count as interesting

- A committed monster fighting to the death in a transcript-readable way
  (the "(Committed)" line landing in real narration, not just the log).
- A wave-2/3 kill paying visibly up a tier (granted tier > base tier on a
  kill-path roll) — the taper made visible to a player.
- An archer's own workbench line firing at home ("their own work in their
  own hands") in a seed transcript or capture.
- Any dead id resurfacing anywhere (succession, applicant, arrival) — that
  would overturn the dead-exclusion ship item and escalate immediately.
- A repeat lesson completing in conversation (the r61 fix visible in play).

## Harness

scripts/journey-deepening-r87-20261102.js (r40 lineage, instrument-only
additions, zero game code): fieldFight outcome wrap, rollAlienLoot wrap,
villagerAmmoCraftDay wrap, teachSkill wrap, genApplicant wrap, arrivalTick
wrap, npcIds checkpoint snapshots (pure filter, safe to call).
Analyzer: scripts/analyze-journey-deepening-r87-20261102.js.
Proof: scripts/test-journey-deepening-r87-instruments-20261102.js (static
marker checks + analyzer verdict fixtures; live smoke run separately).

## Addendum — instrument pilot + metric review (written BEFORE the judged re-run)

The first 4-seed run (22:56Z, seeds 93001–93004) is retained as an
INSTRUMENT PILOT, not judged evidence. It exposed three metric errors and
one missing instrument, all corrected before the judged re-run on the
identical seeds (the wraps consume no RNG, so non-ship fields must match
the pilot — verified by diff after the re-run):

- SH1 (metric review): the engine labels designed WINS as mFlee — trick
  dismissals (Redactor starved, Focus Group bored, Terms dismissed),
  stare-downs, peacemaker walk-ins, judges' calls. Counting every mFlee
  as a commitment violation is wrong. Revised: only contact / drive-off /
  round-cap / unclassified flight on a non-flee kind counts; trick /
  stare / peace / judges / lure are reported separately. The wrap now
  classifies every mFlee from the record flags + log lines.
- SH2 (metric review): the wave-1 cap rule ignored two legal paths — the
  veteran bump (wave-1 veteran, unlocked wave >= 2: cap min(base+1,3))
  and tier4Chance entries (pool legitimately reaches tier 4 and below).
  Revised: a wave-1 grant violates only above the veteran-aware cap on a
  non-tier4Chance entry. The wrap now records fighter veteran status and
  loot tier4Chance.
- SH5 (metric review): same-teacher+learner+skill twice is impossible once
  the skill is learned — the r61 fix is about MULTIPLE lessons over time
  (one per conversation, not one ever). Revised: GO iff some teacher
  teaches >= 2 lessons or some learner receives >= 2 lessons.
- SH3 (missing instrument): 388 daily duty calls with 0 batches cannot
  distinguish "no eligible archer" from "broken gate". Added a daily
  read-only opportunity scan (home villagers with a ranged weapon and
  < 5 matching ammo) so the judged run reports the denominator.
