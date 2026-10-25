# sim-scale-onramp-round-1027 — coordinator evidence (axis scale-onramp — 1 DIAG arm LANDED, 1 arm BLOCKED and HELD for adoption, merged locally pending ship)

Run: fleshout-20261025T1027Z, loop A (oversight-flesh-out-loop). Sibling
loop B: no live claim at run start (all claims .DEAD); B's held
adoption trees (sim-packtail-b, sim-awayvoice-b) and all other lanes'
trees were NOT touched at any point. This run worked scale-onramp
(converging), taking the 0920Z next blanks (1) post-flee wounded behavior
and (5) a scoped field-death primary for the next companion. At most one
game-code arm could land; NEITHER landed as game code — one was blocked
by infrastructure before its control gate, the other is DIAG-only by
design.

## Pre-registration (binding, §14 — a miss is NO-GO, never re-scored)

Shared baseline, both arms: policy scripts/policies/tableseat-nowait.js,
seeds 73671–73678, 180d death-aware horizon (dead villages stop, +10d
tail max). Controls had to replicate the published 0644Z/0730Z/0920Z
numbers exactly before any arm was judged: national-ever 8/8, final 7/8,
table invited 5 / entered 4, wins 4/8 (lesser seat only), wave-4 5/8,
wave-5 0/8, kind-filtered villager deaths 27 (field 12, other 12, raid 1,
arena 1, tb 1), wins-excluded median 180d, all-runs median 150d.
Deaths are kind-filtered only (person/villager, non-scholar); mixed
harness totals are forbidden for cost bars. Wave guard is wave-4-or-win.
Survival judged COMPOSITION-PROOF (0730Z metric review, adopted 0920Z):
the wins-excluded median binds ONLY with ≥4 non-winners in both control
and armed; otherwise the full 8-seed distribution judges (armed all-8 mean
≥ control mean AND armed sub-100 deaths ≤ control + 1).
Field-deaths-per-exposure reported alongside raw counts; the raw count
still binds where a primary says so.

Arm 1 sim-postflee-a (FIELD, all waves): after a villager flees a field
fight ending below 25% max HP, the villager is skipped by
villagerMonsterTick and expedition-monster legs for the rest of that
calendar day, narrated at flee time in awayNews; raid, aid-crisis, break
line, arena/contest, and scholar never touched. PRIMARY (to be set from
the control class count before the armed run): routed same-day post-flee
field deaths. Guard legs as in the arm's pre-registration (field deaths
by class, composition-proof survival, national-ever ≥6/8,
wave-4-or-win ≥5/8, raid deaths ≤2, starvation+sickness ≤ control + 2,
directed probe). Pilot GO would have triggered a 12-seed confirm
(73679–73690) with pro-rata legs. If KILLED at pilot: revert ALL
game-code changes, commit the measurement record only.
Arm 2 sim-w123death-a (DIAG ONLY, zero src/js): classify all 12 control
field deaths by mechanism under a pre-registered priority order
(post-flee > nearly-dead > one-round ≥50% > multi-round grind > other),
report per-exposure rates by wave class, count post-flee same-day
re-encounters band-wide independently of arm 1, and propose the next
companion's scoped primary + bar. DIAG-GO bar (set up front): one class
other than "other" covers ≥5 and ≥50% of the 9 wave-1/2/3 field deaths,
with all members sharing one mechanism.

## Arm 1 — sim-postflee-a: BLOCKED, no verdict (container EPERM write flap)

No GO, no KILLED — the run could not reach its control gate, so nothing
is judged and no game code was changed or landed. This is a loud
infrastructure block, not a result. Worktree
~/workspace/worktrees/sim-postflee-a, branch sim-postflee-a, HELD with a
fresh heartbeat for adoption (NOT merged, NOT deleted, NOT touched after
the worker stopped). src/js diff EMPTY — no game code touched.
Uncommitted files only, all intended: evidence/2026-10-25/sim-postflee-a.md
(full binding pre-registration + run-status block with resume command),
evidence/2026-10-25/perseed-sim-postflee-a/ (4 intact control rows),
scripts/test-postflee-sweep.js (sweep + post-flee probe + read-only
summarize, node --check clean, WRITER_WAIT + ROWJSON_QUIET support).

