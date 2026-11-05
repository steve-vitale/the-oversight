# Pre-registration — arm sim-killersim2-b (Loop B run fleshout-loop-b-20261105T1322Z)

DIAGNOSTIC ONLY, zero src/js game changes, no policy variant, no
gate/price/deed/readyDemand/VETSHAPE change. This arm takes the
0915Z run's blank (2): its metric review REQUIRES this run to say
HOW it will get >= 4 banking seeds BEFORE running, and requires
>= 2 wave-4 kills for M3 (clustering).

## Canon note (read first, per the brief)

docs/CANON.md was read first, then docs/MONSTER-WAVES.md (Wave 4/5
sections + "Combat readiness gates the standing unlock"). The rule
this arm measures: wave 5 needs 2 living villagers with a wave-4+
kill in `state.waveKillLog` (readiness bar VETERANS,
`Game.waveCombatReadiness(5)` in src/js/standing.js); the wave-4
bar needs 1 such veteran. No canon doc covers killer simultaneity
as a process. Mechanism claims cite code, not invented canon:
`recordWaveKill` / `scoreLedgerKill` (src/js/waveLedger.js),
`removeVillager(vid, how)` (src/js/betrayal.js — the one removal
choke point), the readiness veteran read (living roster members
with a wave-(w-1)+ kill).

## Question

