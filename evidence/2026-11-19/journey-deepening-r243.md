# journey-deepening r243 — run note (2026-11-19)

Lane A, leg 2 deepening (days 40–80, DAYCAP 100). Run id `2026-11-19T05:50:25Z`.
Seeds: panel 105011–105018 (8), probe seed 105019 (dedicated, not scored in panel
metrics). Policy: competent. Seed band fresh per `local_seed_band_freshness`
(0 prereg hits for 105011–105019).

## Pre-registration (from `journey-deepening-r243-prereg.md`)
- **Q1 (primary): staged-departure probe.** The r238 stand-down question was
  UNMEASURED two panels straight (departure rate ~1/16 seeds). This run stages
  a departure on the probe seed: remove the Herald from the world census on the
  first dawn the muster holds ≥1 blade, then judge whether the muster stands
  down and releases instead of stranding. Bar: probe fires once, stand-down
  follows the same morning, 0 stranded days.
- **Q2 (secondary): coalition-reach ≥6/8.** A muster must reach 10 blades
  (minAllies) on ≥6 of 8 seeds. r238: 2/8 FAIL.
- **F2 wild check:** the refusal line's spoken count must match the gate's
  count on every heard refusal (0 mismatches).
- **Q3:** people check — full transcripts + the probe seed's muster-breaks line.
- **Q4:** census + verdicts (reachable / fun / winnable).
- Pilot gate (3 seeds 105011–105013): driver clean, musterLog rows on
  titan-days, no new bad-line class, probe stages or reports why not. Pilot
  PASSED (exit 0, all survived day 100+, probe fired day 62).

## What changed in the game (F2 fix)
The titan fight wrapper's refusal counted allied blades only
(`muster.allies.length`, raw) while the hard gate counts unique living allies
+ committed Haven blades. On r238 seeds 104806/104807 the line said "you have
6" on 14 refusals each while the muster stood at 9 (6 allies + 3 Haven).
Fix (`src/js/titans.js`): new shared helper `titanMusterBladeCount(titanId)`
(unique living allies via `titanUniqueAllies` + committed Haven blades via
`titanHavenBlades`, deduped); `titanMusterReady` and the wrapper refusal's
`have` both read it. Line text unchanged.
Proof test `scripts/test-titan-refusal-have-counts-haven-20261119.js`:
**15/15 GREEN** on the fixed build. **RED verified this run:** against the
unfixed code the test fails 4 checks (11 passed, 4 failed — says "you have 7");
fix restored, re-run green. F2 landing is RED+GREEN proven.

## Tooling (r243 forks)
- Driver `scripts/journey-deepening-r243-20261119.js` (+ probe block:
  `ctx._probeSeed`, splice the Herald out of `G.state.worldMonsters` on the
  first muster morning, `probeLog` rows; REFUSALHEARD rows carry `spokenHave`).
- Analyzer `scripts/analyze-journey-deepening-r243-20261119.js` (+ F2-HAVE
  join: spoken have vs first refused outcome's `detail.have` per day;
  + Q1-PROBE section judging the probe-seed JSON with the stand-down logic).
- Tests: muster 41/41 (M1–M28 carried + M29 probe fires once / M30 negative),
  march 11/11, analyzer 83/83 (80 carried + 82/83/84 F2-HAVE GO/NO-GO/
  UNMEASURED), F2 15/15. All green before the panel.

## Results — panel (8 seeds, all survived day 100/101, wave 4)
| Question | Verdict | Numbers |
|---|---|---|
| Q1 probe (primary) | **Q1-STANDDOWN-GO — MEASURED** | probe seed 105019: probe fired day 65 (6 blades: 4 allies + 2 Haven), stood down same morning, released, strandedDays 0 |
| Q1 wild stand-down | **Q1-STANDDOWN-GO** | stoodDown=2, released=2, strandedDays=0 |
| Q2 coalition-reach | **FAIL (1/8, bar ≥6/8)** | reached10=1 (105012, max 14). Three villages sat one blade short 12–23 days (105013: 15d, 105016: 21d, 105018: 23d, all max 9). The muster tops out at 9 = 6 allies + 3 Haven; the Haven cap of 3 is the binding blade |
| F2 wild check | **F2-HAVE-GO** | joined=8, mismatch=0 |
| Q1 growth line | GROWTH-LINE-GO | poolDays=8, lineDays=8, badLines=0 |
| F2 muster resets | F2-REARM-GO | resets=5, rearmed=2, stale=0 |
| Q1 refusal-heard | REFUSAL-HEARD-GO | refused=18, spoken=8, badDays=0, dedupeDays=4 |
| Q1 titan | TITAN-MUSTER-MOVED | 7 seeds saw the titan, 165 titan-days, 59 verbs, slain=1 |
| Q1 muster policy | MUSTER-SLAIN | called=7, ready=0, fought=1, slain=1 |
| Q2 march | MARCH-SLAIN | marchDays=2, arrived=2, foughtOnMarch=1, slainOnMarch=1 |
| Q1 slain field | UNMEASURED | opportunities=0 |
| Q1 wave 4 | 19 fights, 2 kills (0.25/seed) | banked2=0, unlockedW5=0. Scholar deaths 22, 13 wild (r238: 20/10) |
| Q1 trick pipeline | TRICK-PIPELINE-FINDING | learnedRate 0.545; both wave-4 kills on unknown monsters |
| Q1 ladder | LADDER-OPENS + MINTS + HOLDS | opens=8/8, all five tracks minted on all seeds |

