# Journey succession r48 — MIXED REGIME + CONVO-WINDOW C1 + MOVER-NAMED E1b + ARMOR INTRADAY MAPS (lane B, 2026-10-26)

Leg 7 (succession). Rotation-b 7 → 4 (endgame next). Seeds 26031–26035
(fresh band), competent policy, mixed regime: 26031–26032 scripted day-5
kills, 26033–26035 mature (EARLY_KILL_DAY=40, organic arena mantles
honored). Instrument only, zero src/js changes. Base master@f402f5609
at run start and at merge (no sibling landed mid-run). Merged locally,
pending ship (no bump/push/live check — ship loop owns those).

Pre-registration: evidence/2026-10-26/journey-succession-r48-prereg.md
(written BEFORE any run; worktree registration delayed ~22 min by the
container .git EPERM flap, cleared 04:18 UTC — see Infrastructure).
Instrument: scripts/journey-succession-r48-20261026.js + analyzer +
proof test, all new files in this commit.

## HEADLINE

The mixed regime delivered what r47 asked for, and the two new instruments
both bit — in opposite directions. The convo-window capture WORKS: on
26034 it caught two real office moves inside driven-convo windows
(29→27, 24→22), exactly the class r47 missed. But C1v2 still misses on
the letter, because the check compares days while the machinery compares
transitions: both missing daily moves sit exactly one day AFTER a
captured convo move, with matching deltas. The instrument is right;
the check's day indexing is off by one. The armor maps narrow the
succession-loss thread to the handoff itself: at every scripted mantle
pass, 1–2 items leave all scanned locations (26032 loses exactly one
bark_armor at the d5 pass — the r47 Pamela class, reproduced and
narrowed to the handoff window). And the run's loudest single line is
a false alarm, proven so: the one MG2 "violation" is a starving
village's safetynet advice beat ("Half rations for three days..."),
not a meal gate — Leah's actual day-30 meal was full. Two of five
villages starved to the end screen (pantry→0), which is the run's real
winnability story: succession never blocks progress, but an empty
pantry ends the village anyway.

## Verdicts (binding, §14 — a miss is NO-GO, never re-scored)

- SCRIPT (young staging): GO — 2/2 day-5 seeds staged the scripted kill
  (26031 d6 Eli→Boris, 26032 d5 Felipe→Lorenzo). Note: 5 phase-A calls
  land the kill on day 5 or 6 (day-part granularity), so the regime is
  "5 phase-A calls", not a fixed kill day.
- MATURE seeds: 26033 organic d18 (Karen→Ruth, arena band pre-empts,
  honored), 26034 organic d12 (Michelle→Greta), 26035 scripted d40
  (Roman→Priya). The arena is the succession engine on mature seeds,
  as r45 found.
- V1 (vouch snapshot): GO with REAL coverage — 26035 PASS-fired
  (eligibleAtDeath=[Zoltan], alive post-death, 1 vouch line). Young
  seeds n/a-none-eligible (expected, same as r47); organic seeds
  organic-n/a. No FAIL-alive-silent anywhere. Died-between still empty
  (rare-branch watch, not a gap).
