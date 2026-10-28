# Journey crisis r59 — THE DOOR ONLY GOES QUIET WHEN THE TREELINE IS CLEAR (lane B, leg 6)

Direct handoff from r58's metric review §3: the aidFight-check
question was a game-change-lane item, and the standing context
records the Muse call that aidFight checks lingerers first like
the other crisis paths, so narration stops lying. This run
implements that call. No gating change: the 2026-10-27 gating
freeze (full-seat stage restore held) is untouched — this is
crisis-resolution narration/behavior only, in comms.js aidFight.

Pre-registration (plus mid-run amendment, appended not
rewritten):
`hidden_files/evidence/2026-10-28/journey-crisis-r59-prereg.md`
Instrument: r58 driver/analyzer verbatim -> r59 (names, EVID,
policy id only), then the corpse-count correction below.
Base: 229923264. Policy: oracleV2, 120d death-aware (+10d tail).
Delayed rule unchanged.
Driver: `scripts/journey-crisis-r59-delayed-20261028.js`
Analyzer: `scripts/analyze-crisis-r59-delayed-20261028.js`
Proof test: `scripts/test-crisis-r59-aidfight-gate.js`
Per-seed records (corrected panels):
`hidden_files/evidence/2026-10-28/before-corrected/journey-crisis-r59-delayed-seed{9405,9406,9407,9408,9411,9413}.{json,log}`
`hidden_files/evidence/2026-10-28/after/journey-crisis-r59-delayed-seed{9405,9406,9407,9408,9411,9413}.{json,log}`
plus after-panel transcripts in `after/`.
Analyzer outputs:
`hidden_files/evidence/2026-10-28/journey-crisis-r59-before-corrected-analyzer.txt`
`hidden_files/evidence/2026-10-28/journey-crisis-r59-after-analyzer.txt`
First (superseded) panels, kept for the record:
`hidden_files/evidence/2026-10-28/after-flawed-gate/`
(first before-panel JSONs in `evidence/2026-10-28/` root).

## The bug, in plain words

When the village answers a monster at the door and kills or
drives off ONE lingerer, the game said "The teeth break. The
door holds" and "The door is quiet. Haven breathes" — even when
other lingerers still held the treeline and gorged that very
night, and it sent allied help home. The other two crisis paths
already checked first: the tick resolves 'fought' only when no
living lingerer holds the treeline, and a sortie resolves only
when lingeringRaiders() is empty, otherwise it says "N still
hold the treeline — the gorge goes on." aidFight was the only
unconditional path.

## The fix (one gate, mirroring the tick)

In aidFight, after a vKill/mFlee outcome, compute threat exactly
as commsTick does (living lingerers + a mid-fight lingerer
guard). If threat remains: say "One down — but N still hold(s)
the treeline. The gorge goes on." and do NOT resolve — the
crisis stays open for the tick, a sortie, or the next fight.
If no threat: the existing lines and resolveAidCrisis('fought'),
unchanged. Side effects of 'fought' (the-siege beat, protection
lead, raid relief) therefore fire when the treeline is actually
clear, not after one kill. Fights themselves are untouched, and
kills still score on the aid-crisis channel.

## Mid-run discovery: the corpse counts (read this first)

The first gate counted the just-killed beast as a remaining
threat, so aidFight never resolved at all in the first
after-panel (zero "door holds" lines). Root cause: fieldFight
writes wounds back onto m.hp only when the monster lives; on
vKill the world object keeps pre-fight hp until the CALLER
removes it after aidFight returns. Two corrections followed:

1. GATE CORRECTED: on vKill the fought monster is excluded by
   identity (it is dead; the caller removes it next). On mFlee
   it still counts: a fled lingerer did not leave the siege (it
   keeps lingering and is re-pinned at dawn; only the sortie
   clears lingering on a drive-off).
2. INSTRUMENT CORRECTED: the r57/r58 lingeringAtResolution
   count has the same flaw (measured inside aidFight, before
   caller removal). The driver now also records
   lingeringAtResolutionTrue (corpse excluded on an aidFight
   vKill); the analyzer classifies early on the TRUE count and
   reports the legacy count for lineage continuity. This means
   the r57/r58 "15/15 beat-alive" census is an upper bound:
   clean vKill-last resolutions were counted as early. The
   beat-alive part (gorges/sorties after) is unaffected.

The unit test stub was corrected to match production (no hp
writeback on vKill — an earlier stub set hp 0 and masked
exactly this). Proof test: 4 passed / 6 failed on unfixed code,
10 passed / 0 failed on the corrected gate.

## Corrected panels (matched seeds, same driver)

TRUE early 'fought' resolutions (corpse excluded):
- Before: 11 — 9405 d37/d45/d56, 9406 d11/d97, 9407
  d26/d33/d110/d115, 9411 d63, 9413 d80. Legacy count 12
  (9406 d70 was a clean vKill-last resolution misclassified
  by the corpse count; the corrected instrument proves it,
  where a removals-based reconstruction had also wrongly
  suspected 9406 d11 — same-day removals do not identify the
  fought monster, so reconstruction alone is not trusted).
