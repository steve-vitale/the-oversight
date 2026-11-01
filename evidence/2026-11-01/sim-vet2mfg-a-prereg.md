# sim-vet2mfg-a — preregistration (DIAG ONLY, zero src/js)

Run: fleshout-loop-a-20261101T1016Z, axis scale-onramp (converging, NOT
converged). Worker branch: sim-vet2mfg-a. Base anchor at prereg time:
7c8745741 (worktree HEAD; every judged JSON carries its own
`anchorCommit` — if the coordinator rebases before the sweep, the
anchor in the JSONs governs, and this prereg's anchor line is stale,
not the data).

## Question

Where does the wave-4 funnel leak? Prior evidence: sim-vet2-a
(2026-10-31) found 4 wave-4+ kills in 19 runs and 5 wave-4 seeds never
facing a wave-4 monster, on a stack that wins at day 90 on 8/19 seeds;
its backlog item 1 asks for an ENCOUNTER (not kill) instrument on the
wave-4 pool on a band that does not win at day 90. sim-fullseat-recheck
(2026-11-01, 0615Z) found vet5 max 1, never 2, wave 5 0/16, w5 distance 2
on 8/8. sim-trajband-a (2026-11-01) found muster/shelter filtering
collapses the wild-encounter stream — shelter is a funnel stage, not
background. This arm classifies, per seed, the chain:

  wave 4 unlocked -> wave-4 monster spawned -> encountered (by channel:
  wild / patrol / raid / aid / player / other-field) -> fought ->
  killed / monster-fled / villager-or-player-fled / lost /
  shelter-filtered-out, plus win-censoring (run ends before the window
  opens).

It names the dominant leak and falsifies at least one alternative
(never spawned vs shelter-filtered vs fled vs fought-and-lost vs
win-censored).

## Stack (named exactly — numbers are NEVER compared across stacks/bases)

Substrate: scripts/policies/tableseat-nowait.js (LEANLINKRESCUE=1,
TABLESEATNOWAIT=1) — the fullseat-recheck stack, chosen because it is
long-lived (0615Z: median 164d, wins 1/8, wave 4 7/8) instead of the
vet2-a win-pursuit stack that wins at day 90 en masse. The vet2-a
numbers are prior-stack context only, never current data.

Instruments, all pure-read (no game-state writes, no RNG draws):
- scripts/policies/fullseat-diag.js (FULLSEAT=1) — REUSED UNMODIFIED.
- scripts/policies/wavegate-diag.js (WAVEGATE=1) — REUSED UNMODIFIED
  (daily uw rows give the unlock day; rd5 short bars give the
  readiness shape at end).
- scripts/policies/vet2-diag.js (VET2=1) — REUSED UNMODIFIED (daily
  living vet4/vet5 sets; kill-time keying cross-check).
- scripts/policies/vet2mfg-diag.js (VET2MFG=1) — NEW instrument file
  (this arm): daily snapshot of world monsters (type, wave, tile, hp),
  sheltered roster list, Haven tile, nearest wave-4 distance to Haven,
  scholar tile, and a copy of scholar.awayNews (wild-fight narration
  for sense reads).
