# sim-gauntlet-pack-b — is the Gauntlet wave-3 pack party-mirrored, and does it kill the second fight?

**Arm:** sim-gauntlet-pack-b (run fleshout-loop-b-20261107T0420Z, Loop B,
axis scale-onramp / winnability chain) · **DIAG only, zero src/js.** A fix
is NAMED, not built.
**Verdicts per question: Q1 DIAG-GO — Q2 DIAG-NO-GO (the claim as framed
is falsified, per the prereg's own falsification clause; the measurement
is complete) — Q3 DIAG-GO.**
**Base:** branch sim-gauntlet-pack-b; prereg committed first as
ca126298e · **Proof:** `scripts/test-gauntlet-pack-20261107.js` **46/46
green** · **Regressions:** `test-arena-20261107.js` 57/57,
`test-tbend-20261106.js` 18/18, `test-killersurvive-20261106.js` 140/140 ·
**Sweep driver:** `scripts/gauntlet-sweep-20261107.js` · **Corpus:**
`evidence/2026-11-07/perseed-gauntlet-pack-b/` (8 replay JSONs + 3 sweep
JSONs, 0 instrument errors).

## The one-line answers, plainly

- **Q1: the wave-3 pack IS party-mirrored — but the mirroring lives in
  the Reunion, not in the Gauntlet.** The Gauntlet draws its three beasts
  at random from the unlocked pool; if the draw is a Reunion, the Reunion
  arrives as min(3, partyN) beasts. A 4-person party faces three wave-4
  beasts; a solo scholar faces one. Same wave list, 3 vs 1, proven live.
- **Q2: NO — the wave-3 pack is not systematically the killer's second
  fight.** The observed wave-3 deaths were all non-wave-4-killers (2/2 in
  the replays, including Sari herself — she was a veteran, not a killer),
  and wave 3 is not the dominant death wave (7/7/5 across waves 1/2/3 in
  the primary sweep). What IS systematic: the Reunion kills wherever it is
  drawn — 6/6 fought draws fatal, on wave 1, 2 and 3 alike.
- **Q3: the deciding observation held exactly as pre-registered** — 3
  Reunions with a party, 1 solo, identical wave list.

## Q1 — the code, then the live proof

**Wave count is fixed; wave composition is a random draw.**
Gauntlet phase (contests.js:3040): `do: { arena: { waves: 3 } }` — fixed
3 waves (Pit 1 at :3017, Siege 3 at :3450). `_contestArena`
(contests.js:4717) picks one beast id per wave: for wave index i,
`hot = (i>0 ? 1 : 0) + (hardened ? 1 : 0) + (rival ? 1 : 0)`; candidates
= `monsterWavePool()` filtered `m.wave <= unlockedWave() + hot`;
uniform random pick. Nothing in the draw reads party size.

**Pack size is decided at spawn, per monster def.** `startCombat`
(game.js:34501) calls `tbPackSpawnCount(mdef, partyN)`
(partyTactics.js:95). Reunion is the ONLY monster with
`packSpawn {mirror: true, max: 3}` (monsters.json:6330) → count =
min(3, partyN). The only other pack-spawners are hushwolf (solo 1 /
party 4) and heckler (solo 1 / party 3). partyN = 1 + villagers joining
(up to 4 villagers within 4 squares).

**Live pools, measured — not JSON-counted (prereg correction, see
metric review).** At unlockedWave 4 the live pool is **58** monsters
(25/15/9/9 by wave), not 59: the Herald (wave 4) is excluded by the
titans.js `monsterWavePool` wrapper ("titans never wander. They arrive
by omen only"). The wave-3 hot pool (wave ≤5) is **64**, not 69 (only 6
live wave-5 monsters — the rest are titan/campaign-only). Base rates:
P(Reunion) per draw is 1/58 ≈ 1.7% on waves 1–2 and 1/64 ≈ 1.6% on
wave 3; P(wave 3 is any wave-4/5 beast) = 15/64 ≈ 23%; P(wave 3 is any
pack-spawner) = 3/64 ≈ 4.7%. A Reunion on wave 3 is a rare draw per
Gauntlet — but Gauntlets are not rare (4 fired across the 8 replay
legs; 2 on the 53006 leg alone).

