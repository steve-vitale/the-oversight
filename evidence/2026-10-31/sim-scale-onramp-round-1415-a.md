# sim-scale-onramp-round-1415-a — coordinator evidence (Loop A, run fleshout-20261031T1415Z)

Axis: scale-onramp (standing directive: the scale wall is the blocking axis).
No game-code change landed in this run (measurement + closeout only). No version
bump, no push — the ship loop owns deploys. Merged locally, pending ship.

## Run shape (what actually happened)

- No Loop A lock existed at takeover, so this run created
  fleshout-loop.lock (run fleshout-20261031T1415Z) and filed claim
  fleshout-20261031T1415Z.json BEFORE any sims. Loop B live on food-economy
  (1230Z claim: windowcarry/toolloss) — not touched. Pre-flight: main tree
  clean, disk 22%, reaper dry-run removed nothing (6/16 active; dirty trees
  refused, including the two stranded Loop A trees this run later landed).
- This run is BOTH a closeout and a fresh round. The timed-out 1107Z run's
  three arms were left by the 1315Z run "for the main-session closeout" with a
  handoff note (fleshout-loop-20261031T1107Z-handoff.note) saying DO NOT
  re-run from scratch. This run closed all three: heraldpos (committed) and
  pocketcall-trigger (uncommitted evidence) landed verbatim after verification;
  wavegate resumed from its prereg (see below). The 1107Z closeout is now
  COMPLETE — no stranded 1107Z arm remains.
- Five arms, all landed: sim-heraldpos-a, sim-pocketcall-trigger-a,
  sim-wavegate-a (closeout), sim-allycap-a, sim-patrolsilent-a (fresh,
  deferred from 1315Z by the EPERM flap). Each worker's branch was rebased
  onto current master by the coordinator, its proof re-run green on the
  rebased branch, then merged --ff-only. Branches deleted, trees released
  and removed, main tree clean after every merge.
- Rotation file NOT bumped: the standing directive suspends the lever
  rotation until a run demonstrates national reached in sims (national IS
  reached routinely — see wavegate — but the directive lifts only when the
  tracker records scale-onramp as converged on measured evidence, which it
  does not; the wall verdict below stands). This run worked the axis, not a
  rotation lever.

## Arms landed (each judged against its own prereg, never re-scored)

### sim-heraldpos-a — DIAG-GO (stranded 1107Z arm, committed, landed verbatim)
Commit 47162b801 (rebased; original branch commits c6c38461d + 18901c2e7).
Proof 39/39 re-run green by the coordinator on the rebased branch.
A located Herald is placed on Haven's own row, 3–4 tiles east (7,4 twice;
8,4 once, east edge), then random-walks — it never walks toward anyone, and
nobody ever walks onto it. In 74 combined located-window days (8 + 36 + 30)
the Herald is never met, never fought, never even stood upon, while daily
adjacency is common and tick-row adjacency frequent. The meeting rule
(villagerMonsterTick) fires on same-tile coincidence only, so the omen
line's "scouts found its lair... It is WAITING" promises a meeting the
engine cannot deliver: the call button points at a beast nobody has seen, on
a tile nobody's path ever includes. The scarce thing is the meeting itself,
not the muster gate downstream. One unattributed diagonal step on 87137
(flagged in worker evidence, carried to the backlog, verdict unchanged).

### sim-pocketcall-trigger-a — NO-GO, arm killed (stranded 1107Z arm, landed verbatim)
Commit 228e34181 (rebased; coordinator commit aaa0edc45 of the worker's
uncommitted evidence + corpora + analyzer, after verifying the analyzer
reproduces the evidence's baseline wall numbers exactly from the corpora).
The worker's NO-GO cleanup was already done in the tree (policy, sweep,
proof, offgate helper, fixtures deleted); what lands is evidence, prereg,
both 16-seed corpora, and the standalone analyzer. The trigger works and
the count still fails: 1,614 trigger calls, 183 actually arming a quiver,
every armed fight T1-attributed — but dry-at-fight count rose 6 → 13
against a bar of ≤ 4 (floor(2/3 × 6)), even as dry share fell. Pilot had
warned (dry count 2 → 5, share 67% → 42%). C2 attribution PASS, C3 cost
bars PASS, C4 instruments clean PASS; C1 fails, so confirmGO = false and
the lever is killed, leaving no trace in game code or policy. Wall numbers
on this band (baseline → trigger, 16 seeds, substrate flags, not
ordinary-play claims): national 9 → 10, table 14 → 10, wins 10 → 7,
wave 4 unlocked 14 → 15, wave 5 unlocked 2 → 3, median survival 90 → 96d,
max 201d, starvation deaths 1 → 2.

