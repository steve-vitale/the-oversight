# Journey social r55 — THE MAIN-MENU FIX RUN, PICKS STILL FAIL (lane B, 2026-10-26)

Leg 5 (social life), cycle r55. Follows r54 (subject-menu fix: offers
moved 96.3% -> 59.1% no-offer, picks still failed 0/0/1/0; mechanism:
picks flow through the MAIN menu, which still caps discussed-'others'
behind asks).

Rotation-b read 5 at run start. This run plays 5 and writes 6 at closeout.

## PRE-REGISTER (written before any r55 seed ran — see prereg.md)

**Leg question:** does main-menu discussed-'others' surfacing move
NATURAL late picks?
Fix (src/js/conversation.js, this run, 'others' ONLY): the main-menu
t2discussed loop exempts 'ask:others' from the topicsAdded cap (mirrors
the r53 fresh exemption and the r54 subject-menu re-list). Still bounded
by MAXC (7, the view's room) and the threadAsk exclusion, never while
'others' IS the current thread. Pager rank 3 (r54) unchanged.

**Bindings (a miss is NO-GO, never re-scored):**
- F1-picks (SAME bar r54 failed): late (d91-140) UNSTEERED others picks
  >= 2 on >= 2/4 seeds. Steered picks excluded.
- F1m (mechanism, new): pooled unsteered MAIN-menu 'others' offers occur
  on >= 3/4 seeds, AND main-menu picks the majority of late unsteered
  picks when F1-picks passes.
- F1a (attribution, extended): probes split by convoSawOthers;
  convoSawOthers + served-same-pick probes are correct non-offers and
  leave the genuine-miss count.
- M1 formation >= 10 deep2 pairs/seed; M3-cond pooled late close-read
  TP >= 40%; M4 same-speaker knack repeats = 0/seed; M5 people: 5
  transcripts sense-read, 0 fabricated-history flags; M6 guardrail
  report-only.
- NO-REGRESSION: check.js --quick at the standing profile + proof test
  FAIL pre-fix, PASS post-fix, in that order.

**Seeds:** fresh block 5101-5104 (5101/5102 steering arm, 5103/5104
no-steering arm, carried for comparability). Smoke 5105, 30d: PASS.
Horizon DAYCAP=140, death-aware. Policy unchanged from r54.

**Instrument changes (only):** picks/offers tagged by menu (main vs
subject); subject-no-offer probes record convoSawOthers (this convo
already offered/picked 'others'); analyzer fork adds the genuine-miss
split and the verdicts-file menu split.

## Pilot results

Driver: scripts/journey-social-r55-20261026.js (r54 fork + menu tags +
convoSawOthers probe flag). Smoke (5105 x 30d): PASS (bondSnapDays=7,
convos=91, t2picks=21, funnel live).

| seed | steer | days | alive | deep2 | unsteered no-offer | unsteered offered | mainOff | subjOff | unsteered picked | late picks | lateMain | lateSubj | knackSame | condRate |
|------|-------|------|-------|-------|--------------------|-------------------|---------|---------|------------------|------------|----------|----------|-----------|----------|
| 5101 | yes | 140 | 7 | 27 | 267/351 = 76.1% | 81 | 3 | 78 | 2 | 0 | 0 | 0 | 0 | 76.9% |
| 5102 | yes | 141 | 7 | 27 | 192/318 = 60.4% | 110 | 3 | 108 | 4 | 3 | 1 | 2 | 0 | 74.4% |
| 5103 | no | 141 | 7 | 34 | 192/321 = 59.8% | 116 | 3 | 113 | 0 | 0 | 0 | 0 | 0 | 88.0% |
| 5104 | no | 131 | 2 | 20 | 193/293 = 65.9% | 65 | 4 | 63 | 1 | 0 | 0 | 0 | 0 | 76.1% |
| POOLED | | | | 108 | 844/1283 = 65.8% | 372 | 13 | 362 | 7 | 3 | 1 | 2 | 0 | 80.4% |

### F1-picks: FAIL (second straight run on this bar)

Late unsteered picks 0/3/0/0 — only 5102 reaches >= 2. The bar needs
>= 2 seeds. F1-picks therefore FAILS, and it is not re-scored: the
main-menu fix did not move late natural picks at driver scale.

### F1m: occurrence PASS on the letter, thin in substance

- Occurrence clause: main-menu 'others' offers occur (nonzero) on 4/4
  seeds (3/3/3/4) — PASS as written (>= 3/4 seeds).
- Majority clause: NOT TRIGGERED — it applies only when F1-picks
  passes, which it did not.
- Scale, stated plainly: 13 main-menu offers against 362 subject-menu
  offers (3.5% of offered convos), and 1 main-menu late pick against 2
  subject-menu late picks. The fix is proven at unit level (proof test
  GREEN: main-menu built list AND page 1 offer discussed-'others'), but
  in natural driver play the main menu is a marginal surface — the
  driver browses via subject menus and threads, and real play likely
  does the same. The main menu is not where 'others' picks come from
  either. The next question is not another menu exemption; it is why
  offered-'others' convos so rarely turn into picks at all (372 offered
  unsteered convos -> 7 picked convos — the offer/pick decoupling r54
  named, now measured across both menus).

### F1a attribution: convoSawOthers explains little; the residual has a new shape

Funnel analyzer on the capped probe sample (200/seed, 800 total):
menu-problem turns 610 (never-served 13, served-same-pick 543,
served-changed-pick 54; no-pick neutral 190 excluded).
- Correct non-offers (convoSawOthers + served-same-pick): 51 (8.4%).
- Genuine misses (everything else): 559.
- inBuilt on same-pick probes: true only 89/543 (16.4%) — on 454
  same-pick turns 'ask:others' was NOT in the built list at all, despite
  r54's subject-menu re-list. The re-list not firing on those turns is
  the open subject-menu question, and the persisted probe fields still
  cannot split it: candidates are the thread==='others' guard, reactive/
  generic-question-owned menus (choosingSubject still set while a
  question owns the menu — a CORRECT non-offer the probe cannot see),
  or topic2Asks gating 'others' out of t2list at that moment. Named
  next instrument (not this run's fix): record thread + reactiveQ/
  genericQ flags on every probe, so the residual splits into
  guard-owned vs genuinely missing.
- Fresh problem stays gone: never-served 2.1% + served-changed-pick
  8.9% of menu-problem turns (r54: 2.3% + 4.4%).

### M1 formation: GO — 27/27/34/20, all >= 10
### M3-cond: GO — pooled late TP 160/199 = 80.4% (>= 40%)
### M4 same-speaker knack: GO — 0 on all seeds (cross-speaker retells
reported as circulation only: 2/6/4/2)
### M5 people: GO on the binding (0 fabricated-history flags), 3/5 strong, 2/5 weak
- s5101-bondy-1-Carlos (d5): MIXED — a real grievance serve ("Elijah
  and Carlos don't speak. It's not new" — the speaker naming himself in
  third person is the template's honest form, carried from r54, not
  fabricated history), spoiled by a loop wart: "Interesting — why them?"
  asked three times running, then turns continuing past the leave line
  ("Alright. Catch you later." followed by more exchanges). Driver
  fallback loop, documented as a blank.
- s5102-late-d100-Stan (d100): FLAT — gossip treadmill ("Zoltan headed
  out for water" / "That was me — headed out for water" / "Giulia headed
  out for water"), saved only by the honest close ("the gossip, settled.
  Feels better said out loud"). Same treadmill class as r38's Scarlett.
- s5103-bondy-2-Esmeralda (d11): GO — Valter trust close-read with a
  change of heart ("I used to think worse of Valter... editing people"),
  then the NPC's own question ("Is there someone here you don't
  trust?") answered honestly and reacted to ("Noted. I'll watch too.").
  The NPC wants something; the option engages it.
- s5104-bondy-1-Sierra (d5): GO with nits — lonely mood reads through
  ("People are talking about me"), honest deflection ("Vikram? I'd
  rather not. Some doors stay closed."), teaching lands. Nits: a muddled
  subject-change opener ("That's what I heard, anyway. What's up?
  Probably fine. Probably.") and a stilted thread recap ("The way I read
  it — Still on the others").
- s5102-wrapserve-grievance-line-1-Wilhelm (d19): GO — the strongest
  read: deflection under pressure, the honest correction ("I worded that
  terribly... The real version is boring, which is how you know it's
  true"), the re-offer change-ack ("I answered that once — back when the
  answer was simpler") + old-rift line ("Older than the scattering,
  even."), ending on the NPC's origin question remembered ("Columbus,
  Ohio. I'll remember that.").
### M6 guardrail (report-only): 5101/5102/5103 end 7 alive; 5104 ends 2
alive at day 131 (16 dead: sickness 2, dehydration 4, combat 1, arena 3,
alien 4, wound 1, starvation 1). Death causes are the standing
arena/survival mix, not a social-leg signal.

### G1 crack control (carried, not gated): seeded pairs class rise
(5102, 5103), no-drop (5101, 5104). Talk volume vs bond relationship
remains the crack thread's own question.

## Proof test (demonstrated in order)

scripts/test-journey-social-r55-main-menu.js:
- Pre-fix: RED, exit 1 — discussed-unchanged 'ask:others' absent from
  the main-menu built list AND page 1 (candidate Jacob: built
  [you, fears, personal, gossip, spread, theorize, compare_maps...] —
  fresh 2 + asks 3 fill the 5-slot budget exactly, as predicted).
- Post-fix: GREEN, exit 0 — built list AND page 1 both offer it (page 1:
  gossip, spread_rumor, others, ... — the rank-3 band), and the
  double-serving never repeats (same said-ledger contract as r54).
- Disclosure (built-list tradeoff, same class as r54's): on the proof's
  constructed menu, the fix displaces compare_maps from the BUILT list
  (topics 5 + others = 6, theorize = 7 = MAXC, compare_maps blocked).
  compare_maps ranks last (rank 4) so page 1 is unaffected, and it
  remains available on menus without discussed-'others'. Named here so
  the tradeoff is visible; check.js is the regression net for it.

## Village assessment (plain words)

Four villages, same warm player, same social weather as r54 — everybody
talks about everybody now, and the talk still doesn't pick fights or
make friends by itself.

**Seed 5101 — the seven who stayed, talking.** 4 dead all run, 7 alive
at day 140. 27 deep pairs. Carlos's village gossiped constantly (122
re-offers) and the rift-talk never turned into a wound.

**Seed 5102 — the loudest village.** 12 dead, 7 alive at day 141 — the
arena took 5, sickness 3. 27 deep pairs, the most re-offers (159) and
the run's only late picks (3, one via the main menu). Wilhelm's
old-rift honesty is the run's best conversation. Talking well and
dying anyway, again.

**Seed 5103 — the densest graph.** 4 dead (all arena), 7 alive at day
141. 34 deep pairs — Esmeralda's Valter trust is the shape of it: people
changing their minds about each other out loud. 181 re-offers, the
most of the four, and zero unsteered picks — offers without picks, the
run's headline in miniature.

**Seed 5104 — the two who stayed.** 16 dead by day 131, 2 alive.
Dehydration (4) and alien deaths (4) did what the arena didn't. 20 deep
pairs built before the thinning; Sierra's lonely d5 conversation is
what the village sounded like before it emptied.

What they knew: each other's business — bonds, rifts, deeds, who left
for water — said out loud with dates and change-acks. What was missing:
the step from offered talk to picked talk. An 'others' offered in 372
unsteered convos was picked in 7. The village's memory works; its
attention doesn't follow.

## Reachable / fun / winnable (social leg)

- **Reachable:** the 'others' surface is reachable on both menus now
  (subject re-list r54 + main-menu exemption r55, both proof-GREEN),
  but reachability is not the binding constraint anymore — offers are
  plentiful (372 unsteered convos) and picks are not (7). The next
  blank is pick conversion, not menu surfacing.
- **Fun:** the transcripts are the evidence — Wilhelm's honest
  correction and remembered origin answer, Esmeralda's change of heart,
  Sierra's lonely deflection all read like people. The two weak reads
  (Carlos's loop, Stan's treadmill) are the fun tax: repeated questions
  and thin gossip still show up in ordinary play.
- **Winnable:** not this leg's question; 3/4 villages survived to the
  horizon with social fabric intact (M1/M3/M4 all GO). The 5104 thinning
  was survival-loaded, a question owned elsewhere.

## Metric review (§14)

- F1-picks: FAIL (0/3/0/0 vs >= 2 on >= 2/4). The bar stands as failed;
  it is not re-scored. Two straight runs have now failed the picks bar
  (r54, r55) on two different menu fixes — the bar is measuring pick
  conversion, not menu reachability, and the next run should judge the
  conversion question directly (see below) rather than applying a third
  menu exemption.
- F1m: occurrence PASS (4/4 seeds nonzero), majority clause NOT
  TRIGGERED (F1-picks failed). As written it passes; in substance the
  13-vs-362 scale says the main menu is not a pick surface at driver
  scale. Proposed revision for the NEXT run (not this one): retire
  menu-occurrence bars; judge F1m-picks-conversion (unsteered picks per
  unsteered offer, by menu) under a driver policy that lingers on menus
  instead of grabbing the first fresh ask — the current policy's
  gossip-first/ans-first fallbacks pick past 'others' offers without
  ever weighing them.
- F1a: convoSawOthers explains only 51/610 correct non-offers; the
  454 inBuilt=false same-pick residual is now the subject-menu question
  (thread-guard vs reactive-owned vs gating — needs thread/reactiveQ/
  genericQ probe flags, named above, not a metric revision).
- M1/M3/M4: all GO, no revisions proposed. M5: GO on the binding (0
  fabricated flags); the 2 weak reads are documented blanks, not
  binding misses — but the next run should not claim M5 GO on flags
  alone if weak reads recur; consider a quality-floor clause (no more
  than 1 weak read in 5) for the next prereg.
- M6: report-only as specified; 5104's thinning stays open for Steve's
  loop, not this leg's.
- P1/P2-style dryness: not re-measured here (r54's instrument stack
  carried; dry rates were not part of r55's bindings).

## Telemetry

Deviation check vs telemetry-baselines/social.json:
- Result: quiet (4 files, 2 metrics, no large deviations).
- Verdict: schema artifact, not a comparison — the baseline predates
  the current instrument (its l3 keys deepBonds/betrayalCases/
  mootsConvened/gossipConvos no longer exist in per-seed JSONs, whose
  l3 carries bonds/deep2/t2picks). Same practice as r54: baseline NOT
  rolled.

## Regressions

- Proof test scripts/test-journey-social-r55-main-menu.js: RED pre-fix,
  GREEN post-fix (demonstrated in that order).
- check.js --quick (evidence/2026-10-26/r55-check-quick.log): 279 passed,
  8 failed in 466s — EXACTLY r54's standing profile, file-for-file the
  same 8 pre-existing failures (hide-discovery, measurement-comparison,
  measurement-proof-update, measurement-workflow, mobile-combat-cadence,
  occupation-panels, phone-frame-proof, parity-20261014 — the parity
  failure is the known "gear: they still wear their spear and jacket"
  case, also in r52's set). Zero conversation/gossip/moot failures.
  The --quick bar is therefore met at the standing-profile standard, not
  at literal green — the 8 are pre-existing and unrelated to this change.
  (check.js exit 1 is the standing set's nonzero exit, not a new break.)
- Extra net: r54's proof test scripts/test-journey-social-r54-others-
  menu.js re-run under the r55 fix: GREEN, exit 0 — the subject-menu
  fix is intact alongside the main-menu exemption.

## Infra notes (for the next run)

- A service restart killed the first driver invocation after seeds
  5101-5103 had flushed (per-seed flush-after-every-seed, carried from
  r51, saved the run: at most the in-flight seed was at risk, and 5104
  had not started). Recovery: preserved the part-1 driver log, re-ran
  with SEEDS=5104 only, then rebuilt the pooled verdicts file from the
  four per-seed JSONs with scripts/assemble-journey-social-r55-verdicts-
  20261026.js (same verdict-map shape as the driver's; the driver's own
  verdicts write covered only the 5104-only run and was replaced).
- The driver's verdicts file is end-of-run-only: any split run needs
  the assembler. Consider making the driver write verdicts incrementally
  per seed (same crash-safety as the per-seed flush).
- Heartbeat: the embedded-loop run script (goal hidden_files
  journey2-social-r55-run.sh) heartbeated throughout both invocations;
  the restart killed the loop with the session, but the registry
  heartbeat was 2 min old at recovery — inside the 15-min liveness bar,
  so no stale-lock trip.
- The r55 driver log is split: part-1 log (smoke + 5101-5103) preserved
  as journey2-social-r55-driver-part1.log; the 5104 invocation log
  overwrote journey2-social-r55-driver.log. Combined at closeout as
  evidence/2026-10-26/r55-run.log.

## Adoption addendum (lane B run of 2026-10-26 ~06:00 CDT, this run)

- STALE-LOCK RECOVERY: this run found lock
  `2026-10-26T08:55:34Z` with registry heartbeat for journey2-social
  last at 2026-10-26T09:49:46Z — 66 min stale at 10:55Z, past the
  15-min liveness bar. Per the overlap guard the previous run was
  DEAD, not live. Lock deleted, this run's lock created
  (2026-10-26T10:56:24Z), and the orphaned journey2-social tree adopted
  rather than re-registered (same loop, same slug, same leg — no new
  tree, no slug collision).
- What was orphaned: the full r55 play + analysis above (run-note,
  prereg, 4 per-seed JSONs, funnel, verdicts, transcripts, driver,
  analyzers, proof test) plus the UNCOMMITTED 11-line main-menu
  'others' exemption in src/js/conversation.js. Nothing was re-run
  from scratch: the adoption verified the orphaned work instead —
  proof test re-run GREEN (exit 0) on the adopted tree, r54 proof
  test re-run GREEN (exit 0), diff re-read (11 insertions, 'others'
  ONLY, MAXC + threadAsk bounds intact).
- Base drift: master had moved 12 commits past the orphan's base
  (8a7540534 -> be8541647); none touch conversation.js or the r54
  proof script, so the adoption commit was rebased onto master in the
  worktree, proof tests re-run, and only then merged --ff-only.
  (Post-rebase verification results appended below before landing.)
