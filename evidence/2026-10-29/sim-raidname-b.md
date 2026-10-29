# sim-raidname-b — dawn-raid narration: name the raid at fight start

Run: oversight-flesh-out-loop-b, arm sim-raidname-b
(run fleshout-loop-b-20261029T1730Z, axis food-economy).
Claims findings-backlog item #1445 (the coordinator marks
it — this arm does not edit the backlog file). Adjacent
backlog #1380 ("eyes on your bedroll" for never-slept
players) NOTED ONLY, not built, per the arm brief.

## Verdict against the pre-registered bar (judged ONLY against evidence/2026-10-29/sim-raidname-b-prereg.md, committed as 1969b7f3 BEFORE any judged leg, plus its amendment 6c58d279, also committed before the census was judged)

**GO — wording lands.** G1: raid-naming line in 25/25
dawn-raid fight tails on the re-run band. G2: 0 false
positives among haven creations (8 extra haven
line-gainers are entity-verified raid-born follow-ups;
6 outside-haven line-gainers are lingerer field
meetings, outside G2's haven scope, reported not
judged). G3: sense PASS on all three flagship tails
read end to end. G4: trajectories deep-equal
base-vs-on on non-say fields (16/16 files) and the
say diff is exactly the added raid lines modulo
12-line tail truncation (0 bad records). G5: proof
test green (15 pass, 1 SKIP), node --check clean,
quick check with NO NEW FAILURES vs base (see
Proof: base and changed trees both 284 passed, 6
failed, identical failing set — the 6 are
pre-existing on base, none attributable to this
arm). Commit message carries [needs-eyes]:
player-facing text Steve judges on his phone.

## Canon status (stated, not invented)

No canon doc covers raids or palisade sleep. The raid
rule lives only in a havenGrowth.js header comment
(reactive raids: 3+ world monsters, 3k+ pantry kcal,
7-day cooldown, 18% roll; without a palisade one
raider can reach the sleeping player via
pendingEncounter; with a palisade the watch holds
the wall). This arm invents no canon: the wording
names a mechanism the code already implements; no
mechanism, balance, or policy change.

## Base commit (pinned) + re-derived miss set (backlog #1446 honored)

Base: 6dccc8b5a (Version bump 07c440b05-20261029-172450).
Phase 1 re-ran the fightorigin driver on this base
(band 10710–10725, 30 days, substrate
COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
DEPOSITGATE=1, POLICY=insideevening) instead of
quoting fightorigin's miss set. Result: the miss set
is UNCHANGED from fightorigin on this base — 3 miss
mornings (10712/21, 10713/28, 10720/18), all three
dawn-raid mornings, same denom shape (36 morning
creations, 127 deaths, wave kills 83/8, median
survival 30). No further drift between fightorigin
and this arm: move counts match fightorigin's
confirm corpus on the pilot seeds (328/283/230/281/
225/214/182/261). The #1446 drift (10722/30 out,
10713/28 in) is therefore the CURRENT set, confirmed
twice now, not a one-run artifact.

## Phase 1 — census (the gap, confirmed — and bigger than the backlog said)

Census definition (prereg as amended): a dawn-raid
morning is a morning interval (evening inside →
next morning snapshot) containing a fight creation
with (a) a havenRaidTick pending-setter for the
creation's monster since the previous creation,
(b) BREACH status reported (see amendment), (c) the
fight inside the haven.

- Morning creations on the band: 36 (33 haven).
- Dawn-raid mornings: 25. Dawn-raid fights: 25.
  Every seed except 10718 has at least one; the full
  list is in sim-raidname-b-analysis.json. The
  backlog's "3 miss mornings" framing understated
  the phenomenon: raids are COMMON (a raid fires
  roughly weekly once the pantry smells), and most
  dawn fights — not just the three that pull the
  player outside — are raid-born.
- BREACH-only vs raid-named, pre-change: 0/25 tails
  contain any raid-attributing line. 11/25 contain
  the BREACH lines in the recorded tail; the other
  14 do not — either BREACH was already spent
  (fireCrisis dedupes: one BREACH per run, see
  amendment) or the 12-line tail window pushed it
  out. Either way, BREACH never names the raid:
  it fires for ANY haven fight.