**The one kill that matters:** seed 105016 slew the Herald day 85 on the march
with **8 blades** — under the 10-blade gate. The muster gate never opened
(105016's muster peaked at 9), but the march carried the fight anyway and won.
The gate's arithmetic and the march's reality disagree: a party that walks to
the monster fights with whoever is there, gate or no gate. That is the next
question for the muster work, not a defect to fix in this run.

## Census (plain words)
Eight villages, all eight alive at day 100. Nobody scattered, nobody starved
out. The villages are healthy — pantries in the thousands of calories, the
ladder opening on every seed, bonds and teaching moving — but they are stuck
one blade short of the fight that matters. The Herald walks the roads for
weeks (165 titan-days across the panel) while musters stand at 9 blades and
wait. One village (105012) did reach 14 blades and stood ready — then the
Herald left the next day and the muster stood down cleanly. One village
(105016) walked out with 8 blades and killed it anyway. The wave-5 door never
opened on any seed. The scholar died 22 times across the panel, 13 of them in
the wild — the roads are still the most dangerous place in the game.

## People check (Q3) — PASS
Probe seed muster (105019): day 64 the call goes out, the council confirms,
4 allies + 2 Haven commit (6 blades, not ready); day 65 the Herald is gone
and the muster stands down the same morning, blades released. The stand-down
is the villagers behaving sensibly, not a system forgetting them.
Transcript (105012, day 60, Alejandro the tailor, anxious, trust 100,
hungry): his want is repay — the player once brought him food he needed.
He opens "Can we talk? ... Like people used to." The player turns down the
betrayal branch ("Not this time"), he pockets "a small thing", and the want
resolves honestly: "You came through on the food I needed. I won't forget
it." The player waves it off ("Don't worry about it") and he files it away,
settled and counted. The debt references real food actually delivered; the
closing ("Same time tomorrow, if the world allows") is warm and grounded.
No filler loop, no fabricated history. One mild miss: he is hungry and never
says so — the want is about food, so the hunger is present in theme but not
in his words.

## Carried findings (not built this run)
- **F8 (r238, voice, rare — 1/106 transcripts):** "This stays between us,
  right? Right." closed a sitting with nothing confided. Fix sketched (gate
  the line on `c.secretShared` in `endConvo`, conversation.js ~8463). Deferred
  again: the flap cost ~50 min of this run's budget and the fix needs a
  conversation-audit re-check. Carried to the next deepening run.

## Metric review
- Q1's metric changed by design this run (staged probe replaces the wild-only
  departure rate) and the probe answered it on the first attempt — the staged
  probe is now the standing instrument for this question, not a one-off.
- Q2's bar (≥6/8 reaching 10) still binds and still fails (1/8, down from
  2/8). The miss is not a measurement artifact: three villages sat at 9 for
  12–23 days. The Haven cap of 3 blades is the visible wall; whether the fix
  is more allies, more Haven, or a lower gate is a design call for the next
  run — the metric stands as written.
- Wave-4 kills fell (2 vs r238's 5) while scholar deaths rose (22 vs 20,
  13 wild vs 10). Same seeds' family, different band — read as the panel
  being harder, not as a regression from the F2 fix (the fix touches only the
  refusal line's count, and F2-HAVE is GO in the wild).

## Infrastructure
- **Write flap: ONGOING, never solved.** Registration failed ~05:57–06:00Z
  (worktree checkout refused fresh-file writes); probes failed 06:03Z and
  06:05Z; runtime restart ~06:07–06:10Z; registration succeeded on retry.
  Flap flickered again from ~06:32Z (git index-lock writes refused, large
  fresh-file copies created 0-byte files ~25 times 06:48–06:55Z, cleared
  06:56Z). All writes after ~06:56Z landed; every file in this run was
  size-verified after writing. RED verification was flap-blocked twice
  earlier in the run and completed cleanly at ~07:12Z once writes held.
- Gate: `node scripts/check.js --quick` — **338 passed, 6 failed, 0 attributable
  → GATE GO.** The 6 failures are all r238 standing categories, pre-existing:
  balance-proof manifest stale (`test-measurement-proof-update.js`,
  `test-measurement-workflow.js` neutrality proof — the proof fingerprint
  goes stale on any src change until refreshed, the standing workflow item),
  phone-frame receipt staleness (`test-phone-frame-proof.js`), and three
  120 s deed-attainment/observer timeouts (`test-living-garden-deed-attainment.js`,
  `test-one-person-army-deed-attainment.js`,
  `test-trust-observer-neutrality.js`). None touches titans.js or the r243
  tooling. The r238 "ladder-bundle control" failure did not recur.
  Full log: `evidence/2026-11-19/journey-deepening-r243-gate.log`.
- Telemetry: quiet (8 files, 4 metrics, no large deviations). Baseline NOT
  rolled.

## Verdicts
- **Reachable:** the deepening content is reached on all 8 seeds (wave 4,
  titan present on 7/8, ladder opens 8/8). Yes.
- **Fun:** the villages are alive and the conversations hold up; the muster
  stands, waits, and stands down sensibly. The one-blade-short stall is the
  dull part — weeks of waiting at 9 blades with the Herald in view.
- **Winnable:** no. Wave-5 door 0/8, 2 wave-4 kills in 19 fights, 22 scholar
  deaths. The chain is still blocked at the coalition wall (Q2) and at damage
  (no launched party dealt the killing blow except the 8-blade march).

## Closeout
- Tooling commit + run-note commit via `safe-commit.sh` in the worktree.
- Merge `git merge --ff-only journey-deepening` in the main tree; release +
  remove worktree; rotation `2→3`; lock deleted last.
- Report: merged locally, pending ship.
