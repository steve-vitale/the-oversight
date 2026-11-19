# Journey succession r248 — Lane B, leg 7 (succession)

Run: 2026-11-19, Lane B leg 7. Base: master `e1f002065` at run start
(establishment r243). Rotation-b read 7 at run start; this run writes 4
(endgame next) at closeout. Lock: playtest-loop-2.lock run_id
`2026-11-19T12:55:42Z`. Worktree: `~/workspace/worktrees/journey2-7`.

**Adoption note:** the scheduled run timed out with the `check.js --quick`
gate still running (7 F's visible at the timeout). The gate finished
afterwards on its own (335/9, see Gate). This note is written by the
adoption from the panel files, not the timed-out run's word: every
verdict below was re-checked against the per-seed JSONs / analyzer
output. No src/js change was made this run; the only new code is the
WIT-SIT driver instrument + analyzer + panel runner.

## Leg question (prereg)

r245 left REL-WIT at INSUFFICIENT-DATA with supply now PRESENT (first
witnessed person corpses ever: Vincent + Javier, both combat, seed
34362). This run built the WIT-SIT instrument — a general driver
instrument that stages a driven mourning sitting with a living witness
of a witnessed non-bearer death — to move the question from supply to
engagement: does the witness variant ever serve when a witness sits
down about a death they saw?

## Panel

- Driver: `scripts/journey-succession-r248-20261119.js` (r245 driver +
  WIT-SIT only, no other logic change).
- Analyzer: `scripts/analyze-journey-succession-r248-20261119.js`.
- Seeds: FRESH BAND 34371–34374 (EARLY_KILL_DAY=40, POST_DAYS=70) +
  DEDICATED 34362 RE-RUN (the r245 seed with the Vincent/Javier
  witnessed deaths) + smoke 33998 (EARLY_KILL_DAY=5, POST_DAYS=25).
  All 6 seeds exit 0; analyzer exit 0. Panel ran 13:21–13:29Z.
- 84 transcripts in `evidence/2026-11-19/`.

## Verdicts (binding bars, §14)

| Bar | Verdict |
|---|---|
| REL-WIT (staged, floor 3 single-fresh sittings) | **INSUFFICIENT-DATA** — 0 single-fresh witness sittings, 0 servings. Positive arm unmeasurable. |
| REL-BOND | **PASS** — 6 servings, all 6 where the relationship held, 0 where it did not. |
| REL-VET (revised denominator, 10-draw floor) | **PASS** — 3 servings, all 3 where both were veterans, 0 otherwise; 19 opener draws in both-veteran convos (floor held with margin). |
| MOURN-TEMPLATE | **PASS** — 44 name-parameterized servings, no template re-served for a different dead, none repeated across speakers about the same dead within 5 days. |
| MOURN-EXHAUST | **PASS** — 0 exhausted-line servings in mourning sittings. |
| MANTLE-FINE | **PASS** — 22 deaths observed, 0 flippedImmediate=false outside VILLAGE-OVER, 0 fineLatency>=2, 0 unexplained fineLatency==1, 0 day-skips. |
| DRY CENSUS | **PASS** — 0 dry hits of any class; 9 honest fallbacks (all 34371 Nikolai, same honest line). |
| WILD CHECK | **PASS (no regressions observed)** — r192 deflect_q 0, dlg:doubt 0, other-class 0; MOURN-EXHAUST 0; no new dry class in any of the 84 transcripts. |
| C3d WILD HOLD | **PASS (no erasure)** — 0 C3d-class erasures; the live-want recap path did not engage this panel either (no recap serving while a live want was open). |
| F5 WILD EXERCISE (DESCRIPTIVE) | 0 settled-favor firings this panel. Rolling 5-panel window (r231+r232+r233+r245+r248) stays 0. Binding proof is the r225 harness: **22/22 GREEN** (re-run on this base). |
| CONTROLS (smoke S_fixed) | **PASS** — smoke 33998 at-death snapshot matches r233 exactly: handoff d6 Heinrich → Grace, relPost bonds 33, relD14 50, selfId grace_obi. Pick rank 1, funeral INCALL true, selfReq 0 on every seed. |
| CAP-NC (descriptive) | INSUFFICIENT-DATA — 1/1 eligible seeds bonded-by-deadline (34372 Ricardo, trust 34, want curious). Denominator < 3. |
| WITNESS-CENSUS (diagnostic) | **SUPPLY-PRESENT** — 217 corpses (35 person, 182 monster); 2 witnessed person corpses, both on 34362: Vincent (combat, witnesses Javier + Stan) and Javier (combat, witness Stan). |
| WIT-SIT (diagnostic) | **NO-STAGING** — 2 staged, 0 fired, both `no-living-witness`. |

Qualifying convos panel-wide: bond-close 19, both-veteran 30, witnessed 0.

## REL-WIT: why the sittings never fired (the finding)

The instrument worked as designed — it detected both witnessed deaths
on the day they happened — but the witness pool was empty by
construction, twice over:

1. **No living speaker.** Vincent was detected on day 49
   (witnesses Javier + Stan). Javier was already dead by that scan —
   he died in the same combat window (detected day 50, cause combat),
   so the only other witness was Stan, who held the mantle and is
   excluded from the speaker rule. The next day Javier was detected
   (witnesses: Stan only) and Stan himself died that day (day 50,
   "a stranger"), so again nobody could sit. The 34362 re-run
   reproduced r245's Vincent/Javier deaths exactly (same causes, same
   witnesses), so this is the trajectory, not drift.
