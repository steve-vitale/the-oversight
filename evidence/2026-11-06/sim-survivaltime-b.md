# sim-survivaltime-b — SURVIVAL TIME (armor-curve retune K=20→6)

- Run: `fleshout-loop-b-20261106T1730Z`, arm 1 of 3, axis scale-onramp /
  winnability chain (Steve 2026-11-03 re-point)
- Arm: `sim-survivaltime-b`, branch `sim-survivaltime-b`
- Base at prereg: `dc76d9bf6`; master has since moved to `8a975ad45`
  (journey-deepening r109, instrument-only) — rebase pending at write time,
  see footer
- Policy: competent verbatim, BOTH legs (the lever is game code, not policy)
- Horizon: 150d death-aware. Seeds: **88001–88008** (fresh band, verified in
  prereg). Corpus: `evidence/2026-11-06/perseed-survivaltime-b/` (16 files,
  8 baseline + 8 armed, 0 instrument errors on either leg)
- Lever commit: `6bca8e380` (armor curve K=20→6 + proof 39/39; r8 oracle +
  cap + bark tests updated for the retune by design). Both driver legs are
  anchored on `6bca8e380110` for the armed leg; the baseline leg ran on the
  K=20 code (pre-lever commit) with the same driver.

## The lever (one mechanism, game code)

**Armor-curve retune: the diminishing-returns constant 20 → 6.** The curve
`r = effP / (effP + K)` maps worn protection to the fraction of a blow
absorbed, after armor-pierce. One shared helper `Game.armorReduction(prot,
pierce)` in `src/js/game.js`, used at all four absorb sites (tbDamage
player + villager/ally blocks in `game.js`; villager + ally blocks in
`fieldFights.js`). No win price, deed gate, readyDemand, gate, or pierce
value changed. No new item, recipe, or system. Canon: wave-4 bands
(damage 35–95, HP 850–1500, pierce 0.2–0.5) untouched; the curve constant
was Steve 2026-10-09 canon, retuned under Steve's 2026-11-05 rule: "if a
fighter in full gear and armor appropriate for the tier still can't
survive, the gear isn't good enough."

## Verdict

**GO on the preregistered verdict rule — primary 16.4% ≥ 10% — with the
secondary mechanism bar MISSED (7 rounds vs 12). Both halves are the
verdict; neither is buried.**

- **Primary (binding): wave-4 TB kill rate (log kills / traced TB fights):
  baseline 1/20 = 5.0% → armed 9/55 = 16.4%. GO.** The stricter matched
  definition agrees: 8/55 = 14.5% ≥ 10%. The 9th log kill is a
  midnight-spanning kill (88004 d101 Audit, fought 14 rounds, logged
  d102) — same pattern as partydamage's 87004, and the same-day matcher
  is the sibling arm's fix, not this arm's. Field kills: 0 on both legs
  (all 9 log kills are TB-accounted), so the numerator is clean.
- **Secondary (binding as stated): median rounds survived in LOST wave-4
  TB fights: 6 → 7. Bar was ≥ 12. MISS.** The curve did not buy the
  rounds it was sized for. See "Why the secondary missed" below.
- **Guards: both hold.** Median survival 92d → 80.5d (0.875× control,
  bar ≥ 0.8×) — villages live slightly shorter on the armed leg, inside
  the guard. Starvation deaths 8 → 3 (bar ≤ control+2 = 10) — improved.

What this means in plain words: scholars now kill wave-4 beasts about
one time in six instead of one time in twenty — but NOT by standing in
one fight for twelve rounds. They kill by fighting far more often, by
biting deeper into the same beast over repeated fights, and by finishing
wounded beasts. The armor works (a blow that took 29 HP now takes 16),
but a longer fight also gives the monster more turns, and some monster
hits ignore armor entirely — so the typical losing fight still ends
around round 7. The kill-rate gain is real and the guards hold, so the
lever earns its keep; the next lever in the chain should be damage or
ally help, not more armor, because armor has now shown what it can and
cannot do on its own.

## Before / after (identical seeds 88001–88008, 150d)

