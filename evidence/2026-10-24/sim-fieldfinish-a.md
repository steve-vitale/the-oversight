# sim-fieldfinish-a — DRAFT PRE-REGISTRATION (header written BEFORE sweeping; results appended after the run)

Run: fleshout-20261025T0205Z, arm sim-fieldfinish-a, axis scale-onramp.
Worktree: `~/workspace/worktrees/sim-fieldfinish-a` (branch sim-fieldfinish-a).
Substrate: tableseat-nowait (LEANLINKRESCUE=1 + TABLESEATNOWAIT=1).

## Canon read first

- docs/CANON.md, docs/MONSTER-WAVES.md (wave 3 gate: day 25 + 4 wave-2
  LEDGER points, kills only, per-type cap 2; wave-3 HP 240-420),
  docs/MEASUREMENT.md §§9-12, 14-15.
- Code authority: src/js/fieldFights.js `fieldFight()` — members[0] IS
  the world-monster entity (hp starts at m.hp, wounds persist back via
  `m.hp = rec.mHpLeft` on every non-vKill outcome); mBreak = 0.15 for
  wave >= 2; after the volley section, UNCONDITIONALLY, hp/maxHp <
  mBreak gives outcome mFlee — even with zero volley damage, because
  the check does not distinguish "the volley just dropped it" from
  "it arrived below the line". In-round mFlee always has rounds >= 1.

## PRE-REGISTRATION (binding — written BEFORE sweeping, judged against it, never re-scored)

- Substrate (both arms): tableseat-nowait, LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1. Seeds 73671-73678, 180 loop-days death-aware
  (runDays breaks on Game.over).
- Baseline: OWN replication (8 seeds) of tableseat-nowait with the
  recorder unset — not another arm's corpus.
- Armed: tableseat-nowait wrapped with
  scripts/policies/fieldfinish-diag.js (FIELDFINISH=1). Observational
  only: field-fight rows (monster type/wave, mHpLeft at fight start
  and end, rounds, outcome vKill/vDie/vFlee/mFlee/evade, villager
  participant, volley damage, intent, hasRng proxy) with repeat-fight
  linkage by monster type across days, plus tbEnd rows as a player
  cross-check. It never writes game state, draws no RNG, never throws
  into the engine. Start hp is captured from the entity argument
  BEFORE delegating; end hp/rounds come from the RETURNED result
  object, never post-call engine state (tbEnd capture reads the fight
  OBJECT before delegating, since tbEnd ends with `this.tbfight =
  null`).
- Focus cases to reproduce-or-refute from MY OWN corpus (not copied
  as results): 73675 chorus_line, 73677 chorus_line, 73678 spool
  repeat-fight patterns.
- DIAG-GO requires ALL of:
  - G1 det-gate: recorder unset == unwrapped on one seed
    (days/gameDays/ts identical, no recorder surface, no installed
    wraps);
  - G2 neutrality: baseline vs recorder identical on
    days/gameDays/ts/starvation on all 8 seeds;
  - G3 corpus integrity: 16/16 rows in
    evidence/2026-10-24/perseed-fieldfinish-a/ + summary.json, every
    armed row carrying persisted field-fight ROWS (not counts alone);
  - G4 hypothesis decision: IN or OUT against the numeric bar below.
- NUMERIC IN/OUT BAR (written before sweeping — this bar is the judge;
  a miss is NO-GO/OUT, never re-scored against a friendlier bar):
  - IN requires BOTH:
    (a) at least 2 of the 3 focus seeds (73675, 73677, 73678) each
    carry >= 1 STRICT wounded-repeat for a wave-3+ type: rounds = 0,
    outcome mFlee, startFrac < 0.15, AND the immediately preceding
    fight of the same type ended at exactly this fight's start hp
    (the wound persisted across fights), with that start hp > 0;
    (b) band-wide, >= 5 wave-3+ STRICT wounded-repeats across the 8
    armed seeds.
  - OUT is any failure of (a) or (b). Volley drive-offs
    (startFrac >= 0.15, rounds = 0, mFlee) and evades do NOT count
    toward the bar; unlinked rounds=0 mFlee rows with startFrac <
    0.15 (no prior fight of the type ending at that hp) are reported
    separately and do NOT count toward the bar.
