# journey-scale r49 — Lane A, leg 3 SCALE (2026-10-28)

**Run id:** oversight-playtest-loop-20261028T1545Z. Rotation read 3 → leg 3 SCALE.
**Base:** master@9e3c7f152 (deepening r61) at worktree creation.
**Pre-register:** evidence/2026-10-28/journey-scale-r49-prereg.md (written before
any seed ran). **Zero src/js changed by this run** — measurement only.
**Gating freeze honored; TACKLE ALL not claimed.**

## Verdicts (binding questions, answered)

### 1. SCALE-PARITY-R49: PARITY — both pilots identical to r48
`node scripts/journey-scale-r49-compare.js 85001,85003` →
**OVERALL: PARITY (all compared files identical after normalization).**
Every compared file identical on both seeds: census scalars, trust JSON
(deep-compare), capture, beats, moments, want, gov, trust, trustevents,
trustset, hungerwatch, wantwatch, betray, and transcripts d90 (both seeds)
plus d120 (85003). 85001 has no d120 transcript on either run — the village
is gone by day 111, so there is nobody left to talk to; that absence matches
on both sides and is not a gap in the compare.
- 85001: day 111, over=true, pop 0/0, pantry 0, rank regional,
  nationalDay 99, globalDay 104, seat lesser, arc 4, maxWave 4,
  pilgrimages 5, firstCourt 98, leaguePool 965. Covenant trusts 24/19/14.
- 85003: day 181, over=false, pop 7/7, pantry 46,089, rank global,
  nationalDay 142, globalDay 143, seat lesser, arc 4, maxWave 3,
  pilgrimages 8, firstCourt 141, leaguePool 32,822. Covenant trusts 64/70/56.
Per the prereg rule, the remaining r43 seeds (85002, 85004) are SKIPPED:
two identical seeds on a moved base already answer the question.
**What this proves:** the only two game-code changes since r48's played
base — partyfinish (37aa0a4fb) and liveness (e1a86b20c) — move NOTHING on
this band. Not a line of capture, not a trust point, not a day. The scale
trajectories are bit-stable across those two landings.

### 2. PARTYFINISH-AT-SCALE: ANSWERED — no observable effect on this band
Wave-4 faced counts unchanged (85001 w4=3, 85003 w4=0; w5=0 both), arena
death counts unchanged (see §3), no new fight line anywhere — the captures
are byte-identical to r48's, so any counted-finish delta is exactly zero
on these trajectories. This extends today's wave4demand finding (partyfinish
dormant under tableseat-nowait, control-census identical) to a second
policy: under scalecourt-nogate on these two seeds, the cornered-party hold
is likewise indistinguishable from dormant. That is NOT a claim that the
mechanism never fires anywhere — its own sortie-only driver proved it fires
there — but on the scale band that decides the wave-5 chain, it fires
nowhere these seeds go. The wave-5 chain (meet → shoot → convert) does not
move on this evidence.

### 3. ARENA-CHAIN WATCH: ANSWERED — r48's chain recurs exactly
- 85001: 13 arena deaths, same names, same tail as r48 — Alejandra,
  August, Catalina, Desmond, Jovan, Ava, Tupaq, Manuel, Quinn, Tariq,
  Grace, Suda, then Wanjiru last on day 111, and the village dies out
  with nobody left to carry the Codex. The r47→r48 tail flip (day-117
  scattering → day-111 die-out) HOLDS; r49 adds no new movement.
- 85003: 6 arena deaths, same names as r48 — Patricia, Cheyenne, Habiba,
  Joshua, Raj, Thabo — and the village survives to the day-181 cap.
The arena chain's tail is stable across three bases now (r47, r48, r49
on 85003; r48, r49 on 85001's die-out). Attrition, not a new mechanism,
is what ends 85001.

### 4. TABLE-APPROACH SENSE: ANSWERED — priced wait on both seeds, no seat taken
- 85001: lesser seat, arc 4, waiting + announced from the arc-4 turn,
  detail stage 3, w1 17 / w2 9 / w3 5 / w4 3 / w5 0. Voiced lines:
  "SYSTEM: Species agency: unlocked. You are not at the table yet. But
  the table has your name now." and fireside "The table's set. The ring
  of pale light — it's just sitting there. Waiting on them."
