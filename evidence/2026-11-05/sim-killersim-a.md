# KILLERSIM — killer simultaneity (Loop A verdict, run fleshout-20261105T0915Z, arm sim-killersim-a)

Axis: winnability chain. DIAGNOSTIC ONLY, zero src/js. No
readyDemand move, no VETSHAPE flip, no gate/price/deed change, no
policy variant. Fresh band 99211–99218, competent policy verbatim,
default env, 150d death-aware horizon.

## Pre-registration (committed before any judged sim)

Full text: `evidence/2026-11-05/sim-killersim-a-prereg.md`
(commit 83e001afb). In short: per-seed simultaneity — days with
L>=2 living wave-4 killers, days with exactly L==1, maxLiving,
killers ever, first-killer survival (exit-based, death-or-exile),
readiness-5-ready days, killer fates (died-in-fight / died-away /
exiled / still-living) — PLUS the identified mechanism, chosen from
four pre-stated patterns: M1 dies-fast (first-killer survival
<= 14d), M2 never-arrives (exactly 1 killer ever despite >= 5
wave-4 fights), M3 clusters (one killer holds >= 2/3 of the
seed's wave-4 kills AND >= 2 other fighters fought wave-4 without
a kill), M4 made-late (first kill within the last 30 days of the
run). Verdict DIAG-GO iff the gap is confirmed (L>=2 days on
<= 1/8 seeds) AND >= 1 named mechanism holds on >= 1 fresh seed.
DIAG-NO iff >= 2 seeds show sustained pairs (>= 7 consecutive
L>=2 days) with no mechanism visible. UNDERPOWERED iff fewer
than 4 fresh seeds bank >= 1 wave-4 killer. INSUFFICIENT-DATA
iff > 2 seeds carry instrument errors. Balanced panel (§15):
INAPPLICABLE for a pure diagnostic on a fresh band with no
before/after comparison — stated, not fabricated.

## Verdict — UNDERPOWERED (judged strictly against the prereg)

- Only **2 of 8 fresh seeds bank >= 1 wave-4 killer** (99211,
  99215). The prereg's UNDERPOWERED rule fires: simultaneity
  cannot be judged on a band that barely kills wave 4. **No
  GO/NO verdict is claimed.** The simultaneity counts are still
  reported below, and the mechanism matches on the two banking
  seeds are reported as observations, not as a verdict.
- The gap itself is confirmed in the weak sense: **0 days with
  two living killers anywhere on the band** (0/8 seeds with any
  L>=2 day; maxLiving 1 on both banking seeds; 25 days with
  exactly one living killer, 0 days with two). But with only two
  banking seeds, that confirmation is thin — it is the same
  thinness standaccum3's band showed (2/8 banking there too),
  not a new measurement.
- Mechanism matches (letter of the prereg, not judged):
  99211 matches **M1 dies-fast** (first killer survives 10d)
  and **M4 made-late** (first kill day 79 of a 103-day run);
  99215 matches **M3 clusters** (in its letter only — see
  Metric review: vacuous at n=1) and **M4 made-late** (first
  kill day 139 of a 143-day run). M4 holds on BOTH banking
  seeds. M2 holds on no seed (neither banking seed faced >= 5
  wave-4 fights with exactly one killer — 99211 faced 14 fights
  but banked 2 killers; 99215 faced 4 fights).
- First-killer survival re-measure: **no median claimable**.
  One observed exit (10d) and one censored (still living at
  village end). The single observed 10d sits between the 9d
  (postblood) and 11d (standaccum2) priors — consistent, n=1,
  not a re-measure. All-killer intervals: [9, 10] — both killers
  on 99211 died 9 and 10 days after banking.
- Instrument errors 0 on all 8 seeds; engine-veteran mismatch
  days 0; live-derived mismatch days 0; liveRows missing 0.
  The instrument is clean; the band is thin.

## THE ANSWER (plain words)

Two living wave-4 killers never coexist on this band — not for
a day. But that sentence is weaker than it sounds, because
almost nobody banks even one killer: six of eight villages
never blood a wave-4 killer at all. Three never get past the
third wave. Two open the fourth wave, fight it, and kill
nothing in it. Of the two villages that do blood a killer, one
gets two — and they miss each other by a single day. Its first
scholar kills a Congregation on day 79 and dies fighting at
home on day 89; its next scholar kills another Congregation on
day 90, the day after, and dies fighting at home on day 99.
The other village survives 143 days, climbs to standing 210,
and its only wave-4 killer is a joiner who lands the kill four
days before the village dies. The pair never forms because the
first killer is already the rare event — and on this band, the
first kill lands in the last month of the village's life, so
there is no runway left for a second one to be made and survive
alongside. The question "why don't two killers coexist" is
unanswerable on eight seeds that produce three killers between
them. What the band actually measures is the step before it:
villages barely kill wave 4 at all.

