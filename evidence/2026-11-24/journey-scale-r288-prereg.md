# journey-scale r288 — PRE-REGISTER (lane A, leg 3 SCALE, playtest leg — no lever)

**Run id:** `playtest-20261125T0045Z` (lock run_id).
**Run:** scheduled Tue 2026-11-24 18:45 CST (2026-11-25 00:45Z).
**Rotation read 3 → leg 3 SCALE.** Rotation 3→0 written at closeout
with read-back (next run gets leg 0 landing).
**Base:** local master `d1d61f517` at registration.
**Pre-flight:** main tree clean (0 dirty), disk 53%. `git pull` —
already up to date. No lock existed; lock created 00:44:14Z (run_id
above) before any work. `worktree-reap.sh` ran; SKIP (registry lock
held by the concurrent scheduled reaper run) — no cleanup this run.
**Registration (LOUD — three failed attempts before success):**
(1) first `worktree-register.sh` ran 00:47–00:52Z under a 300s exec
timeout; the checkout was still running when the timeout killed the
script — the orphaned `git worktree add` exited and removed the
partial tree, but the branch `journey-scale` survived; no registry
entry was written. (2) a detached setsid/nohup retry launched ~00:53Z
died silently with a 0-byte log — the exec session teardown kills
setsid children (AGENTS.md GATE-KILL lesson); do NOT relaunch
detached registrations that way. (3) flap window 41 (opened
00:57:39Z, window 40 having closed 00:41:32Z) refused fresh-file
writes 00:57–01:06Z; two consecutive probe OKs at 01:06:41Z/01:06:53Z,
then registration re-run as a tracked background exec — FAILED on
cap (16/16; sim-leadworst-a took the last slot at 01:06:41Z). Reaper
ran: 0 removed, all 9 stale-heartbeat trees dirty (LOUD, owners must
commit/release). Waited for a slot: 15/16 at 01:16:56Z. (4) re-ran
register.sh — FAILED again: the branch from attempt (1) still
existed and the script's attach fallback failed on the already-taken
path state. Recovery: manual `git worktree add
~/workspace/worktrees/journey-scale journey-scale` (exit 0, 112831
files, HEAD d1d61f517, tree verified clean) + direct registry write
under `flock -w 300` in the register.sh entry format (same checks:
cap, slug-absent, atomic write) at 01:25:50Z. Heartbeat loop runs as
a tracked background exec (9-min ticks), not detached nohup.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, nor
gate change in this run. **Perception law (2026-10-28) stands.**
**Combat-play gate (Steve 2026-11-10 17:52 CST):** no toughness/gear/ability
tuning in this run. The muster + march steps are POLICY (the competent
player drives existing game verbs), zero `src/js` change unless the
one blank this run fills needs it — and then only that blank's fix.
**TEST WITH ENCOUNTER GEAR (Steve 2026-11-13):** the policy fights with
the party and gear the competent player has by the leg — the muster/march
steps are that policy, not a fresh-solo fixture.
**DELIVER OVER MEASURE (2026-11-01) + ROOT-CAUSE FIRST (2026-10-16):**
this is a PLAYTEST leg, not a lever round. This run plays the leg on
current master and judges reachable/fun/winnable.
**Time-box (stated up front):** soft stop ~03:45Z (3h from run start).
Single arm: 8 fresh seeds × 140d; each sim ~2.5 min. The `--quick`
gate runs right after the build commit.

## Standing context (read before scoring)