KILLER SIMULTANEITY RE-MEASURE with a banking screen. Prior
evidence (context only, not this arm's verdict):
- killersim-a (0915Z, fresh band 99211–99218): UNDERPOWERED —
  only 2/8 fresh seeds bank even one wave-4 killer; 0 days with
  >= 2 living killers; first-killer exit n=1, 10d; M3 vacuous at
  n=1.
- standaccum2-b (16 seeds 99111–99126): two living wave-4
  killers NEVER COEXIST; first-killer survival median 11d.
- winnability-round-0430 / secondkiller-b: 3 kills in 58 wild
  wave-4 fights, every kill a first blood, 0/19 after first
  blood; only 1/58 fights while a first killer lived; 2 of 3
  killers died within a day of first blood (contest/arena).
- killerdeath-b (retention probe): 0/8 pairs on baseline and
  0/8 on retention; retained killers died at home (arena,
  expedition).

## HOW this run gets >= 4 banking seeds (required by the 0915Z metric review)

VOLUME, not a lever. No policy variant, no manufactured second
killer, no horizon change: the screen is 32 fresh seeds at the
measured banking rates. Prior banking rates (seeds with >= 1
wave-4 killer, competent verbatim, 150d): killersim-a 2/8
(25%), standaccum2 6/16 (37.5%), standaccum3 2/8 (25%),
killerdeath baseline 3/8 (37.5%). The banking definition below
is stricter than killersEver >= 1 (same-day kill-and-die does
NOT bank), so plan on the LOW end: at p=0.25, 32 seeds expect
8 banking seeds and P(< 4 banking) is ~0.6% (binomial n=32,
p=0.25: P(X<=3) = 0.006); even at p=0.20 the expectation is 6.4
and P(< 4) is ~5.5%. If fewer than 4 bank anyway, the verdict
is UNDERPOWERED per the rule below — the band is NEVER widened
post-hoc to chase the number, and no seed outside 99311–99342
is judged.

## Corpus

- Fresh band: 99311–99342 (32 seeds). Freshness verified by
  exact whole-token grep BEFORE any judged sim (see Freshness
  check below): no 99311–99342 token in any dated prereg
  (evidence/*/sim-*-prereg.md), no 99311–99342 token in any
  dated evidence .md, and no 993xx band in use beyond the
  neighbouring 99301–99308 (askplus/diplo/linkseek, 2026-11-04
  preregs). The only whole-token 99311–99342 hits anywhere are
  old-Oct JSON corpora values that are NOT seeds (pantry kcal /
  meal-take counts / policy-call means — e.g. "pantry":99318,
  "mealTakes":99320, "cumTakes":99312, "meanPolicyCallsPerDay":
  99330.9, "pk":99341), verified by context. Never reuse
  991xx/992xx/996xx/897xx/736xx bands.
- Policy: competent policy VERBATIM, default env, no
  policy-side lever. Instrument reused verbatim:
  scripts/killersim-instrument-20261105.js (secondkiller base +
  exit tracking: finalize copies exiles; snapshots carry
  livingKillersDerived / engineVets / ready5). Driver reused
  verbatim via env vars (OUTDIR=perseed-killersim2-b,
  RUN=killersim2-screen).
- Horizon: 150d death-aware (dead villages stop simulating,
  +10d tail max), same as killersim-a / standaccum2 /
  killerdeath / secondkiller.
- Staged (MEASUREMENT.md §§9–12): PILOT GATE first — the first
  8 screen seeds (99311–99318) run and are checked for
  instrument errors (0 required) plus the determinism and
  off/on-neutrality legs before the remaining 24 seeds are
  spent. The 32-seed screen IS the measurement; no 12–16 seed
  confirm is pre-registered (a confirm would be a NEXT run's
  decision on a GO).
- The analyzer reads the fresh corpus only for judged numbers.
  The 99211–99218, 99111–99126, 99191–99198, 99151–99158,
  99131–99138 corpora are CONTEXT ONLY, never the verdict. Do
  NOT re-judge them as this arm's verdict.

## Freshness check (run 2026-11-05, before this prereg was committed)

- `grep -rEoh '\b993[0-9]{2}\b' evidence/*/sim-*-prereg.md`:
  only 99301 (x5) and 99308 (x5) — in
  evidence/2026-11-04/sim-askplus-a-prereg.md,
  sim-diplo-b-prereg.md, sim-linkseek-b-prereg.md. No 99311+
  token in any dated prereg.
- Per-seed loop over 99311–99342 against
  evidence/*/sim-*.md and sim-*-prereg.md: zero hits.
- Same tokens against evidence/ --include='*.json': 10 files
  hit, every one verified by context to be a non-seed number
  (pantry/meal-take/policy-call values, listed under Corpus
  above). No JSON hit is a seed.

## Definitions (fixed before any judged sim)

- Killer: vid with >= 1 wave-4+ kill in waveKillLog. First
  killer: earliest firstDay; ties broken by log order.
- BANKING SEED (new, fixed here): a seed banks iff >= 1 wave-4
  kill occurs AND the killer is alive at end of the kill day —
  i.e. at least one killer has exitDay == null OR exitDay >
  firstDay, where exitDay = earliest of (fallen deathDay >=
  firstDay, exiles exitDay >= firstDay). A same-day
  kill-and-exit (exitDay == firstDay, survivalDays 0) does NOT
  bank: the killer was never a living veteran on any day. This
  is the vetprod same-day rule applied to the banking
  definition itself.
- Living on day d: firstDay <= d AND (exitDay null OR d <
  exitDay). L(d): count of killers living on day d, derived per
  snapshot day from fates. L>=2 day: L(d) >= 2. Sustained
  stretch: >= 7 CONSECUTIVE snapshot days with L>=2.
- Fate (per killer, single label, earliest exit wins):
  'still-living', 'died-in-fight', 'died-away', 'exiled',
  'left:<how>' — killersim-a's definitions, unchanged.
- First-killer survival: exitDay - firstDay (death and exile
  both end survival). Censored (still living at village end)
  first killers are reported separately and EXCLUDED from the
  median (median over observed exits only; reported only if
  >= 3 observed exits exist).
- POST-BLOOD DEATH CHANNEL (new, per killer death): derived
  from the killerdeath split vocabulary
  (`deathCauseSplit`), never from the unsplit 'the wild'
  residual:
  - 'contest/arena' — split is 'scholar-death:arena:...' or
    names a contest (causeArg 'arena' / 'contest').
  - 'wild' — split starts 'monster:' (a monster killed them
    in a fight), or 'scholar-death:the wild:...', or the
    unsplit residual 'the wild (unsplit residual)' (counted
    inside wild but labelled residual, never cited as a cause).
  - 'other' — everything else with its split quoted:
    'scholar-death:the expedition:...' (expedition — the
    killerdeath follow-up question), any other raw cause, or
    'unknown (no fallen entry)'.
  A killer who leaves ('exiled' / 'left:<how>') has no death
  channel and is reported under fates, not channels.
- M3 CLUSTERS (guard carried over from the 0915Z metric
  review): requires >= 2 wave-4 kills on the seed — at n=1
  the pattern is vacuous and is reported as "only one
  villager ever killed", not as clustering. Full form: one
  killer holds >= 2/3 of the seed's wave-4 kills AND >= 2
  other distinct fighters fought wave-4 without a kill.
- Readiness-5-ready day: snapshot day with readiness5.ready
  true. Release day: L>=2 AND gated >= 200 AND ready
  (secondary only — this arm does NOT judge release).

## Candidate mechanisms (stated before any judged sim)

The four killersim-a patterns, judged on BANKING seeds only,
with M3's n>=2 guard:
- M1 DIES-FAST: first killer's survival after banking <= 14d
  (observed exit, not censored).
- M2 NEVER-ARRIVES: the seed banks exactly 1 killer ever
  DESPITE >= 5 wave-4 fights.
- M3 CLUSTERS: as defined above (requires >= 2 wave-4 kills).
- M4 MADE-LATE: first kill within the last 30 days of the run
  (firstDay >= endDay - 30).

## Stage 2 measures (banking subset only)

- M1 — days with >= 2 living killers: count per banking seed,
  seeds with any L>=2 day, longest L>=2 run.
- M2 — first-killer survival: observed exit intervals + median
  (only if >= 3 observed), censored count; all-killer
  intervals listed.
- M3 — second-killer production: banking seeds with >= 2
  killers ever; wave-4 fights and kills AFTER first blood
  (fights with day > first killer's firstDay) and the
  post-first-blood kill rate, per banking seed and pooled.
- M4 — ready days: readiness-5-ready days per banking seed.
- Death channels: per dead killer on banking seeds, the
  channel above (contest/arena vs wild vs other) with counts.
- Secondary (all reported, none judged): per-seed table for
  all 32 screen seeds (days, end, unlockedWave, w4 fights,
  w4 kills, w4 kill rate, killers ever, banking?, maxLiving,
  days L>=2 / L==1, longest L>=2 run, first-killer survival,
  ready days, release days, killer fates + channels);
  cross-check mismatches between derived L(d) and engine
  veterans per snapshot day (reported, not silently resolved);
  analyzer peak rule: peaks initialize to 0, not null.

## Pre-registered metrics (binding — a miss is NO-GO, never re-scored)

- PRIMARY: among BANKING seeds, the count with >= 1 day
  L>=2 — PLUS the identified mechanism (named pattern M1–M4
  with a code citation and a quoted trajectory).
- Verdict DIAG-GO iff ALL: (i) the screen is powered — >= 4
  banking seeds; AND (ii) the gap is confirmed on the banking
  subset — L>=2 days on <= 1 banking seed; AND (iii) >= 1
  candidate mechanism (M1–M4) holds in its pre-stated
  quantitative form on >= 1 banking seed, with a quoted
  trajectory and a code citation. (A mechanism-shaped seed
  that fits NO pre-stated pattern is reported as a second
  mechanism and does NOT satisfy (iii).)
- Verdict DIAG-NO iff the banking subset shows two living
  killers coexisting for sustained stretches (>= 7 consecutive
  snapshot days with L>=2) on >= 2 banking seeds, with no
  binding mechanism visible — i.e. pairs coexist and
  simultaneity is not the binding gap. (If exactly 1 banking
  seed shows a sustained pair and no mechanism holds, the
  verdict is UNDERPOWERED, not DIAG-NO.)
- UNDERPOWERED iff fewer than 4 banking seeds — simultaneity
  cannot be judged on a screen that barely banks killers; the
  simultaneity counts are still reported, but no GO/NO verdict
  is claimed. UNDERPOWERED also covers: gap confirmed but no
  named mechanism reproduced, and any other non-discriminating
  band shape.
- INSUFFICIENT-DATA iff > 2 of the 32 screen seeds carry
  instrument errors (same rule as killersim-a / standaccum2,
  scaled to the screen).
- FIRST-KILLER-SURVIVAL RE-MEASURE (secondary, reported not
  judged): median first-killer survival on the banking subset
  (observed exits only) vs 11d (standaccum2), 9d (postblood),
  10d (killersim-a n=1). A median is reported only if >= 3
  observed exits exist; otherwise the intervals are listed
  and no median is claimed.
- REPRODUCTION / SANITY (not judged): instrument errors must
  be 0 on judged seeds; the driver must reproduce the
  determinism property on a short leg (same seed twice, same
  summary) and on/off neutrality (instrument-off run does not
  change the trajectory summary at 30d). Balanced panel (§15):
  INAPPLICABLE for a pure diagnostic on a fresh band with no
  before/after comparison — stated, not fabricated.
- INSTRUMENT ERRORS: 0 required on all judged seeds for a
  clean verdict; the verdict degrades per the rule above
  otherwise.

## Sense-testing

At least one villager transcript/dialogue sample read from this
arm's own corpus and judged for meaning (not counts): for the
banking seed closest to a pair (or the seed with the
longest-lived first killer if none pairs), quote what the
village is TOLD about its veterans — the "veteran kill"
cheers, the readiness hold beats — and judge whether the story
makes sense for a village whose killers die or leave before a
second one is ever made. If retained veterans die away from
combat (the open backlog item: "THE EXPEDITION" deaths landing
on at-haven scholars), note it and move on — do NOT chase it.

## What this arm will NOT do

No mechanics change, no lever build, no gate/price/demand
change, no VETSHAPE flip, no re-judging of 99211–99218 /
99111–99126 / 99191–99198 / 99151–99158 / 99131–99138, no
retention probe (killerdeath already ran it), no rebuild of
the ability-use follow-up (main-session owned). If the finding
motivates a lever, it is NAMED in the evidence as a next-arm
proposal only. The release question stays a future arm's
question — this arm pre-registers release days only as a
secondary count.
