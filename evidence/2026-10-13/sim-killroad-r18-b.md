# Scale-onramp r18 ARM 2 — killroad: can the KILL road learn scale? (GO/KILL)

Run: fleshout-b-20261013T204542Z, ARM 2 (killroad). Worktree: ~/workspace/worktrees/sim-killroad-b.
Axis: scale-onramp (blocking, standing directive). Canon: docs/CANON.md, docs/MONSTER-WAVES.md read first.
Lever: NEW policy `scripts/policies/killroad.js` — competent + a courtship layer,
env-gated `KILLROAD_COURT=1` (default OFF). No game-code changes; policy + scripts + evidence only.

## Pre-registration

- Primary metric: seeds with regional+ AND ≥3 wave-3 kill points (the r17
  two-rung wave-4 bind's two rungs, one rung lowered from 4 to 3 for the pilot
  sniff — if the kill road can't even put 3 points next to a regional rank,
  it can't put 4).
- GO threshold: ≥2/8 seeds on the after arm with regional+ AND ≥3 wave-3
  kill points. Kill fast if missed.
- Horizon: 150d death-aware (reachability lever: regional/national needs
  ~30d seasoned links after d35 proposals; competent's median survival was
  120d on the r17 suite — 150d covers seasoning without ticking dead
  villages).
- Seeds: 11/22/33/44/55/66/77/88 (identical to r16/r17 for comparability).
- Policies: killroad gate OFF (baseline — proven byte-identical to competent
  by scripts/test-killroad-r18-20261013.js) vs gate ON (after), same seeds.

## The lever (design)

The r17 two-rung bind: competent climbs the kill rung (5 wave-3 pts d130 on
s22) but never courts (0 links, 0/8 regional); winseek courts (8→2 accepted,
6/8 regional) but dies median 40d in combat before links season — 11/16 runs
with same-day double scholar deaths. The killroad design bet: court LATE,
from STRENGTH, as PRIMARY.
- LATE: proposals open day 35 (post wave-3 unlock d25, kills on the board).
- FROM STRENGTH: judgeLink rewards "Haven is the stronger" and broadcast
  wins raise opinion (+2 each) — the kill road's wins are its courtship
  resume. Wounded (hp<70%) or recovering scholars never court.
- AS PRIMARY: they bow to Haven, THEY pay 3,000 kcal/week (modest, lands and
  seasons — food-positive, the opposite of winseek's 6k/week subordinate
  tax). Subordinate-term counters are walked away from, honestly, on record.
- THE TAX IS REAL: tendLink 1,500 kcal/week/link from the pantry (+8 trust);
  weekly cap on proposes (1/day, 7-day per-target cooldown, max 3 links).

## Proof

`scripts/test-killroad-r18-20261013.js` — real RED phases:
- RED 1: gate OFF, seed 11, 25d — killroad trajectory byte-identical to
  competent; zero courtship counters; zero links.
- RED 2: gate ON, 30d — zero proposals before day 35.
- GREEN 1: gate ON, seed 11, 60d — 3 proposals through the real
  Game.proposeLink (all asSubordinate:false, 3,000/week), 3 active primary
  links, 12 tends through the real Game.tendLink, say-lines carry the played
  beats ("bows to Haven", "Haven sends 1,500 kcal of grain...", trust +8).
- GREEN 2: staged subordinate-terms counter answered 'walk'; no link formed.
- GREEN 3: tend honesty — real pantry kcal, trust moved.

## Results

16-run sweep (seeds 11/22/33/44/55/66/77/88 × killroad gate-OFF/gate-ON, 150d
death-aware, 127s): `evidence/2026-10-13/sim-killroad-r18-b.json`.

**GO: 0/8 → KILL.** No after-arm seed has regional+ AND ≥3 wave-3 kill points.

| arm | national | regional+ | GO | median d | w3 pts (med/max) | wave4/5 | tableWait | won | pplDeaths | prop/acc/seas | tends |
|---|---|---|---|---|---|---|---|---|---|---|---|
| baseline (gate OFF) | 0/8 | 0/8 | 0/8 | 120 | 0/5 | 0/8 | 0/8 | 0/8 | 88 | 0/0/0 | 0 |
| after (gate ON) | 4/8 | 7/8 | 0/8 | 108 | 0/0 | 0/8 | 0/8 | 0/8 | 82 | 24/21/18 | 312 |

The scale rung didn't just move — it collapsed: 7/8 regional+, 4/8 national
(all nationalFirstDay=88), 1/8 GLOBAL (s66, d150 survivor). The kill road
learns scale better than the dedicated courtship roads (r16: 4/8 national)
AND without the winseek death spiral (median 108d vs 40d; exiled 0/8; no
early collapse — min d38 on s55, identical on baseline, a seed-determined
pre-courtship death).

But the kill rung went to ZERO on all 8 after seeds (baseline: 8 points on
s11/s22). The two rungs don't just fail to coincide — the scale rung
SUPPRESSES the kill rung.

## Why the kills vanished (diagnosed, not speculated)

Fight-level census (`scripts/diag-killroad-w3-20261013.js`, hooks on
startCombat/fieldFight/recordWaveKill):

- Wave-3s spawn and are encountered: after s22 faced 4 distinct wave-3
  types across 21 fights. Spawning is rank-independent (verified in code).
- **Villagers soak the encounters and can't convert**: 19 of the 21 fights
  were villagers — 11 vFlee, 3 vDie, 0 kills. Villagers meet wave-3s in the
  wild and (sensibly) run or die; villager fights never score ledger kills.
- **The scholar fights less**: same seed s22 — player fights 26 (gate OFF)
  → 12 (gate ON); player wave-3 fights 5 → 2; wave-3 kills 5 → 0. On
  baseline the scholar killed every wave-3 they fought (spool×2, redactor×1,
  callback×2); on after they fought 2 and killed 0.
- Total kills are unchanged (139 baseline vs 133 after — w1/w2 killing is
  intact). Only wave-3 kills disappear.

Mechanism, characterized: the courtship layer's verbs consume RNG
(judgeLink's R()*20−10, trust/nudge draws), so post-d35 encounters diverge
from baseline — a real lever effect, not a harness artifact. The scholar's
wave-3 encounter rate drops while villagers' rises; with ~2 scholar
wave-3 fights per run, kills go to ~0. Partially open: the exact
scholar-activity delta (outing frequency vs encounter composition) is an
instrument gap — see Blanks. The direction is robust: on the identical seed
(s22), the arms produce opposite outcomes (5 kills + village rank vs 0
kills + national rank).

Design reading: the wave-4 gate's two rungs couple through the scholar's
ranging. The kill rung is produced by a hungry, ranging scholar; the scale
rung (tribute-fed, tended, national) keeps the village home and puts
villagers in the wild instead. **Prosperity eats the kill rung.** A future
arm could test forced ranging (hungry-scholar courtship) or villager
wave-3 kill capability — both are design questions now, not measurement
gaps.

## Wall numbers

After arm: national 4/8 · table 0/8 · wins 0/8 · wave 4–5 unlocks 0/8 ·
median survival 108d (max 150d) · regional+ 7/8 · global 1/8 · exiled 0/8.
Baseline: national 0/8 · median 120d. (Versus the seeded scale-wall.json
baseline: national moves on the killroad, not the courtship-road reference —
no telemetry-deviation roll; different policy suite by design.)

## Village assessment (plain words)

The killroad villages are the most politically successful villages ever
simmed — and the most peculiar. Emberhold, Stonebridge, Thornfield and
Ashford bow to Haven within days of the courtship window opening (d35–37),
because Haven's scholar spent the first month becoming someone the region
has heard of: the wins are the resume. The weekly grain goes out with the
grandmother line, trust climbs, the trader announces the realm, and by d88
four villages stand seasoned under one head. s66 goes one further — global.

But nobody kills the wave-3s. The Callback wears dead villagers' faces and
the village's response is to run: 11 vFlees on s22, 3 dead. The scholar —
who on the baseline seed personally killed a spool, a redactor and two
callbacks — now fights half as often and never lands the killing blow on a
wave-3. The village that learned to rule stopped learning to kill. The
transcripts read as village decisions throughout (sense-test PASS): the
d37 Thornfield counter ("They won't bow to Haven. But they'll TAKE Haven —
5,000 kcal/week, them primary"), the d38 walk ("You walk away from
Thornfield's table. They'll remember you came — and what you wouldn't pay"),
and the d44 return on Haven's terms ("Divya speaks at Thornfield's table
now — earned, not appointed"). The kill road doesn't bow, and the region
learns it.

## Blanks

OPEN (appended to sim-findings.md):
- Scale/kill coupling: the exact scholar-activity delta behind the wave-3
  kill collapse (outing frequency vs encounter composition vs fight-assess
  walk-aways) is unmeasured — the diagnostic counts fights, not trips or
  declined encounters. A trip-counting instrument would close it.
- Follow-up design questions (not measured): forced-ranging courtship
  (does a hungry scholar keep both rungs?), villager wave-3 kill capability
  (should seasoned village fighters ever score the ledger?).
- The killroad policy's defense-call branch is dead code (answerDefenseCall
  only fires on covenant-kind links; killroad forms primary links) — kept
  for the covenant-road future, harmless.

## Convergence

scale-onramp stays the blocking axis. Verdict vs GO: **KILL** — the
pre-registered threshold (≥2/8 with regional+ AND ≥3 wave-3 kill points) was
missed at 0/8. But the run is not a wasted run: it (1) proves the kill road
can learn scale without the courtship tax killing it (7/8 regional+, 4/8
national, 1/8 global — the best scale numbers on any road), and (2) names
the coupling that binds the wave-4 gate's two rungs (prosperity suppresses
the ranging that produces wave-3 kills). The r17 two-rung bind is now a
MECHANISM, not just a measurement. `longsims-rotation.txt` untouched
(standing directive).
