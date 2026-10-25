# sim-w4funnel-a — the wave-4 kill funnel (axis scale-onramp)

Run: fleshout loop A, 2026-10-25, run fleshout-20261025T2015Z.
DIAG ONLY — zero src/js changes, zero default flips, recorders only.
This arm designs and lands NO game fix. A complete funnel census plus
a concrete next-arm proposal IS the deliverable.

## PRE-REGISTRATION (binding, written BEFORE any sweep, judged only against this)

- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave law:
  wave 4 = w3 rung + gated standing >= 100; wave 5 = w3 rung + gated
  standing >= 200 AND wave-4 faced; readiness gates hold waves 4-5:
  wave-5 demands 4 armored @ P>=15 / 6 armed / 3 tricks / 2 living
  wave-4 killers. Veterans, read from code in src/js/standing.js
  waveCombatReadiness(): DISTINCT killer vids in state.waveKillLog
  with w >= 4, filtered to LIVING — vid == current Game.villagerId
  counts living by definition, else vpOf(vid) must exist and not be
  dead; entries with by null are skipped by the gate outright).
  Read from code, never invented: spawnWorldMonster is the single
  birth funnel (spawnsrc census); removeWorldMonster is the single
  removal choke point (oldcore census, kinds below); recordWaveKill
  is the single kill choke point (waveKillLog {d, mid, w, by, via}).
- Context read first: evidence/2026-10-25/sim-w5chain-a.md (the
  1915Z run's next blank (1), this run's question) and
  sim-oldcore-a.md (oldcore removal-kind vocabulary, reused here).
  Shared band, trajectory for trajectory: seeds 73671-73678,
  tableseat-nowait policy (LEANLINKRESCUE=1, TABLESEATNOWAIT=1),
  180d death-aware horizon (runDays stops on death/win; 180 is the
  cap, not a fixed horizon — MEASUREMENT §10). The 1915Z control
  band below IS the control; no baseline arm is run.
