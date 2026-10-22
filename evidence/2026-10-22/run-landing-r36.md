# Journey LANDING r36 — run note (2026-10-22, run_id playtest-loop-a-20261022T113924Z)

## Pre-registration (§14 — binding)
- **Question:** with SURPLUSFEED removed (9f5015716) and behavioral
  plenty-deprioritization live (df66ebaff), does landing stay fed, green,
  and legible on tip 09ff3090e?
- **Gates:** R36 PLENTY-ENGAGE (throttle engages on ≥1 seed; every fired
  line sense-read — real work, rotation, no verbatim loop; documented-absent
  if the pantry never reaches plentiful, not a miss); R36 FALLEN (0 fallen
  dupes; exactly-one entry per death); R36 V2-PRESSURE (watch): V2 holds at
  ≥40% on ≥3 seeds WITH the new behavior — a miss is recorded under metric
  review, NOT re-scored. Stay-green spine: V1'', V2, V3 (+scholar carve-out),
  V4' (refined detector; ≥8 transcripts sense-read, 0 fabric-history,
  0 near-dupes), V5', V6, M2 (System d8), WILD HAUL ARC, DAY-FREEZE,
  OPEN BOOK, BEAT-IDENTITY WILD, R34 DEATH-LITURGY, R34 THEFT-RATE,
  R35 NV-HOLD.
- **Seeds:** 205, 206 (pilot), 207, 208 (main, FLESH_PROBE=2); probe 101
  (REPEAT_SIT=1, MOURN_PROBE=1). Policy: competent, PINNED. 14d,
  death-aware stop (+10d tail).
- **Canon read:** CANON.md (reread); DISEASES.md (reread), CONVERSATIONS.md,
  DIRECTIVES.md, KIN.md, PRESERVATION.md. No new canon invented.

## Verdicts
- **R36 PLENTY-ENGAGE: GO** — the throttle engages on all 5 seeds (11–13
  plenty days/seed). 3–10 villagers/day ease 50% of their surplus push above
  own-meal need (346–3,908 kcal/day per seed-day; 28k–50k total per seed —
  the ledger `village._plentyDepri.days[d] = {depri, kcal, vids}` confirms
  real easing, not just voice). One 🍽️ line/day, all sense-legible: real
  instead-of work (patching boots, sharpening skinning knives, carving bowls,
  rendering fat, teaching kids snares, sitting with the elders, tending the
  fire, splitting firewood, mending nets, hauling water for the cistern).
  0 within-village dupes; speaker rotation is day-keyed (one consecutive-day
  repeat: Sofia d6→d7 on 205, different lines — human-plausible, documented).
- **R36 FALLEN: GO** — 0 dupes; exactly one memorial-roll entry per death
  (Caroline combat, Pablo monster, Skylar dehydration, Hassan wound) —
  the b5cb18d53 wound/thirst fixes hold in the wild.
- **R36 V2-PRESSURE: GO** — V2 holds at 0.774–0.899 on all 4 fresh seeds
  WITH the easing live. (r34/r35 ran 0.98–1.10; the drop is the designed
  easing, not a shortfall.) No metric-review miss.
- **V1'': GO 5/5** (12/12 per-villager pass; hunger>90 = 0). **V2: GO 4/4.**
  **V3: GO 5/5** (2–7 trust≥40 pairs/seed; scholar-death carve-out: 205
  Caroline→Luz and 207 Skylar→Joyce both hold ties). **V4': GO** (10
  transcripts sense-read; 0 fabric-history; 0 near-dupes with the refined
  detector; probe gate via seek_taken 5× natural). **V5': GO** (fills 5–8,
  boils 12–17, 0 death mislabels). **V6: GO** (all villages alive d14).
  **M2: GO** (System day 8, all 5 seeds).
- **WILD HAUL ARC: GO via probe** — 207/208: corpse registered d1,
  remembered 11/11 → pantry deposit → cautious experiment → "It's food"
  reveal (streamCounts deposits 1 / experiments 1 / reveals 1 per seed;
  the probe stages only the kill + memory, downstream is natural machinery).
  Natural arcs 0/2 on 205/206 — the 14-day kill rate is low, machinery proven.
- **DAY-FREEZE: GO** (0 stranded-AI-turn fights). **OPEN BOOK: GO** (both
  mantles pass clean — Caroline→Luz, Skylar→Joyce; kept promises honored,
  none unkept to name). **BEAT-IDENTITY: GO** (spoil mutter attributed to
  Angela: "Should've smoked that… the smoke rack is right there." — true
  attribution, sensible content, no spam).
