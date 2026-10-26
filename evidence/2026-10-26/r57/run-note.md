# Journey social r57 — THE RESIDUAL-DEEP-DIVE RUN (lane B, 2026-10-26)

Leg 5 (social life), cycle r57. Follows r56 (linger converts 56.5% vs
control 1.7%; residual split 493 total, unexplained 401 = 81.3%).

Rotation-b read 5 at run start. NOT advanced by this run (prereg):
the last three landed commits (r54, r55, r56) all touched the
conversation/'others' system, and r56 named r57's question — leg 5 is
the queue-jump system, not a rotation leg. The file still reads 5;
the r56 closeout write to 6 never landed, same as r55's. Left for a
run that actually plays a different leg.

## PRE-REGISTER (written before any r57 seed ran — see prereg.md)

**Leg questions:** (Q1) with pager-owns + fresh-capped + cache-suspect
+ spent probe flags, what share of r56's inBuilt=false same-pick
residual is guard/cap/cache-owned vs genuinely missing? (Q2) does the
discussed-and-unchanged 'others' state appear in the SUBJECT menu's
built list under clean constructed state (r56's named unit test)?
**Arms (fresh seeds 5301-5304, smoke 5305 30d, DAYCAP=140,
death-aware):** ALL linger (no control arm — control reproduced three
times: r55 1.9%, r56 1.7%; repeating it buys nothing for the residual
question). All seeds keep seeded-speaker steering ON (constant,
excluded from the natural funnel, as r56).

**Bindings (a miss is NO-GO, never re-scored):** R1 split reported AND
unexplained < 50%; U1 subject-relist unit test GREEN (or RED -> fix
demonstrated RED->GREEN); R2 linger conversion >= 25%; M1 deep2 >= 10/
seed; M3 pooled late TP >= 40%; M4 same-speaker knack = 0/seed; M5 5
sense-reads, 0 fabricated-history flags, <= 1 weak; M6 report-only;
NO-REGRESSION check.js --quick at the standing profile.

## Pre-seed correction (unit test before seeds, prereg amended)

- U1 part 1 GREEN on first run (Alejandra/gentle, subject built list
  carries 'ask:others', page 1 too): the r54 re-list works at unit
  level, as expected. No fix triggered.
- U1 part 2 REFUTED the prereg's fresh-capped mechanism as written:
  a withdrawn (cap-2) villager with freshBeforeOthers=2 STILL built
  'ask:others'. Reason: n counts only PUSHED topics, and freshCap (1
  at cap<=2, 2 otherwise) throttles non-exempt pushes before 'others'
  — so at most freshCap topics push before it, always below
  topicCapMood, except the tense+deflector corner where topicCapMood=1.
  Analyzer's freshCapped class refined before the run to:
  othersFresh && topicCapMood===1 && freshBeforeOthers>=1. Raw
  freshBeforeOthers/topicCapMood still recorded per probe.

## Pilot (before the full run: smoke 5305 + seed 5303 at DAYCAP=40)

Smoke PASS (bondSnapDays=7, convos=88, t2picks=21, funnel live).
Seed 5303 at 40d: 41d, linger arm, probes 96/96 carrying the new r57
flags, pagerOwns 'none' on all 96 (early signal that pager-owns is
rare in driver play, not a failure). Pilot files deleted before the
full run (same filenames; full run regenerates — no stale pilot
outputs survive, r56 pattern).

## Full-run results (4 seeds, full horizon, death-aware)

| seed | arm | days | alive | deep2 | unsteered | no-offer | offered | picked | late picks | lingerPicks | knackSame | condRate |
|------|-----|------|-------|-------|----------|----------|---------|--------|------------|-------------|-----------|----------|
| 5301 | linger | 141 | 9 | 44 | 414 | 197 | 217 | 126 | 24 | 126 | 0 | 84.4% |
| 5302 | linger | 141 | 8 | 21 | 414 | 191 | 217 | 117 | 49 | 117 | 0 | 77.4% |
| 5303 | linger | 141 | 8 | 39 | 414 | 202 | 205 | 109 | 35 | 109 | 0 | 90.6% |
| 5304 | linger | 141 | 7 | 37 | 414 | 251 | 146 | 65 | 22 | 65 | 0 | 67.4% |
| POOLED | | | 32 | 141 | 1656 | 841 | 785 | 417 | 130 | 417 | 0 | 81.5% |

Main-menu offers stay marginal (pooled main 9 vs subject 782; late
picks by menu: main 3, subject 127). All four villages survived to
the horizon — no wipes this run (r56 had two), so the late window is
full on every seed. Seeded cracks: 5301 Devon<>Ming (crack7 false,
serve30 true), 5302 Otto<>Brian (crack7 true, serve30 true), 5303
Aiswarya<>Marta (crack7 false, serve30 true), 5304 Isa<>Amanda
(crack7 true, serve30 true) — the seeded-crack surface is alive on
all seeds, not gated by this run.

### R1 SPLIT: coverage PASS, content FAIL — unexplained still dominates

- Flag coverage: 800/800 sampled probes carry all r57 flags (100%).
- Pooled residual (same-pick probes, inBuilt=false): 508 total.
  - pendingQAlone: 0 (0.0%). Pager-owns-other: 0. The pager-owns
    family that r57 was built to catch is EMPTY in driver play — the
    driver's ans step clears hanging questions before subject
    browsing, so pending/reactive/generic questions almost never
    own a subject-menu turn. (Caveat: with uncapped convoChoices,
    the pager owns-filter does not even run on the driver's path —
    offeredReplies is the finalizeMenu output — so pager-owns could
    not have explained driver probes in the first place. The flag
    was still worth collecting: it proves the absence, it does not
    assume it.)
  - thread-guard (thread==='others'): 72 (14.2%).
  - gated (inT2list===false): 40 (7.9%).
  - freshCapped (refined tense+deflector corner): 0. Broad memo
    (freshBeforeOthers >= topicCapMood): 0.
  - cacheSuspect (built set equals previous subject turn's set in
    the same convo): 0. Spent-others memo: 0.
  - unexplained: 396 (78.0%). GO clause (unexplained < 50%) FAILS.
- The unexplained probes share a tight profile: discussed (othersFresh
  false), in t2list, thread never 'others', pagerOwns none, menuMore
  false, freshTopics 5, early-heavy (sample cap 200/seed). Thread
  variants (gossip/want/secret/recall/lately/grief) ALL build
  'ask:others' in the unit diagnostic — so the constructed-state
  model does not reproduce the wild state. Name-collision ruled out
  (0 duplicate display names among servers, and residual examples
  carry per-villager othersFresh=false, so the live speaker really
  served 'others' with that pick).
- Per the prereg, the finding is that the residual needs a GAME-SIDE
  BUILD TRACE (log, per subject-menu build, whether 'others' sat in
  t2fresh / t2discussed / the re-list / sub / finalize output, plus
  the menuKey cache decision) — not a menu fix. R2 proves the menus
  convert when weighed, U1 proves the re-list works in constructed
  state, and the residual is a probe-sample phenomenon (a pick exists
  per t2pickOther but the built list lacks it on a subject turn the
  driver reached). No menu fix is warranted on this evidence; a
  build-trace run is r58's named instrument. The trace must also
  answer whether the subject branch is even the path taken on
  residual turns (the one code path the driver cannot see from
  outside: replyMenu cache hits with a key that omits said /
  askedTopics / t2otherServed / bonds).

### R2 CONVERSION: PASS (linger reproduction)

- Pooled linger: 417/785 = 53.1% (>= 25% bar, by 28.1 points; r56:
  56.5%). Late picks 130 total, 22-49 per seed (all >= 2).
- Attribution exact again: lingerPicks == picked on all four seeds
  (126/117/109/65). Every unsteered pick came from the linger step.

### U1 UNIT: PASS (no fix)

- Part 1 GREEN pre-seed and GREEN on re-run after the full run
  (same candidate/seed, same built list). Part 2 characterization:
  cap-2 withdrawn villager still builds 'others' (freshCap throttle,
  see pre-seed correction) — recorded as behavior, not a bug.

### M1 formation: GO — 44/21/39/37, all >= 10
### M3-cond: GO — pooled late TP 243/298 = 81.5% (>= 40%), lateNull 0
### M4 same-speaker knack: GO — 0 on all seeds (cross-speaker retells 5/6/5/4, circulation only)
### M5 people: GO on flags, PASS on floor (1 weak, at the <= 1 limit)
- 0 fabricated-shared-history flags across all 5 reads.
- Strong: s5301-late-d100-Sigrun (Ming killed Drum-Belly, change-ack
  re-offer line honest, stall warts brief); s5303-late-d100-Marta
  (snares/water gossip chain, "Still on the gossip" continuity,
  settled close); s5302-seeded-d18-Otto (Brian grievance with date,
  dentist detail, Yarrow teach, warm close); s5301-wrapserve-other-
  Zoe d20 (Secret Deck Taking trauma — "They just... took you. Came
  back like nothing happened. It wasn't nothing." — grounded canon,
  plus too-many-joints monsters; ends at driver turn cap, not a
  failed close).
- Weak (1): s5304-bondy-1-Isa d4 — the 'others' line names the
  speaker herself in third person ("Isa and A woman, maybe 50s, with
  a nervous tic don't speak") while the pick is the unnamed woman.
  The rift (don't speak) and deed (shared food unasked) are real, but
  the template uses the speaker's displayName where first person
  belongs. Documented as a voice blank, not a fabricated-history
  flag. Carried wart class: stall lines ("lost my train of thought")
  in Sigrun + Isa — r56's stall class persists, brief here.
- Carried nits, not re-litigated: Nino double-invite echo, Omar
  unanchored favor callback, Carlos loop wart, Stan gossip treadmill
  — none surfaced in this read set.

### M6 guardrail (report-only): all 4 villages alive at horizon
(9/8/8/7). No scatters. No arena-wipe this run; death causes are the
standing survival mix, owned elsewhere.

## Village assessment (plain words)

Four villages, same warm player, all talking about each other this
time — because the policy weighs the offer. Seed 5301's nine kept
44 deep friendships and talked about each other 126 times without
being steered; 5302's eight, 117 times; 5303's eight, 109 times;
5304's seven, 65 times. The talk itself is the village remembering:
who killed what, who went for water, who still hasn't forgiven whom
on the trail, who shared food without being asked. What changed since
r53 is not the menu — the menu worked all along when weighed — it is
that the conversation now goes where the offer points. What did not
change: on roughly half of all unsteered subject-menu turns the menu
still does not offer 'others' at all (841/1656 no-offer), and the
deepest measurement of why (the 396 unexplained probes) still points
at a build-time state the driver cannot see from outside. That is a
measurement gap now, not a player blocker: players who pick offered
topics get them, at 53%.

## Reachable / fun / winnable (social leg)

- **Reachable:** 'others' converts at 53.1% when weighed — reachability
  was never the binding constraint; weighing is. The 841 no-offer
  turns are the remaining surface question, and the residual split
  says most of that surface is NOT menu caps, pager owns, or cache
  as the driver can measure them.
- **Fun:** the transcripts are the evidence — Sigrun's monster-kill
  pride, Marta's gossip chain, Otto's dated grievance, Zoe's Taking
  trauma all read like people. The fun tax is the stall tail and
  Isa's third-person self-reference.
- **Winnable:** not this leg's question; 4/4 villages survived to the
  horizon with social fabric intact (M1/M3/M4 all GO).

## Metric review (§14)

- R1: FAIL on the unexplained clause (78.0% > 50%; r56: 81.3%).
  The bar stands as failed; it is not re-scored. The failure reframes
  r58 (game-side build trace + cache-key audit), it does not
  authorize a menu fix — R2 + U1 prove the menus work when weighed
  and the re-list works in constructed state.
- R2: PASS both clauses (53.1% >= 25%; late picks on 4/4 seeds).
- U1: PASS (part 1 GREEN; part 2 characterization corrected the
  prereg's fresh-cap mechanism before the run — a correction, not a
  re-score, since no seed had run).
- M1/M3/M4: all GO. M5: flags GO, floor PASS at the limit (1 weak).
  Keep the floor for r58.
- M6: report-only as specified.
- F1-picks retired (r56 metric review, adopted): not judged.

## Telemetry

Deviation check vs telemetry-baselines/social.json (r57-telemetry.log):
- Result: 1 LOUD line — l3.deep2 newly appeared (baseline 0 ->
  current pooled 141, n=4 files).
- Verdict: EXPLAINED schema artifact, not a bug — deep2 is the
  current formation key the old baseline predates (same practice as
  r54-r56: baseline NOT rolled). l3.bonds and dryRate quiet.

## Regressions

- NO src/js change in this run (driver + analyzer + proof test only),
  so no game regression is possible from this run's files; the U1
  proof test is GREEN pre- and post-run.
- check.js --quick (journey2-social-r57-check-quick.log): 278 passed,
  9 failed in 592s. The failing set is EXACTLY r56's standing profile
  (hide-discovery, measurement trio, mobile-combat-cadence,
  occupation-panels, phone-frame-proof, parity-20261014, and the
  establishment-r20 racks-voice gate) — all pre-existing on the base,
  none touching conversation/gossip/moot. The --quick bar is met at
  the current-profile standard (278/9), not at r55's literal 279/8.

## Files landed (tooling + evidence, zero src/js)

- `scripts/journey-social-r57-20261026.js` (driver: all-linger arms,
  r57 probe flags)
- `scripts/analyze-journey-social-r57-funnel-20261026.js` (v2 split)
- `scripts/test-journey-social-r57-subject-relist.js` (U1 proof test:
  GREEN, discussed-unchanged subject re-list + fresh-cap
  characterization)
- `evidence/2026-10-26/r57/` (prereg incl. pre-seed correction, 4
  per-seed JSONs incl. full t2picks lists + r57 probe flags,
  r57-verdicts.json, r57-funnel-analysis.json, r57-telemetry.log,
  summaries, transcripts incl. all 5 M5 reads, run-note.md)

## Infra notes (for the next run)

- Heartbeat gap 20:07-20:27 UTC (19 min, past the 15-min freshness
  line) was sibling lock contention, not a dead loop: two
  flesh-out registers (sim-w4opp-a, sim-w4dmg-a) held REGISTRY.lock
  across slow `git worktree add` runs while lane A released
  journey-scale behind them; the queue cleared on its own and a
  manual heartbeat landed at 20:27:17Z, verified in the registry.
  The tree was never at removal risk (uncommitted files + the
  reaper's 4h rule), but a heartbeat loop whose tick is killed by
  its own 20s timeout loses that tick — the next tick is 10 min
  later. Lesson for r58: heartbeat with a longer timeout (or no
  timeout) when the lock is contended, and verify landing after any
  gap; do not trust a silenced loop (AGENTS.md 2026-10-25 lesson,
  re-learned here).
- Lane A landed journey-scale r41 (628ceb21e) + eggroad (c1e8329e5)
  mid-run, after this run's branch point — rebase required before
  landing (see landing record below); neither commit touches this
  run's files (zero src/js here), so the rebase is expected clean.
- Driver log: goal hidden_files journey2-social-r57-driver.log
  (smoke PASS + pilot + 4 SEED lines + DONE r57, 0 lost to EPERM
  flap on all flushes). Pilot log: journey2-social-r57-pilot.log.
- Rotation-b NOT advanced (still 5) — deliberate, see top.
