# journey-scale r50 — Lane A, leg 3 SCALE (2026-10-28)

**Run id:** oversight-playtest-loop-20261028T1845Z. Rotation read 3 → leg 3 SCALE;
write 3→0 on completion.
**Base:** master@cb30d8f98 (batch ship 3a5c49f49-20261028-232504) at worktree creation.
**Pre-register:** evidence/2026-10-28/journey-scale-r50-prereg.md (written before
any seed ran). **Zero src/js changed by this run** — measurement only.
**Gating freeze honored; TACKLE ALL not claimed.**

## Verdicts (binding questions, answered)

### 1. SCALE-PARITY-R50: PARITY-EXCEPT-LABELS — and the labels are the finding
`node scripts/journey-scale-r50-compare.js 85001,85003` →
**OVERALL: DIVERGED by the compare's strict rule, but the full-diff audit
proves the divergence is label-only:** every differing line on both seeds
is a death-cause substitution out of the old fallback 'the arena'
(audit: evidence/2026-10-28/journey-scale-r50/journey-scale-r50-labelaudit.txt).
- Census scalars identical on both seeds (see below); covenant trusts
  identical; beats, moments, want, gov, trust, trustevents, trustset,
  hungerwatch, wantwatch, betray all IDENTICAL; transcripts d90 (both
  seeds) and d120 (85003) IDENTICAL. 85001 has no d120 transcript on
  either run — the village is gone by day 111, so there is nobody left
  to talk to; that absence matches on both sides.
- 85001: day 111, over=true, pop 0/0, pantry 0, rank regional,
  nationalDay 99, globalDay 104, seat lesser, arc 4, maxWave 4,
  pilgrimages 5, firstCourt 98, leaguePool 965. Covenant trusts 24/19/14.
- 85003: day 181, over=false, pop 7/7, pantry 46,089, rank global,
  nationalDay 142, globalDay 143, seat lesser, arc 4, maxWave 3,
  pilgrimages 8, firstCourt 141, leaguePool 32,822. Covenant trusts 64/70/56.
Per the prereg rule, the remaining r43 seeds (85002, 85004) are SKIPPED:
two label-identical seeds on a moved base already answer the question.
**What this proves:** the net game-code drift since r49 (arena-label +
arena-fallback, label-only; the reverted fieldfeed/perceptform/shoutgate
mechanisms leave zero residue in the game.js diff) moves NOTHING
mechanical on this band. Not a day, not a trust point, not a fight.
The scale trajectories are bit-stable apart from the death-cause words.

### 2. ARENA-LABEL-AT-SCALE: ANSWERED — the "arena chain" was a label artifact
Full-diff audit counts (each death appears twice: deathLog JSON + capture
death line):
- 85001: 26 label diffs = 13 deaths: 12 reclassified 'the wild', 1
  'a stranger' (August, day 65: 24 wild + 2 stranger lines). r50 deathLog
  arena-count: **0**. None of the 13 was a genuine contest-arena fight
  by the new classifier.
- 85003: 10 label diffs = 5 deaths: 3 'the wild', 2 'a stranger'
  (Cheyenne, Habiba). r49's 6th "arena" death — Thabo, day 179 — KEEPS
  'the arena' in r50: a genuine contest-arena fight (arenaContest live
  at tbEnd), exactly as the arenalabel code comment predicts.
- No betrayal / table-trial / coalition-arena label fires on this band.
**Reading:** r47–r49's "arena chain" framing is overturned in kind, not
in outcome. The leaders did not die in the arena — they died in the wild
(monster fights, no hostile fighter) and against strangers (alien-hostile
fights), and the old tbEnd loss path stamped every one of them 'the
arena'. The attrition is real (same names, same days, same die-out);
the venue was mislabeled. Succession sweeps that split arena deaths out
were counting wild/stranger deaths as arena deaths on this band. That
is a measurement correction for the arena/succession work, not a game
change from this run — and it confirms the label mechanism does what
its authors claimed: genuine arena losses keep 'the arena', everything
else now names itself. No outcome moves with the labels (Q3 holds).

