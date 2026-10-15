# ARM "raidassess" — raid-pack assessment at Haven (scale-onramp, sim-findings #344)

Worktree: `~/workspace/worktrees/sim-raidassess`. Run: oversight-flesh-out-loop,
run fleshout-20261015-163607, ARM sim-raidassess (recovery worker — the first
worker completed prematurely leaving only the untracked layer file; this run
hardened the layer, wrote the proof + sweep + sense instruments, and measured).

## The blank

#344 (BEARER <redacted> NO RAID-PACK OR ALIEN-PLAYER ASSESSMENT): the bearercombat
census (evidence/2026-10-15/sim-bearercombat.md) found the modal bearer <redacted>
on national-holding runs is **w1 × haven × turn-based (20/89)** — Highbeam Deer
night raids on Haven (16 kills, counter known 94%, bearer enters at full HP,
armor P median 12, dead in ~4 hits/103 dmg). The policy stands the wall because
raids are fought, not fled. The besiegeanswer arm falsified FORCE (27 answers
bought 19 feeds — the besieger just killed the village's strongest fighter and
the answer sends the weakest back in). The remaining space is
avoidance/absence: no deliberate engagement of a lost raid fight.

## Canon read

- docs/CANON.md (manifest + standing rules). docs/MONSTER-WAVES.md (wave law;
  wave 1 = animal shock incl. the Highbeam Deer benchmark — the benchmark's
  stats are never the lever; "monster encounters are fought, not rolled").
- No canon doc covers raid-pack assessment or alien-player fight assessment;
  the assessment shape is this arm's design call, pre-registered, Steve can
  overrule.

## Mechanism-honesty verdict: HONEST (verified against the engine before sims)

Every mechanism the layer assumes was checked against the actual engine code
in this worktree:

1. **Raid context**: `crisis.raiders` is set ONLY by `havenRaidTick`
   (src/js/havenGrowth.js:402); `Game.aidCrisis()` exists (comms.js:150). The
   layer's trigger (`raidCrisisAtHaven`) fires only on a genuine raid-raised
   crisis with the scholar on the haven node.
2. **The modal death path is real**: without a palisade, one live raider is
   routed to the sleeping scholar via `pendingEncounter`/`pendingMonsterId`
   (havenGrowth.js:436-463). The palisade path says "The watch holds the wall.
   You sleep through the worst of it" — i.e. the retreat-inside equivalent is
   a BUILD, not a combat verb. There is NO "withdraw inside" / hide-in-the-hall
   verb; the layer refuses that fiction explicitly.
3. **The base stands the wall**: on this substrate (FEASTSCALE_R13=1,
   COMPETENT_FIGHT_ASSESS / COMPETENT_DIRECTIONAL_FLEE / COMPETENT_DPS_RACE
   all off) the base policy never barrier-pushes — the legacy outmatched block
   doesn't fire at full HP vs a 160-HP deer, and the directional-flee hold
   ("at haven: hold", competent.js:2077) would hold even with the gates on.
   The modal fight is fought, not fled. The layer is non-redundant.
4. **The disengage is a REAL exit**: `tbBarrierExit(dx,dy)` (game.js:31589) —
   walk to the tactical edge, push through onto the adjacent world node, with
   the engine's honest chase/pursuit-stamina mechanics (chasers follow; the
   relentless only stop at Haven or death). Costs are real: the scholar spends
   the night off-haven; the raider lingers and gorges nightly until driven off.
   The layer checks the map actually moved (the r3 "disengage is a fiction"
   lesson) and counts sealed/blocked pushes as honest failures.
5. **Assessment machinery is the base's own**: `fightAssessRace` DPR race with
   the counter-known discount (0.7) and the pessimistic unknown-DPR prior
   (20/round) — the same convention the base uses.
6. **Alien-player hook**: alien fighters carry `alienPid` (encounters.js:2651,
   2925, 2941); the base's assessments filter `kind==='monster'` and are blind
   to them. The layer assesses kind='hostile' + alienPid with the pessimistic
   prior.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — written BEFORE any sims

- **Question**: does a raid-pack assessment — no deliberate engagement of a
  lost raid fight at Haven (withdraw off-node via the real barrier exit) —
  cut w1×haven×TB bearer deaths without new loss modes?
- **Primary metric** (binding): w1 × haven × turn-based bearer deaths per run
  (bearer deaths with ctx.fightType='turn-based', tileClass='haven',
  killerClass='w1'), summed over 16 runs/side. **GO: armed ≤ control × 0.60.**
- **Degeneracy rule**: control total == 0 → INSUFFICIENT-EVIDENCE.
- **Exercise gate**: armed-side raAssessed ≥ 4 across the sweep, else
  INSUFFICIENT-EVIDENCE (the layer never met its threat).
