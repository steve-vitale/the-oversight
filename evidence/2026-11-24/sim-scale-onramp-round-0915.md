# Loop A scale-onramp round — run fleshout-20261124T0915Z (ADOPTION closeout of the dead 0715Z run)

Run fleshout-20261124T0915Z, Loop A, axis scale-onramp. ADOPTION closeout of the
dead 0715Z run (which itself ran the 0615Z round's next blanks #1–#3).

## Stale-lock recovery at start

Lock `fleshout-20261124T0715Z` was 125 min old at run start (created
2026-11-24T07:17:14Z). Coordinator dead by every check: both workers cancelled
09:18:40Z, tree heartbeats 34/75 min stale, no live coordinator in the subagent
list, no live processes. Lock re-read and replaced in the same call; own lock +
claim written. Loop B 0840Z live on winnability-chain at run start (NOT touched);
Loop B landed guntransfer + accordanswer mid-run (master 806643212) and closed
out (record 9b038de58) while this run worked, then started a 1030Z run
(sim-bloodcluster-b) whose register process held the registry lock from ~10:56Z
onward — see Infrastructure.

## Arm 0 — sim-retarget-a (already merged at run start, verified)

NO-GO at pilot, merged on master as a77a5a749 before this run began (prereg
27f6d3026 + lever/evidence 10e642dc2 + record a77a5a749). Verified by the
coordinator: zero `src/js` changes in the lever commit — lever reverted,
evidence/instrument/corpora only. Hunt-lock upward retarget fires (11 retargets,
0 defects) but wave-4 kills FALL 19 vs 24; launches 18 → 63, deaths 727 → 773.
Finding #2720 already carries the update; #2733 (gate-avoid-plan-exists as the
remaining formation wall) filed for a future run. Nothing re-run, nothing
re-merged.

## Arm 1 — sim-holdspeak-a (GO, CONFIRMED — merged b0b273ae7)

Adoption of the cancelled 0715Z worker (everything uncommitted: lever, driver,
proof, pilot + confirm corpora, evidence claiming GO at pilot). The adoption
worker verified every claim by re-running the analyzer (pilot reproduces
byte-identical), completed the confirm leg (ran the 4 missing after-seeds
109429–109432), and judged the frozen bars.

- **Verdict: GO, pilot + 16-seed confirm.** Pilot 36/36 hold-days voiced
  (share 1.0); confirm 197/197 voiced; 0 reason mismatches in the audit samples;
  0 malformed lines. Deaths, launches, beat lines, depart beats, days, end
  reason identical per seed on all 24 seeds; balanced panels (pilot + confirm)
  all-zero deltas on every observed metric. Held departures now speak the real
  hold reason once per holder-day (holdName/holdBlockKind/holdVoice, 3 call
  sites, per-(holder,day) dedup) in `src/js/villager-brain.js` (+117).
- Sense-read: "Ruby is sick, and no one who can walk will take the plan — the
  party waits." Repetition now measured on two bands (Eamon's hurt line 31×/79d,
  Elif's 21×/47d) — recorded as a firmer follow-up, not a miss.
- Gate on the rebased tip: 337 passed, 7 failed (980s), all 7 a subset of the
  0715Z run's 9, same signatures, no new failures; the three deterministic
  failures re-proved pre-existing on a plain-master extraction.
- Proof test 30/30, analyzer selftest 12/12 (re-run by the worker on the
  rebased tip and by the coordinator on the merged tip).
- Confirm wall numbers, identical both legs: wins 0, national 0, wave 5 on
  8/16, median survival 130.5d.
- Kit / veteran / no-trail / unknown hold families never fired in 24 live seeds
  — those templates stand on staged fixtures alone.
- Finding #2713 (held departures are silent) is FIXED by this arm.
- Commits: prereg c408646b7, instrument 09c4f4d17, lever 6efa3d560
  [needs-eyes], corpora 02e39c979, B4 note b0b273ae7. Merged --ff-only after a
  coordinator rebase onto 806643212 (5/5 picks clean, no overlap with Loop B's
  landings); proofs re-run on the rebased tip by the coordinator. Evidence:
  evidence/2026-11-24/sim-holdspeak-a.md.