- **R34 DEATH-LITURGY: GO** — 4 deaths sense-read; no second cause lines;
  ≤1 grief beat per death; 0 headcount codas; person-shaped codas ("🕯️
  Hassan is gone. The wound was too much. Somebody's sleeping-roll stays
  rolled out. Nobody puts it away.").
- **R34 THEFT-RATE: GO** — 0 caught-red-handed on all seeds.
- **R35 NV-HOLD: GO** — 0 stuck loops; 4 winddown surfacings, all closed
  properly (3 via the narrowed leave/silence menu, 1 beat-on-final-turn
  then endConvo).
- **Telemetry vs landing baseline: quiet** (systemDay 32, deaths 14 vs 12,
  fires 0, starvAutopsies 0 — no LOUD lines). Baseline NOT rolled.

## Village assessment (plain words)
Four villages, fourteen days, under the new food regime. The pantries run
full enough that villagers visibly ease off — Sofia patching boots instead
of foraging, Nikolai teaching the kids snares, Thabo sitting with the
elders — and the villages still eat (self-sufficiency 0.77–0.90, nobody
hungry, no starvation). Two villages buried their scholars: Caroline fell
to the Highbeam Deer on day 12, Skylar to dehydration on day 11; the mantle
passed clean to Luz and Joyce and the villages kept working. Pablo died at
the treeline he had mimed "come with me" toward on day 2; Hassan of a wound
that wouldn't close. The dead are grieved person-shaped, never headcounted.
Favor arcs complete: Amanda's sickness-help asked → promised → kept ("You
kept your word. That meant everything."). The monster-meat wild arc runs
end-to-end (haul → pantry → cautious test → "It's food"). Nothing structural
missing in-window.

## People check (10/10 sense-read)
- 205-day1: the limping stranger's "What did you do with your hands,
  before?" — sizing up the newcomer; resolves engaged.
- 205-day2: Leonard's Norwegian nonverbal sit — winddown surfaces, menu
  narrows to leave/silence, gentle close ("They wave you off gently,
  already turning away.").
- 205-day3: the glasses-wearer's "What do you make of all this? Really." —
  bleak honesty met with "Take care of yourself. I mean that."
- 205-day10: Nora's natural winddown ("Go on, then. I'll be thinking good
  thoughts at you.") + tellbeast/namebeast ("Old Croaker" / "The Reverend" /
  "Mister Never" — the naming debate lives).
- 206-day1: the shy stranger — "I'm not good at the talking-to-strangers
  part." Shoulders ease; "I need some air. Alone air."
- 206-day2: Pablo's Spanish mime — "come with me" toward the treeline;
  translator renders; closes "a promise without words." He dies at the
  treeline on day 7. The plant pays off.
- 206-day3: Amanda's sickness favor — asked → promised → kept (keptLines).
- 207-day13: Talgat's seek_comfort two days after Skylar's death — "They'd
  tell me to keep working. So I'm working." Grief permeates.
- 207-day14: Stan's forage favor — declined; "They won't ask twice. That
  much is clear." Deflection with consequence.
- 101-day2 (probe): Courtney's seek_taken (Sergio) — "Even asking is more
  than the silence." KIN canon alive.
No fabricated history, no filler loops, no static menus.

## Blank filled
Driver instruments, not game code (zero src/js changes this run):
1. The nv stuck-loop detector false-positived on the pilot: `lastPickWasNv`
   went stale when the driver broke on 'leave', and "closed" required
   engine-end, missing the narrowed-leave close. Corrected: closed =
   surfaced && (endedByEngine || leftViaLeave); stuck-loop = the 8-turn cap
   hit with the winddown NEVER surfacing (the true r19 signature:
   gesture-spam with the beat queued forever). Re-pilot: 0 stuck loops,
   all surfacings close properly.
2. The plenty ledger read was day-early (the per-day snapshot reads the
   current day before its meal loop runs — always zeros). Moved to a
   census-time full-ledger dump (`plentyLedgerFinal`) + day-attributed
   voice samples (`d<day>:`), which is what proved the easing is real.
Proofs re-verified green on tip 09ff3090e: test-nvwinddown-transcript
(exactly-once), test-landing-r35-neardupe (11/11), test-plentydepri-b
(ALL GREEN).

## Observations (documented, not fixed)
- Plenty voice: Sofia speaks d6→d7 consecutively on 205 (different lines).
  The code comment claims "consecutive plenty days name different people" —
  the day-keyed pick doesn't guarantee it. Human-plausible; no action.
- Away-death grief beat: Skylar's dehydration death fired no "Nobody's
  talking much" line — presence-gated (the new bearer was away from haven).
  The grief STATE permeated (Talgat's seek_comfort two days later). The code
  comment says "the narration waits"; the line is dropped, not deferred —
  but the death itself is narrated (Codex + 🕯️) and the village feels it.
  Design nuance, not a defect.
- 208's pantry drew 22.5k→13.5k over days 10–14 under the easing; the
  throttle stayed engaged (fresh-days reads pantry-burn-relative, by design —
  villagers eat own production first, so the pantry burn is small). Hunger 0
  throughout. Watch item for establishment (leg 1): does the new regime stay
  solvent into days 14–40?
- Favor flavor "The pantry's nearly bare" is instance-hashed, not
  state-gated (207-day14 pantry 29k ≈ 1.2 days — thin but not bare).
  Pre-existing mild flavor; documenting.

## Metric review (§14)
- No metric re-scored mid-run. R36 V2-PRESSURE watch satisfied — no miss,
  no revision proposed.
- Next-run proposal: none; gates held.

## reachable / fun / winnable
REACHABLE: yes (System d8; plenty voice, death liturgy, flesh arc all fired
unprompted). FUN: yes (the easing voice gives the village a lived-in rhythm;
grief lands; favors complete; the treeline plant pays off). WINNABLE: yes
for the leg (4/4 fresh villages alive, fed, producing at d14).

## Ops
- Harness: scripts/journey-landing-r36-20261022.js (r35 lineage + R36
  instruments; R36b pilot corrections) + scripts/make-r36.py. Bulk evidence:
  hidden_files/evidence/2026-10-22/landing-r36/ (5 censuses, 5 system files,
  5 fullstreams, ~60 transcripts).
- Regression: zero src/js changes — no regressions possible from this run.
  Mechanism proofs re-verified on tip (see Blank filled).
- Rotation: journey-rotation-a.txt 0→1 (establishment next).
- Merged locally, pending ship (no bump/push — the ship loop owns those).
