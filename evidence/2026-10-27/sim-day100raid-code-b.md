# sim-day100raid-code-b — is a day-100 unanswered-raid take reachable at the horizon edge?

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261027T1130Z, axis
food-economy. Arm: sim-day100raid-code-b.
DIAG/measurement only: ZERO src/js changes, no default flips, no game-code
lever. This arm does NOT re-judge the raiddor GO, the raidday100
DIAG-NO-GO, or any earlier verdict — their verdicts stand in their own
evidence. Its verdict is ONLY the two code-read subquestions below.
Judged ONLY against evidence/2026-10-27/sim-day100raid-code-b-prereg.md
(committed as e2ca79805 BEFORE any judged run).

## Verdict against the pre-registered GO: REACHABLE

GO required ALL of (a1), (a2), (b1), (b2) — all hold:

- (a1) YES: the endDay chain executes villageAgencyDaily with day == 100
  inside a 100-day run, the take branch is unconditional code in that
  function, and the read-only recorder observes a day-100
  villageAgencyDaily call in a real 100-day run (seed 10133, both
  recorder modes — see "Recorder runs" below).
- (a2) YES: the screen corpus reconciles exactly — 53 demands, 52
  takes, take == demand + 1 on every matched pair, the single hanging
  demand identified (seed 10133, day 100), no demand dated 99 anywhere
  in the screen.
- (b1) YES: snapshot-before-sleep ordering in the runDays loop,
  membershipDaily-before-increment ordering in the endDay wrap, and
  the analyzer's raid100 definition (r.day === lastSnapDay) are all
  cited — a day-99 demand's take would be dated 100, post-snapshot,
  and counted.
- (b2) YES: scripts/test-day100raid-code-b.js is GREEN (all checks
  pass, by its own reads of the code and the corpus).

So the day-100 take is REACHABLE, not structurally blocked. The
raidday100 screen's 0/40 (0/60 combined) is explained, not mysterious:
no day-99 demand was ever staged in the screen, and the one day-100
demand (10133) cannot take inside a 100-day run — its take needs a
day-101 endDay that never runs. The next arm should SPEND SEEDS:
screen for a seed with a day-99 demand; its day-100 take will
exercise the post-snapshot raid adjustment. No code fix is needed.
The adjustment stays defense-in-depth until that seed is found.

## Prereg header (MEASUREMENT.md §§11, 14)

- Primary metric: the two subquestions, answered definitively with
  file + line citations + a runnable proof script re-deriving the
  answer.
- GO threshold: verbatim from the prereg (see "Verdict" above).
- Horizon + why: 100 days, death-aware — the horizon the boundary
  question lives on. The recorder seed 10133 survived (daysAlive 100,
  endReason survived).
- Seeds: NO new seed band screened, NO judged sweep run. The only new
  compute is recorder runs of screen seed 10133 (already spent by
  raidday100, re-run as substrate with the prereg's recorder — stated,
  no freshness claim). The screen corpus is read-only and untouched.
- Policies: competent-nofeast exactly as raidday100
  (COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
  FEASTSCALE_R13 off).
- Base: NO pin. Current master HEAD at prereg time:
  6995ba7e6f34fb8c4ad2e6fc05f6bc2c6b6440b2, unchanged through the
  run. The raidday100 screen base was 6ae5049d8; the ONLY src/js
  difference between the two bases is a build-version stamp
  (src/js/build.js, one line, trajectory-neutral) — verified by diff,
  so the screen corpus remains a valid current-base trajectory for
  the sweep instrument (and the sweep re-run below reproduces it
  exactly).

## Subquestion (a) — does villageAgencyDaily run its raid branch on day 100? YES

The call chain, with line numbers on the prereg base (proof
re-derives all of them):

- src/js/membership.js:1139-1143 — the endDay wrap: `var _endDay =
  G.endDay; G.endDay = function () { try { this.membershipDaily(); }
  catch (e) {} return _endDay ? _endDay.call(this) : undefined; };`
  membershipDaily runs BEFORE the original endDay body, at the day
  boundary, every day.
- src/js/hierarchy.js:3657-3660 — the membershipDaily wrap:
  `G.membershipDaily = function () { try { if (this.hierarchyDaily)
  this.hierarchyDaily(); } catch (e) {} return _membershipDaily ? ... }`
  hierarchyDaily runs first inside membershipDaily.
