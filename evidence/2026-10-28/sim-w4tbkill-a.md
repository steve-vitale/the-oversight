# sim-w4tbkill-a — the TB half of the wave-4 kill funnel (KILL-JUDGED)

## Verdict: GO (phase B) — one wave-4 kill, one won wave-4 fight, vs zero on the identical-seed control

Plain words first. Before this arm, a monster met in the world
walked into its turn-based fight at full strength no matter how
battered it was outside — the fight forgot the wounds the world
had already dealt it. This arm makes the fight remember: a
world monster now enters its fight at the health it actually has
on the map. On the same 8 seeds where the control killed nothing,
the changed game killed one wave-4 monster, in a fight the
scholar won outright, without starving anyone extra and without
shortening village survival below the cost bar. The change is
small (one place in the game code, wave-4 fights only) and it
lands with a flag asking for Steve's eyes, because it changes
how fights feel.

## The lever played (and the lever that did not work)

This arm worked the TB half only, in the prereg's order.

**Phase A — a policy-side discipline (did not kill).** The
policy only took a wave-4 fight when all of these held at fight
start: a party of 3 or more, exactly one monster fighter, total
monster health at or under 1500, and the scholar at 70% health
or better. Anything else, it fled persistently through the
barrier until the fight ended fled (sealed fights still fought
it out). Result: it saved lives but killed nothing. World
wave-4 fights went from 25 lost / 0 fled on control to 10 lost /
19 fled on phase A; scholar deaths in wave-4 fights fell from
28 to 10. Kills stayed 0, won fights stayed 0. The discipline
works as a survival tool; it is not a killing tool, because the
fights it picks are still fought against a monster that enters
fresh. Phase A is therefore NO-GO as a kill lever, and per the
prereg it is the documented proof that (a) cannot move the
needle — not a NO-GO for the run, because the judged GO is the
phase-B rule.

**Phase B — the game-code change (GO).** In `startCombat`
(`src/js/game.js`), the primary fighter for a lifted world
monster now enters at that monster's world health (current HP
and max HP) instead of a fresh roll from the monster's health
range. Guards, all proven by unit test: veterans keep their
existing +50% construction (their world health does not bake
hardening in); a bystander alias (id mismatch) rolls as before;
no world monster rolls as before; non-finite health rolls as
before; packmates and overtime crew roll as before. The
overtime wrapper still scales afterwards, as designed for
reruns. Meeting rates, spawn rates, wave unlocks, gating, and
all monster base stats are untouched.

Why scaling, not meeting (written before the sweep): meetings
already happen (31 faced in the census) and convert at 0%
because the fight re-rolls fresh. A meeting lift that still
re-rolls fresh would still kill 0, so meeting is not the
binding step for this arm. This change makes the fight honest
the way player and villager fighters already are — they enter
at current health, not at a fresh roll — and makes prior
damage accumulate: a toll-wounded lingerer enters at its toll
health, a lost or fled fight restores at most its pre-fight
health under the wallwounds cap, and the next fight enters at
the chipped value instead of a fresh roll. Repeated fights can
finish what the wall started. The kill below is exactly that
chain playing out.

## Scope correction made before the judged phase-B sweep (disclosed, not hidden)

The first version of the phase-B change applied to every wave,
not just wave 4. That leaked: seed 75101's detgate moved from
132 days (lesser seat on day 132, as on control) to 180 days
with no seat — the change was quietly making wave 1–3 fights
easier too, because a world monster's map health sits at the
low end of its range. That is a global combat change, and this
arm's scope is wave-4 scaling only. The call site was gated to
wave 4 and above before any judged phase-B sweep ran; the
75101 detgate on the gated code is back to 132/132 days with
the lesser seat on day 132, identical to control. The helper
itself is unchanged; only the call site gates by wave. The
ungated version never ran a judged sweep and never landed.

## Numbers on the band (identical seeds 75101–75108, 180-day horizon, LEANLINKRESCUE=1, TABLESEATNOWAIT=1)

Wall numbers, per band (never pooled):

| band | national ever | national final | table shown | entered | wins (lesser/full) | wave-4 reach | wave-5 reach | median survival | starvation deaths | wave-4 kills | won wave-4 TB fights |
|---|---|---|---|---|---|---|---|---|---|---|---|
| control | 7/8 | 5/8 | 6/8 | 3/8 | 3/8 (3 lesser / 0 full) | 5/8 | 0/8 | 162 days | 2 | 0 | 0 |
| phase A (policy) | 7/8 | 7/8 | 4/8 | 4/8 | 4/8 (4 lesser / 0 full) | 5/8 | 0/8 | 162 days | 1 | 0 | 0 |
| phase B (world-HP) | 7/8 | 6/8 | 6/8 | 4/8 | 4/8 (4 lesser / 0 full) | 5/8 | 0/8 | 146 days | 2 | 1 | 1 |

