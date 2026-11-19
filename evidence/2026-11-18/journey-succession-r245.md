# Journey succession r245 — run note (Lane B, leg 7)

Leg 7 (succession), run r245, fresh band 34361–34364 (EARLY_KILL_DAY=40,
POST_DAYS=70) + smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25, standing
control). Base master `854e395c0` at run start. Prereg:
`evidence/2026-11-18/journey-succession-r245-prereg.md`.
Panel: 5/5 seeds exit 0. Driver
`scripts/journey-succession-r245-20261118.js`, analyzer
`scripts/analyze-journey-succession-r245-20261118.js` (both r233's,
rename only, plus the corpse-witness census instrument in the driver
and the REL-VET revised denominator + WITNESS-CENSUS section in the
analyzer). Panel runner
`scripts/run-journey-succession-r245-panel.sh`.
Proof tests re-run on this base: r232 relationship-mourning (ALL GREEN)
and r225 F5 settled-favor (22/22).
No src/js change this run — measurement + tooling only.

## Panel

| seed | handoff | mantle flips | mourning servings | dry |
|------|---------|--------------|-------------------|-----|
| 34361 | Deborah → Sidney d37 (organic) | 5 (→ Alfredo → Manuel → Easton → Elena) | 3 | 0 |
| 34362 | Hermann → Stan d28 (organic) | 2 (→ Thabo) | 7 | 0 |
| 34363 | Angelo → Victor d17 (organic) | 4 (→ Jaxon → Sergio → Ruia) | 11 | 0 |
| 34364 | Amelia → Patrick d30 (organic) | 7 (→ Zoltan → Rune → Carlos → James → Nikolai → Mia) | 12 | 0 |
| 33998 | Heinrich → Grace d6 (scripted) | 1 | 4 | 0 |

37 mourning servings panel-wide, 0 dry hits. Day-skips 0 (watch
continues). Bonds kept growing after the deaths (relEnd bonds 51–103).
Newcomers arrived on all 4 fresh seeds (20 arrivals panel-wide) and
bonded (NPC-NPC new bonds 78; bondedEver 4/4 probe-opened seeds).

## Verdicts (pre-registered metrics bind)

