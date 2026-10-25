# sim-deathcensus-a — villager death-context census (axis scale-onramp, DIAG ONLY)

Run: fleshout-20261025T0644Z (Sun 2026-10-25 ~01:45–03:00 CDT). Axis:
scale-onramp (converging). DIAG ONLY — zero src/js changes, policy-side
recorder only. No sibling tree, branch, claim file, tracker, or lock
touched. No push, no version bump, no live verification — this worker
reports "ready to merge, pending ship"; merging is the coordinator's job.

## PRE-REGISTRATION (binding — judged only against this)

- Question: WHERE do villagers actually die on the scale-wall band, and
  what does that say about the survivability companion the next finish
  lever needs? (0535Z killed three finish remedies on cost — breakexcept:
  deaths 261 → 390, median 116d — without ever measuring the death source.)
- Substrate (shared, landed pattern, NO difference from the brief):
  tableseat-nowait — leanlinkrescue courtship (LEANLINKRESCUE=1) + seat
  legs only (TABLESEATNOWAIT=1), no wait leg — exactly the
  sim-arrivaltrace-a / sim-fieldfinish-a invocation (baseline = bare
  tableseat-nowait; armed = tableseat-nowait wrapped with the recorder).
  Seeds 73671–73678, 180d death-aware horizon. The invocation found in
  the landed evidence matches the brief exactly; nothing was improvised.
- Primary metric: the ranked villager-death census (context counts on
  identical seeds).
- DIAG-GO iff (a) census complete on 8/8 seeds with zero recorder errors
  and unknown-context deaths < 10% of combat deaths, (b) death contexts
  ranked with numbers and the single largest villager-death source
  stated, and (c) the companion target for the next finish lever named
  with numbers — or the data stated to support no single target.
- Pilot only: 8 seeds, no confirm spend.
- Horizon + why: 180d death-aware (reachability band; dead villages stop,
  wins end days 90–150). Seeds are the standing scale-wall band, reused
  intentionally for control comparability.
- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave law),
  docs/MEASUREMENT.md §§9–12, 14–15. No haven/raid canon doc exists
  (noted by the prior run) — the raid design lives in src/js/havenGrowth.js
  comments, which this recorder preserves and cites (raid flag on
  resolveWildMonsterEncounter; crisisWaveOf def lookup; palisade toll).
- Balanced panel (§15): NOT run as a compare, deliberately. There is no
  lever in this run — baseline vs armed differ only by the recorder, and
  the comparison IS the neutrality proof (G2, identical trajectories on
  identical seeds). The 0535 run already established the panel-compare
  error class for per-seed recorder corpora (compare requires panel
  pairs); re-running a known-broken path would add no evidence. The
  sweep-compare tables on identical seeds below are the comparison.

## VERDICT: DIAG-GO

- (a) PASS: census complete on 8/8 seeds, recorder errors 0, unknown
  deaths 0, combat deaths 15 → unknown share 0.000 < 0.10.
- (b) PASS: contexts ranked below; largest single villager-death source
  is FIELD fights (12/27), stated with the tie disclosed (see below).
- (c) PASS: companion target named below with numbers.
- Proof gates: G1 det-gate PASS (seed 73671, wrapped-with-recorder-off
  == baseline on days/gameDays/ts, no diag surface, no wraps installed);
  G2 recorder neutrality PASS (8/8 seeds identical on days/gameDays/ts/
  starvation/faced/kill-log/death-list); G3 corpus integrity PASS (16/16
  rows; armed rows carry fight ROWS + death rows + analysis; baseline
  rows carry the deaths snapshot); reproducibility PASS (--detail 73671
  censusMatch=true; --transcript 73672 censusMatch=true).
- Targeted suite: check.js --only fieldfight — 2 passed, 0 failed.

## THE CORRECTION THAT CHANGES THE READING (read this first)

The first census this run produced was WRONG, and the error is the
finding the coordinator most needs: the harness death list mixes THREE
populations, because registerDeath fires one death tele for every death
(corpses.js: "kind covers person/monster/animal"). Filtering only on the
player flag — as the historic death summaries did — counts monster
deaths as villager deaths. First (wrong) census: 219 "villager deaths",
205 "other". Corrected census, filtered by kind (person/villager only,
non-scholar): 27 villager deaths. The band's 261 death teles decompose
as 192 monster deaths + 42 scholar deaths + 27 villager deaths.