- **r283 scale (landed 2026-11-24, tip 8616c6b2f):** QUIET — national
  2/8 (r279: 0/8), lesser priced 7/8, full seat 0/8, wave-4 fights 76
  / kills 14, wave-5 faced 1/8 binding (2/8 by the fuller W5-INSTANCE
  count), killed 0/8, survival 7/8. **Both national seeds reached
  GLOBAL** (106328 national d82, global voiced; 106334 national d97,
  global voiced) — first national on a scale band since r273's 1/8,
  first global on a scale band in the r-series. Both through the
  trade road (tradeSeasoned3of3=2/8, nationalViaTrade=2/2). Wall:
  veteran bank (max 2 living on 2/8; the global village stalls 78d
  at readiness-4 with one living veteran) + link formation (three
  seeds one seasoned link short, two too late). **Muster MOVED:**
  called 6, fought 3, slain 3. Stand-down VACUOUS fourth straight
  band. **Departname GO** (169 depart beats, 0 descriptors; second
  straight clean band). WINPLAN: 169 departures, trios=0, quads=0 —
  ninth run running. **Holdspeak GO** (first scale-window read: 13
  hold lines, all naming the holder by true name with the real
  reason). People check PASS with the carried flat spot worse:
  orphaned invite lines 5/19 talks (was 1/15 in r279). Probe 106336
  (unscored): national d127 + global d134, then LOST both — first
  wild sighting of a national/global village falling back to
  regional (live-state rule working as designed). Guns: 2 searcasters
  in 8 villages (descriptive). Gate 339/5, 0 attributable. Telemetry:
  1 LOUD line (maxGameDay, r251-regime artifact); baseline NOT rolled.
- **r286 deepening (landed 2026-11-24, adopted):** wave-5 unlocked
  1/8 (109301, faced-not-killed, first unlock since r275); wave-4 29
  fights / 6 kills; 4 seeds moved vs r282, attributed jointly to the
  base delta via bisect; trio party still never departs via plan (9th
  run); villages survive but don't win. Gate 332/12 adjudicated, 0
  attributable.
- **r285 establishment (landed 2026-11-24):** MPR1 check; gate GO.
- **r284 landing (landed 2026-11-24):** contest-death ledger firing live.
- **r279 scale (landed 2026-11-24):** QUIET — national 0/8, lesser
  8/8, full 0/8, wave-4 fights 99 / kills 25, wave-5 faced 2/8,
  killed 1/8, survival 5/8, lived-days mean 130.6 (control 123,
  +6.2%, HOLD). Blocker taxonomy: COLLAPSE 3, FORMATION-FEW 3,
  FORMATION-LATE 2. Muster called 6, fought 5, slain 5. Stand-down
  VACUOUS third straight band. Departname GO (161 depart beats, 0
  descriptors). WINPLAN: 161 departures, trios=0, quads=0 — eighth
  run running. Tribute DELIVERED 1/8; tribute-delivery stall fired
  again. People check PASS; orphaned invite line 1/15 talks.

## Base delta vs r283's base `ef0872bfc` (src/js, 10 files, +193/−46)

Live behavior changes (from `git log ef0872bfc..d1d61f517 -- src/js`):
- `convo-dialogue.js` +34, `convo-mood.js` +2, `convo-wants.js` +6,
  `villager-agency.js` +24 — **journey-social-life r283: variety
  pools 4→8 + heed-dry fix** [needs-eyes]. LIVE: sitting variety
  pools doubled (F6 0, M4 25→9, F5W 1; NO-GO on TRAIL/M12). Q4
  watch: do sittings draw wider variety (fewer repeats), and does
  the orphaned-invite-line rate move (r283: 5/19)?
- `conversation.js` +31, `convoTopics.js` +74 — **succession r280:
  drift-note stage directions bypass the repeat ledger; mourning
  second sittings steer from the first shape.** Q4 watch: do
  drift-note / mourning sittings read without stuck repeats?
- `game.js` +14, `journal.js` +6 — **sim-calledname-a fix: drift
  lines + journal speak the use-name (npcName) when one exists**
  [needs-eyes]. Q4 watch: a drift line / journal entry naming a
  villager with a use-name must use it, not the birth name.