- Say-window interleaving, pre-change: 1/25 tails
  contain a casualty line (10713/28, Rasha falls).
  RE-READING CORRECTS fightorigin's note: that fall
  is NOT raid aftermath interleaved into the window.
  The creation fighters snapshot is taken AFTER
  startCombat returns — after the opening turns in
  node — so Rasha entered the fight alive (feverish,
  hurt) and died in the fight's own opening
  exchange (Hushpuppy 3 hits for 12, she falls).
  The unit test corroborates: a villager set to 0 HP
  before startCombat is NOT seated in the fight at
  all. The interleave reading is therefore
  withdrawn as a mechanism claim; what remains is
  the pure raid-naming gap (0/25), which is what
  Phase 2 fixes. The aftermath line below is kept
  as a guard for a genuinely pre-dead seated
  fighter; it fired 0 times on this band, which is
  the correct outcome for a case that did not occur.
- Excluded, reported: 1 further raid-born hall fight
  (10718/11, anaconda) falls outside the prereg
  morning-interval definition (evening 10 was
  outside) and is NOT counted in the 25. Counting
  it would give 0/26 raid-named — same verdict.

## Phase 1 — sense (pre-change tails, read end to end)

10712/21 (murkcap), 10720/18 (hushwolf pack),
10713/28 (hushwolf pack): all three read as
coherent fights — breach announced (when the run
had not already spent it), monster named, villagers
named — but NONE says the fight arrived as a raid.
A waking player cannot distinguish "the raid came
for us" from "a monster wandered in." That is the
CONFIRMED GAP. The 10713 tail additionally shows a
villager dying in the opening exchange with no raid
context attached — brutal, legible as a fight, but
the raid framing is missing. Sense verdict
pre-change: GAP CONFIRMED (0/25 raid-named).

## Phase 2 — the wording change (what landed, and why it took two flags)

Files: src/js/havenGrowth.js (draft mark + pending
shadow set), src/js/game.js (startCombat raid line
+ aftermath guard + 5 pending-overwrite clears),
src/js/feastBuff.js (1 pending-overwrite clear).
NARRATION ONLY — no spawn, draft, damage, crisis,
economy, or policy value is touched anywhere.

The line (game.js startCombat, said last so it
survives the fight-start window):
> 🐗 This one came with the raid on Haven — it was
> with the teeth at the door, not a lone wanderer.
The aftermath guard (same block, only when a
villager fighter is already dead at the fight's
opening line, i.e. before the opening turns):
> 🕯️ <names> already fell to the raid before this
> fight — they do not rise for it.

MECHANISM PIVOT (the run's main technical finding,
stated not hidden): the first implementation used
ONLY an entity flag (raidBorn, set on drafted
raiders; startCombat names the fight when the
lifted tile monster carries it). It named just
4/25 dawn-raid fights. Debug (temp instrumented
driver, not committed) showed why: pending-resolved
fights are INSTANTIATED BY SPECIES ID — startCombat
builds fighters from the monster def — not lifted
from the world entity. The drafted raiders wander
off the haven tile before morning (10712's raid
murkcaps sat at (4,3)/(3,4)/(5,4) around the haven
tile (4,4) at fight time, hp 9/4/12 from defender
fights, while the fight's murkcap entered fresh at
65/65), and several raiders share the tile, so the
tile monster is often a different raider — or
nothing at all (10712: playerMonster() null at
fight time). The fix adds the pending shadow:
havenRaidTick sets Game.raidPendingMonsterId
alongside pendingMonsterId; startCombat matches
mid against it (the harness clears only the two
pending fields, so the shadow survives to the
fight), consumes it on match, and every non-raid
pending overwrite (feast draw, wanderer, tent
breach — 6 sites) clears it so it can never
stale-match a later same-species fight. The entity
flag is kept as the second provenance (a lingering
raider met later is still named). Union: 25/25.

## Post-change results (same band/seeds/substrate, driver unchanged)