- C1v2 (call + convo-window attribution): NO-GO on the pre-registered
  same-day letter — 26034 missing [20, 27]. EXPLAINED, not a game bug:
  the convo-window instrument captured moves on days 19 (29→27, −2)
  and 26 (24→22, −2), and the daily transitions recorded on days 20
  (29→27) and 27 (24→22) match them EXACTLY. A daily transition spans
  the previous day's convo window plus the current day's runDays call,
  so a convo move on day N manifests as the daily transition on day
  N+1. Diagnostic transition-window rule (callMove on the entry day OR
  convoWindowMove on the previous entry's day) covers 100% of this
  band. The revision goes to metric review; the verdict stays NO-GO.
- S1 (bearer-own delta, carried): GO — 0 missing bearerDeltaExact,
  0 solo-office calls (the class stays closed from r47), 0 bad solo.
  Single-mover: 26032 has 1 other-mover single (Thabo +15, office +2)
  — sub-threshold bearer drift (+2, under the movers threshold of 3)
  beside a big other-mover, consistent with r47's threshold reading.
- E1b (mover-naming, completeness): GO on completeness (19/19 trust
  moves classified), NO SEPARATION in the hoped direction — diffuse
  moves are 5/5 mover-named (trivially: with 5–7 movers, some name
  always appears), while single-mover calls are often UNNAMED (26032:
  4/4 singles unnamed; 26035: 2/3 singles unnamed). Top-mover named
  only 8/19 overall. The unnamed singles (Thabo +15, Addison +7/+7/+3,
  Priya +3/+3) are trust moves with NO textual trace of the mover in
  the call's lines. The writers are not in the lines; the trap's next
  step is writer-site trapping (r45's named step), not finer line
  classes. E1b is retired as a discriminator (see metric review).
- E1 (old event-vs-deed, continuity): both-dominant again (26032: 10
  both, 2 deed-only; 26035: 3 both, 2 deed-only) — confirms r47.
- A1 (armor accounting): INSTRUMENT GO, THREAD NARROWED, NOT CLOSED.
  All snapshots carry all 10 location keys (dead/corpse/stashed
  coverage live). At every scripted handoff, 1–2 items leave all
  scanned locations: 26031 flannel_shirt + work_gloves, 26035
  flannel_shirt + wool_socks, 26032 bark_armor ×1 (the r47 Pamela
  class, reproduced). The loss window is the handoff itself
  (pre-death → post-handoff), not the following days. Clean transfers
  also observed: 26035 scholarPack bark → corpses (2 total, no loss);
  26032 chain d9 worn bark → corpse (clean). Unexplained GAINS:
  26032 ledger-d+7 bark 1→2 (d9–d12 window, chain successor's worn
  piece — craft/found candidate, no source loss); 26033 d+2→d+3 bark
  4→5 (scholarPack +1 with corpses flat — craft/found candidate).
  Next instrument must record HOLDER identity per piece (counts alone
  cannot say whose piece vanished) and the successor-pack-merge rule.
- M3v2b (social echo, carried): GO on the letter — 4/5 seeds ≥ 2
  (1, 3, 3, 6, 5). The 26031 miss (1) is a dying-village thin echo
  (village ended d30, pantry 0). Bar stands.
- M1 (funeral arc): GO 5/5. M4 (machinery): GO 5/5 mantles clean
  (linOk + moOk).
- MG2 (meal gate): NO-GO on the letter (26033: 1 recorded violation),
  EXPLAINED as an instrument false positive — NOT a game violation.
  The day-30 "Half ration" line is the safetynet hunger advice beat
  ("Half rations for three days, voted and held — or a hard hunt
  now..."), spoken by Farid while the village starved. Leah's actual
  day-30 meal was +1045 kcal with NO half-ration parenthetical
  (proven by a deterministic DUMP_SAY re-run of seed 26033 — same
  trajectory, full say log). The audit's /Half ration/ regex matches
  advice text, and its day attribution mixes the d29 meal (1278 kcal)
  with the d30 advice line. Fix for the next run: match the meal line
  specifically (/Village meal: .*\(Half ration/). The game is NOT in
  violation; the verdict stays NO-GO per §14 and the fix goes to
  metric review.
- M5 (people check): GO — 5 transcripts sense-read in full (below),
  0 real identity failures. 1 wire trip (26032, day 8: "Felipe is
  craving 2 Blackberries" — a notice-board line matching the wire's
  "Felipe…you" pattern, not a misaddressing; plus a minor staleness
  observation: a dead villager's craving still posted 3 days after
  death).
- Chain deaths: 2, both cause-known (26032 Lorenzo→Addison, arena d9;
  26033 Ruth→Leah, arena d25).
- Village deaths: 2/5 villages ENDED (over=true) with pantry 0 — 26031
  (d30, alive 9, pantry 27700→0) and 26033 (d31, alive 4, pantry
  11510→0). The game ended with villagers alive, so the end is a
  collapse, not a die-out — but the driver does not capture the exact
  end-screen cause (instrument gap for the next run: record over
  cause / villageLost at finish()). The other three villages ended
  rich (37802, 27956, 42622).

## Village assessment in plain words

- 26031: Eli dies to a hushwolf on day 6; Boris takes the mantle at
  trust 17 and NEVER moves — office flat 17 for 24 days while the
  village warms 13.6 → 43.4 (Cheryl 25→83, Alfredo 23→75) and then
  starves: pantry 27,700 → 0, game ends day 30 with 9 alive. The
  office-lags / village-warms split at its starkest, ending in
  collapse: a village that steadies socially and dies materially.
  Nobody is miserable on the trust dials; everybody is hungry in the
  bins. Echo thin (1) — a dying village has little to say.
- 26032: Felipe dies day 5; Lorenzo takes over at 19, climbs to 60
  (office 19→60, village 17.1→50.6) — the busy village, 12 trust moves
  — then dies in the arena day 9 and Addison inherits. Two mantles
  in a month, village still warm and fed (37,802). The arena is the
  succession engine here too, and the village absorbs it.
- 26033: Karen dies organically day 18; Ruth inherits at 26, climbs
  to 36, dies in the arena day 25 and Leah inherits at 28 — three
  bearers in a month. The village starves through it: pantry
  11,510 → 0, Farid's relief beat offered day 30 (rations, hunt, or
  rally), game ends day 31 with 4 alive. A village that keeps its
  leadership turning while its food runs out.
- 26034: Michelle dies organically day 12; Greta inherits at 29 and
  drifts 29→22 while the village warms to 69.6 — the split holds
  (office falls, village warms), pantry rich at 27,956, 10 alive.
  The quiet success: nothing broke, nothing much happened, and the
  convo windows quietly moved the office twice (−2, −2).
- 26035: Roman dies day 40 at the height of a mature village; Priya
  inherits at 47 with Zoltan (trust 74) speaking at the grave — the
  only non-vacuous vouch of the run — and climbs 47→70 while the
  village warms to 78.6, pantry 42,622. This is what a
  well-established succession looks like, and it refutes the split
  as a law: a mature bearer CAN climb with her village.

Who leads: the bearer <redacted> every village, but trust is broad by
month's end (2–7 villagers over 60 except the collapsing villages).
Who is miserable: nobody the census can see on trust — the miserable
ones are the hungry ones (26031, 26033), and hunger does not show on
the trust dials. What is missing: a fed village is the precondition
for everything else; the food economy, not succession, gates
winnability on this band.

## People check (sense-reads, SENSE-TESTING LAW)

Read in full: 26033 d+3 Leah (Taking grief — aunt Grace, "laughed like
a screen door in a windstorm", pods humming dream/broadcast; Karen
and Sean named; teaching accepted, Wild Ramps; ends "Thanks for
listening. Most people change the subject."); 26035 d+4 Zoltan (fear
of intentionality — "The randomness would almost be kinder"; invite
accepted eagerly; warm ending); 26034 d+14 Pietro (convo-continuity
opening quoting the d+7 silence beat; a playable quiet-hollow outing
— unlike r47's Blanca blank, this outing PLAYS; middle stalls twice
with "lost my train of thought", a real wart); 26032 d+7 Jorge (grief
continuity, "I dreamed Lorenzo was still here. Woke up angry at the
dream"; the name-right beat, "Nobody says Lorenzo's name right yet";
teaching accepted, American Hazelnut); 26031 d+14 Cheryl (favor-debt
confrontation with real tension — "You're wrong. Too fast. ...
Just... drop it, okay?" — teaching accepted, Groundnut; resolves
"that favor, settled"). No fabricated shared history, no filler
loops. Driver artifacts, not game bugs: the double-invite tell
("Want to come with us?" then "Want to come with me?") in all five
transcripts, same as r44–r47. PASS with Pietro's stall noted.

## Blanks filled or documented

- FILLED (instrument): convo-window capture — 26034 proves the class
  exists and the moves are real (two −2 moves at d+7/d+14 checkpoints).
- FILLED (instrument): mover-naming classifier — 19/19 trust moves
  classified; the classifier itself is the finding (it does not
  discriminate, see E1b).
- FILLED (instrument): armor intraday maps — dead/corpse/stashed
  coverage live; the handoff loss window narrowed to pre→post.
- DOCUMENTED (instrument bug, not game bug): MG2 regex matches
  safetynet advice text — fix: match the meal line only.
- DOCUMENTED (instrument gap): C1v2 day indexing — fix: transition
  window (callMove on entry day OR convoWindowMove on previous
  entry's day).
- DOCUMENTED (instrument gap): armor holder identity — counts cannot
  say whose piece vanished; next instrument records holder per piece
  + the successor-pack-merge rule + dead-vp-access proof.
- DOCUMENTED (instrument gap): over-cause capture — record Game.over
  / villageLost + end narration at finish() for seeds that end over.
- DOCUMENTED (minor content observation): dead villager's craving
  still posted 3 days after death (26032, Felipe d8 board line).
- DOCUMENTED (content wart): Pietro's double "lost my train of
  thought" stall mid-conversation (26034 d+14).
- CARRIED (r47's blank, partly answered): Blanca's unplayable joint-
  foraging outing — not re-tested this run; Pietro's playable
  quiet-hollow outing shows outings CAN play, so the blank narrows
  to Blanca's specific want, not outings in general.

## Telemetry deviation check

`node scripts/telemetry-check.js` vs telemetry-baselines/succession.json
(metrics: deaths.bearer, census.fallen, census.alive,
week2.deadBearerMentions, succession.echoV2b,
succession.callMovesSoloOffice): exactly TWO LOUD lines, both
EXPLAINED, baseline NOT rolled (same call as r46/r47: rolling on a
regime-changed band would launder the regime effect into the
baseline):
- "census.fallen swung 120%: baseline 10 → current 22 (n=5)":
  per-seed fallen 3+2+9+2+6. The 9 (26033, starvation collapse) and 6
  (26035, mature village with phase-A arena deaths) are regime effects
  of the mixed band vs r47's clean young band — not a bug.
- "succession.echoV2b newly appeared: baseline 0 → current 18 (n=5)":
  baseline predates the echoV2b key (added r46); current total 18 =
  1+3+3+6+5, exactly the analyzer's M3v2b sum.

## Regression

`node scripts/check.js --only succession --cacheDirectory=/tmp/jest-cache-playtest2`:
11 passed, 0 failed in 106s (same as r47; slowest: succession-seed-
inherit 37s, succession-grief 35s). One attempt was interrupted by a
service restart mid-run with no partial state left (no jest process,
no cache dir); the re-run above is the recorded result.

## Metric review (for the NEXT run, never re-scored here)

- C1v2: revise the coverage rule to the transition window — a daily
  transition (prevEntry → entry) is covered by a callMove on the
  entry's day OR a convoWindowMove on the previous entry's day. Until
  then, a same-day miss with a convo-day-minus-one explanation is an
  instrument gap, reported as a miss.
- MG2: revise halfVoice to match the meal line only
  (/Village meal: .*\(Half ration/) and attribute the meal to its say
  day. The 26033 "violation" is the proof case for the revision.
- E1b: RETIRED as a discriminator. Diffuse moves are trivially named
  (many movers ⇒ some name appears); singles are often unnamed. The
  trap's next step is writer-site trapping: which deed/event sites
  move trust, measured at the mutation, not the line.
- M3v2b: bar stands (4/5 this run; the 26031 miss is a dying-village
  effect, not an echo failure).
- A1: add holder identity per piece, the successor-pack-merge rule,
  and a dead-vp-access proof (does vpOf return the just-died bearer's
  record at post-handoff?). Carry the 1–2-item handoff loss as the
  open thread, window narrowed to the handoff.
- V1: keep the mixed regime — mature seeds are what make V1
  non-vacuous (26035's Zoltan is the proof).
- Died-between: still empty; keep as a rare-branch watch.
- Over-cause: record Game.over / villageLost + end narration at
  finish() for every seed that ends over=true.
- Next for succession (r49): mixed regime again; C1v2 transition
  rule; MG2 meal-line regex; armor holder identity + pack-merge rule;
  over-cause capture; a writer-site trapping spike if the trust-move
  trap is to move.

## Infrastructure

- .git EPERM flap (same class as 2026-10-23): 7 failed
  worktree-register attempts, 03:56–04:18 UTC (~22 min), each failing
  "couldn't write .../refs/heads/journey2-succession.lock" with
  write(2) EPERM confirmed by direct probes (open() succeeds, write()
  fails). NO manual ref surgery, no force: waited, retried, the flap
  cleared on its own. My own probe residue (flap-probe.tmp, 0 bytes,
  created when open() succeeded but write() failed) was removed; the
  Oct-24 __flaptest__.lock belongs to another agent and was left
  alone. No sibling landed during the flap window (master stayed
  f402f5609).
- Heartbeat loop kept journey2-succession fresh throughout; heartbeat
  verified landed after loop start (04:19:31 UTC) per the 2026-10-25
  lesson (never trust a silenced loop — this loop logs to the goal
  hidden_files heartbeat log, not /dev/null).
- Proof test RED/GREEN first try (19/19 checks incl. the new
  tele==array checks; proof-seed 24999 tele + transcripts deleted
  after GREEN, both r48 and r47 RED-run scratch).
- Diagnostic re-run: seed 26033 re-run with DUMP_SAY reproduced the
  trajectory (same death/chain/pantry shape) and proved the MG2
  false positive from the full say log. Say dump kept in goal
  hidden_files during the run, then deleted after the finding was
  recorded (the run note carries the verdict).
- Safe-commit index clobber: STRUCK on the 55-file commit (all files
  shown staged-as-deleted after commit 03287cc33, worktree files
  byte-identical to HEAD). Repaired per the standing lesson
  (update-index --add --cacheinfo from HEAD blobs), verified clean
  (status 0 lines, diff HEAD empty, commit intact: 55 files, 18984
  insertions).
- Sibling landings mid-run: lane A journey-scale r37 landed (3fbeacddf)
  while this run worked, so the branch was rebased onto it (commit
  361368a7c), proof re-run GREEN, then a second sibling landing
  (sim-stafffallback-b 908ad0f12) moved master again before the merge
  — the ff-only merge correctly refused ("Not possible to
  fast-forward"). SEQUENCING ERROR by this run (recorded honestly):
  the merge command had chained worktree-release + worktree remove
  after the unchecked merge, so the tree was released-as-merged and
  removed while the branch was still unmerged. No work was lost (the
  commit is the protection; branch -d correctly refused). Recovery:
  registry entry cleaned, worktree re-registered onto the existing
  branch (the register script's attach-to-existing-branch fallback),
  run note amended with this paragraph, rebase onto 908ad0f12, proof
  re-run GREEN, then a VERIFIED merge (release runs only after the
  merge result is checked — never chained blind again).
- No bump/push/live check (ship loop owns those). Lock deleted;
  rotation-b written 7 → 4.

## Reachable / fun / winnable (leg verdict)

- REACHABLE: yes — the succession machinery holds across scripted,
  organic, and chain mantles, and V1 now has non-vacuous coverage.
- FUN: yes, with a wart — the social texture is the run's strength
  (grief continuity, favor debts, name-right beats, playable outings),
  and the mid-convo stalling (Pietro) is the main drag.
- WINNABLE: the mantle never blocks progress, but 2/5 villages ended
  on empty pantries — on this band, winnability is gated by the food
  economy, not by succession. A player who keeps the village fed
  reaches everything; a player who doesn't watches the end screen.