**Live proof (46/46).** Identical wave list
['buffering','sunback','reunion']: with a party (partyN 4) wave 3
spawned **3** Reunions; solo (partyN 1) it spawned **1**. Unit pins:
`tbPackSpawnCount(reunion, ·)` = 1/2/3/3 at partyN 1/2/4/6.
Draw rule live: 12 real `_contestArena` Gauntlet draws — all 3 waves,
every beast within wave ≤ unlockedWave+1, draws varied (≥6 distinct
wave-lists, ≥10 distinct beasts); Pit spec draws 1 wave.

**Verdict Q1: DIAG-GO.** The mirror is proven live and the layer is
named: **the Gauntlet draws; the Reunion mirrors.**

## Q2 — wave-by-wave outcomes (84 Gauntlet chains total)

### Replay legs — real scholars, real gear (8 seeds, 150d, baseline)

4 Gauntlets fired; 2 ended in death on wave 1, 2 in death on wave 3,
1 fully won:

| Seed | Gauntlet waves | Outcome | Party in | Dead scholar a wave-4 killer? |
|---|---|---|---|---|
| 53001 d65 | [union_rep, congregation, alien_tick] | lost wave 1 (Union Rep 19% HP left + its murkcap picket) | 1 (solo) | No (0 wave-4 kills on the leg) |
| 53002 d65 | [review_drone, glasswing, audit] | won, won, **lost wave 3** to a single Audit (75% HP left) | 5→5→3 | No (0 wave-4 kills on the leg) |
| 53006 d100 | [nightlight_catfish, terms_of_service, strike] | **won all three** | 2 | — |
| 53006 d115 | [buffering, sunback, reunion] | won, won, **lost wave 3** to THREE Reunions (92/94/100% HP left) | 4 | **No — Sari was not a killer** |
| 53008 d58 | [eater, algorithm, memory_projector] | lost wave 1 to a single Eater (83% HP left) | 1 (solo) | No (first wave-4 kill on the leg came d63, after the death) |

