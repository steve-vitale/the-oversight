# sim-palisade-a — palisade-escalation narration beat for wave-3+ raids (axis scale-onramp)

Run: fleshout-20261025T1815Z, arm sim-palisade-a.
Worktree: ~/workspace/worktrees/sim-palisade-a (coordinator-registered).
Main tree untouched; sibling trees untouched.

## PRE-REGISTRATION (binding, written BEFORE any sweep; judged only against this)

- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave law:
  wave 3 = day 25+ and wave-2 ledger >= 4 points, kills only, per-type
  cap 2; wave 4 = standing >= 100; wave 5 = standing >= 200 and
  wave-4 faced; readiness gates hold waves 4-5). No haven/raid canon
  doc exists (carried) — raid design lives in src/js/havenGrowth.js
  comments (havenRaidTick header + CRISISTIER comment); nothing is
  invented from scratch beyond the one narration sentence below,
  which reuses the existing raid line's conventions.
- Blank (carried, confirmed absent four times by prior runs, most
  recently the day-60 raid line in evidence/2026-10-25/sim-tileentry-a.md,
  also read: sim-spawnsrc-a.md, sim-w5births-a.md): a wave-3+ raider
  at the wall reads exactly like any other name in the raid list —
  no escalation beat exists in the raid announcement flow.
- CONCRETE SITE (coordinator-verified, re-verified from code before
  changing anything): src/js/havenGrowth.js havenRaidTick emits the
  raid announcement `🐗 RAID — ... hit Haven in the night, drawn by
  the smell of the pantry!` plus a palisade sentence. Immediately
  after, wmax is computed from the drafted raiders via crisisWaveOf
  (m.wave is NEVER on the entity — the CRISISTIER comment documents
  this; m.wave is never read). Raids draft nearest-first living
  world monsters, 3 base +1 above 12k pantry kcal +1 above 24k, cap 5;
  they fire reactively on world state, never on a schedule.