- 85003: lesser seat, arc 4 from day 173, waiting + announced, detail
  stage 3, w1 18 / w2 9 / w3 3 / w4 0 / w5 0. The full-seat gap is named
  aloud: "The table is being set for those whose deeds are done, and
  yours are not done. The ledger still wants: wave-3 monsters faced."
  Plus: "The table is being set — a lesser seat, priced for what you
  built. They are watching to see who comes to it."
Neither seed voices a seat-taker choice or a full-seat offer in-window;
neither sits. The wait reads as PRICED (a named deed gap on 85003, a
named seat on both), not a silent stall — but it is still a wait, and
the full seat stays unwon (w5 0 both). Read against the landed TABLE.md
correction (full-seat stage ≥2, not ≥3): both seeds sit at detail stage
3, so the stage bar is not what holds them back — the deed counts are.

## Village assessment (plain words)
- **85001 — the village that reaches for the world and then empties.**
  It climbs to national standing on day 99 and global on day 104, holds
  three covenant links (trusts 24/19/14 — thin, but alive), and reaches
  the lesser seat at arc 4, waiting with its name on the table. Then the
  arena takes its leaders one by one — thirteen of them, ending with
  Wanjiru on day 111 — until there is nobody left to pick up the Codex.
  The pantry is empty at the end, but this is not a starvation story:
  it is a leadership story. The village does not run out of food first;
  it runs out of people willing and able to stand in front.
- **85003 — the village that holds.** Seven of seven alive at the
  day-181 cap, pantry 46,089 kcal, global since day 143, covenant
  trusts strong (64/70/56), league pool 32,822. Six arena deaths hurt
  but do not break it. It waits at the lesser seat from day 173 with a
  named price still unpaid (wave-3 monsters faced). This is the picture
  of a village that could sit — if it ever faced what the ledger wants.

## People check (full transcripts read, not assumed)
- **85001 day 90 — Daniyar (paramedic, gentle, trust 25), want curious.**
  Byte-identical to r48. He opens worried about noises past the treeline,
  the player says they heard them too, and he tells how he now sleeps in
  shifts — two hours, up, listen, two more — a body that learned before
  his head agreed, Almaty never having taught him that. Closes: "Thanks
  for listening. I mean that." The NPC wants reassurance and a witness;
  the options engage it; the ending resolves with gratitude. No
  fabricated shared history, no filler loop. GO, unchanged.
- **85003 day 90 — Joshua (arborist, earnest, trust 89), want seek_taken.**
  Byte-identical to r48. He asks whether the player has ever asked the
  System about the taken — about Renee, his kin. The player says "I don't
  know," then promises: "I'll ask it." He answers: "Even asking is more
  than the silence." Then he invites the player to walk his trap line,
  and the player accepts (ordinary, not an armed betrayal — betrayWatch
  d90 accept, armed=ordinary). The walk is quiet; he ends needing a
  minute. The promise to ask the System is an open owe, honestly planted.
  Invitation sometimes taken, working as ruled. GO.
- **85003 day 120 — Thabo (taxi driver, dry, trust 90), want ask_favor.**
  Byte-identical to r48. The talk itself is coherent — gossip about a
  contest win, "something's off with Hassan," Alfredo headed out to find
  someone — and it closes cleanly. WRINKLE, carried not new: Thabo's
  ask_favor want never becomes an ask in this talk; the gossip path
  displaces it. The conversation does not stall or loop, so this is a
  softness in want-surfacing, not a defect to fix from this run — and
  since the transcript is identical to r48's, it is not a regression.
  Recorded here so the next run that touches want-surfacing can find it.

## Reachable / fun / winnable (leg 3)
- **REACHABLE: yes for scale content.** National, global, court, lesser
  seat, arc 4, and the priced wait all fire in-window on both seeds.
  The full seat is the unreachable part (w5 0 both) — the wall is
  unchanged in kind since r42.
