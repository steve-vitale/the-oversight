# journey-scale r104 — run note (lane A, leg 3 SCALE)

**Run id:** laneA-scale-2026-11-06T1217Z (scheduled 05:45 CST 2026-11-06).
No prior lock existed, so no stale-lock recovery. Main tree: the
pre-flight `git status` at run start showed only the ship loop's 4
version-bump files dirty (index.html, src/js/build.js, sw.js,
version.json) — the ship loop was mid-commit at that instant (bump
commit 30fe8dc00 landed 12:08:34 UTC, seconds later); hash-verified
afterwards that all 4 worktree files are byte-identical to HEAD, so
the tree was clean, not dirty. Disk 25%. Base master@30fe8dc00 at
worktree creation. Rotation read 3 -> scale; 3->0 written at closeout
on success only (see closeout). Prereg:
evidence/2026-11-06/journey-scale-r104-prereg.md (committed 92af9dcb8
BEFORE any scored seed ran; proof test 31/31). Heartbeats:
registration ~12:41Z, 600s loop throughout.
**Service restart mid-run:** the first worktree-register attempt was
killed by a runtime restart after ~9 min (partial checkout, branch
created, no registry entry). Recovered by removing the partial dir +
stale git admin dir and re-running register (exit 0, ~10 min). No
work was lost; the lock survived the restart.

## Q1 — TEND_PEER ARM (primary, binding)

**Verdict: PARTIAL (pre-registered threshold).** tendPeer fires and
link trust rises (+8 per tend, trustSetLog-proven), but no shape
reaches 3 seasoned peers and no national beat stages on any seed.
The mechanism moves; the bar is unmet.

316 natGate rows across 4 fresh seeds (95701–95704). Gate days:
RUNG 256, NO-SHAPE 60, everything else 0. `firstQual={}` on every
seed — no shape (lead / belong / covenant / trade) ever qualified.
`stageExpectedMaxRun=0` — the staging code is behaving correctly;
nothing that should stage fails to stage.

- **The arm fires, rarely.** tendPeer for the whole panel: **2** —
  both on 95702, day 87, via `tendLink` (hierarchy.js:1173):
  village_2 26→34 (+8, 1,530 kcal) and village_1 26→34 (+8, 1,530
  kcal). `tended` (lead) is 0 on all four seeds, as in r103. The
  two tended covenants cooled back to 32 by day 104 — one +8 does
  not hold against cooling.
- **Why only twice.** The arm's pantry gate (12,000 kcal) almost
  never coincides with below-40 peer links existing. 95703's pantry
  cleared 12,000 only on days 2–29, before any peer link existed
  (its peers formed ~day 90); by the time peers existed the pantry
  was thin, so tendPeer=0 there. 95701 died day 39 and 95704 day 68
  with no peer links at all. 95702 is the only seed where a
  pantry-rich day overlapped peer links — and even there, only 2 of
  its 3 covenants got tended: the arm re-checks the pantry per link,
  and the two 1,530-kcal tends pushed it back under 12,000 mid-loop,
  so the third (trust 24) was skipped. (The d87 opening pantry was
  11,302 and d88's 10,134 — consistent with a mid-day pantry just
  above the gate; the instruments record opening pantry only, so
  the mid-loop crossing is the code's mechanism plus consistent
  numbers, not an instrument-proven fact.)
- **Trust moves without tending, too — and cools back.** 95703's
  covenants never got tended, yet rose on answered covenant crises
  (+8 each, days 92 and 97, via `answerCovenantCrisis`) and weekly
  covenant ticks (+1), then cooled ~10 points in 5 days between
  spikes, ending at 14 / 19 / 20. The pattern is spike-and-bleed:
  +8 answers, −10 cooling, net drift near zero. The engine's trust
  economy moves; it does not accumulate toward 40 on this policy.
- **The closest lead flickers on the line.** 95703's lead link
  (formed day 25) reached trust 40 on 4 distinct days (d70, d72,
  d73, d106) and sat at 39 the rest of the time — seasoned on 5 of
  106 natGate rows, never holding 40. The census snapshot shows 32
  (post-run scatter processing). 95704's lead ended at 38 (43 days
  old) — two points short. Across the panel the lead links end at
  36 / 23 / 32 / 38: all in the 23–40 band, none holding 40.
- **BELONG still untested.** `belong=-` on all 316 rows: Haven never
  holds a subordinate link. A foreign 7-realm exists on 95703
  (foreignMax=7) — the precondition sits there unused, as in r103.
