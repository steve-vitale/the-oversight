# Standing-accumulation diag, part 2 — Loop B verdict (run fleshout-loop-b-20261109T2307Z, arm sim-standaccum-b)

Axis: winnability chain (standing accumulation on gear-ready seeds —
the 99107 pattern; re-point queue item 3). DIAG ONLY, zero src/js.
Gates, prices, deeds, and readyDemand untouched.

## Pre-registration (committed before any judged computation)

Full text: `evidence/2026-11-09/sim-standaccum-b-prereg.md`
(commits 2d22a56e8 + b0f4549ad precedence correction, both before the
pilot). In short: competent policy verbatim, default env, seeds
99101–99108 (the gearbar/vetbar/standaccum band re-run on current
master — re-use recorded, NOT claimed as freshness), 150d
death-aware horizon, daily standing snapshots (raw + gated,
war/diplomacy/plenty split, ledger per wave, full link roll with
count reasons, feast log, readiness-5 bars, engine standingLine).
DIAG-GO iff: (1) all 8 seeds classified into exactly one
precedence-ordered trajectory class; (2) one binding constraint
binds on >= 6/8 seeds, computed by the mechanical argmax rule on
reference days (ready days where they exist, else the peak-gated
day); (3) instrument errors 0 on all 8 seeds.

## Grounding verified in code before the pilot (not assumed)

- `src/js/standing.js` `villageStanding()`: war = ledger points
  (waves 3+4+5) × 25; diplomacy = seasoned REGIONAL+ links × 34;
  plenty = qualifying feasts (quality >= 1) × 20. Thresholds
  t4 = 100, t5 = 200. `villageStandingTotal()` is the GATED number:
  plenty counts at most 100 toward T5, and while any readiness-5
  bar is short the total holds at t5-1 (199). `standing.js`
  UNCHANGED since the 2026-11-04 arm.
- Seasoned (`hierarchy.js` `_linkSeasoned`): active, 30+ days old,
  trust 40+. Regional+ (`standing.js` `_linkRegionalPlus`): for a
  Haven-primary subordinate link (LEAD) it returns
  `!!polityOf('haven')` — the polity itself needs >= 3 seasoned
  subordinates (header comment). A single seasoned subordinate
  link can never count alone.
- Base moves since the 2026-11-04 arm: `competent.js` fight-policy
  changes (build-smallfixes 2026-11-05: pocket_sand once-per-fight,
  losing-control-first window) and the `hierarchy.js` raid-cooldown
  stamp (env-gated). Game code at pilot anchor b0f4549ad is
  identical to the prereg's stated base 65fef6d7e (only
  evidence/scripts commits sit on top). Master has since moved to
  0b2e37220 (foodrung adoption, DIAG zero src/js, per coordinator
  note during this run); the coordinator rebases at landing — this
  arm does NOT rebase or re-run on the new master.

## Verdict — DIAG-NO-CANDIDATE (judged strictly against the prereg)

1. All 8 seeds classified, none forced, none unclassified:
   released 1, standing-clears-veterans-hold 4, standing-short 2,
   never-unlocked 1, bars-met-standing-short 0.
2. NO binding constraint reaches 6/8: veterans-hold 4/8,
   diplomacy 3/8, none (released) 1/8. The prereg bar (6/8) is not
   met, so the verdict is DIAG-NO-CANDIDATE, not re-scored against
   a friendlier bar. The split IS the finding (see below).
3. Instrument errors 0 on all 8 seeds (~860 daily snapshots).
Proof: `scripts/test-standaccum-b-20261109.js` — 13/13 PASS (11
fixture tests incl. all five trajectory classes, precedence,
binding argmax + ties + day-counts, peak-day fallback, and the
released/bars-met split; live harness smoke with the breakdown
reconciling exactly; determinism leg). Balanced panel (§15):
no before/after LEVER comparison exists for a diag, so none is
fabricated and none is attached; `balance-panel.js` runs sweep
comparisons, not recorder corpora (bandfreeze-b §15). The Nov-4
band table below is the headline comparison of two diagnostic
corpora, stated as such.

## THE STANDING ANSWER (plain words)

The gearbar-99107 shape is gone. No village on this master meets
all four bars and waits on standing — instead the band split three
ways, and one village did what no seed on this band had ever done:
it walked through the wave-5 door.

