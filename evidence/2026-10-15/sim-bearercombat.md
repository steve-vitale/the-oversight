# sim-bearercombat — bearer combat-death census on national-holding runs (2026-10-15)

Worktree: `~/workspace/worktrees/sim-bearercombat`. Run: oversight-flesh-out-loop
fleshout-a-20261015T151641Z, ARM bearercombat (sim-bearercombat) — DIAGNOSTIC
INSTRUMENT, zero game-code changes, zero policy changes (scripts + evidence only).

**Assignment lineage:** the succhain instrument (evidence/2026-10-15/sim-succhain.md,
built on holdloss-lib) found bearer-death chains are shallow (mean 1.22), 27/28
deaths combat, 22/23 keep rank — succession-collapse is closed as a loss mode; the
cascade is combat mortality, not polity dissolution. It never broke down WHERE/HOW
the bearer dies in combat. This arm builds the census that does.

**Canon:** docs/CANON.md read first; docs/MONSTER-WAVES.md read for the wave law
(wave 1 = animal shock incl. the Highbeam Deer benchmark; wave 2 = conceptual
predators; wave 3 = signature-mechanics horrors; raids/breaches are fought, not
rolled). No canon doc covers bearer-death attribution per se — the census
taxonomy is this arm's instrument, not canon.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE sims)

**Question:** on runs that reach national, every bearer combat death — what
killed them? Killer wave (1–5), tile class (haven/wild/arena-contest), fight type
(turn-based/contest/hunt/expedition/field-damage), entry HP + armor P at fight
start, counter-known state, succession consequences (rank 7d after, days to next
bearer death)? Name the combat-mortality lever the next run should pull.

**DIAGNOSTIC GO (binding):**
- ≥90% of bearer combat deaths ATTRIBUTED — attributed = fightType + tileClass
  + killerClass ALL named (killerClass = monster wave 1–5 or a named non-wave
  class: 'contest-opponent', 'prey', 'expedition'). 'unknown' in any slot counts
  AGAINST the bar; the full trail is kept on the record.
- Denominator: bearer deaths with family combat|monster (holdloss
  classifyDeathFamily convention) PLUS the hunt blind-spot rule (a hunt death
  is a combat death the inherited classifier misses — 'the turkey' → null —
  so fightType 'hunt' joins the denominator explicitly; a rule of this
  instrument, documented in bearercombat-lib-20261015.js, not a change to the
  inherited lib). Restricted to runs reaching national at least once — the wall
  question is the hold, not the climb.
- ≥2 sense-read death narratives in plain words (SENSE-TESTING LAW).
- ONE NAMED NEXT lever (the single biggest killer class) filed in sim-findings.md.