- src/js/villageAgency.js:1352-1357 — the hierarchyDaily wrap:
  `G.hierarchyDaily = function () { var r =
  _hierarchyDaily.apply(this, arguments); try { if
  (this.villageAgencyDaily) this.villageAgencyDaily(); } catch (e) {}
  return r; };` villageAgencyDaily runs after the original
  hierarchyDaily, every day.
- src/js/villageAgency.js:172-208 — villageAgencyDaily itself. The
  _vaSimInner loop runs FIRST (line ~177: `this._vaSimInner(ovs[i])`
  — staging happens here, via _vaFamineAct -> _vaStageRaidDefense,
  which stamps `pendingRaidDefense.day = scholar.day`), and THEN the
  take branch (line 200): `if (pr && day > (pr.day || 0)) { ...
  taken = this._removePantryKcal(800) ... }` (line 203). The branch
  condition is exactly `day > pr.day` — no day guard of its own, no
  horizon check, no closing-day exception. A demand staged on day 99
  therefore fires on the FIRST villageAgencyDaily call with day >=
  100. A demand staged in the same call can never fire in that call
  (day > day is false) — the one-day lag is structural, and it is
  exactly the observed demand+1 take rule.
- The famine staging guard (villageAgency.js _vaFamineAct): `if
  (this.state.pendingBeg || this.state.pendingRaidDefense) return;`
  — a pending day-99 demand is NOT clobbered by a day-100 staging
  attempt. The day-99 demand survives to the day-100 take branch.
- Independent corroboration from the corpus itself: every
  raidRecord's stack trace reads `_removePantryKcal` <-
  `villageAgencyDaily (src/js/villageAgency.js:203)` <-
  `G.hierarchyDaily (src/js/villageAgency.js:1356)` — the take
  branch, reached through the wrapped chain, on every recorded take.

Dynamic proof (recorder, seed 10133): a villageAgencyDaily call with
day == 100 executed in a real 100-day run — observed in BOTH recorder
modes (plain pure-recorder mode AND faithful sweep-replication mode;
see "Recorder runs"). In the faithful mode the day-100 call record
is: pendingBefore null, pendingAfter 100, staged true, takeFired
false — the call ran, staged the day-100 demand, and the take branch
evaluated day 100 > 100 = false. The same branch, with a pending
day-99 demand, evaluates 100 > 99 = true and fires. There is no
day-100 exception anywhere on this path.

## Subquestion (b) — does the horizon include the day-100 endDay take? YES

All three ordering facts, with citations:

(i) The take runs inside the 100-day run. scripts/sim-harness.js
runDays loop (`for (day = 1; day <= days ...)`): policy.daily runs
(line ~574), then `Game.sleep()` (line ~581), inside the SAME loop
iteration. sleep() ticks the day budget to its end; src/js/game.js
tickAction fires `this.endDay()` when `s.dayTicks >=
T.TICKS_PER_DAY`. The day-100 iteration's sleep therefore runs the
day-100 endDay before the loop exits. A wait tick crossing the day
boundary inside the run would fire the same endDay earlier — either
way, the day-100 endDay is inside the run.

(ii) The take is dated 100, not 101. The membershipDaily chain runs
BEFORE the original endDay body (membership.js wrap, above), and
`scholar.day += 1` sits inside the original endDay body
(src/js/game.js:31486), after the chain. So at the day-100 endDay,
villageAgencyDaily sees scholar.day == 100, the take fires with
recorded day 100 (the capture stamps `dayOf()` = scholar.day at
_removePantryKcal time), and only then does the day roll to 101.

(iii) The take is post-snapshot and counted. The sweep's wrapped
policy.daily runs competent.daily and THEN takes the spoilDays
snapshot (scripts/sweep-raidday100-b.js wrappedPolicy.daily) — the
day-100 snapshot is taken during loop iteration 100, BEFORE that
iteration's sleep/endDay. So a day-100 take fires strictly AFTER the
closing snapshot, exactly the adjustment's case. The analyzer counts
it: scripts/analyze-raidday100-b.js:291 defines `lastSnapDay` as
the last spoilDays entry's day (100 on a surviving seed), and line
307 accumulates `raid100` from records with `r.day ===
lastSnapDay`. A day-100 take on a surviving seed is raid100 > 0.