## The named mechanisms (with code citations)

1. M4 MADE-LATE — holds on BOTH banking seeds. 99211's first
   kill lands day 79 of a 103-day run (within the last 30 days);
   99215's lands day 139 of a 143-day run (4 days before the
   village dies). Code: wave 4 unlocks only when standing
   reaches 100 (`villageStandingTotal()`, src/js/standing.js),
   so the first kill can only come late in a run that opens
   wave 4 late — and both villages opened it late (99211's
   first wave-4 fight is day 60; 99215's is day 102). A
   killer made in the last month has no runway: a second killer
   must be made, and survive, inside the same closing window.
2. M1 DIES-FAST — holds on 99211. First killer gen_qfv5egm
   survives 10 days after banking (day 79 → day 89); the
   second killer survives 9 (day 90 → day 99). Both died in
   combat AT HAVEN (scholarDeath context: atHaven true,
   inCombat true — see Sense-test). Code: the readiness bar
   reads living roster only (`waveCombatReadiness(5)`,
   standing.js), and the death block + `removeVillager`
   choke point (betrayal.js) take the killer off the roster
   the day they die. Ten days is the whole window the second
   killer has to arrive in — and on 99211 it arrived one day
   too late.
3. M3 CLUSTERS — fires on 99215 in its letter only (see Metric
   review). One killer (visjoin_70) holds 100% of the seed's
   single wave-4 kill while three other fighters (greta_hansen,
   dmitri_sokolov, sofia_chen) fought wave 4 without a kill.
   With n=1 kill this is vacuous — one kill cannot cluster —
   so it is reported as "only one villager ever killed", not
   as clustering evidence.
4. M2 NEVER-ARRIVES — holds on no seed. It needs exactly one
   killer ever despite >= 5 wave-4 fights; 99211 banked 2
   killers over 14 fights and 99215 faced only 4 fights. The
   secondkiller-b finding (kill rate 0/19 after first blood)
   is not re-tested here — this band has only 12 wave-4 fights
   after first blood on 99211 (1 kill) and 0 on 99215.

## Per-seed table (fresh band, all error-free)

days = run days; end = village-lost on all 8; un = unlockedWave
at finalize; w4f/w4k = wave-4 fights/kills; rate = kill rate;
kbw = kills by wave (w1/w2/w3/w4); rPeak/gPeak = raw/gated
standing peaks; kev = killers ever; maxL = max living killers;
L2/L1 = days with 2 / exactly 1 living killers; run = longest
L>=2 run; r5 = readiness-5-ready days; rel = release days;
mech = mechanisms; mmE/mmL = mismatch days (derived vs engine
veterans / derived vs live-derived); first = first killer.

| seed | days | un | w4f | w4k | rate | kbw | rPeak | gPeak | kev | maxL | L2 | L1 | run | r5 | rel | mech | first killer |
|------|------|----|-----|-----|------|-----|-------|-------|-----|------|----|----|-----|----|-----|------|--------------|
| 99211 | 103 | 4 | 14 | 2 | 0.14 | 29/18/4/2 | 170 | 170 | 2 | 1 | 0 | 19 | 0 | 0 | 0 | M1+M4 | gen_qfv5egm d79→d89 (10d, died-in-fight) |
| 99212 | 61 | 3 | 0 | 0 | — | 28/15/3/0 | 95 | 95 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | — | — |
| 99213 | 77 | 4 | 3 | 0 | 0.00 | 33/12/4/0 | 135 | 135 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | — | — |
| 99214 | 75 | 4 | 1 | 0 | 0.00 | 28/13/4/0 | 100 | 100 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | — | — |
| 99215 | 143 | 4 | 4 | 1 | 0.25 | 30/17/5/1 | 210 | 199 | 1 | 1 | 0 | 6 | 0 | 0 | 0 | M3+M4 | visjoin_70 d139→alive (censored) |
| 99216 | 78 | 3 | 0 | 0 | — | 23/16/3/0 | 95 | 95 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | — | — |
| 99217 | 48 | 3 | 0 | 0 | — | 22/11/2/0 | 50 | 50 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | — | — |
| 99218 | 23 | 2 | 0 | 0 | — | 16/3/0/0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | — | — |

Band totals: 22 wave-4 fights, 3 wave-4 kills (13.6% kill
rate), 3 killers ever, 25 days with exactly one living killer,
0 days with two. Fates: died-in-fight 2, still-living 1,
died-away 0, exiled 0, left 0. Exile-list entries on the band:
3 (99215, 99217, 99218 — one each), none a wave-4 killer.
Readiness-5-ready days: 0 on all 8 seeds.

## The 99211 trajectory (quoted — the closest seed to a pair)

- 53 kills total (29/18/4/2 by wave). Wave 4 opens after day
  60. Fourteen wave-4 fights: 11 player turn-based, 3 field.
  Field fights all flee (damage fractions 0.03, 0, 0.02).
  Turn-based: 2 kills, 9 scholar deaths.
- Day 79: the scholar gen_qfv5egm kills a Congregation solo,
  turn-based, full damage (frac 1.0). Day 89: the same scholar
  dies in a turn-based fight at haven, dealing nothing (frac
  0) — cause split "scholar-death:the wild:at-haven:in-combat".
  Ten days a veteran.
- Day 90: the next scholar, benoit_lambert, kills a
  Congregation solo, turn-based, full damage — the day after
  the first killer died. Day 99: benoit dies in a turn-based
  fight at haven (frac 0.36), and three more scholars die in
  turn-based fights the same day (ava_garcia, oliver_moore,
  quinn_murphy) — four scholar deaths in one day. Nine days a
  veteran. The village is lost day 103.
- The two killers' lives miss each other by ONE day: killer 1
  dies day 89, killer 2 banks day 90. L==1 for 19 days, L>=2
  for none. Standing peaks at 170 raw/gated — never reaches
  200; the end readiness-5 read is armored 0/4, armed 0/6,
  tricks 28/3, veterans 0/2.
- Both kills were scholar solo kills at full damage; every
  other turn-based wave-4 fight on the seed ends in the
  scholar's death. The village's wave-4 story is the scholar
  alone, twice, and then the scholar dies.

## The 99215 trajectory (quoted — the longest run)

- 53 kills total (30/17/5/1 by wave). Wave 4 opens after day
  100. Four wave-4 fights, one kill (25%).
- Day 102: greta_hansen + dmitri_sokolov flee a field fight
  (frac 0.12). Day 104: dmitri dies solo turn-based (frac
  0.05). Day 136: greta deals 0.78 of a wave-4 monster's health
  solo — and dies. Day 139: the joiner visjoin_70 kills The
  Strike as a companion while sofia_chen is scholar — the
  village's only wave-4 kill, four days before the village is
  lost on day 143. Still living at the end; L==1 for 6 days.
- Standing peaks at 210 raw but 199 gated — held at t5-1 by
  readiness (armored 2/4, armed 3/6, veterans 1/2). The one
  veteran is visjoin_70; the village needed two, and the
  second never came. The hold beat never speaks (see
  Sense-test).

## Wall numbers (fresh band, baseline observations)

Wins 0/8. National 0/8, table 0/8 (unobserved — not
detectable from this corpus, never inferred). Wave-4 unlocks
4/8, wave-4 faced 4/8 (same seeds), wave-4 kills 3, wave-5
unlocks 0/8, wave-5 faced 0/8, wave-5 kills 0.
Readiness-5-ready days 0/8. Median run-days 76 (sorted: 23 /
48 / 61 / 75 / 77 / 78 / 103 / 143; all 8 villages lost, none
censored). Village death-cause shares: not instrumented by
this arm — not reported, not guessed.

## Reachability verdict

Waves 1–4 are reached and faced (4/8 seeds face wave 4, 3
kills); wave 5 is unlocked on no seed, faced on no seed,
killed on no seed. Regional → national, the table, and the win
flag are unreached on all 8 fresh seeds. The wall has not
moved on this band — and this arm tightens the diagnosis
upstream of simultaneity: on 6 of 8 seeds the village never
banks even one wave-4 killer, so the pair question cannot
even be asked. The readiness-5 door was never ready on any
day of any seed.

## Village assessment (plain words)

Picture eight villages playing competently. One dies at day
23, standing zero, never past the second wave. Three more live
two to three months, kill plenty of lesser beasts, and never
open the fourth wave at all. Two open it, fight it three times
and once, and kill nothing. The two that blood a killer tell
the whole story between them: in one, the scholar kills a
Congregation, dies fighting at home ten days later, and the
next scholar kills another Congregation the very next day and
dies fighting at home nine days after that — two veterans, one
day apart, never together. In the other, the village lasts 143
days, climbs to standing 210, and its only wave-4 killer is a
joiner who lands the kill four days before the end. What is
missing is not a second killer surviving alongside the first.
It is the first killer arriving in time to matter — and, once
made, surviving the fights at home that take both of them
within ten days.

## Sense-test (this arm's own corpus, judged for meaning)

- The veteran-word collision reproduces for the sixth time
  (standaccum3 counted five). On 99211 the village is cheered
  "veteran kill" four times — for The Callback (d39, Quinn),
  The Redactor (d46, Emma), Ugly-Eyes (d46, Benoit), Ad Break
  (d51, Priya) — all wave-3 (or wave-2) kills that make no
  readiness veteran. The two kills that DO make one — the
  Congregations on days 79 and 90 — get no veteran cheer in
  anything the capture saw. Verbatim (d39): 📺 "Oh — OH.
  Everybody saw that, right? Quinn just put down The Callback...
  on CAMERA. That's a veteran kill, folks. REMEMBER the name."
  On 99215 the single wave-4 kill DOES get the cheer (d139:
  "Ji just put down The Strike..."), so the cheer is not
  absent for wave-4 kills generally — but on 99211 the word
  "veteran" is spent four times on kills that count for nothing
  toward the veteran bar, and never on the two that count.
  (Capture caveat, as in standaccum3: the say-channel only;
  whether the Congregation cheers fired outside it is not
  established.)
- The hold-beat silence reproduces. 99215 sits at gated 199
  (raw 210) and is never told why it is held, in anything the
  capture saw — the 15 "standing" matches in its transcript
  are pantry, storm, and scar lines. Same caveat as
  standaccum3: the day-stamps were not probed by this arm.
- Both 99211 killers died AT HAVEN, IN COMBAT (scholarDeath
  context: atHaven true, inCombat true; fallen cause recorded
  as the bare residual 'the wild'). This is NOT the open
  backlog item as stated ("THE EXPEDITION" deaths landing on
  at-haven scholars — deaths AWAY from combat): these killers
  died fighting at home, not away from combat. Recorded here
  as an adjacent shape, not chased: the scholar keeps fighting
  at haven and dying there, and the fallen cause string ('the
  wild') says nothing about where or how — the split comes
  only from the scholar-death context, the killerdeath residual
  lesson applied. No retained veteran on this band died away
  from combat.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- M3 VACUOUS AT n=1 (found by the corpus, not by re-scoring):
  on 99215 the pattern fires with a single kill (topShare 1.0
  by construction). The prereg's M3 was written for multi-kill
  seeds; at n=1 it shows "only one villager ever killed"
  rather than clustering. Proposed revision for the NEXT run:
  require >= 2 wave-4 kills on the seed for M3. Do not
  silently re-run this band under a revised rule; the verdict
  is UNDERPOWERED either way, so no verdict changes.
- UNDERPOWERED PRECEDENCE (analyzer order, disclosed): the
  analyzer checks banking < 4 BEFORE the GO/NO legs. The band
  confirms the gap (0 L>=2 days) and matches named mechanisms
  on both banking seeds — but the prereg forbids claiming GO/NO
  on < 4 banking seeds, and the analyzer honors that. A GO on
  n=2 banking seeds would be exactly the false-confirm the
  rule exists to prevent. The mechanism matches stand as
  observations in this evidence, not as a verdict.
- DEATH-BASED vs EXIT-BASED SURVIVAL: identical on this band
  (no killer was exiled; both observed exits were deaths), so
  the two medians coincide where observed (first-killer [10]
  vs [10]; all-killer [9, 10] vs [9, 10]). The distinction the
  prereg introduced (exit ends survival) had no bite here.
- FIRST-KILLER-SURVIVAL MEDIAN: not claimable (1 observed, 1
  censored; the prereg requires >= 3 observed). The single
  observed 10d is consistent with the 11d/9d priors — same
  order, n=1, not a re-measure.
- EXILES LIST IS NOT ONLY EXILES (footnote, from the corpus):
  99215's exile-list entry is gen_xcvuvtp day 24 how
  'ambushed' — the same villager also has a fallen entry that
  day (cause 'ambush'). 'Ambushed' removals land in BOTH lists.
  The fate logic is unaffected (only how == 'exiled' counts
  as 'exiled'; other hows are 'left:<how>'), but a future
  reader of `state.village.exiles` should not assume every
  entry is a sentence.
- DETERMINISM: the proof's live determinism + off/on
  neutrality legs pass (same seed twice identical; instrument-
  off trajectory unchanged at 10d). Mismatch days 0 on engine
  and live derivations — no death-day-boundary or banking-day-
  lag mismatches on this band (contrast standaccum2/3, which
  each had 2).
- HORIZON RULE: the post-run snapshot lands past the horizon
  and is included in snapshot counts and peak reads, as
  preregistered.

## Telemetry deviation check (loop-body step 10)

ATTEMPTED, refused by design: `node scripts/telemetry-check.js
--baseline .../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-05/perseed-killersim-a/*.json' --metrics
national,table,wins,exiled` exits refusing recorder-corpus
input ("all 8 --current rows carry top-level anchorCommit, so
they are sweep recorder rows, not runs"). Same refusal
standaccum3-b, killerdeath-b, and postblood-b hit. No LOUD line
exists to investigate; wall numbers are reported directly
above instead of via a forced flag.

## Balanced panel (§15)

INAPPLICABLE, stated not fabricated: single-arm diagnostic run,
no Game-root change and no policy variant to compare. No
balance-panel compare exists for it, and none is attached.

## Infrastructure notes (loud, as required)

- EPERM flap: NONE this run. All 8 corpus files wrote first-try
  via the file driver. Judged runtime ~4.5 minutes for 8 seeds
  (150d horizon).
- Safe-commit index clobber hit both commits so far (prereg,
  instrument) and was repaired the same way each time
  (HEAD-blob cacheinfo, verified `git status` empty + `git
  diff HEAD` empty + hash-object matches); commits always
  correct.
- Proof: `scripts/test-killersim-20261105.js` — 23/23 PASS
  (fate fixtures for every label incl. exile-before-death /
  death-before-exile, L(d) counting incl. same-day fleeting,
  M1–M4 pattern fixtures, verdict fixtures incl. GO / NO /
  UNDERPOWERED / INSUFFICIENT-DATA and the exit-vs-death
  median split, live smoke, live determinism, off/on
  neutrality).
- No push, no bump, no live verification (ship loop owns
  deploys). Coordinator merges via --ff-only; this worker
  reports its branch tip below.

## Next blanks, in order (proposals only — this arm builds nothing)

1. The band is thin the same way prior bands were thin (2/8
   banking, same as standaccum3's 2/8) — the simultaneity
   question needs a band that banks killers. A confirm on
   fresh seeds would face the same thinness. The next arm
   should say HOW it will get >= 4 banking seeds (longer
   horizon? a probe that manufactures the second killer?
   more seeds?) before running — otherwise it will re-measure
   UNDERPOWERED.
2. M4 on both banking seeds: first kills land in the last 30
   days of the run. If first kills are systematically late,
   simultaneity is downstream of late wave-4 unlocks — a
   wave-4-timing diagnostic (when does the village open wave
   4, and what sets that date?) is the named next blank.
3. Both 99211 killers died in combat at haven within 10 days
   of banking. Whether at-haven combat deaths are the main
   killer-drain (vs wild fights) is a named question for the
   killerdeath follow-up — the retention probe already showed
   deaths happen at home, where "stay home" is no protection.
4. Veteran-word collision, sixth sighting; hold-beat silence
   reproduced (99215 at gated 199, never told why).
5. M3 needs the n>=2-kills guard (metric review above).

## Proof and landing

- Proof: `scripts/test-killersim-20261105.js` — 23/23 PASS on
  the final code (see Infrastructure notes).
- Commits (this worktree branch sim-killersim-a; coordinator
  merges via --ff-only; ready for coordinator merge, pending
  ship — no push, no bump, no live verification by this
  worker): 83e001afb prereg, d55a16634 instruments + proof
  23/23, plus the pilot + evidence commit below (8-seed
  corpus; this evidence).
- Files: prereg + evidence in `evidence/2026-11-05/
  sim-killersim-a*.md`; per-seed JSON in
  `evidence/2026-11-05/perseed-killersim-a/` (8 files;
  instrument errors 0 on all 8); scripts
  `killersim-instrument-20261105.js`,
  `killersim-driver-20261105.js`,
  `killersim-analyze-20261105.js`,
  `test-killersim-20261105.js` (zero src/js anywhere in this
  arm).
- Worktree state at handoff: only committed work; no
  uncommitted leftovers beyond the pilot + evidence commit
  below (verified before reporting).
