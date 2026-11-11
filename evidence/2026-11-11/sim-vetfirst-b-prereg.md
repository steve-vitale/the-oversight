# Veterans — first numbers: pre-registration (arm sim-vetfirst-b)

Run fleshout-loop-b-20261111T0835Z, Loop B. Coverage Program Tier 2 (Steve
order 2026-11-10 11:11 CST "Measure all"). Written and committed BEFORE any
judged sim. Base commit 5bb3c595a. Claim: goal
hidden_files/lever-claims/fleshout-loop-b-20261111T0835Z.json (axis:
winnability chain — veterans; arm sim-vetfirst-b).

**Measurement arm, no lever, no src/js change.** Judge ONLY against the
prereg (§14); a GO makes NO landing claim and spends NO confirm band.

## Canon

- docs/CANON.md read first. **There is NO VETERANS.md in docs/** — no canon
  doc covers veterans as a system. The nearest canon is
  docs/MONSTER-WAVES.md § "Combat readiness gates the standing unlock"
  (design call #4, 2026-10-16): VETERANS = living roster members with a
  recorded kill of a wave-(w-1)+ monster in `state.waveKillLog`. Demand
  (sim starting points, not canon; Steve can overrule): wave 4 needs 1
  veteran (killed wave-3+); wave 5 needs 2 (killed wave-4+). Fleeing
  records nothing. The same doc's Wave 4/5 sections give the standing
  gates (t4 100, t5 200 + wave-4 faced). Nothing is invented here; the
  code citations below are the source of truth.
- Villager veterans as coded (read before pre-registering):
  - `recordWaveKill(monsterId, killerVid, via, detail)` (game.js ~34490)
    is the single choke point: every real kill flows through it (player
    TB, villager field fights, contests). Log entries are
    `{d, mid, w, by, via, trick}` in `state.waveKillLog` (1000-entry cap),
    deduped on exact repeats (day, mid, by, via, trick). The per-wave
    counter `state.waveKills[w]` follows the log since the vetcount-b
    fix (one body = one count; a re-fired call counts nothing).
    `recordPyrrhicKill` stamps `pyrrhic: true` on the log entry; pyrrhic
    kills score nothing toward wave bars but DO count toward veteran
    identity (a villager who killed a wave-4 beast in a lost fight still
    killed one).
  - The veteran bar reads the LOG, twice, and the two reads now agree
    on the scholar: `src/js/ladder.js` `countLivingVeterans(G, minWave)`
    counts living villagers with a wave-minWave+ kill INCLUDING the
    current scholar (Steve RULED 2026-11-10 07:39 CST — scholar counts
    as a villager; `payable` is the non-scholar subset the tribute
    delivery can actually take); `src/js/standing.js`
    `waveCombatReadiness(w)` counts distinct living killer vids with
    wave-(w-1)+ kills, `isLiving(scholarId)` true. This arm VERIFIES
    both reads agree with the instrument's own kill-time-keyed
    recomputation on a fresh band — it does not re-litigate the ruling.
  - Kill-time keying is mandatory (sim-compchan, 2026-10-18): a kill's
    `by` is a vid at kill time; on succession the old scholar becomes a
    villager and their kills stay theirs, while end-of-run keying
    against the current scholar vid misattributes old-scholar kills as
    "villager kills" (2/3 sampled). The instrument keys every kill by
    (`by`, day) and checks liveness per day, never at end.
  - Companion killing-blow beat (game.js ~34648): via 'companion' /
    'wild' / 'patrol' wave-3+ kills fire `companionKillBeat` (fiction
    notices the kill). Via 'companion' is stamped only by the TB
    tricktag path. Contests keep their own narration.
  - Veteran tales: `tellVetKillerTale` / `queueKillerTale` (game.js
    ~23156, ~23304) — a villager's kill is queued for the night fire.
  - `Game.bloodedCfg()` / `villageBlooded()` (standing.js ~311):
    once the village has a living veteran (wave-4+ killer), its
    fighters hit wave-5 monsters harder (dmgMult 1.5) and stand longer
    (inMult 0.75) — the wave-5 kill lever (sim-wave5kill-a, sized
    2026-11-10). Condition IS the gate's own veteran count, read
    through `waveCombatReadiness(5)`.
- Monster veterans as coded (read before pre-registering):
  - `castMonster()` (game.js ~34858): an older-wave monster spawning in
    a newer wave is flagged veteran — `isVeteran = targetWave < wave`
    (the 60%-newest spawn ratios: w4 60/20/15/5, w5 55/20/12/8/5).
  - `spawnWorldMonster()` (game.js ~20438) honors the flag from opts or
    mdef (`veteran: !!(opts.veteran || (mdef && mdef.veteran))`) and
    carries it on the world monster. The wanderer path
    (game.js ~24612) passes `cast.veteran` through; the feast draw
    carries it on `s.feastDraw` (feastBuff.js ~698).
  - TB application (`startCombat`, game.js ~35045): "old-wave monsters
    in a new wave are hardened. +50% HP, +3 damage, +1 speed." In code:
    `hp = Math.round(hp * 1.5); spd += 1` on every fighter push, plus a
    variant roll (scarred 34% / elder 33% / pack-leader 33% — scarred
    braces the opening, elder can't be stunned, pack-leader brings a
    friend). **The +3 damage is NOT FOUND in any damage path this arm
    could locate**: TB telegraphs read `mdef.attack.damage` directly
    and field fights roll `dmgRange` from `mdef.attack.damage`
    (fieldFights.js:571) — neither references the veteran flag. The
    proof fixture checks a veteran fighter's dealt damage against a
    non-veteran of the same type; if the +3 is absent, that is a
    canon-vs-code gap to record, not an assumption to bake in.
  - `tbWorldHpFor` (game.js ~34991): a veteran world monster returns
    null (no world-HP lift) — a veteran re-rolls fresh HP (x1.5) in TB
    instead of keeping its world HP. Non-veteran wave-4+ world monsters
    keep world HP. The instrument records both.
  - Loot: veteran wave-1 fighters get a loot-tier bump (+1, cap 3) only
    after wave 2 unlocks (`rollAlienLoot`, game.js ~46267).
- Prior art (do not re-judge; this band is fresh):
  - sim-vetcount-reconcile-b (2026-11-10, seeds 140201–140208): log ==
    counter on 8/8 after the fix; 32 duplicate recordWaveKill calls
    across all waves; fates table 17/17 incl. scholar-at-end. Open
    follow-up in the findings backlog: the choke point re-fires up to
    8x per kill — the caller-side WHY is unexamined.
  - sim-compchan (2026-10-18): end-keyed "villager kills" were
    old-scholar kills; fresh census 33 w3 kills = 32 scholar (97%) + 1
    companion (3%); ZERO living veterans at end of 16/16 runs.
  - sim-vetkill-autopsy / vetformation / vetretention (2026-10-23):
    formation > retention as the bigger lever; 8/10 killer vids died
    1–8d after their kills (mean ~6d), 0 in the wave-4 fight itself.
  - sim-vetwindow (2026-10-18): 8/8 veteran deaths on the winseat
    substrate are scholar successions; 0 villager veterans died.
  - sim-fightplay-b census (landed 2026-11-11, MEMORY.md): 84% of
    fights start with three people; 0/11 solo wave-3/4 kills; 3 wave-4
    kills in 98 real fights; wave-5 door never opened on any of the
    eight villages.
  - Findings backlog veterans-related open items checked before
    planning: #472 (hold beats don't mourn the blooded), #545
    (veteran deaths are scholar deaths), #590 (hall door blocks
    veteran production), #594 (302 wave-3+ villager field engagements,
    0 villager kills), #598 (companion killing blows deserve a beat),
    #607 (patrol danger mispriced), #608 (armor has no honest
    policy-side channel), #609 (raid shapes carry the companion
    channel). None is claimed as a build by this record-only arm;
    #545 and #594 are MEASURED by it (their numbers are this arm's
    metrics 3 and 5), and the rest stay open for a future arm.
- Panel context: the readiness bars are the gate; the Standing ladder
  (ladder.js) is the price. This arm counts the veterans, it does not
  move any bar.

## Pre-pilot substrate checklist (§14b)

1. **Contact**: wave-3+ kills happen under competent — vetcount-b saw
   21 wave-4 kills (20 counted + 1 pyrrhic) on 8 seeds, and
   wave-4 unlocked 8/8. The pilot counts formations, not assumes them.
2. **Pool sizing**: measurement arm, no lever bar — no pool/bar ratio
   to size. The addressable pool is the waveKillLog itself (every kill
   ever recorded) plus the live roster for the living-veteran read.
3. **Verb existence**: recordWaveKill / castMonster / spawnWorldMonster /
   startCombat / waveCombatReadiness / _ladderLivingVeterans /
   countLivingVeterans all exist in the engine; the policy fights
   real fights. The veteran-behavior verbs (party, teach, mentor) are
   probed in the proof fixture, not assumed.
4. **Horizon fit**: 150d covers the full village life (sibling pilots'
   median survival 122.5–140d); veterans form late (wave-3+ kills need
   wave 3 unlocked ~day 25+ plus standing), so the horizon must reach
   the late game — 150d does, and the death-aware stop keeps dead
   villages from ticking.

## Primary metric + GO threshold

Primary metric: **complete first-numbers capture of veterans** — every
veteran event classified (formation, death, bar contribution,
monster-veteran spawn/kill), every kill-log entry reconciled against
the counter, every metric in the list below counted or explicitly
marked unmeasurable.

GO (instrument validity + complete capture — a GO makes NO landing claim
and spends NO confirm band; there is no lever here to land):

| GO check | Bar |
|---|---|
| Every veteran event classified (formation, death, bar contribution, monster-veteran spawn/kill), none 'other' | 0 unclassified events across the pilot |
| Every wrapped method's call path verified live or marked dead | each wrap live in the pilot, or proven live in a fixture and marked dead under competent |
| Kill-log vs counter agreement, per wave 1–5, per seed | log (non-pyrrhic) == counter on 8/8 seeds, all waves |
| Engine veteran-bar reads agree with the instrument recomputation | waveCombatReadiness(4/5).veterans + _ladderLivingVeterans(4) == instrument living-veteran count at end of run, 8/8 seeds |
| Neutrality: OFF leg matches instrumented leg | days + end pantry kcal + deaths match exactly, 8/8 seeds |
| Instrument errors | 0 on all seeds, all legs |
| Complete first-numbers capture | per-seed tables for metrics 1–8; sense-test scenes quoted |

A miss on any row is NO-GO against the pre-registered bar (metric review
records why; never re-scored mid-run, §14).

## Metrics (all 8)

1. Villager-veteran formation (kill-time-keyed): wave-3+ and wave-4+
   kills by killer vid + day + via (player/companion/wild/patrol/
   contest/agency) + monster + pyrrhic flag; distinct killers per
   seed; formations per seed (first veteran day, peak living veterans,
   living at end); scholar-at-kill-time share vs ever-scholar share
   (the compchan correction, both numbers printed); repeat kills by
   the same vid.
2. Kill-log vs counter reconciliation: per seed, per wave 1–5:
   `state.waveKills[w]` vs non-pyrrhic log entries with that wave;
   duplicate `recordWaveKill` calls (same day/mid/by/via/trick as an
   existing entry); pyrrhic entries by wave/killer; log entries whose
   `by` is not on the roster (never counts — counted separately).
3. Veteran deaths: every wave-3+ killer's death (day, days-after-kill,
   cause via the shared sim-instrument-kit classifier, channel:
   arena/field/haven/raid/wild/starvation/disease), scholar
   successions vs villager deaths (backlog #545 re-measured);
   veterans who die the same day as their kill; veterans alive at
   village end. Deaths are cross-checked against vpOf liveness
   (the #530 phantom-death lesson: a kind:'person' tele without a
   dead record does not count).
4. Monster veterans: `castMonster` veteran share by target wave and
   monster wave (older-wave spawns / all spawns); `spawnWorldMonster`
   veteran share by caller frame; veteran kills by wave (a hardened
   older monster's kill counts as its BASE wave — `recordWaveKill`
   reads `mdef.wave`, verified live); veteran fighter stats in TB
   (hp x1.5 / speed +1 / +3 damage — the +3 checked live, see Canon);
   veteranVariant distribution (scarred/elder/pack-leader); veteran
   loot-tier bump (wave-1 veterans after wave-2 unlock — counted only
   if a rollAlienLoot call is observable; else marked unmeasured).
5. Veteran behavior: for each living veteran, daily: in the scholar's
   party (companion vids), armor P worn, weapon to hand, assignment/
   duty, hp; repeat kills after formation; mentor/teach events
   (tele types naming the veteran vid — teach/mentor/party keywords
   filtered in the analyzer); fight participation (kills + deaths
   in the log are the floor; field-fight presence beyond kills is
   marked unmeasured if no call path observes it). Backlog #594
   re-measured: villager field engagements vs villager kills.
6. Veteran bar vs wave unlocks: daily instrument recomputation of
   living veterans (w4 bar: wave-3+ killers; w5 bar: wave-4+ killers)
   vs the engine's `waveCombatReadiness(4/5)` at end of run; wave-4/5
   unlock days; military-tribute readiness (`ladderCapstoneReady`
   veteran counts at end of run); blooded status
   (`villageBlooded()` at end of run); hold-beat shortfalls naming
   veterans (say-corpus rows).
7. Wall numbers: national / table / wins, wave 4–5 unlocks, median
   survival, deaths, standing, scale.
8. Sense test: veteran-kill beats, veteran tales at the fire, hold
   beats naming veterans, mentor/party scenes — quoted; anything
   robotic/static (a veteran who never fights again, never mentors,
   never gets picked) is a finding, not a number.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (dead villages stop, +10d tail max).
  Why 150d: veterans form late (wave-3+ kills) and the retention
  question (do they live ~6d past the kill, per the autopsy) needs the
  late game; sibling first-numbers pilots ran 150d with median
  survival 122.5–140d, so 150d captures the full village life.
  Same horizon as the siblings for comparability.
- **Seeds: 190301–190308 (8 seeds).** Freshness search (skill
  local_seed_band_freshness, full scope):
  - Searched every `evidence/*/sim-*-prereg.md` for 19030[1-8]:
    zero hits.
  - Searched all dated evidence `.md` (recursive grep,
    `--include='*.md'`) for 19030[1-8]: zero hits.
  - No perseed directory names any seed 190301–190308; no dated
    evidence `.md` names them.
  - The 4 JSON-corpus hits for the digit run 19030[1-8] are FALSE
    POSITIVES, not seeds: every one is a decimal float containing the
    digits inside a longer number (555.1903014409988 in a panel case
    ration kcal; 6.948919030254976 fireFd/dawnFd values in the
    armc-b-partial copies of leanclass-b / spikechar-b sweep JSONs).
    None is a standalone seed integer; none reserves the band.
  - Recent used bands (named in the task, re-verified present in
    preregs): 180265–180272 trade/feast, 150233–150248 talkturn,
    170301–170308 conjurefix, 180241–180248 trapfirst — none overlaps
    190301–190308.
  - Search scope recorded so a later reader can retrace it: all
    `evidence/*/sim-*-prereg.md` + all dated evidence `.md` + perseed
    directory names + goal hidden_files (float matches inspected
    individually).
- **Policies (TWO legs on identical seeds):**
  - **control:** competent verbatim, default env, instrument ON (the
    judged leg).
  - **neutral:** control policy, instrument OFF (no wraps, no snapshots;
    end-of-run wall numbers + days + end pantry kcal + deaths only),
    same seeds — must match the instrumented control leg exactly on
    days + end pantry kcal + death count (8/8).
  - No other policy change. No src/js change.

## Instrument

scripts/vetfirst-instrument-20261111.js — wraps (record-only, never alter
state, never consume RNG; recording failures go to instrumentErrors,
never thrown into the game):
- recordWaveKill: every call (day, mid, wave from mdef, by, via, trick,
  dup-verdict: whether an identical entry already sits in the log at
  call time) — the call accounting the vetcount fix made reconcilable.
- recordPyrrhicKill: every call (day, mid, by, via) — pyrrhic stamp.
- castMonster: every return {id, veteran} + targetWave + current
  unlocked wave — the monster-veteran spawn decision.
- spawnWorldMonster: every spawn (id, wave, veteran, hp/maxHp, caller
  frame) — the world-side veteran share.
- startCombat: fighter snapshot at fight start for the monster side
  (mid, veteran, veteranVariant, hp, maxHp, speed, def hp/speed) —
  the live stat check (hp x1.5 / spd +1 / +3 damage question).
- tele: every call (type, day, short payload summary) — mentor/teach/
  party/kill-beat rows filtered in the analyzer; teach rows carry the
  vid when the payload names one.
- registerDeath (if a Game method; else deaths come from the driver's
  runDays samples + vpOf liveness cross-check): every death row
  (day, kind, who, cause) for the veteran-death classification.
- Daily snapshot: waveKillLog copy (kill-time-keyed), waveKills
  counters, living-veteran recomputation (w4 bar + w5 bar, with
  scholar-at-kill-time flag per killer), per-veteran behavior row
  (alive, inParty, armorP, weapon, assignment, hp), roster liveness,
  unlocked wave, standing (read-only snapshot value only — the
  snapshot NEVER calls villageStandingTotal() mid-run; the end-of-run
  read is the only standing call, as in fishfirst-a).
- End-of-run reads (driver, once): waveCombatReadiness(4) +
  waveCombatReadiness(5), _ladderLivingVeterans(4),
  ladderCapstoneReady('military_tribute'), villageBlooded(),
  unlockedWave(), scaleRank(), villageStandingTotal().
Driver: scripts/vetfirst-driver-20261111.js (mirrors fishfirst-driver;
Game.say wrap with a veteran regex for the sense corpus, 400 lines/seed
cap — raised from trapfirst's 200 after its metric-review (g);
regex: veteran|blooded|scarred|elder|pack-leader|put down|killing
blow|veteran kill|remember the name). Analyzer:
scripts/vetfirst-analyze-20261111.js. Proof:
scripts/test-vetfirst-b.js (each wrap proven live on a fixture or
miniature; RED checks where a wrap is dead by construction; the +3
damage check is a live TB miniature: veteran vs non-veteran fighter
damage over N strikes).

## Balanced panel (§15)

Attempted and recorded honestly: this is a MEASUREMENT arm with no lever
change and no before/after arms, so there is no panel comparison to
fabricate (same position as sim-fishstaff-b; cookfirst-a, preserve-a,
fishfirst-a and trapfirst-a likewise attached no panel). The
control/neutral legs are the neutrality proof, not a panel. Panel
context recorded in evidence: the readiness bars are the gate; the
Standing ladder is the price.

## Guards (reported, never verdict-flipping post-hoc)

daysAlive, deaths, starvation share vs the sibling first-numbers corpus
shape (cookfirst-a / preserve-a / fishfirst-a / trapfirst-a: median
survival 122.5–140d, 6–8/8 village-lost). If the instrument changes any
numeric field vs the recorder-free baseline, the arm is NO-GO on
neutrality. If the engine's veteran-bar reads disagree with the
instrument recomputation on any seed, the arm is NO-GO on the bar
check and the disagreement is the finding (never silently reconciled).

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the pilot: did the metric set hold, or does a
  metric need revision for the NEXT run?)

## Run notes

- EPERM flap live at run start (~09:04 UTC 2026-11-11): O_EXCL file
  creation refused filesystem-wide (heartbeat atomic write fails,
  mkstemp probes fail 5/5 in ~/workspace/worktrees and in the
  worktree). Plain writes (O_TRUNC) still succeed — this prereg was
  written that way. The heartbeat will be retried when the flap
  clears; a stale registry heartbeat during a flap is not evidence
  the run is dead (AGENTS.md flap lesson). One probe leftover file
  (`__probe__xbh3a2tu`, 0 bytes, created by the failed probe itself)
  was removed by hand; the worktree is clean apart from this prereg.