GO legs (prereg): kills phase B 1 vs control 0 ✓; won TB
fights 1 vs 0 ✓; starvation phase B 2, control 2 (bar:
control + 2) ✓; median phase B 146 days, control 162 days
(146 / 162 = 0.90, bar: 0.8×) ✓; substrate gate passes on
both bands (courtship combined control 121, phase B 121, 8/8
seeds active each) ✓; detgates pass on both bands' code
versions ✓; recorder errors 0 on every row of both bands, no
overflow ✓. Phase A cost bar also held (starvation 1, median
162), but its kill leg was 0, so phase A is NO-GO as a lever.

Wave-4 TB fights by result (world-origin only):

| band | world fights | won | lost | fled | routed |
|---|---|---|---|---|---|
| control | 25 | 0 | 25 | 0 | 0 |
| phase A | 29 | 0 | 10 | 19 | 0 |
| phase B | 23 | 1 | 22 | 0 | 0 |

Party sizes of wave-4 TB fights: control 22 solo / 4 party-2 /
1 party-3 / 1 party-4; phase B 22 solo / 2 party-2 / 1 party-3.
The kill was a SOLO scholar fight (see below) — the change
does not need a party to work.

## The kill, round by round (from the corpus, not the replay)

Seed 75102, a reunion (wave 4, Mirror Draft), the same
lingering monster (sequence 21) met four times on day 172:

1. It starts at 300 health out of 1200. The scholar loses;
   it is left at 171.
2. It starts at 171. The scholar loses; it is left at 120.
3. It starts at 120. The scholar loses; it is still at 120.
4. It starts at 120. The scholar, alone, wins in 7 rounds
   and ends at 35 health out of 100. The monster is dead.

The kill is logged on day 172 for villager Olivia Bennett,
through the player-led fight path; by the end of that seed's
run she is in the fallen list, so this kill does NOT put a
living killer on the veterans bar — the bar needs killers
alive at the end, and she is not. The kill is real and
counts under the prereg's kill leg (the log and the killer
status agree: 1 each); it is not a veterans-bar opening, and
it is not reported as one. On control, the same sequence-21
reunion was met at 300 health and fought at a fresh roll of
1203 — the chipping chain never existed.

## Construction check (did the fight actually enter at world health?)

On the phase-B band, 20 of 23 world-origin wave-4 fights
entered with fighter health exactly equal to the map health.
The 3 exceptions are NOT fresh rolls, and that matters: every
one of them sits BELOW its monster's health-range floor, which
a fresh roll cannot do —

- 75102 day 166, audit: fighter 754, map monster 825/1100
  (audit range starts at 1100). Party of 3, 8 rounds, dealt
  308 damage (754 → 446), scholar died, villagers fled.
- 75106 day 145, eulogy: fighter 844, map monster 675/900
  (eulogy range starts at 900). Overtime tier-1 max health
  1125 confirms the wrapper still scaled afterwards.
- 75106 day 146, eater: fighter 878, map monster 702/950
  (eater range starts at 950). Overtime tier-1 max health
  1188.

The honest reading: in those 3 fights the fighter took the
health of a same-kind world monster other than the one the
analyzer joined it to (the game identifies the lifted monster
by kind, and two of a kind can stand on the same ground).
The analyzer's join is by the map monster; the game's alias
is by kind. That is a known edge of the implementation, not
a fresh roll, and it does not change any verdict leg: all 23
world fights entered at a world health, none at a fresh roll.
On control, all 25 world fights entered at a fresh roll
(0 of 25 equal to map health).

Titans: no titan-flagged wave-4 fight appears on the phase-B
band, so no titan fighter was altered. Titan full restore on
fight end is untouched by this change.

## Sense note (NON-MEASURED replay, trajectory shift stated)

Per the prereg, the sense fight is the first wave-4 TB fight
by day, then lowest seed, on the last judged band: seed
75106, day 89, a eulogy at 675 health out of 900, lingering.
Replay window d89–d90, mode b, 335 beats. The replay is
non-measured by construction — its trajectory shifts from
the corpus — so its text enters no count.