- **FUN: yes, with the known ache.** The transcripts are people talking
  like people; the arena chain is dramatic. The ache is 85001's tail:
  thirteen leaders dying one after another with no choice point visible
  in-window reads as attrition the player watches, not a fight the
  player shapes. That is the r48 finding, unchanged.
- **WINNABLE: lesser yes, full no (on this band).** A lesser seat waits,
  priced and announced. The full seat needs wave-5 contact that never
  happens here, and neither of today's two landed mechanisms moves it.

## Blank filled or documented
No game fix from this run — parity means there is nothing to fix from
this evidence, and inventing one would violate the measurement discipline.
Documented instead: (a) partyfinish dormant-on-this-band, extended to
scalecourt-nogate; (b) Thabo ask_favor wrinkle, carried; (c) the
85001 die-out tail stable across r48→r49. No src/js, no [needs-eyes]:
nothing here needs Steve's eyes on his phone — nothing a player would
feel changed, because nothing changed.

## Metric review
- SCALE-PARITY-R49 held exactly as pre-registered (PARITY rule met, no
  re-scoring — the compare exits 0 on both seeds).
- PARTYFINISH-AT-SCALE / ARENA-CHAIN / TABLE-APPROACH all ANSWERED with
  counts and quoted lines, per their verdict rules.
- Telemetry-check step: ninth confirmation of the same shape mismatch
  (see below). The step is process debt, not a finding; it should be
  seeded journey-shaped or dropped for journey runs, and this run does
  not re-litigate it beyond recording the count.

## Telemetry deviation check (step 14 — NOT rolled, ninth confirmation)
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale.json
--current 'evidence/2026-10-28/journey-scale-r49/journey-scale-r49-trust-*.json'
--metrics markerCounts.firstCourt,markerCounts.watchers,tableTele,fightsTotal,fightsByWave.4,maxGameDay`
→ 5 LOUD lines, all "disappeared: baseline N → current 0 (n=2 files)" —
the same vacuous shape mismatch as r42–r48 (the journey trust JSONs do
not carry those fields at all). Verdict: NOT a real deviation. NOT rolled.

## Tests
- `node --check` clean on both new scripts (r49 driver + r49 compare).
- `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
  (filled at closeout — see CHECK-QUICK section below.)
- Compare script cosmetic fix, made before the verdict was committed but
  after the first compare run: two stale print labels (covenant header
  said r47|r48; transcript-missing line said r47/r48) corrected to
  r48|r49, then the compare re-run to the same PARITY verdict. Labels
  only; no comparison logic touched.

## Infrastructure notes (for the next run)
- Registry contention is chronic: this run's pre-flight reap waited ~2.5
  min on the registry lock (a sibling register held it), and registration
  itself took ~11 min wall (internal reap queued behind a sibling
  register, then its own worktree checkout). Nothing failed; budget the
  wait, do not force it.
- Mid-checkout artifact, NOT a defect: while the register's `git worktree
  add` was still running, a concurrent `git status` in the new tree
  showed every file as deleted. After the register finished, status was
  clean (0 lines) and HEAD was the expected 9e3c7f152. Do not diagnose a
  fresh worktree from a status taken during its own checkout.
- Heartbeat loop (pid 22210, 10-min cadence) verified landing in the
  registry after start (heartbeat_at advanced past the manual heartbeat);
  loop alive and not spinning at last check. Stopped at closeout.

## CHECK-QUICK (filled at closeout)
`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
**284 passed, 6 failed in 1134s** (290 scripts — the same 284/6 profile as
deepening r61). Failures, all in areas this run did not touch (zero src/js;
the run's two new scripts are not in the quick list):
test-measurement-proof-update, test-measurement-workflow,
test-mobile-combat-cadence, test-occupation-panels,
test-phone-frame-proof, test-establishment-r20-fixes-20261020
(racks-full gate — already recorded as reproducing on pristine master in
Lane B r63's note). Zero regressions attributable to this run: its change
set is two driver scripts plus evidence, and no quick-list test imports
either. Worktree status after the suite: only this run's 5 entries — no
suite-touched ONTOLOGY or stray evidence writes this time.