- **The release (1/8): 99101.** Nineteen ready days (d106–125),
  gated standing 220 → 270, war 200 → 250, bonds 0, bread 20,
  wave-4 faced, wave 5 unlocked on d106 — the FIRST release on
  the 99101–99108 band in any arm's run. It did not win: the
  village bled out over the following week (living 5 → 0 by d132,
  armor and weapons short from d126, veterans 3 → 1) and died
  standing at 270. No wave-5 kills were recorded on any seed, so
  whether 99101 actually FOUGHT wave 5 is unmeasured — the door
  opened; the facing is the next arm's instrument gap.
- **The veterans hold (4/8): 99102, 99103, 99104, 99107.** Raw
  standing clears 200 on all four (210 / 405 / 225 / 320) and the
  gated total sits at 199 with veterans the ONLY short bar at
  peak. Standing opened the door; the village could not field two
  living wave-4 killers. 99107 is the pattern inverted against
  gearbar: war 200 from eight wave-3 ledger points, veterans 0 —
  it never blooded a single wave-4 killer — raw 320, gated 199.
- **The standing-short seeds (2/8 + the never-unlocked one):
  99105 (peak 150), 99108 (peak 25), and 99106 (peak gated 199,
  raw 325).** By the prereg's mechanical rule all three bind
  diplomacy on their reference day (war 150/25/125, bonds 0,
  bread 0/0/80). Read the caveat in Metric review: 99106's raw is
  325, so its "diplomacy" binding is a rule artifact of the
  peak-day reference — its door is held by readiness
  (weapons + veterans short at peak), not by standing. The
  genuinely standing-short seeds are 99105 and 99108.
- **Diplomacy is no longer absent — it is present and never
  counts.** Every seed now forms exactly ONE link (maxLinkTotal 1
  on all 8; Nov-4: 0 links ever). Each is born Haven-primary over
  a subordinate village at trust 30–34, then trust DECAYS
  (30 → 23, 30 → 4, 30 → 26, 34 → 11, 30 → 0, 30 → 0, 30 → 17).
  Diplomacy reads 0 on every snapshot of every seed. The one
  link that ever seasoned — 99104, trust 42–45 at age 30–53,
  seasoned d73–d100 — scored 0 throughout because it is
  not-regional+: `polityOf('haven')` does not exist, and the LEAD
  gate needs a polity (≥ 3 seasoned subordinates). One link can
  never be a polity. The Nov-4 finding #1732 ("0 links ever") is
  SUPERSEDED on current master: links form now; the block moved
  from formation to seasoning + polity.
- **The bars never coincide (99103).** The only day any seed held
  2 living veterans (99103, d110), armor was 2 of 4 — the second
  veteran arrived the same day the armor bar collapsed. Ready
  days: 19 on 99101, 0 on the other 7 seeds.

## Per-seed table (peak = first day at peak gated standing)

| seed | days | end | scale | peak gated (day) | peak raw | war / bonds / bread at peak | ledger 3/4/5 | feasts qual | ready days | gear days | max armored/armed/tricks/vets | class | binding (ref days) |
|------|------|-----|-------|------------------|----------|-----------------------------|--------------|-------------|------------|-----------|-------------------------------|-------|-------------------|
| 99101 | 132 | lost | regional | 270 (120) | 270 | 250 / 0 / 20 | 6/4/0 | 1 | 19 | 121 | 11/12/27/3 | released | none (19) |
| 99102 | 58 | lost | regional | 199 (57) | 210 | 150 / 0 / 60 | 6/0/0 | 3 | 0 | 55 | 8/12/24/0 | veterans-hold | veterans-hold |
| 99103 | 132 | lost | regional | 199 (58) | 405 | 125 / 0 / 80 | 4/1/0 | 4 | 0 | 68 | 5/11/28/2 | veterans-hold | veterans-hold |
| 99104 | 150 | survived | regional | 199 (132) | 225 | 200 / 0 / 0 | 6/2/0 | 0 | 0 | 148 | 8/12/19/1 | veterans-hold | veterans-hold |
| 99105 | 109 | lost | regional | 150 (81) | 150 | 150 / 0 / 0 | 4/2/0 | 0 | 0 | 84 | 8/12/31/1 | standing-short | diplomacy (1) |
| 99106 | 87 | lost | regional | 199 (67) | 325 | 125 / 0 / 80 | 4/1/0 | 4 | 0 | 46 | 7/12/30/3 | standing-short * | diplomacy (1) * |
| 99107 | 150 | survived | regional | 199 (82) | 320 | 200 / 0 / 0 | 8/0/0 | 0 | 0 | 149 | 9/11/38/0 | veterans-hold | veterans-hold |
| 99108 | 62 | lost | regional | 25 (42) | 25 | 25 / 0 / 0 | 1/0/0 | 0 | 0 | 52 | 8/12/22/0 | never-unlocked | diplomacy (1) |