## Arm 2 — sim-departteach-a (GO on pooled bar 8 — merged 4fe9f2352)

Adoption of the cancelled 0715Z worker (prereg committed 68c229aaa; instrument
uncommitted; control leg 4/8). The adoption worker verified the instrument,
finished the pilot, hit the denominator guard, ran the prescribed +8 extension,
and judged the frozen bars.

- **Verdict: GO on pooled bar 8.** The departure beat now teaches companion
  names through the overheard channel: `departLaunchBeat` in
  `src/js/win-plan.js` (+26/−2, unconditional, no flag) calls
  `revealName(tVid, 'overheard')` per companion — holder excluded, scholar's
  own vid excluded, typeof-guarded, name only (no stats/trust/goals).
- Bars: B1 PRIMARY teach pooled 5/5 = 1.00 ≥ 0.80 PASS (control taught 0,
  drift = taught); B2 no-regression PASS (deaths 1509→1509, launches 51→51,
  days/endReason identical on all 16 seeds); B3 beat integrity PASS (beat lines
  byte-identical, 0 descriptors, holder never taught); B4 UI over-reveal PASS
  (proof-test §B6 + §3 audit); B5 instrument PASS (proof 28/28, selftest 15/15);
  B6 denominator guard TRIGGERED on pilot (unknown-before 3 < 10) → extension
  band 109439–109446, freshness re-verified, amendment recorded in the evidence
  BEFORE running it; B7 pilot gate EXTEND-BAND, not a failure; B8 confirm
  (pooled) GO — all three conditions pass.
- **Caveat, recorded prominently (evidence §5 + §10 metric review):** the
  pooled denominator is still only 5 (< 10), so the analyzer's verdict label
  still reads EXTEND-BAND — its B1_teach gate embeds the bar-6 pilot floor.
  Bar 8 as frozen does not restate a floor and bar 6 prescribes exactly one +8
  extension, which was run. GO stands on the frozen bars as written; a
  coordinator/Steve overrule to extend again instead of landing is legitimate.
  The sequencing deviation is confirmed: the prereg §6 anchors the driver to
  HEAD = the prereg commit, so the instrument could not be committed mid-pilot;
  everything committed at the end, as the prereg requires.
- Sense-test (seed 109438 day 5): "Aki sets out with Howard — the fire marks
  the trail." / "A name drifts over from the fire: Howard…" — the scholar
  learns exactly the name spoken; Howard then hunts with Aki, fights as a
  wave-4 ally day 49, dies day 71 while the scholar inhabits him. No beat
  taught a name the scholar could not have heard.
- Balanced panel (pooled 16): `review_required` on unobserved metrics only —
  every observed metric delta exactly 0.
- Pooled wall numbers: wins 0/16, national 0/16, wave-5 9/16, median survival
  134.5d, lost 10/16. Scale wall stands.
- Gate on the rebased tip: 338 passed, 6 failed (1116s); the 3 named failures
  are 120s timeouts in slow godpath sims, all passing standalone; the other 3
  recorded in evidence §11, not chased.
- Proof test 28/28, analyzer selftest 15/15 (re-run by the worker on the
  rebased tip and by the coordinator on the merged tip and after the
  coordinator rebase).
- Findings appended by the worker: #2741 (calledName drift line speaks the true
  name, not the use-name — pre-existing channel quirk) and #2742 (no canon doc
  covers the overheard name-reveal channel).
