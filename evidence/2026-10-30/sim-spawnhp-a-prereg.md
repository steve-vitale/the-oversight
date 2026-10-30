# sim-spawnhp-a — PREREGISTRATION (binding, committed BEFORE any judged analysis)

Run: flesh-out loop, run fleshout-20261030T0738Z (coordinator-assigned
worker sim-spawnhp-a). Axis: scale-onramp (blocking axis, converging,
NOT converged). Ranked next by run fleshout-20261030T0641Z
(sim-recurrence-a, evidence/2026-10-30/sim-recurrence-a.md, finding
F-2 / ranked next #4) and carried from sim-chainclose-a finding F-3
(evidence/2026-10-30/sim-chainclose-a.md).
DIAG arm, MEASUREMENT ONLY — zero src/js game changes, no default
flip, no gate move, no deed-bar move, no damage buff. This arm runs
the owed spawn-HP variance census; it builds nothing and changes no
game number. No lever verdict is proposed here.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (Wave 4: The Mirror Draft,
standing >= 100 gate; bands damage 35-95, HP 850-1500; a 4-6 round
fight for a godhood build). Wave-4 def HP ranges (src/data/
monsters.json, read at analysis time and quoted in the evidence):
congregation [900,1100], strike [1000,1200], influencer [850,1050],
audit [1100,1300], reunion [1200,1400], suburb [1300,1500], eulogy
[900,1100], algorithm [1000,1200], eater [950,1150], herald [700,900].
NO CANON-registered doc covers spawn-HP variance — the census and
provenance taxonomy below are measurement-defined from the
recorders' own fields, stated exactly so they can be checked, and
are NOT canon. Governing canon rules: CANON.md "Monster encounters
are fought, not rolled" and the perception law (Steve 2026-10-28):
census presence is REPORTED from recorded state only, never fed
into any decision.

## Code-grounded mechanics (not canon — cited so the checks can be checked)

- spawnWorldMonster (game.js): a world entity spawns at hp =
  maxHp = full.hp[0] (the def FLOOR) unless opts.hp/maxHp are
  passed (only the fled-monster respawn passes them). World
  maintain/wander paths pass no hp opt. CONSEQUENCE: a wild world
  entity's maxHp IS its spawn HP, and fieldFight writes m.hp =
  rec.mHpLeft while leaving maxHp untouched — so a census maxHp
  below the def floor proves a below-floor spawn, and a census
  hp below maxHp proves a wound before that sighting.
- startCombat tb fighter roll (game.js): a non-world tb fighter
  rolls hp in [lo, hi) from the def range; a lifted world monster
  (wave 4+, tbWorldHpFor) enters at the world entity's current
  hp/maxHp instead. Raid fieldFight instantiation is NOT assumed
  here — the evidence names each provenance case's instantiation
  path from the caller code actually read.
- LEAD TO CHECK, NOT ASSUMED (assignment): src/js/alienPlayers.js
  ~2906 (`Math.round(maxHp * (0.9 + Math.random() * 0.2))`) sits
  inside apBeamHit — beam damage against a fighter target, not a
  spawn roll on its face. The evidence must verify from callers
  whether any wild wave-4 spawn path touches it, and must NOT cite
  it as the explanation for 825/1100 = 0.75 (outside the 0.9-1.1
  band) without proof. The 0.75 pattern (w4meet: 675 = 0.75 x 900,
  825 = 0.75 x 1100, 637 ~= 0.75 x 850) is a PRE-EXISTING w4meet
  observation to CHECK against this band's below-floor openings,
  not a claim about this band.
- Chain grouping and censored flag are PORTED, not re-invented:
  this arm REQUIRES buildChains from scripts/analyze-chainclose-a.js
  (the fixed code: grouping key (seed, mid), censored =
  horizon-survived only). Do NOT reuse chainfinish's analyzer
  without those fixes — chainfinish groups by mid alone and flags
  won runs as censored, both corrected in chainclose.

## Band and substrate (binding — identical to chainclose/recurrence, verified not invented)

- Seeds 75101-75116 (16, the chainclose/recurrence band), 180d
  death-aware horizon (dead villages stop simulating; +10d tail max
  per MEASUREMENT.md §10 — the harness's death-aware stop).
- Horizon why: same as chainclose — the question is explicitly
  "inside a village lifetime"; keeping chainclose's horizon makes
  windows comparable in kind.
- Policy: scripts/policies/tableseat-nowait.js VERBATIM.
- Game substrate env (verbatim from chainclose's prereg):
  LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1, W4DPR=1.
- Recorder stack (reused verbatim, never edited):
  fieldparty-form-diag, w4dpr-diag, breakline-diag, tilejoin-diag,
  shoutrec-diag, joinendlines-diag, with env BREAKLINE=1, TILEJOIN=1,
  SHOUTREC=1, JOINENDLINES=1. TILEJOIN=1 disclosure carried from
  chainclose: it enables the tilejoin prototype feed (tile mates
  only, perception-law compliant — never a roster feed), part of
  the reused instrument stack, NOT a new game change by this arm.
- Sweep: scripts/sweep-spawnhp-a.js is a VERBATIM COPY of
  scripts/sweep-recurrence-a.js (itself a verbatim copy of the
  chainclose sweep with the census delta) with exactly three
  deltas, all disclosed here: (a) the default EVID dir is
  perseed-spawnhp-a instead of perseed-recurrence-a; (b) each
  census entry additionally copies maxHp, veteran, and variant
  from the world-monster object (null when absent) — the
  spawn-vs-wound instrument; (c) summary mode additionally
  reports census maxHp presence (it never alters row content).
  No seed, env, policy, recorder, mode string, or harness call is
  changed. A diff of the two sweep files is part of the instrument
  commit's proof (it must show only these deltas). If the copy's
  presence changes any fieldparty row, the SUBSTRATE-EQUIVALENCE
  leg fails and the run stops — the census must be provably
  non-perturbing.
- NEW INSTRUMENT (additive, record-only, never a game change):
  the census entries above. The census reads state only; it
  consumes no RNG, calls no game mutator, and feeds no decision.
  Census snapshots run at the same point as recurrence's (before
  base.daily), so snapshot timing is unchanged.
- RE-DERIVATION CLAUSE (binding): this run's OWN corpus IS the
  baseline. Do NOT quote chainclose/recurrence/w4meet band numbers
  as current. Any comparison to them is a drift diagnostic only,
  never a GO/NO-GO leg — EXCEPT the SUBSTRATE-EQUIVALENCE leg
  below, which compares FILES (byte identity), not judged numbers.

## Universe and definitions (binding, fixed here)

UNIVERSE (primary): every joined row with fieldparty wave == 4 AND
channel == 'field' (wild shape only), all callers, scholar-led
flagged (never silently pooled or dropped). Raid/other wave-4 rows
are counted in a one-line census and excluded from every judged
table EXCEPT the provenance section, which classifies the 3 named
cases regardless of channel (two of them are raid-channel in
w4meet) plus every wild individual's provenance.

INDIVIDUAL (primary): a meeting chain (chainclose definition,
grouping key (seed, mid)): a maximal run of meetings of the SAME
mid on the SAME seed, in day order, in which each meeting's
mHpStart equals the previous meeting's mHpLeft (wound continuity).
A meeting whose mHpStart differs from the previous same-mid
meeting's mHpLeft STARTS A NEW CHAIN. This arm requires chainclose's
buildChains; it does not re-implement grouping. Individuals are
keyed by (seed, mid, chain index) — NEVER by type alone.

OPENING HP (primary): a wild individual's first meeting's
mHpStart. The per-type census table aggregates OPENING HPs across
individuals of that type (one row per individual, never per
meeting): n, min, max, mean. A type with n < 3 is
INSUFFICIENT-DATA for any variance claim (its descriptives are
still shown, labeled thin, never judged as variance).

CENSUS-FIRST-APPEARANCE (secondary, unmet entities): a wild wave-4
census streak = a maximal run of consecutive census days on one
seed containing the same id at constant hp (tile may wander; a
day-gap or an hp change splits the streak). Each streak gets
firstDay, firstHp, firstMaxHp, lastDay, tiles seen, and a collision
flag when two same-id entries share a day. Streaks whose id never
appears in any meeting on that seed are UNMET-CENSUS rows (counted
separately from meeting individuals, never merged into them).
Streaks for met individuals are reported as that individual's
pre-meeting census trajectory (see provenance), not as separate
individuals.

PRE-MEETING HISTORY (per individual): (a) every prior meeting of
the same (seed, mid) in ANY channel, in day/part order, with its
closing mHpLeft; (b) every census sighting of that id on that seed
with day <= first meeting day, with hp/maxHp/tile; (c) the
individual's first-meeting transcript (w4dpr verbatim log).

## Provenance taxonomy (binding — exactly one class per individual, priority order)

Applied to an individual's OPENING HP relative to its def floor
[lo, hi]. "Prior" means strictly earlier in day/part order on the
same seed. Every verdict carries its evidence fields.

1. WOUNDED-IN-CORPUS — a prior meeting of the same (seed, mid) in
   ANY channel closes with mHpLeft == opening HP. Evidence: prior
   meeting day/channel/closing HP. (The chainclose audit pattern:
   a raid meeting closing at 1066, the wild meeting opening at
   1066 — same entity, wounded in-corpus.)
2. SPAWN-HP — opening HP == def floor AND no prior in-corpus
   meeting AND a census sighting with day <= first meeting day
   shows hp == maxHp == opening HP. Evidence: sighting day/hp/maxHp.
   (World spawn at the floor, seen unwounded before first contact.)
3. SPAWN-VARIANCE — opening HP < def floor AND a census sighting
   (day <= first meeting day, or the entity's first sighting
   overall when no pre-meeting sighting exists but the sighting's
   hp/maxHp equal the opening trajectory) shows maxHp == opening
   HP < floor with hp == maxHp. Evidence: sighting day/hp/maxHp.
   (The entity's own maxHp is below the floor — wounds lower hp,
   never maxHp on the fieldFight path — so the spawn itself was
   below floor.)
4. OFF-CORPUS-WOUNDED — no prior in-corpus meeting, and either
   (a) a census sighting before the first meeting shows hp >
   opening HP (wounded between sighting and meeting by a channel
   the corpus does not record), or (b) the earliest census
   sighting shows hp == opening HP < maxHp == floor (wounded
   before first sighting; channel unrecorded). Evidence: sighting
   days/hp/maxHp and the wound gap.
5. UNDETERMINED — none of 1-4 can be established from this corpus
   (e.g. opening < floor, no prior meeting, no census sighting
   before the meeting, no maxHp evidence). UNDETERMINED is a
   terminal class, not a missing value: it MUST name the missing
   instrument (spawn recorder logging spawnWorldMonster hp/maxHp
   per entity, and/or a tb-combat recorder for scholar fights).
   An honest UNDETERMINED verdict with the instrument named
   satisfies the GO bar for that case; a bare "unknown" does not.

Notes: classes 2-4 require census evidence; a below-floor opening
with NO census sighting and NO prior meeting is UNDETERMINED, never
guessed as spawn variance. An opening HP >= floor with no prior
meeting and no pre-meeting census sighting is SPAWN-HP only if a
pre-meeting census sighting proves hp == maxHp == opening;
otherwise it is reported as AT-FLOOR-OR-ABOVE (unproven spawn) in
the individual table but still counts as classified for the
completeness leg — the strict SPAWN-HP class is reserved for
census-proven cases. (This sentence governs the individual table;
the 3 named cases are judged by classes 1-5 above, where a
>= floor opening with a prior meeting is WOUNDED-IN-CORPUS and a
>= floor opening without one follows the same census rule.)

PROVENANCE CASES (binding — the 3 w4meet below-floor arrivals):
75113 eulogy 675 (def [900,1100]), 75116 audit 825 (def
[1100,1300]), 75113 influencer 637 (def [850,1050]). For each:
(i) reproduce-or-not on THIS band (same seed/type, channel, day
window, opening HP); (ii) classify by the taxonomy above on this
band's corpus where reproduced, and on the w4meet corpus where
not (w4meet corpus rows + this band's code-path check — never a
bare quote of w4meet's finding); (iii) name the instantiation
path from caller code read at analysis time (world entity via
spawnWorldMonster / raid fieldFight instantiation / tb lift);
(iv) state the opening/floor ratio and whether it matches the
0.75 pattern, without claiming a mechanism the code does not show.

## Primary metrics (binding)

- COMPLETENESS (blocks DIAG-GO): 16/16 valid seeds (days > 0) AND
  every recorder (fieldparty, w4dpr, breakline, shoutrec,
  tilejoin, joinendlines) errs 0 with overflow empty AND joins
  100% (all six recorders index-aligned per seed; mid/vid/day
  match at every index; join errors 0) AND mDealt agreement
  breakline==w4dpr at every row AND shoutrec PREFIX-CONSISTENCY
  at every row (roundTotals entries non-decreasing and each <=
  the final total) AND census files present and parseable for
  16/16 seeds, snapshots sorted by day, final snapshot day within
  1 of the seed's days, census entries carrying maxHp.
- SUBSTRATE-EQUIVALENCE (blocks DIAG-GO): all 16
  s<seed>-fresh.json rows byte-identical to chainclose's corpus
  rows (evidence/2026-10-30/perseed-chainclose-a/s<seed>-fresh.json).
  Any byte difference fails this leg — the run stops and reports
  drift, it does not re-baseline silently.
- CENSUS-COMPLETENESS (primary metric, blocks DIAG-GO): EVERY wild
  wave-4 individual on the band has an opening-HP row with exactly
  one provenance class (classes 1-5 above; AT-FLOOR-OR-ABOVE
  unproven-spawn rows count as classified per the note above);
  the per-type table aggregates exactly those individuals (n =
  individual count, never meeting count); every UNMET-CENSUS
  streak is listed separately. NaN, missing, or silently dropped
  individuals fail this leg.
- PROVENANCE-CASES (blocks DIAG-GO): all 3 named cases carry a
  verdict from classes 1-5 (UNDETERMINED allowed ONLY with the
  missing instrument named). 0 UNCLASSIFIED (bare unknown) among
  the 3.
- DETERMINISM GATE (blocks DIAG-GO): one seed re-run into a
  scratch EVID dir; its row JSON byte-identical to the corpus row
  AND its census JSON byte-identical to the corpus census. Scratch
  dir removed after the diff.
- SENSE BAR (blocks DIAG-GO): EVERY below-floor first-meeting
  transcript on this band read end to end (w4dpr verbatim logs),
  plus the 3 named cases' transcripts (this band where reproduced,
  w4meet corpus otherwise). Judgment is meaning/coherence/
  consequences (does the story show a fresh beast, a returning
  wounded beast, or a beast whose wounds the story cannot explain),
  not counts (SENSE-TESTING LAW). Meetings with rounds < 1 have
  short or empty logs; the log length is reported, never padded.
- FIXTURE BAR (blocks judging): scripts/test-spawnhp-a.js must
  prove, before the corpus is judged, on synthetic rows: the
  provenance decision tree in priority order (each class, plus
  WOUNDED-IN-CORPUS beating SPAWN-HP and UNDETERMINED carrying
  its instrument), the cross-seed chain separation THROUGH the
  required chainclose buildChains (not a local re-implementation),
  the censored=survived-only carry, census streak splitting on
  day-gap/hp-change and collision flagging, per-type aggregation
  over individuals (not meetings), and the byte-identity
  comparator used by the substrate-equivalence and determinism
  legs.

## Verdict rule

- DIAG-GO iff COMPLETENESS PASS + SUBSTRATE-EQUIVALENCE PASS +
  CENSUS-COMPLETENESS PASS + PROVENANCE-CASES PASS + DETERMINISM
  PASS + SENSE PASS + FIXTURE PASS + a RANKED NEXT named with
  numbers.
- A completeness/substrate/census/provenance/determinism/sense/
  fixture failure is DIAG-NO-GO.
- INSUFFICIENT-DATA (reported, never silently widened): if the
  band yields ZERO wild wave-4 meetings, the arm reports
  INSUFFICIENT-DATA with the counts and states the widen-or-close
  choice for the coordinator — seeds are NOT widened silently
  mid-run. A per-type n < 3 is INSUFFICIENT-DATA for that type's
  variance claim (descriptives shown, labeled thin, never judged).
  Raid (expected small-n) and other shapes are INSUFFICIENT-DATA
  for shape claims, counts only, as in chainclose.
- A miss is NO-GO, never re-scored against a friendlier metric
  mid-run; metric doubts go under "metric review" for the NEXT run.
  Every evidence file carries a "metric review" section.
- NO lever verdict: this arm does not propose a damage buff, gate
  move, spawn-HP change, or any game change. Its verdict is about
  the measurement (census complete, provenance classified), not
  about building to a target.

## Method (staged, binding order)

1. This prereg, committed BEFORE any judged analysis.
2. Instruments (sweep copy + analyzer + fixtures), committed
   before the judged sweep is analyzed (fixture bar green first).
3. Sweep (16 seeds into perseed-spawnhp-a), substrate-equivalence
   diff vs chainclose corpus, determinism gate (one seed, scratch
   dir, removed after diff), sense transcripts read per the bar.
4. Evidence evidence/2026-10-30/sim-spawnhp-a.md with
   header-vs-result, the per-type opening-HP table (n, min, max,
   mean — individuals, not meetings), the per-individual table
   (seed, type, channel, first day, opening HP, def floor, ratio,
   prior in-corpus meeting, pre-meeting census sighting, provenance
   class + evidence), the 3 provenance verdicts, the UNMET-CENSUS
   streak list, the alienPlayers ~2906 code-path check, wall
   numbers (report-only, same upper-middle median convention as
   chainclose), sense notes, ranked next, and findings-backlog
   items found (reported to the coordinator, NOT appended to
   sim-findings.md by this worker).
5. No src/js change, no push, no bump, no live verification. Report
   'branch ready for coordinator merge, pending ship' (coordinator
   merges; sibling loop B may move master under this branch — rebase
   cleanly at the end and re-run the proof; rebase conflict = FAIL
   LOUDLY, no force, no merge).

## Node harness

Eval the FULL src/js/*.js list in index.html order (minus DOM-only
app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js) via the shared
sim-harness (loadGame seeds Math.random BEFORE eval). Never stub
Game.save. Never run concurrent jest; use
--cacheDirectory=/tmp/jest-cache-sim-spawnhp-a (no jest is run by
this arm — the sweep/analyzer are plain node scripts).