\* 99106: classified standing-short by the prereg rule because at
its peak-gated day TWO bars were short (weapons + veterans), so
class 3 (veterans the ONLY short bar) does not fire; zero days in
the run have gated 199 with short == [veterans] only. Its binding
"diplomacy" is the peak-day argmax on a seed whose raw standing is
325 — see Metric review; the door there is held by readiness.

Ready-day splits (99101, the only seed with ready days): d106–110
gated 220 (war 200 · bonds 0 · bread 20); d111–119 gated 245 (war
225); d120, d122–125 gated 270 (war 250). Wave-4 faced throughout.
Standing line on ready days carries no hold beat — correctly,
since no bar is short.

Peak-window movers (30 days before peak): war only, plus a little
bread. Peak deltas: war +100 / +125 / +125 / +50 / +50 / +75 /
+200 / +25; diplomacy +0 on all 8; plenty +0 / +20 / +40 / +0 /
+0 / +40 / +0 / +0. Transition events in those windows: 2–7 ledger
gains per seed, 0–2 feast additions, and link-reason changes
(too-young → low-trust / not-regional) on 5 seeds — the links age
and decay in the window, never season into counting (except 99104's
brief seasoned-not-regional window, d73–d100).

## Band table vs the Nov-4 corpora (headline comparison, not a panel)

| | Nov-4 (standaccum-b) | Nov-9 (this arm) |
|---|---|---|
| days | 150 / 116 / 121 / 150 / 52 / 59 / 72 / 48 | 132 / 58 / 132 / 150 / 109 / 87 / 150 / 62 |
| median survival | 116 | 132 |
| survivors | 2/8 (99101, 99104) | 2/8 (99104, 99107) |
| peak gated | 199 / 199 / 180 / 199 / 140 / 150 / 50 / 20 | 270 / 199 / 199 / 199 / 150 / 199 / 199 / 25 |
| peak raw | 355 / 215 / 180 / 225 / 140 / 150 / 50 / 20 | 270 / 210 / 405 / 225 / 150 / 325 / 320 / 25 |
| ready days | 0/8 seeds | 19 days on 99101 only |
| wave-4 unlocks | 6/8 | 7/8 |
| wave-5 unlocks | 0/8 | 1/8 (99101) |
| end scale | village 8/8 | regional 8/8 |
| links ever (maxLinkTotal) | 0 on all 8 | 1 on all 8, never counting |
| veterans max | 1 / 0 / 1 / 1 / 1 / 0 / 0 / 0 | 3 / 0 / 2 / 1 / 1 / 3 / 0 / 0 |

Trajectories drifted hard with base moves (99101: 150d survived /
199 / wave-4 → 132d lost / 270 / wave-5 released; 99107: peak 50 /
never faced wave 4 → peak raw 320 / gated 199 / war 200). Nothing
here is a lever effect — no lever was played. The direction of the
drift is toward the door: the band's first release, regional scale
on all 8 seeds, and links forming at all.

## Wall numbers (this pilot, not wall movement)

Wins 0/8. National 0/8, table 0/8 (scaleRank "regional" on all 8;
no seed leaves regional scale; lesser-seat deeds not instrumented
by this arm — not reported, not guessed). Wave-4 unlocks 7/8,
wave-4 faced: not re-instrumented here (vetprod-b: 4/8 on the Nov-4
master; this arm's w4faced flag is per-snapshot, not a band count
— do not cite a number this arm did not compute). Wave-5 unlocks
1/8, wave-5 faced: NOT instrumented (zero wave-5 ledger kills on
all 8 seeds; facing without a kill is unmeasured). Readiness-5-ready
days 19 (all 99101). Median run-days 132 (2 seeds censored at the
150d horizon: 99104, 99107 survived). Death causes not instrumented
by this arm — not reported, not guessed. These are the baseline the
next arm measures against, not a claim the wall moved — except the
release itself: wave-5 readiness on this band went 0 days (Nov-4)
to 19 days (99101), and wave-5 unlocks 0/8 to 1/8, on base moves
alone.

## Village assessment (plain words)