- Balanced panel (§15): attempt `scripts/balance-panel.js compare` on
  the corpus; if it throws, record exactly why and use sweep-compare
  tables as the comparison.
- Sense-testing: one NON-MEASURED narration-on replay of a stuck seed;
  judge whether field fights read as finishable fights or scripted
  flights, in plain words.
- DIAG ONLY: no readyDemand moves, no VETSHAPE flip, no src/js
  default change, no combat-code change. No [needs-eyes] flag: this
  is measurement only (stated explicitly per the brief).

## RESULTS (appended after the run)

### Verdict: HYPOTHESIS IN — DIAG-GO (all four gates pass)

- G1 det-gate: PASS. Seed 73671, recorder unset == unwrapped:
  days 93, gameDays 93, ts {tsNationalDay: 83} on both sides, no
  `_fieldfinishdiag` surface, no installed wraps.
- G2 neutrality: PASS, 8/8 seeds identical on days/gameDays/ts/
  starvation; faced-agree 8/8, kill-log-agree 8/8 (exact entry
  tuples d/mid/w/by/via).
- G3 corpus integrity: PASS. 16/16 rows in
  evidence/2026-10-24/perseed-fieldfinish-a/ + summary.json; every
  armed row carries persisted field-fight ROWS (1,362 field fights
  band-wide) + tb rows; every baseline row carries the post-run
  pure-read snapshot (deed feed + waveKillLog, no event lists).
- G4 hypothesis decision: IN, against the pre-registered bar (bar
  written before sweeping, judged as written):
  - (a) focus seeds: 73675 = 9 strict wounded-repeats, 73677 = 2,
    73678 = 1 — 3/3 seeds carry >= 1 (bar: >= 2 of 3);
  - (b) band-wide strict wave-3+ wounded-repeats = 14 (bar: >= 5).
  - No re-scoring: the bar was met on its own terms, not on a
    friendlier one. Volley drive-offs = 0 band-wide, so no
    volley-driven row could inflate the count.

### What the hypothesis actually is, in plain words

Villagers DO wound wave-3 monsters down over successive fights — the
wound-persistence arc works. What breaks is the last step. A
wave-2+ monster flees the moment its wounds drop below 15% of its
full health (the break line in fieldFights.js). Wounds persist onto
the world entity, so the next villager who meets it finds it already
below the line — and the fight ends before a single blow, round 0,
outcome mFlee, damage dealt 0, monster health unchanged. The same
entity then repeats that zero-round flight at every meeting, forever:
it can never be finished, because finishing requires a fight and the
fight never starts. The monster is not unkillable in principle — it
is unkillable in practice, because the only villagers who meet it
are the ones it flees from, and the player is the only one who can
still reach it (all 11 wave-3+ kills in this corpus are player /
companion tb kills; 0 are villager field kills).

### Sweep-compare table (baseline vs armed — identical trajectories, G2)

Baseline rows carry no field-fight rows by construction, so the
field columns below are the armed arm's census; the baseline column
proves the recorder changed nothing (days/wave/wins/table identical
seed by seed — see summary.json gates).

| seed | days | wave | arc | final/max rank | nat | table | entered | won | field fights W3 | W3 outcomes | strict wounded-repeats W3 | tb fights W3 | W3 kills (kill log) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 73671 | 93 | 4 | 3 | global/global | 1 | 0 | 0 | 0 | 1 | vDie 1 | 0 | 10 | companion 1, player 1 |
| 73672 | 106 | 4 | 4 | global/global | 1 | 1 | 1 | 1 | 17 | vFlee 10, mFlee 5, vDie 1, evade 1 | 1 | 10 | player 4 |
| 73673 | 134 | 4 | 4 | global/global | 1 | 1 | 1 | 1 | 12 | mFlee 4, vFlee 6, vDie 1, evade 1 | 1 | 5 | player 2 |
| 73674 | 180 | 2 | 3 | global/global | 1 | 0 | 0 | 0 | 0 | — | 0 | 0 | — |
| 73675 | 180 | 3 | 3 | global/global | 1 | 0 | 0 | 0 | 37 | vFlee 17, mFlee 19, vDie 1 | 9 | 1 | — |
| 73676 | 174 | 4 | 4 | regional/global | 1 | 1 | 0 | 0 | 5 | vFlee 3, vDie 2 | 0 | 6 | player 1 |
| 73677 | 98 | 3 | 4 | global/global | 1 | 1 | 1 | 1 | 5 | mFlee 4, vFlee 1 | 2 | 1 | — |
| 73678 | 150 | 4 | 4 | national/national | 1 | 1 | 1 | 1 | 10 | evade 1, vFlee 5, mFlee 4 | 1 | 4 | companion 1, player 1 |
| BAND | med 150 | wave4 5/8, wave5 0/8 | max 4 | — | ever 8/8, final 7/8 | 5/8 | 4/8 | 4/8 | 87 | vFlee 42, mFlee 36, vDie 6, evade 3 (sums from per-seed rows; band outcome counts in summary) | 14 | 37 | 11 (player/companion only) |