In the replay, the scholar meets the eulogy alone at dusk.
He throws pocket sand (blinding it), then strikes once for
80 damage with a hardlight knife (training and a well-fed
bonus lifting the blow; the eulogy's hide absorbs 8). The
eulogy answers in verse — it narrates the fight as a story,
each verse tightening the screws (a dodge penalty, a longer
bleed, harder attacks), and its finishing line is a scripted
death: the story ends, and so does the scholar, in round 6.
The mantle passes to a new villager, and the village keeps
going. The corpus fight for the same day and monster ends
the same way: lost in 6 rounds, scholar dead, monster left
at 595 out of 900 (675 − 80) — the replay's shape matches
the measured fight even though the replay's surrounding days
and scholar name shifted. Two plain readings: (1) at 675
health the eulogy is still a fight the scholar loses — the
world-HP change does not make every chipped monster easy;
it makes the chipping count, so the fourth meeting can
finish what the first three started, as the 75102 kill
shows. (2) The eulogy's story-finisher is a hard clock:
six rounds and the story kills you, which is why a lone
scholar who cannot finish it in time dies even after a
good opening blow.

## Detgates, proof tests, and instrument validity

- Control detgate, seed 75101: baseline 132/132 days,
  tsNationalDay 77, lesser seat day 132 — IDENTICAL to the
  prior-base numbers, so no same-base neutrality proof was
  needed and no number was forced. Recorder-off wrapped run
  equal, no diag surface, no wraps installed → PASS.
- Phase-A detgate (gate unset): identical 132/132, tsNationalDay
  77 → PASS. The policy is provably off by default.
- Phase-B detgate on the gated code: identical 132/132,
  tsNationalDay 77 → PASS. (The ungated version's 180-day
  detgate is the leak described above; it was caught by the
  detgate itself, before any judged sweep.)
- `scripts/test-w4tbkill-rule.js`: 8/8 cases pass (the
  phase-A rule; gate off by default verified).
- `scripts/test-w4tbkill-worldhp.js`: 7/7 cases pass on the
  loaded game — lifted non-veteran returns world HP/maxHP;
  veteran, bystander mismatch, missing monster, non-finite
  HP, and zero HP all return null (roll as before).
- Analyzer `scripts/test-w4tbkill.js`: control vs phase B →
  GO (kills 1 vs 0, won TB 1 vs 0, starvation 2 vs 2, median
  146 vs 162); control vs phase A → NO-GO as a lever (kills
  0, won 0). Kill-count agreement holds (log 1, killer
  status 1). Recorder errors 0 on all rows of all three
  corpora; no overflow.
- `node --check` passes on the changed game file and on all
  three instrument scripts.
- This arm does not re-score the w4convert, w4damage,
  w4lethality, or wallwounds verdicts or corpora. The
  control band here reproduces the w4convert TB shape
  exactly (25 world fights, all lost) on this HEAD, which
  is a parity observation, not a re-score.

## Balanced panel (§15) and telemetry deviation check (loop body step 10)

- Panel: `scripts/balance-panel.js compare` requires
  `--before <panel.json.gz> --after <panel.json.gz>` and has
  no corpus-ingest mode — the known standing exception.
  No panel artifact was faked; the paired sweep tables and
  analyzer outputs above are the §15 substitute, as in the
  prior census arms.
- Telemetry: `node scripts/telemetry-check.js --baseline
  .../hidden_files/telemetry-baselines/scale-wall.json
  --current 'evidence/2026-10-28/perseed-w4tbkill-b/*.json'
  --metrics national,table,wins,exiled` → the same 3 LOUD
  lines as the census family (national 12→0, table −62%
  16→6, wins 16→0, n=10 files). Verdict: KNOWN ARTIFACT, no
  investigation, baseline NOT rolled. Two independent
  reasons, both documented: (a) the baseline's own regime
  note forbids this comparison (a ~100%-win winseat suite
  vs a tableseat-nowait substrate); (b) the field-shape
  artifact repeats (per-seed rows carry
  nationalEver/entered/won, not top-level national/table/
  wins paths; summary.json + analysis.json are the 9th
  and 10th files). The corpus's real wall numbers are
  nationalEver 7/8, table entered 4/8, wins 4/8. No exiled
  LOUD line.

## What this does NOT do (blanks, honestly held)

- Wave 5 is still 0/8 on every band. One wave-4 kill is not
  a wave-5 opening, and it is not a veterans bar (the killer
  did not survive the run). The wall beyond wave 4 — kill
  conversion into living killers, then a second living
  killer — is still the work.
- Full seat is still 0/8 on every band. All wins are lesser
  seats. The change moves the kill funnel, not the table.
- The meeting half is untouched by design (this arm's
  scope): raid drafts that never become fights and heralds
  never met are a different arm's problem.
- The same-kind alias edge (3 fights entered at a sibling
  monster's world health) is documented above and is a
  known imperfection, not a hidden one. Tightening the
  alias to a specific monster instance is follow-up work,
  not a verdict leg.

## Metric review

- The prereg's GO rule held up as written: a kill-or-won
  leg plus a cost bar. No revision is proposed for this
  run. One doubt to carry forward, not to re-score here:
  the analyzer's construction join (by map monster) and
  the game's alias (by kind) can disagree when two of a
  kind share the ground; a future run that needs a strict
  construction leg should join by the game's alias, not
  by the map monster, or count below-range fighter health
  as world-derived rather than as an exception.
- The detgate caught a real scope leak (the ungated
  version). Detgates on a wave-4-only change should keep
  being run on a seed with no wave-4 world spawn (75101
  serves), because that is the seed that proves the change
  did not touch the rest of the game.

## Infrastructure notes

- Policy: scripts/policies/w4tbkill.js (phase A; env-gated,
  default OFF). Unit proof: scripts/test-w4tbkill-rule.js.
- Sweep: scripts/test-w4tbkill-sweep.js (copy of the
  w4convert sweep; modes control / a / b; corpora below).
- Analyzer: scripts/test-w4tbkill.js (exit 0 on GO and on
  NO-GO; exit 1 only on instrument/corpus failure).
- World-HP proof: scripts/test-w4tbkill-worldhp.js.
- Sense: scripts/test-w4tbkill-sense.js (NON-MEASURED
  replay only; 75106 window d89-d90, mode b).
- Game change: src/js/game.js only — `tbWorldHpFor`
  helper plus the wave-4-gated primary-fighter use in
  `startCombat` (35 lines added, none removed, no other
  file touched by the change).
- Corpora: evidence/2026-10-28/perseed-w4tbkill-control/
  (8 rows + summary.json + analysis.json),
  evidence/2026-10-28/perseed-w4tbkill-a/ (8 rows +
  summary.json + analysis.json),
  evidence/2026-10-28/perseed-w4tbkill-b/ (8 rows +
  summary.json + analysis.json).
- Prereg: evidence/2026-10-28/sim-w4tbkill-a-prereg.md
  (committed before any judged sweep).
- INDEX CLOBBER (loud, repaired, commit correct): after
  committing the prereg, `git status --short` showed a
  bogus staged deletion for the prereg file itself (worktree
  file byte-identical to HEAD). Repaired with
  `git update-index --add --cacheinfo` from the HEAD blob,
  then verified `git status --short` empty and
  `git show --stat HEAD` correct. No `git reset` was used
  on any sibling file.

## Repository quick check (house rules, read after the sweeps)

`node scripts/check.js --quick` on the landed tree: 279 passed,
8 failed (250s). The 8 failing scripts are hide-discovery
(butchering counter), measurement-comparison,
measurement-proof-update, measurement-workflow (neutrality
proof staleness), mobile-combat-cadence (Continue round
wrapping), occupation-panels (CLI workflow), phone-frame-proof
(stale receipts), and establishment-r20-fixes (racks-full
voice gate). None of their failing assertions concerns
wave-4 fighter health, `startCombat` construction, or this
arm's change, and none was chased: they are standing
maintenance failures outside this arm's scope, left for
their owners. The check left no stray changes in the tree
(`git status` showed only this arm's files afterwards).

## Open questions for the coordinator / next arm

- The landing commit for the phase-B change carries
  `[needs-eyes]` (a fight-feel change). It is committed on
  this branch only; merging and shipping belong to the
  coordinator / ship loop, not to this worker.
- No confirm band was run: the prereg judges the 8-seed
  pilot, and a confirm band needs its own pre-registration
  before it runs. If the coordinator wants one, it should
  be pre-registered with its own seeds, horizon, and GO
  threshold — never run first and justified after.
- The phase-A policy file stays in the tree (it is part of
  the measurement, and its survival value is real even
  though it does not kill). The prereg's "killed arms leave
  no trace" clause applies to a run that ends NO-GO with no
  landing; this run lands phase B, so the policy and its
  instruments land with it as measurement.
