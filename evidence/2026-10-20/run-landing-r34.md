# Journey LANDING r34 — run note (2026-10-20/21, run_id playtest-A-20261021T043516Z)

## Pre-registration (§14 — binding)
- **Question:** does LANDING stay GREEN on tip e39108e3a with the
  death-liturgy templating (64737ff99) + theft rate-bar (e89c294b9) landed
  since r33's base (ecc7177f2)?
- **Gates:** V1'' autonomy ≥3/4; V2 ≥40% kcal ≥3 seeds; V3 ≥1 tie/seed WITH
  the scholar-death carve-out (r33's proposal, adopted); V4' ≥8 transcripts
  sense-read + 0 fabric-history + 0 near-dupes (20-char floor) + probe gate;
  V5' water + 0 mislabels + ≥6 names pre-System; V6 alive d14; M2 System day
  8; WILD HAUL ARC ≥1; DAY-FREEZE 0; OPEN BOOK conditional; BEAT-IDENTITY
  WILD; R34 DEATH-LITURGY (≥1 natural death sense-read: one beat per death,
  0 headcount codas); R34 THEFT-RATE (0 caught-red-handed on honest eating).
- **Seeds:** 109, 110 (pilot), 111, 112 (main); probe 101 (REPEAT_SIT=1,
  MOURN_PROBE=1). Pinned competent. 14d, death-aware.

## Verdicts
- V1'': GO 5/5 · V2: GO 5/5 (0.979–1.102) · V3: GO 4/4+probe (carve-out
  adopted, not needed — 111's Carmen:51 crossed 40 pre-death; mantle
  Naomi→Lauren clean) · V5': GO 5/5 (fills 4–5, boils 16–17, 0 mislabels,
  12 names pre-System) · V6: GO 5/5 · M2: day 8 all 5 · WILD HAUL ARC: GO
  (110: 3 arcs — Emma/hummice, David/mirrormoth, Greta/drumbelly) ·
  DAY-FREEZE: GO · OPEN BOOK: mantle clean, no post-death sittings (driver
  posture) · BEAT-IDENTITY: none in-window.
- V4': 8 transcripts sense-read; 0 fabric-history; **1 near-dupe — STRICT
  MISS** (probe 101-day12: the resume opener quotes the previous sitting's
  true close, then the player's re-commit legitimately re-fires the same
  gratitude line — honest mechanism, not a defect; detector refinement
  queued for the next run). Probe gate PASSES (seek_taken 5× probe,
  seek_comfort + seek_taken natural on fresh seeds).
- R34 DEATH-LITURGY: GO — 3 natural deaths: 109 Enzo d13 monster ("💀 The
  Living Wire killed Enzo in 1 round. The village mourns." + 1 beat);
  110 Riley d12 starvation ("💀 Riley starved. Slowly. Nobody eats much
  tonight. The pot stays full and nobody touches it." — the griefLine coda,
  + 1 beat); 111 Naomi d8 scholar combat (exactly 1 villageEvent('death')
  beat — deathGriefBeat dedupe HOLDS). 0 headcount codas, no second cause
  lines.
- R34 THEFT-RATE: GO — 0 caught-red-handed on all 5 seeds; the e89c294b9
  rate-bar holds on ordinary pantry eating.
- Retired (cite): R33 FAVOR-ACTION, R33 KILLBEAT, R29 SETTLE-SPEAK,
  ASK-GOSSIP. R28 WILD: gossipThreadOffered = 0.
- Telemetry vs landing baseline: quiet. Baseline NOT rolled.

## Village assessment (plain words)
Five villages, fourteen days. Nobody went hungry, water was boiled 16–17
times per seed, self-sufficiency 0.98–1.10. Three villages buried their own
— Enzo (monster), Riley (starvation), the scholar Naomi (Highbeam Deer) —
and kept working; grief beats are person-shaped now, not headcounts.
Promises cut both ways: Tupaq's kept ("That meant everything"), Riley's
broken ("Promises rot. (-15 trust)"). The dead are remembered in the
namebeast voter lists. Nothing structural missing in-window.

## People check (8/8 sense-read)
Courtney's seek_taken arc (Sergio, the Taking — KIN canon alive); Mia's
seek_comfort the day after Riley starved (comfort-pool fix holds); Ivy's
laugh on the day Naomi died ("Naomi's gone... I desperately need it") +
the tellbeast beat ("headlights for eyes, standing too still"); Tom's
origin exchange (the 3329c74bf offered-replies repair visible); Luis's
favor deflection ("They won't raise it again"); the sick villager's kept
promise. No fabricated history, no filler loops.

## Metric review (§14)
- V4' near-dupe: STRICT MISS, mechanism documented, not re-scored. Next-run
  proposal: detector excludes quoted resume openers.
- V3 carve-out: adopted, not exercised. Stands.
- No metric re-scored mid-run.

## reachable / fun / winnable
REACHABLE: yes (System d8; death-liturgy, haul arc, favors all fired
unprompted). FUN: yes (grief lands, promises kept/broken aloud). WINNABLE:
yes for the leg (5/5 alive, fed, producing at d14).

## Ops
- Harness: scripts/journey-landing-r34-20261020.js (r29-driver lineage +
  R34 instruments; grief-beat regex tightened to the exact death line) +
  scripts/journey-landing-r34-analyze.js. Bulk evidence:
  hidden_files/evidence/2026-10-20/landing-r34/.
- Regression: check.js --quick — 265 passed, 6 failed (3 pre-existing
  maintenance-proof failures, re-verified identical; 3 environmental 120s
  timeouts under sibling-sweep load). Zero src/js changes — no regressions
  from this run.
- Rotation: journey-rotation-a.txt 0→1 (establishment next).
- INFRASTRUCTURE (LOUD): local master / origin/master DIVERGED again —
  origin/master carries the ship loop's two record commits (19b91d67f,
  d09f47ea2, pushed 22:54/23:02 CDT Oct 20) on base ffe2259a9, pushed from
  a stale base without the fleet's 22:30+ CDT landings. `git pull --ff-only`
  fails. Per AGENTS.md push-discipline rule 5 this run does not touch the
  divergence — the ship loop reconciles it (3-way merge). This run lands
  into local master only via --ff-only. Merged locally, pending ship.