2. **Multi-fresh anyway.** Even with a living speaker, both sittings
   would have been multi-name (freshPersonN 3 and 4 — three to four
   fresh person corpses in the window), and the engine's mourning pool
   serves relationship variants ONLY in the single-name branch. The
   witness variant was out of the pool regardless of the speaker.

So the staged deaths arrived as a cluster that killed its own
witnesses. The lesson for the next run is not "stage harder" but that
the instrument's two gates — a living non-bearer witness, and a
single-fresh window — are both defeated by how witnessed deaths
actually happen: combat kills the people standing next to the dead.
The next step (metric review) is to let the bearer sit as a mourner
of others — Stan watched both men die and is the person with the
most to say — and/or to stage on deaths whose witnesses survive the
day. Until one of those changes, REL-WIT will stay
INSUFFICIENT-DATA on every panel that only ever sees clustered
combat deaths.

## People check (transcripts read in full)

- **Olivia, 34371 d+3, mourning Darius** (bond-close, both-veteran):
  "Gertrude is gone and Darius is gone and the world just...
  continues. That's the part I can't stand." The cope:bond-habit
  line is specific to the dead man: "I save the best bite for last
  the way Darius used to, when they were the one keeping me steady.
  It doesn't work the same. I do it anyway." A person grieving, not
  a template.
- **Vincent, 34362 d+3, mourning Hermann**: "Nobody says Hermann's
  name right yet. We will. Give it a few days." Plus the sleep
  detail ("Sleep's gone strange. I sit apart to eat at odd hours
  now.") — the mourning lands.
- **Mateo, 34371 d+58, newcomer mourning Benoit**: "I dreamed
  Benoit was still here. Woke up angry at the dream. Stupid." /
  "The fire feels smaller without Benoit. The rest of us will have
  to be bigger." A newcomer who arrived days ago already mourns by
  name — the bond system reaches strangers.
- **Remainder (carried):** the driver's "Wait — what were we talking
  about?" re-ask fires twice in dry sittings on this panel too (also
  seen on social r238). It reads as the driver pestering, not the
  villager forgetting. Not a defect in the villagers; the driver
  note stays open.

**People check: PASS.** No dry lines, no fabricated history, no
filler loops in the sittings read. Mourning names the dead every
time.

## Village assessment (plain words)

Six villages, six different ways to lose a scholar. The mantle passed
22 times and never stuck — every handoff landed the same day, nobody
was left waiting. The deepest chain was seed 34372, where the mantle
changed hands seven times and three bearers died on a single day
(d78: Diana → Aaliyah → Dumisani → Tom), the village shedding
leaders faster than it could mourn them. Seed 34362 — the re-run —
ended thinnest: 4 alive, pantry empty, the second handoff already
behind it. Seed 34371 lost six bearers and still ended with 11 alive
and food in the pantry; seed 34373 lost only one and ended with 9.
Nobody starved on a full pantry; the villages that ended poor ended
poor because the people who knew how to keep them fed kept dying.

Per-seed census (end of panel): 33998 alive 11 / fallen 1 / pantry
22,336; 34362 alive 4 / fallen 11 / pantry 0; 34371 alive 11 /
fallen 6 / pantry 10,066; 34372 alive 6 / fallen 10 / pantry 9,761;
34373 alive 9 / fallen 3 / pantry 13,929; 34374 alive 9 / fallen 5 /
pantry 10,551. Bearer deaths 22 panel-wide (1/2/6/7/1/5).