Band distributions (armed, wave-3+ field fights, n = 87):
- Outcomes: vFlee 42, mFlee 36, vDie 6, evade 3, vKill 0.
  (Per-seed outcome rows above sum to vFlee 42 / mFlee 36 / vDie 6 /
  evade 3 — the summary's byOutcome rollup agrees.)
- mFlee split: rounds = 0 → 19 fights; rounds >= 1 → 17 fights.
  Of the 19 rounds-0 mFlee fights, 14 are STRICT wounded-repeats
  (start below the 15% line AND the previous fight of the type
  ended at exactly that health); the other 5 are 1 any-earlier
  link (a prior fight of the type ended at that health, but not
  the immediate predecessor) and 4 unlinked below-line arrivals
  (no prior fight of the type ending at that health) — reported,
  not counted toward the bar.
- Volley drive-offs: 0. Every rounds-0 mFlee row in the corpus has
  volley damage 0 or null (no bow) — the pre-round break check
  fires on ARRIVAL wounds, never on volley damage, in this band.
- Health at mFlee (n = 36): min 1, p25 1, median 33, p75 75,
  max 255. Health at vKill: no observations (n = 0) — the
  distribution the brief asked for has no vKill side, which is
  itself the finding.
- Cross-check (wrap-purity): kill-log wave-3+ kills = 11, all via
  player/companion tb paths; field vKills in the recorder = 0 and
  kill-log field-via wave-3+ kills = 0 — the recorder's zero is not
  a wrap miss. tb fights W3 = 37 rows captured via the
  pre-delegation fight-object capture (the tbEnd-null trap avoided;
  no post-call Game.tbfight reads anywhere in the recorder).

### Focus-case reproductions (from MY corpus, detail-mode verified)

Detail mode re-ran each focus seed armed and required census-match
(days/gameDays/ts/field rows/wounded-repeat counts) — all three
passed (censusMatch=true), so the sequences below describe the
census trajectories, not fresh runs.

- 73675 chorus_line (the headline case): d86 vFlee 300→257, d90
  vFlee 257→199, d91 mFlee r13 199→43, then d93, d101, d106, d114,
  d118, d120, d123, d127, d152, d156 — TEN further meetings, every
  one mFlee r0 at 1/300 (startFrac 0.003), mDealt 0, different
  villagers (maya_singh, nina_petrova, gen_ga57e51, somchai_prasert,
  meera_reddy). Nine of them count as STRICT (the d93 row is the
  first 1-HP meeting; its predecessor ended at 43, so it is the
  arrival, not the repeat). Zero wave-3+ kills on this seed at all
  (kill log has no W3 entry) — the village fought this chorus_line
  for 70 days and never finished it.
- 73677 chorus_line (the clean break-line crossing): d86 mFlee r15
  300→75, d89 mFlee r1 75→43, d94 mFlee r0 43→43, d95 mFlee r0
  43→43. 43/300 = 0.143 < 0.15 — the break line for this entity is
  45 HP, and the moment wounds crossed it, the fight became a
  zero-round flight with volleyDmg = 0 (no bow involved at all).
  This is the mechanism with nothing else in the way.
- 73678 spool (the named focus pattern, reproduced): d73 vFlee
  280→236→178→167, then mFlee r6 97→28, then d82 mFlee r0 1→1,
  d88 mFlee r0 1→1 (sofia_chen, volleyDmg 0). The wound-down arc
  works; the finish does not.
- 73674 (context, not a focus seed): 0 wave-3 field fights, 0
  wave-3 kills, waveReach 2 — the NEVER-FACED seed stays
  never-faced under this recorder too.

### Two things the corpus says that the hypothesis alone does not

1. THE 1-HP STATE IS BAND-WIDE, NOT WAVE-3-ONLY. Across all waves,
   452 field fights in the armed corpus start at exactly 1 HP
   (73671: 33, 73672: 14, 73673: 71, 73674: 98, 73675: 104, 73676:
   35, 73677: 43, 73678: 54), spanning wave-1 types (hushwolf,
   drumbelly_tanuki, living_wire) through wave-3. The stuck state
   is a general field-fight property, not a wave-3 quirk — but it
   bites hardest at wave 3+, where the break line is 36–63 HP and
   villagers flee or die before they can grind a monster down
   through it in one fight.
2. THE ARRIVAL AT 1 HP IS MOSTLY UNOBSERVED. Fights that END at
   exactly 1 HP from higher health are rare in the corpus (8
   events band-wide, e.g. 73675 d18 mirrormoth 35→1 mFlee/r4).
   The chorus_line on 73675 goes 43 (d91) → 1 (d93) and the spool
   on 73678 goes 28 (d73) → 1 (d82) with NO recorded field fight
   and NO tb fight in between (73675 has zero tb fights with
   chorus_line anywhere in the run; no tb rows at all on d92).
   Something outside the field/tb streams puts wounded entities
   at exactly 1 HP — candidates for the next arm, NOT claims:
   the tb door-flee stash floor (`Math.max(1, ...)` in game.js
   re-engage), a trap/wanderer respawn path, or a second entity
   of the same type wounded elsewhere. The next arm's job is to
   trace one arrival, not to re-prove the stuck state.

### Wall numbers (this corpus, tableseat-nowait substrate — NOT vanilla)

- National ever 8/8, national final 7/8; table waiting 5/8,
  entered 4/8; wins 4/8; wave-4 reach 5/8, wave-5 reach 0/8;
  max Arc 4; median survival 150 loop-days (range 93–180;
  death-aware: 73671 d93, 73672 d106, 73677 d98 ended early,
  the rest ran to 174–180 or the 180 cap).
- These numbers ride the default-OFF tableseat-nowait substrate
  (leanlinkrescue courtship + seat legs only). They say the
  substrate reaches national/table; they do NOT say vanilla does.
  The standing directive stands: wave 5 is still 0 on the band,
  and the field-finish wall is one of its locks — villagers cannot
  bank the wave-3+ kills the veteran/readiness bars demand
  (readiness wants killed wave-3+ veterans) when wounded monsters
  flee at round 0 forever.

### Sense-testing (NON-MEASURED narration replay, seed 73675)

Replay (narration on, 240 say-ring lines, endReason survived,
tableWaiting false) reproduced the same field census shape
(ffW3 37, same outcomes, woundedStrict 9) — reported as a
curiosity only, never as census evidence, since narration shifts
trajectories (gameDays 181 vs census 180).
Plain-words judgment: the fights read as scripted flights, not
finishable fights. A villager walks up to a monster the village
has already beaten nearly to death, and the monster leaves
before anyone swings — nine times over two months, with five
different villagers, while the village's kill board for wave 3
stays empty. Nothing in the narration explains why a 1-HP
monster is untouchable; from the village's side it looks like
the monster has a rule the villagers cannot see, and they keep
paying meetings to it. That is the opposite of a fight the
village can learn from: every meeting teaches "do not bother",
and the deed system records each flight as fight_survived, so
the village even gets credit for the stalemate.

### Villagers acting like people (sampled from the same corpus)

- The wound-down sequences read as real persistence: the same
  chorus_line met by different villagers over weeks, each fight
  leaving it weaker (300→257→199→43), is villagers sharing a
  problem across people, not one hero grinding. That part of the
  system behaves like a village.
- The failure mode reads as robotic only at the stuck point: a
  1-HP monster fled from, identically, by five different people
  with no variation, no escalation (no party formed, no trap set,
  no player-adjacent call for help recorded on those rows —
  calledHelp false, allyVid null on all nine strict repeats),
  and no memory carried into the next meeting beyond the wound
  itself. Villagers do not adapt to a repeatable, known-weak
  opponent; they re-run the same zero-round meeting.
- No dialogue sample in this corpus speaks to the stuck monster
  (the say ring is dominated by pantry/haul lines); that absence
  is itself a blank: the village never talks about the monster
  it cannot finish.

### Balanced panel (§15)

Attempted: `scripts/balance-panel.js compare` requires
`--before <panel.json.gz> --after <panel.json.gz> --out <prefix>`
(panel runs over capable/risk-aware/socialite/winseeker policies
from the panel harness). This diag corpus is per-seed recorder
rows over tableseat-nowait, not panel runs, so no panel pair
exists to compare — the tool errors on missing args, exactly
as documented in its usage line. Used instead: the sweep-compare
table above + the G2 identity proof (baseline vs armed identical
on all 8 seeds), which is the stronger statement for a zero-change
diag: there is no before/after delta to panel, because the
recorder provably changes nothing. If a future fix arm changes
combat, it must run the panel pair for real.

### Metric review

- The pre-registered bar survived contact with the data: strict
  linkage (immediate predecessor ending at exactly the start hp)
  was strict enough to exclude 1 any-earlier-linked and 4
  unlinked rounds-0 mFlee rows without excluding the real
  repeats, and the 2-of-3 / 5-band bars were both cleared with
  margin (3/3, 14). No revision proposed
  for the next run's bar — except that the next arm (origin of
  1 HP) needs a different bar entirely: a traced arrival, not a
  count.
