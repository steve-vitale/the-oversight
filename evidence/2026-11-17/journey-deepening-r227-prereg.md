# Journey deepening r227 — prereg

- Run: r227, Lane A leg 2 DEEPENING (days 40–80; DAYCAP 100 for comparability with r213/r218/r222/r226)
- Run id: playtest-a-20261117T0420Z (lock playtest-loop-a-2026-11-17T03:43:48Z)
- Base: master 2ac3052b0 (worktree journey-deepening, registered 03:47Z; registration queued ~27 min on the registry lock + slow `git reset --hard` under load average 12–21 — live reaper self-contention, same family as r222/r226)
- Policy: competent + MUSTER POLICY (new, driver-only — no src/js change): when the Herald omen reaches stage 2 (located) and the Herald is present, sound the call (once per link-count change), sit the war council once, commit Haven's blades (two-tap) once. The fight policy gains a titan-aware carve-out: a titan fight with a ready muster is not fled on solo-HP math. No seek-the-titan pathfinding — the fight fires through the existing meeting path (r223: 151 meetings in scale).
- Seeds: 102501–102508 (8 seeds)
- Seed-band freshness check (local_seed_band_freshness): searched all of
  `evidence/` (repo) — 0 hits in *.md preregs for each of 102501–102508
  (full-tree md grep, 2026-10-13 through 2026-11-16); hidden evidence
  (`hidden_files/evidence/`) filename + *.md search: 0 files for
  102501–102508; no forbidden/contaminated band list names the band (no
  such list file exists under hidden_files/). REJECTED first choice
  102401–102408: sim-launchsurvive-a prereg
  (evidence/2026-11-16/sim-launchsurvive-a-prereg.md:223) names it
  ("Seeds: 102401–102408 (8-seed pilot ONLY...)"). The 10240[1-8] hits in
  repo JSONs (fairshare r8 files, leadcourt s22 files) are float-substring
  artifacts, not seed uses. Band 102501–102508 is fresh.
- Driver: fork of scripts/journey-deepening-r226-20261116.js (r226 → r227,
  band + tag + EVIDIR date + musterPlay + titan carve-out in policy.fight).
  Analyzer: fork of scripts/analyze-journey-deepening-r226-20261116.js +
  summarizeMusterPolicy (joins musterLog + titanEnd + verb calls + titan
  fight records). Proof tests: analyzer fork tests (carried) + new
  muster-policy proof (decision rules + two-tap commit + once-per-link
  rule, synthetic stubs, no game needed).
- Canon read: docs/CANON.md + docs/MONSTER-WAVES.md (wave-4 gate: standing
  >= 100 + readiness bars; observation channel: 2 survived encounters →
  trick). NO canon doc covers titans/muster — mechanism grounded in
  src/js/titans.js + src/data/titans.json (Herald: wave 4, minAllies 10,
  monster "herald"; omen needs wave >= 4 AND scaleRank regional+,
  0.10/day; no_solo_titans hard-refuses startCombat without a complete
  muster; commit_own_is_explicit: Haven's blades join only via the
  player's two-tap titanCommitOwn, up to 3; soundTitanCall asks each
  allied link for blades — 2 base, 6 if trust >= 70 and opinion >= 10,
  REFUSES if trust < 25 / opinion < -10 / arrears > 0 with trust −8 per
  refusal) and in r223/r226's pinned mechanism.

## Q1 — MUSTER POLICY: DOES THE MACHINE WORK WHEN SOMEONE SOUNDS THE CALL? (primary)

Why: r226 proved the blank is a verb problem — 0 muster verbs panel-wide
with the Herald present 253 titan-days on 8/8 seeds, muster 0/10
everywhere, a 1-HP Herald the village cannot finish. The gaps program's
next lever is a muster path (policy/driver or villager-side drive). Before
any villager-side drive is built, this run tests whether the EXISTING
machine works when a competent player uses it: sound the call when the
omen locates, commit Haven's blades, and let the natural meeting path
start the fight. If the machine works, the blank is purely a drive/policy
gap and the lever brief is a villager-side muster drive. If it does not,
this run pins WHICH layer blocks it (allies refuse / too few links /
trust too low / upkeep starves / fight never fires / coalition loses).

Bound metrics (per seed, panel totals in the analyzer):
- musterLog: one entry per policy decision day — omen stage, herald
  present, links, allies/haven before/after, ready, actions taken
  (call/council/commit), verb results.