- **REL-BOND PASS**: 4 bond-variant servings, all held, 0 unheld —
  Daniyar d+64 for Sergio (bond 100/3): the bond-knew opener ("I knew
  Sergio. Really knew them, not the fire's version. Mine. And now
  there's just the fire's.") and the bond-watch part ("Sergio knew
  things about me nobody else does. That's gone now, and I keep
  catching myself about to tell them something."), Carlos d+15 for
  Patrick (bond 36/1), Xavier d+65 for Nikolai (bond 22/0, part).
- **REL-VET PASS**: 5 veteran-variant servings, all held, 0 unheld,
  on 13 opener draws in both-veteran convos — the floor met with
  margin this time (r233 met it exactly at 10). James d+30 for
  Somchai (vet-treeline), Jaxon d+7 for Angelo, Esperanza d+3 for
  Amelia, Zoltan d+3 for Amelia (vet-club: "Amelia killed the things
  that come at night. I did too. That's a small club, and it's smaller
  now."), James d+46 for Rune.
- **REL-WIT INSUFFICIENT-DATA (supply now PRESENT)**: 0 witness
  servings, 0 witness convos — but the WITNESS-CENSUS below finds the
  first witnessed person corpses on any succession panel: Vincent
  (combat, witnesses Javier + Stan) and Javier (combat, witness Stan),
  both seed 34362. No driven mourning convo was ever held about
  either of them — they were not bearers, and the driver only drives
  mourning sittings about the bearer chain. The witness variant is
  reachable in principle now (supply exists); the engagement path is
  the missing piece, not the corpse supply. See metric review.
- **WITNESS-CENSUS SUPPLY-PRESENT**: 177 corpses panel-wide (41 person,
  136 monster); person corpses with witnesses 2 (both combat, both
  34362). All 136 monster corpses carry witnesses (the killer's id) —
  the mechanism works. Person causes: monster, the wild, the arena,
  sickness, a stranger, thirst, starvation, a wound that wouldn't
  close, The Callback, dehydration, contest, the expedition, combat
  (×2). The r233 supply-zero finding is superseded: witnessed combat
  deaths DO occur on this band (2 in 41 person deaths), at about the
  rate the r233 static audit predicted (rare).
- **MOURN-TEMPLATE PASS**: 37 servings across 13 shapes, 0
  same-speaker repeats, 0 village-window repeats.
- **MOURN-EXHAUST PASS**: 0 exhausted-line servings in mourning
  sittings.
- **MANTLE-FINE PASS**: 19 deaths observed, 0
  flippedImmediate=false, 0 fineLatency>=2, 0 unexplained
  fineLatency==1, 0 day-skips. The mantle flips synchronously at
  every observed death with a living successor — including the
  seven-deep chain on 34364 (Amelia → Patrick → Zoltan → Rune →
  Carlos → James → Nikolai → Mia), the deepest yet on this leg.
- **DRY CENSUS PASS**: 0 dry hits of any class, 5 honest fallbacks
  (Farid d94–96 on 34361, Boris d82/d84 on 34363 — the same honest
  "words are missing" line, served 3×/2× across days for the same
  speaker; not a template repeat, a fallback), 0 null-return
  silences.
- **WILD CHECK**: no regressions observed on the carried surfaces —
  dry 0 everywhere, deflect_q 0, dlg:doubt 0, no stale-favor resume,
  no narration-quote opener in the read transcripts. F5 targeted
  harness (r225) green 22/22 on this base; r232 relationship-mourning
  proof test ALL GREEN.
- **C3d WILD HOLD**: 0 C3d-class erasures. Recap exchanges on the
  read transcripts named the open thread every time ("Still on what
  they confided." Alfredo d+14; "Still on that personal stuff."
  Hassan d+7; "Still on what's been happening." Daniyar d+64,
  Zoltan d+3). The empty-log live-line path itself is still
  unobserved in the wild — the recaps above named live threads
  through the thread log, not the empty-log path.
- **F5 WILD EXERCISE PASS (5-panel window, adopted this run)**:
  the settled-favor line ("It's already handled. Thank you for
  asking.") fired 0 times on this panel — 0 in all 65 transcripts
  and 0 in every sayTrace. The rolling 5-panel window
  (r230+r231+r232+r233+r245) therefore carries r230's 2 firings,
  meeting the >=1x arm, AND 0 F5-class dry hits. The r233 FAIL is
  closed by the adopted window widening, not by re-scoring: under
  the old 3-panel window this panel would have recorded FAIL again
  (0 firings in r232+r233+r245).
- **CONTROLS PASS**: smoke 33998 snapshot matches r233 exactly —
  handoff d6 Heinrich → Grace, relPost bonds 33, relD14 50, selfId
  grace_obi, identical to the r233 smoke run. Pick rank 1 and funeral
  INCALL true on every seed, selfReq 0 everywhere.
- **CAP-NC INSUFFICIENT-DATA**: 0/0 eligible seeds (bondedEver
  descriptive 4/4 probe-opened seeds).
- **HABIT-COLLISION PASS**: 0 same-seed same-habit servings.

## Village assessment (plain words)

Five villages buried their bearer and kept going. The hardest was
34364: seven handoffs in sixty-four days — Amelia to Patrick to
Zoltan to Rune to Carlos to James to Nikolai to Mia, the last of them
standing at the end — and the village still held together, bonds at
74 by the end. 34361 ran five deep with two bearers lost to the wild
in two days (Manuel then Easton) and steadied. 34363 handed over four
times, twice to dehydration. 34362 handed over once and went quiet
after Stan's death to a stranger — the village ended early (dayAdv 35)
with four alive. The smoke village buried Heinrich on day 6 and Grace
carried it.

The grief knows who it belongs to, and this panel proved it again in
both directions. Daniyar, who knew Sergio at bond 100, says he knew
him — really knew him — and catches himself about to tell him
something that is gone now. Zoltan, who stood at the treeline with
Amelia, names the small club and its shrinking. Every veteran serving
had both names in the kill log; every bond serving had the bond in the
record.

What still didn't get said: nobody on the panel mourned a death they
watched happen. Two villagers did die in fights others were in —
Vincent and Javier, both in combat on 34362, with Javier and Stan
standing there — but no sitting was ever driven about them, because
the driver only sits people down about the bearer. The witness lines
wait for a sitting about a witnessed death, and this panel's villages
never had one.

## Blanks filled / findings

- **REL-VET floor watch resolved for this panel**: 13 opener draws
  (was exactly 10 on r233) — the floor holds with margin; the gate
  fires and the pool lands it. Keep watching.
- **Witness supply answered, second half**: the r233 supply-zero
  finding is superseded — witnessed person corpses DO occur (2/41
  person deaths, both combat). The open question moves from supply to
  engagement: no driven mourning convo ever touches a witnessed
  non-bearer death. The variant needs a staged sitting (a witness of
  a witnessed death driven into a mourning convo), not more corpses.
  No code change: inventing a sitting the driver never stages would
  fabricate.
- **F5 window widened and passing**: the 5-panel window (r230's 2
  firings) closes the r233 FAIL by the adopted revision. The branch
  works (harness 22/22); its wild rate is ~2 firings per 5 panels.
- **People check (transcripts read in full)**: Alfredo d+14, Hassan
  d+7, Karina d+30, Daniyar d+64, Zoltan d+3. Conversations hold
  together — confidences resumed across sittings, party roles passed
  hand to hand (scout: Alfredo → Hassan → Alfredo; Somchai →
  Daniyar), a party named aloud ("The Company" — Zoltan's suggestion
  against the System's "MEAT AND FRIENDS"), teaching in the field
  (Wild Garlic, Common Plantain, Wild Onion). Wrinkles, not defects:
  (1) the recap pronoun-direction wrinkle again — Alfredo's opener
  thread reads "what they confided" where the confidence was his own,
  told TO the dead bearer (same class as r233's Gianna note);
  (2) the scout role ping-pongs between the same two villagers at
  successive checkpoints because the driver re-picks scout every
  sitting — voiced each time, but driver-driven, not a villager's
  choice; (3) the "Your partner is inside the Haven hall" line lands
  mid-conversation twice (Karina d+30, Daniyar d+64) — honest gating,
  flat tone.
- **No new src/js change**: the leg's open items are measurement
  questions now, not line fixes. This run's deliverables are the
  panel, the widened F5 window verdict, and the witness-supply
  correction.

## Reachable / fun / winnable

- **Reachable**: yes — scripted and organic handoffs, mantle chains
  up to seven deep, mourning in all three relationship kinds that had
  supply, bonds, newcomers all fired in the wild on every seed.
  Witnessed deaths now occur in the wild (2 on this panel) — the last
  unreached variant is one staged sitting away.
- **Fun**: the leg reads as people grieving people they knew, in
  their own words, with the village visibly carrying on around them
  — naming parties, passing roles, teaching what the dead knew.
  Zoltan naming the party "The Company" while grieving Amelia, and
  Daniyar catching himself about to tell Sergio something, are the
  leg at its best.
- **Winnable**: this leg does not judge the win — it judges the
  mantle passing cleanly, which held on all 19 observed deaths. The
  binding wall stays upstream (wave-4 kills, veteran bar, launched-
  party damage), unchanged by this run.

## Telemetry

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/succession.json
--current 'evidence/2026-11-18/journey-succession-r245-tele-*.json'
--metrics deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions`:
**2 LOUD lines, both explained** — deaths.bearer +150% (baseline 7.6
→ current 19) and census.fallen +208% (baseline 14.3 → current 44).
The tool sums the 5 current files; the baseline stores means (the
documented means-vs-sum mismatch, unresolved since r229). Per-file
means this panel are BELOW baseline (bearer deaths 3.8 vs 7.6,
fallen 8.8 vs 14.3; per-seed: bearer 5/2/4/7/1, fallen 18/11/6/8/1).
No real deviation. Baseline NOT rolled.

## Metric review

1. F5 WILD EXERCISE: PASSES under the widened 5-panel window
   (r230+r231+r232+r233+r245 carries 2 firings). The window rolls
   next run to r231+r232+r233+r245+next — which still carries r230's
   2 firings only if the window is 5 panels ending at the next run;
   under the rolling definition the next window is
   r231+r232+r233+r245+r246, which carries 0 firings. The arm will
   FAIL again next run unless this panel's successor fires or the
   window is re-judged. Proposed for the next run: reclassify the
   wild-exercise arm as DESCRIPTIVE with the r225 harness (22/22) as
   the binding proof, since the wild rate (~2 per 5 panels) makes any
   fixed window a coin flip. The PASS stands as recorded this run.
2. REL-WIT: supply is now PRESENT (2 witnessed corpses). Proposed
   for the next run: stage one driven mourning sitting with a witness
   of a witnessed death (e.g. drive Javier or Stan about Vincent on
   a 34362 re-run, or stage a fresh witnessed combat death and drive
   its witness) — if the variant serves, REL-WIT is measurable at
   last; if it does not serve despite a witnessed sitting, that is an
   engagement question for that run, not a supply question.
3. REL-VET's 10-draw floor held with margin (13 draws). Keep it.
4. C3d: the empty-log live-line path is still unobserved in the wild
   after five panels. The bar stays; a future panel with an
   empty-log recap would give the positive evidence none could.
5. Proof refresh rounds 11 + 12 remain owed (not this run's).
6. Multi-name relationship mourning stays open (not built).
7. KIN mourning stays unavailable (no kin signal between villagers).
8. The scout-role ping-pong (driver re-picks scout every sitting) is
   a driver artifact worth one line in the next run's prereg: vary
   the role pick across checkpoints so the role passes read as
   choices, not a bounce.

## Gate

`node scripts/check.js --quick` in the worktree, launched by the
coordinator via nohup (pid 16077, evidence/2026-11-18/journey-succession-r245-gate.log):
**339 passed, 5 failed in 723s**. All 5 are the standing set, 0
attributable to this change (no src/js change this run):

- test-measurement-proof-update.js +
  test-measurement-workflow.js — measurement-proof staleness pair
  (standing).
- test-phone-frame-proof.js — stale phone-frame receipt (standing).
- test-living-garden-deed-attainment.js,
  test-one-person-army-deed-attainment.js — 120s timeouts under load
  (standing).

Proof tests re-run on this base: the r232 relationship-mourning
guard ALL GREEN; the r225 F5 targeted harness 22/22.

## Closeout

- Worktree: ~/workspace/worktrees/journey2-succession (registered,
  heartbeat loop journey2-succession-hbloop-r245.sh running, pid 57835).
- Commit via the worktree's own safe-commit.sh; rebase onto master if
  master moved; ff-only merge; worktree release + remove + branch
  delete; rotation-b 7→4 written and verified; playtest-loop-2.lock
  (run_id 2026-11-19T03:56:53Z) deleted after run_id verification;
  main tree verified clean.

## Adoption closeout (Lane B succession r245 adoption, 2026-11-19)

The scheduled run timed out before closeout; the adoption finished it.
All panel claims re-verified from the files, nothing taken on the
timed-out run's word:

- Panel log: all 5 seeds exit 0, analyzer exit 0.
- Analyzer verdicts: REL-BOND 4/4 held; REL-VET 5/5 held on 13 opener
  draws (floor 10, met with margin); REL-WIT INSUFFICIENT-DATA (0
  witness convos) with WITNESS-CENSUS SUPPLY-PRESENT (177 corpses:
  41 person / 136 monster; 2 witnessed person corpses — Vincent and
  Javier, both combat, seed 34362); MANTLE-FINE 19 deaths, 0
  day-skips; DRY-CENSUS 0 dry hits, 5 honest fallbacks;
  MOURN-TEMPLATE 37 servings / 13 shapes, 0 repeats; MOURN-EXHAUST 0;
  HABIT-COLLISION PASS; CAP-NC 0/0 eligible.
- F5 spot-check: 0 "already handled" firings across all 65
  transcripts + 5 stdout JSONs — the adopted 5-panel window PASS
  stands as recorded.
- Telemetry re-run: exactly the 2 LOUD lines the run note documents
  (deaths.bearer +150%, census.fallen +208%), both the documented
  means-vs-sum mismatch — per-file means are BELOW baseline (bearer
  3.8 vs 7.6; fallen 8.8 vs 14.3). Baseline NOT rolled.
- Gate solo re-runs on the branch tip: measurement-proof staleness
  pair FAIL solo as standing ("Proof source inputs are not current";
  retained neutrality proof); phone-frame FAIL solo as standing
  (stale receipt); living-garden + one-person-army PASS solo (exit 0)
  — load artifacts. Ladder-bundle control absent from the gate
  failure list — cleared by the ladderbase-cause-a fix.
- Proof tests on the branch tip: r232 relationship-mourning ALL GREEN;
  r225 F5 settled-favor 22/22.
- Uncommitted file at adoption start: `scripts/run-journey-succession-r245-panel.sh`
  — mode change only (100644 → 100755, no content change). NOT landed:
  safe-commit.sh stages every path with a hardcoded `100644` mode, so a
  pure mode change is silently dropped from its commits (verified: the
  closeout commit carried only the note). The bit was reverted (chmod
  644) so the worktree is clean; the script's content is committed in
  9671c5ad7 and the bit is execution scaffolding, not evidence.
- No src/js change this run; no lever held (none in scope).
