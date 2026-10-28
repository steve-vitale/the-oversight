# sim-fieldfeed-a — PRE-REGISTRATION (binding, committed BEFORE any judged sweep)

Run: fleshout loop, run fleshout-20261028T1628Z. Axis: scale-onramp
(blocking axis). Worker: sim-fieldfeed-a. Worktree:
`~/workspace/worktrees/sim-fieldfeed-a` (branch sim-fieldfeed-a).

## Question (named next blank #1 from run fleshout-20261028T1528Z,
evidence/2026-10-28/sim-scale-onramp-round-1528.md)

Wild monster meetings never see the party standing on the tile.
`resolveWildMonsterEncounter` (src/js/game.js:19911) and `resolvePatrol`
(src/js/game.js:7829) build allies solely from `this._outdoorCrew`,
which was empty on 0/1,272 meetings (all waves) on the shared band, so
24/24 judged wave-4 field meetings were NO-CREW:RAW-EMPTY, formed 0,
crew-could-form 0, tile-could-form 14/24. The presence-aware join
exists elsewhere: `party-wiring.js` `villagerFightAllies(vid)` (up to 2
villagers who'd answer a shout, trust-based) is called only by
`expeditionMonster` via villager-agency.js:376; all 58 allies>0
meetings and all 8 joined second fighters on that band were
expedition-channel; wild/patrol/raid/aid = 0 ever.

This arm wires the tile/earshot logic into the wild/patrol routers.

## The change (minimal, pre-declared)

- NEW `Game.presentFightAllies(vid)` in src/js/party-wiring.js: calls
  the existing `villagerFightAllies(vid)` (crew first, then earshot,
  trust >= 15, cap 2, excludes self and the player) and keeps ONLY
  the candidates standing on or adjacent to the fighter's own grid
  node (Chebyshev distance <= 1 — the earshot radius the existing
  logic already defines in party-wiring.js; no new radius invented).
  This is the presence filter: a crew member assigned to an outdoor
  task but standing elsewhere is NOT fed. No radar, no teleporting,
  no routing anyone to a monster tile nobody fought on.
- In `resolveWildMonsterEncounter` and `resolvePatrol`, the PARTY-UP
  block is replaced, ONLY for non-raid, non-aid-crisis fights, by the
  `presentFightAllies(vid)` feed (allies count = fed list length,
  allyVids = fed list, already capped at 2). Raid defense
  (opts.raid) and aid-crisis fights (wViaAid / pViaAid, routed through
  aidFight) keep the legacy crew-only feed byte-for-byte — scope is
  wild/patrol channels only, expedition channel untouched.
- Willingness follows the existing trust-based logic (trust >= 15);
  joining is NOT unconditional.
- NO changes to monster stats, wave gates, table gates, or spawn
  rates. This is NPC-intelligence / villager-rationality work (Steve
  2026-10-28: villagers must act like people, parties for wave 4),
  not a difficulty lever.

Mechanism note, read from code before the sweep: fieldFights.js
fieldFight sets intent 'engage' iff trick known OR allies > 0 (line
512), and the hopeless shout branch (line 1559) fires at round >= 2
when hopeless AND allies > 0 AND intent !== 'learn'. Feeding allies
therefore flips a solo villager from 'learn' to 'engage' and arms the
shout. A fed party whose fight turns hopeless joins by shout; a fed
party that never goes hopeless may end named-but-not-fought (that
class is reported, never hidden). A party that forms and then judges
the fight unwinnable and retreats (outcome vFlee) is recorded as
formed-but-retreated: it counts toward the primary (it formed and
fought) and is sub-reported, never a failure of the feed.

## Substrate (verbatim from the 1528Z run)

Seeds 75101–75108, scripts/policies/tableseat-nowait.js verbatim,
LEANLINKRESCUE=1, TABLESEATNOWAIT=1, 180d death-aware horizon
(runDays stops on death/win; +10d tail max). Control numbers from
the 1528Z run (same band, no feed): universe 44, faced 21, engaged
21, KILLED 2 (both TB scholar-led); field wave-4 meetings 24, all
solo, field kills 0; demand-met 2/50; wall: national ever 7/8,
final 6/8; table invited 4/8, entered 3/8; wins 3/8, all lesser, full
seat 0/8; wave-4 reach 6/8, wave-5 0/8; median survival 146d; deaths
286; starvation 1.

A no-feed control band on the same seeds is ALSO run on this arm's
own code-era (recorder on, game change absent) so the pilot
before/after is same-code-era, not only vs the 1528Z numbers; any
divergence between that control and the 1528Z numbers is explained
as a base move, never re-scored.

## Definitions (held for the whole run — no mid-run redefinition)

- MEETING: one call to Game.fieldFight reached via
  resolveWildMonsterEncounter or resolvePatrol (stack-classified,
  raid-depth flag as belt-and-braces) with a wave-4 world monster,
  leader a villager (non-scholar). Raid-defense calls
  (havenRaidTick → resolveWild with opts.raid) are channel 'raid'
  for contrast, NOT judged. Aid-crisis fights (aidFight in stack)
  are channel 'aid' for contrast, NOT judged. Turn-based (TB)
  fights are NOT meetings. Expedition-leg fights are channel
  'other', NOT judged.
- JUDGED SET: channel resolve or patrol, wave 4, leader villager,
  on the 8-seed pilot band.
- EARSHOT / PRESENT: at fight start, a living roster villager other
  than the leader whose pure nodePos read (never npcNode(), which
  creates default entries) is on or adjacent to the fighter's node
  (Chebyshev distance <= 1). Villagers with no nodePos entry are
  UNKNOWN, counted separately, never assumed present or absent.
  For wild meetings the fighter stands on the monster tile
  (villagerMonsterTick picks from npcsOnNode(monster tile)), so
  fighter-node earshot == monster-tile earshot; for patrols the
  fighter node is the patroller's node (the patrol fight is
  abstracted to the nearest threat — recorded as-is, not
  re-interpreted as the monster tile).
