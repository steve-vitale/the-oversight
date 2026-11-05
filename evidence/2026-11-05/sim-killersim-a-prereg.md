# Pre-registration — arm sim-killersim-a (Loop A run fleshout-20261105T0915Z)

DIAGNOSTIC ONLY, zero src/js game changes, no policy variant, no
gate/price/deed/readyDemand/VETSHAPE change. This arm takes the
winnability-chain premise as restated by standaccum3-b (its "Premise"
section) and by the coordinator brief: the funnel sits at ~1 village
in 20 banking two LIVING wave-4 killers, and the release question
stays unobservable until two killers coexist.

## Canon note (read first, per the brief)

docs/CANON.md was read first. docs/MONSTER-WAVES.md (Wave 4/5
sections + "Combat readiness gates the standing unlock") states the
rule this arm measures: wave 5 needs 2 living villagers with a
wave-4+ kill in `state.waveKillLog` (readiness bar VETERANS,
`Game.waveCombatReadiness(5)` in src/js/standing.js), and the wave-4
bar needs 1 such veteran. The MECHANISM (why two living killers
rarely coexist) lives only in code: `recordWaveKill` /
`scoreLedgerKill` (src/js/waveLedger.js — kills score the ledger),
`removeVillager(vid, how)` (src/js/betrayal.js — the one removal
choke point; `how === 'exiled'` fires the schism crisis and pushes
`state.village.exiles` `{vid, day, how}`; `how === 'killed'` pushes
the fallen entry `{villagerId, day, cause, monsterId, monsterName}`
in src/js/game.js), and the readiness veteran read (living roster
members with a wave-(w-1)+ kill). No canon doc covers killer
simultaneity as a process. This arm cites code, not invented canon,
for every mechanism claim.

## Question

