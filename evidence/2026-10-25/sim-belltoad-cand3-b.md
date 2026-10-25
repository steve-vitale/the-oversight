# sim-belltoad-cand3-b — LEVER: strike-or-flee fallback after the 2-shout cap (candidate 3 from sim-belltoad-a)

Run: fleshout-loop-b-20261025T1531Z, arm sim-belltoad-cand3-b. Candidate 3
ONLY — candidates 1 (chorus break, landed 818361b41) and 2 (morale hold
skip, KILLED 1418Z) are done and are NOT re-touched here.

Worktree: ~/workspace/worktrees/sim-belltoad-cand3-b (coordinator merges;
KILLED arms are not merged — see verdict).

## PRE-REGISTRATION (binding — written BEFORE any sweep, docs/MEASUREMENT.md §§9–12, 14–15)

- Canon: docs/CANON.md read first. docs/MONSTER-WAVES.md lists Choir Toad
  in the wave-1 roster but carries no belltoad counter entry (known gap
  from sim-belltoad-a) — nothing invented; counter data lives in
  src/data/monsters.json (shout, "Break the chorus") and the COUNTERWIRE
  block + trick-aware morale block in src/js/fieldFights.js.
- Lever, EXACT fallback rule (specified here after reading the code;
  implemented ONLY if Step 0 passes — no game code is touched before
  that gate): in the trick-aware morale block (fieldFights.js ~1470),
  when hopeless AND trickLog non-empty AND vHp > 25% of max, the hold is
  NOT applied when the performed trick is EXHAUSTED — defined narrowly
  as a shout-kind counter with rec.trickShouts >= 2 (the 2/fight cap
  already reached). The normal hopeless branch then runs (help call if
  allies near, else vFlee) plus a narrating line ("spent the trick —
  two shouts and the chorus still stands — and runs while running
  still works" family; exact wording fixed at implementation). Why
  this is strike-or-flee: after the cap, villagerTrickAction already
  returns null for shout, so the fighter's next action WOULD be a
  strike — but the morale hold at the round end where the cap is
  reached prevents ever reaching it when death arrives mid-next-
  monster-phase (belltoad-a's R3). Lifting the hold at that round
  end lets the hopeless branch flee immediately instead. If help is
  near, the help call fires instead — still the strike-or-flee
  family. UNTOUCHED: the 2-shout cap itself, trickDisrupt (candidate
  1), villagerTrickAction's trick offers, the >25% hold floor, and
  every other system. `git diff` must show fieldFights.js only.
- WHY the definition fixes from the candidate-2 kill do not change
  this rule's trigger (they are carried, and they bound it):
  (a) SPOOL: excluded by construction — the trigger fires only for
      shout-kind counters with trickShouts >= 2; spool's trick is
      wait:spool-record, never a shout, so spool can never trigger
      the fallback. The degenerate hopeless formula at vTaken = 0
      therefore never meets this trigger. If this rule were ever
      generalized beyond shout-cap, it must exclude spool entirely
      or require vTaken > 0.
  (b) PROGRESS COUNTERS: counted as progress by construction — the
      trigger is cap-exhaustion, not non-progress, so spool
      recording (sigW3b spRec), nielsen ratings (sigW5 niR),
      redactorQuiet, focusBore, tosRead and eulogyContradicts are
      all irrelevant to it; a generalized non-progress rule must
      count every one of them as progress, not just damage and HP.
  (c) GAVEL AUDIT (done before any armed sweep, result here):
      CONFIRMED REPEATABLE. The gavel gate in villagerTrickAction
      (`mid === 'gavel' && msig.sigG && msig.sigG.trial`) checks no
      fired flag: rec.trickConfess is SET in the fight loop
      (fieldFights.js ~1222) but is never read as a gate anywhere
      in fieldFights.js, so confess can repeat across rounds for as
      long as a trial is active — the same class as spool/nielsen.
      It does not affect this arm (gavel is not a shout-kind
      counter, so it can never trigger the fallback), but any
      future use of a counter list that relies on confess being
      one-shot must gate on a fired flag first. Reported here even
      though it changes nothing in this arm.
- Substrate: tableseat-nowait (LEANLINKRESCUE=1, TABLESEATNOWAIT=1)
  + deathcensus-diag fight recorder (runOne from
  scripts/test-deathcensus-diag-sweep.js, recorder pid 'armed'),
  exactly as morale-a. Seeds 73671–73678, 180d death-aware.
  Control AND armed on identical seeds (armed only if Step 0 passes).
- INSTRUMENT LIMIT (stated before sweeping, not discovered after):
  recorder corpus rows carry NO trick fields (no trickLog,
  no trickShouts — verified against the morale-a corpus: resolve/
  direct rows carry mid/intent/outcome/rounds/mDealt/vTaken only).
  Corpus counting therefore uses the observable proxy below, and
  trick confirmation comes from the census-matched DIAG replay
  (which taps rec.log / rec.trickShouts on-trajectory), never from
  assuming the proxy equals the trick.
- STEP 0 — TARGET EXISTENCE (before any armed sweep):
  (1) Run the control sweep. (2) List ALL belltoad engage-intent
      vDie rows. (3) DIAG-replay every seed capturing belltoad
      fights (census-matched) and confirm trick state for those
      rows. TARGET CLASS, precisely: belltoad, intent engage,
      outcome vDie, rounds >= 2, DIAG-confirmed trickShouts == 2,
      mDealt == 0, AND a "holds the line" log line fired at a round
      end before the death (hold → vDie). KILL CLAUSE: if the
      target class is 0 on the control band, KILL the arm without
      sweeping armed rows. Do not sweep armed rows hoping for a
      target. The brief's expectation (morale-a's control band held
      only ONE belltoad engage death, 73677 d38 liam_davis, r=2,
      dealt 8, NOT a trick death — and zero hold → vDie fights)
      makes a kill the likely outcome; the clause is written
      before the sweep so a kill is a verdict, not a retreat.
  A belltoad engage vDie with trickShouts == 2 but mDealt > 0
  (broad form) is reported separately; it does NOT pass Step 0
  on its own, because the pre-registered target is the 0-dealt
  hold → death class from belltoad-a. If broad > 0 and tight = 0,
  the DIAG transcript for the broad row is quoted and the kill
  stands — the arm's target, as defined, is absent.
- PRIMARY (only if Step 0 finds a target): target-class belltoad
  deaths control → 0.
- GUARDS (vs your own control band; morale-a control reference:
  total villager deaths 200, national-ever 7/8, table/wins 4/8,
  wave-4 6/8, wave-5 0/8): no new belltoad death, no new death
  class, total villager deaths within ±20% of control, spool/
  nielsen timed-setup trick completions do not regress (counted
  on both bands; completion proxy: mid spool/nielsen, rounds >= 4
  and mDealt > 0 — the setup paid off in a strike; stated here
  because the recorder carries no counter fields).
- SENSE: read one belltoad fight transcript before/after (if armed
  rows exist). Quote one line. Two carried narration blanks, to be
  observed but NOT bundled into this arm: the HP-floor flee branch
  logs nothing, and pre-wounded leads below the break line log
  "drove off with the bow" even when arrowless.
- COMPOSITION-PROOF SURVIVAL BASIS (pre-registered, per brief):
  survival is reported as the FULL 8-seed days distribution
  (per-seed days + all-runs median + wins-excluded median), never
  as a wins-excluded median alone — the 0730Z composition artifact
  (a win leaving the pool moved the median more than any death)
  must not be re-used as a leg. Guards above use total deaths /
  reach counts, not a median leg.
- KILL PROTOCOL: if KILLED at Step 0 or at pilot, revert ALL
  game-code changes before committing (measurement-only commit,
  like morale-a's KILLED commit) — in this run no game code is
  written at all before the Step 0 gate, so the commit carries
  script + evidence + corpus only.
- BALANCED PANEL (§15): balance-panel.js cannot ingest per-seed
  recorder corpora — the sweep-compare table + analyzer output in
  this file is the comparison of record, stated here; telemetry-
  check is NOT run on recorder rows (standing 1027Z instruction:
  its counts are wrong on recorder rows).

## VERDICT: KILLED at Step 0 (no target on this band — do NOT merge, do NOT land)

The Step 0 gate fired exactly as pre-registered: the target class is 0
on the control band, so NO armed sweep was run and NO game code was
written. This is the third belltoad candidate to die on absence of
target on seeds 73671–73678, and the cleanest of the three — the
candidate-3 trigger (shout cap reached) never even occurs in the
band's only belltoad engage death.

- Control corpus: evidence/2026-10-25/perseed-sim-belltoad-cand3-b/
  (s<seed>-control.json, 8 files). It reproduces morale-a's control
  band EXACTLY (same per-seed days, same per-seed villager deaths,
  same wall legs — see table), so the kill is measured against a
  stable band, not a moved trajectory.
- Corpus Step 0: belltoad engage-intent vDie rows = 1 (73677 d38
  liam_davis, r=2, dealt 8, taken 79, entry 0.76). Tight proxy
  (rounds >= 2, dealt == 0) = 0. All belltoad rows = 13 (engage 7,
  learn 6).
- DIAG Step 0: all 8 seeds census-MATCH (days, deaths, resolve +
  direct fight keys). DIAG-confirmed TARGET = 0, BROAD = 0. The
  sole belltoad engage death has trickLog = null, trickShouts = 0,
  holds = false (see sense transcript): Liam struck once, never
  shouted, never held, and died in the R2 monster phase before
  the first morale check ever ran. Candidate 3's trigger requires
  trickShouts == 2 AND a morale check; neither happened. A
  post-cap fallback cannot rescue a fighter who never reached
  the cap and never reached a decision point.
- PRIMARY: not applicable — Step 0 killed the arm before PRIMARY
  could be tested. Reported literally as target 0 → (no armed
  rows), not as a PRIMARY miss by adverse effect. No guard is
  violated because no armed band exists; the control band below
  IS the guard reference for any future revisit.
- Spool/nielsen baseline (for a future arm's guards): spool
  setup-completion proxy (rounds >= 4, dealt > 0) = 7 of 8 spool
  fights completed, including both d173 Dale Hoffman fights from
  morale-a (5 rounds, dealt 45 and 19, both vFlee — the timed
  setup paying off, exactly the behavior the definition fixes
  protect). Nielsen fights = 0 on this band, so the nielsen leg
  of the guard is vacuous here and must be re-baselined on any
  band where nielsen actually fights.
- Game code: NONE written, NONE committed (kill protocol). The
  exact fallback rule in the pre-registration stands as a
  specified-but-untested rule for a future band where a
  shout-cap hold → death actually occurs.

What would have to change for candidate 3 to be testable: a band
(and a DIAG pass) showing at least one belltoad engage vDie with
trickShouts == 2, mDealt == 0, and a holds-line before death.
On seeds 73671–73678 that fight does not exist — the same
conclusion morale-a reached for candidate 2, now extended to
candidate 3. The remaining belltoad death class on this band is
the pre-morale 2-round pack kill (both control deaths in morale-a
and this run share it), which no morale or post-cap lever can
reach; it is a separate blank, not this arm (see backlog items).

## Before/after numbers (identical seeds 73671–73678, 180d death-aware)

No armed band exists (KILLED at Step 0). The control band is the
measurement of record; the "armed" column is intentionally empty.

| Metric | Control (this run) | Armed |
|---|---|---|
| TARGET-class belltoad deaths (DIAG-confirmed) | 0 | — (not run) |
| Belltoad engage-intent deaths (corpus) | 1 (73677 d38 liam, r=2, dealt 8, shouts 0, no hold) | — |
| Total villager deaths | 200 (27, 23, 23, 16, 21, 29, 33, 28) | — |
| National-ever | 7/8 | — |
| Table / wins | 4/8 / 4/8 | — |
| Wave-4 / wave-5 | 6/8 / 0/8 | — |
| Days, full 8-seed distribution | [180, 97, 124, 180, 135, 70, 143, 116] | — |
| All-runs median / wins-excluded median | 135 / 180 | — |
| Spool setup completions (proxy) | 7 / 8 fights | — |
| Nielsen fights / completions | 0 / 0 (vacuous) | — |

Control-band cross-check vs morale-a's control reference: total
deaths 200 = 200, national 7/8 = 7/8, table/wins 4/8 = 4/8,
wave-4 6/8 = 6/8, wave-5 0/8 = 0/8, per-seed deaths identical.
The band did not move between 1418Z and this run.

## Reachability verdict

No reachability change (no armed band, no game code). The control
band itself: waves 1–4 reached (6/8 wave-4), wave-5 0/8, national
7/8, table 4/8, wins 4/8 — the scale wall is untouched by this
arm, as expected: candidate 3 is a single-fight lever, and it
fixed no death here because its target fight does not occur.

## Village assessment in plain words

The village on this band is the same village morale-a measured:
seven of eight seeds end in wins or long survival, one seed
(73676, 70 days) burns out early, and the belltoad barely
registers — 13 belltoad fights across eight villages, one death,
and that death is not a trick death at all. Liam walks into a
pack of four toads at three-quarters health, lands one blow,
and is ground down in two rounds before the game ever asks him
whether to hold or run. There is no moment in his fight where a
smarter fallback could have spoken: he never shouted, so there
was no cap to fall back from, and he never survived to a round
end, so there was no decision to change. The village does not
have a belltoad problem on this band anymore — candidate 1's
chorus break already changed what a shout is worth, and the
deaths that remain are the ordinary brutality of a four-toad
pack against one villager, not a trick trap. Filling this blank
would mean fixing the wrong fight.

Villagers acting like people: the one death transcript reads
honestly — a fighter outnumbered four-to-one, hitting back once,
then overwhelmed. Nothing robotic, nothing repeated, nothing to
correct in the narration except the two carried blanks below,
which this arm deliberately did not touch.

## SENSE-TESTING LAW: the sole belltoad death transcript (control, census-matched)

Seed 73677 d38, Liam Davis vs Choir Toad, entry 76 HP, engage
intent, 2 rounds, dealt 8, taken 79, trickLog null, shouts 0:

> "R1: Liam strikes for 8 (37 left)"
> "R1: Lunge hits Liam for 9 (67 left)" … "R1: Resonant Croak hits
> Liam for 13 (54 left)" … "R1: Resonant Croak hits Liam for 11
> (43 left)" … "R1: Lunge hits Liam for 6 (37 left)"
> "R2: Resonant Croak hits Liam for 11 (26 left)" … "R2: Resonant
> Croak hits Liam for 9 (17 left)" … "R2: Lunge hits Liam for 7
> (10 left)" … "R2: Resonant Croak hits Liam for 13 (0 left)"

Judgment: this reads as a person losing a pack fight, not as a
person misusing a trick. No shout line, no hold line, no flee
line — because R2's monster phase kills him before his R2 action
and before the first morale check (round >= 2, end of round).
The engine's silence here is structural (death mid-phase), not
one of the carried narration blanks. Candidate 3 would have had
nothing to say in this fight at any point: no cap, no hold, no
decision. The transcript is the kill's proof, not just its
illustration.

Carried narration blanks (observed, NOT bundled — same two as
the brief): (1) the HP-floor flee branch logs nothing;
(2) pre-wounded leads below the break line log "drove off with
the bow" even when arrowless. Neither occurs in this run's
belltoad death, and neither is touched here.

## Metric review

- Pre-registered metrics bind the run (§14): the Step 0 KILL
  CLAUSE was written before any sweep and is judged literally —
  target class 0 → KILL, no armed sweep. No metric was swapped
  mid-run to manufacture a testable arm: the broad form
  (shouts == 2, dealt > 0) was defined in the pre-registration
  as NOT passing Step 0 on its own, and it is also 0, so the
  kill does not depend on that definitional choice.
- The corpus proxy (dealt == 0) alone would have suggested the
  kill; the DIAG confirmation makes it airtight — the sole death
  is 0-shout, not just non-0-dealt, and no hold fired. A future
  arm must not re-litigate this band's kill on corpus counts
  alone; the DIAG transcript is the evidence.
- Composition-proof survival basis honored: survival is reported
  as the full 8-seed distribution [180, 97, 124, 180, 135, 70,
  143, 116] plus both medians (135 all-runs, 180 wins-excluded).
  No guard in this run rests on a wins-excluded median alone.
- Balanced panel (§15): not run as a panel compare — panel
  cannot ingest per-seed recorder corpora (documented class);
  the sweep-compare table above + analyzer output
  (`node scripts/test-belltoad-cand3.js --step0` /
  `--diag`) is the comparison of record. Telemetry-check was
  NOT run on recorder rows (standing 1027Z instruction).
- Open question for a future belltoad revisit (not answered
  here): is there ANY seed band where a shout-cap hold precedes
  a death? Seeds 73671–73678 have none for any of the three
  candidates' targets. A future arm should first run the Step 0
  DIAG hold-capture on its band and only implement if a
  target-class fight exists — otherwise it will re-prove this
  kill a fourth time.

## Files

- Proof + measurement: scripts/test-belltoad-cand3.js (--sweep
  control, --step0, --diag with DIAGSEED=<seed> for a single-seed
  replay; --diag exits 1 on any census mismatch)
- Evidence: this file (evidence/2026-10-25/sim-belltoad-cand3-b.md)
- Corpus: evidence/2026-10-25/perseed-sim-belltoad-cand3-b/
  (s73671–s73678 control, 8 files; NO armed files — killed at
  Step 0 by design)
- Game code: NONE (KILLED — no src/js file was written at any
  point in this run)
- Sense replay log (working copy, not committed): the 73677
  DIAG transcript quoted above was captured by
  `DIAGSEED=73677 node scripts/test-belltoad-cand3.js --diag`
  (census-matched, days=143)