- Sweep-side wrappers in scripts/vet2mfg-a-sweep.js (NEW; installed
  after loadGame, removed after each run; pure observation, call
  through with identical arguments and return values):
  - spawnWorldMonster: spawn events (wave from the entity's own
    `wave` field, type, tile, day; instance identity by object
    reference in a sweep-local Map, never by mutating game state).
    Context flags: inMaintenance (wrapped maintainWorldMonsters),
    tile == player tile at spawn time.
  - removeWorldMonster: removal events by instance.
  - villagerMonsterTick: pre-pass per wave-4 monster (roster on tile
    minus scholar, sheltered count, post-flee-rest count, available
    count, scholar-tile flag) + post-pass roll-skip derivation
    (available > 0, no router call for that instance during the tick,
    instance still present after = roll-skipped; labeled DERIVED).
  - resolveWildMonsterEncounter: wild fight events (opts.raid ->
    channel 'raid', else 'wild'; returned rec.outcome).
  - resolvePatrol: patrol fight events (rec.outcome).
  - aidFight: aid fight events, ONLY when not inside a router wrapper
    (reentrancy flag suppresses the double log when a router routes
    through aidFight; the router's event is the record).
  - fieldFight: catch-all 'other-field' events, ONLY when not inside
    a router/aid wrapper (covers agency/expedition, contest, nomad,
    corruption paths); sub-class by opts (awareness -> agency;
    otherwise other-unknown). Outcome = rec.outcome.
  - startCombat + tbEnd: player-channel events (tbEnd result:
    won / routed / fled / lost; monster waves from the fight's
    monster fighters). A startCombat with no tbEnd before run end =
    'unresolved'.
  - Kill capture wrapping BOTH writers, recordWaveKill AND
    recordPyrrhicKill (vet2-a's amendment, carried from the start):
    raw call args + scholar vid at call moment. No game-state writes.
  - sysSay capture: lines containing muster / shelter / barricad /
    hall door / next act / fifth draft (narration for sense reads;
    the wave-3-only filter gap from 0615Z/trajband is NOT repeated).

No src/js change. No gate threshold moved. No existing policy file
edited. New files only: the policy layer above, the sweep, the
analyzer (scripts/vet2mfg-a-analyze.js), the proof test
(scripts/test-vet2mfg-a.js). Panel (MEASUREMENT.md §15): NOT
APPLICABLE — single-base DIAG census, no before/after comparison
exists in this arm; none fabricated.

## Band

Pilot + confirm band: fresh seeds 95301–95308. Freshness verified
BEFORE any sims against corpus filenames (find over
evidence/2026-10-31 and evidence/2026-11-01 perseed dirs: zero hits
for 9530x/9531x) and dated evidence .md files for 2026-10-31 and
2026-11-01 (zero hits), and clear of the forbidden bands named by
fullseat-recheck (73641–73648, 73671–73678, the 871xx confirm band,
78201–78208, 91401–91408).

Horizon: DAYS=180, death-aware (runDays ends dead villages early;
the 180 cap matches the fullseat-recheck band's shape, median 164d,
so post-unlock windows are measured, not truncated at 90). Never a
fixed 200d: the question is the post-unlock window, and 180d is
justified by the substrate's own survival distribution (0615Z) plus
the death-aware stop.

## Pre-decided band rule (decided BEFORE sims, not after seeing results)

If >= 5/8 pilot seeds end WON by day 100 (censoring-dominated band),
the pilot corpus is DISCARDED as judged data (files deleted, not
retained), and the arm re-pilots once on fallback band 95311–95318
(freshness verified the same way: zero hits, same check). If <= 4/8
win by day 100, the band is kept and win-censoring is reported per
seed (window = endDay - unlockDay; window <= 0 = censored at unlock).
No second replacement: if the fallback band also censors en masse,
censoring is reported as the finding and the funnel is judged on the
pre-win stages only.

## Funnel stage definitions (per seed, wave 4 only)

- unlockDay: first wavegate-row day with uw >= 4; null if never.
- firstSpawnDay: first spawn-event day with wave 4; null if never.
  A spawn with spawnDay < unlockDay (trap/fled re-spawn of a wave-4
  id, if any) is counted separately as pre-unlock spawn, never folded
  into the post-unlock funnel.
- tickOpps: villagerMonsterTick pre-pass counts, post-unlock only:
  opps (available >= 1), shelterBlocked (available == 0 and
  sheltered >= 1), restBlocked (available == 0, sheltered == 0,
  resting >= 1), scholarTile (monster on the scholar's tile),
  rollSkipped (DERIVED, see wrappers).
- fought: fight events by channel (wild / patrol / raid / aid /
  player / other-field), post-unlock only; pre-unlock fights (if any)
  reported separately, same as pre-unlock spawns.
- outcomes (pooled over fought): killed (router vKill; player
  won + kill-capture join; other-field vKill), monsterFled
  (mFlee / routed), fled (vFlee / fled), lost (vDie / lost),
  evade / alreadyDead / other (reported, never folded into killed).
- kills: kill-capture wave-4+ entries (both writers), by killer
  (scholar vs companion at call time) and via (wild / patrol /
  aid-crisis / player / companion / agency / contest / other).
- window: endDay - unlockDay; fightsInWindow, killsInWindow.
- vet5: max living vet5 and end living vet5 from vet2 rows (join,
  not re-derivation).

UNCLASSIFIED: any wave-4 fight event with a missing/unknown outcome;
any wave-4 spawn instance with unknown wave; any wave-4 kill-capture
entry that joins to no fight event (orphan kill) — orphan kills are
counted and must be explained (a contest/agency kill joins to its
other-field event; a TB kill joins to its tbEnd event; anything else
is UNCLASSIFIED). Zero UNCLASSIFIED wave-4 encounters is required
for DIAG-GO. Pre-unlock stages are classified, not UNCLASSIFIED.

## Pre-registered GO bar (judge exactly against this, no re-scoring)

DIAG-GO iff ALL of:
1. Pilot 8 seeds, each producing a complete funnel (unlock day,
   first spawn day, encounter counts by channel, fight outcomes,
   kill count) with zero UNCLASSIFIED wave-4 encounters.
2. Recorder-neutrality det leg: recorder ON vs OFF end fields
   identical (days, gameDays, won, national/table flags, maxWave,
   endScaleRank, endReason) on 2 seeds.
3. Determinism leg: one judged seed re-run to a scratch dir is
   byte-identical to its judged JSON.
4. A mechanism statement naming the dominant funnel leak with at
   least one falsified alternative (never spawned vs
   shelter-filtered vs fled vs fought-and-lost vs win-censored).
5. Proof test scripts/test-vet2mfg-a.js green (synthetic funnel
   cases + corpus legs re-deriving the verdict gates from the
   judged corpus).

Pilot (8 seeds) before any confirm spend. Confirm (12–16 seeds)
only if the pilot passes its bar; the confirm band, if run, is
95301–95308 plus 95311–95318 (16 seeds max), decided at pilot
verdict time and recorded in the evidence file — never by silently
extending the pilot.

## Amendment 1 (appended BEFORE any verdict, after the first pilot — the pilot gate was NOT declared)

The first pilot (8 seeds, 95301–95308) FAILED the GO bar on one
instrument gap: 29 UNCLASSIFIED "unresolved-start" events, all type
'herald' on seed 95304 (days 161–165). Root cause, proven by three
scratch probes (reproduction + accessor trap + direct call, all on
scratch, none judged data): startCombat on a TITAN without a mustered
coalition is HARD-REFUSED by the titan gate (src/js/titans.js,
"no_solo_titans" — a titan "does not notice you the way prey notices
a hunter"; herald needs 10 allied blades). The refusal returns null
WITHOUT creating a fight and WITHOUT throwing. The first sweep only
treated the live-fight check as refusal, so the 29 gate refusals
looked like fights that never ended. The herald caller is the
monster's own hungry-branch turn (game.js monsterTurn: a territorial
monster that steps onto the player calls startCombat); the gate
refuses it aloud, every tick, while the herald paces — 29 refusals in
5 days on 95304, zero fights, zero tbEnds.

Instrument fix (this amendment): tbStarts record refusal from the
RETURN VALUE (null/undefined = no fight created) plus the live-fight
entry check plus a throw capture (rethrowing the original error).
Refused starts are classified 'refused' events in the analyzer
(reported per seed by type), never fights and never UNCLASSIFIED.
Only a NON-refused start with no tbEnd is unresolved. The analyzer
also reports pending-instantiated player fights (tbStart worldWave
null — the 95308 shape: a player-channel kill with no world spawn,
via pending/wanderer instantiation, not a spawn-census miss).

Handling (vet2-a precedent: discard, don't patch): the first pilot
corpus is DISCARDED (files deleted, not retained as judged data) and
the arm re-pilots fresh on the same band (95301–95308) with the fixed
instrument. No verdict was declared on the discarded pilot; its
numbers are not cited as judged data. The GO bar itself is unchanged
— the amendment only corrects what counts as a fight.

## Sense-test plan

Read, where the funnel touches narration: muster/shelter say lines
from the sweep capture, hold/release beats from wavegate rows, and
awayNews wild-fight lines from the daily snapshots, on the seeds
with the most shelter-blocked opportunities and on any seed with a
wave-4 kill. Judge meaning and coherence (does the village's telling
match the measured filter/fight?), never just counts. If narration
is missing where the funnel's key moment happens, that is a
recorder/narration gap to file, not evidence of robotic behavior.
