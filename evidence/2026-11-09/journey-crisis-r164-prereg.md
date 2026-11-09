# Journey crisis r164 — PREREGISTRATION (Lane B, leg 6, written before any scored seed)

Leg 6 (crisis). Rotation-b reads 6 at run start (written by the r163-social
closeout 2026-11-09 ~17:04Z; the r156 closeout's 7-write was superseded by
r163's later 6-write — the file is the authority, and 6 is this run's leg);
this run writes 7 (succession next) at closeout. Run number: r164 follows
crisis r156 (landed 2026-11-08/09) and social r163 (landed 2026-11-09).
Base: master 2215e22d4 (r117 establishment adoption closeout). Lock:
playtest-loop-2.lock run_id 2026-11-09T17:55:36Z. Worktree slug:
journey2-crisis (branch journey2-crisis).

## Base movement since r156's panel — NOT a pure re-measurement

Master moved db7fb1c6a → 2215e22d4 (106 commits). Game-code changes in
range (src/, 8 files, +311/−42): conversation.js +122 (the r156 no-words
foreign-dedupe fix itself, f496b0072; the r163 coach prior-deflect
no-repeat fix, 5e190b6ef; the r120 secret-response fix, b98ac0730 —
a villager's confession now gets an answer); convo-wants.js +16 (r163);
fieldFights.js +51 (fightblend numerator-aware fight judgment,
ecf3ff60d); food.js +22; game.js +86 (wideduty 48c93b22b — medic duty
widened to trained villagers, duty-held 61%→88%; sametick 9aeb78712 —
same-tick duty-cure recorder fix; tenddrive re-apply 9d7323b69 —
win-plan tend leg runs while national, cap 55; r121 curious
first-reveal guard ae7daf40c); progression.js +23 (r116 specialist
rung steepening); truth.js +18 (r163); villager-agency.js +15 (r161
place-line fix). Cross-panel deltas r156→r164 are CONFOUNDED by these
landings — the panel judges the current base on its own bars and
carries the counts forward; it does not claim a clean before/after on
any one landing. Canon read this run: docs/CANON.md + docs/DISEASES.md
(two pools; the medic-duty cure channels are mundane medicine for
mundane disease — no canon conflict).

## Seed-band freshness check (skill: local_seed_band_freshness)

- Band 14101–14105. Searched: all dated preregs
  `evidence/*/sim-*-prereg.md` and `evidence/*/journey-*-prereg.md`
  (grep for 14101…14105 and 1411x: zero seed hits); goal hidden_files
  preregs (zero hits); the single "1410x" hit anywhere is commit hash
  3f14110d1 in evidence/2026-11-05/journey-scale-r99-prereg.md — a
  base SHA, not a seed assignment (false positive). Forbidden bands
  named in preregs (73641–73648, 73671–73678 per sim-fullseat-recheck-a
  / sim-trajband-a; 99201–99208 per the standacc forbidden list;
  78201–78208 per sim-fullseat-recheck-a): no intersection. Band is
  fresh.
- Collision notes (carried): 13901–13905 used by crisis r156.
  13801–13805 used by crisis r155. 13701–13705 USED (13703 named in
  sim-lackingline4-b-prereg.md, 2026-10-29). 13501–13505 used by
  crisis r154. 13101–13105 stays skipped (13100 named as a
  conditional screening start in sim-woodcarry3-b-prereg.md,
  2026-10-29). 42701–42704 used by social r159; 42101–42104 stays
  collided.

## Leg questions

1. Q1 MISSED-WINDOW SPLIT (PRIMARY, from r156 metric review): the
   corrected count conflates two mechanisms — valve-expiry (the
   player waited in place and the set's moved-on valve fired) vs
   drawn-off (the player was pulled away; a choice/consequence, not
   a miss). r156 post-fix: corrected 18 / per-day 11 (12
   valve-expiry, 6 drawn-off, hand-tallied). This run the analyzer
   prints the split as a first-class output. Question: does the
   valve-expiry subset stay high on fresh seeds — is the 5-tick wait
   routinely defeated by the moved-on valve? Report valve-expiry
   count + valve-expiry per-day alongside corrected / per-day. No
   GO/NO-GO on the count; valve-expiry per-day >= 8 files it as a
   game-design finding (the wait is being defeated), not an
   instrument finding.
2. Q2 MEDIC DUTY CENSUS (from r156 metric review): the r156 census
   read the raw v.medicDuty field (stale after death — 13905's
   "holder Fatima, holderAlive false") and recorded no assignment
   span or stash state, so the 0-medicine-cures finding could not be
   attributed. This run: (a) holder span — first/last day per holder
   id, sampled once per iteration from the LIVE Game.medicDutyHolder()
   (pure reads; the function documents itself as trajectory-neutral
   for recorders); (b) census holder read via the live
   medicDutyHolder(), not the raw field; (c) Haven stash pharmacy at
   census — total doses by medType from Game.stashState().medicine.
   Wideduty landed since r156 (duty-held 61%→88%), so blocked
   departures should be > 0 wherever a holder is assigned.
   Descriptive + canary: the holder dies on a sortie, or blocked
   stays 0 while a holder is assigned.
3. Q3 VOICELINE PREFIX STACKING (r155 filed #1; r156: 2 sightings —
   third panel): voiceLine discourse prefixes stacking on the
   reframe/body ("Tell you what — Like I said —"). If it recurs >= 3x
   in the C3 read, it GRADUATES to a fix in-run (same proof
   discipline as Q1 in r156: RED on unfixed, GREEN on fixed).
4. Q4 FIGHT-1 THRESHOLD (SETTLED in r156, carried): clears are
   ret.cleared (vKill or mFlee on at least one lingerer), breaks open
   on vFlee/vDie. Report the frame again; the vTaken>=~70 break
   clause stays UNTESTED in isolation (every >=70 break also opened
   vFlee) — keep it marked untested, do not drop it silently.
5. MULTI-MONSTER SET CLEAR (carried): r154 8/12, r155 3/4, r156
   pre 4/9, r156 post 7/14. Count question, no GO/NO-GO bar.
6. G-ID watch: thirteen panels at zero id-matched gorge-after-clear.
   Fourteenth panel at zero keeps the watch open, not closed.
7. Naming-stance wobble watch (three sightings; r156: no fourth):
   a fourth sighting in the C3 read GRADUATES it to a fix item.
8. BENCH (DROPPED TO WATCH per r156 metric review): third straight
   panel with 0 alive-bench refusals — refusals only ever come when
   the bench is already bare, so the instrument cannot answer the
   nodeAway question. Report the refusal shape only; no longer a
   panel question.
9. C7b (REVISED BAR, keep): the bar is "buried list reported" — the
   candle cross-check prints the buried dead (say-line names absent
   from the corpse list) per seed.
10. Q10 RECAP-QUOTE GLITCH (r156 filed #1, PRIMARY FIX CANDIDATE):
    the recap re-serves a prior NPC closer WITH its stage direction
    inside quotes — Rocco d10 ("'You're a good listener, you know
    that? A tired smile.'") and Jordan d26 ("'You say nothing.
    Neither do they, for a while — and it's fine.'"). The NPC appears
    to quote the narrator. Question: does it recur on current master?
    (conversation.js moved twice since r156 — the r163 coach fix and
    the r120 secret-response fix — so it may already be gone.) If
    >= 2 sightings in the C3 read, root-cause + fix in-run with
    proof discipline (RED on unfixed, GREEN on fixed; affected
    seeds re-run post-fix per the Q1 rule). If 0 sightings, record as
    possibly-fixed-by-passing-change and do NOT re-fix.
11. Q11 FILED-ITEM RECURRENCE (descriptive): betrayal-investigation
    empty beats ([betrayal:site] "The ground remembers." 5x,
    [betrayal:witnesses] "Names, named." 4x in r156) and
    naming-debate vote dangles ("What's your vote?" asked, vote never
    cast). Report recurrence counts in the C3 read; filed, not fix
    candidates this run unless trivial and proven.

## Instrument changes (this run, before any scored seed)

- Driver: r156 driver verbatim EXCEPT r164 filenames/paths/seeds
  (14101–14105), ORIGINS Seattle/Boston/Austin/Chicago/Phoenix
  (kept — the origin-varying instrument stays; keeping the same five
  cities keeps panels comparable), the W1 carried count (66/4/4/1,
  unchanged), and EVID path 2026-11-09, PLUS two additive recorders
  (pure reads, no game mutation): (a) medic-duty span sampler — once
  per main-loop iteration, after `rec.days = d`, sample
  Game.medicDutyHolder() and accumulate first/last day per holder id
  into rec.medicDutySpans; (b) census medicDuty read via the live
  medicDutyHolder() + Haven stash pharmacy doses by medType from
  Game.stashState().medicine, alongside the existing blocked/cures
  counters.
- Analyzer: r156 analyzer verbatim EXCEPT r164 filenames/paths and
  the R156→R164 section labels (BENCH, muster-size, fight-1, W1
  carried count, SOFTLOCK), PLUS: (a) missed-window split — the
  corrected `missedKept` rows grouped by drift label (valve-expiry
  'moved-on-valve' vs drawn-off 'player-drawn-off' vs other) with
  per-day counts for each subset; (b) medic-duty census print —
  spans + live holder + stash medicine + cures per seed.
- Analyzer validated on r156's post-fix JSONs before the panel:
  carried numbers reproduce exactly (attempts 21, ok 19, refused 2,
  corrected 18, per-day 11, C7b buried lists per seed).
- Determinism proof (before judging the panel): re-run seed 14101
  with the r164 driver and require the panel JSON byte-identical to
  its first run and transcripts identical. If the JSON differs, the
  instrument is NOT trajectory-neutral: stop, diagnose, do not judge
  the panel.

## Panel (binding)

- Policy oracleV2, 120d death-aware +10d tail, 5 seeds 14101–14105,
  sequential. NO pilot gate: the 5-seed panel IS the minimum
  instrument for the primary Q1 question (r155 metric review via
  r156 — a 3-seed pilot would be knowingly under-instrumented).
- Smoke first: SEED=14101 DAYS=5 into a scratch subdir, driver wrap
  runs, no instrumentErrors.

## Pre-registered bars (binding, §14)

- C1 (bend, not break) GO: every game-over has a named cause that is
  NOT a siege-mechanic failure; horizon reachable on at least 1 seed
  is descriptive, not a bar. A softlock seed is a C1 failure of the
  freeze kind, not a game-over cause: report it separately; if a fix
  lands and the re-run advances, the re-run replaces the frozen
  record.
- C2 (episodes fire + gates hold) GO: raids fire on all seeds; fought
  resolutions present; D1 snapshots all delayed >= 3 attempts;
  deltaBad empty; D3 drift unknown = 0. MISSED-WINDOW (corrected
  count) is descriptive, never folded into C2 — but corrected >= 8
  this panel still triggers the instrument look (the split now
  answers it).
- C2b (linger-conditional gorge/sortie) GO: every boundary-firable
  case fires or is refused with a recorded reason; no boundary-firable
  case unfired. W1 itself has no GO/NO-GO bar: it is a count question.
- BENCH (watch only): report refused sorties by musterAvailable and
  living bench; name the lever shape if one covers >= 80% of
  refusals; otherwise report "mixed, no single lever" AND the
  majority shape and any ruled-out shape.
- C3 (people check) GO: all driven transcripts read in full;
  fabricHits = 0; conversations meet the meaning bar (NPC wants
  something, options engage/deflect, endings resolve/plant/owe). A
  fourth naming-stance wobble sighting graduates it to a fix item
  (filed, not fixed here unless the fix is trivial and proven). The
  no-repeat driver fix is judged by the transcript scan: zero
  unforced consecutive repeats in the judged panel. VoiceLine prefix
  stacking >= 3 sightings graduates to a fix in-run. Recap-quote
  glitch >= 2 sightings graduates to a fix in-run.
- WRAP-CHECK GO: analyzer WRAP section reports unmarked = 0 across
  all driven transcripts. A NO-GO here is an instrument finding, not
  a game defect, unless an unmarked transcript is also senseless on
  the C3 read.
- C7b (instrument, REVISED BAR) GO: the buried list is reported per
  seed (say-line names absent from the corpse list); corpse-cause
  counts are reported for famine/disease/wound/thirst. "Tallies
  match" is NOT the bar (candle partial by design).
- Interesting finding (panel triggers, §9): Q1 valve-expiry per-day
  >= 8; a medic-duty canary (holder dies on a sortie, or blocked 0
  while a holder is assigned); Q10 or Q3 graduating; a fourth
  naming-wobble sighting; gate-one-short hits >= 80% of refusals
  (naming the lever by the prereg's own rule); corrected
  missed-window stays >= 8; C7b buried list empty on a seed with
  buried dead in the say lines (instrument finding); horizon 0/5 or
  5/5; a second same-set re-muster (pattern, not fluke).

## Telemetry

- Metrics: defendedFights, playerFights, latelyDefenseCount vs
  baseline telemetry-baselines/crisis.json. LOUD lines are same-run
  investigation items before any baseline roll; baseline NOT rolled
  on a single panel's variance.