- MECHANISM (narration only, zero behavior change): when a raid's
  drafted raiders include wave-3+ (wmax >= 3 via crisisWaveOf), the
  raid announcement flow carries one added escalation beat marking
  this raid as bigger than the usual teeth at the door. Design
  choice (mine, within the pre-registered constraints): the beat is
  a separate aloud line immediately after the RAID line (same
  placement class as the existing defense beat: said aloud like the
  raid announcement), NOT an appended sentence — so the existing
  RAID sentence stays byte-identical. Wording:
  `🐗⚠️ One of them is bigger than the usual teeth at the door — <name>
  came with this raid, and the wall was not built for its kind.`
  where <name> is the knowledge-gated display name (mname /
  monsterDisplayName, never the true name) of the first drafted
  raider whose crisisWaveOf is the raid's wmax. The beat never
  names a wave number or a wave title (fog-of-war / knowledge-gate
  discipline, same as the readiness hold beat, which never names
  the held wave's title).
- Pre-registered constraints (all binding):
  - It fires exactly when wmax >= 3 and never when wmax < 3.
  - It uses the knowledge-gated display name convention (mname /
    monsterDisplayName, never the true name — same convention as
    the RAID line and the defense beat).
  - It is said aloud like the raid announcement.
  - It changes no spawn, draft, damage, crisis, or economy value.
- PROOF FIRST: a driven-game proof test (scripts/test-palisade-escalation-20261025.js)
  showing wave-3+ raid -> beat present, wave-1/2-only raid -> beat
  absent, in both palisade and no-palisade variants, with the
  existing raid sentences byte-unchanged.
- PILOT: shared band seeds 73671-73678, 180d death-aware,
  tableseat-nowait substrate (LEANLINKRESCUE=1, TABLESEATNOWAIT=1).
  Pilot sweep script scripts/test-palisade-sweep-20261025.js runs the
  same substrate with a record-only say wrapper (the silent sim
  say is a no-op, so recording it cannot move trajectories) plus
  the raftdraft census, and pairs each raid's RAID line with the
  following escalation line. Count raids by wmax: beat present on
  100% of wmax>=3 raids, 0% of wmax<3 raids.
- MECHANICS-NEUTRAL GUARD: pilot counts must reproduce the
  published control band exactly — deaths 234, wins 4/8,
  national-ever 7/8, raids 85, raiders 361. Narration only means
  counts identical; ANY count deviation = NO-GO, revert the game
  change, and report the deviation.
- SENSE-TESTING LAW: before/after raid transcript excerpts in
  evidence/2026-10-25/sim-palisade-a-sense.txt, judged for meaning
  (does the escalation read as escalation, not noise; does it
  respect fog-of-war/knowledge gating), not just counts.
- GO requires ALL of: proof green, pilot 100%/0%, guards exact,
  sense pass. A miss is NO-GO — revert the game code before commit
  and land the record only.
- STOP CONDITION: if the beat requires touching spawn, draft,
  crisis, or economy logic to work, STOP and report — narration
  only, no behavior change smuggled in.
- METRIC REVIEW section below is mandatory (docs/MEASUREMENT.md
  §14): pre-registered metrics bind the run — a miss is NO-GO,
  never re-scored against a friendlier metric mid-run.

## IMPLEMENTATION

- src/js/havenGrowth.js, havenRaidTick only: after the existing RAID
  say, compute the raid's wmax from the drafted raiders via
  crisisWaveOf (the def lookup, never m.wave — the entity-carried
  .wave that spawnWorldMonster also sets is ignored, exactly as the
  CRISISTIER block does) and, iff wmax >= 3, say one separate line:
  `🐗⚠️ One of them is bigger than the usual teeth at the door —
  <mname(first drafted raider at wmax)> came with this raid, and the
  wall was not built for its kind.` The RAID sentence itself, the
  palisade sentence, the contest-collision line, the crisis-tier
  computation below (left byte-untouched, recomputing its own wmax
  exactly as before), defender fights, lingering, player-at-haven,
  awayNews, and gossip are all untouched. No spawn, draft, damage,
  crisis, or economy value is read for anything but the beat's
  condition, and no value is written. The STOP CONDITION never
  triggered: the beat needed no behavior logic at all.
- Design note (within pre-registered freedom): separate aloud line,
  not an appended sentence — chosen so the RAID sentence stays
  byte-identical (proven, not asserted) and so the beat survives
  the palisade / no-palisade sentence variation unchanged.
- No haven/raid canon doc exists (carried, again): raid design lives
  in havenGrowth.js comments; the beat reuses the raid line's own
  conventions (mname display names, said aloud) rather than
  inventing a new voice.

## PROOF RESULTS

scripts/test-palisade-escalation-20261025.js — OVERALL PASS, 4/4
variants, driven game (real setupGame, real spawnWorldMonster at the
haven tile, real havenRaidTick looped past its nightly roll):

- w3-palisade PASS: wmax=3, beat present, byte-exact, immediately
  after the RAID line; RAID line byte-exact with the palisade
  sentence.
- w3-nowall PASS: wmax=3, beat present, byte-exact, immediately
  after the RAID line; RAID line byte-exact with the no-walls
  sentence.
- w12-palisade PASS: wmax=2, beat absent, RAID line byte-exact.
- w12-nowall PASS: wmax=1, beat absent, RAID line byte-exact.
- Every variant: beat line count exactly 1 (w3) or 0 (w12); no true
  monster name in any beat line; no wave number in any beat line.
  Early-game gated display names observed in the proof (System not
  yet arrived): Spool -> "a tangle of tape that moves like it's
  remembering"; Redactor -> "a missing piece of the world".

## PILOT RESULTS

scripts/test-palisade-sweep-20261025.js, seeds 73671-73678, 180d
death-aware, tableseat-nowait substrate. Corpus:
evidence/2026-10-25/perseed-sim-palisade-a/ (8 rows, s<seed>-palisade.json).

- Per-seed: 73671 survived 180d, 16 raids, deaths 31; 73672 won
  d97, 7 raids, deaths 25; 73673 won d124, 7 raids, deaths 28;
  73674 survived 180d, 14 raids, deaths 18; 73675 won d135, 13
  raids, deaths 24; 73676 village-lost d70, 7 raids, deaths 31;
  73677 village-lost d143, 12 raids, deaths 43; 73678 won d116, 9
  raids, deaths 34.
- MECHANICS-NEUTRAL GUARD — EXACT, all five: raids 85 (control 85),
  raiders 361 (control 361), deaths 234 (control 234), wins 4/8
  (control 4/8), national-ever 7/8 (control 7/8).
- BEAT: wmax>=3 raids 26, beat present 26 (100%); wmax<3 raids 59,
  beat present 0 (0%). Pairing exact every seed (RAID-line count ==
  census raid count, raftErrs 0). PILOT-VERDICT line from the sweep:
  guardsExact=true beat100_0=true pairingOk=true -> GO.
- The record-only say wrapper cannot explain the guard match away:
  the silent sim say is a no-op, so recording its arguments changes
  no game state; the guard numbers are the game's own counts, and
  they reproduce the published band to the unit.

## SENSE-TESTING READ

Full excerpts + judgment in
evidence/2026-10-25/sim-palisade-a-sense.txt (scripts/test-palisade-sense-20261025.js,
seed 73671, 180d, full-transcript capture: 16 census raids, 16 RAID
lines, pairing exact — the stock sense ring keeps only 240 lines, so
a dedicated capture was needed; the stock ring replay was run and
discarded, its final days containing no monster raid).

- The day-60 raid reproduces tileentry's line verbatim (Ugly-Eyes,
  The Moderator, Loud-Eyes, Inspiration, Flashbulb Moth) — wmax=2,
  beat correctly ABSENT. The wave-2 apex still gets no special
  billing, which is the point: the beat is a wave-3+ flag, not a
  "big raid" flag.