- G1: 25/25 dawn-raid tails contain the raid line.
- G2: haven line-gainers total 33 = 25 dawn-raid +
  8 follow-ups. The 8 are daytime monsterTurn
  fights against the same raid's drafted raiders
  (10711/8 gallowdeer + murkcap, 10714/9
  gallowdeer, 10717/8 anaconda, 10719/26 hushwolf
  ×2, 10721/9 gallowdeer) plus the 10718/11
  shadow-verified pending fight counted among the
  8 by the proof's rule — each entity-verified by
  a temp instrumented run (tile monster raidBorn,
  or shadow match at startCombat entry) before
  judging. 0 false positives. A genuine non-raid
  control on the band (10714 giant_mosquito,
  raidBorn false, no shadow) correctly stays
  unnamed.
- Outside-haven line-gainers: 6 (lingerers met in
  the field, e.g. 10720/19 hushwolf, 10720/20
  bulldozer). True raid-born meetings, outside
  G2's haven scope, reported not judged.
- Aftermath line: fired 0 times on the band
  (correct: no fighter was pre-dead at any fight's
  opening line). Unit T2 SKIP: a 0-HP villager is
  not seated by the engine, so the unit path
  cannot stage the guard; the guard's code path is
  covered by T1/T1b's shared block and by the
  corpus zero-fire (it did not misfire once).
- Neutrality: non-say fields deep-equal on 16/16
  files (positions, moves, deaths, wave kills,
  days alive, fighters incl. HP, outcomes, taps).
  The only non-say diffs found in the first
  comparison were stackLines source line numbers
  shifting with the edit itself — normalized
  explicitly in the proof (see metric review).
  Say diff: per-record, on-tail minus inserted
  lines is a suffix of base-tail (12-line window
  truncation) or exact (tap windows); 0 bad
  records. BREACH visible-in-tail moved 11 → 10:
  one tail's BREACH line was pushed out of the
  12-line window by the added raid line — a
  window artifact, not a narration removal (the
  BREACH beat still fires; the stream is unchanged
  except the added lines).
- Miss mornings post-change: still 3, same seeds
  and mornings (10712/21, 10713/28, 10720/18).
  Trajectories did not move.

## Phase 2 — sense (post-change tails, read end to end)

10712/21: BREACH + fight intro + raid line last —
"a raid fighter, named as such." 10720/18: same
shape with the pack. 10713/28: opening exchange
kills Rasha, then the raid line, then the threat
warning — the pack's raid origin is now attached
to the fight that killed her. In real browser play
the line reads even better than in node: opening
turns are async there, so the raid line appears
BEFORE the first blows, not after them. Sense
verdict post-change: PASS on all three.

## Village assessment (plain words, within what 30-day instances can say)

Sixteen month-long villages, all surviving to day
30 (median 30, every instance 'survived') — the
same insideevening shape as fightorigin: the
player comes home, sleeps in the hall, and wakes
to a raid-born fight on 25 mornings out of 480
village-days (roughly one dawn raid a fortnight
per village, plus daytime raider meetings). The
raid is not a rare event in these villages; it is
the weather. What was missing was one sentence:
that the thing in the hall came with the raid.
Blank filled: that sentence, on every raid-born
fight, with the provenance to prove it (pending
shadow + entity flag, consumed/cleared so it
cannot lie later). Blank documented, not filled:
whether a raid should be able to reach a sleeper
at all, and the #1380 "eyes on your bedroll"
question for never-slept players — both design
questions for Steve, not measurement verdicts.

## Wall numbers (30-day legs)

- National / table / wins: NOT OBSERVABLE inside
  30-day instances — reported as not claimed,
  never as zeros. Scale stays 'village', standing
  0 on all 16 seeds (corpora scaleLast/standingLast
  as in fightorigin).
- Wave reach: max wave unlocked 1 on 3 seeds, 2 on
  12 seeds, 3 on 1 seed (10714, as fightorigin);
  wave 4–5 reach 0. Wave kills total 91 (wave 1:
  83, wave 2: 8). Median survival: 30 loop-days
  (all 16 survived to the 30-day cap); max 30.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

No balance-panel compare .md is produced, as
pre-registered by analogy to the fightorigin
precedent: this leg is a narration change on
30-day instances, and panel metrics (national /
table / wins, wave reach) cannot move — and cannot
even be observed — inside 30-day instances. The
before/after instrument is the fightorigin corpus
on identical seeds (OFF/ON neutrality, above),
and the pre-registered GO bar is the judge.

## Metric review (MEASUREMENT.md §14)