What happened: the control sweep completed 4/8 seeds, then the container
EPERM write flap struck mid-write on seed 73675 (last good exec write
10:44 UTC, still failing at ~11:35 UTC, ~50 min — longer than the prior
20+ min incidents; disk fine at 25%). Control rows landed and intact:
73671 (93d), 73672 (106d, win), 73673 (134d, win), 73674 (180d) — matching
the published control per-seed days exactly, so replication was on track
when the flap hit. A WRITER_WAIT mode (row held in process memory, never
/tmp) completed seed 73675's sim but could not land its corpus row after
2+ retry rounds; the in-memory row is lost but reproducible (deterministic
sim, ~2 min). Shell output redirection to a file is also broken under the
flap (redirect target creates 0-byte, writes fail) — future runs must let
the runtime capture stdout, never redirect to a file.

Work completed before the block (ready for the resumed run): canon read
(CANON.md, MONSTER-WAVES.md, fieldFights.js header — no separate
field-fight canon doc, noted not invented). Re-meet mechanism confirmed
from code + the 73676 corpus rows: villagerMonsterTick re-rolls a fight
against a villager still standing on the monster's tile (both 73676 suburb
fights are day 171, same entity by mHp continuity 966); expedHurt already
shortens expeditions after a flee, so the tick is the open vector. Arm
designed and pre-registered (in the evidence header, before any armed
run): any field vFlee ending below 25% max HP flags the villager for the
rest of that calendar day — skipped by villagerMonsterTick and by
expeditionMonster legs, narrated at flee time in awayNews; all waves
(defended: prior arms were wave-4-only because their target was wave-4
one-shots; this blank's vector fires for every wave); raid, aid-crisis,
break line, arena/contest, and scholar never touched. PRIMARY bar to be
set from the control class count (routed same-day post-flee field deaths)
before the armed run, per the task's order. Directed probe designed (real
router fights, tick skip vs live control, raid/arena/scholar/expedition
gates, next-day expiry) — not yet run, since the arm is not implemented.

Resume command (after the flap clears), from the worker's run-status block:

```
cd ~/workspace/worktrees/sim-postflee-a
CONFIG=control SEEDS=73675-73678 DAYS=180 WRITER_WAIT=1 ROWJSON_QUIET=1 node scripts/test-postflee-sweep.js
```

Then summarize, set the PRIMARY BAR from the control class count,
implement the arm, probe, armed sweep. Do NOT substitute boughtflee's
control corpus for this run's control — the gate requires this run's own
re-run. Do NOT register a fresh tree for this arm — it would orphan the
partial corpus and the pre-registration.

New flap diagnostic detail (both workers, independently): file-tool
writes still succeed while exec writes fail, and reads/unlinks still
work. The flap appears scoped to the exec sandbox's write path, not the
filesystem itself. The coordinator's own exec writes worked throughout
this run (lock, claim, registrations, merges) — the flap hits per-agent
sandboxes, or intermittently, and must not be treated as a whole-machine
outage from one agent's report alone.

## Arm 2 — sim-w123death-a: DIAG-GO (commit 7a805a4b2, rebased from 5951cbdf7, record only)

DIAG ONLY: wave-1/2/3 field-death scope — post-flee re-encounter is 6/9
wave-1/2/3 field deaths. Zero src/js. Merged --ff-only after a clean
rebase onto the ship loop's mid-run master (see Infrastructure); rebased
files verified byte-identical to 5951cbdf7 on all 12 files; node --check
on the analyzer clean after merge; worktree released done-merged, branch
deleted, main tree clean at closeout.