- After: 0 on every seed, legacy 0 too.

Per-seed before -> after (corrected panels):

| seed | before | after |
| 9405 | game-over d70, 1 alive, 0 kcal | game-over d106, 1 alive, 0 kcal |
| 9406 | horizon, 8 alive, 45,156 kcal | horizon, 5 alive, 8,479 kcal |
| 9407 | game-over d117, 0 alive, 23,836 kcal | horizon, 7 alive, 36,127 kcal |
| 9408 | horizon, 8 alive, 23,829 kcal | IDENTICAL (control) |
| 9411 | game-over d83, 0 alive, 29,200 kcal | game-over d89, 0 alive, 37,155 kcal |
| 9413 | horizon, 8 alive, 50,521 kcal | horizon, 8 alive, 7,043 kcal |

## Pre-registered verdicts (§14 — bindings, not re-scores)

- B1 before-panel reproduces the class: GO — 11 TRUE early
  instances (12 legacy) across 5 seeds; no expansion needed.
- B2 after-panel early resolutions = 0: GO — TRUE 0 and
  legacy 0 on all 6 seeds.
- B3 price honesty: GO — pantryDelta == -paid on 7/7 ok
  attempts, deltaBad [] (8 attempts: 1 refused no-fighters
  on 9406 d63, retried ok d64 — the r58 refused-book guard
  holds: refusedDayIsLastSortie false).
- B4 death accounting: GO — muster-aware mismatches 0,
  bloodied deathsDuringSay lines 0, unattributed death lines
  0, true death lines still captured.
- B5 moved headlines mechanism-explained: GO — on all 5 moved
  seeds the before/after transcripts are IDENTICAL up to the
  first TRUE-early resolution day, and the first divergence
  is exactly the gate's decision (old "The teeth break. The
  door holds" vs new "One down — but N still hold(s) the
  treeline"). Everything downstream is chaotic divergence
  from that one legitimate decision (crisis stays open, help
  stays at the door, siege/relief fire later, RNG stream
  diverges). No divergence precedes the gate on any seed.
  Direction is seed-dependent, as expected: 9407 is saved
  (help stays for fights it previously fought alone), 9406
  is hurt (longer siege, gorge nights 9 -> 18), 9413 keeps
  everyone but ends poorer, 9405/9411 reach the same end
  later. 9408 (no early instances) is byte-identical in
  headlines — the gate is surgical.