**Substrate:** 8 seeds (11/22/33/44/55/66/77/88) × {leadfeast, belongfeast}
unlayered, 180d death-aware, FEASTSCALE_R13=1 asserted up front in proof AND
sweep (the #312 lesson).

**Horizon + why:** 180d death-aware (dead villages stop simulating, ≤10d tail).
National reaches ~day 60–90; the census covers the full run on national-holding
runs (the hold, not just the young window).

**Instrument:** `scripts/bearercombat-lib-20261015.js` (pure classifier on
persisted run records; zero policy edits, zero src/js changes), built on
holdloss-lib-20261015.js (classifyDeathFamily) and succhain-lib-20261015.js
(isBearerDeath, the national window). The sampler (`scripts/sweep-bearercombat-
20261015.js`) hooks read-only: startCombat → the TB session record (monster
id/wave/name, entry HP, entry armor P via armorBonus(), tile at start, counter-
known via the waveLedger monsterCounterKnown convention); tbDamage → hits/damage
actually dealt to the player per fight (the HONESTY return value); tbEnd → closes
the session (a TB death fires playerDeath INSIDE tbEnd('lost'), so the session
is still open at death time); registerDeath → the death ctx (fightType/tile/
killer at death); encScholarDeathGate → the last hunt animal; playerDeath → armor
P pre-gear-strip (playerDeath empties the pack before registerDeath runs).

**Proof:** `scripts/test-bearercombat-20261015.js` — REAL-RED (a naive
cause-string-only attributer demonstrably misfires: it cannot name the wave from
cause 'combat', and it mis-tiles an arena death as wild) → GREEN (20 checks:
TB wave-3 wild attributed with entry HP/armor/counter/hits/dmg; haven-breach
w1 with veteran + counter-unknown carried; contest death attributed with
contest-opponent class; hunt death attributed with prey class; 'the wild' with
no TB context counts AGAINST the bar; sickness excluded from denominator;
narrative names the death; the inherited classifier's hunt blind spot stays
visible) + trajectory-neutrality (instrument ON vs OFF byte-identical 30d on a
real sim). SMOKE green (player-flag wired on every death record, TB sessions
collect); DETGATE green (D1 determinism, D2 ON/OFF byte-identical 60d).

**Metric review (see end of file):** required per §14.

## Results — the 16-run instrumented suite

Substrate: 8 seeds × {leadfeast, belongfeast} unlayered, 180d death-aware,
FEASTSCALE_R13=1 asserted up front. Per-seed census packets:
`evidence/2026-10-15/perseed-bearercombat/` (census + narratives + full
records); summary: `evidence/2026-10-15/sim-bearercombat-runs.json`; sweep
log: /tmp/bearercombat-sweep.log (ephemeral); coordinator telemetry:
`evidence/2026-10-15/telemetry-bearercombat/` (16 records, booleans as 0/1).

**DIAGNOSTIC: GO — 87/89 bearer combat deaths attributed (97.8% ≥ 90%).**

**Wall numbers this run:** national 8/16 (leadfeast 5/8, belongfeast 3/8) ·
table 14/16 · wins 0/16 (win-beat scan; consistent with succhain's unlayered
substrate) · wave-4 14/16 · wave-5 8/16 · median survival 128d · max 163d ·
exiled 0/16.

### The census (denominator = 89 bearer combat deaths on the 8 national runs)

| killer class (wave × tile × fight-type) | n |
|---|---|
| w1 × haven × turn-based | 20 |
| w4 × haven × turn-based | 14 |
| w5 × haven × turn-based | 14 |
| w3 × haven × turn-based | 11 |
| w2 × haven × turn-based | 8 |
| contest-opponent × haven × contest | 5 |
| w4 × wild × turn-based | 5 |
| w5 × wild × turn-based | 3 |
| w4 × arena-contest × contest | 3 |
| w1 × wild × turn-based | 2 |
| w2 × wild × turn-based | 1 |
| contest-opponent × wild × contest | 1 |
| unknown (alien-player "Stranger" fights — instrument gap, see below) | 2 |

By wave: w1 22, w2 9, w3 11, w4 22, w5 17. By tile: haven 73, wild 13,
arena-contest 3. By fight type: turn-based 78, contest 9, unknown 2, hunt 0.

**Entry state:** median entry HP 100/100 (n=81 TB deaths — the bearer enters
fights FULL); median armor P 12 (n=89 — P=12 is ~37% damage reduction on the
diminishing-returns curve); counter known 25 vs unknown 56. Median fight
attrition: 4 hits taken, 103 damage taken in the killing fight. Veteran
killers: 6/87 (7%).

**Succession:** rank 7d after death — global 37, regional 24, national 19,
village 9. The polity absorbs the deaths (consistent with succhain: the
mortality cascade, not a dissolution cascade).

### What the census says

**The bearer dies AT HAVEN, in turn-based fights, mostly at night, mostly to
raids.** 73/89 deaths (82%) are at haven; 67/89 (75%) are haven turn-based
fights, and 37/67 of those (55%) have a raid beat within ±1d — the night-raid
pack hitting Haven is the modal death context. The single biggest killer class
is **w1 × haven × turn-based (20/89 = 22%)**, and the modal killer inside it is
the **Highbeam Deer: 16 kills — with the counter KNOWN in 15/16 (94%)**.
The benchmark monster breaches haven at night, the bearer knows exactly how
to beat it ("MOVE, don't stare"), enters at full HP — and dies in ~4 hits at
armor P 6–13. Wave-4/5 monsters add another 28 haven TB kills (The Moderator 7,
The Timeslot 5, The Eater 5, The Eulogy 4, The Editor 4, The Reunion 4).

**Counter knowledge does not save the bearer.** 25 deaths with counter known
vs 56 unknown — and the deer's 94% known-kill rate says the counter is
necessary but not sufficient at night, at haven, against packs, at P≈12.

**Contests are ~10% of bearer combat deaths** (9/89): 5 'contest' causes at
haven with the contest state already cleared (opponent unnameable — honest
'contest-opponent'), 3 arena TB fights vs wave-4 monsters (The Suburb ×2, The
Eater ×1 — the arena pits bearers against wave-4), 1 contest-opponent at wild.
Contests are UNAVOIDABLE by canon; these read as the price of the show.

**The 2 unattributed deaths are alien-player "Stranger" fights** (leadfeast s11
d81 Tom Andreev @ haven; leadfeast s55 d118 Elif Demir @ wild): the encounters.js
alien-player fight path builds `tbfight` directly (encounters.js:2707) and
bypasses `Game.startCombat`, so the instrument never opens a TB session — the
killer is captured ("Stranger", 1 opponent, no wave) but the fight type is
unnamed. Both are succession-feed deaths (the successor inherits the
battlefield and dies in it within 1–2 days). Instrument gap, documented below —
not re-scored (§14).

### Death narratives (SENSE-TESTING LAW — read, not counted)

**1. The modal death — belongfeast s44 d49, Howard Bennett vs Highbeam Deer at
haven.** He LEARNED the deer's counter on d47 ("COUNTER LEARNED — Highbeam
Deer: MOVE, don't stare. When it goes still, the beam is coming"). On d48 a
4-raider pack (Highbeam Deer, Flashbulb Moth, Sunback, The Anaconda Empress)
hit Haven in the night; he fought at 100/100 HP, armor P 6, counter known —
and died in 5 hits for 124 damage. This reads as a real fight he chose: his
home was raided at night and he stood the wall. The policy never assesses
raid packs (no flee/escalate logic for 4-raider night packs at P 6) — that is
a POLICY gap, filed below, not an engine lie. The death is honest attrition.

**2. The arena — leadfeast s55 d93, Ruby Callaghan vs The Suburb (wave 4).**
Contest @ arena-contest, entered 100/100 HP, armor P 22, counter unknown, 5
hits for 110 damage. Rank global 7d after. The contest took her (unavoidable
by canon) and the arena matched her against a wave-4 monster. Reads as the
show's price, not a mistake.

**3. The succession feed — leadfeast s55 d115→d118.** Willow Tang dies at wild
to two wave-4 Reunions (77 HP in, 2 hits, 145 damage — overwhelmed). Successor
Luis Fernandez dies the next day at haven to two wave-5 Cancellations (86 HP
in, P 31, 2 hits, 113 damage — overwhelmed). Successor Elif Demir dies two
days later at wild to an alien-player "Stranger". Three bearers, four days,
three real fights — the classic succession-feed shape, and the polity never
flinches (global throughout). The feed is the mortality engine; the deaths
read as combat, not RNG.

**Sense verdict:** the deaths read as real fights the bearer chose (raid
defense at home), was forced into (contests, the arena), or inherited (the
succession feed). No obviously-unwinnable-fight policy blunder — except the
standing gap: the policy has no raid-pack assessment (it will stand the wall
against a 4-raider night pack at armor P 6 with no flee/escalate logic), and
it has no alien-player ("Stranger") fight assessment. Both filed as policy
gaps, not chased (instrument scope).

## What this names

- The bearer-death cascade on nationals is a **haven raid-defense mortality**
  phenomenon: 82% of bearer combat deaths happen at haven, 75% in turn-based
  fights there, 55% of those raid-entangled. The wall is not the climb, and it
  is not succession — it is the night the monsters come to Haven and the
  bearer stands the wall at armor P≈12.
- The **Highbeam Deer is the modal killer (16/89)** — the wave-1 benchmark
  still kills endgame bearers at haven with its counter known 94% of the time.
  Knowing the trick is not surviving the night.
- The **named next lever** is the single biggest killer class:
  **w1 × haven × turn-based** — haven raid defense against wave-1 apex packs
  (Highbeam Deer night raids). Filed below.

## Blanks filled / documented

- FILLED: the bearer combat-death census (87/89 attributed, killer-class
  breakdown, entry-state + succession consequences, 3 sense-read narratives).
- DOCUMENTED (not chased, out of scope): (a) the alien-player instrument gap —
  encounters.js:2707 builds tbfight directly, bypassing startCombat; the next
  instrument version should open sessions on that path or detect 'Stranger'/
  alienPid opponents at death (2/89 unattributed); (b) the 5 'contest'-cause
  deaths at haven whose contest state had cleared pre-death (opponent
  unnameable — contest identity capture needs a pre-clear snapshot);
  (c) the policy's missing raid-pack assessment (stands the wall vs 4-raider
  night packs at P 6) and missing alien-player fight assessment — policy gaps
  for a policy arm.