Control gate: PASS on the trajectory-identical corpus (all 17 checks:
won 4/8, medians 150d/180d, national 8/8 + 7/8, table 5/4, wave-4 5/8,
wave-5 0/8, arc 4, death teles 261, villager deaths 27, split field 12 /
other 12 / raid 1 / arena 1 / tb 1). G2 neutrality PASS; check.js --only
fieldfight: 2 passed, 0 failed.

Classification table — all 12 control field deaths (priority order:
post-flee > nearly-dead > one-round ≥50% > multi-round grind > other):

| Seed/day | Villager vs monster (wave) | Rounds | Entry HP | Dealt / taken | Fled earlier same day? | Class |
|---|---|---|---|---|---|---|
| 73671/d89 | ursula_weber vs eater (4) | 1 | 0.87 | 0 / 103 | No | one-round ≥50% |
| 73672/d43 | priya_nair vs understudy (2) | 4 | 0.45 | 51 / 50 | YES — flee 73→45 HP, monster 105→70; death enters 45 / monster 70 | post-flee re-encounter |
| 73672/d56 | ethan_hunt vs ad_break (3) | 1 | 0.09 | 19 / 13 | YES — flee 32→9, monster 98→62; death enters 9 / monster 62 | post-flee re-encounter |
| 73673/d8 | gen_te50r63 vs gallowdeer (1) | 1 | 0.07 | 0 / 13 | YES — two flees 25→19→7, monster 114→93→69; death enters 7 / monster 69 (+ a bulldozer fight same day: 4 field fights in one day) | post-flee re-encounter |
| 73673/d107 | gen_in9ciwi vs suburb (4) | 1 | 0.52 | 0 / 69 | No | one-round ≥50% |
| 73674/d17 | diana_osei vs hushwolf (1) | 1 | 0.11 | 0 / 20 | YES — mFlee 97→39 (took 78 while monster fled), vFlee 39→11; death enters 11 | post-flee re-encounter |
| 73675/d30 | gen_uzmmgq0 vs nevermore (1) | 1 | 0.07 | 0 / 10 | No | nearly-dead entry |
| 73675/d146 | nina_petrova vs focus_group (3) | 1 | 0.11 | 0 / 23 | YES — flee 91→11 (took 80, dealt 0), monster 155→155; death enters 11 / monster 155 | post-flee re-encounter |
| 73676/d18 | gen_g8rx4z0 vs hushwolf (1) | 1 | 0.06 | 0 / 9 | YES — mFlee 100→30 (took 70), vFlee 30→6, monster 50→38; death enters 6 / monster 38 | post-flee re-encounter |
| 73676/d171 | visjoin_165 vs suburb (4) | 1 | 0.52 | 9 / 87 | No | one-round ≥50% |
| 73677/d67 | nora_wilson vs belltoad (1) | 3 | 1.00 | 0 / 105 | No | multi-round grind |
| 73677/d68 | gen_ed0l37r vs belltoad (1) | 2 | 0.73 | 0 / 76 | No | multi-round grind |

Totals: all 12 — post-flee 6, one-round ≥50% 3 (all wave 4, the
already-killed class), grind 2, nearly-dead 1, other 0. Wave-1/2/3 only
(9) — post-flee 6 (67%), grind 2, nearly-dead 1. DIAG-GO: one class other
than "other" covers 6 of 9 (bar was ≥5 and ≥50%), all 6 sharing one
mechanism.

The key mechanism (not just a count): in 6/6 post-flee deaths, the death
fight's entry HP exactly equals the flee fight's exit HP, and in 4/6 the
monster's entry HP exactly equals the flee fight's monster exit HP — the
same wounded monster, met again the same day, at flee-exit HP, with no
recovery between. Ethan's chain runs four ad_break fights over two days
(87→58→32→9→0). Overlap disclosed, not hidden: without priority order,
nearly-dead would read 6, not 1 — five post-flee deaths also entered
below 15%, because the flee fight(s) drained them there. Post-flee is the
cause; nearly-dead is its downstream state. The pure nearly-dead remainder
is exactly one death (nevermore).