- TILE-COULD-FORM: a judged meeting where earshot holds >= 1 ARMED
  other villager (armed = the waveCombatReadiness(4) gear read,
  mirrored from the 1528Z recorder).
- FED: the meeting's fieldFight opts carry allies > 0 (fed list =
  opts.allyVids). FED allies are the engine's truth, read from
  opts at fight entry, never inferred from presence.
- FED-BUT-UNANSWERED (pre-registered class, counted separately,
  NEVER substituted for a formed party): a judged meeting that is
  tile-could-form but fed allies == 0 — presence existed, nobody
  passed the trust floor (sub-split: all earshot candidates trust
  < 15 vs other, quoted from the record).
- FORMED: the meeting's fieldFight record has calledHelp true with
  a non-null allyVid (a second fighter actually fought), whether
  by hopeless shout or from-start. FORMED-BUT-RETREATED is the
  sub-class formed AND outcome vFlee: counted in FORMED for the
  primary, sub-reported in the evidence.
- FED-NOT-FOUGHT: fed allies > 0 but calledHelp false, with
  sub-reason from the record: LEARN-PREEMPT (intent 'learn'),
  NEVER-HOPELESS (everHopeless false), HOPELESS-UNEXPLAINED (any
  other shape, quoted).
- SOLO-NO-PRESENCE: fed allies == 0 and NOT tile-could-form
  (sub: EARSHOT-EMPTY vs EARSHOT-UNARMED-ONLY).
- UNCLASSIFIED: anything fitting none of the above; counted, never
  silently dropped. Census-validity NO-GO if UNCLASSIFIED > 0 on
  the judged set.

## Primary metric and GO bar (binding — no re-score)

PRIMARY GO = at least 1 wave-4 field meeting on the pilot band
forms a party (>= 2 fighters) and fights (FORMED, including the
formed-but-retreated sub-class, which is reported as such).

GUARDS (all must pass for a LAND verdict):
- median survival >= 117d (80% of the 146d control);
- starvation <= 2;
- no wave-5 unlock claimed (wave 5 is not the metric here).

SECONDARY (reported, never re-scored against): formed count,
tile-could-form count, fed-but-unanswered count, field kills by
channel, party wins/losses, deaths by channel.

VERDICT RULES:
- Primary fails on the pilot band -> NO-GO: revert ALL src/js
  changes before the final commit; leave instruments + evidence
  only; a killed arm leaves no game-code trace.
- Primary passes on the pilot band -> run a confirm band on seeds
  75109–75116 with its own no-feed control on the same seeds,
  requiring >= 1 formed wave-4 field party in the arm band for a
  LAND verdict; if the confirm fails, verdict is pilot-GO-only,
  game change reverted, evidence-only.
- A miss is NO-GO, never re-scored against a friendlier metric
  mid-run; metric doubts go under "metric review" for the NEXT run.

## Staging and census validity

- Pilot (8 seeds) before any confirm spend; death-aware horizons,
  never a fixed 200d.
- Census-validity legs (all required for any GO verdict): 8/8 seed
  rows valid (days > 0); 0 UNCLASSIFIED on the judged set;
  recorder error counts 0 on every layer the sweep checks;
  detgate on seed 75101 (recorder OFF delegates byte-identically:
  days / gameDays / ts match, no recorder surface, no wraps).
- Balanced panel (§15): before/after comparisons run through
  scripts/balance-panel.js where its ingest fits this corpus — the
  panel has no census-ingest mode (standing exception as in 1415Z
  / 1528Z); paired census tables (control band vs armed band,
  identical seeds) are the §15 substitute. No panel artifact faked.

## Sense-testing (SENSE-TESTING LAW)

Read at least one transcript/replay of a formed party fight (or,
if none forms, a tile-could-form solo fight) — the fieldFight log
captured by the recorder — and judge meaning, coherence,
relevance, consequences: do formed parties read like people
judging a fight, or like a mechanism firing? The sense reading is
reported separately from the census numbers and never substitutes
for them. Sense replay is NON-MEASURED (its trajectory shifts;
counts are the corpus's, not the replay's).

## Metric review (filled at judging time — never mid-run)

- (to be filled at judging: detgate result, parity vs 1528Z
  control, classification completeness, guard results, any metric
  doubt for the NEXT run, panel note.)

## Commit plan

1. This prereg (before any judged sweep).
2. Instruments: scripts/policies/fieldfeed-diag.js,
   scripts/test-fieldfeed-a-sweep.js,
   scripts/test-fieldfeed-a-analyze.js (recorder + sweep +
   analyzer; policy-side only, zero src/js).
3. No-feed control corpus (base code) +
   evidence/2026-10-28/perseed-fieldfeed-a-control/.
4. Game change + scripts/test-fieldfeed-a-proof.js (scripted
   tile-presence fixture: a meeting with a present, willing, armed
   villager forms a party; a control fixture where nobody present
   stays solo; both must pass) — commit message carries
   [needs-eyes] (field combat change).
5. Pilot band corpus + analyzer run + sense reading.
6. Confirm band (only if pilot GO) + final evidence
   evidence/2026-10-28/sim-fieldfeed-a.md.