- **Viewership is NOT the binding constraint.** Viewership peaks at
  36–45 — above the global bar of 32. Global waits on national, and
  national never arrives.

Per-seed gates: 95701 RUNG 39 (died d39, never regional); 95702 RUNG
74 / NO-SHAPE 29 (rung-ready d76, died d104, 3 covenants 0 seasoned,
tendPeer 2); 95703 RUNG 75 / NO-SHAPE 31 (rung-ready d76, died d107,
lead flicker-seasoned, cov 0/3, trade 0/3, tendPeer 0); 95704 RUNG
68 (died d68, rung 8 days short).

**Cross-band read vs the r103 control (descriptive, not a matched
panel):** seasoned peers 0 → 0 in the headline, but the mechanism
moved — r103 had zero tend-driven gains anywhere; r104 has two
proven +8 tends, and one lead link touched 40 on 4 days where r103's
best lead sat at 24. The block is now narrower: not "nothing tends"
but "tending fires too rarely and one +8 does not offset cooling."

## Q1b — DRAIN SEPARATOR (report-only)

**The exact-14 residual REPRODUCES a third time (45 nights at drain
exactly 14, same signature as r102/r103: 1 drink, hyd 100→86) — and
the separator holds.** 107 pilgrimage nights. The per-night formula
stays retired (r103 metric review); only the separator is carried,
and it separates: nights with pack water drink and drain mildly,
nights without drain hard. 95704 d51: packW 0, drank 0, drain 64
(64→0) out on a forest floor in rain — the scholar spent the night
with nothing to drink. d47: drain −28 with 2 drinks. No multi-day
dry stranding of the r103 92701 class (10 days at 0 hydration one
tile from Haven) reproduced — but 95704's dry walk-outs (Q4) are the
same phenomenon one step earlier: the scholar keeps walking out
dry, and one night it costs everything.

## Q2 — CENSUS CONTINUITY (report-only)

| seed | end | rank | seat | arc | seasoned peers (final) | scatter gap |
|---|---|---|---|---|---|---|
| 95701 | d39 scatter, pop 7/7 pantry 0 | village | none | 3 | 0 (lead 36/14d) | link d25 |
| 95702 | d104 pop 2/2 pantry 0 | regional | none | 3 | 0 (cov 32/44d, 32/32d, 24/31d; trade 30/3d) | link d25, Dawn d46 |
| 95703 | d107 pop 0/0 pantry 350 | regional | lesser waiting | 4 | 0 (lead flicker 40 on 4d; cov 14/19/20; trade 15/20/20) | link d25, Dawn d46 |
| 95704 | d68 pop 2/2 pantry 0 | regional | none | 3 | 0 (lead 38/43d) | link d25, Dawn d46 |

National staged 0/4; courtNational answers 0/4. Same as r93–r103.
Max wave 3 / 3 / 4 / 4. Deaths fight-heavy on every seed (95701: 32
deaths, combat 27 of them in days 7–37, then hunger scatter; 95702–
95704 the same shape). Starvation 3 on 95701, 0–2 elsewhere. Same
shape as r105–r107.

## Q3 — PEOPLE CHECK (sense law)

Corpus: **2 sittings read in full** (both day-90 survivors — 95702
and 95703; no day-120 sitting exists, both seeds died d104/d107.
Corpus size reported, not padded). REAL on both.