Per-exposure rates (field deaths / field fights; fights exclude 122
evade rows): wave 1: 6/561 = 1.07%; wave 2: 1/239 = 0.42%; wave 3: 2/59 =
3.39%; wave 4+: 3/4 = 75% (denominator warning: only 4 wave-4+ field
fights — not a usable rate); wave 1/2/3: 9/859 = 1.05%; all field:
12/863 = 1.39%; including evade (sensitivity): 12/985 = 1.22%.

Post-flee same-day re-encounters, band-wide (counted independently, no
coordination with the sibling postflee arm): provable (same-array): 31
post-flee fights — 6 deaths, 25 survivals (the 6 deaths are exactly the 6
classified post-flee deaths). Co-occurrence (ceiling): 38 villager-days —
6 with a death, 32 survived-only. Lethality contrast: post-flee fights
kill at 6/31 = 19.4% vs 6/832 = 0.72% for all other field fights (~27×).
The 25 survivals (including villagers fleeing the same monster 3–4× in a
day and living) are a guard consideration for the next arm, not a
disqualifier.

Proposed next primary + bar (same band: tableseat-nowait, seeds
73671–73678, 180d death-aware, pilot 8 seeds) — the adoption arm's
pre-registration, to be confirmed by that arm before it runs: PRIMARY
post-flee re-encounter field deaths, exactly as defined above. GO
requires all of: post-flee deaths 6 → ≤2; total field deaths 12 → ≤9
(reduction must come from the post-flee class per the by-class table, not
relabeling); one-round ≥50% deaths ≤3 (must not grow); composition-proof
survival (wins-excluded median binds only if ≥4 non-winners in both
control and armed, else armed all-8 mean ≥ control 139.4d AND pre-day-100
deaths ≤ control 2 + 1); national-ever ≥6/8; wave-4-or-win union ≥5/8
(control 6/8); kind-filtered raid deaths ≤2 (control 1);
starvation+sickness ≤ control 6 + 2; plus a directed probe proving the
lever fires on a post-flee re-encounter with raid/arena untouched.
Confirm on 12 fresh seeds 73679–73690 with pro-rata legs (post-flee ≤3,
field ≤13, national ≥9/12, wave-4-or-win ≥8/12, raid ≤3,
starvation+sickness ≤ confirm-control + 3) against a same-seed confirm
control.

Coordinator deconfliction (required by the worker, done here): this
proposal sits on the sibling postflee arm's territory. It BECOMES that
arm's primary on adoption — the held postflee arm adopts this bar (its
own pre-registration already scopes its PRIMARY to the same routed
same-day post-flee class; the numbers are the same either way). No
second arm is spun up for the same class.

LOUD disclosures on the w123death record (read before reusing it):
1. Host EPERM flap blocked the worker's own corpus (from ~10:48 UTC,
   45+ min; shared writer lost seed 73672's armed row twice; a robust
   retry writer ran ~40 min without landing one write). What the worker
   did instead: its own re-run completed baseline 8/8 + armed 73671
   before the flap, and that portion matches the deathcensus corpus
   (same worktree, substrate, seeds, recorder) exactly — headlines,
   deaths, analysis, substantive fight fields (sole diff: a null
   awayNewsLast key in its rows). The classification above is analyzed
   over that deathcensus corpus, with the equivalence proven in the
   evidence file (17-check gate + transcript re-run for 73672,
   censusMatch=true). What does NOT exist: the worker's own armed corpus
   for 73672–73678 and its summary.json (a 0-byte corpse summary was
   deleted, not kept). If a future run requires a fully own-corpus gate,
   the --resume path exists and the classification must match this file
   exactly. This coordinator accepts the trajectory-identical equivalence
   for a DIAG verdict (the control gate passed on it, and the deathcensus
   corpus is itself a merged, reviewed record) — but a GAME-code arm
   landing on this band must still run its own control re-run, per the
   gate, and must not cite this equivalence as its control.