- musterCalls: soundTitanCall attempts + allies gained + refusals (from
  transcript REFUSES lines, counted by the analyzer).
- musterReady: titanMusterReady(herald) true on >= 1 seed? First ready day.
- titanFights: startCombat('herald') fired (fight records with
  monsterId herald); titanSlain: state.titans.slain.herald.
- musterCost: haven blades committed, haven blades dead by end (census),
  village deaths on titan-fight days, pantry at muster-ready vs end.
- w4stuck1 (carried): wave-4 types at obs=1 at day 100 (r226: 7/8 seeds).
- w4fights / w4kills, banked veterans, w5 unlocked/faced/killed (carried).

Interesting if ANY holds (GO = a finding worth a fix or a lever brief):
- A muster completes (ready true) on >= 1 seed — the machine works when
  used; the blank is a drive/policy gap.
- A titan fight happens — document the outcome (slain/fled, blades lost,
  scholar fate).
- The muster NEVER completes despite the call being sounded on every
  located omen — pin the blocking layer with numbers (refusals vs
  too-few-links vs trust vs upkeep).
- >= 6/8 seeds have >= 1 wave-4 type stuck at obs=1 at day 100 (the r226
  thin spot reproduces).
A miss on all four = NO-GO: no muster, no fight, no stall — re-examine
whether the policy ever saw a located omen.

## Policy safety rules (part of the prereg, not tunable mid-run)

- soundTitanCall refusal costs trust −8 per refusal PER CALL, so the
  policy sounds the call ONCE per link-count change, never daily.
  Re-sound only when the link count has grown since the last call (a new
  ally may answer) — never on a timer.
- titanCommitOwn is two-tap: call twice in the same daily tick (first
  returns 'confirm', second commits). Only when omen stage >= 2 and the
  Herald is present and haven blades < 3. One commit cycle per muster.
- The war council is sat once per located omen (information, no blades).
- The titan carve-out in policy.fight applies ONLY when the fight holds
  a titan monster id AND Game.titanMusterReady(mid) is true; the
  mid-fight hpPct < 0.35 flee and the stalemate flee stay as-is.
- No seek-the-titan pathfinding in this run. If the muster completes but
  no fight fires by day 100, that is a recorded finding (march/seek gap),
  not a policy failure to hide.

## Q2 — PEOPLE CHECK

Read 1–2 full transcripts from convo days 45/60/80 in full (SENSE-TESTING
LAW): does the NPC want something, do options engage/deflect it, do endings
resolve/plant/owe? Note verbatim lines.

## Q3 — CENSUS + REACHABLE / FUN / WINNABLE

Census in plain words (who lived, who died, what they knew, what was
missing). Judge reachable / fun / winnable for deepening.

## Instrument change (r226 metric-review owed)

- taughtRate denominator floor: the analyzer's trick-pipeline summary
  reports taughtRate as null when countered12 < 3 panel-wide (r226: a
  denominator of ONE fired TRICK-PIPELINE-FINDING on mirror_stag).
- stallW3plus stays the whole-pipeline read; wave-4 re-encounters are
  judged by w4stuck1 (already a prereg bar).

## Watches (no verdicts unless the bar trips)

- Scholar deaths (standing metric, r138 rule as corrected by r222's metric
  review): compare against r226 (20 total, 13 wild), NOT the
  establishment ≤2/panel bar.
- Survival vs r226 (8/8 survived, 100d).
- Ladder stage at d80; regional links seasoned by d80.
- Wave-3 wild Reunion: fights + outcomes (arena cap landed; wild untouched).
- Herald gorge: transcript lines where the titan eats from the stores
  (r223: 800–1,200 kcal/night) — counted only if the analyzer scan finds
  them; no verdict.

## Gate / telemetry

- `node scripts/check.js --quick` in the worktree (cache
  /tmp/jest-cache-playtest); 0 attributable failures = GO.
- Telemetry: `node scripts/telemetry-check.js --baseline
  hidden_files/telemetry-baselines/deepening.json --current
  'evidence/2026-11-17/journey-deepening-r227-seed*.json'`. Known LOUD
  schema mismatch (driver emits no guardrails.*) — baseline NOT rolled on
  that line alone; any NEW loud line is a same-run investigation item.

## Metric review (filled at closeout)

- (to be filled)