### 3. ARENA-CHAIN WATCH: ANSWERED — chain recurs exactly, relabeled
- 85001: 13 bearer deaths, same names, same days as r49 — Alejandra,
  August, Catalina, Desmond, Jovan, Ava, Tupaq, Manuel, Quinn, Tariq,
  Grace, Suda, then Wanjiru last on day 111, and the village dies out
  with nobody left to carry the Codex. The r48→r49 tail (day-111
  die-out) HOLDS into a third base.
- 85003: 6 bearer deaths, same names as r49 — Patricia, Cheyenne,
  Habiba, Joshua, Raj, Thabo — and the village survives to the day-181
  cap. Five of the six are relabeled wild/stranger; Thabo alone stays
  arena.
Attrition, not a new mechanism, is still what ends 85001.

### 4. TABLE-APPROACH SENSE: ANSWERED — priced wait on both seeds, no seat taken
Quoted from THIS run's captures (not r49's):
- 85001: lesser seat, arc 4, waiting + announced, detail stage 3,
  w1 17 / w2 9 / w3 5 / w4 3 / w5 0. "SYSTEM: Species agency: unlocked.
  You are not at the table yet. But the table has your name now." and
  fireside "The table's set. The ring of pale light — it's just sitting
  there. Waiting on them."
- 85003: lesser seat, arc 4 from day 173 (waiting from day 74, announced
  day 90), detail stage 3, w1 18 / w2 9 / w3 3 / w4 0 / w5 0. "The table
  is being set for those whose deeds are done, and yours are not done.
  The ledger still wants: wave-3 monsters faced." Plus: "The table is
  being set — a lesser seat, priced for what you built. They are
  watching to see who comes to it."
Neither seed voices a seat-taker choice or a full-seat offer in-window;
neither sits. The wait reads as PRICED (a named deed gap on 85003, a
named seat on both), not a silent stall — but it is still a wait, and
the full seat stays unwon (w5 0 both).

## Village assessment (plain words)
- **85001 — the village that reaches for the world and then empties.**
  It climbs to national standing on day 99 and global on day 104, holds
  three covenant links (trusts 24/19/14 — thin, but alive), and reaches
  the lesser seat at arc 4, waiting with its name on the table. Then
  its leaders die one by one — thirteen of them, ending with Wanjiru
  on day 111 — until there is nobody left to pick up the Codex. What
  this run corrects is WHERE they died: not in the arena, as three
  runs of notes said, but out in the wild and against strangers. The
  pantry is empty at the end, but this is still not a starvation
  story: it is a leadership story. The village does not run out of
  food first; it runs out of people willing and able to stand in front.
- **85003 — the village that holds.** Seven of seven alive at the
  day-181 cap, pantry 46,089 kcal, global since day 143, covenant
  trusts strong (64/70/56), league pool 32,822. Six bearer deaths hurt
  but do not break it. It waits at the lesser seat with a named price
  still unpaid (wave-3 monsters faced). This is the picture of a
  village that could sit — if it ever faced what the ledger wants.

## People check (full transcript read, not assumed)
- **85001 day 90 — Daniyar (paramedic, gentle, trust 25), want curious.**
  Read in full from r50's own file (compare says IDENTICAL to r49, but
  the read is this run's). He opens worried about noises past the
  treeline, the player says they heard them too, and he tells how he
  now sleeps in shifts — two hours, up, listen, two more — a body that
  learned before his head agreed, Almaty never having taught him that.
  Closes: "Thanks for listening. I mean that." The NPC wants
  reassurance and a witness; the options engage it; the ending resolves
  with gratitude. No fabricated shared history, no filler loop. GO,
  unchanged.

## Reachable / fun / winnable (leg 3)
- **REACHABLE: yes for scale content.** National, global, court, lesser
  seat, arc 4, and the priced wait all fire in-window on both seeds.
  The full seat is the unreachable part (w5 0 both) — the wall is
  unchanged in kind since r42.
- **FUN: yes, with the known ache.** The transcripts are people talking
  like people; the bearer-death chain is dramatic. The ache is 85001's
  tail: thirteen leaders dying one after another with no choice point
  visible in-window reads as attrition the player watches, not a fight
  the player shapes. That is the r48/r49 finding, unchanged — now with
  the venue corrected to the wild.