2. Analyzer bug found and fixed mid-run: the provable post-flee loop
   labeled every row "direct" (array-identity comparison against a fresh
   filter). Totals were unaffected; the source label is now tracked
   explicitly and totals re-verified (31 = 6 + 25).
3. Index clobber after safe-commit: the commit was correct (12 files,
   verified by blob hash), but the worktree index showed all 12 as staged
   deletions — the known safe-commit clobber class. Repaired via
   git update-index --add --cacheinfo per file; worktree verified clean
   (git status --short empty, git diff HEAD empty) before the coordinator
   merged. Nothing else in the worktree was touched.
4. Canon: CANON.md, MONSTER-WAVES.md, fieldFights.js header read first
   (no separate field-fight canon doc exists — noted, not invented).
   Sense quotes are the engine's own awayNews lines on the census
   trajectory (Priya d43, Ethan d56), transcribed verbatim from the
   transcript re-run's stdout because its /tmp sense-file write was also
   lost to the flap.

## Wall numbers (w123death control; DIAG, no lever moved)

National-ever 8/8, national-final 7/8, table invited 5 / entered 4,
wins 4/8 (lesser seat only), wave-4 reach 5/8, wave-5 reach 0/8, full seat
0/8, median survival 150d all runs / 180d wins-excluded, max arc 4.
Postflee partial control (4/8) matches the published days exactly and
claims nothing further.

## Village assessment (plain words)

Villages look as they have all week: region reached, most invited to the
table, four win the lesser seat, nobody reaches the full seat or wave 5.
The field deaths aren't mostly single heroic defeats — they're a
grinding same-day attrition where fleeing pauses a fight but doesn't end
the day's danger. Priya fled the Understudy at 73, met it again at 45, and
lost a fight she might have won fresh. Ethan bled 87 down to 9 across
four meetings and died on the fifth. Diana fought one hushwolf three
times in a day. Fix the space between fleeing and the next meeting — a
real way out, or a day to recover — and half the field deaths have
nowhere to come from. The rest need other fixes: three wave-4 one-shots
(already scoped and killed as cures), two villagers who couldn't scratch
a wounded toad (open mystery, see below), one villager caught hurt by a
Nevermore with no flee in the story.

## Telemetry deviation check (step 10)