- `villager-brain.js` +46 — **sim-holdrepeat-fix-a: day-count-varied
  hold wording fixes stuck-record repeat (#2744)** [needs-eyes].
  LIVE: holdVoice now varies wording by consecutive-hold-day band
  (day 1 fresh verbatim; days 2–3 'another day gone'; days 4–6 'the
  wait wearing thin'; day 7+ 'so many days now'); reason token
  identical; '— the party waits.' close kept. Wording only; hold
  decisions byte-identical (proof-test C1/C2). Re-measured 24-seed
  replay: worst holder 31x→12x, worst consecutive run 13→7 days.
  Q4/Q2 watch: held-departure lines must still speak the real reason
  (holdspeak GO read, r283) AND vary by day band — a generic or
  frozen hold line is a recurrence to note.
- `build.js` +2 — version churn only.
- No src/js in the sim-scale-onramp-round-1215 / sim-winnability /
  lever deltas — instrument, corpora, panel, evidence only. No other
  live game change in base.

## Seed-band freshness

- **Band: FRESH 106337–106344. Probe seed: 106345 (fresh, reserved;
  run as an unscored extra only if time allows — the scale analyzer
  scores the 8 panel seeds).**
- Searched (read-only): repo `evidence/**/*.md`, `docs/`,
  `scripts/**/*.js`, goal `hidden_files/**/*.md` + perseed corpus
  filenames, plus the 5 files naming forbidden/contaminated bands
  (`evidence/2026-10-25/sim-preserveact-b.md`,
  `evidence/2026-10-28/sim-shoutgate-a-prereg.md`,
  `evidence/2026-11-01/sim-fullseat-recheck-a-prereg.md`,
  `evidence/2026-11-01/sim-scale-onramp-round-0615.md`,
  `evidence/2026-11-01/sim-trajband-a-prereg.md`) — **0 hits** for
  any of 106337–106345 in every scope.
- **Collision record (do not reuse):** 103801–103808 and 103811–103818
  reserved (r242); 103821–103828 and 103831–103838 spent (r239);
  103841–103848 spent (r242); 103851–103858 spent (r243); 103861–
  103868 spent (r244); 103871–103878 spent (r245); 103881–103888 spent
  (r246); 103891–103898 spent (r247); 103901–103908 spent
  (launchparty band, Nov 18); 103911–103918 spent (r248); 103921–
  103928 spent (r249); 106001–106008 spent (sim-rage-setup-a pilot,
  Nov 18); 106259–106267 spent (r250); 106268–106276 spent (r251);
  106277–106285 spent (r273); 106301–106308 SPENT by
  sim-reseedexpiry-b (Nov 20 prereg); 106310–106318 SPENT by r276;
  106319–106327 SPENT by r279 (panel 106319–106326 + probe 106327);
  **106328–106336 SPENT by r283** (panel 106328–106335 + probe
  106336); 106337–106345 is the next clean 9-block (panel
  106337–106344 + probe 106345).

## Pre-registered questions

- **Q1 — THE PLAYTEST QUESTION (decides the leg verdict).** Can a
  competent village reach national standing / the table approach in
  days 80–140 on current master, and what blocks it? Single arm: the
  r244–r251 control policy verbatim (below), 8 fresh seeds 106337–
  106344, DAYCAP 140.
  Binding metrics (§14): national reached /8, table offered (lesser
  seat priced) /8, full seat /8, wave-4 kills (killAttr w4total),
  wave-5 faced (seeds with fightsByWave['5'] > 0), standing-199 stall
  (**phantomDays5** — days the readiness gate holds the village at
  the t5−1 cap; the stall finding rests on this measure ONLY, judged
  on the per-day split — stalled-while-ready vs stalled-while-not-ready),
  survival to 140d.
  **Interesting iff** ≥3/8 national, OR a new blocker class (outside
  the r283-observed set {COLLAPSE, FORMATION-FEW, FORMATION-LATE}
  plus the carried set {TRUST-LOW, NATIONAL, SNAP, RUNG,
  RUNG-HORIZON}), OR a taxonomy miss (UNKNOWN), OR a fixable defect
  in the table-approach path. Else QUIET — the wall stands as
  measured and the finding is the blocker taxonomy.
  RUNG was first observed in r251 (where it fired INTERESTING as a new
  class); RUNG-HORIZON is the named r251 horizon artifact (106273) —
  a rung completed on the final recorded day, whose national flip had
  no day to land on. Neither fires INTERESTING again by itself.
- **Q2 — BLOCKER TAXONOMY (measurement, NOT a gate) + wave-5/party
  sizes (descriptive) + THE STAND-DOWN MEASUREMENT:** per seed, the
  blocker class for the 3rd seasoned link on the closest road
  (FORMATION-LATE / TRUST-LOW / SNAP / COLLAPSE / FORMATION-FEW /
  NATIONAL / RUNG / RUNG-HORIZON / UNKNOWN), from the analyzer's
  carried section. Wave-5 in the scale window: faced/killed per seed,
  party sizes on wave-5 fights; **win-plan departure sizes (pairs vs
  trios vs quads vs 5+) from the winPlanEnd snapshot** — does the
  tenth run running produce a trio (r283: 169 departures, 0 trios)?
  **Stand-down band-wide (descriptive, the fix is already proven —
  this asks whether it HOLDS):** muster-hunger events per national
  seed vs r273's unfixed 251 on its one national seed; national days
  held per national seed (r273 unfixed: 45, lapsed d115); any national
  lost to a fruitless march (stand-downs fired / re-call cooldowns
  held / fruitless march days per seed). **Departname watch (bar 0):**
  the analyzer counts stranger descriptors in depart beats across
  the panel band (r283: 0/169). **Departteach is NOT watched:** the
  teach is a post-System no-op (see r283 prereg correction), so no
  teach count is printed on this driver. The re-arm and CELLGATE
  watches are NOT added: both mechanisms are env-gated off on this
  driver (see r279 prereg correction), so their panel counts would be
  0 by construction.
- **Q3 — REGRESSION GUARDS (fail the run):** r134 spoken-raise (0
  not-offered-spoken, ≥1 properly answered), vetbar 0 disagreements,
  trap-line 0 defect sittings, betrayal-sibling 0 defects, nod-loop 0
  breaches, lived-days per-seed mean within ±25% of the control **123**
  (r233's 8-seed mean), lesser seat priced ≥4/8. March-flee watch:
  march fights fled at full HP counted; the wave-4 fight slide watch
  (231 → 168 → 101 → 62 → 82 → 85 → 52 → 47 → 99 → **76** across
  r246–r283): r283 stayed above the 60 line; **if this band is also
  <60 WITH no early collapses, the next run asks whether
  spawn/engagement changed on master**. Coalition-reach (9-blade shape)
  reported descriptively. DOWNEDTWICE watch (no recurrence in
  r273/r276/r279/r283 — keep watching). GONE-BEARER watch (r272 fix —
  a dead bearer's joint run urged as finishable in a scale transcript
  is a recurrence). TABLE-DRY watch (r268 fix — a dry table beat in a
  scale transcript is a recurrence).
- **Q4 — PEOPLE CHECK:** read 2–3 full transcripts from convo days
  90/110/130 in full, PLUS the nonverbal sittings AND all raise talks.
  Judge sense, not counts. Quote one specific transcript moment in the
  run note. Watch: closing-line duplication (count 6 so far — count
  up), tell-me-more echo, searcaster-volley narration, departbeat
  (now with TRUE NAMES — the departname fix's third scale-window
  read), warn_you heed (r277 latch reset: does a FRESH sitting's
  first heed warn again?). **Holdspeak watch (second read):** held-
  departure lines must speak the real reason AND vary by consecutive-
  hold-day band (the live holdrepeat-a behavior) — a generic or frozen
  hold line is a recurrence to note. **Menu-priority watch:** a
  favor-cancel sitting must show the cancel first (the live r280
  behavior). **Variety watch (NEW — social r283 live):** do sittings
  draw wider variety (fewer repeated lines across days)? **Calledname
  watch (NEW):** drift lines / journal entries must use the use-name
  when one exists. Carried items: orphaned invite LINES in raise
  talks (r283: 5 lines / 19 talks — the run's one open dialogue
  blank), 90% modal raise opener, NV 3-nod flat spot. NEW: debt-label
  anchor — a repay sitting labeled 'that debt' must anchor on the
  ledger favor (a closer declaring a broken favor settled is a
  recurrence of the r274 wild case).
- **Q5 — CENSUS + spotter d90 + W5-INSTANCE.** Carried: w4
  fights/kills, banked veterans (2+), w5 unlocked/faced/killed,
  tribute states, survival. The wave-5 door question: did any village
  FACE the door (not just fight roaming wave-5 beasts)? **Worngun-
  reseat descriptive:** village gun totals at panel end (r283: 2).
  **Contest-end telemetry watch:** no r155-duel-defect recurrence
  (contest_end emitted, ledger closes).
- **Q6 — DIALOGUE WATCH (carried):** the r250-recorded flat spots —
  the NV 3-nod cycle (My ×3; Somchai/Tariq walk-then-nod), the "come
  see what I found" payoff shrug (orphaned), orphaned invite lines in
  raise talks, the r239 "tell me more" echo, closing-line duplication
  count 6. A dialogue-content fix belongs to this run only if it is a
  blank this run finds.

## Policy (frozen)

CONTROL (single arm): `scalecourt-traderoad-r113-linkraise-sit` + muster
ON + march ON (r244–r251 control verbatim) + `MUSTER_HOLD=sitting` +
`STAGE_CAPSTONE=off` + ANSWERMAIL off. Sortie INERT. SIT false.
`COMPETENT_ROUTE_AROUND=1` for the march walk only, restored after.
**The r273 fruitless-march stand-down is IN the driver (7 fruitless
march days → stand down + 30-day re-call cooldown) — it is the r273
blank fix being measured band-wide, not a new lever.** No gate,
threshold, price, or bar changed — the march is policy, the competent
player driving existing game verbs.
DAYCAP=140, death-aware stop (+10d tail max). Seeds FRESH 106337–106344.
Pilot: seeds 106337–106339 first. Pilot gates: driver clean, no census
errors > 0, census rows present, reconciliation residual 0, teleOnly 0,
trustset rows by d60, national-gate rows present, vetbar rows by d60 —
else STOP and diagnose (INCOMPLETE, not a verdict). **Pilot gate
addition (r279, from the r276 deviation): the pilot's muster JSON must read
`musterHold: sitting` — if it reads `active`, the run was invoked
without the env var; STOP, fix the invocation, re-run the pilot.**
**Panel note (disclosed deviation from §9 pilot economy):** the full
8-seed panel runs even if the pilot shows nothing interesting. The
leg's blocker taxonomy needs 8 seeds, the standing-199 question is
live, the homebody-handoff party-size question needs 8 seeds, the
stand-down fix needs 8 seeds, and the panel costs ~20 min. The pilot's
interestingness gates nothing except the instrument gates above.
**Position-dependence (r278 finding):** the panel runs the 8 seeds in
ascending order in one process, same policy, same driver shape as
r283 (r279 order shape) so the panel stays comparable to r283; do not
reorder seeds or split the panel across configs mid-run.

## Fix scope (pre-registered — the build is not scope creep)

- Driver (`scripts/journey-scale-r288-20261125.js`, cloned from r283):
  seeds 106337–106344, corpus tags r288, EVIDIR 2026-11-24, single arm
  B only. No behavior change from the r283 control (stand-down carried).
- Analyzer (`scripts/analyze-journey-scale-r288-20261125.js`): cloned
  from r283; single-arm (arm B only); PLAYTEST panel verdict carried
  (Q1 rule above, with the r283-observed set). Q2/Q3/Q4/Q5 carried
  verbatim (paths r288) + the stand-down section (muster-hunger events,
  national days held, stand-downs fired, fruitless march days) + the
  departname watch (stranger descriptors in depart beats, bar 0;
  r283: 0/169) + the worngun-reseat descriptive (village gun totals,
  from the driver's end-of-seed gun census).
  The re-arm / CELLGATE watches are NOT in the analyzer: both
  mechanisms are env-gated off on this driver (see r279 prereg
  correction), so the analyzer states the gate state rather than
  counting zeros.
- Proof test (`scripts/test-journey-scale-r288-analyzer-20261125.js`):
  cloned from r283's; panel cases carried (58/70/71 as written).
  **Run BEFORE the panel.**
- **One blank:** this run fills exactly one blank it finds (missing
  content / dead end / unfireable beat / senseless dialogue), with a
  proof test, or documents precisely why it cannot be fixed. No other
  `src/js` change. No lever, no gate change, no tuning.

## Metric review (carried)

- Q1's interesting-bar (≥3/8 national) is set against the r283
  control prior (2/8) and the r279 control prior (0/8): a single flip
  is noise; three is a movement.
- The lived-days control stays **123** (r233's 8-seed mean).
- The standing-199 stall metric is carried from r251: phantomDays5
  (vetbar shadow5 > readiness5 days) is the instrument's own record
  of the hold, read as stall days per seed — PLUS the per-day split
  adopted in r251 (stalled-while-ready = that day's own r5 ≥ 2). The
  stall finding rests on phantomDays5 ONLY, judged on the per-day
  split; the seed-level peak split is invalid as written and is kept
  in the analyzer only for continuity, labeled invalid.
- The vetbar duplicate-day quirk (r247: every seed records some days
  twice; stall total overcounts by ~1 day band-wide) is carried as a
  known instrument quirk; the metric is judged as written.
- Q2 is deliberately gate-free: the taxonomy is the finding.
- The wave-4 fight slide (231 → 168 → 101 → 62 → 82 → 85 → 52 → 47
  → 99 → 76) is the carried watch item: r283 stayed above the 60
  line. If r288 is also <60 WITH no early collapses, the next run
  asks whether spawn/engagement changed.
- Orphaned invitations are counted as invite LINES per raise talk
  (r283: 5 lines / 19 talks; r279: 1 / 15).
- **Stand-down measurement (carried):** the fix is proven on one seed
  (r273: hunger 251→52, national 45→70 days); r276/r279/r283 measured
  it VACUOUS band-wide (0 firings). This panel measures it band-wide
  descriptively again. A national seed losing national to a fruitless
  march on the FIXED driver would be a fix failure, not a QUIET data
  point — judge it in the run note, not by the Q1 bar.
- **Tribute-delivery stall (watch, from r273):** the stall
  starting on the tribute-delivery day (veterans leave, readiness
  drops below the bar) — watch whether tribute delivery
  systematically stalls readiness this band (fired r273 and r279;
  did NOT fire r283 — 0 deliveries).
- **Departname watch:** the analyzer counts stranger descriptors in
  depart beats; the bar is 0 (the staged proof showed 21→0; r283
  held 0/169). A non-zero count is a regression of the fix, not a
  descriptive note.
- **Departteach watch (correction):** the teach is a post-System
  no-op (revealName guard), so no teach count is printed on this
  driver — the analyzer states the gate state. The fix's read is its
  own staged panel + pre-System legs.
- **Position-dependence (from r278):** panels stay comparable only
  with identical seed order/config. This run's seed order is the r283
  order shape (ascending band order, single process, same policy). Any
  mid-run re-run that changes seed position must be recorded as a new
  config, not folded into the panel.