## Metric review (§14)

- The 90% attribution bar measured 97.8% (87/89) — GO on the pre-registered
  bar, no re-scoring. The 2 misses are named (alien-player fight path) with
  the trail kept; the instrument gap is documented for the next version.
- Denominator rule change recorded: the hunt blind-spot rule (fightType
  'hunt' joins the denominator alongside the holdloss combat|monster family)
  was added during proof development when a fixture showed the inherited
  classifier misses hunt causes ('the turkey' → null). Zero hunt deaths
  occurred in the 16-run suite, so the rule moved nothing in the measured
  numbers — it is documented for the next run, not a mid-run re-score.
- Win detection: the sweep scans beats for the engine's win beat ("You won.
  Say it plainly: you won.") per the succhain lesson — 0/16 on this unlayered
  substrate (consistent with succhain's unlayered 0/16).
- belongfeast reached national 3/8 here vs 0/8 in succhain's earlier run —
  different tip (siblings landed between the runs), same substrate otherwise.
  The census is self-consistent on the current tip; cross-run comparisons
  should note the tip moved.

## NAMED NEXT lever (filed in sim-findings.md)

HAVEN RAID DEFENSE VS WAVE-1 APEX PACKS: the modal bearer combat death is
**w1 × haven × turn-based (20/89)** — Highbeam Deer night raids on Haven
(16 kills, counter known 94%, bearer enters at full HP, armor P median 12,
dies in ~4 hits/103 dmg). The bearer stands the wall because raids are
fought, not fled — and the wall keeps falling. Candidate levers for a
follow-up arm: (a) raid-pack vs haven-defense balance (palisade stakes already
take a toll — is the toll enough at wave-4/5 raid tiers?); (b) bearer raid
assessment (flee/escalate/call-for-help logic for multi-raider night packs);
(c) the Highbeam Deer's late-game scaling (veteran/raid-pack contexts keep the
wave-1 apex lethal at day 90+ with its counter known — is that the intended
benchmark pressure?); (d) armor access on national-holding bearers (median P 12
is ~37% reduction — the mid-game armor curve vs raid damage). This is a
game-code/policy lever for a follow-up arm — out of this arm's
instrument-only scope.