Ran node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-25/perseed-sim-w123death-a/*.json' --metrics
national,table,wins,exiled, and the same check on
'evidence/2026-10-25/perseed-deathcensus-a/*.json' (the corpus of
record). W123death corpus: 3 LOUD lines (national baseline 12 -> current
0, n=9 files; table 16 -> 5, -69%; wins 16 -> 0). Deathcensus corpus: 2
LOUD lines (national 12 -> 0, n=17 files; wins 16 -> 0). Verdict: ARTIFACT
CLASS, baseline NOT rolled, no new investigation. The baseline file
itself labels its regime "winseat — full win-side win stack" and warns:
"DO NOT compare pre-seat / courtship / readiness substrates against this
baseline — wins are structurally ~0 there and telemetry-check will fire
a spurious LOUD 'wins disappeared'." This band is courtship + seat legs,
and — decisively — the checker reads 0 wins/national on the very rows
whose analyzer-proven counts are wins 4/8 and national-ever 8/8: the
checker's counting on recorder rows does not match the analyzer's. The
checker, not the village, is wrong here. Next run: do not re-run
telemetry-check on recorder rows without a counting fix, or seed a
regime-segregated baseline first (and re-label its _regime block, which
--update-baseline drops).

## Metric review (§14 — revisions for the NEXT run, verdicts above NOT re-scored)

1. Post-flee priority order is load-bearing: without it, nearly-dead
   reads 6 instead of 1, and a "don't go out hurt" arm would chase a
   downstream state instead of the cause. Any future field-death
   classification on this band MUST state its priority order up front.
2. Pure nearly-dead lever unjustified on this band's numbers alone: its
   target is exactly one death (nevermore). Do not spin a nearly-dead arm
   without a new band where that class is larger.
3. Telemetry-check on recorder rows is a broken instrument for this
   substrate (see above): wins 4/8 and national-ever 8/8 read as 0.
   Treat its LOUD lines on recorder corpora as ingestion artifacts until
   fixed, same class as the four balance-panel ingestion failures.
4. Own-corpus gate vs trajectory-identical equivalence: accepted here
   for a DIAG verdict only (see disclosure 1). A game-code landing still
   requires its own control re-run.
5. Back-to-back second round NOT run: both arms' verdicts landed past the
   ~30m fallback window, and arm 1 is held for adoption rather than
   re-run in this window.

## Infrastructure

- Master moved twice under the run on sibling lanes (decision-pack
  snapshot 4b6d4c8eb, batch-ship version bump a888d24b0) — zero file
  overlap with either arm; ff-only correctly refused the diverged
  w123death branch, which rebased clean in its own worktree and was
  verified byte-identical before merging. The ship loop owns all pushes
  and live verification; this run pushed nothing and bumped nothing.
- docs/ONTOLOGY.md showed a sibling's live modification at one mid-run
  check and was back to 2000 lines, tree clean, by merge time — left
  alone throughout, never reset.
- Safe-commit index clobber hit the w123death worker commit (repaired,
  commit verified correct). No clobber on the coordinator evidence commit
  (verified below).
- No EPERM flap blocked the coordinator's own exec writes at any point;
  the flap hit both workers' exec sandboxes. Do not generalize one
  agent's flap report into a whole-machine outage.
- check.js --quick NOT run by the coordinator (zero src/js in the landed
  arm; the worker ran check.js --only fieldfight: 2 passed, 0 failed).

## Next blanks, in order

1. Post-flee adoption run (HELD tree sim-postflee-a, NOT a fresh tree):
   finish control 73675–73678, set the PRIMARY bar from the control class
   count, then run the arm against the w123death primary above
   (post-flee ≤2, field ≤9 with by-class table, full guard legs).
   Deconflicted: this IS the postflee arm's primary, not a second arm.
2. Belltoad 0-damage pair (carried, still unknown): two healthy
   villagers, same 40%-HP toad on consecutive days, 0 dealt over 2–3
   rounds, 105/76 taken. Gear-at-entry isn't in the fight rows — the
   mechanism needs a row-level trace arm, not a lever.
3. Pool-presence lever for raid draft (0644Z blank 2, still untested):
   ~23% pool wave-3+ share needed for 1 wave-3+ raider/raid vs measured
   7.2% (14.0% late). Draft order is NOT a supported lever.
4. Defender-fight wound manufacture (0644Z blank 3, still undecided):
   297 below-line survivors / 342 defender fights — price of the
   palisade working, or its own finish/retreat rule.
5. Field-kill / field-save narration beat + bought-flee awayNews tap gap
   (carried tooling sub-blank).

scale-onramp stays converging (NOT converged): no fix has landed, wins
still only via default-OFF courtship + seat instruments on the lesser
seat, full seat still unreached, wave 5 still 0, no wave-4 kill on this
band. The directive stands until the tracker records this axis converged
on measured evidence. food-economy stays converging (untouched; sibling B
loop's adoption work pending — see B review above). Rotation left at 3
(convergence work does not cycle it).

Claim deleted; lock deleted. Evidence: this file (coordinator) +
evidence/2026-10-25/sim-w123death-a.md + sim-w123death-a-sense.txt
(commits 7a805a4b2, rebased from 5951cbdf7) + held branch sim-postflee-a
(uncommitted: sim-postflee-a.md, perseed-sim-postflee-a/,
scripts/test-postflee-sweep.js).