- **Day 90 Alibek (95702, zookeeper, cautious, trust 21, visitor-
  joiner, first talk):** speaks only Russian — no shared words at
  all. The sitting is all gesture: nods, back and forth, "You good?"
  — the one English they know, grinned proudly. No faked shared
  history, no invented conversation in a language the NPC doesn't
  speak: the barrier is played honestly. Thin by design, not by
  defect. Flat note, stated not hidden: the picker loops nv:nod four
  times (the only engage choice offered) — same class as r103's
  stay-chain repeat, a picker artifact, not a game defect. The
  closing line is good ("They press their palms together — thanks,
  or goodbye, or both.").
- **Day 90 Hassan (95703, butcher, steady, trust 6, ask_favor
  planted d78):** a real ask — "I hate to ask, but do you have
  anything to eat? Anything at all? I can't keep going like this."
  The player commits ("I'll come back to help"), Hassan answers
  ("I won't forget who fed me when it mattered"), the want advances
  stage 1 → 3, closes cleanly. Short (two turns) but coherent, and
  grounded: the village is starving and the want is food. REAL.

## Q4 — WATER CONTROL (report-only)

Walk-outs 15 (95701: 2, 95702: 3, 95703: 3, 95704: 7): **dry 3,
partial 2, wet 10.** **The phenomenon is BACK — the first dry
walk-outs since r99** (r100/r102/r103 all recorded dry 0). All three
dry are 95704 RETRY trips to the same village
(village_spl_27_26314), days 61, 63, 68: packW 0→0, cistern 0/0,
refusals "cistern-dry" ×3–4 each. The cistern ran dry over the run
(d27: 33L → d54: 4L → d61: 0L) while the retry loop kept sending the
scholar back to the same village with no water. Per the r102
deferral, three dry walk-outs on a fresh band **REOPEN the
fill-placement question** — the next run's question, not a verdict
here. Note the asymmetry Q1b found again: the walk-out gate is wet
on first trips, but a trip can still strand the scholar dry for a
night (95704 d51, drain 64→0). Resets: 1 / 1 / 0 / 15 — 95704's 15
(4 SLEEP-WAITS + 11 COMPETENT) is the retry loop churning on the
same unreachable village; named here, not judged.

## Village assessment, in plain words

Four villages, and the story has moved one notch since r103. Every
one finds its first neighbor on day 25 and hears the Regional Dawn
on day 46. This time the ladder's second rung does open — two
villages live into the national window — but nothing seasons. The
one village that banks three league friends tends two of them, once
each, and watches the care fade: a gift of grain lifts a friendship
eight points, and the weeks bleed it back. Another village's oldest
friend touches the trust a realm stands on four separate days and
never holds it — 40 on Monday, 39 by the weekend. A third village
never even gets the chance: its cistern runs dry and its scholar
keeps walking out with an empty pack to the same far village, three
times, until the village dies at day 68. The fourth scatters at day
39, hungry, after losing most of its people in the first two weeks
of fighting. All four die with the lesser seat waiting or the table
priced and patient, and no nation behind them. The tending works —
the grain is real, the eight points are real — it just doesn't
happen often enough, or stick long enough, to make a nation.

## Reachable / Fun / Winnable (leg verdict)

- **REACHABLE — PARTLY, unchanged from r96–r103.** Regional on 3/4
  seeds this run (95701 died at village rank day 39; r103 was 4/4);
  national staged 0/4. The covenant road opens (95702 banks three
  covenant links, 95703 three covenant + three trade) but nothing
  seasons.
- **FUN — YES, with the same honest caveat.** Hassan's food ask is
  genuinely good, and the language-barrier sitting is honest. The
  dull spot is the death band: two villages die before the leg's
  window (day 80) even opens, and all four die with a lesser seat
  waiting.
- **WINNABLE — NOT YET.** No national, no global, no full seat on
  any seed; no wave-5 content faced; no kill claimed. The binding
  link is now named more narrowly: tending fires too rarely (pantry
  gate × late peer formation) and one +8 does not offset cooling.

## Telemetry deviation check

`node scripts/telemetry-check.js` against
hidden_files/telemetry-baselines/scale.json, metrics
nationalLive,scaleRank, current = fresh 957xx 4-seed panel:
**quiet (4 files, 2 metrics, no large deviations).** Same caveat
as r93–r103: that baseline is an old aggregate shape, so "quiet"
means "no large deviation on these two metrics", not a clean bill.
Baseline NOT rolled forward.

## Metric review

- **Q1's PARTIAL verdict is per the prereg's pre-registered
  thresholds** (tendPeer fires + trust rises, no shape seasons, no
  beat stages). No re-scoring was done.
- **Pilot-gate pilgrimages reading (recorded so the next run doesn't
  misread it):** the smoke seed (95700, DAYCAP=45) had pilgrimages=0
  with NO eligible candidates — its only known village sat at
  opinion 13, already linked; the other villages were unknown. The
  gate's intent (r30: "0 despite eligible candidates") does not
  trigger on an empty candidate set. The pilot seed 95701 had
  pilgrimages=2. The driver was proven working by the smoke (45
  natGate rows, link formed day 25, census sane, no crash).
- **Analyzer default-EVIDIR defect (caught, no verdict rested on
  it):** the cloned analyzer's default EVIDIR is the stale
  2026-11-05 path inherited from r103 (the sed only relabeled
  r103→r104, not the date). The first analyzer run read an empty
  directory and printed all zeros; re-ran with explicit EVIDIR +
  PREFIX. The clone should fix the default date next run.
- **Next run's questions (proposed, not built here):** (a) the
  fill-placement question is REOPENED by 95704's 3 dry walk-outs
  (r102 deferral lifts — a placement test is owed now, with its own
  prereg); (b) the tend question narrows to cadence/gate: weekly
  tending or a lower pantry gate vs the cooling rate — the arm as
  built fires too rarely to season anything; (c) 95704's 15 resets +
  dry-retry churn — whether retry persistence needs a return-home /
  water threshold (the r103 92701 thirst watch item, now with a
  second instance).
- **Safe-commit index clobber struck ONCE this run** (the prereg
  commit 92af9dcb8: all 4 files staged-as-deleted, the prereg purged
  from the index). Repaired via HEAD-blob cacheinfo, verified clean
  (`git status` empty, `git diff HEAD` empty). The main-tree index
  was verified unaffected (4 version files INDEX-OK). Fourth
  consecutive scale run hit by this class; the clobber is now the
  norm for safe-commit, not the exception — worth a look by the main
  session, not this run.
- No pre-registered metric was re-scored mid-run.

## Harness

Policy: scalecourt-nogate-morntrace3 (standing, UNCHANGED) +
TEND_PEER=1 (the r103 driver's own env-gated arm; no code change).
Driver: scripts/journey-scale-r104-20261106.js (r103 driver,
labels/seeds/EVIDIR only + R104 summary string). Analyzer:
scripts/analyze-journey-scale-r104-20261106.js (r103 analyzer +
classifyNatGate/summarizeNatGate, labels only). Proof:
scripts/test-journey-scale-r104-natgate-20261106.js (31/31; not on
the green list, same precedent as the r102/r103 proof tests — do not
add it). Per-seed evidence: evidence/2026-11-06/journey-scale-r104/
+ analysis txt. Prereg + this note in repo evidence/2026-11-06/.
Smoke seed 95700 x DAYCAP=45 proved the driver + TEND arm path
(45 rows, RUNG 45, link formed d25, tendPeer counter present in
output; smoke outputs deleted per the r103 precedent). Pilot seed
95701 passed (no crash, pilgrimages=2). Duplicate-day note: the
daily hook fires twice on day 2 across ALL watches (pre-existing r99
lineage behavior), so nat-gate counts carry +1 row on day 2.
Disclosed; immaterial (1 row in 316).

## Closeout (filled after the check gate)
- check.js --quick: 281 passed, 9 failed in 1054s (log
  evidence/2026-11-06/journey-scale-r104-checkquick.log). All 9
  adjudicated, none new — EXACTLY the sibling mootgate run's 9 the
  same hour (same base, different tree, no shared files): 6 standing
  pre-existing (same as r103's 6: proof-update, workflow freshness,
  mobile-combat-cadence, occupation-panels, phone-frame-proof stale
  receipt, establishment-r20-fixes racks-full voice "expected 2 got
  1") + test-measurement-cache-flags + test-trust-observer-neutrality
  (120.1s timeout in BOTH runs — load, not code; r103 had it passing
  in 60s on a quieter box) + 1 flaky capable-bot (exit 1 here, timeout
  in the sibling run — load roulette, not code; this run touches no
  combat code). No failure touches hierarchy.js / betrayal.js /
  conversation / scale code. This run changed NO src/js (only new
  scripts/ + evidence/), so none of the 9 can be caused by it.
  Targeted proof on the touched area: natgate proof test 31/31.
- Mid-run standing context (MEMORY.md updated 2026-11-06 07:06–07:07
  CST, received during this run): TABLE OFFER IS STANDING — once the
  table offers a seat the offer never withdraws (the d90 withdrawal
  is a DEFECT to fix); and DIFFICULTY: SURVIVORS SCALE — deaths stay,
  survivors must get stronger via XP/abilities/gear protection, never
  fewer deaths. Neither changes this run's verdicts: no withdrawal
  was observed in the panel (95703 sat lesser-waiting, arc 4, offer
  standing), and the early deaths recorded here are the game's shape,
  not a softening ask. The tend question now sits under the
  survivors-scale law: tending is survivor strength (relationships
  held), not fewer deaths.
- (rebase/merge/release/rotation filled below as they land)