What is NOT included: a day-101 take. The day-100 demand's take
needs the day-101 endDay, which a 100-day run never reaches — that
is why 10133's demand hangs (53 demands, 52 takes). And the
residualhunt day-101 sweeps (spoil sweeps dated 101, recorded at the
day-100 endDay's dawn after the increment) are a separate boundary
artifact: they are dated past the closing snapshot, while the raid
take is dated ON it. The horizon includes the day-100 take but not a
day-101 take — the boundary is the endDay itself, not the snapshot.

## The screen, reconciled (the 0/60 explained)

Recomputed from the screen corpus by the proof (not hand-copied):

- 40 files, 53 demands, 52 takes. On every seed, takes ==
  demands+1, except the single hanging demand: seed 10133, day 100.
- Demand days observed: 15, 20, 21, 28, 35, 40, 41, 44, 45, 46, 48,
  49, 50, 52, 54, 57, 58, 59, 60, 61, 64, 65, 67, 68, 71, 72, 74, 76,
  77, 78, 79, 80, 82, 83, 86, 90, 92, 95, 96, 98, 100 — no 99. Takes
  max day 99. No take dated > 99, no demand dated 99.
- The 0/60 is therefore a sampling fact (no day-99 demand in 60
  seeds), not a structural block. Day-99 demands are possible in
  principle (days 98 and 100 both occur as demand days); the screen
  just never rolled one. A future screen for a day-99 demand is a
  search, not a fix — no code change is needed to make the take
  reachable.

## Recorder runs (the dynamic proof, and an instrument finding)

Two recorder runs of seed 10133, both 100 days, both observing a
day-100 villageAgencyDaily call:

1. PLAIN mode (pure recorder: only the villageAgencyDaily wrapper +
   treeline say wrapper, no sweep captures). Result: demands
   15/61/73, takes 16/62/74/79/84, day-100 call with pendingBefore
   null, pendingAfter null, no staging. DIVERGES from the corpus
   trajectory — and the divergence is the finding below, not a
   verdict problem: the day-100 call still executed.
2. TRACE_FULL mode (faithful sweep replication: all sweep captures
   + wrapped policy + the sweep's death wrapper, replicated
   exactly). Result: demands 64/68/72/100, takes 65/69/73 —
   EXACTLY the corpus pattern (all counts identical, same demand/
   take days). Day-100 call: pendingBefore null, pendingAfter 100,
   staged true, takeFired false. Take-branch fires recorded at
   65/64, 69/68, 73/72 — demand+1, exactly.

INSTRUMENT FINDING (loud, affects the ledger arms' corpora):
the raidday100 sweep's death wrapper SUPPRESSES the original
Game.registerDeath — it records deaths into its own array and never
calls the original (scripts/sweep-raidday100-b.js:184-196: `const
oDie = Game.registerDeath; ... Game.registerDeath = function (opts)
{ try { ...deaths.push... } catch (e) {} };` — no `oDie(...)` call).
The original (src/js/corpses.js:148) does real stateful work:
deathSeen marking, per-roster deed credits (creditDeed
'death_in_family'), telemetry, and corpse creation with
`Math.random()` in the corpse id. Suppressing it shifts the RNG
stream from the first death onward — that is the whole plain-mode
divergence, proven by the bisect (captures, policy wrapper, mode
string, and vad wrapper were each eliminated; only the death
suppression reproduces the corpus). CONSEQUENCE: sweep corpora
(stockdoors, raiddor, raidday100) are suppressed-registerDeath
trajectories, NOT plain-game trajectories. Their internal
comparisons stay valid (the suppression is present in both det-gate
runs and in every sweep run, so on-vs-off comparisons are
apples-to-apples), but no sweep corpus trajectory should be cited
as "the plain game's trajectory" — and any future recorder that
wants to reproduce a sweep corpus must replicate the suppression.
The judged recorder run for this arm is the TRACE_FULL faithful
replication; the plain-mode run is reported here as the diagnostic
that exposed the suppression. The day-100 call observation holds
under BOTH instruments, so it is not an artifact of either.

## Proof (scripts/test-day100raid-code-b.js — GREEN)

Run on the prereg base; all checks pass by the script's own reads:
chain links with line numbers (membership.js:1139/1141,
hierarchy.js:3657, villageAgency.js:1352, take branch
villageAgency.js:200, _removePantryKcal villageAgency.js:203,
increment game.js:31486, runDays policy.daily ~574 / sleep ~581);
staging-before-branch ordering; famine anti-clobber guard; loop
ordering (snapshot inside wrapped policy.daily, before sleep's
endDay); corpus reconciliation (40 files, 53/52, take == demand+1,
hanging 10133/100, no demand 99, max take 99); recorder log checks
(day-100 call observed, staged day-100 demand, demands/takes
reproduce corpus 10133 exactly, take-branch fires at 65/69/73);
analyzer legs (lastSnapDay from last spoilDays entry, raid100 via
r.day === lastSnapDay); hygiene (zero src/js modified, no files
outside this run's own files). Two proof-check string bugs were
found and fixed during the run (both in the proof script, neither in
the verdict): the sweep-snapshot check initially matched the
earlier opening-stock snapshot instead of scoping to the
wrappedPolicy.daily body, and the lastSnapDay check's needle missed
the `ps.` prefix — both fixed to the correct strings, same rule,
proof re-run green. The prereg itself was NOT amended.

## Reachability verdict (recorder seed only, not a band)

Seed 10133 (competent-nofeast, 100d): survived, wave 3, rank
village, 4 deaths. Waves 4-5, regional, national, table, wins: 0/1
(this arm measures a code path, not the wall — the raidday100 band
numbers stand: national/table/wins 0/40, waves 4-5 0/40, median
survival 100d). Arc II/III/IV, four-realm formation, trap
acquisition, counter discovery/kill, and young-link succession
survival are not recorded by this instrument and are not estimated
here.

## Wall numbers (unchanged by this arm)

National / table / wins: 0/40 (raidday100 band). Wave-4/5 unlocks:
0/40. This arm moves no wall number; it settles whether the next
arm's seed spend can move the ledger leg.

## Village assessment (plain words)

One village, watched at the level of a single night: Haven's
10133rd story ends with a threat that never lands — Peter of The
Bloodied II at the treeline on the last night, demanding food the
village never has to give, because the story stops before morning.
That is not a broken promise; it is the horizon doing exactly what
a horizon does. The three raids that DID land (days 65, 69, 73,
1,000 kcal each against a pantry holding hundreds of thousands)
were taxes, not famines — the village survived all 100 days, lost
four people to other causes, and never once lost a night's sleep
over the stores. What was missing was never food or courage: it was
a demand on day 99, the one night that would have let the ledger's
last untested subtraction prove itself. The blank this run fills is
the answer to whether that night can exist at all — it can. The
next run's job is to go find it.

## Sense transcript (SENSE-TESTING LAW — meaning, not just counts)

The day-100 demand that hangs (seed 10133, day 100): "🌙 Night.
Shouts from the treeline — Peter of The Bloodied II with 4 others,
and they're not here to talk. \"Your pantry or your blood. Choose.\"
(They want ~2,000 kcal.)" — the staging line, spoken by a named
champion of a named village, with the honest demand size. It has no
take line, because the run ends before the next endDay — the
narration is not lying; the story simply stops. The nearest
completed pair (seed 10109, demand day 98 -> take day 99): "🌙
Night. Shouts from the treeline — Dmitri of The Bloodied with 4
others..." then "🌙 You weren't at the treeline. Dmitri of The
Bloodied didn't wait — they hit the stores and melted back into
the dark with 1,000 kcal. The village will talk about this for a
long time." Ledger: day 99, Canned soup 4u x 250 = 1,000, asked 800
— the numbers match the narration exactly, as raidday100's did.
Nothing robotic, static, or repeated was found beyond the
mechanism's own honest whole-unit arithmetic (the 800-ask/1,000-take
shape). The "talk about this for a long time" tail is a social
consequence (opinion -5, journal entry), not flavor.

## Metric review (MEASUREMENT.md section 14)

- The pre-registered GO worked as written and the verdict follows
  from it: (a1), (a2), (b1), (b2) all hold, so REACHABLE. No clause
  was re-scored.
- Prereg assumption corrected in the open: the prereg's recorder
  section assumed a plain recorder run would reproduce the corpus
  pattern. It does not — because the corpus's own instrument
  suppresses registerDeath (see "Recorder runs"). The judged
  recorder run is therefore the faithful sweep replication
  (TRACE_FULL), which reproduces exactly; the plain-mode divergence
  is disclosed as a diagnostic, not hidden, and the day-100 call
  observation (the subquestion's dynamic leg) holds under both
  instruments. FUTURE PREREGS: state the recorder's instrument
  fidelity explicitly (faithful sweep replication vs plain game),
  and never assume a sweep corpus trajectory equals a plain-game
  trajectory. The sweep's death suppression should also be
  disclosed in the sweep header (it currently reads as a pure
  recorder; it is not — it changes game behavior by suppressing
  corpse/deed/telemetry processing). Whether to fix the sweep to
  call through to oDie is a coordinator/Steve call: calling through
  would change every future sweep trajectory (a new base for all
  ledger comparisons), so it must NOT be done silently mid-series.
- Proof lesson: string-match checks must scope to the right region
  (the opening-stock snapshot precedes wrappedPolicy.daily in the
  sweep file; a bare indexOf finds the wrong one). The two fixes
  above are check fixes, not verdict changes.
- Balanced panel (MEASUREMENT.md §15): NO comparison exists — this
  arm changes no lever and no game code, so there is no before/
  after to panel, exactly as raidday100 stated. The instrument
  before/after is: sweep corpus (suppression on) vs plain recorder
  run (suppression off) — reported above as the instrument finding,
  not forced into a panel.
- Infrastructure notes (loud): (1) After the prereg commit
  e2ca79805, the safe-commit index-clobber variant hit again
  (committed file staged-as-deleted in the main index) — repaired
  per the documented recipe (update-index --add --cacheinfo from
  the HEAD blob), verified git status clean + git diff HEAD empty
  + hash-object matches HEAD blob, before proceeding. The commit
  itself was correct. (2) No EPERM write flap blocked this run's
  writes. (3) Per-seed compute ~1.5s (sweep) / recorder runs ~10-36s
  wall under sibling load; no chunking was needed for a single-seed
  recorder.

## Reproduction check (this run)

- Prereg committed BEFORE any judged run (e2ca79805); judged runs
  are the recorder runs + proof run, all after that commit.
- Proof scripts/test-day100raid-code-b.js GREEN (exit 0, all checks
  PASS). No jest was run (nothing to test in jest — the proof is
  node, not jest). No [needs-eyes]: this lands a measurement, not
  a player-visible change.
- No game-code change: zero src/js files committed. Files in this
  arm's commits: prereg commit e2ca79805 (prereg) and the evidence
  commit (this file + recorder log + 2 scripts).
- Backlog: sim-findings.md line for the post-snapshot adjustment
  item is left for the coordinator to mark — this arm's verdict is
  REACHABLE (the leg CAN be exercised by a day-99 demand seed), so
  the item is NOT fixed by this run (no exercised seed yet); the
  coordinator should record it as still open with this evidence
  attached, pointing the next arm at a day-99-demand screen, not as
  fixed.

## Convergence line

The day-100 exercise blank is answered, not converged: a day-100
unanswered-raid take IS reachable at the horizon edge (a day-99
demand's take fires at the day-100 endDay, dated 100, post-snapshot,
counted as raid100). What remains is finding a day-99 demand seed —
a seed search, not a code fix. The post-snapshot raid adjustment
remains implemented but unexercised (0/60 seeds) until that seed is
found and its ledger closes with the adjustment.

## Verdict (judged against the pre-registered bar, not re-scored): REACHABLE

Both subquestions answer YES with citations and a green proof:
villageAgencyDaily runs its raid branch on day 100 (chain:
membership.js:1139-1143 -> hierarchy.js:3657-3660 ->
villageAgency.js:1352-1357 -> take branch villageAgency.js:200,
no day guard; recorder observes a day-100 call staging a day-100
demand), and the horizon includes the day-100 endDay take (runDays
policy.daily snapshot before sleep's endDay; membershipDaily before
the scholar.day increment at game.js:31486; analyzer counts
r.day === lastSnapDay). The screen's 0/60 is a sampling fact (no
day-99 demand staged; the one day-100 demand hangs for a day-101
endDay outside the run). Next arm: screen for a day-99 demand seed
— spend seeds, keep the adjustment as-is, no code fix.