- One metric gap, owned: the sweep's `tbW3` aggregate initially
  read the wrong key (analysis.w3.tbFightsW3 instead of
  analysis.tbFightsW3) and printed null; fixed before summarizing
  (tbW3 = 37) and the sense display key fixed the same way.
  No verdict input depended on it (G2/G3/G4 all use other fields),
  and the corrected summary was regenerated from the rows on
  disk. Lesson carried: aggregate keys get a unit check against
  one seed row before the band rollup.
- Baseline field columns are structurally zero (no rows by
  construction) — reported as such, never as "baseline had no
  field fights". The honest baseline statement is G2 identity.

### Process notes (loud, as required)

- The full sweep process vanished mid-run at armed 73675 (no node
  process left, no summary, no error surfaced to the caller).
  12/16 rows survived because every row is written incrementally
  via the writer subprocess. Recovery: scripts/
  test-fieldfinish-resume.js finished the four missing armed rows
  one seed per invocation using the sweep's own runOne (identical
  seeds/policy/writer), then rebuilt summary.json from the rows
  on disk with identical gate logic. Resumed rows are
  byte-equivalent to full-sweep rows (detail-mode census-match
  confirms it for all three focus seeds). If the vanishing
  recurs, per-seed invocation is the safer shape, not longer
  background sweeps.