Picture eight villages playing competently for two to five months.
Every one of them now reaches regional scale, and every one of them
shakes hands with exactly one other village — a single bond, born
at trust thirty, that slowly cools and never becomes anything the
System counts. They fight and they feast, and their standing climbs
on blood and bread alone, as before — but the climb goes further
now: four villages push past 200 and wait at the fifth door for
fighters who never come in pairs, one village's second veteran
arrives on the very day its armor gives out, and one village —
99101 — actually walks through. It holds the door open for nineteen
days, standing 220 to 270, and then dies anyway, its fighters
falling one by one in the week after, two people left at the end.
The gear closet is still full from day two. The village is still
what runs out. What changed since November 4 is not the shape of
the wall but its height: the door can open now, and the question
moves from "can standing reach 200" to "can two killers stand
alive together, and can a bond ever count."

## Sense-test

- The engine's own `standingLine` (read from the daily rows, not
  the noisy say sample) is coherent and honest against the numbers
  on every peak and every ready day: it names war, bonds 0, bread,
  both thresholds, and — when held — the short bars. 99106's peak
  line names BOTH short bars ("put weapons in hands (4 of 6
  armed); blood your fighters (1 of 2 veterans)"), which is exactly
  what the analyzer's short list reads. 99101's ready-day lines
  carry no hold beat, correctly. No silent gate was found.
- The System's stage pitch names all three sources aloud ("Get me
  STANDING — blood, bonds, or bread. Rack up the kills, season your
  alliances...") — the fiction promises bonds as a road while the
  numbers give bonds 0 on every snapshot. That is the sense-test
  tension of this arm: the game tells the village to season
  alliances, and no alliance can ever season into counting on this
  band.