| Measure | Baseline (K=20) | Armed (K=6) | Bar |
|---|---|---|---|
| Wave-4 TB fights (traced) | 20 | 55 | — |
| Wave-4 TB kills (log) | 1 | 9 | — |
| **Kill rate (primary)** | **5.0%** | **16.4%** | **≥ 10% GO** |
| Kill rate, matched-trace def. | 5.0% (1/20) | 14.5% (8/55) | ≥ 10% |
| Median rounds, lost fights | 6 | 7 | ≥ 12 MISS |
| Median rounds, all w4 fights | 6 | 7 | — |
| Lost fights lasting 10+ rounds | 1/19 | 13/46 | — |
| Longest lost fight | 10 rounds | 45 rounds (Eater, 88003 d80) | — |
| Median survival (village days) | 92d | 80.5d | ≥ 73.6d HOLD |
| Starvation deaths | 8 | 3 | ≤ 10 HOLD |
| Monster applied / hit (median) | 29 HP | 16 HP | — |
| Monster damage / round (median) | 19 | 11 | — |
| Player-side damage / round (median) | 18 | 23 | — |
| Aggregate armor reduction | 50.8% | 77.2% | — |
| Median monster max hit in a lost fight | 44 | 25 | — |
| Lost fights with a ≥100 single hit (doom/burst) | 4/19 | 7/46 | — |
| Ceiling rate (sizeNextLever: +1 best round flips) | 10% (2/20) | 38.2% (21/55) | — |
| Distinct wave-4 beasts fought | 13 | 25 | — |
| Beasts fought more than once | 2 (max 5×) | 13 (max 7×) | — |
| Field wave-4 kills | 0 | 0 | — |
| Wins / national / table | 0 / 0 / 0 | 0 / 0 / 0 | — |
| Wave-4 unlocks (seeds) | 5 | 7 | — |
| Wave-5 unlocks / faced / kills | 0 / 0 / 0 | 0 / 0 / 0 | — |
| Readiness-5-ready days | 0 | 0 | — |
| Living wave-4 killers at end | 0 | 0 | — |
| Instrument errors | 0 | 0 | — |

Per-seed (days, end, standing, max wave, w4 TB fights, w4 kills):

| Seed | Baseline | Armed |
|---|---|---|
| 88001 | 101d lost, st 99, w3, 0 fights, 0 kills | 99d lost, st 190, w4, 8 fights, 0 kills |
| 88002 | 107d lost, st 150, w4, 6 fights, 0 kills | 82d lost, st 190, w4, 9 fights, 2 kills |
| 88003 | 130d lost, st 170, w4, 3 fights, 0 kills | 65d lost, st 199, w4, 12 fights, 0 kills |
| 88004 | 71d lost, st 125, w4, 2 fights, 0 kills | 117d lost, st 199, w4, 5 fights, 3 kills |
| 88005 | 150d survived, st 199, w4, 2 fights, 0 kills | 79d lost, st 125, w4, 3 fights, 0 kills |
| 88006 | 83d lost, st 150, w4, 7 fights, 1 kill | 41d lost, st 0, w3, 0 fights, 0 kills |
| 88007 | 74d lost, st 50, w3, 0 fights, 0 kills | 150d survived, st 199, w4, 9 fights, 4 kills |
| 88008 | 54d lost, st 0, w3, 0 fights, 0 kills | 67d lost, st 100, w4, 9 fights, 0 kills |

Trajectory divergence is large on identical seeds (88006 flips from 83d /
7 fights to 41d / never reaching wave 4; 88007 flips from 74d / no wave-4
fights to 150d / 9 fights / 4 kills). With n=8 seeds, per-seed swings
this big are expected — the pilot is judged on the pooled bars, not on
any single seed.

## The 9 kills — how they happened

| Seed / day | Beast | Rounds | Beast HP at entry | Player-side damage | Scholar HP at end |
|---|---|---|---|---|---|
| 88002 d73 | Influencer | 5 | 69 | 76 | 80 |
| 88002 d81 | Eater | 2 | 11 | 19 | 100 |
| 88004 d102 | Audit | 14 | 825 | (midnight-spanning; rout trace) | — |
| 88004 d105 | Influencer | 6 | 611 | 644 (scholar 422 + ally 222) | 73 |
| 88004 d107 | Strike | 23 | 750 | 774 | 98 |
| 88007 d72 | Strike | 11 | 750 | 759 | 100 |
| 88007 d87 | Influencer | 8 | 424 | 481 | 76 |
| 88007 d95 | Strike | 30 | 500 | 521 | 100 |
| 88007 d113 | Suburb | 9 | 975 | 1106 (scholar alone) | 77 |