Consequence for 0535Z (NOT a re-score — its verdicts stand on its
pre-registered bars): its cost leg "deaths 261 → 390" was measured on
the same mixed total. The +129 in breakexcept was mostly NOT villagers
dying — its composition is unknown, because the arms' corpora are
deleted. Any future cost bar that says "villager deaths" must filter by
kind, or it will keep pricing monster kills as village blood. (See
Metric review.)

## CENSUS (armed arm, 8 seeds — the result)

Villager deaths (kind person/villager, non-scholar): 27.

Ranked death contexts:

| Context | Deaths | Share of 27 |
|---|---|---|
| field (wild/patrol/expedition field fights) | 12 | 44% |
| other (no fight evidence; cause-stated, see below) | 12 | 44% |
| defender raid fight | 1 | 4% |
| arena (opts.noFlee) | 1 | 4% |
| tb fight | 1 | 4% |
| unknown | 0 | 0% |

Combat contexts total: 15/27 (56%). Starvation: 3/27 (all in "other").

The field/other tie, resolved honestly: "other" is not one source — it
is five channels (ambush 3, sickness 3, starvation 3, wounds 2, alien 1).
The single largest villager-death SOURCE is FIELD fights (12), ahead of
every single other channel (next: 3). The single largest combat context
is also field (12 of 15 combat deaths).

Death-cause shares (villager deaths only): monster 11, ambush 3,
sickness 3, starvation 3, a wound that wouldn't close 2, The Suburb 1,
Nevermore 1, contest 1, combat (tb) 1, alien 1.

Per-seed villager deaths: 73671: 2 (field 1, other 1); 73672: 5 (field 2,
other 3); 73673: 2 (field 2); 73674: 1 (field 1); 73675: 4 (field 2,
arena 1, other 1); 73676: 8 (field 2, raid 1, tb 1, other 4); 73677: 3
(field 2, other 1); 73678: 2 (other 2).

## THE 15 COMBAT DEATHS (every one, with its fight)

"Dealt" = damage the villager dealt to the monster; "taken" = damage the
villager took. vHpStart = villager HP fraction at fight start; mHpStart
= monster HP fraction at fight start (null = no world entity: contest /
def-only fight). Break line: 0.15 wave>=2, 0.25 wave 1.

| Seed/day | Villager vs monster (wave) | Context | Rounds | vHpStart | mHpStart | Dealt/taken | Monster end |
|---|---|---|---|---|---|---|---|
| 73671/d89 | ursula_weber vs eater (4) | field | 1 | 0.87 | 1.00 | 0 / 103 | 1.00 |
| 73672/d43 | priya_nair vs understudy (2) | field | 4 | 0.45 | 0.67 | 51 / 50 | 0.18 |
| 73672/d56 | ethan_hunt vs ad_break (3) | field | 1 | 0.09 | 0.19 | 19 / 13 | 0.13 below line |
| 73673/d8 | gen_te50r63 vs gallowdeer (1) | field | 1 | 0.07 | 0.46 | 0 / 13 | 0.46 |
| 73673/d107 | gen_in9ciwi vs suburb (4) | field | 1 | 0.52 | n/a | 0 / 69 | n/a |
| 73674/d17 | diana_osei vs hushwolf (1) | field | 1 | 0.11 | 1.00 | 0 / 20 | 1.00 |
| 73675/d30 | gen_uzmmgq0 vs nevermore (1) | field | 1 | 0.07 | n/a | 0 / 10 | n/a |
| 73675/d88 | gen_wag8dbe vs hummice (1) | arena | 4 | 0.55 | n/a | 0 / 58 | n/a |
| 73675/d146 | nina_petrova vs focus_group (3) | field | 1 | 0.11 | 0.65 | 0 / 23 | 0.65 |
| 73676/d18 | gen_g8rx4z0 vs hushwolf (1) | field | 1 | 0.06 | 0.76 | 0 / 9 | 0.76 |
| 73676/d123 | visjoin_120 vs audit (4) | RAID | 2 | 1.00 | 0.75 | 42 / 103 | 0.71 |
| 73676/d169 | app_mgpsphh7905 vs audit x4 (4) | tb | n/a | n/a | n/a | n/a | n/a |
| 73676/d171 | visjoin_165 vs suburb (4) | field | 1 | 0.52 | 0.75 | 9 / 87 | 0.74 |
| 73677/d67 | nora_wilson vs belltoad (1) | field | 3 | 1.00 | 0.40 | 0 / 105 | 0.40 |
| 73677/d68 | gen_ed0l37r vs belltoad (1) | field | 2 | 0.73 | 0.40 | 0 / 76 | 0.40 |