- Judged ONLY against the prereg as amended before
  the census was judged. The amendment (BREACH
  once-per-run + 12-line tail truncation) is the
  metric review's first item: without it the
  census definition would have excluded the
  flagship 10713/28 fight (its run spent BREACH
  at loop-day 11) and misread tail absence as
  stream absence. No mid-judging re-score: the
  census band, substrate, GO bar, and neutrality
  gate are unchanged from the prereg.
- Second instrument correction, during Phase 2
  (not a metric change): the first implementation's
  entity-flag-only mechanism named 4/25 and was
  NOT judged as the outcome — the mechanism was
  fixed (pending shadow added) and the band
  re-run, because a 4/25 mechanism is a broken
  instrument for the prereg's G1, not a verdict
  on the wording idea. The judged outcome is the
  re-run (25/25). The 4/25 intermediate is stated
  here, not hidden, and the debug that diagnosed
  it (pending fights instantiate by species id)
  is a mechanism finding, not a metric revision.
- Third correction, in the proof test (also not a
  metric change): (a) stackLines stripped from the
  neutrality comparison — source line numbers
  shift with any edit, so they are edit artifacts
  exactly like fightorigin's timestamp ids; the
  strip is explicit in the test, and the first
  failing comparison's diffs were stackLines ONLY
  (verified by path-level diff before normalizing).
  (b) G2 automated rule scoped as the prereg
  scopes it (haven creations) with tile-monster
  fights and shadow-verified pending fights as
  legitimate follow-ups, and entity-level DBG
  verification for this band's 8 haven follow-ups
  (tile monster raidBorn or shadow match at
  startCombat entry). (c) Say-diff rule corrected
  to window semantics (suffix after removing
  inserted lines for capped tails): the naive
  whole-stream walk counted lines pushed out of
  12-line tails as "removed narration," which is
  false — the stream is unchanged except the
  added lines; only the recorded window truncates.
- Residual risks, stated for the next run: (1)
  species-id collision — a non-raid monster of
  the same species as a raidBorn lingerer stacked
  on the same tile could inherit the (b) path's
  line; no such case on this band (DBG-verified),
  but the (b) path is species-blind by construction
  for driveContests fights. (2) The aftermath guard
  has never fired in a corpus (0 times) or a unit
  (engine does not seat 0-HP villagers) — it is a
  guard for a case the engine may make impossible;
  a future arm should either prove a firing case
  or remove it. (3) The raid line's node position
  (after opening turns) vs browser position
  (before them, async) is untested in a browser —
  the [needs-eyes] commit flags this for Steve's
  phone check, which is the real gate.
- G5 note (not a re-score): the prereg's "quick
  check green" cannot be met literally on this
  base — base itself fails 6 quick tests. The
  arm's G5 evidence is therefore the base-vs-
  changed comparison (identical 284/6, identical
  failing set), i.e. no-new-failures, with the
  six named in Proof. A future arm should not
  re-claim "quick green" without first landing
  fixes for those six or re-baselining the suite.
- No revision proposed for the next run's metric
  except: future raid-narration arms should record
  the full say stream (not 12-line tails) so
  window truncation stops being a confound, and
  should carry _origin raidBorn in the recorder so
  G2 needs no DBG side-run.

## Proof

- `node scripts/test-raidname-b.js --corpus
  evidence/2026-10-29/sim-raidname-b-corpus-on
  --base-corpus
  evidence/2026-10-29/sim-raidname-b-corpus` —
  PROOF-GREEN: T1 raidBorn unit (3 pass) + control,
  T1b pending-shadow unit (6 pass: fires, consumes
  on match, silent + kept on mismatch), T2 SKIP
  (engine does not seat 0-HP villagers; corpus
  zero-fire, no misfire), T3 G1 25/25, G2 bad=0
  (follow-ups 8, outside-haven 6), G4 16/16
  non-say deep-equal + 0 bad say records.
  RESULT pass=15 fail=0 skip=1.
- Census: `node scripts/analyze-raidname-b.js
  --corpus evidence/2026-10-29/sim-raidname-b-corpus
  --out evidence/2026-10-29/sim-raidname-b-analysis.json`
  (pre-change: 25 dawn-raid mornings, 0/25
  raid-named) and `--corpus ...-corpus-on --out
  ...-on-analysis.json` (post-change: 25/25
  raid-named, miss mornings still 3).