- **WINNABLE: lesser yes, full no (on this band).** A lesser seat waits,
  priced and announced. The full seat needs wave-5 contact that never
  happens here, and neither of today's landed mechanisms moves it.

## Blank filled or documented
No game fix from this run — parity-except-labels means there is nothing
mechanical to fix from this evidence, and inventing one would violate
the measurement discipline. Documented instead: (a) the arena-chain
reclassification — succession/arena counts on this band must stop
treating these deaths as arena deaths; (b) the reverted mechanisms
(fieldfeed, perceptform, shoutgate) leave zero residue on the scale
band; (c) the 85001 die-out tail stable across r48→r49→r50. No src/js,
no [needs-eyes]: nothing here needs Steve's eyes on his phone —
nothing a player would feel changed, because nothing mechanical changed.

## Metric review
- SCALE-PARITY-R50 held as PARITY-EXCEPT-LABELS: the prereg's clause (a)
  (trust JSONs identical) failed literally — deathLog cause strings are
  inside the trust JSON — but the audit proves every JSON diff is a
  cause-label substitution, the hypothesized effect. Refinement for the
  NEXT parity prereg: state the trust-JSON rule as "identical except
  deathLog cause strings," and run the full-diff label audit as the
  verdict instrument instead of the compare's capped samples. No
  mid-run re-scoring: the audit ran after the compare, on the same
  files, and its zero-non-label result is what the verdict rests on.
- ARENA-LABEL-AT-SCALE / ARENA-CHAIN / TABLE-APPROACH all ANSWERED with
  counts and quoted lines, per their verdict rules.
- Telemetry-check step: tenth confirmation of the same shape mismatch
  (see below). The step is process debt, not a finding; it should be
  seeded journey-shaped or dropped for journey runs, and this run does
  not re-litigate it beyond recording the count.

## Telemetry deviation check (step 14 — NOT rolled, tenth confirmation)
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale.json
--current 'evidence/2026-10-28/journey-scale-r50/journey-scale-r50-trust-*.json'
--metrics markerCounts.firstCourt,markerCounts.watchers,tableTele,fightsTotal,fightsByWave.4,maxGameDay`
→ (filled at closeout — see TELEMETRY section below.)

## Tests
- `node --check` clean on both new scripts (r50 driver + r50 compare).
- `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
  (filled at closeout — see CHECK-QUICK section below.)
- Compare script cosmetic fixes, made before the verdict was committed
  but after the first compare run: stale print labels (census header
  said r48|r49; covenant header said r48|r49; missing-file lines said
  r47/r48 and r48/r49) corrected to r49|r50, then the compare re-run
  to the same verdict. Labels only; no comparison logic touched. (Same
  class of cosmetic fix r49 made to its own compare.)

## Infrastructure notes (for the next run)
- Heartbeat loop (10-min cadence) verified landing in the registry after
  start (heartbeat_at fresh; loop process alive at last check). Stopped
  at closeout.
- The scale driver console-dumps the full trust JSON per seed — noisy
  (244KB of stdout for two seeds) but harmless; a future driver copy
  could trim it to the summary line.

## TELEMETRY (filled at closeout)
5 LOUD lines, all "disappeared: baseline N → current 0 (n=2 files)" —
the same vacuous shape mismatch as r42–r49 (the journey trust JSONs do
not carry those fields at all). Verdict: NOT a real deviation. NOT rolled.

## CHECK-QUICK (filled at closeout)
`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
**284 passed, 6 failed in 779s** (290 scripts — the same 284/6 profile as
r49 and deepening r61). The suite tail names the racks-full gate failure
(test-establishment-r20-fixes-20261020, already recorded as reproducing
on pristine master in Lane B r63's note); the other five r49 failures
were re-confirmed directly where directly runnable
(measurement-workflow, mobile-combat-cadence, occupation-panels,
phone-frame-proof all fail standalone; measurement-proof-update errors
on standalone invocation and is counted via the suite total). Zero
regressions attributable to this run: its change set is two driver
scripts plus evidence, zero src/js, and no quick-list test imports
either new script. Worktree status after the suite: only this run's
entries — no suite-touched ONTOLOGY or stray evidence writes.