- All four wmax=3 raids in the replay carry the beat (days 145, 154,
  161, 176), e.g. day 145: "Buffering came with this raid, and the
  wall was not built for its kind." Day 161 names only the first of
  two wave-3+ raiders ("One of them") — honest, not a roster.
- Fog-of-war: no wave number or title is ever named; the name used
  is the RAID line's own display-name convention. Late-replay true
  names (Buffering, Spool) are the RAID line's own convention once
  the System has arrived — the beat leaks nothing the RAID line
  does not already print.
- SENSE VERDICT: PASS.

## VILLAGE ASSESSMENT (plain words)

Nothing in the village changed — that is the result. The same eight
villages lived, died, and won in exactly the same numbers as the
control band, because the change only adds a sentence to the night
a bigger monster comes to the wall. What changed is what the player
hears: before, a monster from the System's final draft arrived at
the palisade and read like any other name on a list, even the
Moderator — the wave-2 apex — getting no special billing. Now, when
something from beyond the usual teeth comes with a raid, the night
says so out loud, in the village's own words for the thing, and
says the wall was not built for its kind. A wave-2 raid still reads
exactly as it did. The blank the last four runs kept carrying —
"a wave-3+ raider at the wall would read exactly like this list of
names" — is filled, with no village paying for it in deaths, wins,
or national reach.

## METRIC REVIEW (required, §14)

- No metric was re-scored mid-run. GO is judged exactly as
  pre-registered: proof green (achieved 4/4), pilot 100%/0%
  (achieved 26/26 and 0/59), guards exact (achieved all five to the
  unit), sense pass (achieved — see sense file). All four legs pass.
- Guard-match note (stated, not hidden): per-seed death totals in
  this pilot (31/25/28/18/24/31/43/34) sum to the published 234;
  the tileentry control evidence reports per-seed raids/raiders
  (16/7/7/14/13/7/12/9 — identical to this pilot's raid counts) and
  the same band totals, so the guard comparison is apples-to-apples
  on identical seeds and substrate.
- Sense-method note (stated, not hidden): the stock sense replay's
  240-line ring covered only the final days (178-181, no monster
  raid), so the sense excerpts come from a dedicated full-transcript
  capture script (record-then-call the real say, narration on) on
  the same seed and horizon. Sense replays are non-measured by
  definition; no census number comes from them.
- No revision is proposed to the pre-registered metrics. The beat's
  one known limitation — it names only the first wave-3+ raider
  when a raid drafts two — is a design judgment recorded in the
  sense file, not a metric change.

## CHECK HYGIENE (supplementary, not pre-registered)

- `node --check src/js/havenGrowth.js`: clean.
- `node scripts/check.js --quick`: 279 passed, 8 failed — twice
  (745s, then 824s with full output). The 8 failures were then
  re-run individually with ONLY this arm's game change stashed
  (pristine havenGrowth.js, worktree branch untouched otherwise):
  all 8 fail identically on pristine code, with identical failing
  assertions — hide-discovery (counter butchering),
  measurement-comparison, measurement-proof-update,
  measurement-workflow (retained neutrality proof),
  mobile-combat-cadence, occupation-panels, phone-frame-proof
  (stale boot-input hashes), test-parity-20261014 (gear). They are
  pre-existing failures in this worktree's base, NOT caused by the
  narration beat. The stash was popped and the change re-verified
  (git diff 25 insertions, proof re-run OVERALL PASS 4/4).
- Raid-adjacent godpath test scripts/godpath/test-palisade-sleep.js
  passes (4/4) with the beat live.

## VERDICT

GO — all pre-registered legs pass (proof 4/4, pilot 100%/0%, guards
exact, sense pass). The narration beat lands as its own commit with
[needs-eyes] (feel/narration change Steve should playtest). No
behavior change, no re-score, no open deviation. The carried
palisade-escalation blank is FILLED.