What the 15 say, in three groups:

1. THE NEARLY DEAD, JUMPED (6 of the 9 one-round deaths): the villager
   entered at 6–11% HP and died in round 1, mostly dealing 0 damage
   (gallowdeer, hushwolf, nevermore, focus_group, hushwolf, ad_break).
   These villagers did not lose a fight; they were caught already
   dying. No in-fight companion saves them — they needed to not be in
   the fight (evade, flee, or be kept home while nearly dead).
2. THE ONE-SHOTS (3 one-round deaths at >=50% HP): a near-full-health
   villager killed in a single round by wave-4 damage — eater 103,
   suburb 87, suburb 69. These need in-fight survivability (HP/armor),
   not a gate: they were healthy and still died in one round.
3. THE REAL FIGHTS (5 deaths over 2–4 rounds, plus the tb death): Priya
   vs understudy (4 rounds, 51 dealt / 50 taken — an even fight lost);
   the raid audit (full health, 42 dealt / 103 taken over 2 rounds);
   the belltoad pair (full health, 0 dealt over 2–3 rounds, 76/105
   taken — the villagers never scratched a 40%-HP toad; WHY they dealt
   0 over multiple rounds is an open mechanism question, not answered
   here); the arena hummice (4 rounds, 0 dealt / 58 taken).