- **Guardrails** (binding): median survival ≥ control−10d; national ≥
  control−2 (of 16); no new death mode (player:cause key in armed absent from
  control only at n≥3); villager (non-scholar) combat deaths ≤ control+2;
  anti-tile-shifting: total bearer combat-family deaths (all tiles) ≤
  control+2 — the lever must SAVE bearers, not relocate deaths to wild tiles.
- **Horizon**: 180d death-aware (dead villages stop, ≤10d tail). Why: the raid
  pathology is a national-hold phenomenon; national reaches ~day 60–90.
- **Seeds**: 11/22/33/44/55/66/77/88 × {leadfeast, belongfeast} = 16 runs/side
  (the pilot; confirm 12–16 seeds only on GO). Identical seeds, own control in
  the same sweep. FEASTSCALE_R13=1 asserted up front in proof AND sweep.
- **Metric binding (§14)**: a miss is NO-GO, never re-scored mid-run.

## The layer (scripts/policies/raidassess.js, RAIDASSESS=1, default OFF)

Gate off → `withRaidAssess` returns the base policy itself (identity — proof
R1, sweep DETGATE D3 byte-identical). Gate on → wraps the base:

(a) `fight()`: at fight start (turn 1, own per-fight key so the base's
    `ctx._fightObj` block still fires honestly on delegate), if a raid-raised
    aid crisis is open + scholar on the haven node + live monster opponents →
    DPR race. Decline (lost race or dead-in-two) → disengage: pick the best
    scored exit (fleeDirScore: known +2, monster-active −6, away-from-haven −2),
    walk to the tactical edge over successive turns, `tbBarrierExit` onto the
    adjacent node. Race won/parity → existing behavior (the base fights).
(b) Alien-player duels (live opponents with alienPid, kind 'hostile', no
    monsters): same race with the pessimistic prior; disengage on decline.
    Design call (Steve can overrule): a person with unknown capabilities and
    adaptive AI is not a fair duel the policy should stand.
(c) Push continuation: while `ctx._raPush` is armed, every player turn
    continues the walk/push — the base never fights mid-push. A consumed push
    that moved nothing (sealed fight, blocked far side, world edge) clears
    honestly (`raPushBlocked`) and the base fights it out next turn.
(d) After a real exit: `markRecover` (the base's own 2-day recover window) and
    a dawn return — `raDawnReturn` walks home at dayPart 0 (never into the
    dark); the base never fled at haven so it owns no return path.
(e) One narration line per disengage ("🌙 Teeth at the door and this fight is
    lost — you slip out the back way, into the dark. Haven will have to hold
    without you tonight.") — a village decision, not a system alert.

No game-code changes (zero src/js). No new engine verbs — every call is an
existing policy/engine path. Design calls (Steve can overrule): the DPR race
as the sole arbiter (no wave cap — a lost race is a lost race at any wave);
the pessimistic alien prior; the dawn-only return.

## Proof: scripts/test-raidassess-20261015.js — 9/9 GREEN (REAL RED verified)

- R1 (RED): gate OFF → returns the base itself (identity).
- R2 (REAL RED): gate ON + lost race + NO raid crisis (the blank, unblocked)
  → no assessment, no disengage; base.fight runs.
- G1: raid crisis at haven + lost-race monster → disengage (raDeclined,
  raPushes, the honest line, one grid step, turn spent, push armed; base NOT
  called; race detail recorded with lostRace=true).
- G2: won race → base.fight (raFought), no push.
- G3: alien-player duel, lost race → disengage (raAlienDeclined).
- G4: push reaches edge → barrier exit moves off-haven, fight ends, push
  cleared, raDisengaged, markRecover armed.
- G5: dawn return walks home at dayPart 0 only (no walking into the dark).
- G6: crisis but no live monsters → base.fight, no assessment.
- G7: sealed barrier → push cleared honestly (raPushBlocked), no phantom
  move, base fights next turn.
- REAL RED: layer's raid-decline path forced off → G1 fails (base-fight
  instead of disengage); restored → 9/9. Patch-file round-trip, never git
  stash. SMOKE=1 subset 3/3.
- Sweep gates: SMOKE both sides green (15d, byte-identical control/armed —
  no raid crisis in the first 15d, layer correctly inert); DETGATE green
  (D1 determinism, D2 instrument ON/OFF identical, D3 wrapper-gate-OFF vs raw
  base byte-identical + layer counters zero); AA green (armed 60d ×2
  identical, both policies).

## Results — PRIMARY MISSED → KILL

Substrate: 8 seeds (11/22/33/44/55/66/77/88) × {leadfeast, belongfeast},
180d death-aware, FEASTSCALE_R13=1 asserted up front. Control = raw base
policies (the bearercombat substrate, unlayered); armed = + raidassess
(RAIDASSESS=1). Identical seeds, own control in the same sweep. Per-seed
packets: `evidence/2026-10-15/perseed-raidassess/`; summaries:
`evidence/2026-10-15/sim-raidassess-control.json` /
`sim-raidassess-armed.json`; sweep logs: /tmp/raidassess-control.log,
/tmp/raidassess-armed.log (ephemeral); coordinator telemetry:
`evidence/2026-10-15/telemetry-raidassess/` (32 records).

**PRIMARY: armed 27 vs control 25 → GO needed ≤ 15.0 → MISS (NO-GO per §14,
never re-scored). No confirm.**

| | control (16) | armed (16) | bar | verdict |
|---|---|---|---|---|
| PRIMARY w1×haven×TB bearer deaths | 25 | 27 | ≤ 15.0 | **MISS** |
| exercise gate (armed raAssessed) | — | 91 | ≥ 4 | PASS |
| median survival | 123d | 134d | ≥ 113d | PASS |
| national reach | 6/16 | 8/16 | ≥ 4/16 | PASS |
| new death mode (n≥3) | — | none | none | PASS |
| villager combat deaths | 454 | 459 | ≤ 456 | MISS |
| anti-tile-shift (all-tile bearer combat) | 122 | 124 | ≤ 124 | PASS (at the bar) |

Layer activity (armed): 91 assessed, 27 declined, 64 fought (parity),
19 disengaged, 27 pushes, 5 push-blocked (sealed/blocked, honest), 17 dawn
returns, 0 no-exit; alien: 2 assessed, 0 declined. Death modes —
control: combat 114, dehydration 3, starvation 1, expedition 2, contest 8,
lockjaw 1, sickness 1; armed: combat 113, dehydration 3, contest 11,
expedition 1, lockjaw 1, sickness 1 (no new key at n≥3).

Kill protocol: `scripts/policies/raidassess.js` DELETED. Proof/sweep/sense/
evidence retained as documentation (the layer is rebuildable from this spec;
instruments degrade gracefully — proof INFO-SKIPs, sweep armed refuses LOUD
exit 2, control unaffected).

## Why it missed — the mechanism probe (the real finding)

The layer fired 91 times and disengaged 19 times — it MET its threat — and
the primary didn't move. The sense transcript (belongfeast s33, re-run
byte-identical to the sweep: raA=9/raD=2/raDis=2) shows why, beat by beat:

1. **The walk-out is under fire.** Disengage #1 (d8, Highbeam Deer): the
   scholar slips out the back way and takes 16 + 11 + 9 damage WHILE walking
   to the edge over successive turns. The barrier exit is not an escape
   button — it is a 3–4 turn walk through the monster's threat range. A hurt
   scholar dies mid-push.
2. **Chasers follow — the threat relocates, not ends.** Disengage #2 (d65,
   THE REDACTOR, wave 4): the push completed (raDisengaged), the Redactor
   chased through the barrier, and killed the scholar on the new node
   ("redactor's Redact finds you — no dodging it... You go down. Irving Chu
   is dead."). The layer spent a disengage and the bearer died anyway — off
   the haven tile, which is tile-shifting, not saving.
3. **The disengage abandons villagers mid-fight.** In #1, Esteban (villager)
   was in the fight and kept fighting the deer alone after the scholar left
   ("Esteban strikes the Highbeam Deer... Esteban takes the hit and runs").
   "No deliberate engagement" for the scholar reads as deliberate abandonment
   for the villagers left holding the bag. The villager-combat-death
   guardrail miss (459 vs ≤456) concentrates exactly in the disengage runs
   (349→354; no-disengage runs 105→105 identical) — noisy per-seed (±18
   swings), but the mechanism is transcript-proven.
4. **The race misjudges the deaths that matter.** The modal death is BURST —
   4 hits / 103 dmg, counter known 94% — while `fightAssessRace` is an
   AVERAGE-DPR race (25/round × 0.7 counter discount = 17.5 vs 13 player DPR).
   Runs with the most assessments still show the deaths (leadfeast s44:
   raA=13, w1havenTB=1; belongfeast s33: raA=9, w1havenTB=4). And the
   byte-identical deaths (leadfeast s22 d12 Murkcap + d48 Highbeam Deer,
   identical day/HP/hits/damage both sides) prove the layer never altered the
   trajectory of the modal death fights — whether unassessed (crisis not open
   at fight start) or assessed-"winnable", the outcome is the same.

The theory's failure: "no deliberate engagement of a lost raid fight"
assumes leaving the tile ends the fight. It doesn't — the engine's chase
mechanics (Steve 2026-10-09: the chase PLAYS OUT, no coin flip) mean a lost
fight follows you, and the walk-out itself is fought. Avoidance-by-exit is
not avoidance; it is a slower, lonelier way to lose the same fight. (The
besiegeanswer lesson stands one level up: force feeds the chain; this arm
shows flight doesn't break it either — the remaining space is never being in
the lost fight: the palisade BUILD, which the engine already offers, or not
sleeping at haven during a raid.)

## Village assessment

Sixteen villages per side on the courtship road. The control villages live a
median 123 days, reach national on 6/16, table 16/16, and lose bearers to
w1 haven turn-based fights at a steady 25/16 runs — the bearercombat census
reproduced almost exactly (its 20/89 on national runs; here 25 bearer deaths
across all 16 runs, counter known 23/25, median entry HP 95). The armed
villages live a median 134d, reach national 8/16 — the guardrails pass except
the roster wall — but the disengage runs tell the story: scholars slipping
out the back way while villagers hold the line, and the same deer killing the
same bearer on the same day whether the layer is armed or not. Who died: the
same bearers, in the same fights. Who thrived: nobody differentially — the
layer is a quieter, not a safer, policy.

## SENSE-TESTING (scripts/sense-raidassess-20261015.js, belongfeast s33)

The disengage line reads as a village decision, not a system alert: "🌙
Teeth at the door and this fight is lost — you slip out the back way, into
the dark. Haven will have to hold without you tonight." What follows reads
as people under pressure, not robotics: Esteban's party-line ("One of us
alone doesn't walk away from that. But all of us? With a plan?"), his lone
stand after the scholar leaves, the Codex turning a page on its own for
Irving Chu ("You didn't ask. It knew."), "Nobody's talking much. The fire
feels smaller tonight." The prose is honest; the design doesn't save them.
The sense test passes; the lever doesn't.

## Blanks filled / documented

- **Measured** (not chased): the w1×haven×TB base rate on this substrate —
  control 25/16 runs (1.56/run), counter known 23/25, median entry HP 95;
  reproduce of the bearercombat modal class on the current tip.
- **Falsified** (this arm): the avoidance-by-disengage theory. A DPR-race
  assessment that withdraws the scholar off the haven node through the real
  barrier exit does not cut w1×haven×TB bearer deaths (25→27, GO needed ≤15).
  The walk-out is fought, chasers follow, villagers are abandoned mid-fight,
  and the average-DPR race misjudges burst killers. Filed to sim-findings.md.
- **Documented**: (a) the burst-vs-average gap in fightAssessRace — the modal
  bearer death (4 hits/103 dmg, counter known) is a burst phenomenon the
  average-DPR race prices as winnable; any future assessment arm needs a
  burst term (max-hit vs HP) or it will misjudge the same deaths;
  (b) the disengage-abandons-villagers design gap — "no deliberate
  engagement" needs a party-aware rule (never leave villagers in a fight you
  started together) before any future avoidance lever;
  (c) the instrument note: per-fight assessment outcomes aren't persisted —
  the next assessment arm should stamp the assessment (decline/fought +
  detail) onto the TB session so deaths can be attributed to the assessment's
  judgment directly.