- No EPERM flap hit this run's commits (none yet at write time);
  no safe-commit refusal. The flap note from the brief is
  recorded here so the coordinator knows this run did not meet it.

### Findings outside this arm (NOT chased; appended to sim-findings.md)

- Origin of 1-HP world entities (the 43→1 / 28→1 gaps) — the
  precise next blank for the scale-onramp axis.
- 1-HP stuck state is band-wide across all waves (452 fights) —
  a general field-fight property, not a wave-3 quirk.
- Redactor/terms_of_service mFlee rows at unchanged health
  (e.g. 73675 redactor d170/d172/d176 at 195→195) read as
  signature-mechanic dismissals (quiet-starve / loophole), not
  break-line flights — noted so a future arm does not mistake
  them for stuck-state rows. Not investigated further here.

### Deliverables

- Recorder: scripts/policies/fieldfinish-diag.js (FIELDFINISH=1).
- Sweep: scripts/test-fieldfinish-diag-sweep.js (--detgate,
  --detail, --sense modes; the sweep itself is the proof test).
- Resume driver: scripts/test-fieldfinish-resume.js (recovery
  only; documents the vanished-process incident).
- Corpus: evidence/2026-10-24/perseed-fieldfinish-a/ (16 rows +
  summary.json).
- Sense replay: evidence/2026-10-24/sim-fieldfinish-a-sense.txt
  (NON-MEASURED).
- This file: evidence/2026-10-24/sim-fieldfinish-a.md.
- DIAG ONLY: zero src/js changes, zero default flips, zero
  combat-code changes. No [needs-eyes] flag: measurement only.
  Ready to merge, pending ship (coordinator merges via --ff-only;
  no push, no bump, no live verification by this worker).