The 53006 wave-4 kills are by olivia_bennett (d64 eater as companion,
d100 strike as player) and ella_johnson (d114 algorithm) — never Sari.
Sari's own kills: understudy (w2, d11), terms_of_service (w3, d39),
sunback (w1, d115 — the Gauntlet's wave 2 itself). She was a **veteran**
(a wave-3 kill to her name) but not a wave-4 killer. The 53002 dead
scholar likewise had a wave-3 kill (callback, d51) but no wave-4 kill.
**Wave-4 killers among Gauntlet deaths: 0/4. Veterans: 2/4.** (The
veteran skew is expected from casting, not evidence of hunting: the
contest picks by notability, and veterans are notable.)

### Synthetic sweeps — real draw, real fights, played to win

Primary sweep v3 (partyN 4, fresh 100-HP scholar, no gear, 32 chains,
seed 51007): **won 7, died 19, routed 5, other 1.** Deaths by wave:
**wave 1: 7, wave 2: 7, wave 3: 5** — wave 3 is not the dominant death
wave. Of the 13 chains that reached wave 3, 5 died there (38%): to a
eulogy (88.8% HP left), a gavel (62.7%), a suburb (90.2%), a Reunion
pack (97.6–100%), and a callback (42%). Only 1 of the 5 wave-3 deaths
was a Reunion pack. Supporting sweeps v1 (partyN 5, 16 chains) and v2
(partyN 3, 32 chains) show the same shape — deaths spread 7/3/1 and
11/5/5 across waves 1/2/3.

**The Reunion kills wherever it is drawn.** Across all instruments:
7 Reunion draws, 6 fought, **6 fatal** — wave 1 (v3 chain 23; smoke-test
chain 0), wave 2 (v1 chain 8, 2 rounds, pack at 98–100% HP; v3 chain
31), wave 3 (Sari d115; v3 chain 27, 3 rounds, pack at 97.6–100%). The
7th draw (v2 chain 29, wave 3) was never fought — that chain routed on
wave 2. No other beast is 6/6. But the draw is rare (≈1.6% per wave),
so most Gauntlets never see one.

### Verdict Q2: DIAG-NO-GO on the "systematic" half

The prereg's falsification clause fires twice over: (2) wave-3 deaths
fall on non-killers — 2/2 replay wave-3 deaths were non-wave-4-killers;
(3) the full-sim legs show Gauntlet wave-3 deaths only of non-killer
scholars — exactly observed. Falsifier (1) did NOT fire: parties do not
win wave 3 with a Reunion as often as without (0/2 won with a Reunion
on wave 3 across replays + v3, vs 8/12 without in v3) — the Reunion
makes wave 3 deadlier. But deadlier is not the claim: the claim was
that wave 3 systematically kills the *killer's* second fight, and the
victims are not killers. The measurement is complete (84 chains, 13
wave-3 deaths); the claim is falsified. **The winnability chain's
binding link stays wild kills and veterans (killersurvive), not the
Gauntlet.**

## Q3 — the deciding observation, judged

As pre-registered: party-mirrored = same wave list spawns min(3,
partyN) Reunions (1 solo, 3 partied) with drawn ids independent of
party size; fixed pack = same count regardless of partyN. Observed:
**3 partied vs 1 solo, identical list** — party-mirrored, with the
mirror in the monster def and the draw in the contest. **Q3: DIAG-GO.**

## What else the chains showed (in-scope, measured)

- **The party re-drafts every wave.** `startCombat` re-picks the
  nearest 4 villagers from current positions each wave, so the party
  that enters wave 3 is not the party that entered wave 1. On 53002 it
  went 5→5→3 with recomposition (Yuki out, James in between waves 1–2)
  — the mirror reads the *current* wave's partyN. Positions shift
  during fights, so the draft itself is part of the Gauntlet.
- **A rout ends the Gauntlet as a loss.** 5/32 chains in v3 (6/32 v2,
  2/16 v1) ended 'routed': the beast fled when hurt (lockpick_raccoon
  at ~21–28% HP) or its escorts fled when the primary died (ad_break
  dead, ad_sponsors alive at 100%; focus_group dead, eyes alive).
  `_contestArenaAfter` treats any non-won result as a contest loss —
  you can clear a wave by rout and still lose the Gauntlet, with no
  chain and no prize. A substantial failure mode with nothing to do
  with dying.
- **Wave 1 can field two monsters without any pack rule.** The Union
  Rep brings a picket (murkcap, "Big-Eyes (picket)") — 53001's wave-1
  loss was to the Rep at 19% HP with its picket already dead.
- **The System's hype calls a wave-3 kill a "veteran kill."** On d115:
  "Shaker just put down Buffering... on CAMERA. That's a veteran kill,
  folks." Buffering is wave 3 — the patter uses "veteran" loosely
  against the veteran mechanic's meaning. Trivial, noted.
- **Succession cascade, 53001 d65:** visjoin_48 died in the Gauntlet
  and the successor gen_t6v30xe died in the wild the same day (eater
  fight) — two scholar deaths in one day.

## Sense-test — the d115 death, read as a fight (this run's corpus)

Sari won wave 1 (Buffering, scholar 71% HP, allies Shaker 59 / Jamie
89 / Adaeze 80) and wave 2 (Sunback, 1 round, scholar still 71% HP),
then died on wave 3 with her allies unharmed (Jamie 89, Shaker 59,
Adaeze 80→56) and the three Reunions at 92/94/100% HP. The transcript
reads as a televised ambush by a pack that barely got scratched, not as
a fair second fight:

> d115 📺 SYSTEM: "Oh — OH. Everybody saw that, right? Shaker just put
> down Buffering... on CAMERA. That's a veteran kill, folks. REMEMBER
> the name."
> d115 Another face surfaces — someone you brought, or someone who
> brought you. 'You didn't think we'd come alone?' The dead gather.
> (Allied monsters +4 damage, 2 turns.) (×3 — once per Reunion)
> d115 📖 The Codex turns a page on its own. Sari Wulandari is dead.
> You didn't ask. It knew.
> d115 🕯️ Sari Wulandari is dead — the arena. The village stops.
> Somebody screams. Somebody else starts digging.
> d115 At the grave, Brian, Jamie, Shaker and 2 more speak for Adaeze —
> "Sari trusted them. We saw it. Give them the fire's hearing."

Two things grate. First, the fight itself: the party won two waves
clean and then died to a pack that finished at 92–100% HP — the
"second fight" was three fresh 1200–1400-HP beasts against a party
that had already spent two fights, with no rest and no heal. Second,
the grave line names the successor (Adaeze) mid-eulogy again — the
same wrinkle arena-b flagged ("the village moving on before the burial
is cold"). The death reads as a person dying on camera to a pack; the
burial reads as bookkeeping hurrying on. The day before, Ella Johnson
(a real wave-4 killer, d114 algorithm kill) had died in the wild, and
Adaeze died d119 in the wild — three scholars in five days, village
lost d125.

## Canon coverage

CONTESTS.md covers the Gauntlet ("Three waves, no rest. Survive all
three and the crowd goes wild. Most don't see wave two.") and the arena
as a place; the engine matches it (real fights, chained waves, no rest,
televised death). The party-aware pack rule is Steve's 2026-10-10
settled law ("Monsters are party-aware... tactics that scale, not flat
bigger numbers" — partyTactics.js header; "bigger, badder, lethal —
designed for parties"). No canon gap is opened by this arm; the Reunion
mirror is the documented execution of that law, not a deviation from
it.

## Named fix (NOT built — needs a design call)

If Steve wants the Reunion pack blunted *in the arena*, the precise
lever is in the monster def / spawn path, not the contest: cap the
mirror for arena fights, or exclude pack-spawners from the wave-3 hot
pool. That is a design call because the mirror is Steve's party-aware
law, and the Reunion is lethal by design wherever it appears (6/6).
No fix is owed for Q2's falsified claim — the finding is that the
Gauntlet is not the killer-killer, so no Gauntlet change follows from
it. Do NOT build either here.

## Instrument notes (named, not built)

1. **Scholar HP sometimes rises between waves** (+12–24%, 6 cases
   across the v1/v3 sweeps: e.g. v3 chain 12, wave-2 end 64% → wave-3
   start 76%). The wave-end HP is read at tbEnd entry and the next
   wave's start HP after tbEnd's post-processing — a post-fight heal
   in tbEnd is the leading hypothesis, unproven. Worth one look before
   anyone leans on wave-to-wave HP as a pure cost measure.
2. **Chain 20 (v3): a wave-1 bout was already chained before the
   instrument's first observation** (live fight showed the wave-2 beast
   at wave-0 record time). Leading hypothesis is an instant rout/flee
   at fight start; 1/32 chains, mechanism not established from the
   saved corpus, excluded from wave-conditional rates.
3. The sweep's partyN staging fought back three times (v1: partyN 5 —
   (8,8) is Chebyshev distance 4 from (4,4), in join range; v2:
   partyN 3 — the roster contains the scholar's own id, which
   startCombat skips; v3: partyN 4, correct, enforced by a fail-loud
   chain-0 check). v1/v2 are supporting data only; v3 + replays are
   primary. The fixes and the fail-loud check are in the driver.

## Wall numbers (replay legs — per-seed, no panel)

Wins **0/8**, national **0/8**, table **0/8**, global **0/8**. Wave 4
unlocked **7/8** (53005 only wave 3); wave 5 unlocked **0/8**. Wave-4
kills total **13** (0, 0, 2, 3, 0, 3, 1, 4 per seed); wave-5 kills
**0**; wave-5 faced **0** (wavesFaced tops out at wave 4 on every leg).
Readiness-5-ready: **0 legs ended ready** — veterans 0–1 vs demand 2
is the binding short on every leg (53006/53007 short on veterans
alone; the rest also short on armor/weapons). Median survival **96d**
(64, 66, 85, 89, 103, 116, 125, 147; all village-lost). Standing at
end: 150, 100, 199, 199, 70, 199, 199, 199. Balanced panel (§15):
INAPPLICABLE — DIAG only, no before/after pair; no compare `.md` is
fabricated. Telemetry: `scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-07/perseed-gauntlet-pack-b/*.json' --metrics
national,table,wins,exiled` REFUSED — "refusing recorder-corpus input:
all 11 --current rows carry top-level anchorCommit". Same as the prior
arms. The wall numbers in this file are the instrument's own.

Note on trajectory fragility: 53006 reproduced the arena-b trajectory
exactly on this anchor (125d, Gauntlets d100 + d115 with identical
waves and outcomes); the other legs diverged from corpus days as
trajfrag-b warned. Channels are the evidence, not days.

## Metric review

- **Prereg base rates corrected, honestly.** The prereg counted raw
  JSON (pools 59/69; P(Reunion) wave-3 1/69 ≈ 1.4%; P(wave-4/5 on wave
  3) 20/69 ≈ 29%). The live pools are 58/64: the Herald is excluded
  by the titans.js pool wrapper and 4 wave-5 ids by titan/campaignOnly
  filters. Corrected: P(Reunion) wave-3 1/64 ≈ 1.6%; P(wave-4/5 on
  wave 3) 15/64 ≈ 23%; P(pack-spawner on wave 3) 3/64 ≈ 4.7%. The
  correction strengthens nothing and weakens nothing — the draw stays
  rare — but the evidence file uses the live numbers throughout.
- **Fixture deviations, stated.** (a) Sweep partyN: v1 = 5, v2 = 3,
  v3 = 4 (see instrument notes §3); only v3 + replays are primary.
  (b) The unlock-gate bypass changed mid-run: the first attempt (cfg
  overrides — waveLedgerCfg bars 0, standingCfg t4 0) was defeated by
  `||` fallbacks in the gate code (`(bar[2]|0)||5`,
  `(sc.t4|0)||100`) and by the readiness deferral, and failed loudly
  (unlockedWave 1, sweep stopped, nothing measured). The replacement —
  a direct `Game.unlockedWave → 4` override on the test-process object
  with a fail-loud live-pool assertion (58, includes Reunion, excludes
  Herald) — stages LESS game state, not more. The draw, spawn, chain
  and fights are the real code in all versions.
- **Q2's GO bar was measurement-shaped, and the measurement is
  complete** (84 chains: 4 replay + 16 + 32 + 32 sweep; 13 wave-3
  deaths; killer/veteran status from killerTrack + waveKillLog on all
  8 replay legs). The NO-GO is on the systematic half per the prereg's
  falsification clause, which named exactly this outcome. No metric
  was swapped, re-cut, or re-thresholded.
- **The staged scholar is fresh (100 HP, no gear).** The sweeps
  measure Gauntlet lethality for an unequipped party, which overstates
  real-Gauntlet lethality for a geared notable — the replay legs (real
  scholars, real gear) are the counterweight, and they agree on the
  shape (deaths spread across waves; wave-3 deaths of non-killers).
  A geared-killer sweep was not run: staging a "typical killer
  loadout" without a measured loadout census would be arbitrary, and
  the replays already supply the geared population.

## Findings for the backlog (coordinator appends — do not edit sim-findings.md here)

- The Gauntlet wave-3 pack is NOT the killer's second fight (Q2
  falsified): 0/4 replay Gauntlet deaths were wave-4 killers; wave-3
  deaths split 7/7/5 across waves in the primary sweep. The Reunion
  IS systematically lethal wherever drawn (6/6 fought draws fatal) —
  the lever, if Steve wants one, is the Reunion draw/mirror, not the
  Gauntlet's wave 3.
- A rout ends a Gauntlet as a loss (5–19% of sweep chains): wounding
  a flee-prone beast, or killing the head while escorts live, ends the
  run with no prize and no chain. Design question: should a routed
  wave chain or count as a win?
- The party re-drafts every wave from post-fight positions (53002:
  5→5→3 with recomposition) — the mirror reads the current wave's
  party, and the fight itself scatters the party.
- Scholar HP sometimes rises between Gauntlet waves (+12–24%, 6
  cases) — post-fight heal in tbEnd? Mechanism unmeasured.
- Sweep chain 20 (v3): a wave-1 bout was already chained before the
  instrument's first observation — possible instant rout at fight
  start; 1/32, mechanism not established.
- The System's "veteran kill" hype line fires for a wave-3 kill
  (Buffering) — patter vs mechanic naming collision, trivial.

## Village assessment, in plain words

Eight villages, none won anything, none reached national, none sat at
the table. They died after 64–147 days, most with standing stuck at
199 — the same ceiling the last three arms keep hitting — and not one
of them ended with two living wave-4 killers, which is what the
readiness bar wants before wave 5 can even open. The Gauntlet is not
what is killing the killers: in these eight villages the killers died
in the wild, in ordinary fights, a few days after their kill, while the
Gauntlet killed whoever happened to be notable enough to be picked —
twice on the first wave, twice on the third, once to a pack of three
dead scholars that barely got scratched. The show is working as
designed — three waves, no rest, a real fight, a televised death — but
it is a lottery with a rare, lethal ticket (the Reunion, about one draw
in sixty), not a machine that hunts killers. The blank this arm fills
is the pack question itself: the pack is the Reunion's mirror, the draw
is luck, and the killer's second fight happens in the wild, not in the
arena.

## Proof and commits

- Proof `scripts/test-gauntlet-pack-20261107.js`: **46/46 green** on
  this worktree (mirror contrast 3-vs-1, draw rule 12 draws, unit pins;
  regressions arena 57/57, tbend 18/18, killersurvive 140/140).
- Prereg committed before any judged work (ca126298e). Sweep driver +
  proof test + this evidence file + the corpus
  (`evidence/2026-11-07/perseed-gauntlet-pack-b/`, 11 files, 0
  instrument errors) committed with this file.
- Worktree contains only committed work at closeout; branch ready to
  merge. No push, no version bump, no live verification (coordinator
  owns the merge).
- Process note: the safe-commit clobber class hit this worktree's
  index after the prereg commit (the committed prereg showed as a
  staged deletion with the worktree file byte-identical to HEAD).
  Repaired per the recorded recipe (`git update-index --add
  --cacheinfo` with the HEAD blob, hash verified equal); the commit
  itself was always correct.

## Convergence

**scale-onramp: converging, NOT converged.** The Gauntlet pack
question is closed: the mirror is the Reunion's rule, the draw is
random, the Reunion is lethal on any wave, and the wave-3 pack is not
the killer's second fight. What remains is the winnability chain
itself: 0 wins, 0 national, 0 table on all 8 legs; wave-5 unopened;
readiness-5 held by the veterans bar (0–1 living vs 2 demanded). The
next arm that re-uses the Gauntlet as a lever should know it is a
lottery with a rout trap, not a killer filter — and any Reunion change
is a design call on Steve's party-aware law, not a bug fix.