- Recorders reused verbatim (policy-side only, never edited):
  scripts/policies/raftdraft-diag.js (raid draft census + final
  waveKillLog snapshot), spawnsrc-diag.js (birth source + seq tags),
  oldcore-diag.js (birth -> removal fate per entity instance, seq
  linkage), w5births-diag.js (daily rd5.veterans = the gate's own
  living-veteran count, plus spawn targets), defwound-diag.js
  (resolve rows per entity instance, seq linkage — REQUIRED for
  the fought stage: raftdraft fieldFights carry monster type but
  no seq, so without defwound a villager/defender fight that the
  monster survives leaves no per-entity trace at all; defwound
  wraps resolveWildMonsterEncounter only, records after
  delegating, and never touches oldcore's flag wrap semantics).
  New this run:
  scripts/test-w4funnel-diag-sweep.js (the oldcore sweep copied
  with the w5births recorder added + post-run killer-status
  snapshot) and scripts/test-w4funnel-diag.js (the funnel analyzer
  over that corpus). No recorder draws RNG, throws into the engine,
  or returns anything but the original value.
- CONTROL (published control band, w5chain-a / spawnsrc-a /
  poolpres-a, byte-identical): deaths 234, national-ever 7/8,
  wins 4/8, wave-4 6/8, wave-5 0/8, raids 85, raiders 361, pool
  1,494, pool wave-3+ 107, median survival 135d. The armed band
  must reproduce it EXACTLY or STOP and report the deviation —
  no judging on a moved baseline. (Wave-4 births on the band,
  w5chain-a births-side: 11 total — tile-entry 9, scripted-titan
  2; wave-4 kills on the band: 1; living wave-4 killers ever: 1
  seed (73678) with 1 killer for 2 days.)
- PRIMARY QUESTION: which funnel stage loses the most wave-4
  veterans — arrival-late/rare (too few wave-4 births, too late
  to fight) vs fight-survival (arrivals fought but not killed)
  vs living-vs-cumulative (kills happen but the killer does not
  stay living-and-counted)?
- DIAG-GO rule (ALL required, judged only against this header):
  (a) census classifies >= 95% of wave-4 arrivals with known
  outcomes (outcome = one of the classes below; unknown =
  untagged seq, vanished-unrecorded, unclassified removal, or
  pending-in-fight at run end — each counted, never hidden);
  (b) the single largest funnel loss is named with its count and
  share of arrivals (and of the stage it drains);
  (c) living-vs-cumulative is decomposed per day (daily living
  rd5.veterans vs cumulative distinct wave-4 killers ever) with
  the divergence explained per killer at end (living / dead /
  not-counted, with the gate rule that puts them there);
  (d) sense: one seed's wave-4 thread (best seed 73678) read and
  described in plain words — numbers plus meaning, not counts
  alone (census timeline + a NON-MEASURED narration replay;
  replay text never enters any count).
  Any leg missing = DIAG-NO-GO.
- Definitions (fixed before sweeping, analyzer header repeats
  them): ARRIVAL = one world-monster birth with wave 4 (oldcore
  birth joined to its spawnsrc spawn on seq; a fled-recovery
  re-entry is a NEW arrival with its own seq and source
  'fled-recovery', reported separately so fresh arrivals and
  all arrivals both reconcile). ARRIVAL SOURCE = the spawnsrc
  source string (tile-entry, scripted-titan, maintain, wanderer-
  contact, trap, fled-recovery, unknown). Raid draft is NOT a
  birth source — it selects already-born pool entities at raid
  time; the census verifies that (every wave-4 raider traces to
  a spawn) rather than assuming it. OUTCOME classes, from the
  oldcore removal kind + tbEnd settlement, in precedence order:
  killed-by-player-fight (tbEnd won / player-fight-kill);
  killed-by-villager-fight (villager-fight-kill incl. patrol);
  killed-by-defender-fight (raid-defense-kill);
  killed-other-cause (aid-crisis-kill, trap-capture,
  scripted-clear, raid-lingerer-sortie-kill, other-named);
  departed (departure-*, monsterTurn-departure);
  fled-record (the old object exits as a fled record — its own
  fate, never a kill, per oldcore); melted (player-fight-melt);
  still-present (seq in the final present list — beats any
  earlier removal, per oldcore re-entry rule);
  pending-in-fight (seq in pendingLifts at run end);
  unknown (untagged seq, unclassified removal, or vanished
  with no removal and not present). FOUGHT = at least one
  resolve row (defwound-style: raid or field) or tbEnd for the
  seq — computed from the oldcore tbEnds + raftdraft fieldFights
  where seq linkage exists; where a fight row carries no seq it
  is reported as unlinked-fight, never attributed to an arrival.
  LIVING veterans (daily) = w5births daily rd5.veterans. CUMU-
  LATIVE killers (daily) = distinct waveKillLog `by` values with
  w >= 4 and kill day <= that day (log day field, not sample
  day — a kill between daily points still counts from its day).
  DIVERGENCE (daily) = cumulative - living; a negative value
  is reported as-is and investigated, never clamped.
- SENSE plan: census timeline for 73678's wave-4 thread plus a
  sense-only narration replay (scripts/test-w4funnel-sense.js,
  same say/sysSay tap pattern as test-w5chain-sense.js, seed
  73678, 116 days) capturing the wave-4 arrival/fight/kill
  beats. NON-MEASURED.
- METRIC REVIEW section below is mandatory (docs/MEASUREMENT.md
  §14): pre-registered metrics bind the run — a miss is NO-GO,
  never re-scored against a friendlier metric mid-run.
- Balanced-panel note: scripts/balance-panel.js cannot ingest
  per-seed recorder corpora (tenth sighting, carried) — the
  sweep-compare table + analyzer output are attached instead,
  and telemetry-check is NOT run on recorder rows (standing
  instruction: its counts are wrong on recorder rows).

## RESULTS (written after the sweep; the pre-registration above was written before it)

## VERDICT: DIAG-GO

- (a) Census classifies 11/11 wave-4 arrivals with known outcomes
  (100%, bar >= 95%): 11 still-present, 0 unknown, 0 untagged,
  0 vanished, 0 unclassified removals, 0 pending-in-fight.
  Analyzer gate PASS (scripts/test-w4funnel-a.js 48/48).
- (b) Single largest funnel loss named with count and share:
  never-fought — 9 of 11 arrivals (81.8%), against
  fought-not-killed 2/11 (18.2%) and killer-not-living 0.
  Largest outcome class: still-present, 11/11 (100%).
- (c) Living-vs-cumulative decomposed per day on all 8 seeds:
  daily living rd5.veterans vs cumulative distinct wave-4
  killers, divergence 0 on every day of every seed; end pair
  (cumulative-through-end vs living killers at end) 1 vs 1,
  divergence 0. The one killer's end status is explained:
  elif_demir, living-scholar, in roster, not fallen.
- (d) Sense: 73678's wave-4 thread read and described below
  (census timeline, authoritative, plus a NON-MEASURED
  narration replay whose divergence from the census is
  disclosed, not hidden).

## CONTROL GATE — EXACT REPRODUCTION (gate, not a claim)

Armed band (tableseat-nowait + raftdraft + spawnsrc + oldcore +
defwound + w5births) reproduces the published control band on
every headline: raids 85, raiders 361, deaths 234,
national-ever 7/8, national-final 6/8, table invited 4/8,
entered 4/8, wins 4/8, median survival 135d, wave-3 8/8,
wave-4 6/8, wave-5 0/8, starvation 5, pool total 1,494, pool
wave-3+ 107. Per-seed trajectories match the control seed for
seed (73671 survived 180d 16/74; 73672 won lesser d97 7/28;
73673 won lesser d124 7/30; 73674 survived 180d 14/65; 73675
won lesser d135 13/56; 73676 village-lost d70 7/28 starv 4;
73677 village-lost d143 12/45; 73678 won lesser d116 9/35
starv 1). Corpus: PASS, recorder errors 0 on all five
recorders, no overflow. Detgate PASS (seed 73671: baseline vs
recorders-OFF days 180/181, tsNationalDay 77 both, no diag
surface, no wraps installed, post-setup world 0).

Gate-code fix, disclosed (corpus untouched): the first
--summary run printed NEUTRALITY DEVIATED while showing all
ten observed numbers equal to control, and CORPUS FAIL while
all recorder errors were 0. Both were predicates in the new
sweep script, not corpus deviations: (1) the neutrality
expression read `band.poolTotal` / `band.poolW3`, fields the
band object does not carry (undefined !== 1494/107) — fixed
to the `raftPoolTotal` / `raftPoolW3` variables the summary
already computed; (2) the corpus check counted overflow
OBJECT KEYS, but defwound's store initializes
`overflow: {resolveFights: 0}` — a key with value 0 — fixed
to test values > 0. Re-ran --summary only (rows untouched):
NEUTRALITY EXACT, CORPUS PASS. Same class as the w5chain
truthiness artifact; the gate now tests values, not shapes.

## THE ANSWER, FIRST (plain words)

The wave-4 kill funnel does not leak — it never opens. All
eleven wave-4 monsters born on this band were still alive when
their runs ended: none killed, none fled, none melted, none
departed. Nine of the eleven were never fought at all — not
once, by anyone, in any kind of fight. The other two were
fought and not killed, on the same dying village: one
villager walked up to the Eater, dealt 8 damage, took 98, and
died in the first round; the scholar fought the Suburb six
times in five days, lost all six, and the Suburb walked away
whole every time because a lost fight against a besieging
raider puts it back at whatever health that one fight left
it — wounds do not add up across fights, so six losses are
six fresh fights, not one long one. And the band's only
wave-4 kill — the one veteran the whole band produced — was
not one of these eleven at all: the scholar killed a Strike
that was never born into the world, in a fight that left no
birth, no removal, and no world trace. So the funnel has two
mouths and the census was watching the wrong one: the world
births produce nothing, and the one veteran that exists came
through a door the birth census cannot see. The
living-vs-cumulative question, the one this arm was built to
settle, answers itself with a shrug: there is no divergence
to explain, because there is only one killer, and she lived
to the win. The funnel's loss is upstream of all of it: the
monsters arrive too late (median arrival day 139, median 7
days left in the run), are almost never met (9/11 never
fought), and when they are met, one fight at a time is not
enough to kill them.

## CENSUS (a) — WAVE-4 ARRIVALS PER SEED

Arrival = one wave-4 world-monster birth (oldcore birth joined
to its spawnsrc spawn on seq; join clean on all 11 — 0
spawn-only, 0 birth-only, 0 untagged). Raid draft is NOT a
birth source: the spawn-source vocabulary across all spawns
on the band contains no raid-draft value (maintain,
tile-entry, scripted-titan, scripted-hushwolf, and others by
wave), and every wave-4 entity seen in a raid-time pool
traces to a spawn seq (5/5, below). Raid draft selects from
the pool; it creates nothing.

| seed | end | arrivals (type @ day, source) | days-available |
|---|---|---|---|
| 73671 | survived 180d | 1: audit @ d179, tile-entry | 1 |
| 73672 | won lesser d97 | 2: herald @ d79, scripted-titan; eulogy @ d86, tile-entry | 18, 11 |
| 73673 | won lesser d124 | 0 (wave 3 only) | — |
| 73674 | survived 180d | 3: herald @ d170, scripted-titan; suburb @ d172, tile-entry; reunion @ d180, tile-entry | 10, 8, 0 |
| 73675 | won lesser d135 | 0 (wave 4 opened d134, no birth followed) | — |
| 73676 | village-lost d70 | 0 (wave 3 only) | — |
| 73677 | village-lost d143 | 4: eater @ d133, tile-entry; suburb @ d136, tile-entry; algorithm @ d139, tile-entry; eulogy @ d140, tile-entry | 10, 7, 4, 3 |
| 73678 | won lesser d116 | 1: eulogy @ d113, tile-entry | 3 |

Band totals: arrivals 11, all fresh (fled-recovery 0).
Sources: tile-entry 9, scripted-titan 2. Arrival days sorted:
79, 86, 113, 133, 136, 139, 140, 170, 172, 179, 180 —
median 139. Days-available (end day minus arrival day)
sorted: 0, 1, 3, 3, 4, 7, 8, 10, 10, 11, 18 — median 7.
Four arrivals landed at day 170 or later, in the final
fortnight of 180-day runs; the earliest arrival (herald,
d79) still went 18 days without a single fight. Three seeds
had zero wave-4 arrivals at all (73673, 73675, 73676) —
73675 is the sharpest: wave 4 opened on its second-to-last
day and no wave-4 monster was ever born before the win.

Raid-time pool check: wave-4 entities appeared in raid-time
pools 5 times (73672 herald at raids d80 and d89, eulogy at
d89; 73677 eater and suburb at d137) — all 5 trace to spawn
seqs, 0 untraced. Drafted as raiders: exactly 1 of the 5
appearances (73677 suburb, rank 2, d137; toll 1300 -> 975).
73672's herald and eulogy sat in pools at two raids and
were drafted at neither — pool presence is not drafting,
and drafting is not fighting: neither entity has a fight row.

## CENSUS (b) — OUTCOME FOR EVERY WAVE-4 ARRIVAL

Outcome classes per the pre-registration (still-present beats
any earlier removal; re-appearance after a removal cancels
the exit). Every arrival classified; unknown count 0.

| outcome | count | share of arrivals | which arrivals |
|---|---|---|---|
| still-present | 11 | 100% | all 11 |
| killed-by-player-fight | 0 | 0% | — |
| killed-by-villager-fight | 0 | 0% | — |
| killed-by-defender-fight | 0 | 0% | — |
| killed-other-cause | 0 | 0% | — |
| departed | 0 | 0% | — |
| fled-record | 0 | 0% | — |
| melted | 0 | 0% | — |
| pending-in-fight | 0 | 0% | — |
| unknown | 0 | 0% | — |

Fought detail (the only two fought arrivals, both 73677):
- Eater @ d133 (tile-entry): 1 fight, d138, villager fight
  (resolve, vid visjoin_133): outcome vDie, 1 round, monster
  dealt 8, villager took 98 — the villager died, the eater
  took 8 damage and ended the run at 942/950 HP.
- Suburb @ d136 (tile-entry; drafted raider d137): 6 player
  TB fights, d139, d140 x3, d142, d143 — ALL 'lost', all
  re-entry (lingering=True, besieging raider). HP path from
  daily snapshots: 1300 (birth) -> 975 (d137 raid toll,
  wall 325) -> 792 (after d139 loss) -> 1144 (after d140
  losses) -> 982 (after d142 loss) -> 1300 (d143, full).
  The rise is the mechanism, read from code (game.js tbEnd):
  a lingering raider that survives a lost/fled fight is
  restored at the STANDING fighter's HP for that fight
  (o.hp = min(maxHp, standing fighter hp)) — each TB fight
  builds a fresh fighter, so only single-fight damage counts
  and wounds never accumulate across fights. The final fight
  of each fight-day left the suburb at 792 (d139), 1144
  (d140), 982 (d142), 1300 (d143) — under the fresh-fighter
  reading, 508 / 156 / 318 / 0 damage dealt in those fights,
  never close to 1300 in one fight, so never dead. (The
  end-of-day numbers are the last fight's standing HP, not
  a sum across the day's fights — d140's three losses do
  not add up to anything.) This is the fight-survival
  stage, measured: fought 2/2, killed 0/2.

The band's only wave-4 kill is OUTSIDE this table, and that
is the census's most important negative: waveKillLog holds
exactly 1 wave-4 entry on the band (73678, d115, strike,
by elif_demir, via 'player'), and it matches NO arrival
(log-without-arrival 1/1; kills-with-log-match 0/0). The
strike was never a world birth (0 strike spawns on 73678),
never a removal, never a tbEnd-origin — a TB kill with no
world trace at all. Mechanism, read from code (game.js
startCombat): the TB fighter is built from the monster def;
playerMonster() supplies the world origin, and when it is
null (no world monster on the player's tile) the fight
proceeds anyway with no origin, no lift, no removal — and
tbKillRewards still logs via 'player' with by=scholar.
Candidate initiation paths for a non-world TB fight, from
the startCombat call sites: feast draw (feastBuff.js
faceFeastDraw), tent intruder (faceTentIntruder), door-flee
re-engage (reengageWaitingMonsters), trap trigger, and the
contest arena (RULED OUT for this kill: contest kills log
via 'contest', this one logs via 'player'). Which path
73678's strike took is NOT proven by this corpus — the
corpus records no TB-initiation context — and is the named
next blank, not a claim made here.

## CENSUS (c) — LIVING VS CUMULATIVE VETERANS

Daily living = w5births daily rd5.veterans (last point per
day; duplicate-day points: present on some seeds, 0
disagreements on veterans anywhere). Daily cumulative =
distinct waveKillLog `by` with w >= 4 and kill day <= that
day. (Wave-5 log entries: 0 on the band, so w >= 4 and
w == 4 coincide here; the analyzer verifies, not assumes.)

| seed | living days >=1 | living days >=2 | max living | max cumulative | max divergence | end living / cumulative |
|---|---|---|---|---|---|---|
| 73671 | 0 | 0 | 0 | 0 | 0 | 0 / 0 |
| 73672 | 0 | 0 | 0 | 0 | 0 | 0 / 0 |
| 73673 | 0 | 0 | 0 | 0 | 0 | 0 / 0 |
| 73674 | 0 | 0 | 0 | 0 | 0 | 0 / 0 |
| 73675 | 0 | 0 | 0 | 0 | 0 | 0 / 0 |
| 73676 | 0 | 0 | 0 | 0 | 0 | 0 / 0 |
| 73677 | 0 | 0 | 0 | 0 | 0 | 0 / 0 |
| 73678 | 2 (d115-116) | 0 | 1 | 1 | 0 | 1 / 1 |

Band: living-days >= 1: 2; >= 2: 0; max living 1; max
cumulative 1; max divergence 0; end pair
(cumulative-through-end vs living killers at end) 1 vs 1,
divergence 0. The divergence series is flat zero because
there is exactly one killer on the band and she never stops
being counted: elif_demir (73678 scholar, kill d115,
via 'player'), gateLiving true (vid == Game.villagerId,
living by definition), in roster, not in fallen, at the
d116 win. Dead killers at end: 0. Not-counted killers at
end: 0 (no null-by entries, no 'player'-vs-vid mismatch —
the scholar's vid IS the log's by value here).

So the w5chain run's revolving-door worry — kills happen
but killers die or leave before they count — is RULED OUT
as a band phenomenon here, with the honest scope limit:
n = 1 kill. What the census proves is that the living bar
was never even approached from the cumulative side: 7/8
seeds never had a cumulative killer at all, and the eighth
had one, living, for its last two days. The veteran shortage
is a kill shortage, not a survival shortage. Whether a
second, third, or tenth killer would survive to count is a
question this band cannot answer — it has no second killer
to test with. (Side note, not a verdict input: 73677's
wave-4 readiness veterans (rd4, demand 1 wave-3 killer)
maxed at 1 — the wave-4 door's veteran bar was met there
even while its wave-5 bar sat at 0. Different bars, same
word; the evidence keeps them apart.)

## CENSUS (d) — THE SINGLE LARGEST FUNNEL LOSS

Stage losses, computed on arrivals (killer-not-living is a
veteran-stage loss, compared on count):

| stage | count | share of arrivals | share of its stage |
|---|---|---|---|
| never-fought | 9 | 81.8% | 81.8% of arrivals |
| fought-not-killed | 2 | 18.2% | 100% of fought (2/2) |
| killer-not-living-at-end | 0 | 0% | 0% of kills (0 kills from arrivals) |

Named largest loss: NEVER-FOUGHT, 9/11 arrivals (81.8%).
The funnel narrows at first contact, not at the kill and
not at veteran survival: most wave-4 monsters are born,
never met, and still standing when the run ends. The
second stage is a perfect 0/2 — every fought arrival
survived — but it drains only 2 arrivals against the
first stage's 9. Any next arm that manufactures wave-4
kills without manufacturing MEETINGS will move nothing:
the binding constraint is arrival-to-encounter, and behind
it arrival timing (median 7 days available) and the
single-fight kill requirement for lingerers.

## SENSE-TESTING READ (best seed 73678's wave-4 thread)

Census timeline, the authoritative thread (the replay below
diverged and is labeled as such):

Day 113: a Eulogy — the Mirror Draft's death-narrator —
steps onto a tile the scholar walks (tile-entry birth, the
band's only wave-4 arrival on this seed). Nothing happens.
Day 114: nothing happens. Day 115: the scholar kills a
Strike — a house-sized inflatable rat that shuts the grid
down — in a turn-based fight that never touched the world:
no birth, no removal, no trace but the kill log itself
(by elif_demir, via 'player'; the deed feed records strike
faced on this seed, the kill its one logged wave-4 entry).
The village gains its only living wave-4 killer of the
band. Day 116: the village wins through the lesser seat,
the Eulogy still standing at full health (900/900)
somewhere in the world, never met, never fought, never
named in the fiction as far as the census can tell. The
Eulogy and the Strike never meet: the monster the village
was supposed to prove itself against walks past unseen, and
the monster that actually blooded the village arrives
through a door with no name.

Sense judgment: the thread reads as two ships passing — a
world monster the systems never introduce to the player,
and a kill the systems never introduce to the world. The
player's actual wave-4 experience on the best seed of the
band is one unexplained Strike fight and a win the next
day; the Eulogy, the Mirror Draft monster with the most
legible fiction (it narrates your death before it happens),
contributes nothing but a birth record. That is the
arrival-to-encounter gap as a player would feel it: not
"we fought and lost" but "we never met."

NON-MEASURED replay note (scripts/test-w4funnel-sense.js,
seed 73678, 116 days, say/sysSay taps from d100): the
replay REPRODUCED the defer4 hold beats ("The next act is
still waiting — blood your fighters (0 of 1 veterans)",
d107 and d114) but did NOT reproduce the strike thread —
no strike fight lines appear from d100-116 in the replay.
Narration replays shift trajectories (the standing w5chain
caveat), and this one shifted past the census's d115 kill.
The replay text therefore proves the hold beat's wording
and placement, and proves nothing about the strike's
initiation path — the path candidates above rest on code,
not on replay quotes, and the evidence says so.

## VILLAGE ASSESSMENT (plain words)

These are the same eight villages as the shared band, so
their fates are already known — what is new is where their
wave-4 monsters went. Mostly nowhere: six villages that
reached wave 4 produced eleven monsters between them, and
every one of those monsters was still alive at the end of
its run, most of them never even seen. The villages did not
lose fights against the Mirror Draft; they did not have
fights against the Mirror Draft. The one village that did
fight — the one that lost at day 143 after its villagers
had scaled to national — fought twice: once a villager
died in a single round to the Eater, and six times the
scholar lost to the Suburb and watched it come back whole.
That village's story is the funnel in miniature: arrive
late, meet rarely, and when you meet, one fight is never
enough. The village that won "best" did so without meeting
its wave-4 monster at all, on the strength of a Strike that
came from nowhere the census can see. If the Mirror Draft
is supposed to be the System building monsters out of us,
on this band it built them, put them in the world, and
never introduced them.

## BLANKS FILLED OR DOCUMENTED

- FILLED (answered, with numbers): the wave-4 kill funnel
  on the shared band — arrivals 11 (tile-entry 9,
  scripted-titan 2, raid-draft 0), outcomes 11/11
  still-present, fought 2/11, killed-from-arrivals 0/11,
  largest loss never-fought 9/11 (81.8%), living-vs-
  cumulative divergence 0 everywhere, the band's single
  kill proven non-world (strike, 73678 d115, scholar,
  via 'player', no birth/removal/tbEnd-origin).
- FILLED (mechanism, read from code): why the suburb
  survived six lost fights — lingerer restore at the
  standing fighter's HP per fight (game.js tbEnd), so
  wounds never accumulate across TB fights; and why a TB
  kill can exist with no world trace — startCombat builds
  its fighter from the def and proceeds with a null origin
  when no world monster is on the player's tile.
- DOCUMENTED, NOT FIXED (named next blank, below): the
  non-world TB kill funnel (which initiation path produced
  73678's strike, and how many veterans it produces
  band-wide); the lingerer wound-reset question (a Steve
  design ruling, not a finding); the arrival-timing root
  (wave 4 unlocks at standing 100 late — proxy4 d157/d177
  on the survived seeds — so arrivals get median 7 days).
- CARRIED (not chased here): the empty nonat x w4 class
  (w5chain-a); the melt fiction-vs-mechanics gap (1815Z,
  Steve rulings pending); the 23% pool wave-3+ bar
  re-derivation (tileentry question, still open).

## NEXT-BLANK PROPOSAL (concrete next arm)

Next arm: sim-nonworldkill-a (DIAG, same band, same
recorders plus one new instrument). Pre-registration
sketch: (1) instrument TB-fight initiation — wrap
startCombat to record, per TB fight, the caller context
(feast draw / tent intruder / door-flee re-engage / trap /
world bump / contest / other, from the call stack + the
pending state that names it) and whether a world origin
existed (playerMonster() null or not), WITHOUT changing
any fight; (2) census, per seed: TB fights by initiation
path and wave, kills by initiation path and wave, and
veterans produced per path — DIAG-GO when every wave-4 TB
kill on the band is initiation-classified and the
non-world share of wave-4 encounters is counted; (3) the
73678 strike re-run through that instrument to name its
path, or report it unclassifiable with the reason. Rationale:
this arm proved the only veteran on the band came from
outside the world funnel — the next arm must measure that
door before any lever touches the world funnel, or the
loops will keep tuning a funnel that produces nothing.
Second, separable question for the same run's metric-review
shelf (not the same arm): whether lingerer TB losses
should accumulate wounds across fights — that is a Steve
design ruling (it changes what a lost fight means), and
the evidence for it is the suburb's 792 -> 1144 -> 1300 HP
path above, not a lever to pull silently.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

No metric was re-scored mid-run. The run was judged exactly
against its four pre-registered DIAG-GO legs (a) >= 95%
classified (100% achieved), (b) largest loss named with
count and share (never-fought 9/11), (c) living-vs-
cumulative decomposed per day with per-killer end
explanation (divergence 0 everywhere; elif_demir
living-scholar), (d) 73678's thread described in plain
words (census timeline + replay note). Two method notes,
neither a revision: (1) the sweep's first --summary run
failed its own gates on predicate bugs (undefined band
fields; overflow-key counting) — fixed in the sweep
script, corpus untouched, re-run gates EXACT/PASS (see
Control gate). (2) The analyzer's daily series is bounded
by the last daily point, so a kill after that point would
hide from the series — caught by the synthetic unit test
(48/48 after the fix) and closed by reporting the
end-state pair (cumulative-through-end vs living killers
at end) alongside the series; on this corpus the last
daily point falls on the end day for 7/8 seeds (73677's
last point is d142 against a d143 end — its end pair is
0/0 either way, so nothing hides). The telemetry-check
and balanced panel were NOT run, per the standing
exception for recorder rows (panel cannot ingest per-seed
recorder corpora — tenth sighting). The sweep-compare
table + analyzer output are the comparison of record. The
telemetry baseline was NOT rolled. No game code changed in
this run; no [needs-eyes] flag applies (DIAG-only, no
narration or behavior added — the sense script only READS
beats on a replay, it adds none to the game).

## Infrastructure notes

- Sweep: scripts/test-w4funnel-diag-sweep.js is the oldcore
  sweep copied with the w5births + defwound recorders added
  and a post-run killer-status snapshot (gate-rule living
  test per killer); composition, seeds, and control gate
  identical. Corpus:
  evidence/2026-10-25/perseed-sim-w4funnel-a/ (8 rows +
  summary.json + analysis.json). Analyzer:
  scripts/test-w4funnel-diag.js. Unit proof:
  scripts/test-w4funnel-a.js (48/48). Sense:
  scripts/test-w4funnel-sense.js (NON-MEASURED replay only).
- Detgate PASS (see Control gate). No EPERM flap blocked
  this run's writes; all 8 rows wrote first try.
- Commit: sim-w4funnel-a, DIAG-GO, zero src/js diff. Ready
  for coordinator merge; NOT pushed, NOT bumped, live NOT
  verified (coordinator/ship-loop line, not this arm's).