KILLER SIMULTANEITY — how often do two living wave-4 killers
coexist, and how long does the first killer survive after banking?
Prior evidence (context only, not this arm's verdict):
- standaccum2-b: first-killer survival after banking, median 11d.
- postblood-b: same median re-measured 9d.
- standaccum3-b fresh band 99191–99198: 0/8 seeds ever held two
  living wave-4 killers; the two seeds that banked 2 killers ever
  (99195, 99198) did so strictly sequentially, maxLiving 1.
- killerdeath-b: retention probe kept scholar-killers alive much
  longer and still produced no pair — the second killer never
  arrived on most seeds.
- secondkiller-b: 3 kills in 58 wild wave-4 fights (5.2%); every
  kill a first blood; after first blood the kill rate is 0/19.

## Corpus

- Fresh band: 99211–99218 (8 seeds, verified free — no 99211–99218
  token appears in any evidence/2026-11-05/*.md or any perseed-*
  filename; neighbouring bands in use are 99191–99198
  (standaccum3) and 99151–99158 (secondkiller)).
- Policy: competent policy VERBATIM, default env, no policy-side
  lever. Same substrate as secondkiller-b (instrument reused
  verbatim where it fits; extended below with exit tracking).
- Horizon: 150d death-aware (dead villages stop simulating, +10d
  tail max), same as vetprod / standaccum2 / standaccum3 /
  killerdeath / secondkiller.
- Pilot gate: the 8-seed fresh band IS the pilot (this is a
  diagnostic; no confirm spend is pre-registered — a confirm would
  be a NEXT run's decision on a GO).
- Fresh runs: the killersim driver runs all 8 fresh seeds and
  writes evidence/2026-11-05/perseed-killersim-a/. The analyzer
  reads this fresh corpus only for judged numbers. The
  99191–99198, 99151–99158, 99131–99138 corpora are CONTEXT ONLY,
  never the verdict. Do NOT re-judge them as this arm's verdict.

## Recorder (daily, per seed)

Secondkiller instrument reused verbatim where it fits (fight
wrappers for wave-4+ fights, recordWaveKill killsLive rows,
playerDeath context, daily snapshots with readiness5, killerTrack,
finalize copies of waveKillLog + fallen + wavesFaced + scaleRank +
unlockedWave + deadMap), EXTENDED with exit tracking — the one
thing no sibling instrument records:

- finalize ALSO copies `state.village.exiles` (array of `{vid,
  day, how}` — the removal choke point's record of every
  non-death exit, including 'exiled', 'fled', 'splinter',
  'relay', 'ambushed', 'left').
- snapshot ALSO appends live derived fields to that day's entry:
  `livingKillersDerived` (L(d) by the vetprod rule, but with
  exitDay = min(deathDay, exileDay) — an exiled killer is no
  longer a living roster veteran, so the interval ends at exit),
  `engineVets` (readiness5.veterans at snapshot time),
  `ready5` (readiness5.ready), `scholarAtHaven`.
- killsLive rows are authoritative for kill events (day, mid,
  wave, by, via, scholarChannel); waveKillLog is authoritative
  for kill counts (analyzer cross-checks liveRows vs log kills
  per killer and flags any mismatch, never silently fills).

## Definitions (fixed before any judged sim)

- Killer: vid with >= 1 wave-4+ kill in waveKillLog. First
  killer: earliest firstDay; ties broken by log order.
- Living on day d: firstDay <= d AND (exitDay null OR d <
  exitDay), where exitDay = earliest of (fallen deathDay >=
  firstDay, exiles exitDay >= firstDay). Same-day kill-and-die /
  kill-and-exit contributes to NO day (vetprod rule).
- L(d): count of killers living on day d, derived per snapshot
  day from fates. L>=2 day: L(d) >= 2. Sustained stretch: a run
  of >= 7 CONSECUTIVE snapshot days with L>=2.
- Fate (per killer, single label, earliest exit wins):
  - 'still-living' — no deathDay and no exileDay (alive at
    village end; deadMap cross-check where known).
  - 'died-in-fight' — deathDay present AND (fallen entry
    monsterId/monsterName present OR fallen cause == 'combat' OR
    scholarDeath context inCombat on the death day).
  - 'died-away' — deathDay present and none of the above
    (includes the 'the wild (unsplit residual)' label, which is
    reported as a residual count, never cited as a cause — the
    killerdeath rule).
  - 'exiled' — exileDay present, earlier than any deathDay, with
    exiles how == 'exiled'. Other non-death removals
    ('fled'/'splinter'/'relay'/'ambushed'/'left') are labelled
    'left:<how>' and reported separately, never folded into
    'exiled'.
- First-killer survival: killToDeathDays for the FIRST killer
  (exitDay - firstDay; death and exile both end survival — a
  killer who leaves is no longer a living veteran). Censored
  (still living at village end) first killers are reported
  separately and EXCLUDED from the median (median over observed
  exits only); the censored count is stated alongside.
- Kill clustering: one killer holds >= 2/3 of the seed's wave-4
  kills AND >= 2 other distinct fighters fought wave-4 (fight
  records) without a kill.
- Made-late: firstDay within the last 30 days of the run
  (firstDay >= endDay - 30, endDay = last snapshot day).
- Readiness-5-ready day: snapshot day with readiness5.ready
  true. Reported as a count and as a day list; release days
  (L>=2 AND gated>=200 AND ready) are reported as secondary
  only — this arm does NOT judge release.

## Candidate mechanisms (stated before any judged sim)

Four pre-stated patterns; the verdict needs at least one to hold
in its quantitative form on a fresh seed with a quoted
trajectory and a code citation. A pattern that fits no fresh seed
is reported as REFUTED on this band, not reworded afterwards.

- M1 DIES-FAST: the first killer's survival after banking is
  short — killToDeathDays <= 14 on the seed (observed exit, not
  censored). Code: the death block (game.js hurtVillager path)
  and removeVillager choke point (betrayal.js) — the killer
  leaves the roster by death or exile, and the readiness bar
  reads living roster only.
- M2 NEVER-ARRIVES: the seed banks exactly 1 killer ever
  (killersEver == 1) DESPITE >= 5 wave-4 fights (exposure
  present, production absent). Code: secondkiller-b already
  showed the kill rate after first blood is 0/19 — the second
  kill is the rare event, not the second survival.
- M3 CLUSTERS: kills cluster on one villager — one killer holds
  >= 2/3 of the seed's wave-4 kills AND >= 2 other distinct
  fighters fought wave-4 without a kill. Code: kills score the
  ledger per killer (waveLedger.js); nothing spreads them.
- M4 MADE-LATE: the first kill lands within the last 30 days of
  the run (firstDay >= endDay - 30), leaving no runway for a
  second killer to be made and survive alongside. Code: wave-4
  unlock itself is standing-gated (standing.js), so the first
  kill can only come late in a run that opens wave 4 late.

## Pre-registered metrics (binding — a miss is NO-GO, never re-scored)

- PRIMARY: per-seed simultaneity — days with L>=2, days with
  exactly L==1, maxLiving, killers ever, first-killer survival
  (observed + censored), readiness-5-ready days — PLUS the
  identified mechanism (named pattern M1–M4 with a code citation
  and a quoted trajectory).
- Verdict DIAG-GO iff BOTH: (i) the gap is confirmed on the
  fresh band — L>=2 days on <= 1/8 seeds (if 2+ seeds hold pairs,
  the gap is not the story); AND (ii) >= 1 candidate mechanism
  (M1–M4) holds in its pre-stated quantitative form on >= 1
  fresh seed, with a quoted trajectory and a code citation. (A
  mechanism-shaped seed that fits NO pre-stated pattern is
  reported as a second mechanism and does NOT satisfy (ii) — the
  verdict on the named patterns is DIAG-NO with the new pattern
  named.)
- Verdict DIAG-NO iff the fresh band shows two living killers
  coexisting for sustained stretches (>= 7 consecutive snapshot
  days with L>=2) on >= 2/8 seeds, with no binding mechanism
  visible — i.e. pairs coexist and simultaneity is not the
  binding gap. (If exactly 1 seed shows a sustained pair and no
  mechanism holds, the verdict is UNDERPOWERED, not DIAG-NO.)
- UNDERPOWERED / INSUFFICIENT-DATA: INSUFFICIENT-DATA iff > 2
  seeds carry instrument errors (same rule as standaccum2).
  UNDERPOWERED iff fewer than 4 fresh seeds bank >= 1 wave-4
  killer — simultaneity cannot be judged on a band that barely
  kills wave 4; the simultaneity counts are still reported, but
  no GO/NO verdict is claimed.
- SECONDARY (all reported, none judged): per-seed table — days,
  end, unlockedWave, w4 fights, w4 kills, w4 kill rate, kills
  per killer (distribution + max share), killers ever, maxLiving,
  days L>=2, days L==1, longest L>=2 run, first-killer
  survival (observed/censored), all-killer killToDeath
  intervals, readiness-5-ready days, release days, killer
  fates (counts by fate label + per-killer rows with day/via/
  cause-split/exit), cross-check mismatches between derived
  L(d) and engine veterans per snapshot day (death-day boundary
  and banking-day lag are reported, not silently resolved, per
  standaccum2/3 metric review); analyzer peak rule: peaks
  initialize to 0, not null.
- FIRST-KILLER-SURVIVAL RE-MEASURE (secondary, reported not
  judged): median first-killer survival on the fresh band
  (observed exits only) vs 11d (standaccum2) and 9d
  (postblood). A median is reported only if >= 3 observed
  exits exist; otherwise the intervals are listed and no median
  is claimed.
- REPRODUCTION / SANITY (not judged): instrument errors must be
  0 on judged seeds; the driver must reproduce secondkiller's
  determinism property on a short leg (same seed twice, same
  summary) and on/off neutrality (instrument-off run does not
  change the trajectory summary at 30d). Balanced panel (§15):
  INAPPLICABLE for a pure diagnostic on a fresh band with no
  before/after comparison — stated, not fabricated.
- INSTRUMENT ERRORS: 0 required on all judged seeds for a clean
  verdict; the verdict degrades per the rule above otherwise.

## Sense-testing

At least one villager transcript/dialogue sample read from this
arm's own corpus and judged for meaning (not counts): for the
seed closest to a pair (or the seed with the longest-lived first
killer if none pairs), quote what the village is TOLD about its
veterans — the "veteran kill" cheers, the readiness hold beats —
and judge whether the story makes sense for a village whose
killers die or leave before a second one is ever made. If
retained veterans die away from combat (the open backlog item:
"THE EXPEDITION" deaths landing on at-haven scholars), note it
and move on — do NOT chase it.

## What this arm will NOT do

No mechanics change, no lever build, no gate/price/demand
change, no VETSHAPE flip, no re-judging of 99191–99198 /
99151–99158 / 99131–99138, no retention probe (killerdeath
already ran it), no rebuild of the ability-use follow-up
(main-session owned). If the finding motivates a lever, it is
NAMED in the evidence as a next-arm proposal only. The release
question stays a future arm's question — this arm pre-registers
release days only as a secondary count.
