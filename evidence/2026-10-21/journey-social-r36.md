# Journey social r36 — THE JUSTICE ARC (lane B, 2026-10-21)

**Run id:** oversight-playtest-loop-2, 2026-10-21 ~07:00Z. Worktree: `journey2-social`.
**Rotation:** read 5 (social life); advancing to 6 at closeout.

## PRE-REGISTRATION (MEASUREMENT.md §§9–12, 14 — written before the pilot ran)

**Context.** r32/r33 built the theft-driver baseline (social.json telemetry).
r33 measured the rivalry engine (tension decay −1/d beats simmer 5:1 —
rivalries can never escalate; no tuning, Steve's call). r34 asked
bidirectionality; r35 asked the bond engine (forged, not granted — the
lingering meal is the forge). NO run has asked the dedicated question: does
the JUSTICE ARC fire end-to-end under crime pressure — theft → detection →
case → moot → verdict → sentence → aftermath — and does it read sensibly,
including for the misjudged? Steve's moot ruling (2026-10-16): "villagers
can be victims or falsely accused, so justice covers the wronged and the
misjudged, not just the guilty." The false-accusation machinery exists
(`fabricated` flag, betrayal.js:4456-4465 — enemy with motive ≥60
weaponizes the moot when trust <25). This run measures whether it fires and
whether the moot clears the innocent.

**Leg question: THE JUSTICE ARC.** Under the larceny-leaning policy
(competent survival + scheduled theft + cold neighbor), full 140d runs:

1. Does the chain fire: theft → detection → case → moot → verdict → sentence?
   Where does it break (cases that never open, moots that never convene,
   trials that fizzle)?
2. Are verdicts and sentences proportional and legible (belief, charge
   severity, weregild/exile ladder)?
3. Aftermath: does the village move on (trust trajectory post-sentence, bonds
   continue, gossip settles)?
4. Do the people in it act like people: confronts with real grievances,
   accusers who want something, fair-seeming moots?
5. FALSE-ACCUSATION PROBE (informational): does a fabricated case ever fire
   under the larceny driver, and does the moot clear the innocent?

**Interesting-finding bar:** a moot that reads unfair; an exile with no
follow-through; a confrontation that names a grievance the player didn't
cause; theft cases that never fire despite detected thefts; a fabricated
case that fires (either direction — cleared or rail-roaded); sentences that
read disproportionate.

**Binding metrics (a miss is NO-GO, never re-scored mid-run):**
- M1 (instrument): daily arc snapshots complete on 4/4 runs (no gaps >2d);
  ≥3/4 runs have ≥1 detected theft AND ≥1 case opened.
- M2 (chain fires): ≥1 player-theft case reaches a verdict (any resolution
  path: convicted/acquitted/advisory) on ≥3/4 runs.
- M3 (people): ≥3/4 sense-reads (1 moot transcript + 2 confront convos) meet
  the conversation quality bar; 0 fabricated-history flags.
- M4 (guardrail): ≥3/4 runs end with ≥5 alive and the village not scattered.
- F1 (false-accusation probe, informational): report whether a fabricated
  case fired and its outcome. Not a binding metric — a probe.
- L3 (telemetry): the theft-driver baseline (social.json) SHOULD bind this
  run (same policy family as r32/r33). Report LOUD lines, investigate, do
  not roll without a verdict.
- L2' (standing, r26 rev #2): ANY verbatim content-line ('beat' kind) repeat
  within ONE conversation = finding.

**Seeds:** 3304–3307 (fresh; r33 used 3104–3107, r34 3200–3203, r35 3204–3207).
**Horizon:** DAYCAP=140, death-aware (+10d tail after the village dies/scatters).
**Policy:** 'larceny-leaning' (competent base; steals when hungry or on
day%5===0; never comforts, never donates). Arc layer: 1 conversation/day
from day 3 (deep, gossip forcing GOSSIP_TARGET=2, prioritizing
accuser/victim then grievance-holders; hostile every 4th day), deliberate
broken promise (accept first favor offered via dlg:commit, never fulfill),
moot duty (convene on open cases; vote HONEST: guilty on self-accused cases
where the player did it, acquit where fabricated, with-the-room on NPC-NPC
cases). No tuning of game code planned; measurement run. A bug-class blank
found by the instrument gets a proof test and a fix; otherwise evidence only.

**Method note:** the pilot is 2 full 140d seeds (3304, 3305) — moots take
days (mootIn 2–3 + trial), so the chain can't be judged on a short pilot.
Expand to 4 seeds if M1 goes on the pilot.

## RESULTS (all 4 seeds complete: 3304–3307, DAYCAP=140)

### Binding metrics
- **M1 (instrument): GO.** 140/140/140/140 daily arc snapshots, no gaps. 4/4 runs
  had detected thefts (theftLog non-empty every seed) and cases opened
  (25/25/26/27 cases).
- **M2 (chain fires): GO 4/4.** Player-theft cases reaching verdict:
  24 (3304), 25 (3305), 23 (3306), 27 (3307). Verdict ladder exercised end to
  end: weregild / acquitted / exile / schism / cold_war / advisory_acquit.
  Exiles enforced with follow-through narration (pantry closed, "be off
  Haven's ground by dawn").
- **M3 (people): GO.** Sense-reads: 3304 (2 confront convos, 3 moot transcripts,
  gossip convo, late deep — all met the bar, 0 fabricated-history flags);
  3305 case_3 exile moot (9–0, fair-seeming, sentence with follow-through).
  Confronts carry real grievances ("You let go. Whatever you were reaching for
  stays where it was."); moots read fair; gratitude spoken for kept favors;
  gossip surfaces ("People are saying things. About you."). 0 fabricated-history
  flags across all reads.
- **M4 (guardrail): GO 4/4.** Runs ended 8/11/9/7 alive (days 134/118/134/108),
  all ≥5, villages not scattered.
- **F1 (false-accusation probe, informational):** 0 fabricated cases fired on
  any seed. The `fabricated` machinery (betrayal.js enemy-with-motive path)
  never triggered under the larceny driver — the moot never had an innocent to
  clear. Steve's 2026-10-16 moot ruling ("justice covers the wronged and the
  misjudged") remains unmeasured in live fire; the machinery exists but this
  policy didn't produce the trigger conditions (enemy motive ≥60 + trust <25
  + weaponized moot). A dedicated probe policy (manufactured feud) would be
  needed to test it — recommended for a future run, not this one.
- **L3 (telemetry):** 4 LOUD lines, all investigated, all EXPLAINED (see below).
  Baseline NOT rolled — deviations are leg-design-driven, not bugs.
- **L2' (standing):** hits 5/3/6/1 — all the r35-tolerated escalation pattern
  ("I've told you three times now — …" via dlg:favor_requirements, served
  twice, then convoSpendChoice; verified in s3306-l2prime-1-Skylar.txt:
  raw → 3 rotating reframes → escalation ×2 → choice leaves menu). Working as
  r35 designed; higher volume from confront-priority targeting, not a new blank.

### Telemetry LOUD lines — verdicts
- `l3.betrayalCases` 53→103, `l3.mootsConvened` 53→102: EXPLAINED. The r32/r33
  baseline is the theft-driver without moot duty; this run's arc layer
  deliberately maximizes crime (larceny-leaning + scheduled theft) AND convenes
  a moot on every open case. 2× case/moot volume is the leg working as designed.
- `l3.deepBonds` 70→116 (sum; per-run ~29 vs baseline ~70/run): EXPLAINED.
  The larceny policy (cold, thieving, never comforts, never donates) produces
  fewer deep bonds than r35's bond-forging policy — a thief doesn't get deep
  bonds. Policy-driven, not a bug.
- `l2prime.count` 5→15: EXPLAINED (see L2' above). Volume-sensitive metric;
  the pattern is unchanged and tolerated.
- **Decision:** do NOT roll the baseline. The baseline remains the r32/r33
  theft-driver reference; this run is a different policy family (justice-arc).

### MAJOR BLANK → FIXED: uprising softlock (justice ladder stage 4)
- **Symptom:** seed 3305 froze the sim day clock 3× (days 100, 105, 118 —
  8–9 loop-days each; freeze dumps in evidence/2026-10-21/freeze-s3305-d*.txt).
  Each freeze: `tbfight=true`, no HP/position change for 10 driveFights rounds,
  `sleep()` refused mid-fight.
- **Root cause (game bug, not harness):** `startVillageUprising` (justice.js)
  and `startBetrayalCombat` (party.js) end with a bare `this.tbBeginTurn()`
  and never drive the opening turns. `startCombat` has the explicit kick
  ("if a monster is faster than you it opens — run AI turns until it's your
  turn. Without this the fight soft-locks on 'Not your turn' forever").
  When a hostile outspeeds the player, the fight sits on the first hostile's
  turn with no driver: in sims the day freezes; on the phone the player would
  sit on the "FIGHT, FLEE, or TALK?" prompt with no turn to take.
- **Fix:** mirrored startCombat's opening-turn kick in both starters
  (turnIdx=-1, tbBeginTurn, drive AI turns until player turn — async in
  browser, sync in node). Proof test
  `scripts/test-social-r36-uprising-openturn-20261021.js`: RED before
  (tbIsPlayerTurn()=false on hostile-first seed 1), GREEN after (5/5).
- **Regressions:** test-justice.js 61/61, test-justiceladder-20261020.js 24/24,
  test-moot-double-exile-20261015.js 5/5. Two old tests
  (test-brawler-defied-exile-uprising-20261007.js, test-betrayal.js) fail
  identically WITH and WITHOUT the fix — pre-existing stale-harness
  (short module list, missing S.equipment/seTickFighter), off the green list,
  not a regression. check.js --quick hung (7+ min, same as r35) — killed,
  targeted suites run instead.

### Other findings
- **Exile→succession arc (3304 pre-fix run):** Atlas exiled day 12 for theft →
  died day 13 → mantle→Giovanni (died day 21) → mantle→Florence. Murder trial
  of the successor + Yara + Mara for the exiled leader's death → acquitted 5–1
  ("an accusation leaves a mark no verdict washes off"). The succession
  machinery and the moot's handling of the exiled-leader's death both fired
  legibly. (Re-run 3304 diverged after the promise-stash fix changed RNG
  consumption; transcripts overwritten — findings recorded from pre-overwrite
  reads.)
- **Broken promise:** the stash/unstash trick worked (keepPromises no longer
  saves the marked promise; the deadline breaks it naturally). Favor final
  state reads "?" in arc summaries — instrumentation gap in the driver's
  favor-state lookup (arcSnap favors don't carry the accepted favor's id),
  not a game finding.
- **Moot transcript extraction mixes adjacent cases** (3305 case_3 file
  contains beats from a same-day player case — the extractor grabs
  moot-keyword lines ±4 context across days 9–18). Instrumentation caveat;
  the beats themselves are coherent.

### Reachable / fun / winnable (social leg)
- **Reachable:** yes — the full chain fires under ordinary crime pressure;
  no debug scaffolding needed beyond the policy driver.
- **Fun:** yes — the moots read as theater (unanimous counts, heavy
  sentences, follow-through), confronts have teeth, the exile→succession→
  murder-trial cascade is the kind of emergent story the game wants.
- **Winnable:** yes — 4/4 villages survived to the horizon with ≥7 alive;
  justice punishments (weregild/exile) hurt but don't end runs.
- **Village assessment in plain words:** four villages of thieves and
  accusers. 3304 exiled its thief-leader and tried his successors for his
  murder. 3305 rose up three times and had to be put down by the letter of
  the fix. 3306 argued its way to 22 acquittals — a village that would
  rather forgive than punish. 3307 paid weregild five times and exiled twice.
  Every village moved on: trust trajectories recover post-sentence
  (3304: d30 51 → d100 92), bonds continue, gossip settles. The people act
  like people — they count on their fingers, they don't meet your eyes, they
  remember.

### Metric review (§14)
- M1–M4 all GO; no metric proved wrong. One revision proposed for the NEXT
  run: F1's trigger conditions (enemy motive ≥60 + trust <25 + weaponized
  moot) never occur under crime-pressure policies — a false-accusation probe
  needs a manufactured-feud policy, not a larceny driver. L2' count is
  volume-sensitive under confront-heavy policies; consider per-conversation
  normalization next run.