Reading them: two are grind finishes of nearly-dead beasts (entry 11 and
69 HP — the beast was already worn down by earlier fights). Three are
Strike kills (Strike does not attack, so those are long slogs, 11–30
rounds). Two are mid-entry grind-assisted kills (424, 611). Two are the
new shape the lever was meant to enable: a healthy beast killed in a
single fight — 88004 d105 Influencer (611 HP in 6 rounds, scholar + one
ally firing together) and 88007 d113 Suburb (975 HP in 9 rounds, one
scholar alone dealing 1106 — six strikes at ~184 each, while the Suburb's
own blows landed for 0, 0, 0, 0, 14, 9). The Suburb fight is the
proof-of-effect in the wild: a well-geared scholar (top-tier weapon) plus
the retuned armor turns a wave-4 beast's attacks into near-nothing and
kills it standing up.

One scholar killed twice: gen_1tvj74u (88004) killed the Audit d102 and
the Influencer d105. The old band's finding "post-first-blood kills 0/11"
no longer holds — second kills exist now.

The d107 Strike kill cost three scholars that day (olivia_bennett,
jovan_milic, amina_diallo all died in combat at Haven d107; Olivia landed
the kill and died later the same day). A kill that costs the village three
of its own is a pyrrhic shape the chain still has to fix — the kill rate
moved, but the price of a kill has not collapsed.

## Why the secondary missed (mechanism post-mortem)

The sizing replay said K=6 should roughly double survival (through-fraction
0.534 → 0.255). The pilot shows the per-hit effect landed — median applied
per monster hit fell 29 → 16, aggregate reduction 50.8% → 77.2%, monster
damage/round 19 → 11 — but median lost-fight survival moved only 6 → 7
rounds. Three eaters of the gain, all measured:

1. **More monster turns.** A longer fight gives the monster more turns.
   Median monster hits per lost fight rose 4 → 5, so total applied damage
   in a lost fight fell only 118 → 106.5 even though each hit shrank by
   almost half. The static replay held hit patterns fixed; the game does
   not.
2. **Armor-ignoring burst.** 7/46 armed lost fights include a single hit
   of ≥100 (doom / burst effects that do not flow through the curve —
   the Eulogy's multi-thousand hits in the old corpus are the same
   family). No armor curve can touch those; they cap survival from above.
3. **The death budget is 100 HP.** At 15.5 applied/round in a lost fight
   (median), 12 rounds needs ~8.3/round. K=6 buys 15.5. Another halving
   would be needed for the 12-round bar — that is a different lever
   (damage, avoidance, or the bypass family), not a steeper curve.

The kill-rate gain came from elsewhere than the sized mechanism: villages
reached wave 4 more often (unlocks 5 → 7 seeds), fought far more wave-4
fights (20 → 55), ground the same beast repeatedly (13 beasts fought
more than once vs 2), and each losing fight bit deeper (player-side
damage/round 18 → 23) — so the grind's price per beast fell and two
healthy beasts died in single fights. The prereg's dynamic-effects
hypothesis was right in direction and wrong in shape: it predicted
scholars surviving losing fights and re-fighting; what happened is
scholars still mostly die in losing fights, but the village as a whole
fights more, bites deeper, and finishes more.

## Reachability verdict (waves 1–5, national / table / wins)

- Wave 1–3: not directly measured by this corpus — the instrument traces
  only wave-4 TB fights (see Blanks). Unit-level: bark armor (P=10) vs a
  20-damage hit takes 7 HP now vs 13 before; the curve also eases early
  fights, as preregistered. No early-wave regression signal in the corpus
  (villages reach wave 4 on 7/8 seeds vs 5/8).
- Wave 4: **reachable as a kill, not as a routine.** 9 kills on 55 fights
  (16.4%); two healthy-beast single-fight kills; the grind now closes.
  Still usually lethal: 46/55 fights end in the scholar's death.