- The tightened say filter (`/standing \d|held|draft waits|feast/i`)
  did NOT de-noise the sample: "held" matches fight lines ("nothing
  held back") and storm lines ("like a held breath"), and "feast"
  matches keepsake lines ("The feast was the weapon"). The 150-line
  cap still fills in the first three weeks on most seeds. The
  standingLine rows are the sense-test source; the say sample is
  not. See Metric review.
- Traveler rumor lines are coherent ("A traveler swears Ashford,
  west, is feasting — a whole elk, they say. (They're wrong. Ashford
  is starving.)").
- No robotic villager behavior was flagged by this arm's corpus;
  the sense-test gap is the bonds promise above, not behavior.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- The prereg's 6/8 bar for a single binding constraint did its job:
  at 4/3/1 it refused to crown one lever, and that refusal is the
  result — the band is genuinely split between a veterans hold
  (4/8), a diplomacy shortfall (3/8 by the rule), and a release
  (1/8). Do NOT lower the bar after seeing the split.
- Binding-rule caveat (named, not fixed in-run): the rule applies
  the standing-source argmax on the peak-gated day for every
  non-class-3 seed, including seeds whose RAW standing already
  clears 200. On 99106 (raw 325) it names diplomacy, but the door
  there is held by readiness (weapons + veterans short at peak),
  not by standing. Proposed revision for the NEXT arm (not applied
  here): for seeds with peak raw >= 200, the binding constraint is
  a readiness hold (report the short bars), and the standing-source
  argmax applies only where raw < 200. Under that revision 99106
  would bind a readiness hold and the split would read 4
  veterans-hold / 1 readiness-hold / 2 diplomacy / 1 none — still
  no 6/8, same NO-CANDIDATE verdict. Do not re-score this pilot
  against that rule.
- Class-3 exactness held up: 99106's peak short list
  [weapons, veterans] correctly kept it out of
  standing-clears-veterans-hold, and the corpus confirms zero days
  with gated 199 and short == [veterans] only. The class boundary
  (veterans the ONLY short bar) is doing real work.
- The released class fired for the first time on this band
  (99101). The prereg's released condition (ready day + gated
  >= 200 + wave-4 faced) was verified against the rows (first
  qualifying day d106, gated 220, ready true, w4faced true,
  peakWave 5 from d106).
- Say-filter failure (instrument note, not a game finding): the
  tightened filter still fills the cap with keepsake/fight/storm
  noise. Next arm: filter on `^Standing \d|^🍖 FEAST|HELD at wave`
  or drop the say sample for standing and read standingLine rows
  only (they already carry the sense-test).
- Wave-5 facing is unmeasured by this instrument (no w5faced
  field; ledger[5] = 0 everywhere). A next arm that needs the
  facing must wrap a wave-5 engagement entry point (as vetbar's
  census did for wave 4), not infer it from unlocks.
- Seed-band pairing note: same seeds as gearbar/vetbar/standaccum/
  vetprod, but trajectories drifted hard with base moves (median
  132d vs 116d Nov-4, 90d gearbar; 99101 released where it
  previously held at 199). Standing findings stand on this run
  alone; cross-arm seed pairing is band-level, not
  trajectory-identical.

## Next blanks, in order

1. **Link-trust + polity (this arm's finding, the diplomacy half
   of the split):** links form now (1/village, born trust 30–34)
   but trust decays instead of rising to 40, and even the one
   seasoned link (99104, trust 42–45, d73–d100) scores 0 because
   no `polityOf('haven')` exists — the LEAD gate needs a polity
   (≥ 3 seasoned subordinates) and the band forms at most 1 link.
   Next arm: a trust-growth probe — what, if anything, moves link
   trust up under competent play, and what forms a polity? Do NOT
   move readyDemand numbers or any win price/deed gate on this
   evidence. If the implied lever is a build (trust growth, polity
   formation, or a second-link road), it is named here, not built
   here — this arm is DIAG only.
2. **Veterans simultaneity (the 4/8 half):** the veterans hold is
   still the plurality binding constraint, sharpened by 99103
   (second veteran arrives the day armor collapses) and 99107
   (war 200, veterans 0). The vetprod two-track work (encounter
   opportunity + killer survivorship) is the owning lane; this arm
   adds the simultaneity datum, not a new lever.
3. **Wave-5 facing after release (99101's open question):** the
   door opened for 19 days and no wave-5 kill was recorded; the
   village died a week later with standing 270. Next arm:
   instrument wave-5 engagements (spawns, fights, outcomes) on a
   release-capable band before any gate/price discussion.

## Findings for the backlog

- **FIRST RELEASE ON THE 99101–99108 BAND (99101).** 19 ready
  days d106–125, gated 220 → 270, wave 5 unlocked d106, village
  lost d132 with 2 living. Standing 270 at death. Wave-5 facing
  unmeasured (zero wave-5 kills). (This arm.)
- **DIPLOMACY FORMS BUT NEVER COUNTS (supersedes sim-findings
  #1732).** 1 link per village on all 8 seeds (Nov-4: 0 links
  ever), born trust 30–34, decaying to 0–26; diplomacy 0 on every
  snapshot. Only 99104 ever seasoned (trust 42–45, d73–d100) and
  it scored 0 — not-regional+, no `polityOf('haven')`. Next arm:
  trust-growth + polity-formation probe. (This arm.)
- **BARS NEVER COINCIDE (99103).** The only veterans-2 day
  (d110) is also an armor-short day (armored 2/4). Simultaneity,
  not counts, is the veterans failure on this seed. (This arm.)
- **BAND SPLIT, NO SINGLE BINDING CONSTRAINT.** veterans-hold 4/8,
  diplomacy 3/8 (one rule artifact, 99106), released 1/8.
  DIAG-NO-CANDIDATE at the 6/8 bar. (This arm.)
- **SCALE WALL MOVED ONE RUNG ON BASE MOVES ALONE.** End scale
  regional 8/8 (Nov-4: village 8/8); wave-4 unlocks 7/8 (was 6/8);
  wave-5 unlocks 1/8 (was 0/8). National still 0/8, wins 0/8.
  (This arm.)

## Proof and landing

- Proof: `scripts/test-standaccum-b-20261109.js` — 13/13 PASS
  (11 fixture tests + live harness smoke + determinism leg).
  Re-run post-commit below.
- Commits (this worktree branch sim-standaccum-b; coordinator
  merges via --ff-only; merged locally, pending ship — no push, no
  bump, no live verification by this worker):
  - 2d22a56e8 sim-standaccum-b prereg (before any judged sim)
  - b0f4549ad sim-standaccum-b instruments + proof 13/13 (zero src/js)
  - (pilot + evidence commit below)
- Files: prereg + evidence in `evidence/2026-11-09/
  sim-standaccum-b*.md`; per-seed JSON in
  `evidence/2026-11-09/perseed-standaccum-b/` (8 files,
  standaccum-pilot run, anchor b0f4549ad); scripts
  `standaccum-instrument-20261109.js`,
  `standaccum-driver-20261109.js`,
  `standaccum-analyze-20261109.js`,
  `test-standaccum-b-20261109.js`.
- Index-clobber note: safe-commit.sh left bogus staged deletions
  in the worktree index after both commits (prereg + instruments);
  repaired each time via HEAD-blob `update-index --cacheinfo`
  after hash-object verification, and verified `git status` empty
  + `git diff HEAD` empty. The commits themselves were always
  correct.
- Worktree state at handoff: only committed work; no uncommitted
  leftovers beyond the pilot + evidence commit below (verified
  before reporting).