## Metric review (§14)

Primary missed cleanly (27 vs ≤15.0) — no re-score, no metric doubt. The GO
bar (40% reduction) was the right bar: the layer moved the primary +8% (noise;
SE on a count of 25 is ±5) with 91 assessments behind it — this is a true
null, not an underpowered near-miss. The exercise gate (≥4) was load-bearing
and passed (91) — without it, a zero-fire run could have been misread as a
design failure instead of a no-contact one.

Two metric notes for the NEXT run (proposed, not applied):
1. The villager-combat-death guardrail (control+2) is extremely tight
   (±18 per-seed swings observed) — a future arm should pre-register it as a
   rate per run with a wider band, or as a co-primary.
2. The primary counts deaths, not death-rate-per-raid-exposure — a future
   avoidance arm should also pre-register raid-exposure (raids/run) so a
   lever that reduces raids (vs survives them) gets credit honestly.

## Telemetry deviation check (scripts/telemetry-check.js) — PENDING (coordinator step)

## Wall numbers (every run)

| | national | table | wins | wave-4 | wave-5 | medianSurv | exiled |
|---|---|---|---|---|---|---|---|
| control (16) | 6/16 | 16/16 | 0/16 | 15/16 | 6/16 | 123d | 0/16 |
| armed (16) | 8/16 | 16/16 | 0/16 | 15/16 | 6/16 | 134d | 0/16 |

No run won. The scale wall stands: national 6–8/16, table reached but never
converted, wave-5 6/16 both sides. (Wave-4/5 reach here is higher than the
2026-10-12 wall snapshot — the tip moved under the runs; the census is
self-consistent on the current tip.)