- `node --check` clean on src/js/game.js,
  src/js/havenGrowth.js, src/js/feastBuff.js,
  scripts/analyze-raidname-b.js,
  scripts/test-raidname-b.js.
- `node scripts/check.js --quick` — NOT green on
  either tree, and identically so: BASE (src
  reverted to 6dccc8b5a, worktree otherwise
  unchanged): 284 passed, 6 failed in 532s;
  CHANGED tree: 284 passed, 6 failed in 398s.
  Failing set identical both runs:
  godpath/test-measurement-proof-update.js,
  godpath/test-measurement-workflow.js,
  godpath/test-mobile-combat-cadence.js,
  godpath/test-occupation-panels.js,
  godpath/test-phone-frame-proof.js,
  test-establishment-r20-fixes-20261020.js
  (racks-full voice gate). All six are stale-proof /
  stale-evidence / pre-existing failures that
  reproduce on base without this arm's changes;
  none touches raid, pending, or startCombat code.
  Separately, test-raidcallers-b's two non-hygiene
  failures (corpus validity, det-gate counts)
  also reproduce on base src, and the raid-area
  tests (raid-player-encounter, raiddef,
  crisis-raid-defense-beat, reach-raid) pass with
  this arm's changes. G5 is therefore met as
  no-new-failures; "quick green" is unachievable
  for any arm on this base, and claiming it would
  be false. The base-vs-changed logs were compared
  from .raidname-backup/ (scratch, deleted before
  commit — not part of the landing).
- Phase 1 corpus: evidence/2026-10-29/
  sim-raidname-b-corpus/ (16 files). Phase 2
  corpus: evidence/2026-10-29/
  sim-raidname-b-corpus-on/ (16 files). Analyzer:
  scripts/analyze-raidname-b.js. Proof:
  scripts/test-raidname-b.js.
- [needs-eyes] on the game-code commit:
  player-facing raid wording + browser ordering
  note (line before first blows in browser, after
  them in node) for Steve's phone check.

## Notes (coordinator backlog — goal hidden_files NOT edited by this arm)

- [for coordinator: mark #1445 FIXED-by-landing]
  Dawn-raid fights now name the raid at fight
  start (25/25 tails on band 10710–10725, 0 false
  positives among haven creations, trajectories
  deep-equal). Mechanism: havenRaidTick pending
  shadow (raidPendingMonsterId, consumed on match,
  cleared on non-raid pending overwrite) + entity
  raidBorn flag for lingerers. Residuals: (1)
  species-collision caveat on path (b), none on
  band; (2) aftermath guard never fired (0 times)
  — prove a firing case or remove it next time;
  (3) browser ordering untested — [needs-eyes].
- [correction to fightorigin's sense note, for the
  record] 10713/28's Rasha fall is the dawn fight's
  own opening exchange, NOT night-raid casualty
  narration interleaved into the window (creation
  snapshot is post-opening-turns; engine does not
  seat 0-HP villagers). The gap was raid-naming
  only, now fixed. No backlog edit by this arm.
- [not chased] Backlog #1380 ("eyes on your
  bedroll" for never-slept players): noted as
  adjacent, not built, per the arm brief.

## Convergence line

raidname-wording — GO: on band 10710–10725 (30d,
insideevening) the census finds 25 dawn-raid
mornings (0/25 raid-named pre-change; the backlog's
3 miss mornings understated a weekly phenomenon);
the wording change (raidPendingMonsterId pending
shadow + raidBorn entity flag, narration-only,
consumed/cleared so it cannot stale-match) names
the raid in 25/25 dawn-raid tails post-change,
with 0 haven false positives (8 entity-verified
follow-ups, 6 outside-haven lingerer meetings
reported), trajectories deep-equal 16/16 and say
diff exactly the added lines modulo tail
truncation; proof PROOF-GREEN (15 pass, 1 SKIP);
miss mornings unchanged (3, same seeds); wall
numbers on the band: national/table/wins NOT
OBSERVABLE (30d), wave 4–5 reach 0, median
survival 30. GO — backlog #1445 fixed by landing;
residuals: species-collision caveat (none on
band), never-fired aftermath guard, browser
ordering for [needs-eyes].

## Verdict (judged against the pre-registered bar, not re-scored): GO