## Telemetry

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/succession.json --current
'evidence/2026-11-19/journey-succession-r248-tele-*.json' --metrics
deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions`:

**2 LOUD lines, both explained** — deaths.bearer +189% (baseline
7.6 → current 22) and census.fallen +152% (baseline 14.3 → current
36). The tool sums the 6 current files; the baseline stores means
(the documented means-vs-sum mismatch, unresolved since r229).
Per-file means this panel are BELOW baseline (bearer 3.67 vs 7.6;
fallen 6.00 vs 14.3; per-seed bearer 1/2/6/7/1/5, fallen
1/11/6/10/3/5). No real deviation. **Baseline NOT rolled.**

## Gate

Orphaned gate (run by the timed-out coordinator, finished after the
timeout): **335 passed, 9 failed in 1460s** —
`evidence/2026-11-19/journey-succession-r248-gate.log`.

Failures: living-garden deed-attainment (120s timeout);
measurement-proof-update (exit 1); measurement-workflow (exit 1);
measurement-cache-flags (3 sub-failures); occupation-panels (120s
timeout); phone-frame-proof (3 sub-failures, stale receipt);
one-person-army deed-attainment (120s timeout);
trust-observer-neutrality (120s timeout); capable-bot (120s timeout).

**Adjudication (adoption, solo re-runs — PENDING; see addendum
below).**

## Reachable / Fun / Winnable

- **Reachable: YES.** The succession leg fires on every seed: the
  mantle passes, checkpoints sit people down, funerals are called,
  newcomers arrive and bond. Nothing in the leg is decoration.
- **Fun: mostly.** The mourning writing is the strongest part of
  the leg — villagers grieve by name, with habits and details that
  belong to the dead. The weak part is the witness question itself:
  the game knows who watched someone die and does nothing with it.
  A witness who never gets to speak is a story the player can feel
  is missing.
- **Winnable: not judged on this leg.** Succession measures the
  handoff, not the win.

## Metric review

- **REL-WIT stays INSUFFICIENT-DATA** (0 single-fresh sittings, 0
  servings). Next step, filed here: the WIT-SIT speaker rule must
  change before another panel can measure this. Two candidates: (a)
  let the bearer sit as a mourner of witnessed non-bearer deaths
  (the bearer exclusion exists because bearer deaths already get
  checkpoint sittings — a different role); (b) stage on the death
  day before the next runDays call, so a witness who dies the next
  day can still speak. Note the multi-fresh bind too: even with a
  speaker, clustered deaths serve multi-name sittings where the
  witness variant cannot draw. The arm's measurable unit may need to
  be the sitting that names the dead, not the variant serving.
- **REL-VET floor watch CLEARED**: 19 opener draws vs the 10-draw
  floor, with margin. Keep the floor; stop watching it.
- **F5 WILD EXERCISE stays DESCRIPTIVE**: 0 firings this panel,
  rolling window 0. The r225 harness (22/22) remains the binding
  proof.
- **C3d**: the live-want recap path did not engage again (sixth
  straight panel). The bar stays; the question is now whether the
  path is reachable at all in the wild, not whether it is broken.
- **CAP-NC**: denominator starved again (1 eligible). No revision —
  the starvation is by design (newcomers arrive late or not at
  all).
- **Day-skip watch**: 0 skips — twentieth straight panel watch,
  still clean.
- **Proof refresh rounds 11 + 12 remain owed** (not this run's).
- **Multi-name relationship mourning stays open** (not built).
- **KIN mourning stays unavailable** (no kin signal).
- **Scout-role ping-pong**: carried as an owed driver note
  (checkpoint loop untouched this run to protect the smoke control).
- **Driver re-ask pestering**: carried (see People check).

## Adoption addendum

- Gate solo adjudication: (to be filled).
- Master at adoption: `f075dbb84` (Loop A 1215Z round evidence;
  bowsource DIAG-GO + arrowsupply DIAG-NO-GO) — the main tree had
  returned to master by the time the adoption started; no merge
  conflict with the 1215Z work.
- Heartbeat note: the adoption's heartbeat waited ~10+ min on
  REGISTRY.lock behind a reaper scan (pid 61784, running 17+ min
  under load) and a worktree-release; the registry heartbeat went
  stale (13:52:23Z) while the run was in fact alive — the flock
  queue, not a dead run. Heartbeat landed once the queue drained.