- B6 people check: GO — 39/39 convo snapshots present, 0
  fabrication flags. Read in full (after-panel): 9405 d37
  Marco (wants wound care; tended, then talks hands/trade,
  soft close), 9405 d51 Marco (grieves Obure — who died d50
  in this run, "a wound that wouldn't close" — one day
  before the conversation; he picks up Obure's share),
  9407 d61 Amanda (trap line quiet, ridge and spring "I'll
  show you on the map sometime. It's real.", laughter
  memory, soft close), 9407 d85 Amanda (wants to learn,
  "Can I trust you? I mean really." — "I hope to earn it"
  is "the right answer"). Warts (documented, not game
  bugs): 9407 d26 is abrupt (driver picks betrayal:accept
  then confront, engine ends it); 9407 d85's recap "Still
  on their secret" refers to an earlier thread than the
  visible learning/trust thread.

Coverage note (honest, not a failure): the gate's clean path
("door holds" from aidFight itself) is unit-proven but
unexercised in this 6-seed panel — final clearances here
came via the tick after player/drift/sortie clearance
(e.g. 9411 d66: player-party stare-downs, then the tick
resolves at 0). The panel proves the binding negative (no
early resolutions); the positive clean path rests on the
unit test. A future panel with villager-final-kill seeds
would exercise it live.

## Village assessment (plain words)

The siege now tells the truth. Villages that answer it still
pay through it: 9406 holds the horizon but thinner (five
standing, stores down), 9413 holds everyone but ends poor,
9405 and 9411 still die by it, only later — the siege is not
softer, it is honest. And one village that died by the lie
now lives by the truth: 9407, which the old code declared
quiet while teeth still held the treeline, keeps its people
at the door until the treeline is actually clear and reaches
the horizon with seven alive. The people still read as
people: Marco grieves Obure the day after he falls, Amanda
asks whether she can trust you and means it, and the door
no longer claims quiet while the gorge goes on.

## Telemetry check

Ran `telemetry-check.js` against
`telemetry-baselines/crisis.json` (defenderFights,
playerFights, defendedCount, latelyDefenseCount) on the 6
corrected after-panel files. Two LOUD lines, both EXPLAINED,
same as r53/r54/r57/r58:
- defenderFights 95 -> 0: vocabulary mismatch. The journey
  instrument records the same concept as `defendedFights`
  (237 defended fights across the 6 after-panel seeds);
  nothing disappeared.
- defendedCount 21 -> 0: no such field exists in journey
  records (a convo-instrument count, not a journey field).
playerFights and latelyDefenseCount are 0 -> 0 (quiet). The
baseline was NOT rolled forward: overwriting a
convo-instrument baseline with journey-instrument numbers
under mismatched keys would destroy its meaning. The
mapping fix (defenderFights -> defendedFights) remains a
proposal for the next run, not a silent rewrite.

## Reachable / fun / winnable (leg 6)

- REACHABLE: yes — raids, lingerers, gorges, sorties,
  refusals and refusal retries, drifts, re-lingers, early
  resolutions (now zero because the gate works, not because
  the content vanished) and both exits fired across 6 seeds.
- FUN: cleaner than r58 — the march is legible and the
  narration no longer lies about it. Help no longer walks
  away from a still-besieged door, which is the difference
  between 9407 dying and 9407 living. The "door is quiet"
  line now means something when it comes.
- WINNABLE: yes — 4 of 6 seeds reach the horizon alive
  (9406/9408/9413 as before, plus 9407 saved); 9405/9411
  show the losing branch of the same leg, later and
  honestly.

## Regression evidence

- Proof test: 10/10 on the corrected gate (4/10 on unfixed).
- test-aid-fight-wired-20261014: 9/9. test-aid-comms-20261010:
  120/120. No other test references the old line.
- check.js --quick in the worktree: 278 passed, 9 failed in
  350s. None of the 9 failures references aidFight,
  resolveAidCrisis, or lingeringRaiders (grep-verified), so
  none is caused by this change: hide-discovery, 3
  measurement-workflow freshness failures, mobile-combat
  Continue round-wrapping, occupation panels, phone-frame
  receipt staleness, sw-audio cache, and establishment
  racks-voice (byte-identical to r57's pre-existing failure).
  The --help invocation of check.js hung silently (killed);
  --quick itself progresses normally, just slowly here
  (~350s for 287 scripts).

## Metric review (§14)

For the NEXT run:
1. RETIRE the aidFight early-resolution question — proven
   and fixed (TRUE 11 -> 0). Keep the TRUE count in the
   analyzer as a regression guard; the legacy count stays
   for lineage continuity only.
2. The r57/r58 early-instance counts are upper bounds
   (corpse-count flaw). Any future citation of them should
   carry that caveat; the TRUE counts are what bind.
3. The telemetry mapping proposal (defenderFights ->
   defendedFights) is still a proposal, not a rewrite.
4. Carried open items (documented, not fixed): (i) dead
   discoverer's orphaned fireside entry (r51, Steve's call);
   (ii) unfed marches proceed (r50, Steve's call); (iii)
   the "no playable joint foraging outing" limitation from
   r57/r58 is now superseded by the sibling tackle-outing
   landing (playable promised pantry run) — not re-verified
   in this run's panel, since the crisis driver does not
   drive outings; (iv) stare-down cost as a class (Steve's
   call).
5. Process notes: (a) the first panels' transcripts landed
   in the parent evidence dir, not the panel dirs, because
   EVID was assigned but not exported before the loop
   (per-command `EVID=... node` fixes it; the corrected
   panels' transcripts are correctly placed in before-
   corrected/ and after/, and all judged JSONs were always
   correctly separated); (b) a removals-based reconstruction
   of fight outcomes is not reliable — same-day lingerer
   removals do not identify the fought monster (it wrongly
   suspected 9406 d11; the corrected instrument cleared it).

## Files

- Game change: `src/js/comms.js` (aidFight lingerers-first
  gate, ~26 lines) [needs-eyes: crisis narration timing is
  player-visible — the door-quiet beat now fires later and
  help stays at a still-besieged door]
- Proof test: `scripts/test-crisis-r59-aidfight-gate.js`
- Driver: `scripts/journey-crisis-r59-delayed-20261028.js`
- Analyzer: `scripts/analyze-crisis-r59-delayed-20261028.js`
- Analyzer outputs:
  `hidden_files/evidence/2026-10-28/journey-crisis-r59-before-corrected-analyzer.txt`
  `hidden_files/evidence/2026-10-28/journey-crisis-r59-after-analyzer.txt`
- Per-seed (base 229923264):
  `hidden_files/evidence/2026-10-28/before-corrected/journey-crisis-r59-delayed-seed{9405,9406,9407,9408,9411,9413}.{json,log}`
  `hidden_files/evidence/2026-10-28/after/journey-crisis-r59-delayed-seed{9405,9406,9407,9408,9411,9413}.{json,log}`
  plus after-panel transcripts in `after/`
- Check-quick log:
  `hidden_files/journey-crisis-r59-checkquick.log`