Combat deaths by wave: wave 1: 7, wave 4: 4, wave 3: 2, wave 2: 1,
tb (no wave): 1. Only 1 of 15 combat deaths ended with the monster
below the break line (Ethan's ad_break at 0.13) — combat deaths are NOT
mostly about below-line monsters; the below-line population is about
repeats, not deaths (next section).

## THE 12 "OTHER" DEATHS (cause-stated, never guessed as fights)

- ambush 3 — betrayal-plot kills (betrayal.js registerDeath cause
  'ambush', killer = plot leader): social violence, not monster fights.
- sickness 3 — disease ticks.
- starvation 3 — food (all 3 villager starvation deaths on the band).
- a wound that wouldn't close 2 — villagers who died while the scholar
  was away, of wounds taken earlier: delayed fight consequences, a
  channel a companion could plausibly touch (wound care after fights).
- alien 1 — an alien-player kill (alienPlayers.js cause 'alien').
- No death in this band is unattributed: unknown = 0.

## BAND TOTALS THE BRIEF ASKED FOR

- Deaths by context: field 12, raid 1, arena 1, tb 1, other 12,
  unknown 0 (villager deaths 27; scholar deaths 42 and monster deaths
  192 reported separately, never mixed in).
- Death-cause shares: combat contexts 15/27 (56%), starvation 3/27
  (11%), other causes 9/27 (33%), unknown 0.
- Field wave-3+ fights: 87, vKill 0, vDie 6 — an EXACT replication of
  the 0535 control (87/0/6). Villagers still never kill a wave-3+
  monster in the field on this band.
- Defender fights ending mFlee with a below-line survivor: 297.
  Raid fights total 342 (outcomes: mFlee 299, vFlee 22, vKill 20,
  vDie 1). Nearly every defender-fight mFlee (297/299) ends below the
  break line — the wound-manufacture population is as large as 0535
  suspected, and it is made almost entirely by defender fights, not by
  the toll. Field (non-raid) mFlee-below-line: 621 more, over 1362
  total fight rows (resolve 1124 + direct 238). Tb rows: 145.
- Fight-row deaths without a harness death entry (orphans): 0.
  Evidence rows: 15, matching the 15 combat deaths exactly.

## THE COMPANION TARGET (named, with numbers)

The next finish lever's survivability companion must protect FIELD
fights — the single largest villager-death source (12/27, 44% of
villager deaths, 12/15 combat deaths) — and within field fights it must
cover BOTH failure modes, because they need different mechanisms:

(a) The nearly-dead entry: 6 of 9 one-round field deaths entered below
    15% HP and died dealing 0 damage. A companion here is behavioral
    (don't let a nearly-dead villager stand and fight a wild jump —
    evade, flee, or stay home), not statistical.
(b) The wave-4 one-shot: 3 one-round deaths at >=50% HP to wave-4
    damage of 69–103 in a single round. A companion here is
    survivability in the fight (HP/armor), because the villagers were
    healthy and still died in one round.

What it must NOT break (both measured, both load-bearing):

- RAID DEFENSE, which already works: 342 raid fights cost exactly 1
  villager death while killing 20 raiders. A companion that pulls
  defenders out of raid fights, or softens raid defense to "protect"
  villagers, would break the one fight type villagers already win.
- THE BREAK LINE'S FLEE PROTECTION: the 0535 lesson stands — every
  finish variant tried (HOLD, NOFLEE, breakexcept) traded stalemate for
  blood in proportion to its scope. A companion that merely keeps
  villagers in fights longer, without the survivability to survive
  those rounds, repeats that trade.

And the scale check the companion must be judged against: the true
villager-death population on this band is 27, not 261. A companion
claiming to "save dozens of villagers" on this band is promising
against deaths that do not exist — 192 of the 261 are monster kills
the village should be proud of, and 42 are scholar successions.

## CONTROL CHECK (historic band headlines — zero mismatch)

Baseline AND armed replicate the historic control EXACTLY on every
headline (the recorder changes nothing — G2 proves it):

| Headline | Historic | Baseline | Armed |
|---|---|---|---|
| won | 4/8 | 4/8 | 4/8 |
| median survival (all runs) | 150d | 150d | 150d |
| median survival (wins excluded) | — (see metric review) | 180d | 180d |
| national-ever | 8/8 | 8/8 | 8/8 |
| national-final | 7/8 | 7/8 | 7/8 |
| table / entered | 5 / 4 | 5 / 4 | 5 / 4 |
| wave-4 reach | 5/8 | 5/8 | 5/8 |
| wave-5 reach | 0/8 | 0/8 | 0/8 |
| max arc | 4 | 4 | 4 |
| death teles (mixed total) | ~261 | 261 | 261 |
| villager deaths (kind-filtered) | — (new) | — | 27 |
| starvation deaths | 3 | 3 | 3 |

No mismatch to report. The 261 is now decomposed (192 monster + 42
scholar + 27 villager) rather than merely repeated.

## VILLAGE ASSESSMENT (plain words)

The villages on this band look like they have for a week: they reach
the region, most get invited to the table, and four sit down and win
the lesser seat — but nobody reaches the full seat, nobody reaches
wave 5, and nobody kills a wave-4 monster. What this census adds is
the price of that shape, counted honestly for the first time: the
village loses only about three villagers per run to all causes
combined (27 over 8 runs), and more than half of those die in field
fights — not in the raids everyone watches, not at the table, but out
in the wild, where a villager meets a monster alone. The raids, the
part of the game that looks most dangerous, are the safest fights in
the village: 342 raid fights, one death. The dangerous fight is the
ordinary one — a villager at a tenth of their health meeting a
hushwolf, or a healthy villager meeting a wave-4 eater that hits for
103 in a single round. The village does not bleed out; it gets picked
off, one villager at a time, in fights nobody watches. A companion
that protects the watched fights (raids, the table) would protect
almost nobody. The companion has to walk out into the field with the
villager who is already hurt.

## SENSE-TESTING (transcript, on the census trajectory)

Narration-mode replays DIVERGED from census trajectories on all 4
seeds tried (different days/outcomes, zero villager deaths), so no
narration replay can quote a census death — the sense file for this
run (evidence/2026-10-25/sim-deathcensus-a-sense.txt) is instead the
transcript tap: the engine's own awayNews death line, captured
read-only from the fight wrap on the exact census trajectory
(censusMatch=true for seed 73672). Quoted verbatim:

> 💀 The Understudy killed Priya in 4 rounds. The village mourns.
> (d43: Priya vs understudy, wave 2, 4 rounds, started at 45% HP,
> dealt 51, took 50 — an even fight, lost.)

> 💀 The Ad Break killed Ethan in 1 round. The village mourns.
> (d56: Ethan vs ad_break, wave 3, 1 round, started at 9% HP, dealt 19,
> took 13, monster ended at 0.13 — below the wave-3 line.)

Judged as stories, not counts: Priya's death reads as a fight she
could plausibly have survived — four rounds, near-even damage, a
companion granting one more round or a little more health might have
flipped it. Ethan's reads as a number, not a fight — a villager at a
tenth of his health meeting a wave-3 monster and dying in one round
while the monster walks away wounded below the line. No in-fight
companion saves Ethan; the failure happened before the fight started,
when a nearly-dead villager was still out where monsters walk. Both
readings point the same way as the numbers: the companion must cover
the entry (who is out there hurt) AND the round (who can take a
wave-4 hit), or it covers neither kind of death fully.

## INSTRUMENT NOTES (what was built, what it cannot see)

- New: scripts/policies/deathcensus-diag.js (resolve-level rows with
  raid/field context — the raid flag does NOT survive into fieldFight,
  because resolveWildMonsterEncounter never forwards opts.raid;
  direct fieldFight rows for non-routed fights, arena by opts.noFlee;
  tb rows with end-state fighter capture) + scripts/
  test-deathcensus-diag-sweep.js (sweep + --detgate + --detail +
  --transcript + --sense modes).
- Two instrument bugs found by this run's own data and fixed before
  judging (both fixes re-proven: det-gate re-run PASS, full sweep
  re-run, detail + transcript repro PASS):
  1. Kind-filter miss: the first census counted 192 monster deaths as
     villager deaths. Fixed by filtering the population to kind
     person/villager (monster/animal counted separately).
  2. tb-death miss: the first tb rule required startAlive && !endAlive,
     but tbEnd capture happens AFTER the fight, so a fighter killed in
     the fight is already dead at capture and the rule could never
     fire. Fixed: a tb fighter ending dead (alive false or hp <= 0),
     matched to a same-day death entry, is a tb death. This recovered
     exactly one death (73676 d169, audit tb fight) — the only tb
     death on the band.
- What the recorder cannot see (stated, not hidden): ally falls inside
  a field fight (the returned record carries allyVid/calledHelp but no
  ally end state); monster HP fractions for def-only fights (m == null:
  contest/arena beasts — wave still comes from the def lookup, flagged
  as waveSource 'def'); tb per-round detail (tb rows carry end state
  only, no rounds/damage — the tb death's fight is a black box beyond
  its monster list and result); and the WHY behind 0-damage multi-round
  deaths (the belltoad pair: 0 dealt over 2–3 rounds — mechanism
  unknown, flagged as an open question, not explained).
- Corpus: evidence/2026-10-25/perseed-deathcensus-a/ (16 per-seed JSONs
  + summary.json, in the worktree evidence dir — never /tmp, per the
  sibling-cleanup wipe class). Summary JSON: same dir, summary.json.

## METRIC REVIEW (required, §14 — no re-scoring in this run)

- Death-tele totals are NOT villager deaths (this run's correction):
  every published "deaths N" on this band (261 here; 261 → 390 in
  0535Z) mixes monster kills, scholar successions, and villager
  deaths. Next run's pre-registration must define the death population
  by kind (person/villager, non-scholar) before using it in any cost
  bar. 0535Z's verdicts are NOT re-scored under this revision — but
  its cost legs' compositions are now known to be mixed, and any
  future arm that reuses its cost bars must re-measure them filtered.
- Median win-shortening (carried from 0535, confirmed here): all-runs
  median 150d vs wins-excluded median 180d on identical data. Both
  are reported above; neither replaces the other mid-run.
- Wave-4 reach vs wins (carried from 0535): wins and wave-4 reach are
  both reported; no guard leg in this run conflates them.
- Narration replays diverge from census trajectories (4/4 seeds):
  loadGame narration:true + postunlock-instrument replays land on
  different days/outcomes with zero villager deaths. Sense quotes from
  narration replays describe a DIFFERENT run than the census. Next
  sense work should use the transcript tap (exact trajectory) or
  pre-register the divergence. No metric was re-scored under this
  note.
- Metrics held otherwise: the GO bar judged exactly as written; the
  control headlines replicated exactly; no threshold moved mid-run.

## NEXT BLANKS, IN ORDER (for the coordinator, not this run)

1. Survivability companion for field fights (this run's named target):
   two mechanisms — nearly-dead entry behavior + wave-4 one-shot
   survivability — with raid defense and the break line as must-not-
   break guards, judged on kind-filtered villager deaths (population
   27/band), never on death-tele totals.
2. Belltoad 0-damage deaths: why do villagers deal 0 damage over 2–3
   rounds against a 40%-HP belltoad? Mechanism question for a future
   diag (fight-row forensics, not a lever).
3. Wound-aftermath deaths (2/band): villagers dying later of wounds
   taken earlier — is wound care a companion channel, or working as
   designed (wounds are supposed to kill)?
4. Kind-filtered cost bars for all future arms: re-measure 0535Z-style
   cost legs (deaths, median) on the filtered population before
   reusing them as gates.

scale-onramp stays converging (NOT converged): this run is a DIAG —
it names the companion target and corrects the death population, but
no lever moved, the full seat is still unreached, and wave 5 is still
0/8. The directive stands until the tracker records this axis converged
on measured evidence.
food-economy untouched (sibling B loop).
Convergence state: converging.