- Wave 5: **not reached.** 0 unlocks, 0 faced, 0 kills on either leg.
  Readiness-5-ready days 0 on both legs; living wave-4 killers at end 0
  on both legs — no village has banked two living wave-4 killers, so the
  binding link of the winnability chain (per the 2026-11-06 panel) is
  still unbanked. The lever moves the first half of the chain (kills
  happen) but not the second (killers living to fight again).
- National / table / wins: **0 on both legs.** No movement. The scale
  wall is untouched by this lever: wins 0, national 0, table 0, exiled
  n/a. Standing rose on the armed leg (five villages at 190–199 vs two
  at 199 on baseline), which is the direction national needs, but no
  village crossed into national standing.
- Median survival: 92d → 80.5d. Villages die slightly sooner on the
  armed leg despite killing more — more fights mean more scholar deaths
  (player deaths in the telemetry sample: 54 → 65), and a village that
  fights wave 4 nine times buries more scholars than one that meets it
  twice. Inside the guard, but the direction is a warning for the next
  lever: kills must get cheaper in lives, not just more frequent.

## Village assessment (plain words)

In plain words: the villages on the armed leg feel like villages that
finally fight back. On the old code a wave-4 beast showed up, killed the
scholar in about six rounds, and the village went back to burying people
until the next one. Now the same villages meet the beast again and again
— sometimes the same wounded beast three, five, seven times — and one
time in six they bring it down. One scholar on 88007 killed four beasts
across the run, including a Suburb in nine rounds while barely taking a
scratch. The System notices: on 88004 it announces a kill on camera
("Everybody saw that, right? … That's a veteran kill, folks. REMEMBER
the name"), and after kills the villagers get to work on the carcass the
way the monster-meat channel intends ("Clean it, test it cautiously").

But it is not a victory march. Forty-six of fifty-five fights still end
with the scholar dead, and the day the Strike died on 88004, three
scholars died with it. Villages still lose — seven of eight on both legs
— and nobody got near the national table or a win. The armor makes a
fighter harder to kill; it does not make the village safer, because the
village now throws itself at beasts nine times instead of twice. The
lever is a real step on the winnability chain — wave-4 kills are no longer
rare — and the next step is not thicker armor but cheaper kills: damage,
allies who live, and whatever makes the monster's armor-ignoring blows
survivable.

## Sense-test read (transcripts / dialogue, judged on meaning)

Read the kill-day lines on 88004 (d100–107) and 88007 (d113) from the
corpus (`deathSays`, `fightLines`):

- The kill is narrated and celebrated in-world: the System's on-camera
  veteran-kill announcement, the meat-tasting lines after a kill, Olivia's
  SCREAM freezing the Influencer, the Audit, the Judge Hoot ("a sound
  like milk curdling in fast-forward. The … freezes. (stunned)") — the
  fight abilities are doing visible work in the text, not just in the
  numbers.
- The world keeps moving around the fights and stays coherent: a night
  raid from Emberhold carries off pantry food ("Nobody's dead, but the
  message is clear"), a Strike-day SHUTDOWN freezes abilities ("the
  picket line holds. Your abilities sputter, your items sit dead").
- One text nit found, pre-existing and NOT caused by this lever: the
  Scream stun line doubles "The" ("The The Audit freezes", "The The
  Influencer freezes"). Logged here; not fixed in this arm (out of scope,
  text-only, both legs affected equally).

No gibberish, no contradictions in the kill-day text. The fights read like
fights the game understands.

## Blanks filled / documented

- **Wave-1–3 TB rounds by wave (blast radius): BLANK — documented.**
  The instrument traces only wave-4 TB fights; `traces` contains no
  wave-1–3 rows, so no by-wave medians can be computed from this corpus.
  The unit-level bark check covers the early-wave armor effect
  (P=10 vs 20-hit: 7 HP now vs 13). A future arm that wants early-wave
  rounds needs the instrument to trace all waves.
- **Scholar entry-HP distribution: FILLED.** Implied entry HP (end HP +
  ledger damage) in lost fights: baseline 4/19 below 95 of 100, armed
  7/46 below 95 — most scholars enter at ~100 on both legs. The
  prereg's ledger caveat (11/25 fights entering hurt on the old band)
  did NOT reproduce as the main story here; the wounded-entry share is
  small, and the bypass-damage family (≥100 single hits) is the bigger
  unexplained residue.
- **Per-beast grind survival: FILLED.** See tables above: repeat fights
  2 beasts → 13 beasts; grind finishes at entry 11 and 69 HP.
- **Field wave-4 fights/kills: FILLED.** 0 field kills on both legs; all
  9 log kills are TB-accounted.
- **Living wave-4 killers: FILLED.** 0 on both legs at end (killers die
  in later fights or the village is lost).

## Metric review

- **Primary (log kills / traced TB fights):** the right judge, and it
  behaved well. The log-vs-matched gap is exactly one midnight-spanning
  kill (9 vs 8), and the matched rate alone (14.5%) still clears the
  bar — the verdict does not hinge on the matcher. Denominator grew
  20 → 55 because armed villages fight more; that growth is itself a
  lever effect (more reach, more fights), not a sampling artifact, but
  it means the rate is measured over a different fight population than
  baseline's. A confirm run should watch whether the rate holds when
  the denominator is fight-count-matched, not just seed-matched.
- **Secondary (median rounds in lost fights):** the bar (12) was set from
  a static replay that held hit patterns fixed; the game does not hold
  them fixed. The metric is still the honest mechanism check, and it
  caught exactly what it was for: the curve bought per-hit mitigation,
  not rounds. Future sizing must model monster turns as a function of
  rounds survived, and must budget the bypass family separately.
- **Guards:** both behaved (survival 0.875×, starvation improved). The
  survival guard's 0.8× floor is loose enough that a real harm (villages
  dying sooner while killing more) can pass it — worth tightening or
  pairing with a scholar-deaths-per-kill measure next time.
- **What the prereg got wrong:** the sizing caveat said "scholars
  surviving losing fights can re-fight the same wounded beast" — the
  grind that actually closed kills is the VILLAGE re-fighting, mostly
  with a new scholar each time. The metric set had no "scholar deaths
  per wave-4 kill" — it should have. Baseline: 19 TB scholar-deaths /
  1 kill. Armed: 46 / 9 ≈ 5.1 deaths per kill. That is the price, and
  it is the number the next lever must move.
- **Instrument notes:** 0 errors, 0 unclassified traces on both legs.
  One analyzer anomaly on the armed leg (88002 d81 Eater, entry 11 HP,
  one-round 19-damage best round) is the grind finish, not a defect.

## Proof (observable effect, not just green assertions)

`scripts/test-survivaltime-20261106.js` — **39/39 green** (run twice;
second run after a fixture fix). Through real `tbDamage`: a wave-4-shaped
hit (62 requested, P=27, pierce 0.35) takes **16 HP now vs 33 under old
K=20**; hits-to-kill a 100-HP scholar **7 vs 4**; bark P=10 vs a 20-hit
takes 7 vs 13; chip clamp and naked hold; villager parity (varmor=27
takes the same 16). Wiring: no K=20 curve left in `src/js/`; helper
defined; 2 call sites in `game.js` + 2 in `fieldFights.js`.

Oracle tests updated in the same commit (by-design retune):
- `scripts/test-armor-curve-r8-20261012.js` (green list): oracle K=20→6,
  header updated, `[6, 20, 0, 'P6-halves']` case added — **15 passed,
  0 failed**.
- `scripts/test-armor-cap-20261009.js` (not on the green list): local
  mirror K=20→6; bulldozer bound 20→28; tank-mode bounds minHit→maxHit;
  Part 4 changed from TOTAL taken to PER-ROUND taken (armor letting a
  villager fight 6–12 rounds and kill the beast instead of fleeing at
  2 rounds raises total taken while cutting per-round taken — the
  survival-time effect itself; new code: unarmored 64 total / 32.0 per
  round, armored 72 total / 7.8 per round, 3 vKills vs 0). New code:
  **287 passed, 6 failed**; old code (verified via stash): **290 passed,
  5 failed**. The 5 old-code failures are pre-existing flakes reproduced
  verbatim (belltoad/bulldozer hide-vs-unarmored 0% vs 0% — no hits
  landed; hushwolf/belltoad/bulldozer unarmored baselines out of band —
  P=0 paths provably untouched by this change). The 6th new-code failure
  is the bulldozer tank 0-hits flake (RNG — the monster didn't attack
  that run; it had hits on the old-code run). Full logs:
  `/tmp/cap-oldcode.log`, `/tmp/cap-newcode2.log`.
- `scripts/test-bark-armor-seed-20261011.js`: comment only (r=10/30 →
  r=10/16).

`check.js --quick`: **282 passed, 8 failed in 834s, EXIT=1** (fresh run
after the analysis, `node scripts/check.js --quick
--cacheDirectory=/tmp/jest-cache-sim-survivaltime-b`, log
`/tmp/st-checkquick.log`). The run started before the build commit was
lost when the session compacted (no log survived — the process was not
running in this worktree and no output file existed), so it was re-run
from scratch. Of the 8 failures, **7 reproduce identically on base code**
(verified by swapping `src/js/game.js` + `src/js/fieldFights.js` to
`dc76d9bf6` in the worktree only, index untouched, then restoring byte-
identical from backup — hashes match HEAD): measurement-proof-update
(proof inputs not current), measurement-workflow (retained neutrality
proof does not cover current inputs), mobile-combat-cadence (2),
occupation-panels (CLI workflow), phone-frame-proof (3, stale receipts),
capable-bot (food deed), establishment-r20-fixes (racks voice gate).
**1 failure was caused by this change:** `test-aegis-recipient.js`,
"the actual NPC protector armor applies once" — it hardcoded the K=20
outcome (varmor 20 halves a 20 blow → protector at 90 HP). Under K=6
one application takes 5 (protector at 95 HP; twice would give ~99,
zero would give 80). Fixed by updating the expectation 90 → 95 in the
test only (commit below), per the green-list same-commit rule for a
by-design retune; the test now passes 12/12. The fix touches NO src
behavior, so the armed pilot leg (run on `6bca8e380` src, unchanged by
the fix) is NOT re-run. The 7 pre-existing failures are recorded here,
not fixed in this arm (out of scope; the measurement-proof ones predate
this branch — the retained neutrality proof was already stale on the
base).

## Scale-wall numbers (every run)

| | Baseline | Armed |
|---|---|---|
| Wins | 0 | 0 |
| National | 0 | 0 |
| Table | 0 | 0 |
| Exiled | n/a (not recorded by this instrument) | n/a |
| Wave-4 kills | 1 | 9 |
| Wave-5 kills | 0 | 0 |
| Wave-4 unlocks (seeds) | 5 | 7 |
| Wave-5 unlocks | 0 | 0 |
| Readiness-5-ready days | 0 | 0 |
| Living wave-4 killers | 0 | 0 |
| Median survival | 92d | 80.5d |

Telemetry check (`node scripts/telemetry-check.js --baseline
…/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-06/perseed-survivaltime-b/*.json' --metrics
national,table,wins,exiled`): **refused, as prior arms found** —
"refusing recorder-corpus input: all 16 --current rows carry top-level
anchorCommit, so they are sweep recorder rows, not runs. Recorder corpora
are compared with sweep-compare tables, never against a run baseline
here." No telemetry compare was fabricated. `balance-panel.js` takes no
corpus input (`--out <panel-directory>` only — it builds a panel from its
own configured seeds), so no panel compare.md was fabricated either.

## Commits

- `53e4f884d` — prereg + instrument/driver/analyzer (before any judged sim)
- `6bca8e380` — build: armor curve K=20→6 + proof 39/39; oracle/cap/bark
  tests updated by design
- `ce4ad5ba0` — evidence file + prereg metric-review fill (this file's
  first commit); corpus in the follow-up commit below

## Footer (filled at closeout)

- check.js --quick: 282 passed, 8 failed, EXIT=1 (834s, log
  `/tmp/st-checkquick.log`). 7 pre-existing on base code; 1 (aegis)
  caused by the retune, fixed test-only (90 → 95, 12/12 green).
- Rebase: pre-rebase HEAD / post-rebase base SHA (pending)
- Proof test on rebased tip: (pending)