### sim-wavegate-a — DIAG-GO (stranded 1107Z arm, resumed, not restarted)
Commit 80ea0ca7f (rebased; worker commit 33840d135). Proof 27 checks green
re-run by the coordinator on the rebased branch. The handoff's /tmp recovery
files were verified GONE (sibling cleanup) and not hunted; the resume
re-verified the corpus from the prereg (10 real + 9 zero-byte JSONs),
proved determinism (87104 re-run byte-identical, 241,631 bytes), ran the
det-gate, then ran the 9 missing confirm seeds fresh — no judged JSON
edited or smoothed. Usable seeds 19/19 (pilot 8 + confirm 11, fixed band,
no substitutions); completeness 15/15 national seeds fully decomposed;
derived final unlockedWave == engine on 19/19; det-gate passed (200/200
hashes + end fields identical on both seeds); recorder errors 0.
Answers: (a) wave unlock gates in order on the wave-2 ledger rung (4 pts,
day 25+), then the veterans bar (1 living roster member with a wave-3+
kill). Standing never binds at national: every national seed sits at raw
standing ≥ 122 on its national day because 3 seasoned regional links alone
pay 102 against t4 = 100. Blockers at nationalDay: W3-RUNG-BAR 7/15,
DEFER4 4/15 (all short on veterans only), UNLOCKED 4/15, STANDING-BELOW
0/15. (b) National-without-wave-4 is the NORMAL road at nationalDay
(11/15 pre-wave-4) but usually not a stall: 10 ROAD / 5 STALL, and the 5
stalls are exactly the 5 seeds that never hold a living veteran on any day
(2 cap-survived, 2 lesser wins labeled WIN-LESSER, 1 village-lost).
(c) Ordering: national-before-wave4 6, wave4-before-national 3, same-day 1
(n=10); pre-wave-4 fractions among national seeds: at nationalDay 11/15,
at tableDay 2/6, at winDay 2/6, at run end 5/15. Wave 5: 0/19 unlocked;
end blockers on the 10 national wave-4 seeds: DEFER5 6, W4-FACED 3
(wins within days of wave-4 unlock), BELOW 1.
Row-series disclosure (stated in worker evidence, carried here, verdict
not re-scored): daily rows start 2,2,4,4,5 — calendar days 1 and 3 are
never current at a daily call because the engine clock jumps 2→4 — but
rows == harness daily calls on all 19 seeds (no recorder drops), rows
sorted, errs 0, all milestones ≥ day 43, so no judged value can move.
Metric review carries the prereg rewording ("one row per harness daily
call") for the next arm.

### sim-allycap-a — CLAIM-CONFIRMED (fresh, deferred from 1315Z)
Commit 063c552b9 (rebased; worker commit a2cee8eb91). Proof 38/38 re-run
green by the coordinator on the rebased branch, including byte-identical
determinism (two fresh runs == corpus sha256 293541bc3251).
The 2-ally yardstick component is unfieldable through fieldFight as wired.
Second-ally combat entries 0/24 confirm fights (FS-V2 12 + SH-V2 12); across
all 96 fights: B strikes 0, B charges 0, B health delta 0, rec.allyVid == B
0 times. Count-controlled identity: FS-V2 identical to FS-C2 on 12/12
streams (allies count held at 2, only the vid list differing) — closing the
count confound partyvolley's P2==P3 left open. Attribution, exactly:
caller staging EXONERATED (callers already stage 2); engine truncation
(vids sliced to first 2 on intake); single-scalar fighter state (one
allyVid/allyHp/allyIn/allyName, one flat [3,6] ally strike/round, one 0.4
ally-share roll — no second slot exists); helpCalled lock BINDING (both
shift() sites set it, shout requires !helpCalled, never reset — a
fromStart fight can never shout, a shout fight can shout at most once).
Side channels, real but non-combat: staged count steadies morale via
holdBonus (count 3 vs 2 differs on 2/12 streams; stream 204: FS-V2 flees
round 1 at 32 HP, FS-V3 holds to round 2 and DIES — courage from company
can kill). Shouted allies are stillborn on this band: 0 damage dealt or
taken across all 32 SH fights (the shout fires at round end when the
leader is already past holding). B's only appearance in 96 fights is the
sortie rear-guard line. No fix built by design — the engine-cap decision
is the ranked next arm (see backlog). Wall numbers NOT OBSERVABLE on this
fixture substrate (stated structurally, never as 0s).

### sim-patrolsilent-a — DIAG-GO (fresh, deferred from 1315Z)
Commit b0314f2d3 (rebased; worker commit b43d49e43). Proof 34/34 re-run
green by the coordinator on the rebased branch. The patrol-silent question
is answered with mechanisms, not a single cause — and scholar-at-Haven
presence is ruled out band-wide. The leader is home for 88.5–100% of
upkeep beats on all 16 seeds (100% on all three silent seeds), so presence
never explains silence. Two real mechanisms do: (a) nobody to ask — seed
85107 has 17 villagers and zero combat-cred holders (no combat occupation,
no monster kill in any record) across 306 beats; (b) the wrong rule asks
last — seeds 85111 and 85114 each have exactly one cred holder who EARNED
cred by killing (mechanic, 3 kills; farmer, 2 kills), but the leader's pick
order checks the day job first, so the mechanic mends 271 times and the
farmer cooks 257 times and neither is ever asked to patrol. Patrol coverage
on this band is a roster lottery: 13/16 seeds patrol via 1–2 holders (a
police officer gives 15 attempts, a firefighter 64). Seed 85104, silent on
the old base, is NOT silent on this base (64 attempts via one firefighter)
— base drift moved the silent set, reported per the pre-sims prereg
amendment rather than forced into a cause. Call path verified live: every
patrol assignTask row is caller delegateBeat (100%). Two instrument
corrections before confirm judgments (documented in worker evidence):
v1's caller "Object.w" was the harness verb-telemetry wrapper, not a
policy (v2 skips it); v1's per-beat join misread competent pre-beat water
claims as danger-roll misses (v2 joins delegateBeat rows only; s85114's
fit share corrected 0.89 → 1.00, verdict FIT-FIRST not mixed). Band numbers
(16 seeds, S-PATROL stack): national 10/16, table 11/16, wins 11/16, wave 4
reached 14/16, wave 5 reached 0/16, median survival 94d, max 201d. Silent
seeds: 85107 (102d, 306 beats, 0 attempts), 85111 (201d, 600 beats, 0
attempts), 85114 (107d, 321 beats, 0 attempts). No fix built (DIAG ONLY);
the smallest supported lever (kills-earned cred reaching the danger branch
despite a fit-first occupation; test seeds 85111 + 85114) is documented as
next arm N1, not built.

## Wall numbers (this run — per-band, never pooled across substrates)

- Wavegate band (19 seeds, win-pursuit stack): national 15/19, table 7/19,
  wins 6/19, wave 4 11/19, wave 5 unlocked 0/19, median survival 137d,
  max 201d. Deaths 622: combat 42.3%, villager combat 24.0%, the wild
  14.3%, starvation 2.4%.
- Patrolsilent band (16 seeds, S-PATROL stack): national 10/16, table
  11/16, wins 11/16, wave 4 14/16, wave 5 0/16, median 94d, max 201d.
- Pocketcall band (16 seeds, baseline → trigger): national 9 → 10, table
  14 → 10, wins 10 → 7, wave 4 unlocked 14 → 15, wave 5 unlocked 2 → 3,
  median 90 → 96d (substrate flags, not ordinary-play claims).
- Heraldpos pilot (8 seeds): located 3/8, Herald contacts 0 in 74
  located-window days (see worker evidence for its band wall numbers).
- Allycap fixture band: wall NOT OBSERVABLE (no village trajectory).
Overall wall UNCHANGED: full seat 0 and wave 5 reached 0 in live play
stand. National is reached routinely (wavegate 15/19); the wall is now
sharper, not moved: national-without-wave-4 is the normal road, the
veterans bar is the binding gate, the Herald is never met, and the
2-fighter engine cannot field the wave-4 "party" demand as written.

## Village assessment, in plain words

Villages climb to national just fine — fifteen of nineteen on the
win-pursuit band get there — and then they wait. They wait because nobody
living has killed a wave-3 beast: the veterans bar, not standing, not
food, is what holds wave 4 shut, and on five seeds nobody ever clears it.
Meanwhile the endgame's great beast sits three tiles east of home and
wanders off in a random walk while nobody ever steps onto its tile, so the
call to muster points at a stranger nobody met. The patrols that should
screen the wild are a lottery ticket: if the village happens to hold a
police officer or a firefighter, someone walks; if its only fighter is a
mechanic who mends or a farmer who cooks, the leader keeps asking them to
mend and cook and nobody ever walks. And when a fight does happen, the
second friend never arrives — the engine holds one ally, one strike, one
shout, and the shout comes after the leader has already decided to run.
The trigger-first ammo rule does work as a rule — the leader hands ammo to
empty quivers constantly — and still leaves more fighters dry at the
moment of the fight, because arming more fighters sends more fighters out
dry-handed later. The village is not starving at the wall. It is waiting
for a veteran, a meeting, and a second pair of hands that the engine does
not provide.

## Sense-testing

Worker reads carried in evidence: wavegate hold beats name veterans while
the binding blocker is the wave-2 ledger rung (rung blindness, backlog);
allycap fights read as people fighting with the ally arriving via
co-presence and flee as a spoken judgment call, except the shouted ally
arrives only to watch the leader run; patrolsilent beat rows read as a
leader working a pick order, not a roster. No transcript in this run
showed villagers acting robotic in dialogue; the robotic readings are
structural (a pick order that never asks, a shout that never lands, a
meeting rule that never fires) — those are the findings, not narration
bugs to patch with lines.

## Blanks filled or documented

- FILLED (closed questions): Herald placement + movement + reachability
  (lair on Haven's row east, random walk, zero coincidence); pocket-call
  trigger-first design judged NO-GO and killed; wave-unlock gating
  decomposed seed by seed (ledger rung, then veterans bar; standing never
  binds at national); second-ally cap attributed exactly (truncation +
  single-scalar state + helpCalled lock; staging exonerated); patrol
  silence mechanisms (cred absence vs fit-first trapping; presence ruled
  out).
- DOCUMENTED (in worker evidence + backlog appends by this coordinator):
  wave-3 kills never happening on stall seeds (encounter instrument owed);
  hold-beat rung blindness; wave-5 wall (veterans-2 reachability question);
  regional-table exception 87103; engine-cap decision (re-express demand,
  commission multi-ally path, or recompute yardstick); shouted-ally
  stillborn measurement on weaker beasts; bond-average channel unmeasured;
  live-sortie count-channel pricing; kills-earned cred danger-branch lever
  (N1, test seeds 85111 + 85114); roster-lottery census (N2); pre-claimed
  cred tax kept as a funnel stage (N3); water-assignment persistence
  untraced (fenced off); patrol sickness-screening parity note (still open,
  re-observed, not chased).

## Panel (§15) and telemetry (§10)

- Panel: NOT APPLICABLE to every arm in this run, none fabricated —
  single-base DIAG censuses (wavegate, patrolsilent) and a fixture band
  (allycap) have no before/after comparison for balance-panel.js to
  express; pocketcall's honest comparison instrument is its own analyzer
  lineage (identical seeds, identical stack, only the env flag differs);
  heraldpos is a single-base DIAG measurement. Same declaration class as
  mustercall-b/2, heraldcontact-a, spearxbow-a, sighit-a.
- Telemetry check: run by the coordinator on the wavegate judged corpus
  (evidence/2026-10-31/perseed-wavegate/leadfeast/*.json, 19 rows) and
  the patrolsilent judged corpus (evidence/2026-10-31/
  perseed-patrolsilent-a/*.json, 16 rows) — both REFUSED by the tool
  itself ("refusing recorder-corpus input: all rows carry top-level
  anchorCommit"), no LOUD lines, baseline NOT rolled (same class as
  sighit-a and the ammo/w4field precedent). A fixture corpus (allycap)
  must not reseed the scale-wall baseline, and --update-baseline was not
  passed on any corpus.

## Metric review (applies to the NEXT run, never a re-score)

1. Wavegate clause (a) rewording (carried from worker evidence): "unbroken
   daily row series from day 1" should read "one row per harness daily
   call, sorted, no recorder drops" — the engine day clock jumps 2→4
   before any daily call observes day 3, and the current wording invites
   a false NO-GO no recorder can fix. The proof test now machine-checks
   the observed pattern (first row day 2, first five days 2,2,4,4,5).
2. Pocketcall's count-vs-share lesson stands: a count bar and a share
   story can point opposite ways (dry count up, dry share down); future
   pocket-call preregs should judge count AND share as co-primary, or
   state which one binds, before confirm spend.
3. Patrolsilent's instrument lessons: name harness wrapper frames to skip
   in caller clauses up front; define the pick as the delegateBeat row
   and pre-claimed as its own bucket from the start; name a
   re-establishment step as the first gate for silent-set preregs (base
   drift moves the set).
4. Allycap's per-beast lesson (from sighit-a's metric review, applied
   here): pooled bars hide per-beast shapes — allycap judged per-variant
   flags alongside pooled counts, and future engine-cap preregs should do
   the same.

## Convergence state

scale-onramp: CONVERGING, NOT converged. No game change landed in this run
(measurement + closeout only); the full seat remains 0 and wave 5 remains
0 on measured bands. The binding constraints after this arm, sharper than
before: the veterans bar (wave-3+ kill → living veteran) as the wave-4
gate; the Herald meeting itself (placement + random walk + same-tile-only
meeting rule); the 2-fighter engine cap against the wave-4 "party" demand
(engine-cap decision now the highest-value open call); patrol coverage as
a roster lottery (cred absence vs fit-first trapping). No axis is recorded
as converged. food-economy untouched (sibling Loop B lane).

## Infrastructure (loud, for the next run)

- EPERM flap ACTIVE intermittently through the run: blocked heraldpos
  branch-delete + registry release (retried clean when it eased; branch
  deleted, registry entry cleared by reaper), pocketcall safe-commit
  (/tmp index-lock; landed on retry), allycap safe-commit ×10 (landed on
  attempt 11), wavegate det writes (worktree + /tmp staging, 0-byte files;
  sweep writer now retries 180×10s with full-size verification), patrol
  git index writes at session start + a ~2-minute /tmp denial. No ref
  surgery was forced at any point; every blocked write was retried or
  left safe (dirty trees are reaper-refused; merged branches kept).
- Safe-commit index clobber hit pocketcall, wavegate, allycap, and
  patrolsilent commits (commit correct, worktree index showing committed
  files staged-deleted); repaired every time via --add --cacheinfo from
  HEAD blobs, verified status + diff HEAD empty before merging.
- One service restart interrupted the patrolsilent rebase+proof command;
  state was checked before retrying (rebase had completed, proof had no
  recorded result) and the proof was re-run clean (34/34) — no action was
  repeated blindly.
- Stray 0-byte .flap-probe.tmp in the main tree (probe debris, 14:50Z, no
  owner) removed to restore the clean-tree invariant, same precedent as
  1315Z's test-c.lock removal.
- check.js --quick NOT re-run (zero src/js, zero policy-default flips;
  arm proofs green on rebased branches — same disclosure class as
  1315Z/0915Z). B loop's fedevening/axefirst/corpsemove trees appeared
  mid-run; not touched.

## Files

- Worker commits (merged locally, pending ship): heraldpos 47162b801,
  allycap 063c552b9, pocketcall-trigger 228e34181, wavegate 80ea0ca7f,
  patrolsilent b0314f2d3.
- Worker evidence: evidence/2026-10-31/sim-heraldpos-a.md (+ prereg),
  sim-pocketcall-trigger-a.md (+ prereg, corpora, analyzer),
  sim-wavegate-a.md (+ prereg, analysis, 19-seed corpus),
  sim-allycap-a.md (+ prereg, fixture corpus), sim-patrolsilent-a.md
  (+ prereg, 16-seed corpus).
- This coordinator file: evidence/2026-10-31/sim-scale-onramp-round-1415-a.md