- Commits: prereg 3963c7930 (rebased; 68c229aaa pre-rebase), lever 6a02c5d9f
  [needs-eyes], evidence d8fcf1638, corpora 85a98f2ca, record 4fe9f2352.
  Merged --ff-only after a coordinator rebase onto b7f77443c (5/5 picks clean,
  no overlap with Loop B's landings or journey-succession r279); proofs re-run
  on the rebased tip by the coordinator. Evidence:
  evidence/2026-11-24/sim-departteach-a.md.

## Wall (this round's judged corpora)

- Retarget pilot: wins 0, national 0, table 0, wave-4 kills 19 vs 24 (arm
  worse), median survival not instrumented as a wall number.
- Holdspeak confirm: wins 0, national 0, wave 5 on 8/16, median 130.5d.
- Departteach pooled: wins 0/16, national 0/16, wave-5 9/16, median 134.5d.
- The wall did not move — both landed arms are voice/knowledge fixes (holds
  speak; beats teach names), as pre-registered. Villages reach wave 5, survive,
  and never reach national or win.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-24/perseed-*' --metrics national,table,wins,exiled` — NOT
RUN in this window: the checker refuses recorder-corpus input (same as every
recent run; no LOUD lines, baseline NOT rolled). The gate re-run on the final
merged tip was also NOT run (window ends; arm proofs green on both rebased
tips — holdspeak 337/7 and departteach 338/6, all failures pre-existing or
standalone-passing timeouts — and both changes touch disjoint files with zero
overlap). The full repo gate is OWED before this tip ships.

## Infrastructure

- Registry lock jam from ~10:56Z: Loop B's new 1030Z run (sim-bloodcluster-b
  registration, pid 43617/43618) held the exclusive registry lock for 12+ min
  while its register-direct python ran inside the critical section; my
  departteach release script queued behind it 5+ min and never acquired the
  lock. The coordinator killed its own release proc and did the git-level
  removal directly (worktree removed, branch deleted, exit 0). The registry
  entry for sim-departteach-a still reads `active` with a removed path — the
  reaper reconciles that state; the holdspeak release completed normally
  ("released sim-holdspeak-a as done-merged").
- Write flap blocked the departteach rebase 6× at `rebase-merge/head-name`
  (~10:44–10:56Z); retry loop succeeded on attempt 3. Also failed one heartbeat
  and one branch probe in the same window; all recovered, nothing lost.
- safe-commit index clobber struck 3× per worker (repaired via the AGENTS.md
  ls-tree pipe each time); safe-commit.sh silently drops directory args —
  corpora needed separate commits with expanded file lists.
- Heartbeats never landed for either arm this run — registry lock held by live
  sibling Loop B on all attempts. Both branches were fully committed, so the
  work survived.
- Master moved twice during the run (1ca394089 → 806643212 Loop B landings →
  b7f77443c Loop B record + journey-succession r279); both arms rebased cleanly
  with zero overlap. No rebase stop-at-pick quirk on either coordinator rebase.
- Rotation left at 7 (adoption closeout does not cycle it).

## Convergence

scale-onramp stays converging (NOT converged): two of the 0615Z round's next
blanks are now landed as voice/knowledge fixes — held departures speak (GO,
confirmed) and departure beats teach names (GO on pooled bar 8) — and the
retarget blank is judged NO-GO; but villages still reach wave 5, survive, and
never reach national or win. Next blanks, in order: (1) gate-avoid-plan-exists
is the remaining formation wall (finding #2733 — design call before building,
same class as the retarget); (2) whether waiting matters on bands where the
seat stays unready longer (tracker blank #5, still open); (3) why gun-holders
who take guns never fight (Loop B's open thread); (4) the holdspeak repetition
follow-up (Eamon 31×/79d, Elif 21×/47d — firmer measurement, not a miss);
(5) the calledName drift-line quirk (finding #2741 — decide use-name vs true
name); (6) the overheard-channel canon gap (finding #2742 — a KNOWLEDGE.md
line). winnability-chain stays converging (untouched; sibling loop B).

Merged b0b273ae7 (holdspeak GO) + 4fe9f2352 (departteach GO) + this record;
retarget-a a77a5a749 already on master; merged locally, pending ship. Claim
deleted; lock deleted. Evidence: evidence/2026-11-24/sim-scale-onramp-round-0915.md.
